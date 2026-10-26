
"""
Django settings for config project.
"""

import os
from pathlib import Path
from urllib.parse import urlparse, unquote

from dotenv import load_dotenv


# --------------------------------------------------
# Project paths and environment variables
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# Load backend/.env for local development.
load_dotenv(BASE_DIR / ".env")


def _env_bool(name, default=False):
    """Read an environment variable as a boolean."""
    value = os.environ.get(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name, default=""):
    """Read comma-separated environment values into a list."""
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# --------------------------------------------------
# Security settings
# --------------------------------------------------

# Production must provide DJANGO_SECRET_KEY.
# The fallback is only for local development.
DEBUG = _env_bool("DJANGO_DEBUG", default=False)

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "").strip()

if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-local-development-only-change-this"
    else:
        raise RuntimeError(
            "DJANGO_SECRET_KEY must be configured when DEBUG is False."
        )

ALLOWED_HOSTS = _env_list(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1",
)

# Accept any Host header by default (Render service domains, LAN/mobile
# testing, custom demo hosts). Set DJANGO_ALLOW_ALL_HOSTS=false to restrict
# the backend to DJANGO_ALLOWED_HOSTS only.
if _env_bool("DJANGO_ALLOW_ALL_HOSTS", default=True):
    ALLOWED_HOSTS = ["*"]

# --------------------------------------------------
# CORS and CSRF settings
# --------------------------------------------------

# By default every browser origin may call the API, so the app is never
# blocked by cross-origin checks. Set CORS_ALLOW_ALL_ORIGINS=false to restrict
# callers to the CORS_ALLOWED_ORIGINS list below.
CORS_ALLOW_ALL_ORIGINS = _env_bool("CORS_ALLOW_ALL_ORIGINS", default=True)

CORS_ALLOWED_ORIGINS = _env_list(
    "CORS_ALLOWED_ORIGINS",
    (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5174,"
        "http://localhost:5175,"
        "http://127.0.0.1:5175"
    ),
)

CSRF_TRUSTED_ORIGINS = _env_list("CSRF_TRUSTED_ORIGINS")

# --------------------------------------------------
# Application definition
# --------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "users",
    "farms",
    "recommendations",
    "weather_api",
    "agent",
]

AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# --------------------------------------------------
# Middleware
# --------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --------------------------------------------------
# Database
# --------------------------------------------------

def _database_from_url(url):
    """Convert a PostgreSQL DATABASE_URL into Django settings."""
    parsed = urlparse(url)

    if parsed.scheme not in {"postgres", "postgresql"}:
        raise ValueError(
            "DATABASE_URL must use postgres:// or postgresql://."
        )

    database_name = unquote(parsed.path.lstrip("/"))

    if not database_name or not parsed.hostname:
        raise ValueError("DATABASE_URL is missing database details.")

    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": database_name,
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname,
        "PORT": str(parsed.port or 5432),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {
            "sslmode": os.environ.get("PGSSLMODE", "require"),
        },
    }


DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

if DATABASE_URL:
    DATABASES = {
        "default": _database_from_url(DATABASE_URL),
    }
elif DEBUG:
    # SQLite fallback for local development only.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    raise RuntimeError(
        "DATABASE_URL must be configured in production."
    )

# --------------------------------------------------
# Password validation
# --------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]

# --------------------------------------------------
# Internationalization
# --------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------
# Static files
# --------------------------------------------------

STATIC_URL = "static/"

# --------------------------------------------------
# Email
# --------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# --------------------------------------------------
# URL behavior
# --------------------------------------------------

APPEND_SLASH = False

# --------------------------------------------------
# Default primary key type
# --------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

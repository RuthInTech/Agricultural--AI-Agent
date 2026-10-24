import os
from datetime import datetime
import requests
from dotenv import load_dotenv

load_dotenv()

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# Mapping for hackathon demo site codes to real Ethiopian agricultural zones
SITE_COORDINATES = {
    "SITE-A": {"name": "Site A (Debre Zeit / Bishoftu)", "lat": 8.7523, "lon": 38.9897},
    "SITE-B": {"name": "Site B (Hawassa)", "lat": 7.0621, "lon": 38.4777},
    "SITE-C": {"name": "Site C (Adama / Nazret)", "lat": 8.5414, "lon": 39.2689},
}

WMO_DESCRIPTIONS = {
    0: ("Clear Sky", "☀️"),
    1: ("Mainly Clear", "🌤️"),
    2: ("Partly Cloudy", "⛅"),
    3: ("Overcast", "☁️"),
    45: ("Foggy", "🌫️"),
    48: ("Depositing Rime Fog", "🌫️"),
    51: ("Light Drizzle", "🌦️"),
    53: ("Moderate Drizzle", "🌦️"),
    55: ("Dense Drizzle", "🌧️"),
    61: ("Slight Rain", "🌦️"),
    63: ("Moderate Rain", "🌧️"),
    65: ("Heavy Rain", "🌧️"),
    71: ("Slight Snow", "🌨️"),
    73: ("Moderate Snow", "🌨️"),
    75: ("Heavy Snow", "❄️"),
    80: ("Rain Showers", "🌦️"),
    81: ("Moderate Showers", "🌧️"),
    82: ("Violent Rain Showers", "⛈️"),
    95: ("Thunderstorm", "⛈️"),
    96: ("Thunderstorm with Slight Hail", "⛈️"),
    99: ("Thunderstorm with Heavy Hail", "⛈️"),
}


def describe_weather(code):
    return WMO_DESCRIPTIONS.get(code, ("Partly Cloudy", "⛅"))


def _generate_agri_advice(temp, humidity, rain_chance, condition):
    """Generate practical, evidence-based agricultural guidance based on weather telemetry."""
    if rain_chance >= 60 or "rain" in condition.lower() or "drizzle" in condition.lower() or "storm" in condition.lower():
        return {
            "title": "Wet Weather Advisory",
            "alert": "⚠️ Significant rainfall or high precipitation probability detected.",
            "recommendation": "Delay nitrogen fertilizer top-dressing and chemical spray applications to prevent runoff and leaching. Inspect low-lying field plots for proper drainage.",
        }
    elif temp >= 28 and humidity < 40:
        return {
            "title": "Heat & Moisture Stress Warning",
            "alert": "⚠️ Elevated temperatures with low atmospheric moisture.",
            "recommendation": "Monitor crops for leaf-rolling. Prioritize supplementary irrigation during early morning or late afternoon to minimize evaporative loss.",
        }
    elif humidity >= 85:
        return {
            "title": "Fungal & Humidity Alert",
            "alert": "⚠️ Sustained high humidity may promote foliar pathogen development.",
            "recommendation": "Scout lower canopy leaves for foliar blight or leaf spot symptoms. Ensure adequate row aeration.",
        }
    else:
        return {
            "title": "Favorable Field Conditions",
            "alert": "✅ Weather conditions are stable and favorable.",
            "recommendation": "Optimal window for routine field scouting, pest inspections in the whorl, and planned agronomic operations.",
        }


def get_weather(location="Addis Ababa"):
    """Retrieve real-time weather and 7-day forecast from live weather service.

    Uses Open-Meteo (open-source, free-tier, keyless) with geocoding fallback,
    or OpenWeatherMap when a verified key is provided in weather_app.
    """
    clean_location = (location or "Addis Ababa").strip()

    lat = None
    lon = None
    display_name = clean_location
    country = "Ethiopia"

    # 1. Check if location is one of our designated demo site codes
    if clean_location.upper() in SITE_COORDINATES:
        site_info = SITE_COORDINATES[clean_location.upper()]
        lat = site_info["lat"]
        lon = site_info["lon"]
        display_name = site_info["name"]
    else:
        # Geocode city or region name using Open-Meteo Geocoding
        try:
            geo_resp = requests.get(
                GEOCODING_URL,
                params={"name": clean_location, "count": 1, "language": "en", "format": "json"},
                timeout=6,
            )
            if geo_resp.status_code == 200:
                geo_data = geo_resp.json()
                results = geo_data.get("results") or []
                if results:
                    lat = results[0].get("latitude")
                    lon = results[0].get("longitude")
                    display_name = f"{results[0].get('name', clean_location)}, {results[0].get('country', 'Ethiopia')}"
                    country = results[0].get("country", "Ethiopia")
        except Exception:
            pass

    # Fallback coordinates if geocoding fails: default to Addis Ababa, Ethiopia
    if lat is None or lon is None:
        lat = 9.025
        lon = 38.747
        display_name = clean_location or "Addis Ababa, Ethiopia"

    # 2. Fetch live weather & forecast from Open-Meteo
    try:
        weather_resp = requests.get(
            FORECAST_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                "timezone": "auto",
            },
            timeout=8,
        )
        if weather_resp.status_code != 200:
            return None

        data = weather_resp.json()
        current_data = data.get("current", {})
        daily_data = data.get("daily", {})

        current_code = current_data.get("weather_code", 0)
        condition_text, icon_emoji = describe_weather(current_code)
        temp_val = current_data.get("temperature_2m", 22.0)
        humidity_val = current_data.get("relative_humidity_2m", 60)
        wind_val = current_data.get("wind_speed_10m", 5.0)

        daily_probs = daily_data.get("precipitation_probability_max", [50])
        current_rain_prob = daily_probs[0] if daily_probs else 50

        # Build 7-day forecast array
        dates = daily_data.get("time", [])
        codes = daily_data.get("weather_code", [])
        max_temps = daily_data.get("temperature_2m_max", [])
        min_temps = daily_data.get("temperature_2m_min", [])
        rain_chances = daily_data.get("precipitation_probability_max", [])

        forecast_list = []
        for i, dt_str in enumerate(dates[:7]):
            try:
                dt_obj = datetime.strptime(dt_str, "%Y-%m-%d")
                day_name = dt_obj.strftime("%a")
                date_label = dt_obj.strftime("%b %d")
            except Exception:
                day_name = f"Day {i+1}"
                date_label = dt_str

            f_code = codes[i] if i < len(codes) else 0
            f_cond, f_icon = describe_weather(f_code)
            f_max = round(max_temps[i]) if i < len(max_temps) and max_temps[i] is not None else 24
            f_min = round(min_temps[i]) if i < len(min_temps) and min_temps[i] is not None else 12
            f_rain = rain_chances[i] if i < len(rain_chances) and rain_chances[i] is not None else 10

            forecast_list.append({
                "id": f"f{i+1}",
                "day": day_name,
                "date": date_label,
                "condition": f_cond,
                "icon": f_icon,
                "temp_high": f"{f_max}°C",
                "tempHigh": f"{f_max}°C",
                "temp_low": f"{f_min}°C",
                "tempLow": f"{f_min}°C",
                "rain_chance": f"{f_rain}%",
                "rainChance": f"{f_rain}%",
            })

        advice = _generate_agri_advice(temp_val, humidity_val, current_rain_prob, condition_text)

        return {
            "location": display_name,
            "country": country,
            "coordinates": {"latitude": lat, "longitude": lon},
            "current": {
                "temperature": f"{round(temp_val)}°C",
                "temp": temp_val,
                "condition": condition_text,
                "icon": icon_emoji,
                "humidity": f"{humidity_val}%",
                "wind_speed": f"{wind_val} km/h",
                "windSpeed": f"{wind_val} km/h",
                "rain_probability": f"{current_rain_prob}%",
                "rainProbability": f"{current_rain_prob}%",
                "updated_at": datetime.now().strftime("%I:%M %p"),
            },
            "advice": advice,
            "forecast": forecast_list,
        }

    except Exception:
        return None

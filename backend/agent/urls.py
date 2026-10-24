from django.urls import path

from .views import (
    AdvisoryConfirmView,
    AdvisoryDetailView,
    AdvisoryListView,
    AdvisoryPreviewView,
    CaseListView,
    GuidanceSearchView,
    LocationListView,
)

app_name = "agent"

urlpatterns = [
    path("locations/", LocationListView.as_view(), name="locations"),
    path("cases/", CaseListView.as_view(), name="cases"),
    path("guidance/search/", GuidanceSearchView.as_view(), name="guidance-search"),
    path("advisories/preview/", AdvisoryPreviewView.as_view(), name="advisory-preview"),
    path("advisories/confirm/", AdvisoryConfirmView.as_view(), name="advisory-confirm"),
    path("advisories/", AdvisoryListView.as_view(), name="advisory-list"),
    path("advisories/<int:pk>/", AdvisoryDetailView.as_view(), name="advisory-detail"),
]

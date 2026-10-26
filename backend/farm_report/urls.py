
from django.urls import path
from .views import FarmerReportCreateView

urlpatterns = [
    path(
        "",
        FarmerReportCreateView.as_view(),
        name="farmer-report-create",
    ),
]

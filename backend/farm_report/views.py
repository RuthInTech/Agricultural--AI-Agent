
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import FarmerReport
from .serializers import FarmerReportSerializer


class FarmerReportCreateView(generics.CreateAPIView):
    queryset = FarmerReport.objects.all()
    serializer_class = FarmerReportSerializer
    permission_classes = [AllowAny]


# Create your views here.

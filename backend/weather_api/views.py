from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import get_weather


class WeatherView(APIView):
    """GET /api/weather/?location=Addis%20Ababa — Live weather and agricultural forecast."""

    permission_classes = [AllowAny]

    def get(self, request):
        location = request.query_params.get("location", "Addis Ababa")
        data = get_weather(location=location)
        if not data:
            return Response(
                {"detail": f"Weather data currently unavailable for location '{location}'."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(data)

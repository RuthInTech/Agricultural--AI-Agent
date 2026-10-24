from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from weather_api.services import get_weather, describe_weather, _generate_agri_advice


class WeatherServiceTests(TestCase):
    def test_wmo_code_description(self):
        cond, icon = describe_weather(0)
        self.assertEqual(cond, "Clear Sky")
        self.assertEqual(icon, "☀️")

        cond, icon = describe_weather(61)
        self.assertEqual(cond, "Slight Rain")

    def test_agri_advice_generation(self):
        advice = _generate_agri_advice(temp=22, humidity=65, rain_chance=80, condition="Rain")
        self.assertEqual(advice["title"], "Wet Weather Advisory")
        self.assertIn("Delay nitrogen fertilizer", advice["recommendation"])

        advice_heat = _generate_agri_advice(temp=32, humidity=30, rain_chance=10, condition="Sunny")
        self.assertEqual(advice_heat["title"], "Heat & Moisture Stress Warning")

    def test_get_weather_live_or_fallback(self):
        data = get_weather(location="SITE-A")
        self.assertIsNotNone(data)
        self.assertIn("Site A", data["location"])
        self.assertIn("current", data)
        self.assertIn("temperature", data["current"])
        self.assertIn("forecast", data)
        self.assertGreaterEqual(len(data["forecast"]), 1)


class WeatherApiViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_weather_endpoint_success(self):
        response = self.client.get("/api/weather/?location=Addis%20Ababa")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("location", data)
        self.assertIn("current", data)
        self.assertIn("advice", data)
        self.assertIn("forecast", data)

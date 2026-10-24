import requests
from datetime import date

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search" #for getting the coordinates
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

def describe_weather(code):
    descriptions = {
      0: ("Clearly Sky", "☀️"),
      1: ("Mainly Clear", "🌤️"),
      2: ("Partly Cloud", "⛅"),
      3: ("Overcast", "☁️"),
      61: ("Light rain", "🌦️"),
      63: ("rain", "🌧️"),
      64: ("Heavy Rain", "🌧️"),
      45: ("Foggy", "🌫️"),
      48: ("Foggy", "🌫️"),
      51: ("Light drizzle", "🌦️"),
      53: ("Drizzle", "🌦️"),
      55: ("Heavy drizzle", "🌧️"),
      71: ("Light snow", "🌨️"),
      73: ("Snow", "🌨️"),
      75: ("Heavy snow", "❄️"),
      80: ("Rain showers", "🌦️"),
      81: ("Rain showers", "🌧️"),
      82: ("Heavy rain showers", "⛈️"),
      95: ("Thunderstorm", "⛈️"),
      96: ("Thunderstorm with hail", "⛈️"),
      99: ("Thunderstorm with hail", "⛈️"),
}
    return descriptions.get(code, ("Unknown Weather", ("🌡️")))

def get_weather(location= "Addis Ababa"):
    pass

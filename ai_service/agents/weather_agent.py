import json
import os
import httpx
from datetime import datetime, timedelta
from tools.langchain_tools import fetch_weather_coordinates


class WeatherAgent:
    """
    Weather Agent: Fetches real forecasts from Open-Meteo API.
    Collaborates with Itinerary, Budget, and Safety agents.
    """

    OPENMETEO_URL = "https://api.open-meteo.com/v1/forecast"

    def _get_condition(self, wmo_code: int) -> str:
        if wmo_code == 0:
            return "Clear Sky"
        elif wmo_code in [1, 2, 3]:
            return "Partly Cloudy"
        elif wmo_code in [45, 48]:
            return "Foggy"
        elif wmo_code in [51, 53, 55, 61, 63, 65]:
            return "Rainy"
        elif wmo_code in [71, 73, 75, 77]:
            return "Snowy"
        elif wmo_code in [80, 81, 82]:
            return "Rain Showers"
        elif wmo_code in [95, 96, 99]:
            return "Thunderstorm"
        return "Mixed"

    def _get_packing_list(self, avg_temp: float, condition: str) -> list:
        packing = []
        if avg_temp > 30:
            packing += ["Light cotton clothes", "Sunscreen SPF 50+", "Sunglasses", "Hat/Cap"]
        elif avg_temp > 20:
            packing += ["Light layers", "Comfortable walking shoes", "Light jacket for evenings"]
        else:
            packing += ["Warm jacket", "Thermal wear", "Woolen socks", "Gloves & scarf"]
        
        if "Rain" in condition or "Shower" in condition or "Thunder" in condition:
            packing += ["Waterproof jacket/raincoat", "Compact umbrella", "Waterproof bag cover"]
        
        packing += ["Power bank", "Travel adapter", "Basic first aid kit"]
        return packing

    def _get_advice(self, avg_temp: float, avg_rain: float, condition: str) -> str:
        parts = []
        if avg_rain > 50:
            parts.append("High rain probability — plan indoor activities for afternoons and carry an umbrella.")
        elif avg_rain > 20:
            parts.append("Moderate chance of rain — keep a light raincoat handy.")
        
        if avg_temp > 35:
            parts.append("Very hot weather — avoid outdoor activities between 12-4 PM. Stay hydrated.")
        elif avg_temp > 28:
            parts.append("Warm and pleasant — ideal for sightseeing in the morning and evening.")
        elif avg_temp < 10:
            parts.append("Cold weather — pack heavy woolens and check mountain pass accessibility.")
        
        if not parts:
            parts.append(f"Pleasant {condition.lower()} conditions expected. Great time to explore!")
        
        return " ".join(parts)

    async def run(self, ctx: dict) -> dict:
        destination = ctx["destination"]
        duration = ctx.get("duration", 5)

        # Get coordinates using LangChain tool
        coord_result = fetch_weather_coordinates.invoke({"city": destination})
        coords = json.loads(coord_result)
        lat, lon = coords["lat"], coords["lon"]

        # Fetch from Open-Meteo
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(self.OPENMETEO_URL, params={
                    "latitude": lat,
                    "longitude": lon,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode",
                    "timezone": "Asia/Kolkata",
                    "forecast_days": min(duration + 2, 16),
                })
                data = resp.json()

            daily = data.get("daily", {})
            dates = daily.get("time", [])
            temp_max = daily.get("temperature_2m_max", [])
            temp_min = daily.get("temperature_2m_min", [])
            rain_prob = daily.get("precipitation_probability_mean", [])
            wcodes = daily.get("weathercode", [])

            forecast = []
            for i in range(min(len(dates), duration)):
                forecast.append({
                    "date": dates[i],
                    "temp_max": temp_max[i] if i < len(temp_max) else None,
                    "temp_min": temp_min[i] if i < len(temp_min) else None,
                    "rain_prob": rain_prob[i] if i < len(rain_prob) else 0,
                    "condition": self._get_condition(wcodes[i] if i < len(wcodes) else 0),
                })

            avg_temp = sum((f["temp_max"] or 25) for f in forecast) / max(len(forecast), 1)
            avg_rain = sum((f["rain_prob"] or 0) for f in forecast) / max(len(forecast), 1)
            dominant_condition = self._get_condition(wcodes[0] if wcodes else 0)

            return {
                "destination": destination,
                "avgTemp": round(avg_temp, 1),
                "avgRain": round(avg_rain, 1),
                "condition": dominant_condition,
                "forecast": forecast,
                "packing": self._get_packing_list(avg_temp, dominant_condition),
                "advice": self._get_advice(avg_temp, avg_rain, dominant_condition),
                "source": "Open-Meteo API",
            }

        except Exception as e:
            # Graceful fallback
            return {
                "destination": destination,
                "avgTemp": 28,
                "avgRain": 20,
                "condition": "Partly Cloudy",
                "forecast": [],
                "packing": ["Light clothes", "Sunscreen", "Comfortable shoes", "Umbrella"],
                "advice": "Weather data temporarily unavailable. Pack for mixed conditions.",
                "error": str(e),
            }

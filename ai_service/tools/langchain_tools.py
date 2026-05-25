"""
LangChain Tools used by Travel Agents.
These wrap external APIs and calculations into reusable tool functions.
"""
import httpx
import json
import math
from langchain.tools import tool
from typing import Optional


@tool
def calculate_budget(total_budget: float, duration: int, group_size: int) -> str:
    """Calculate per-day and per-person budget breakdown."""
    per_day = total_budget / max(duration, 1)
    per_person = total_budget / max(group_size, 1)
    per_person_per_day = per_day / max(group_size, 1)
    
    # Standard allocation percentages
    breakdown = {
        "Transport": round(total_budget * 0.25),
        "Accommodation": round(total_budget * 0.30),
        "Food": round(total_budget * 0.20),
        "Activities": round(total_budget * 0.12),
        "Shopping": round(total_budget * 0.08),
        "Emergency": round(total_budget * 0.05),
    }
    
    return json.dumps({
        "per_day": round(per_day),
        "per_person": round(per_person),
        "per_person_per_day": round(per_person_per_day),
        "breakdown": breakdown,
        "total": total_budget,
    })


@tool
def fetch_weather_coordinates(city: str) -> str:
    """Get approximate coordinates for a city (used for Open-Meteo API)."""
    # Common Indian cities coordinates
    CITY_COORDS = {
        "goa": (15.2993, 74.1240), "mumbai": (19.0760, 72.8777),
        "delhi": (28.7041, 77.1025), "bangalore": (12.9716, 77.5946),
        "chennai": (13.0827, 80.2707), "kolkata": (22.5726, 88.3639),
        "hyderabad": (17.3850, 78.4867), "pune": (18.5204, 73.8567),
        "jaipur": (26.9124, 75.7873), "agra": (27.1767, 78.0081),
        "kerala": (10.8505, 76.2711), "manali": (32.2396, 77.1887),
        "shimla": (31.1048, 77.1734), "darjeeling": (27.0410, 88.2663),
        "ooty": (11.4102, 76.6950), "udaipur": (24.5854, 73.7125),
        "varanasi": (25.3176, 82.9739), "amritsar": (31.6340, 74.8723),
        "mysore": (12.2958, 76.6394), "rishikesh": (30.0869, 78.2676),
        "dubai": (25.2048, 55.2708), "singapore": (1.3521, 103.8198),
        "bangkok": (13.7563, 100.5018), "london": (51.5074, -0.1278),
        "paris": (48.8566, 2.3522), "new york": (40.7128, -74.0060),
        "tokyo": (35.6762, 139.6503), "bali": (-8.3405, 115.0920),
    }
    city_lower = city.lower().strip()
    for key, coords in CITY_COORDS.items():
        if key in city_lower or city_lower in key:
            return json.dumps({"lat": coords[0], "lon": coords[1], "city": city})
    # Default fallback
    return json.dumps({"lat": 20.5937, "lon": 78.9629, "city": city, "fallback": True})


@tool
def compare_transport_options(source: str, destination: str, budget: float) -> str:
    """Compare and recommend transport options between two cities."""
    # Simulate transport data based on common routes
    options = []
    
    # Determine approximate distance (simplified)
    domestic = not any(city in source.lower() + destination.lower() 
                      for city in ["dubai", "singapore", "london", "paris", "new york", "tokyo", "bangkok"])
    
    if domestic:
        options = [
            {
                "type": "flight",
                "name": "IndiGo / Air India",
                "duration": "1-2 hrs",
                "cost": round(min(budget * 0.35, 8000)),
                "recommended": budget > 20000,
                "availability": "High"
            },
            {
                "type": "train",
                "name": "Indian Railways (Express)",
                "duration": "6-14 hrs",
                "cost": round(min(budget * 0.08, 2000)),
                "recommended": budget <= 20000,
                "availability": "High"
            },
            {
                "type": "bus",
                "name": "Luxury Volvo Bus",
                "duration": "8-16 hrs",
                "cost": round(min(budget * 0.04, 1200)),
                "recommended": False,
                "availability": "High"
            }
        ]
        
        if budget <= 15000:
            options[1]["recommended"] = True
            options[0]["recommended"] = False
            recommendation = "On your budget, Indian Railways Express is the best option — comfortable, affordable, and reliable."
        else:
            recommendation = "With your budget, a flight is recommended for comfort and time savings. Book 2-3 weeks in advance for best rates."
    else:
        options = [
            {
                "type": "flight",
                "name": "International Flight",
                "duration": "3-12 hrs",
                "cost": round(min(budget * 0.45, 35000)),
                "recommended": True,
                "availability": "High"
            }
        ]
        recommendation = "International travel requires a flight. Book early via Google Flights or Skyscanner for the best deals."
    
    return json.dumps({"options": options, "recommendation": recommendation})


@tool
def get_safety_info(destination: str, travel_type: str) -> str:
    """Get safety tips and precautions for a destination."""
    general_tips = [
        "Keep digital and physical copies of all travel documents",
        "Share your itinerary with a trusted contact",
        "Use only licensed taxis or verified ride-sharing apps",
        "Avoid displaying expensive jewelry or electronics",
        "Stay aware of your surroundings in crowded tourist spots",
        "Carry a basic first-aid kit and any prescription medications",
        "Use ATMs inside banks or shopping malls only",
    ]
    
    solo_tips = [
        "Stay in well-reviewed hostels or hotels with 24/7 reception",
        "Trust your instincts — leave situations that feel unsafe",
        "Keep family informed with daily check-ins",
    ] if travel_type == "solo" else []
    
    common_scams = [
        "Overpriced 'tourist' auto-rickshaw or taxi fares — always use meters or apps",
        "Fake tour guides at popular monuments — use licensed guides only",
        "Street currency exchange scams — use official exchange counters",
        "Gem or jewelry investment schemes targeting tourists",
    ]
    
    return json.dumps({
        "precautions": general_tips + solo_tips,
        "scam_warnings": common_scams,
        "emergency_contacts": "Police: 100 | Ambulance: 108 | Tourist Helpline: 1800-111-363"
    })

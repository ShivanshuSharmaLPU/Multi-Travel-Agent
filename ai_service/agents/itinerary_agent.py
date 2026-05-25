import json
import os
from groq import AsyncGroq


class ItineraryAgent:
    """
    Itinerary Agent: Creates weather-aware day-wise travel plans.
    Collaborates with weather agent data for activity suggestions.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    def _generate_fallback(self, ctx: dict, weather=None) -> dict:
        destination = ctx["destination"]
        duration = ctx["duration"]
        days = []

        themes = [
            "Arrival & City Orientation",
            "Cultural Heritage & Monuments",
            "Nature & Outdoor Adventure",
            "Local Markets & Food Trail",
            "Art, Museums & Hidden Gems",
            "Day Trip & Surrounding Areas",
            "Shopping & Leisure",
            "Wellness & Relaxation",
            "Photography & Scenic Spots",
            "Farewell & Departure",
        ]

        # Unique activity sets per day
        daily_plans = [
            [
                {"time": "2:00 PM",  "activity": "Check-in & freshen up",        "description": f"Settle into your hotel in {destination}"},
                {"time": "4:00 PM",  "activity": "Neighbourhood walk",            "description": f"Get a feel of {destination}'s streets and local vibe"},
                {"time": "6:30 PM",  "activity": "Sunset stroll",                 "description": "Find a viewpoint or waterfront to watch the sunset"},
                {"time": "8:00 PM",  "activity": "Welcome dinner",                "description": "Try a local specialty restaurant recommended by locals"},
            ],
            [
                {"time": "8:00 AM",  "activity": "Breakfast at local cafe",       "description": "Start with a traditional breakfast dish"},
                {"time": "10:00 AM", "activity": "Major heritage site visit",      "description": f"Explore the most iconic historical monument in {destination}"},
                {"time": "1:00 PM",  "activity": "Lunch at heritage area",         "description": "Dine near the monument at a heritage-style restaurant"},
                {"time": "3:00 PM",  "activity": "Museum visit",                   "description": "Dive into local history and culture"},
                {"time": "5:30 PM",  "activity": "Evening market browse",          "description": "Explore stalls selling handicrafts and street food"},
                {"time": "8:00 PM",  "activity": "Rooftop dinner",                 "description": "Enjoy city views while dining"},
            ],
            [
                {"time": "6:30 AM",  "activity": "Early morning nature walk",     "description": f"Parks, riverside, or hill trails near {destination}"},
                {"time": "9:00 AM",  "activity": "Breakfast picnic",               "description": "Pack local snacks and eat outdoors"},
                {"time": "11:00 AM", "activity": "Adventure activity",             "description": "Hiking, cycling, boat ride, or nature reserve visit"},
                {"time": "1:30 PM",  "activity": "Packed lunch / local dhaba",    "description": "Eat at a roadside local eatery"},
                {"time": "4:00 PM",  "activity": "Scenic viewpoint",               "description": "Best panoramic spot in the area"},
                {"time": "7:30 PM",  "activity": "Dinner & rest",                  "description": "Relax with a hearty local meal"},
            ],
            [
                {"time": "8:00 AM",  "activity": "Local breakfast",               "description": "Street-side breakfast — poha, idli, or paratha depending on region"},
                {"time": "9:30 AM",  "activity": "Spice / produce market",         "description": f"Visit the main bazaar of {destination}"},
                {"time": "12:00 PM", "activity": "Street food tour",               "description": "Sample 4-5 local street food items with a guide or self-guided"},
                {"time": "2:30 PM",  "activity": "Afternoon rest / shopping",      "description": "Pick up souvenirs and local handicrafts"},
                {"time": "5:00 PM",  "activity": "Chai at a local tea stall",      "description": "Join locals for evening chai and snacks"},
                {"time": "8:00 PM",  "activity": "Dinner at a popular local spot", "description": "Try the city's most-loved dinner dish"},
            ],
            [
                {"time": "9:00 AM",  "activity": "Art gallery / contemporary museum", "description": "Explore modern or folk art of the region"},
                {"time": "11:30 AM", "activity": "Hidden gem neighbourhood",           "description": f"Explore a lesser-known quarter of {destination}"},
                {"time": "1:30 PM",  "activity": "Lunch at a hidden gem cafe",         "description": "Off-the-tourist-trail dining experience"},
                {"time": "3:30 PM",  "activity": "Temple / religious site",            "description": "Visit a spiritually significant local site"},
                {"time": "6:00 PM",  "activity": "Rooftop sundowner",                  "description": "Cocktails or mocktails with a view"},
                {"time": "8:30 PM",  "activity": "Dinner & night walk",                "description": "Explore the nighttime energy of the city"},
            ],
            [
                {"time": "7:00 AM",  "activity": "Early departure for day trip",  "description": "Head to a nearby town, village or natural attraction"},
                {"time": "10:00 AM", "activity": "Day trip exploration",           "description": "Explore the destination's surroundings"},
                {"time": "1:00 PM",  "activity": "Lunch at day trip location",    "description": "Local food at the excursion destination"},
                {"time": "4:00 PM",  "activity": "Return journey",                "description": "Head back with some snacks for the road"},
                {"time": "7:00 PM",  "activity": "Rest & light dinner",           "description": "Wind down after a full day out"},
            ],
            [
                {"time": "10:00 AM", "activity": "Leisure morning",               "description": "Sleep in, enjoy a long breakfast, browse a bookshop"},
                {"time": "12:00 PM", "activity": "Shopping district",              "description": "Visit the main shopping street or mall"},
                {"time": "2:30 PM",  "activity": "Dessert & sweets trail",         "description": "Try local sweets, ice cream, and desserts"},
                {"time": "5:00 PM",  "activity": "Spa or foot massage",            "description": "Pamper yourself after days of walking"},
                {"time": "8:00 PM",  "activity": "Special dinner",                 "description": "Treat yourself to the best restaurant in town"},
            ],
            [
                {"time": "7:00 AM",  "activity": "Yoga or morning meditation",    "description": "Find a local yoga class or meditate at a peaceful spot"},
                {"time": "9:30 AM",  "activity": "Healthy brunch",                "description": "Juice bar or health cafe visit"},
                {"time": "11:00 AM", "activity": "Cooking class",                 "description": "Learn to cook 2-3 local dishes"},
                {"time": "2:00 PM",  "activity": "Slow afternoon",                "description": "Read, journal, or relax in a garden or cafe"},
                {"time": "6:00 PM",  "activity": "Sunset at a calm spot",         "description": "Park, riverside, or terrace"},
                {"time": "8:00 PM",  "activity": "Home-cooked / self-cooked meal","description": "Use the ingredients from your cooking class"},
            ],
            [
                {"time": "6:00 AM",  "activity": "Golden hour photography",       "description": f"Capture {destination} at its most beautiful light"},
                {"time": "9:00 AM",  "activity": "Breakfast & photo review",      "description": "Review your shots over coffee"},
                {"time": "11:00 AM", "activity": "Iconic photo spots",            "description": "Hit the must-photograph locations"},
                {"time": "2:00 PM",  "activity": "Lunch with a view",             "description": "Dine somewhere scenic for great photos"},
                {"time": "4:00 PM",  "activity": "Street photography",            "description": "Candid shots of local life and architecture"},
                {"time": "7:30 PM",  "activity": "Night photography & dinner",    "description": "Capture the city lights and end with a great meal"},
            ],
            [
                {"time": "8:00 AM",  "activity": "Last local breakfast",          "description": "Savour one final local breakfast"},
                {"time": "9:30 AM",  "activity": "Final souvenir shopping",       "description": "Pick up any last gifts and mementos"},
                {"time": "11:00 AM", "activity": "Revisit favourite spot",         "description": f"One last look at your favourite place in {destination}"},
                {"time": "1:00 PM",  "activity": "Farewell lunch",                "description": "Lunch at the best place you discovered"},
                {"time": "3:00 PM",  "activity": "Head to station/airport",       "description": "Check out and travel to your departure point"},
            ],
        ]

        for i in range(duration):
            plan_idx = i % len(daily_plans)
            days.append({
                "theme": themes[i % len(themes)],
                "activities": daily_plans[plan_idx],
            })

        return {"days": days}

    async def run(self, ctx: dict, results: dict = {}) -> dict:
        destination = ctx["destination"]
        duration = ctx["duration"]
        travel_type = ctx.get("travel_type", "solo")
        budget = ctx["budget"]
        weather = results.get("weather", {})

        if not self.client:
            return self._generate_fallback(ctx, weather)

        weather_note = f"Weather: {weather.get('condition', 'Pleasant')}, avg {weather.get('avgTemp', 28)}°C"
        rain_note = ""
        if weather.get("avgRain", 0) > 40:
            rain_note = "High rain probability — include indoor backup activities."

        try:
            prompt = f"""You are an expert travel itinerary planner. Create a {duration}-day itinerary for {destination}.

Trip details:
- Travel type: {travel_type}
- Budget: Rs.{budget:,}
- {weather_note}
- {rain_note}

IMPORTANT RULES:
1. Use REAL, SPECIFIC place names that actually exist in {destination} (monuments, restaurants, parks, markets, temples etc.)
2. Every activity must have a "place" field with the actual name of the location to visit.
3. Each day should have 5-6 activities with specific timings.

Return ONLY valid JSON (no extra text):
{{
  "days": [
    {{
      "theme": "Day theme title",
      "activities": [
        {{"time": "8:00 AM", "activity": "Morning walk", "place": "Actual Park or Street Name", "description": "Brief 1-sentence description"}},
        {{"time": "10:00 AM", "activity": "Sightseeing", "place": "Actual Monument or Attraction Name", "description": "Brief description"}},
        {{"time": "1:00 PM", "activity": "Lunch", "place": "Actual Restaurant or Market Name", "description": "What to eat here"}},
        {{"time": "3:00 PM", "activity": "Cultural visit", "place": "Actual Temple, Museum or Site Name", "description": "Brief description"}},
        {{"time": "6:00 PM", "activity": "Evening stroll", "place": "Actual Area or Viewpoint Name", "description": "Brief description"}},
        {{"time": "8:00 PM", "activity": "Dinner", "place": "Actual Restaurant or Food Street Name", "description": "Dining recommendation"}}
      ]
    }}
  ]
}}

Generate exactly {duration} day objects. Every "place" must be a real named location in or near {destination}."""

            resp = await self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.6,
            )
            text = resp.choices[0].message.content.strip()
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception as e:
            pass

        return self._generate_fallback(ctx, weather)
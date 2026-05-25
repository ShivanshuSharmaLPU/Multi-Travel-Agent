import json
import os
from groq import AsyncGroq


CITY_LANDMARKS = {
    "mumbai": {
        "heritage": ["Gateway of India", "Chhatrapati Shivaji Maharaj Terminus", "Elephanta Caves"],
        "museums": ["Chhatrapati Shivaji Maharaj Vastu Sangrahalaya", "Dr. Bhau Daji Lad Museum"],
        "nature": ["Sanjay Gandhi National Park", "Malabar Hill", "Powai Lake"],
        "markets": ["Crawford Market", "Colaba Causeway", "Linking Road, Bandra"],
        "food": ["Bademiya, Colaba", "Sardar Pav Bhaji, Tardeo", "Mahesh Lunch Home"],
        "viewpoints": ["Marine Drive", "Worli Sea Face", "Bandstand Promenade"],
        "temples": ["Siddhivinayak Temple", "Mahalaxmi Temple", "Haji Ali Dargah"],
        "cafes": ["Cafe Mondegar, Colaba", "Kala Ghoda Cafe", "The Pantry"],
        "parks": ["Hanging Gardens", "Kamala Nehru Park", "Shivaji Park"],
        "nightlife": ["Lower Parel", "Bandra West", "Juhu Beach"],
    },
    "delhi": {
        "heritage": ["Red Fort", "Qutub Minar", "Humayun's Tomb", "India Gate"],
        "museums": ["National Museum", "National Gallery of Modern Art", "Crafts Museum"],
        "nature": ["Lodhi Garden", "Deer Park, Hauz Khas", "Sanjay Van"],
        "markets": ["Chandni Chowk", "Lajpat Nagar Market", "Dilli Haat"],
        "food": ["Paranthe Wali Gali, Chandni Chowk", "Karim's, Jama Masjid", "Khan Chacha, Khan Market"],
        "viewpoints": ["Agrasen ki Baoli", "Hauz Khas Village", "Lotus Temple"],
        "temples": ["Akshardham Temple", "ISKCON Temple", "Birla Mandir"],
        "cafes": ["The Big Chill, Khan Market", "Cafe Lota, Pragati Maidan", "Rose Cafe, Saket"],
        "parks": ["Lodhi Garden", "Nehru Park", "Sunder Nursery"],
        "nightlife": ["Hauz Khas Village", "Connaught Place", "Cyber Hub, Gurgaon"],
    },
    "goa": {
        "heritage": ["Basilica of Bom Jesus", "Se Cathedral", "Chapora Fort"],
        "museums": ["Goa State Museum", "Houses of Goa Museum", "Naval Aviation Museum"],
        "nature": ["Dudhsagar Falls", "Bhagwan Mahavir Wildlife Sanctuary", "Netravali Waterfall"],
        "markets": ["Anjuna Flea Market", "Mapusa Market", "Saturday Night Market, Arpora"],
        "food": ["Ritz Classic, Panaji", "Vinayak Family Restaurant", "Martin's Corner, Betalbatim"],
        "viewpoints": ["Chapora Fort viewpoint", "Cabo de Rama", "Vagator Beach"],
        "temples": ["Shri Mangueshi Temple", "Shanta Durga Temple", "Mahalsa Narayani Temple"],
        "cafes": ["Artjuna Cafe, Anjuna", "Bean Me Up, Vagator", "Infantaria, Calangute"],
        "parks": ["Dr. Salim Ali Bird Sanctuary", "Bondla Wildlife Sanctuary"],
        "nightlife": ["Tito's Lane, Baga", "Curlies, Anjuna", "LPK Waterfront, Nerul"],
    },
    "jaipur": {
        "heritage": ["Amber Fort", "City Palace", "Hawa Mahal", "Nahargarh Fort"],
        "museums": ["Albert Hall Museum", "City Palace Museum", "Anokhi Museum"],
        "nature": ["Nahargarh Biological Park", "Sisodia Rani Garden", "Jal Mahal"],
        "markets": ["Johari Bazaar", "Bapu Bazaar", "Tripolia Bazaar"],
        "food": ["Laxmi Misthan Bhandar (LMB)", "Rawat Misthan Bhandar", "Chokhi Dhani"],
        "viewpoints": ["Nahargarh Fort viewpoint", "Tiger Fort", "Jaigarh Fort"],
        "temples": ["Birla Mandir", "Govind Dev Ji Temple", "Galtaji Temple"],
        "cafes": ["Cafe Samsara, Amber Fort Road", "Peacock Rooftop Restaurant", "Bar Palladio"],
        "parks": ["Amer Garden", "Ram Niwas Garden", "Kanak Vrindavan Garden"],
        "nightlife": ["MI Road", "C-Scheme", "Bapu Nagar"],
    },
    "bangalore": {
        "heritage": ["Bangalore Palace", "Tipu Sultan's Summer Palace", "Lalbagh Rock"],
        "museums": ["Visvesvaraya Industrial & Technological Museum", "Government Museum", "HAL Aerospace Museum"],
        "nature": ["Lalbagh Botanical Garden", "Cubbon Park", "Bannerghatta National Park"],
        "markets": ["KR Market (City Market)", "Commercial Street", "Chickpet Market"],
        "food": ["MTR, Lalbagh Road", "Vidyarthi Bhavan, Gandhi Bazaar", "Koshy's, St Mark's Road"],
        "viewpoints": ["Nandi Hills", "Shivagange Hill", "Lalbagh Glass House"],
        "temples": ["ISKCON Temple", "Dodda Ganesha Temple", "Bull Temple"],
        "cafes": ["Cafe Coffee Day, Brigade Road", "Hole in the Wall Cafe", "Matteo Coffea"],
        "parks": ["Cubbon Park", "Lalbagh", "Hesaraghatta Lake"],
        "nightlife": ["Indiranagar 100 Feet Road", "Koramangala", "MG Road"],
    },
    "kolkata": {
        "heritage": ["Victoria Memorial", "Howrah Bridge", "St Paul's Cathedral"],
        "museums": ["Indian Museum", "Victoria Memorial Museum", "Netaji Bhavan"],
        "nature": ["Botanical Garden, Shibpur", "Eco Park, New Town", "Rabindra Sarobar"],
        "markets": ["New Market (Hogg Market)", "Gariahat Market", "Burrabazar"],
        "food": ["Peter Cat, Park Street", "Kewpie's Kitchen", "Flurys, Park Street"],
        "viewpoints": ["Princep Ghat", "Millennium Park", "Eden Gardens"],
        "temples": ["Dakshineswar Kali Temple", "Belur Math", "Kalighat Temple"],
        "cafes": ["Indian Coffee House, College Street", "Flurys", "Olypub"],
        "parks": ["Maidan", "Rabindra Sarobar", "Victoria Memorial Gardens"],
        "nightlife": ["Park Street", "Salt Lake Sector V", "Camac Street"],
    },
}

def _get_city_data(destination: str) -> dict:
    key = destination.lower().strip()
    for city_key, data in CITY_LANDMARKS.items():
        if city_key in key:
            return data
    # Generic fallback for unknown cities
    return {
        "heritage": [f"{destination} Fort", f"{destination} Palace", f"Old Town, {destination}"],
        "museums": [f"{destination} State Museum", f"City Museum, {destination}"],
        "nature": [f"City Park, {destination}", f"Riverside Walk, {destination}"],
        "markets": [f"Main Bazaar, {destination}", f"Local Market, {destination}"],
        "food": [f"Famous Street Food Street, {destination}", f"Local Dhaba, {destination}"],
        "viewpoints": [f"City Viewpoint, {destination}", f"Hilltop View, {destination}"],
        "temples": [f"Main Temple, {destination}", f"Local Shrine, {destination}"],
        "cafes": [f"Rooftop Cafe, {destination}", f"Local Tea Stall, {destination}"],
        "parks": [f"City Garden, {destination}", f"Central Park, {destination}"],
        "nightlife": [f"Main Street, {destination}", f"Night Bazaar, {destination}"],
    }


class ItineraryAgent:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    def _generate_fallback(self, ctx: dict, weather=None) -> dict:
        destination = ctx["destination"]
        duration = ctx["duration"]
        c = _get_city_data(destination)

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

        daily_plans = [
            [
                {"time": "2:00 PM",  "activity": "Check-in & freshen up",    "place": f"Your hotel in {destination}",      "description": f"Settle in and get comfortable"},
                {"time": "4:00 PM",  "activity": "Neighbourhood walk",        "place": c["viewpoints"][0],                  "description": "Get a feel of the city's vibe and surroundings"},
                {"time": "6:30 PM",  "activity": "Sunset stroll",             "place": c["viewpoints"][-1],                 "description": "Watch the sun go down from a scenic spot"},
                {"time": "8:00 PM",  "activity": "Welcome dinner",            "place": c["food"][0],                        "description": "Try a local specialty for your first night"},
            ],
            [
                {"time": "8:00 AM",  "activity": "Breakfast",                 "place": c["cafes"][0],                       "description": "Start with a traditional local breakfast"},
                {"time": "10:00 AM", "activity": "Heritage site visit",        "place": c["heritage"][0],                    "description": f"Explore the most iconic monument in {destination}"},
                {"time": "1:00 PM",  "activity": "Lunch",                      "place": c["food"][1] if len(c["food"]) > 1 else c["food"][0], "description": "Dine near the heritage area"},
                {"time": "3:00 PM",  "activity": "Museum visit",               "place": c["museums"][0],                    "description": "Dive into local history and culture"},
                {"time": "5:30 PM",  "activity": "Evening market browse",      "place": c["markets"][0],                    "description": "Explore stalls selling handicrafts and street food"},
                {"time": "8:00 PM",  "activity": "Rooftop dinner",             "place": c["nightlife"][0],                  "description": "Enjoy city views while dining"},
            ],
            [
                {"time": "6:30 AM",  "activity": "Morning nature walk",        "place": c["parks"][0],                      "description": "Breathe fresh air and enjoy the greenery"},
                {"time": "9:00 AM",  "activity": "Breakfast",                  "place": c["cafes"][-1],                     "description": "Fuel up after your walk"},
                {"time": "11:00 AM", "activity": "Outdoor adventure",          "place": c["nature"][0],                     "description": "Explore nature — hike, boat ride or wildlife"},
                {"time": "1:30 PM",  "activity": "Lunch",                      "place": c["food"][-1],                      "description": "Eat at a roadside local eatery"},
                {"time": "4:00 PM",  "activity": "Scenic viewpoint",           "place": c["viewpoints"][0],                 "description": "Best panoramic spot in the area"},
                {"time": "7:30 PM",  "activity": "Dinner & rest",              "place": c["food"][0],                       "description": "Relax with a hearty local meal"},
            ],
            [
                {"time": "8:00 AM",  "activity": "Local breakfast",            "place": c["markets"][0],                    "description": "Street-side breakfast — local specialties"},
                {"time": "9:30 AM",  "activity": "Market visit",               "place": c["markets"][-1],                   "description": f"Visit the main bazaar of {destination}"},
                {"time": "12:00 PM", "activity": "Street food tour",           "place": c["food"][0],                       "description": "Sample 4-5 local street food items"},
                {"time": "2:30 PM",  "activity": "Shopping & souvenirs",       "place": c["markets"][1] if len(c["markets"]) > 1 else c["markets"][0], "description": "Pick up souvenirs and local handicrafts"},
                {"time": "5:00 PM",  "activity": "Evening chai",               "place": c["cafes"][0],                      "description": "Join locals for evening chai and snacks"},
                {"time": "8:00 PM",  "activity": "Dinner",                     "place": c["food"][1] if len(c["food"]) > 1 else c["food"][0], "description": "Try the city's most-loved dinner dish"},
            ],
            [
                {"time": "9:00 AM",  "activity": "Museum & art",               "place": c["museums"][-1],                   "description": "Explore modern or folk art of the region"},
                {"time": "11:30 AM", "activity": "Hidden gem neighbourhood",   "place": c["parks"][-1],                     "description": f"Explore a lesser-known quarter of {destination}"},
                {"time": "1:30 PM",  "activity": "Lunch at a hidden gem cafe", "place": c["cafes"][-1],                     "description": "Off-the-tourist-trail dining experience"},
                {"time": "3:30 PM",  "activity": "Temple / religious site",    "place": c["temples"][0],                    "description": "Visit a spiritually significant local site"},
                {"time": "6:00 PM",  "activity": "Rooftop sundowner",          "place": c["nightlife"][-1],                 "description": "Cocktails or mocktails with a view"},
                {"time": "8:30 PM",  "activity": "Dinner & night walk",        "place": c["nightlife"][0],                  "description": "Explore the nighttime energy of the city"},
            ],
            [
                {"time": "7:00 AM",  "activity": "Day trip departure",         "place": c["nature"][-1],                    "description": "Head to a nearby natural attraction"},
                {"time": "10:00 AM", "activity": "Exploration",                "place": c["heritage"][-1],                  "description": "Explore the destination's surroundings"},
                {"time": "1:00 PM",  "activity": "Lunch",                      "place": c["food"][-1],                      "description": "Local food at the excursion destination"},
                {"time": "4:00 PM",  "activity": "Return journey",             "place": f"Back to {destination} city",      "description": "Head back with some snacks for the road"},
                {"time": "7:00 PM",  "activity": "Rest & light dinner",        "place": c["cafes"][0],                      "description": "Wind down after a full day out"},
            ],
            [
                {"time": "10:00 AM", "activity": "Leisure morning",            "place": c["parks"][0],                      "description": "Sleep in, enjoy a long breakfast, browse around"},
                {"time": "12:00 PM", "activity": "Shopping",                   "place": c["markets"][0],                    "description": "Visit the main shopping street or market"},
                {"time": "2:30 PM",  "activity": "Desserts & sweets",          "place": c["food"][0],                       "description": "Try local sweets, ice cream, and desserts"},
                {"time": "5:00 PM",  "activity": "Spa or relaxation",          "place": c["parks"][-1],                     "description": "Pamper yourself after days of walking"},
                {"time": "8:00 PM",  "activity": "Special dinner",             "place": c["food"][-1],                      "description": "Treat yourself to the best restaurant in town"},
            ],
            [
                {"time": "7:00 AM",  "activity": "Yoga or morning meditation", "place": c["parks"][0],                      "description": "Find a local yoga class or meditate peacefully"},
                {"time": "9:30 AM",  "activity": "Healthy brunch",             "place": c["cafes"][0],                      "description": "Juice bar or health cafe visit"},
                {"time": "11:00 AM", "activity": "Heritage walk",              "place": c["heritage"][1] if len(c["heritage"]) > 1 else c["heritage"][0], "description": "Slow heritage walk with a guide"},
                {"time": "2:00 PM",  "activity": "Slow afternoon",             "place": c["parks"][-1],                     "description": "Read, journal, or relax in a garden or cafe"},
                {"time": "6:00 PM",  "activity": "Sunset",                     "place": c["viewpoints"][-1],                "description": "Park, riverside, or terrace at golden hour"},
                {"time": "8:00 PM",  "activity": "Dinner",                     "place": c["food"][0],                       "description": "Enjoy a relaxed dinner"},
            ],
            [
                {"time": "6:00 AM",  "activity": "Golden hour photography",    "place": c["viewpoints"][0],                 "description": f"Capture {destination} at its most beautiful light"},
                {"time": "9:00 AM",  "activity": "Breakfast & photo review",   "place": c["cafes"][0],                      "description": "Review your shots over coffee"},
                {"time": "11:00 AM", "activity": "Iconic photo spots",         "place": c["heritage"][0],                   "description": "Hit the must-photograph locations"},
                {"time": "2:00 PM",  "activity": "Scenic lunch",               "place": c["food"][0],                       "description": "Dine somewhere scenic for great photos"},
                {"time": "4:00 PM",  "activity": "Street photography",         "place": c["markets"][0],                    "description": "Candid shots of local life and architecture"},
                {"time": "7:30 PM",  "activity": "Night photography & dinner", "place": c["nightlife"][0],                  "description": "Capture city lights and end with a great meal"},
            ],
            [
                {"time": "8:00 AM",  "activity": "Last local breakfast",       "place": c["cafes"][0],                      "description": "Savour one final local breakfast"},
                {"time": "9:30 AM",  "activity": "Final souvenir shopping",    "place": c["markets"][0],                    "description": "Pick up any last gifts and mementos"},
                {"time": "11:00 AM", "activity": "Revisit favourite spot",     "place": c["heritage"][0],                   "description": f"One last look at your favourite place in {destination}"},
                {"time": "1:00 PM",  "activity": "Farewell lunch",             "place": c["food"][-1],                      "description": "Lunch at the best place you discovered"},
                {"time": "3:00 PM",  "activity": "Head to station/airport",    "place": f"{destination} Railway Station / Airport", "description": "Check out and travel to your departure point"},
            ],
        ]

        days = []
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

CRITICAL RULES:
1. Use REAL, SPECIFIC named places that actually exist in {destination}.
2. Every activity MUST have a "place" field with the actual name of the location (e.g. "Gateway of India", "Crawford Market", "Cafe Mondegar").
3. Never use generic descriptions like "local park" or "heritage site" — always use the real name.
4. Each day should have 5-6 activities with specific timings.
5. Vary the places across days — do not repeat the same place twice.

Return ONLY valid JSON (no markdown, no extra text):
{{
  "days": [
    {{
      "theme": "Day theme title",
      "activities": [
        {{"time": "8:00 AM", "activity": "Morning walk", "place": "Actual Place Name, Area", "description": "One sentence about what to do here"}},
        {{"time": "10:00 AM", "activity": "Sightseeing", "place": "Actual Monument or Attraction Name", "description": "Brief description"}},
        {{"time": "1:00 PM", "activity": "Lunch", "place": "Actual Restaurant or Food Street Name", "description": "What to eat here"}},
        {{"time": "3:00 PM", "activity": "Cultural visit", "place": "Actual Temple, Museum or Site Name", "description": "Brief description"}},
        {{"time": "6:00 PM", "activity": "Evening", "place": "Actual Area or Viewpoint Name", "description": "Brief description"}},
        {{"time": "8:00 PM", "activity": "Dinner", "place": "Actual Restaurant or Food Street Name", "description": "Dining recommendation"}}
      ]
    }}
  ]
}}

Generate exactly {duration} day objects."""

            resp = await self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2500,
                temperature=0.5,
            )
            text = resp.choices[0].message.content.strip()
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception:
            pass

        return self._generate_fallback(ctx, weather)
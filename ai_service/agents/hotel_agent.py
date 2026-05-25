import json
import os
import math
from groq import AsyncGroq


class HotelAgent:
    """
    Hotel Agent: Recommends hotels matching user budget and preferences.
    Uses Groq LLM for intelligent hotel suggestions.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    def _generate_fallback(self, ctx: dict) -> dict:
        """Generate sensible hotel options when LLM is unavailable."""
        budget = ctx["budget"]
        duration = ctx["duration"]
        destination = ctx["destination"]
        nightly_budget = (budget * 0.30) / max(duration, 1)

        return {
            "options": [
                {
                    "name": f"The Grand {destination} Hotel",
                    "area": "City Center",
                    "rating": 4.2,
                    "pricePerNight": round(nightly_budget),
                    "amenities": ["WiFi", "Breakfast", "AC", "Room Service"],
                    "recommended": True,
                },
                {
                    "name": f"{destination} Comfort Inn",
                    "area": "Market District",
                    "rating": 3.8,
                    "pricePerNight": round(nightly_budget * 0.7),
                    "amenities": ["WiFi", "AC", "Parking"],
                    "recommended": False,
                },
                {
                    "name": f"Budget Stay {destination}",
                    "area": "Old Town",
                    "rating": 3.5,
                    "pricePerNight": round(nightly_budget * 0.45),
                    "amenities": ["WiFi", "Fan Cooling"],
                    "recommended": False,
                },
            ]
        }

    async def run(self, ctx: dict) -> dict:
        destination = ctx["destination"]
        budget = ctx["budget"]
        duration = ctx["duration"]
        travel_type = ctx.get("travel_type", "solo")
        group_size = ctx.get("group_size", 1)
        nightly_budget = (budget * 0.30) / max(duration, 1)

        if not self.client:
            return self._generate_fallback(ctx)

        try:
            prompt = f"""You are a hotel recommendation expert. Suggest 3 hotels in {destination} for a {travel_type} traveler.

Details:
- Total budget: ₹{budget:,.0f}
- Duration: {duration} days
- Group size: {group_size}
- Nightly budget for accommodation: ₹{nightly_budget:,.0f}
- Travel type: {travel_type}

Return ONLY valid JSON in this exact format (no extra text):
{{
  "options": [
    {{
      "name": "Hotel Name",
      "area": "Area/Locality",
      "rating": 4.2,
      "pricePerNight": 2500,
      "amenities": ["WiFi", "Breakfast", "AC", "Pool"],
      "recommended": true
    }},
    {{
      "name": "Hotel Name 2",
      "area": "Area",
      "rating": 3.8,
      "pricePerNight": 1800,
      "amenities": ["WiFi", "AC"],
      "recommended": false
    }},
    {{
      "name": "Budget Option",
      "area": "Area",
      "rating": 3.5,
      "pricePerNight": 1200,
      "amenities": ["WiFi"],
      "recommended": false
    }}
  ]
}}

Make exactly ONE hotel recommended=true (the best value). Use realistic Indian hotel prices."""

            resp = await self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600,
                temperature=0.4,
            )
            text = resp.choices[0].message.content.strip()
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception as e:
            pass

        return self._generate_fallback(ctx)

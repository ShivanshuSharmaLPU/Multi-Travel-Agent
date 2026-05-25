import json
import os
from groq import AsyncGroq


class LocalGuideAgent:
    """
    Local Guide Agent: Recommends authentic local experiences.
    Cafés, restaurants, hidden gems, and shopping spots.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    def _fallback(self, destination: str) -> dict:
        return {
            "restaurants": [
                f"Local Thali House, {destination}",
                f"Spice Garden Restaurant",
                f"The Rooftop Café",
            ],
            "cafes": [
                f"Brew & Beans Café",
                f"The Reading Room",
            ],
            "hidden_gems": [
                f"Old quarter of {destination}",
                f"Local fish/vegetable market at dawn",
                f"Sunset point known only to locals",
            ],
            "shopping": [
                f"{destination} Local Bazaar for handicrafts",
                f"Street market near the main square",
                "Government Emporium for authentic souvenirs",
            ],
        }

    async def run(self, ctx: dict) -> dict:
        destination = ctx["destination"]
        travel_type = ctx.get("travel_type", "solo")
        budget = ctx["budget"]

        if not self.client:
            return self._fallback(destination)

        try:
            prompt = f"""You are a local travel guide expert for {destination}. Recommend authentic local experiences for a {travel_type} traveler with ₹{budget:,} budget.

Return ONLY valid JSON:
{{
  "restaurants": ["Restaurant 1 with brief note", "Restaurant 2", "Restaurant 3", "Restaurant 4"],
  "cafes": ["Café 1 with area name", "Café 2", "Café 3"],
  "hidden_gems": ["Hidden spot 1 description", "Hidden spot 2", "Hidden spot 3"],
  "shopping": ["Shopping spot 1", "Shopping spot 2", "Shopping spot 3"]
}}

Use specific, real place names in {destination}. Focus on authentic local experiences, not tourist traps."""

            resp = await self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=600,
                temperature=0.7,
            )
            text = resp.choices[0].message.content.strip()
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except Exception:
            pass

        return self._fallback(destination)

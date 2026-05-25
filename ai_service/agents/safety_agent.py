import json
import os
from groq import AsyncGroq
from tools.langchain_tools import get_safety_info


class SafetyAgent:
    """
    Safety Agent: Provides destination-specific safety guidance.
    Uses LangChain tool for base info + Groq for enhancements.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    async def run(self, ctx: dict) -> dict:
        destination = ctx["destination"]
        travel_type = ctx.get("travel_type", "solo")

        # Use LangChain tool for base safety info
        tool_result = get_safety_info.invoke({
            "destination": destination,
            "travel_type": travel_type,
        })
        base = json.loads(tool_result)

        # Enhance with destination-specific tips via Groq
        if self.client:
            try:
                prompt = f"""You are a travel safety expert. Add 3-4 destination-specific safety tips for {destination}.
Current tips: {json.dumps(base['precautions'][:3])}

Return ONLY JSON:
{{
  "destination_tips": ["Tip specific to {destination}", "Another specific tip", "Third tip"],
  "emergency_contacts": "Police: 100 | Ambulance: 108 | Tourist Helpline: 1800-111-363 | Local emergency: 112"
}}"""

                resp = await self.client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=400,
                    temperature=0.3,
                )
                text = resp.choices[0].message.content.strip()
                start = text.find("{")
                end = text.rfind("}") + 1
                if start != -1 and end > start:
                    enhanced = json.loads(text[start:end])
                    base["precautions"] = enhanced.get("destination_tips", []) + base["precautions"]
                    base["emergency_contacts"] = enhanced.get("emergency_contacts", base["emergency_contacts"])
            except Exception:
                pass

        return base

import json
import os
from groq import AsyncGroq
from tools.langchain_tools import compare_transport_options


class TransportAgent:
    """
    Transport Agent: Suggests optimal transport options.
    Uses LangChain tool + Groq LLM for intelligent recommendations.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    async def run(self, ctx: dict) -> dict:
        source = ctx["source"]
        destination = ctx["destination"]
        budget = ctx["budget"]

        # Use LangChain tool
        tool_result = compare_transport_options.invoke({
            "source": source,
            "destination": destination,
            "budget": budget,
        })
        base_data = json.loads(tool_result)

        # Enhance with Groq LLM if key available
        if self.client:
            try:
                prompt = f"""You are a travel transport expert. Given this transport data for {source} to {destination}:
{json.dumps(base_data, indent=2)}

Travel type: {ctx.get('travel_type')}, Group: {ctx.get('group_size')} persons, Budget: ₹{budget:,.0f}

Improve the recommendation text. Return ONLY valid JSON matching this exact structure:
{{
  "options": [same options array with any corrections],
  "recommendation": "enhanced 2-3 sentence recommendation"
}}"""

                resp = await self.client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500,
                    temperature=0.3,
                )
                text = resp.choices[0].message.content.strip()
                # Extract JSON
                start = text.find("{")
                end = text.rfind("}") + 1
                if start != -1 and end > start:
                    enhanced = json.loads(text[start:end])
                    base_data.update(enhanced)
            except Exception as e:
                pass  # fallback to base data

        return base_data

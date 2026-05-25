import json
import os
from groq import AsyncGroq
from tools.langchain_tools import calculate_budget


class BudgetAgent:
    """
    Budget Planner Agent: Detailed expense breakdown using LangChain tools + Groq.
    Informed by transport and hotel data from other agents.
    """

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key) if api_key else None

    async def run(self, ctx: dict, results: dict = {}) -> dict:
        budget = ctx["budget"]
        duration = ctx["duration"]
        group_size = ctx.get("group_size", 1)

        # Use LangChain tool for base calculation
        tool_result = calculate_budget.invoke({
            "total_budget": budget,
            "duration": duration,
            "group_size": group_size,
        })
        base = json.loads(tool_result)

        # Adjust based on actual transport/hotel costs
        transport_cost = 0
        hotel_cost = 0

        transport_opts = results.get("transport", {}).get("options", [])
        best_transport = next((o for o in transport_opts if o.get("recommended")), None)
        if best_transport:
            transport_cost = best_transport.get("cost", 0) * group_size

        hotel_opts = results.get("hotels", {}).get("options", [])
        best_hotel = next((h for h in hotel_opts if h.get("recommended")), None)
        if best_hotel:
            hotel_cost = best_hotel.get("pricePerNight", 0) * duration

        breakdown = base["breakdown"].copy()
        if transport_cost > 0:
            breakdown["Transport"] = transport_cost
        if hotel_cost > 0:
            breakdown["Accommodation"] = hotel_cost

        # Recalculate others proportionally
        used = breakdown.get("Transport", 0) + breakdown.get("Accommodation", 0)
        remaining = budget - used
        if remaining > 0:
            breakdown["Food"] = round(remaining * 0.40)
            breakdown["Activities"] = round(remaining * 0.25)
            breakdown["Shopping"] = round(remaining * 0.20)
            breakdown["Emergency"] = round(remaining * 0.15)

        total = sum(breakdown.values())
        savings_tip = f"You can save ₹{round(budget * 0.1):,} by booking transport 3 weeks in advance and eating at local restaurants."

        # Enhance with Groq if available
        if self.client:
            try:
                prompt = f"""Budget planning for {ctx['destination']} trip:
Budget: ₹{budget:,}, Duration: {duration} days, Group: {group_size}, Travel: {ctx.get('travel_type')}

Current breakdown: {json.dumps(breakdown)}

Generate a practical savings tip specific to {ctx['destination']}. Max 2 sentences.
Return ONLY JSON: {{"savings_tip": "...", "local_tip": "..."}}"""

                resp = await self.client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.4,
                )
                text = resp.choices[0].message.content.strip()
                start, end = text.find("{"), text.rfind("}") + 1
                if start != -1:
                    tips = json.loads(text[start:end])
                    savings_tip = tips.get("savings_tip", savings_tip)
            except Exception:
                pass

        return {
            "total": total,
            "breakdown": breakdown,
            "per_day": round(total / max(duration, 1)),
            "per_person": round(total / max(group_size, 1)),
            "savings_tip": savings_tip,
        }

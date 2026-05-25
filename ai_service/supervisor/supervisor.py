import asyncio
import json
from typing import AsyncGenerator
from agents.transport_agent import TransportAgent
from agents.hotel_agent import HotelAgent
from agents.weather_agent import WeatherAgent
from agents.budget_agent import BudgetAgent
from agents.itinerary_agent import ItineraryAgent
from agents.local_guide_agent import LocalGuideAgent
from agents.safety_agent import SafetyAgent


class SupervisorAgent:
    """
    Supervisor Agent: Orchestrates all specialized travel agents.
    Uses SSE streaming to push live updates to the frontend.
    """

    def __init__(self):
        self.transport = TransportAgent()
        self.hotel = HotelAgent()
        self.weather = WeatherAgent()
        self.budget = BudgetAgent()
        self.itinerary = ItineraryAgent()
        self.local_guide = LocalGuideAgent()
        self.safety = SafetyAgent()

    async def run(self, **kwargs) -> dict:
        """Non-streaming: collect all agent results."""
        results = {}
        async for event in self.run_stream(**kwargs):
            if event.get("type") == "done":
                return event.get("plan", {})
        return results

    async def run_stream(self, source, destination, budget, duration, travel_type, group_size) -> AsyncGenerator[dict, None]:
        """Streaming: yield SSE events as agents complete."""
        ctx = {
            "source": source,
            "destination": destination,
            "budget": float(budget),
            "duration": int(duration),
            "travel_type": travel_type,
            "group_size": int(group_size),
        }

        yield {"type": "agent_start", "agent": "supervisor", "message": f"Analyzing trip: {source} → {destination} for {duration} days"}
        await asyncio.sleep(0.5)

        yield {"type": "log", "message": f"📋 Trip: {source} → {destination}, ₹{budget:,.0f} budget, {duration} days, {travel_type}"}
        yield {"type": "log", "message": "🧠 Supervisor breaking down tasks and assigning agents..."}
        await asyncio.sleep(0.3)

        results = {}

        # --- Weather Agent (runs first, informs others) ---
        yield {"type": "agent_start", "agent": "weather", "message": f"Fetching Open-Meteo forecasts for {destination}..."}
        await asyncio.sleep(0.2)
        try:
            weather_data = await self.weather.run(ctx)
            results["weather"] = weather_data
            yield {"type": "agent_update", "agent": "weather", "message": f"Got {len(weather_data.get('forecast', []))} days of forecast data"}
            await asyncio.sleep(0.3)
            yield {"type": "agent_done", "agent": "weather", "message": f"{weather_data.get('condition', 'Clear')} weather, avg {weather_data.get('avgTemp', 'N/A')}°C"}
        except Exception as e:
            results["weather"] = {"condition": "Unavailable", "avgTemp": "N/A", "error": str(e)}
            yield {"type": "agent_done", "agent": "weather", "message": "Weather data unavailable (API offline)"}

        yield {"type": "log", "message": "✓ Weather data ready — informing other agents"}

        # --- Transport Agent ---
        yield {"type": "agent_start", "agent": "transport", "message": f"Searching flights, trains, buses: {source} → {destination}"}
        await asyncio.sleep(0.4)
        try:
            transport_data = await self.transport.run(ctx)
            results["transport"] = transport_data
            best = next((o for o in transport_data.get("options", []) if o.get("recommended")), None)
            msg = f"Best option: {best['name']} (₹{best['cost']:,})" if best else "Transport options found"
            yield {"type": "agent_done", "agent": "transport", "message": msg}
        except Exception as e:
            results["transport"] = {"options": [], "recommendation": f"Error: {str(e)}"}
            yield {"type": "agent_done", "agent": "transport", "message": "Transport agent error"}

        # --- Hotel Agent ---
        yield {"type": "agent_start", "agent": "hotel", "message": f"Finding hotels in {destination} within ₹{budget:,.0f} budget"}
        await asyncio.sleep(0.4)
        try:
            hotel_data = await self.hotel.run(ctx)
            results["hotels"] = hotel_data
            count = len(hotel_data.get("options", []))
            yield {"type": "agent_done", "agent": "hotel", "message": f"Found {count} hotel options matching your budget"}
        except Exception as e:
            results["hotels"] = {"options": []}
            yield {"type": "agent_done", "agent": "hotel", "message": "Hotel agent error"}

        # --- Budget Agent ---
        yield {"type": "agent_start", "agent": "budget", "message": "Calculating detailed expense breakdown..."}
        await asyncio.sleep(0.4)
        try:
            budget_data = await self.budget.run(ctx, results)
            results["budget_plan"] = budget_data
            yield {"type": "agent_done", "agent": "budget", "message": f"Total estimated: ₹{budget_data.get('total', 0):,.0f}"}
        except Exception as e:
            results["budget_plan"] = {"total": budget, "breakdown": {}}
            yield {"type": "agent_done", "agent": "budget", "message": "Budget calculation error"}

        # --- Itinerary Agent ---
        yield {"type": "agent_start", "agent": "itinerary", "message": f"Building {duration}-day itinerary with weather-aware activities"}
        await asyncio.sleep(0.5)
        try:
            itinerary_data = await self.itinerary.run(ctx, results)
            results["itinerary"] = itinerary_data
            days = len(itinerary_data.get("days", []))
            yield {"type": "agent_done", "agent": "itinerary", "message": f"Created {days}-day detailed itinerary"}
        except Exception as e:
            results["itinerary"] = {"days": []}
            yield {"type": "agent_done", "agent": "itinerary", "message": "Itinerary agent error"}

        # --- Local Guide Agent ---
        yield {"type": "agent_start", "agent": "local", "message": f"Discovering local gems, restaurants & experiences in {destination}"}
        await asyncio.sleep(0.4)
        try:
            local_data = await self.local_guide.run(ctx)
            results["local_guide"] = local_data
            yield {"type": "agent_done", "agent": "local", "message": "Local recommendations ready"}
        except Exception as e:
            results["local_guide"] = {}
            yield {"type": "agent_done", "agent": "local", "message": "Local guide error"}

        # --- Safety Agent ---
        yield {"type": "agent_start", "agent": "safety", "message": f"Compiling safety tips and precautions for {destination}"}
        await asyncio.sleep(0.3)
        try:
            safety_data = await self.safety.run(ctx)
            results["safety"] = safety_data
            yield {"type": "agent_done", "agent": "safety", "message": f"{len(safety_data.get('precautions', []))} safety tips ready"}
        except Exception as e:
            results["safety"] = {"precautions": []}
            yield {"type": "agent_done", "agent": "safety", "message": "Safety agent error"}

        # --- Supervisor synthesizes ---
        yield {"type": "agent_update", "agent": "supervisor", "message": "Synthesizing all agent outputs into final plan..."}
        await asyncio.sleep(0.5)

        final_plan = {
            **ctx,
            **results,
        }

        yield {"type": "agent_done", "agent": "supervisor", "message": "All agents complete. Plan ready!"}
        yield {"type": "log", "message": "✅ Multi-agent workflow complete!"}

        yield {"type": "done", "plan": final_plan}

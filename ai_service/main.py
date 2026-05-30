import os
import json
import asyncio
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from supervisor.supervisor import SupervisorAgent

app = FastAPI(title="VoyageAI - Multi-Agent Travel Planner", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PlanRequest(BaseModel):
    source: str
    destination: str
    budget: float
    duration: int
    travel_type: str = "solo"
    group_size: int = 1


@app.get("/health")
async def health():
    return {"status": "ok", "service": "VoyageAI FastAPI AI Service"}


# 🔥 FIX 1: add try/catch to prevent crash
@app.post("/plan")
async def generate_plan(req: PlanRequest):
    try:
        supervisor = SupervisorAgent()

        plan = await supervisor.run(
            source=req.source,
            destination=req.destination,
            budget=req.budget,
            duration=req.duration,
            travel_type=req.travel_type,
            group_size=req.group_size,
        )

        return {"status": "success", "data": plan}

    except Exception as e:
        return {
            "status": "error",
            "message": "AI generation failed",
            "details": str(e)
        }


# 🔥 FIX 2: safer streaming with error protection
@app.get("/stream")
async def stream_plan(
    source: str = Query(...),
    destination: str = Query(...),
    budget: float = Query(...),
    duration: int = Query(...),
    travel_type: str = Query("solo"),
    group_size: int = Query(1),
):
    async def event_generator():
        try:
            supervisor = SupervisorAgent()

            async for event in supervisor.run_stream(
                source=source,
                destination=destination,
                budget=budget,
                duration=duration,
                travel_type=travel_type,
                group_size=group_size,
            ):
                yield f"data: {json.dumps(event)}\n\n"

            # clean end signal
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            # 🔥 THIS fixes "AI service lost" confusion
            yield f"data: {json.dumps({
                'type': 'error',
                'message': 'AI stream failed',
                'details': str(e)
            })}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
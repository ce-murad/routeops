from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
from solver import solve_vrp


class StopModel(BaseModel):
    id: str
    name: str
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    demand: int = Field(default=0, ge=0)


class SolveRequest(BaseModel):
    stops: list[StopModel]
    depotId: str
    vehicles: int = Field(..., ge=1, le=50)
    capacity: int = Field(..., ge=1)
    distanceMetric: Literal['haversine', 'osrm'] = 'haversine'
    objective: Literal['distance', 'time'] = 'distance'

app = FastAPI(title="RouteOps Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://routeops.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/solve")
def solve(req: SolveRequest):
    result = solve_vrp(req.model_dump())

    if result is None:
        return {
            "status": "ok",
            "summary": {
                "totalDistanceKm": 0,
                "totalTimeMin": 0,
                "routes": 0,
                "stopsServed": 0,
            },
            "routes": [],
            "unservedStopIds": [],
        }

    return result
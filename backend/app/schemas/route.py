from pydantic import BaseModel, Field
from typing import List, Tuple

class RouteRequest(BaseModel):
    start_point: Tuple[float, float]
    end_point: Tuple[float, float]
    vehicle_type: str
    preferences: dict

class RouteResponse(BaseModel):
    route_geometry: List[List[float]]
    distance_km: float
    duration_minutes: float
    co2_emissions_kg: float
    eco_score: int
from fastapi import APIRouter, Query
from app.schemas.route import RouteRequest, RouteResponse
from app.services import route_calculator, data_fetch
from typing import List

router = APIRouter()

@router.post("/route", response_model=RouteResponse)
def get_route(request: RouteRequest):
    """
    Calculates the most eco-friendly route based on the provided parameters.
    """
    route_data = route_calculator.find_optimal_route(
        start_point=request.start_point,
        end_point=request.end_point,
        vehicle_type=request.vehicle_type,
        user_preferences=request.preferences
    )
    return route_data

@router.get("/search", response_model=List[dict])
def search_for_location(query: str = Query(..., min_length=3)):
    """
    Provides location autocomplete suggestions.
    """
    suggestions = data_fetch.search_locations(query)
    return suggestions

@router.get("/multimodal-route")
def get_multimodal_route():
    """
    Returns a sample multi-modal route.
    """
    # This is a hardcoded example for demonstration purposes
    return {
        "eco_route": {
            "geometry": [
                [77.2166, 28.6139], # Delhi
                [77.5946, 12.9716]  # Bangalore
            ],
            "distance_km": 2175,
            "duration_minutes": 1980,
            "co2_emissions_kg": 150,
            "eco_score": 95
        },
        "normal_route": {
            "geometry": [
                [77.2166, 28.6139], # Delhi
                [72.8777, 19.0760]  # Mumbai
            ],
            "distance_km": 1420,
            "duration_minutes": 1320,
            "co2_emissions_kg": 210,
        },
        "comparison": {
            "co2_savings_kg": 60,
            "time_difference_minutes": 660
        }
    }
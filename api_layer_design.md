# EcoRoute: API Layer Design

This document outlines the design of the API layer for the EcoRoute project. The API provides external access to the routing engine and is built using FastAPI.

## 1. Overview

The API layer is implemented under `backend/app/api/`. It will be versioned (starting with `v1`) to ensure backward compatibility in the future. The main routing logic will be exposed through a set of well-defined endpoints. Pydantic schemas will be used for robust data validation and serialization.

## 2. Pydantic Schemas

The schemas for our API will be defined in `backend/app/schemas/route.py`.

### a. Request Schema
This schema defines the structure of the request body for the primary routing endpoint.

```python
from pydantic import BaseModel, Field
from typing import List, Tuple

class RouteRequest(BaseModel):
    start_point: Tuple[float, float] = Field(..., example=[51.5074, -0.1278])
    end_point: Tuple[float, float] = Field(..., example=[51.5098, -0.0764])
    vehicle_type: str = Field("ICE-petrol", example="EV")
    preferences: dict = Field({}, example={"w1": 0.5, "w2": 0.2, "w3": 1.0})

    class Config:
        schema_extra = {
            "example": {
                "start_point": [51.5074, -0.1278], # lat, lon for London
                "end_point": [48.8566, 2.3522],   # lat, lon for Paris
                "vehicle_type": "EV",
                "preferences": {
                    "w1": 0.3, # distance weight
                    "w2": 0.2, # time weight
                    "w3": 1.0, # CO2 weight
                    "w4": 0.5, # elevation weight
                    "w5": 0.4  # weather impact weight
                }
            }
        }
```

### b. Response Schema
This schema defines the structure of the data returned by the routing endpoint.

```python
from pydantic import BaseModel
from typing import List, Tuple

class RouteResponse(BaseModel):
    route_geometry: List[Tuple[float, float]]
    distance_km: float
    duration_minutes: float
    co2_emissions_kg: float
    eco_score: int
```

## 3. API Endpoints

The endpoints will be defined in `backend/app/api/v1/endpoints/routing.py`.

### a. Main Routing Endpoint

-   **Endpoint**: `POST /api/v1/route`
-   **Description**: Calculates the most eco-friendly route based on the provided parameters.
-   **Request Body**: An instance of the `RouteRequest` schema.
-   **Response Body**: An instance of the `RouteResponse` schema.
-   **Functionality**:
    1.  Receives the start point, end point, vehicle type, and user preferences.
    2.  Calls the `find_optimal_route` service from the `RouteCalculationModule`.
    3.  The service performs the calculation and returns the optimal path.
    4.  The endpoint formats the result into the `RouteResponse` schema and returns it to the client.
-   **Status Codes**:
    -   `200 OK`: If a route is successfully found.
    -   `422 Unprocessable Entity`: If the request body is invalid.
    -   `500 Internal Server Error`: If an error occurs during route calculation.

### b. Health Check Endpoint

-   **Endpoint**: `GET /health`
-   **Description**: A simple endpoint to verify that the API is running.
-   **Response Body**: `{"status": "ok"}`
-   **Functionality**: Returns a static JSON response. This is useful for monitoring and load balancers.

## 4. API Router Integration

The routing endpoint will be included in the main FastAPI application in `backend/app/main.py` using an API router.

```python
# In backend/app/main.py
from fastapi import FastAPI
from app.api.v1.endpoints import routing

app = FastAPI(...)

app.include_router(routing.router, prefix="/api/v1", tags=["Routing"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
```
This structure keeps the API endpoints organized and decoupled from the main application instance.
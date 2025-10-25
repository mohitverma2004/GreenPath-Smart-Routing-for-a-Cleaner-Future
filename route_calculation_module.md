# EcoRoute: Route Calculation Module Design

This document details the architecture of the Route Calculation Module, the central component of the EcoRoute system responsible for computing optimal, eco-friendly routes.

## 1. Overview

The Route Calculation Module will be implemented in `backend/app/services/route_calculator.py`. Its primary responsibility is to process geospatial data, apply the eco-cost function to the road network, and use a graph-based algorithm to find the path with the lowest cumulative eco-cost.

## 2. Core Components

### a. Road Network Graph Construction
-   **Library**: `OSMnx` and `NetworkX`.
-   **Process**:
    1.  Fetch the road network for a given area (defined by a bounding box around the start and end points) from OpenStreetMap using `OSMnx`.
    2.  Convert the road network into a `NetworkX` MultiDiGraph object. This graph will represent the road segments (edges) and intersections (nodes).
    3.  Each edge in the graph will be annotated with initial data like `length` and `speed_limit`.

### b. Eco-Cost Function
The core of the module is the eco-cost function, which assigns a weight to each edge (road segment) in the graph.

**`Eco-Cost = w1*distance + w2*time + w3*CO₂ + w4*elevation + w5*weatherImpact`**

-   **Implementation**: A function, `calculate_eco_cost(edge_data)`, will be created to compute this value.
-   **Data Integration**: This function will use the data retrieved by the `DataFetchModule` to calculate each component of the cost.
    -   `distance`: From the edge's `length` attribute.
    -   `time`: Calculated from `length` and real-time traffic speed.
    -   `CO₂`: Estimated using the `export-hbefa.csv` dataset, based on vehicle type, speed, and road gradient.
    -   `elevation`: Calculated from the elevation difference between the start and end nodes of the edge.
    -   `weatherImpact`: A penalty factor derived from current weather conditions (e.g., high wind, heavy rain).
-   **Weights (`w1`...`w5`)**: These will be configurable, allowing for user personalization (e.g., a user might prioritize minimizing CO₂ over time).

### c. Routing Algorithm
-   **Algorithm**: Dijkstra's or A* algorithm will be used to find the shortest path in the weighted graph. `NetworkX` provides efficient implementations of these algorithms.
-   **Process**:
    1.  The `calculate_eco_cost` function will be applied to every edge in the graph to set its `weight`.
    2.  The routing algorithm (`networkx.shortest_path`) will be run on the graph from the start node to the end node, using the calculated `weight` attribute.
    3.  The output will be a sequence of nodes representing the optimal route.

## 3. Main Function

The module will expose a primary function to orchestrate this process:

### `find_optimal_route(start_point: tuple, end_point: tuple, vehicle_type: str, user_preferences: dict) -> dict`
-   **Purpose**: To calculate the most eco-friendly route between two points.
-   **Input**:
    -   `start_point`, `end_point`: `(latitude, longitude)` tuples.
    -   `vehicle_type`: e.g., 'EV', 'hybrid', 'ICE-petrol'.
    -   `user_preferences`: A dictionary containing the weights (`w1`...`w5`) for the eco-cost function.
-   **Steps**:
    1.  Construct the road network graph for the area.
    2.  Fetch all necessary external data (traffic, weather, elevation) using the `DataFetchModule`.
    3.  Iterate through the graph edges and calculate the eco-cost for each one.
    4.  Run the routing algorithm to find the optimal path.
    5.  Format the resulting path into a GeoJSON or similar format for the API response.
-   **Output**: A dictionary containing the route geometry, estimated travel time, distance, and total CO₂ emissions.

## 4. EV-Specific Logic
For electric vehicles, the `find_optimal_route` function will include additional logic:
-   It will consider the vehicle's range.
-   If a route exceeds the vehicle's range, the algorithm will incorporate charging stops by identifying nearby charging stations (using the `DataFetchModule`) and treating them as intermediate waypoints.
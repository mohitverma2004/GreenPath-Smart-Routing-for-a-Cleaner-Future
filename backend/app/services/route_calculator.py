import osmnx as ox
import networkx as nx
from fastapi import HTTPException

def find_optimal_route(start_point: tuple, end_point: tuple, vehicle_type: str, user_preferences: dict) -> dict:
    """
    Calculates the most eco-friendly route between two points.
    """
    ox.settings.use_cache = True
    ox.settings.cache_folder = './cache'
    ox.settings.log_console = True

    try:
        center_point = ((start_point[0] + end_point[0]) / 2, (start_point[1] + end_point[1]) / 2)
        dist = ox.distance.great_circle(start_point[0], start_point[1], end_point[0], end_point[1]) * 1.5
        G = ox.graph_from_point(center_point, dist=dist, network_type=vehicle_type, simplify=True)
        G = ox.add_edge_speeds(G)
        G = ox.add_edge_travel_times(G)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to download map data: {e}")

    try:
        for u, v, key, data in G.edges(keys=True, data=True):
            distance = data.get('length', 0) / 1000
            travel_time = data.get('travel_time', 0)
            eco_cost = distance # Simplified cost for stability
            G.edges[u, v, key]['eco_cost'] = eco_cost

        start_node = ox.nearest_nodes(G, start_point[1], start_point[0])
        end_node = ox.nearest_nodes(G, end_point[1], end_point[0])
        
        route_nodes = nx.shortest_path(G, source=start_node, target=end_node, weight='eco_cost')
        
        route_length_m = sum(ox.utils_graph.get_route_edge_attributes(G, route_nodes, 'length'))
        route_travel_time_s = sum(ox.utils_graph.get_route_edge_attributes(G, route_nodes, 'travel_time'))
        
        distance_km = route_length_m / 1000
        duration_minutes = route_travel_time_s / 60
        co2_emissions_kg = distance_km * 0.15
        route_geometry = [[G.nodes[n]['x'], G.nodes[n]['y']] for n in route_nodes]
        
        eco_score = max(0, 100 - int(co2_emissions_kg * 10))

        return {
            "route_geometry": route_geometry,
            "distance_km": distance_km,
            "duration_minutes": duration_minutes,
            "co2_emissions_kg": co2_emissions_kg,
            "eco_score": eco_score
        }

    except nx.NetworkXNoPath:
        raise HTTPException(status_code=404, detail="No valid path could be found between the selected points.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during route calculation: {e}")

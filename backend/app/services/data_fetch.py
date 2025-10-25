from functools import lru_cache
from app.core.config import settings
import requests

# @lru_cache() // This decorator cannot handle list arguments and was causing a crash
def get_traffic_data(coordinates: list) -> dict:
    """
    Fetches real-time traffic data for a given route or area.
    NOTE: This is a placeholder and does not call a real API yet.
    """
    # In a real implementation, you would call the TomTom API here.
    print("Fetching traffic data for:", coordinates)
    return {"flow": "heavy", "incidents": []}

@lru_cache()
def get_elevation_data(coordinates: list) -> dict:
    """
    Retrieves elevation data for a set of geographical points.
    """
    locations = [{"latitude": lat, "longitude": lon} for lat, lon in coordinates]
    try:
        response = requests.post(settings.OPEN_ELEVATION_API_URL, json={"locations": locations})
        response.raise_for_status()
        results = response.json().get('results', [])
        return { (r['latitude'], r['longitude']): r['elevation'] for r in results }
    except requests.RequestException as e:
        print(f"Error fetching elevation data: {e}")
        return {}


@lru_cache()
def get_weather_data(location: tuple) -> dict:
    """
    Fetches current weather conditions for a specific location.
    NOTE: This is a placeholder and does not call a real API yet.
    """
    # In a real implementation, you would call a weather API here.
    print("Fetching weather data for:", location)
    return {"wind_speed": 10, "precipitation": 0, "temperature": 20}

@lru_cache()
def get_charging_stations(bounding_box: dict) -> list:
    """
    Finds EV charging stations within a given geographical area.
    NOTE: This is a placeholder and does not call a real API yet.
    """
    # In a real implementation, you would call a charging station API here.
    print("Fetching charging stations for:", bounding_box)
    return []

def search_locations(query: str) -> list:
    """
    Searches for locations using the TomTom Search API.
    """
    if not query or len(query) < 3:
        return []

    url = f"https://api.tomtom.com/search/2/geocode/{query}.json"
    params = {
        'key': settings.TOMTOM_API_KEY,
        'limit': 10,
        'countrySet': 'IN',
        'lat': 30.7333,
        'lon': 76.7794,
        'radius': 100000,
        'typeahead': 'true'
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        suggestions = []
        for result in data.get('results', []):
            suggestions.append({
                "address": result['address']['freeformAddress'],
                "position": {
                    "lat": result['position']['lat'],
                    "lon": result['position']['lon']
                }
            })
        return suggestions
    except requests.RequestException as e:
        print(f"Error fetching location suggestions: {e}")
        return []

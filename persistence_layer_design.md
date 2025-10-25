# EcoRoute: Persistence and Caching Layer Design

This document details the architecture of the database and caching layers for the EcoRoute project. These layers are responsible for data storage, retrieval, and performance optimization.

## 1. Database Layer (PostgreSQL)

The database will be used to store user information, historical route data, and other persistent application state. We will use PostgreSQL with the SQLAlchemy ORM for object-relational mapping.

### a. Database Models
The models will be defined in `backend/app/models/`.

#### `User` Model (`user.py`)
Stores information about registered users.

```python
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Relationship to RouteHistory
    routes = relationship("RouteHistory", back_populates="user")
```

#### `RouteHistory` Model (`route.py`)
Stores a log of routes calculated by users, which can be used for analytics and personalization.

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class RouteHistory(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    start_point_lat = Column(Float)
    start_point_lon = Column(Float)
    end_point_lat = Column(Float)
    end_point_lon = Column(Float)
    co2_emissions_kg = Column(Float)
    distance_km = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to User
    user = relationship("User", back_populates="routes")
```

### b. Database Setup
-   A `db` module will be created in `backend/app/` to manage the database session and initialization.
-   The database URL will be configured via the `DATABASE_URL` setting in `core/config.py`.

## 2. Caching Layer (Redis)

Redis will be used to cache data that is computationally expensive to generate or frequently accessed. This will reduce latency and the load on our external API dependencies.

### a. Caching Strategy

-   **Route Caching**:
    -   **Key**: A hash of the `RouteRequest` object (start point, end point, vehicle, preferences).
    -   **Value**: The `RouteResponse` JSON object.
    -   **TTL (Time-to-Live)**: 1 hour. A calculated route is unlikely to change significantly within this timeframe unless there are major traffic events.

-   **External API Data Caching**:
    -   **Traffic Data**: Cached for a short duration (e.g., 5-10 minutes) to reflect real-time conditions.
    -   **Weather Data**: Cached for a moderate duration (e.g., 30-60 minutes).
    -   **Elevation Data**: Can be cached for a long duration (e.g., 24 hours or more) as it rarely changes.
    -   **EV Charging Stations**: Cached for a few hours to reflect changes in availability.

### b. Implementation
-   A Redis client will be configured in `backend/app/core/config.py` using the `REDIS_URL`.
-   Wrapper functions or decorators can be created to simplify the caching logic. For example, a `@cache` decorator could be applied to the data fetching functions in `data_fetch.py`.

```python
# Example of a cache decorator
import redis
import json
from functools import wraps

redis_client = redis.from_url(settings.REDIS_URL)

def cache(ttl_seconds: int):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{json.dumps(args)}:{json.dumps(kwargs)}"
            cached_result = redis_client.get(key)
            if cached_result:
                return json.loads(cached_result)
            
            result = func(*args, **kwargs)
            redis_client.setex(key, ttl_seconds, json.dumps(result))
            return result
        return wrapper
    return decorator
```
This design provides a robust foundation for managing data persistence and ensuring the application remains responsive under load.
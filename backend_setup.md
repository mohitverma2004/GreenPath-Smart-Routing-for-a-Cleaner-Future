# EcoRoute Backend Setup

This document provides a guide for setting up the FastAPI backend for the EcoRoute project.

## 1. Dependencies

The following Python libraries are required for the backend. These should be included in the `backend/requirements.txt` file.

```
fastapi
uvicorn[standard]
pydantic
sqlalchemy
psycopg2-binary
redis
pandas
geopy
networkx
osmnx
requests
```

## 2. Initial Application (`main.py`)

The main entry point for the application will be in `backend/app/main.py`. Here is the initial setup for the FastAPI app:

```python
from fastapi import FastAPI

app = FastAPI(
    title="EcoRoute API",
    description="An intelligent API for eco-friendly vehicle routing.",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the EcoRoute API"}

# Further endpoints will be added in the api/v1/endpoints/ directory.
```

## 3. Configuration (`config.py`)

A configuration file at `backend/app/core/config.py` will be used to manage settings, such as API keys and database credentials.

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    TOMTOM_API_KEY: str
    OPEN_ELEVATION_API_URL: str = "https://api.open-elevation.com/api/v1/lookup"
    WEATHER_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
```

This setup uses Pydantic's `BaseSettings` to load configuration from environment variables or a `.env` file, which is a best practice for managing sensitive information.

## 4. Running the Application

To run the application locally, use the following command from the `backend/` directory:

```bash
uvicorn app.main:app --reload
```

This will start the development server, and the API will be accessible at `http://127.0.0.1:8000`.
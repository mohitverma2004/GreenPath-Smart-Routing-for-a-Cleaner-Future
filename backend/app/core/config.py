from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/ecoroute"
    REDIS_URL: str = "redis://localhost:6379"
    TOMTOM_API_KEY: str = "YOUR_TOMTOM_API_KEY"
    OPEN_ELEVATION_API_URL: str = "https://api.open-elevation.com/api/v1/lookup"
    WEATHER_API_KEY: str = "YOUR_WEATHER_API_KEY"

    class Config:
        env_file = ".env"

settings = Settings()
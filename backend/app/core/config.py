import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./stadiumops.db"
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Allowed CORS Origins (comma-separated string)
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,https://stadiumops-ai.vercel.app"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

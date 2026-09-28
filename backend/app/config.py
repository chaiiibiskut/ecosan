from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./ecosan.db"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    APP_NAME: str = "EcoSan Intelligence API"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
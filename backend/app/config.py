from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./ecosan.db"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "https://ecosan-seven.vercel.app",
        "https://ecosan-git-main-chaiii-biskut.vercel.app",
    ]
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    APP_NAME: str = "EcoSan Intelligence API"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    GOOGLE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # AI Config
    DEFAULT_MODEL: str = "openai/gpt-oss-120b"
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    
    # App Config
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./soc_copilot.db"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

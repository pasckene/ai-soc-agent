from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    GOOGLE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    # AI Config
    DEFAULT_MODEL: str = "gemini-1.5-flash"
    GROQ_MODEL: str = "llama3-70b-8192"
    
    # App Config
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./soc_copilot.db"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

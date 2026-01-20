"""
Application Configuration Module
Manages all environment variables and application settings
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "StartGenie AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "startgenie_db"
    
    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-ada-002"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7
    
    # Vector Store
    VECTOR_STORE_TYPE: str = "faiss"
    FAISS_INDEX_PATH: str = "./data/vector_store/faiss_index"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Data Sources
    STARTUP_INDIA_URL: str = "https://www.startupindia.gov.in"
    DPIIT_URL: str = "https://dpiit.gov.in"
    INVEST_INDIA_URL: str = "https://www.investindia.gov.in"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: str = "*"
    CORS_HEADERS: str = "*"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    # Export
    PDF_TEMPLATE_PATH: str = "./templates/pdf"
    PPT_TEMPLATE_PATH: str = "./templates/ppt"
    EXPORT_DIR: str = "./exports"
    
    # Cache
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 3600
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS origins string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    Using lru_cache ensures settings are loaded only once
    """
    return Settings()


# Global settings instance
settings = get_settings()

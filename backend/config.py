import os
from typing import List

class Settings:
    # Database
    database_url: str = os.getenv("DB_URL", "sqlite:///./dogtor.db")
    
    # Storage
    storage_backend: str = os.getenv("STORAGE_BACKEND", "local")
    max_image_mb: int = int(os.getenv("MAX_IMAGE_MB", "5"))
    
    # Supabase (for production)
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE", "")
    
    # AI Services
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    
    # CORS
    cors_origins: List[str] = os.getenv(
        "API_CORS_ORIGINS", 
        "http://localhost:5173,http://localhost:5000,https://hellodogtor.com"
    ).split(",")
    
    # Environment
    env: str = os.getenv("ENV", "dev")
    backend_base_url: str = os.getenv("BACKEND_BASE_URL", "")

settings = Settings()

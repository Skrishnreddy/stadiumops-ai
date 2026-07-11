import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.core.exceptions import register_exception_handlers
from backend.app.middleware.security import SecurityHeadersMiddleware, RateLimitingMiddleware
from backend.app.api.router import api_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("stadiumops")

# Initialize database tables
logger.info("Initializing database schemas...")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StadiumOps AI Backend",
    description="GenAI Stadium Incident Management Assistant for World Cup 2026 operations.",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None
)

# 1. Custom Security Response Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. CORS Middleware
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

# 3. Rate Limiting Middleware
app.add_middleware(RateLimitingMiddleware)

# Register exceptions
register_exception_handlers(app)

# Register routers
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to StadiumOps AI API. Documentation is available at /docs in development environment.",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )

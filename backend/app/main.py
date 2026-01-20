"""
StartGenie AI - Main Application Entry Point
FastAPI application with RAG-powered startup blueprint generation
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from loguru import logger

from app.config import settings
from app.api import auth, blueprint, chat
from app.database import connect_to_mongo, close_mongo_connection


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle
    - Startup: Connect to database, initialize RAG engine
    - Shutdown: Close connections, cleanup resources
    """
    # Startup
    logger.info("🚀 Starting StartGenie AI...")
    await connect_to_mongo()
    logger.info("✅ Database connected")
    
    # TODO: Initialize RAG engine
    # await initialize_rag_engine()
    
    logger.info("✅ Application started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down StartGenie AI...")
    await close_mongo_connection()
    logger.info("✅ Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Driven Startup Blueprint Generator using RAG and LLMs",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(blueprint.router, prefix="/api/blueprint", tags=["Blueprint"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Welcome to StartGenie AI API",
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )

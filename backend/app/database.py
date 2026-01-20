"""
Database Connection Module
Handles MongoDB connection and database operations
"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from loguru import logger
from typing import Optional

from app.config import settings


class Database:
    """MongoDB database connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db = None


db_instance = Database()


async def connect_to_mongo():
    """
    Connect to MongoDB database
    Creates connection pool and initializes database
    """
    try:
        logger.info("Connecting to MongoDB...")
        
        # Create MongoDB client
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000
        )
        
        # Test connection
        await db_instance.client.admin.command('ping')
        
        # Get database
        db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
        
        logger.info(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        
        # Create indexes
        await create_indexes()
        
    except ConnectionFailure as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    try:
        if db_instance.client:
            db_instance.client.close()
            logger.info("✅ MongoDB connection closed")
    except Exception as e:
        logger.error(f"❌ Error closing MongoDB connection: {e}")


async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        await db_instance.db.users.create_index("email", unique=True)
        await db_instance.db.users.create_index("username", unique=True)
        
        # Blueprints collection indexes
        await db_instance.db.blueprints.create_index("user_id")
        await db_instance.db.blueprints.create_index("created_at")
        
        # Chat history collection indexes
        await db_instance.db.chat_history.create_index("user_id")
        await db_instance.db.chat_history.create_index("blueprint_id")
        await db_instance.db.chat_history.create_index("created_at")
        
        logger.info("✅ Database indexes created")
        
    except Exception as e:
        logger.warning(f"⚠️ Error creating indexes: {e}")


def get_database():
    """
    Get database instance
    Used as dependency in FastAPI routes
    """
    return db_instance.db


# Collection getters
def get_users_collection():
    """Get users collection"""
    return db_instance.db.users


def get_blueprints_collection():
    """Get blueprints collection"""
    return db_instance.db.blueprints


def get_chat_history_collection():
    """Get chat history collection"""
    return db_instance.db.chat_history

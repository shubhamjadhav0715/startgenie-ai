"""
Chat API Endpoints
Handles conversational AI interactions for blueprint refinement
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.models.user import UserInDB
from app.api.auth import get_current_user
from app.database import get_chat_history_collection
from bson import ObjectId


router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model"""
    message: str
    blueprint_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    message: str
    response: str
    timestamp: datetime


class ChatHistory(BaseModel):
    """Chat history model"""
    id: str
    user_id: str
    blueprint_id: Optional[str]
    message: str
    response: str
    created_at: datetime


@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_message: ChatMessage,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Send a chat message to the AI assistant
    
    - **message**: User message
    - **blueprint_id**: Optional blueprint ID for context
    
    Returns AI response
    """
    chat_history_collection = get_chat_history_collection()
    
    # TODO: Implement AI chat response using LLM
    # For now, return a placeholder response
    
    ai_response = "This is a placeholder response. AI chat will be implemented with the RAG engine."
    
    # Save to chat history
    chat_record = {
        "user_id": str(current_user.id),
        "blueprint_id": chat_message.blueprint_id,
        "message": chat_message.message,
        "response": ai_response,
        "created_at": datetime.utcnow()
    }
    
    await chat_history_collection.insert_one(chat_record)
    
    return ChatResponse(
        message=chat_message.message,
        response=ai_response,
        timestamp=datetime.utcnow()
    )


@router.get("/history", response_model=List[ChatHistory])
async def get_chat_history(
    blueprint_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Get chat history for current user
    
    - **blueprint_id**: Optional filter by blueprint ID
    - **skip**: Number of messages to skip (pagination)
    - **limit**: Maximum number of messages to return
    """
    chat_history_collection = get_chat_history_collection()
    
    # Build query
    query = {"user_id": str(current_user.id)}
    if blueprint_id:
        query["blueprint_id"] = blueprint_id
    
    # Find chat history
    cursor = chat_history_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    
    history = await cursor.to_list(length=limit)
    
    return [
        ChatHistory(
            id=str(record["_id"]),
            user_id=record["user_id"],
            blueprint_id=record.get("blueprint_id"),
            message=record["message"],
            response=record["response"],
            created_at=record["created_at"]
        )
        for record in history
    ]


@router.delete("/history/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_message(
    chat_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Delete a chat message from history
    
    - **chat_id**: Chat message ID
    """
    chat_history_collection = get_chat_history_collection()
    
    # Validate ObjectId
    if not ObjectId.is_valid(chat_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid chat ID"
        )
    
    # Find chat message
    chat_message = await chat_history_collection.find_one({"_id": ObjectId(chat_id)})
    
    if not chat_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat message not found"
        )
    
    # Check ownership
    if chat_message["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )
    
    # Delete message
    await chat_history_collection.delete_one({"_id": ObjectId(chat_id)})
    
    return None


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_history(
    blueprint_id: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Clear chat history for current user
    
    - **blueprint_id**: Optional - clear only for specific blueprint
    """
    chat_history_collection = get_chat_history_collection()
    
    # Build query
    query = {"user_id": str(current_user.id)}
    if blueprint_id:
        query["blueprint_id"] = blueprint_id
    
    # Delete all matching messages
    await chat_history_collection.delete_many(query)
    
    return None

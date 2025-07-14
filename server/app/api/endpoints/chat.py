from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, List
from app.db.database import get_db
from app.db.models import ChatMessage, User
from app.db.schemas import ChatMessage as ChatMessageSchema
from app.core.security import get_current_active_user
import json
from datetime import datetime

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        # Store active connections by chat room
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store user info for each connection
        self.connection_users: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, chat_room: str, user_clerk_id: str):
        await websocket.accept()
        
        if chat_room not in self.active_connections:
            self.active_connections[chat_room] = []
        
        self.active_connections[chat_room].append(websocket)
        self.connection_users[websocket] = user_clerk_id
    
    def disconnect(self, websocket: WebSocket, chat_room: str):
        if chat_room in self.active_connections:
            self.active_connections[chat_room].remove(websocket)
            if not self.active_connections[chat_room]:
                del self.active_connections[chat_room]
        
        if websocket in self.connection_users:
            del self.connection_users[websocket]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_room(self, message: str, chat_room: str):
        if chat_room in self.active_connections:
            for connection in self.active_connections[chat_room]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove dead connections
                    self.active_connections[chat_room].remove(connection)


manager = ConnectionManager()


@router.websocket("/ws/{chat_room}")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_room: str,
    user_clerk_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time chat"""
    
    await manager.connect(websocket, chat_room, user_clerk_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_text = message_data.get("message", "")
                
                # Save message to database
                chat_message = ChatMessage(
                    chat_room=chat_room,
                    sender_clerk_id=user_clerk_id,
                    message=message_text
                )
                
                db.add(chat_message)
                db.commit()
                db.refresh(chat_message)
                
                # Prepare response message
                response_message = {
                    "id": chat_message.id,
                    "chat_room": chat_room,
                    "sender_clerk_id": user_clerk_id,
                    "message": message_text,
                    "timestamp": chat_message.timestamp.isoformat()
                }
                
                # Broadcast to all connections in the room
                await manager.broadcast_to_room(
                    json.dumps(response_message),
                    chat_room
                )
                
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({"error": "Invalid JSON format"}),
                    websocket
                )
            except Exception as e:
                await manager.send_personal_message(
                    json.dumps({"error": f"Error processing message: {str(e)}"}),
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_room)


@router.get("/rooms/{chat_room}/messages", response_model=List[ChatMessageSchema])
async def get_chat_messages(
    chat_room: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat message history for a room"""
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.chat_room == chat_room
    ).order_by(ChatMessage.timestamp.desc()).offset(offset).limit(limit).all()
    
    # Reverse to get chronological order
    return list(reversed(messages))


@router.get("/rooms/{chat_room}/info")
async def get_chat_room_info(
    chat_room: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat room information"""
    
    message_count = db.query(ChatMessage).filter(
        ChatMessage.chat_room == chat_room
    ).count()
    
    active_connections = len(manager.active_connections.get(chat_room, []))
    
    return {
        "chat_room": chat_room,
        "message_count": message_count,
        "active_connections": active_connections,
        "created_at": datetime.now().isoformat()
    }


@router.get("/rooms")
async def get_user_chat_rooms(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat rooms where user has participated"""
    
    rooms = db.query(ChatMessage.chat_room).filter(
        ChatMessage.sender_clerk_id == current_user.clerk_user_id
    ).distinct().all()
    
    room_list = []
    for room in rooms:
        room_name = room[0]
        last_message = db.query(ChatMessage).filter(
            ChatMessage.chat_room == room_name
        ).order_by(ChatMessage.timestamp.desc()).first()
        
        room_list.append({
            "room_name": room_name,
            "last_message": last_message.message if last_message else None,
            "last_activity": last_message.timestamp.isoformat() if last_message else None
        })
    
    return room_list 
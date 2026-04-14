import json
import os
from fastapi import WebSocket, WebSocketDisconnect, Query, APIRouter
from Websockets_handling.ConnectionManager.connection_manager import ConnectionManager
from core.dbs.redis_db import redis_client
from repository.document_repo import DocumentRepository
from services.document_service import DocumentService
from services.mail_service import MailService
from core.dbs.postgres_db import get_db_context
from core.DEPENDECIES.dependencies import repo, mail_service, doc_service, manager


sync_router = APIRouter()
#repo = DocumentRepository()
#mail_service = MailService() # added
#doc_service = DocumentService(repo, mail_service) # modified line to include mail_service
#
#manager = ConnectionManager(doc_service)



@sync_router.websocket("/ws/{doc_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    doc_id: str, 
    user_email: str = Query(...)
):
    permission = await doc_service.is_allowed_user(doc_id, user_email)
    if not permission["status"]:
        await websocket.close(code=4003, reason=permission["message"])
        return
    
    
    client_id = os.urandom(16)
    
    #  ROOM JOIN
    await manager.connect(websocket, doc_id, client_id)
    
    try:
        #  INITIAL SYNC: (DB + current Buffer)
        doc_state = await doc_service.get_document(doc_id, user_email)
        
        if doc_state:
            # GPT, converts this to delta version
            initial_payload = {
                "content": json.loads(doc_state["content"].decode('utf-8')),
                "version": doc_state["version"]
            }
            # Prepend 16-byte dummy header so frontend parser logic remains same
            header = b'\x00' * 16
            full_packet = header + json.dumps(initial_payload).encode('utf-8')
            await websocket.send_bytes(full_packet)

       
        while True:
            data = await websocket.receive_bytes()
            # Prepend the client_id (16 bytes) to the message for Redis
            # This allows the manager to skip the sender during broadcast
            payload = client_id + data
            await redis_client.publish(doc_id, payload)

    except WebSocketDisconnect:
        await manager.disconnect(websocket, doc_id)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        await manager.disconnect(websocket, doc_id)
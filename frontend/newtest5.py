import json
from fastapi import WebSocket, WebSocketDisconnect, Query, FastAPI, Body
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Websockets_handling.ConnectionManager.connection_manager1 import ConnectionManager
from core.dbs.redis_db import redis_client
from repository.document_repo2 import DocumentRepository
from services.document_service3 import DocumentService
from typing import List
import os
from pydantic import BaseModel
from services.mail_service import MailService
from core.dbs.postgres_db1 import get_db_context

app = FastAPI()
repo = DocumentRepository()
mail_service = MailService() # added
doc_service = DocumentService(repo, mail_service) # modified line to include mail_service

manager = ConnectionManager(doc_service)

class SaveRequest(BaseModel):
    doc_id: str
    client_version: int


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import HTTPException, Query
from core.dbs.postgres_db1 import get_db_context

# --- UPDATED DOCUMENT MANAGEMENT ENDPOINTS ---

@app.post("/create")
async def create_document(
    doc_id: str = Query(..., description="Unique ID for the new document"),
    admin_email: str = Query(..., description="Email of the document creator")
):
    """
    Creates a new document using the DocumentService.
    This handles DB entry and triggers any side effects like welcome emails.
    """
    # Calling create_doc from DocumentService as discussed
    result = await doc_service.create_doc(doc_id, admin_email)
    
    if result["status"] == "error":
        # Returns 409 Conflict if doc_id is already taken
        raise HTTPException(status_code=409, detail=result["message"])
        
    return result

@app.get("/open/{doc_id}")
async def open_existing_document(
    doc_id: str,
    user_email: str = Query(..., description="Email of the user attempting to open the doc")
):
    """
    Verifies if a user is allowed to access a document before opening.
    """
    # Permission check via Service
    permission = await doc_service.is_allowed_user(doc_id, user_email)
    
    if not permission["status"]:
        raise HTTPException(status_code=403, detail=permission["message"])
    
    # Pre-load buffer and return current version
    doc_state = await doc_service.get_document(doc_id, user_email)
    if not doc_state:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {"status": "success", "doc_id": doc_id, "version": doc_state["version"]}

@app.get("/my-documents")
async def get_my_documents(
    admin_email: str = Query(..., description="Email of the administrator")
):
    """
    Retrieves all document IDs where the user is an admin.
    """
    async with get_db_context() as db:
        # Direct call to repo for efficient listing
        docs = await repo.get_my_documents(db, admin_email)
        return {"status": "success", "documents": docs}
    
@app.post("/save/{doc_id}")
async def save_document_endpoint(
    doc_id: str, 
    client_version: int = Query(..., description="The version the client currently has")
   #SaveRequest: SaveRequest
):
    """
    Triggers a manual save from the live buffer to the PostgreSQL database.
    """
    result = await doc_service.save_document(doc_id, client_version)
    
    if result["status"] == "outdated":
        # Return a 409 Conflict if the versions don't match
        raise HTTPException(status_code=409, detail=result["message"])
    
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
        
    return result

@app.post("/share/{doc_id}")
async def share_document(
    doc_id: str, 
    user_email: str = Query(..., description="The email of the person making the request"),
    emails_to_add: List[str] = Body(..., description="List of emails to grant access to")
):
    """
    Endpoint to add users to a document's allowed list. 
    Only the document admin can perform this action.
    """
    result = await doc_service.add_to_allowed_users(doc_id, user_email, emails_to_add)
    
    if result["status"] == "error":
        # Handle "Permission denied" or database errors
        status_code = 403 if "Permission denied" in result["message"] else 400
        raise HTTPException(status_code=status_code, detail=result["message"])
        
    return result

@app.delete("/delete/{doc_id}")
async def delete_document(
    doc_id: str, 
    user_email: str = Query(..., description="The email of the person making the request")
):
    
    result = await doc_service.delete_document(doc_id, user_email)
    
    if result["status"] == "error":
        status_code = 403 if "Permission denied" in result["message"] else 400
        raise HTTPException(status_code=status_code, detail=result["message"])
        
    return result

@app.websocket("/ws/{doc_id}")
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
    
    #  Connect to the manager and join the room
    await manager.connect(websocket, doc_id, client_id)
    
    try:
        #  INITIAL SYNC: Fetch the 'merged' state (DB + current Buffer)
        doc_state = await doc_service.get_document(doc_id, user_email)
        
        if doc_state:
            # GPT, converts this to delta version
            initial_payload = {
                "content": json.loads(doc_state["content"].decode('utf-8')),
                "version": doc_state["version"]
            }
            # Prepend 16-byte dummy header so frontend parser logic remains consistent
            header = b'\x00' * 16
            full_packet = header + json.dumps(initial_payload).encode('utf-8')
            await websocket.send_bytes(full_packet)

        # 4. LIVE LOOP: Listen for incoming Deltas from the client
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
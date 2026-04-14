import json
from typing import Dict, List, Optional
from delta import Delta  # pip install quill-delta-python
from sqlalchemy.ext.asyncio import AsyncSession
from core.dbs.postgres_db import get_db_context
from repository.document_repo import DocumentRepository
from .mail_service import MailService
from core.dbs.redis_db import redis_client

class DocumentService:
    def __init__(self, repository: DocumentRepository, mail_service: MailService):
        self.repo = repository
        self.mail_service = mail_service 
        # _buffer's ds : { doc_id: { "content": bytes, "version": int, "allowed_users": [] } }
        #self._buffer: Dict[str, Dict] = {}

    async def _get_redis_key(self, doc_id: str):
        return f"doc_buffer:{doc_id}"


    #async def get_document(self, doc_id: str, user_email: str) -> Optional[Dict]: # GPT
    #    
    #    if doc_id in self._buffer:
    #        state = self._buffer[doc_id]
    #        if user_email in state["allowed_users"]:
    #            return state
    #    
    #    
    #    async with get_db_context() as db:
    #        doc = await self.repo.get_document(db, doc_id)
    #        if not doc or user_email not in doc.allowed_users:
    #            return None
#
    #        
    #        self._buffer[doc_id] = {
    #            "content": doc.content, 
    #            "version": doc.version, 
    #            "allowed_users": doc.allowed_users
    #        }
    #        return self._buffer[doc_id]
    async def get_document(self, doc_id: str, user_email: str) -> Optional[Dict]:
        redis_key = await self._get_redis_key(doc_id)
        
        # 1. Try to fetch from Shared Redis Buffer
        cached_doc = await redis_client.hgetall(redis_key)
        
        if cached_doc:
            # Redis returns bytes, so we decode and parse
            allowed_users = json.loads(cached_doc[b'allowed_users'].decode('utf-8'))
            if user_email in allowed_users:
                return {
                    "content": cached_doc[b'content'], # bytes stay bytes
                    "version": int(cached_doc[b'version']),
                    "allowed_users": allowed_users
                }

        # 2. Fallback to Postgres if not in Redis
        async with get_db_context() as db:
            doc = await self.repo.get_document(db, doc_id)
            if not doc or user_email not in doc.allowed_users:
                return None

            # 3. Initialize the Shared Redis Buffer
            doc_data = {
                "content": doc.content,
                "version": str(doc.version),
                "allowed_users": json.dumps(doc.allowed_users)
            }
            await redis_client.hset(redis_key, mapping=doc_data)
            await redis_client.expire(redis_key, 3600) # Optional: 1-hour TTL
            
            return {
                "content": doc.content,
                "version": doc.version,
                "allowed_users": doc.allowed_users
            }

    #def update_buffer(self, doc_id: str, new_delta_bytes: bytes):  # GPT 
    #    
    #    if doc_id not in self._buffer:
    #        return
#
    #    try:
    #       
    #        current_state_str = self._buffer[doc_id]["content"].decode('utf-8')
    #        current_delta = Delta(json.loads(current_state_str).get("ops", []))
    #        incoming_delta_str = new_delta_bytes.decode('utf-8')
    #        incoming_delta = Delta(json.loads(incoming_delta_str).get("ops", []))
    #        merged_delta = current_delta.compose(incoming_delta)
#
    #        self._buffer[doc_id]["content"] = json.dumps({"ops": merged_delta.ops}).encode('utf-8')
    #       
    #    except Exception as e:
    #        print(f"Error merging delta for {doc_id}: {e}")
    async def update_buffer(self, doc_id: str, delta_bytes: bytes):
        """
        Updates the shared content in Redis.
        """
        redis_key = await self._get_redis_key(doc_id)
        
        # Get current state from Redis
        current_content_bytes = await redis_client.hget(redis_key, "content")
        if not current_content_bytes:
            return # Should have been initialized by get_document

        try:
            # Standard Quill Delta logic
            current_ops = json.loads(current_content_bytes.decode('utf-8'))["ops"]
            incoming_delta = Delta(json.loads(delta_bytes.decode('utf-8'))["ops"])
            
            merged_delta = Delta(current_ops).compose(incoming_delta)
            new_content = json.dumps({"ops": merged_delta.ops}).encode('utf-8')

            # Update ONLY the content field in Redis
            await redis_client.hset(redis_key, "content", new_content)
        except Exception as e:
            print(f"Redis Buffer Update Error: {e}")



    async def create_doc(self, doc_id: str, admin_email: str):
       
        async with get_db_context() as db:
            if await self.repo.document_exists(db, doc_id):
                return {"status": "error", "message": "Document already exists."}

            new_doc = await self.repo.create_document(db, doc_id, admin_email)
            return {
                "status": "success", 
                "doc_id": new_doc.docid, 
                "message": "Document created successfully."
            }
        


    #async def save_document(self, doc_id: str, client_version: int): # VERY IMPORTANT,FROM HERE GPT GAVE THE FULL LOGIC
    #    if doc_id not in self._buffer:                               # Only repo.update_document_content isnt enough
    #        return {"status": "error", "message": "Document not active"}
    #
    #    async with get_db_context() as db:
    #        db_doc = await self.repo.get_document(db, doc_id)
    #        
    #        
    #        if client_version != db_doc.version:    
    #            return {
    #                "status": "outdated", 
    #                "message": "Someone else saved a new version. Please refresh to sync."
    #            }
    #
    #        new_version = db_doc.version + 1
    #        content_to_save = self._buffer[doc_id]["content"]
    #
    #        success = await self.repo.update_document_content(
    #            db, doc_id, content_to_save, new_version 
    #        )
    #
    #        if success:
    #            self._buffer[doc_id]["version"] = new_version
    #            return {
    #                "status": "success", 
    #                "version": new_version, 
    #                "message": f"Successfully saved version {new_version}" # Added message for consistency
    #            }
    #            
    #        return {"status": "error", "message": "Save failed"}
    #async def save_document(self, doc_id: str, client_version: int):
    #    if doc_id not in self._buffer:
    #        return {"status": "error", "message": "Document not active"}
    #
    #    async with get_db_context() as db:
    #        db_doc = await self.repo.get_document(db, doc_id)
    #        
    #        # Use the DB version as the source of truth
    #        if client_version != db_doc.version:
    #            return {
    #                "status": "outdated", 
    #                "version": db_doc.version, # Send back the actual DB version
    #                "message": "Version mismatch."
    #            }
    #
    #        new_version = db_doc.version + 1
    #        content_to_save = self._buffer[doc_id]["content"]
    #
    #        success = await self.repo.update_document_content(
    #            db, doc_id, content_to_save, new_version 
    #        )
    #
    #        if success:
    #            # IMPORTANT: Sync the buffer version immediately after DB success
    #            self._buffer[doc_id]["version"] = new_version
    #            return {
    #                "status": "success", 
    #                "version": new_version, 
    #                "message": f"Saved v{new_version}"
    #            }

    async def save_document(self, doc_id: str, client_version: int):
        redis_key = await self._get_redis_key(doc_id)
        
        # 1. Get latest state from Shared Redis Buffer
        cached_doc = await redis_client.hgetall(redis_key)
        if not cached_doc:
            return {"status": "error", "message": "Document not in active buffer"}

        buffer_version = int(cached_doc[b'version'])
        buffer_content = cached_doc[b'content']

        # 2. Version Guard (Comparing client against shared buffer)
        if client_version != buffer_version:
            return {
                "status": "outdated", 
                "message": f"Version mismatch. Shared buffer is at v{buffer_version}."
            }

        async with get_db_context() as db:
            new_version = buffer_version + 1
            # 3. Persist to Postgres
            success = await self.repo.update_document_content(
                db, doc_id, buffer_content, new_version
            )

            if success:
                # 4. Sync the new version back to Shared Redis
                await redis_client.hset(redis_key, "version", str(new_version))
                return {"status": "success", "version": new_version}
            
            return {"status": "error", "message": "Postgres update failed"}
        
   

    async def delete_document(self, doc_id: str, user_email: str):
       
        async with get_db_context() as db:
            
            if not await self.repo.is_admin(db, doc_id, user_email):
                return {"status": "error", "message": "Permission denied: Only admins can delete documents."}
            
            
            success = await self.repo.delete_document(db, doc_id)
            if success:
                
                if doc_id in self._buffer:
                    del self._buffer[doc_id]
                return {"status": "success", "message": f"Document {doc_id} deleted successfully."}
            
            return {"status": "error", "message": "Failed to delete document from database."}
        
        

    async def add_to_allowed_users(self, doc_id: str, user_email: str, email_list: List[str]):
        
        async with get_db_context() as db:
           
            if not await self.repo.is_admin(db, doc_id, user_email):
                return {"status": "error", "message": "Permission denied: Only admins can add users."}
            success = await self.repo.add_to_allowed_users(db, doc_id, email_list)
            for email in email_list: # added from po
                try:
                    body = f"""
                Step into Collabocalypse!!
                Where every keystroke fuels the storm!!
                Every edit bends reality!!
                Together we script the apocalypse!!
                 http://localhost:5173/ 
                 Open Document -> {doc_id}."""
                    await self.mail_service.send_email_tool(
                        to_email=email,
                        body=body
                    )
                except Exception as e:
                    print(f"Failed to send email to {email}: {e}") # added till here

            if success:   
                if doc_id in self._buffer:
                    updated_users = await self.repo.get_allowed_users(db, doc_id)
                    self._buffer[doc_id]["allowed_users"] = updated_users
                return {"status": "success", "message": "Users added successfully."}
            
            return {"status": "error", "message": "Failed to update allowed users."}
        


    async def is_allowed_user(self, doc_id: str, user_email: str):
       
        if doc_id in self._buffer:
            if user_email in self._buffer[doc_id]["allowed_users"]:
                return {"status": True, "message": "Access granted."}
        
       
        async with get_db_context() as db:
            doc = await self.repo.get_document(db, doc_id)
            if doc and user_email in doc.allowed_users:
                
                return {"status": True, "message": "Access granted."}
                
        return {"status": False, "message": "Access denied: You are not on the allowed list for this document."}
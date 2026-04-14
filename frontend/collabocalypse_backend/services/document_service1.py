import json
from typing import Dict, List, Optional
from delta import Delta  # pip install quill-delta-python
from sqlalchemy.ext.asyncio import AsyncSession
from core.dbs.postgres_db import get_db_context
from repository.document_repo import DocumentRepository
from .mail_service import MailService
from .user_service import UserService
from core.dbs.redis_db import redis_client

class DocumentService:
    def __init__(self, repository: DocumentRepository, mail_service: MailService, user_service: UserService):
        self.repo = repository
        self.mail_service = mail_service 
        self.user_service = user_service
        # self._buffer is removed to support multiple instances via Redis

    async def _get_redis_key(self, doc_id: str):
        return f"doc_buffer:{doc_id}"

    async def get_document(self, doc_id: str, user_email: str) -> Optional[Dict]:
        
       # Fetches the document. Checks shared Redis buffer first, 
       # otherwise loads from Postgres and populates Redis.
        
        redis_key = await self._get_redis_key(doc_id)
        
        # 1. Try to fetch from Redis
        cached_doc = await redis_client.hgetall(redis_key)
        
        if cached_doc:
            # Redis returns bytes; decode allowed_users and version
            allowed_users = json.loads(cached_doc[b'allowed_users'].decode('utf-8'))
            if user_email in allowed_users:
                await self.user_service.update_recent_docs(user_email, doc_id)
                return {
                    "content": cached_doc[b'content'], # binary Quill ops
                    "version": int(cached_doc[b'version']),
                    "allowed_users": allowed_users
                }

      #postgres wala fetch
        async with get_db_context() as db:
            doc = await self.repo.get_document(db, doc_id)
            if not doc or user_email not in doc.allowed_users:
                return None
            print("test")
            await self.user_service.update_recent_docs(user_email, doc_id)
             
            #  Populate Redis 
            doc_data = {
                "content": doc.content,
                "version": str(doc.version),
                "allowed_users": json.dumps(doc.allowed_users)
            }
            await redis_client.hset(redis_key, mapping=doc_data)
            await redis_client.expire(redis_key, 3600) # 1 hour TTL for active docs
            
            return {
                "content": doc.content,
                "version": doc.version,
                "allowed_users": doc.allowed_users
            }

    async def update_buffer(self, doc_id: str, delta_bytes: bytes):
       
        redis_key = await self._get_redis_key(doc_id)
        current_content_bytes = await redis_client.hget(redis_key, "content")
        
        if not current_content_bytes:
            return

        try:
            # Parse existing state and incoming delta
            current_ops = json.loads(current_content_bytes.decode('utf-8'))["ops"]
            incoming_payload = json.loads(delta_bytes.decode('utf-8'))
            incoming_delta = Delta(incoming_payload["ops"])
            
            merged_delta = Delta(current_ops).compose(incoming_delta)
            new_content = json.dumps({"ops": merged_delta.ops}).encode('utf-8')

            await redis_client.hset(redis_key, "content", new_content)
        except Exception as e:
            print(f"Redis merge error for {doc_id}: {e}")

    async def save_document(self, doc_id: str, client_version: int, user_email: str) -> Dict:
        
        redis_key = await self._get_redis_key(doc_id)
        cached_doc = await redis_client.hgetall(redis_key)
        
        if not cached_doc:
            return {"status": "error", "message": "Document not active in buffer"}

        buffer_version = int(cached_doc[b'version'])
        buffer_content = cached_doc[b'content']

        # Version Guard: Compare client version with the Shared Buffer version
        if client_version != buffer_version:
            return {
                "status": "outdated", 
                "version": buffer_version,
                "message": "Version mismatch. Your client is behind the shared buffer."
            }

        async with get_db_context() as db:
            new_version = buffer_version + 1
            success = await self.repo.update_document_content(
                db, doc_id, buffer_content, new_version, user_email
            )

            if success[0]:
                # Sync new version back to Redis so all instances see the increment
                await redis_client.hset(redis_key, "version", str(new_version))
                return {"status": "success", "version": new_version , "updated_by": user_email, "updated_at": success[1]}
            
            return {"status": "error", "message": "Failed to update database."}

    async def create_doc(self, doc_id: str, admin_email: str):
        """Creates a doc in DB. Redis will be populated on first 'open'."""
        async with get_db_context() as db:
            if await self.repo.document_exists(db, doc_id):
                return {"status": "error", "message": "Document ID already taken."}
            
            await self.repo.create_document(db, doc_id, admin_email)
            await self.user_service.update_recent_docs(admin_email, doc_id)
            return {"status": "success", "doc_id": doc_id}

    async def add_to_allowed_users(self, doc_id: str, user_email: str, emails_to_add: List[str]):
        """Updates permissions in DB and syncs the Redis buffer."""
        async with get_db_context() as db:
            if not await self.repo.is_admin(db, doc_id, user_email):
                return {"status": "error", "message": "Permission denied: Only admins can share."}

            success = await self.repo.add_to_allowed_users(db, doc_id, emails_to_add)

            # Update the Redis buffer list so existing sessions recognize new users
            redis_key = await self._get_redis_key(doc_id)
            updated_users = await self.repo.get_allowed_users(db, doc_id)
            await redis_client.hset(redis_key, "allowed_users", json.dumps(updated_users))

            # invitation emails
            for email in emails_to_add:
                try:
                    await self.mail_service.send_email_tool(
                        to_email=email,
                        body=f"You've been invited to collaborate on {doc_id}: http://localhost:5173/"
                    )
                except Exception as e:
                    print(f"Invitation mail error to {email}: {e}")

            return {"status": "success", "message": "Users added and synced."}

    async def is_allowed_user(self, doc_id: str, user_email: str):
        """Checks shared Redis buffer for permissions, falling back to DB."""
        redis_key = await self._get_redis_key(doc_id)
        allowed_users_bytes = await redis_client.hget(redis_key, "allowed_users")
        
        if allowed_users_bytes:
            allowed_users = json.loads(allowed_users_bytes.decode('utf-8'))
            if user_email in allowed_users:
                return {"status": True, "message": "Access granted via Buffer."}
        
        async with get_db_context() as db:
            doc = await self.repo.get_document(db, doc_id)
            if doc and user_email in doc.allowed_users:
                return {"status": True, "message": "Access granted via DB."}
                
        return {"status": False, "message": "Access denied."}
    
    async def clear_buffer(self, doc_id: str):
          redis_key = await self._get_redis_key(doc_id)
          await redis_client.delete(redis_key)

    async def delete_document(self, doc_id: str, user_email: str):
        """Deletes from DB and immediately clears the Redis buffer."""
        async with get_db_context() as db:
            if not await self.repo.is_admin(db, doc_id, user_email):
                return {"status": "error", "message": "Permission denied."}
                
            success = await self.repo.delete_document(db, doc_id)
            if success:
                await self.clear_buffer(doc_id) # Efficiency: Clear Redis immediately
                return {"status": "success"}
            return {"status": "error", "message": "Delete failed."}
    async def get_updates_info(self, doc_id: str):
        async with get_db_context() as db:
            res = await self.repo.get_updates_info(db, doc_id)
            return res
        
    async def search(self, doc_id:str):
        async with get_db_context() as db:
            res  = await self.repo.get_document(db, doc_id)
            return res
    
    
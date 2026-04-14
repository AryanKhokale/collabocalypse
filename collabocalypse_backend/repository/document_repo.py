import json
from sqlalchemy import select, update, insert, delete
from sqlalchemy.ext.asyncio import AsyncSession
from model.document import Document 

class DocumentRepository:
    def __init__(self):
        self.model = Document

    async def get_document(self, db: AsyncSession, docid: str):
        
        query = select(self.model).where(self.model.docid == docid)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_document(self, db: AsyncSession, docid: str, admin_email: str = None, folder_type: str = 'Workspace'):  
        initial_content = json.dumps({"ops": [{"insert": "\n"}]}).encode('utf-8') # GPT added this line as the empty doc was causing issues
        new_doc = self.model(
            docid=docid,
            admin_email=admin_email,
            allowed_users=[admin_email],
            version=0,
            content=initial_content, # Initializing with empty bytes for Quill
            updated_by=admin_email,
            folder = folder_type
        )
        db.add(new_doc)
        await db.commit()
        await db.refresh(new_doc)
        return new_doc
    

    async def update_document_content(self, db: AsyncSession, docid: str, content: bytes, version: int, user_email: str) -> bool:    
        query = (
            update(self.model)
            .where(self.model.docid == docid)
            .where(self.model.version < version) # Version Guard
            .values(content=content, version=version, updated_by=user_email)
        )
        query1 = select(self.model.updated_at).where(self.model.docid == docid)
        result = await db.execute(query)
        result1 = await db.execute(query1)
        await db.commit()
        return result.rowcount > 0, result1.scalar_one_or_none()
    

    async def document_exists(self, db: AsyncSession, docid: str) -> bool:
        query = select(self.model.docid).where(self.model.docid == docid)
        result = await db.execute(query)
        return result.scalar_one_or_none() is not None
    


    async def is_admin(self, db: AsyncSession, docid: str, user_email: str) -> bool:
        query = select(self.model.admin_email).where(self.model.docid == docid)
        result = await db.execute(query)
        admin_email = result.scalar_one_or_none()
        return admin_email == user_email
    

    async def delete_document(self, db: AsyncSession, docid: str) -> bool:
        query = delete(self.model).where(self.model.docid == docid)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
    

    async def get_allowed_users(self, db: AsyncSession, docid: str) -> list:
        query = select(self.model.allowed_users).where(self.model.docid == docid)
        result = await db.execute(query)
        allowed_users = result.scalar_one_or_none()
        return allowed_users if allowed_users is not None else [] 
    


    async def add_to_allowed_users(self, db: AsyncSession, docid: str, email_list: list): 
        current_users = await self.get_allowed_users(db, docid) 
        updated_list = list(set(current_users + email_list)) # turned to set bcaz it will remove the duplicate emails 
        query = (
            update(self.model)
            .where(self.model.docid == docid)
            .values(allowed_users=updated_list)
        )
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
    

    
    async def get_my_documents(self, db: AsyncSession, user_email: str) -> list:
        query = (
            select(
                self.model.docid,
                self.model.updated_at,
                self.model.allowed_users,
                self.model.updated_by
            )
            .where(self.model.admin_email == user_email)
        )
        
        result = await db.execute(query)
        
        return [
            {
                "docid": docid,
                "updated_at": updated_at.isoformat() if updated_at else None,
                "allowed_users": allowed_users or [],  # fallback if None
                "updated_by": updated_by
            }
            for docid, updated_at, allowed_users, updated_by in result.all()
        ]
    
    async def get_updates_info(self, db: AsyncSession, docid: str) -> list:
        query = (
            select(
                self.model.updated_at,
                self.model.updated_by
            )
            .where(self.model.docid == docid)
        )
        
        result = await db.execute(query)
        row = result.first()

        if row:
            return {
                "updated_at": row.updated_at,
                "updated_by": row.updated_by
            }
        
        return "Document doesnt exists!"
    
        
       # return [
       #     {
       #         "docid": docid,
       #         "updated_at": updated_at.isoformat() if updated_at else None,
       #         "updated_by": updated_by  # fallback if None
       #     }
       #     for docid, updated_at, allowed_users in result.all()
       # ]
#
    
    #async def get_recent_docs_pointer(self, db: AsyncSession, docid: str) -> int:
    #    """
    #    Fetches the current recent_docs_pointer for a specific document.
    #    Returns 0 if the document is not found.
    #    """
    #    query = select(self.model.recent_docs_pointer).where(self.model.docid == docid)
    #    result = await db.execute(query)
    #    pointer = result.scalar_one_or_none()
    #    return pointer if pointer is not None else 0
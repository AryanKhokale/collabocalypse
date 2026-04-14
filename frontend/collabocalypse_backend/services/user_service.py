from sqlalchemy.ext.asyncio import AsyncSession
from repository.user_repo import UserRepository
from repository.document_repo import DocumentRepository
from core.dbs.postgres_db import get_db_context

class UserService:
    def __init__(self, user_repo: UserRepository, repo : DocumentRepository):
        self.user_repo = user_repo
        self.repo = repo

    async def get_my_documents(self, admin_email: str):
        """Fetches the list of documents administered by the user."""
        async with get_db_context() as db:
            docs = await self.repo.get_my_documents(db, admin_email)
            return {"status": "success", "documents": docs}

    async def update_recent_docs(self, user_email: str, doc_id: str):
        """
        Coordinates the update of a user's recent documents list.
        This function handles the database session and calls the repository logic.
        """
        print("123")
        async with get_db_context() as db:
            
            user = await self.user_repo.get_user(db, user_email)
            if not user:
                print("Creating new user entry")
                user = await self.user_repo.create_user(db, user_email)

            current_recent_docs = list(user.recent_docs)
            pointer = user.recent_docs_pointer

            if doc_id in current_recent_docs:
                return {"status": "success", "message": "Doc already in recents"}

            #  Circular Buffer Logic:
            # Round Robin  --> 0 1 2 3 4 0 1 2 3 4 0 ...
           
            if len(current_recent_docs) < 5:
                current_recent_docs.append(doc_id)
            else:
                current_recent_docs[pointer] = doc_id

            #  Increment pointer 
            new_pointer = (pointer + 1) % 5

            
            success = await self.user_repo.update_recent_docs(
                db, 
                user_email, 
                current_recent_docs, 
                new_pointer
            )

            if success:
                return {"status": "success", "recent_docs": current_recent_docs}
            return {"status": "error", "message": "Failed to update recent docs"}

    async def get_user_recents(self, user_email: str):
        
        async with get_db_context() as db:
            docs = await self.user_repo.get_recent_docs(db, user_email)
            return {"status": "success", "recent_docs": docs}
        
    async def add_to_workspace(self, user_email: str, docid: str, folder: str = 'workspace'):
       
        async with get_db_context() as db:
            success = await self.user_repo.add_to_workspace(db, user_email, docid, folder)
            if success:
                return {"status": "success", "message": f"Document {docid} added to {folder}"}
            return {"status": "error", "message": "Failed to add document to workspace"}
    
    async def user_notes(self, admin_email: str, notes: str):
        async with get_db_context() as db:
            return await self.user_repo.user_notes(db, admin_email, notes)
        
    async def get_user_notes(self, user_email: str):
        async with get_db_context() as db:
            user = await self.user_repo.get_user(db, user_email)
            
            return user.notes
        
    async def get_user_workspace(self, user_email: str):
        async with get_db_context() as db:
            user = await self.user_repo.get_user(db, user_email)
            
            return user.folder_types
    
    async def remove_from_workspace(self, user_email: str, docid: str):
        
        async with get_db_context() as db:
            success = await self.user_repo.remove_from_workspace(db, user_email, docid)
            if success:
                return {"status": "success", "message": f"Document {docid} removed from workspace"}
            return {"status": "error", "message": "Failed to remove document from workspace"}
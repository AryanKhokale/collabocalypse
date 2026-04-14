from typing import List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from model.user import CollabocalypseUser # Assuming your model is in model/user.py

class UserRepository:
    def __init__(self):
        self.model = CollabocalypseUser

    async def get_user(self, db: AsyncSession, user_email: str):
        query = select(self.model).where(self.model.user_email == user_email)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_user(self, db: AsyncSession, user_email: str):
        new_user = self.model(
            user_email=user_email,
            recent_docs=[],
            recent_docs_pointer=0,
            notes = '',
            folder_types = {}
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    #async def update_recent_docs(self, db: AsyncSession, user_email: str, doc_id: str):
    #    """
    #    Updates the circular buffer of recent documents for a user.
    #    If the document is already in the list, it does nothing to avoid duplicates.
    #    """
    #    user = await self.get_user(db, user_email)
    #    
    #    # 1. Create user entry if it's their first time interacting with the system
    #    if not user:
    #        user = await self.create_user(db, user_email)
    #    
    #    current_docs = list(user.recent_docs)
    #    pointer = user.recent_docs_pointer
#
    #    # 2. Avoid duplicates in the 'Recent' list
    #    if doc_id in current_docs:
    #        return True
#
    #    # 3. Circular Buffer Logic
    #    # If list is not full, just append. If full, overwrite at the pointer.
    #    if len(current_docs) < 5:
    #        current_docs.append(doc_id)
    #    else:
    #        current_docs[pointer] = doc_id
    #    
    #    # 4. Move pointer to the next slot (wrap around 0-4)
    #    new_pointer = (pointer + 1) % 5
#
    #    query = (
    #        update(self.model)
    #        .where(self.model.user_email == user_email)
    #        .values(recent_docs=current_docs, recent_docs_pointer=new_pointer)
    #    )
    #    await db.execute(query)
    #    await db.commit()
    #    return True
#
    async def get_recent_docs(self, db: AsyncSession, user_email: str):
        user = await self.get_user(db, user_email)
        if user:
            return user.recent_docs
        return []
    
    async def update_recent_docs(self, db: AsyncSession, user_email: str, current_recent_docs: List[str], new_pointer: int):
        query = (
            update(self.model)
            .where(self.model.user_email == user_email)
            .values(recent_docs=current_recent_docs, recent_docs_pointer=new_pointer)
        )
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
    
    async def add_to_workspace(self, db: AsyncSession, user_email: str, docid: str, folder: str = 'workspace'):
        user = await self.get_user(db, user_email)
        ft = user.folder_types or {}
        if ft is None:
            ft[docid] = folder
        else:
            ft[docid] = folder
        query = (
            update(self.model)
            .where(self.model.user_email == user_email)
            .values(folder_types=ft)
        )
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
    
    async def user_notes(self, db: AsyncSession, user_email: str, notes: str):
        query = (
            update(self.model)
            .where(self.model.user_email == user_email)
            .values(notes=notes)
        )
        
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
    
    async def remove_from_workspace(self, db: AsyncSession, user_email: str, docid: str):
        user = await self.get_user(db, user_email)
        ft = user.folder_types or {}
        if docid in ft:
            del ft[docid]
        
        query = (
            update(self.model)
            .where(self.model.user_email == user_email)
            .values(folder_types=ft)
        )
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0
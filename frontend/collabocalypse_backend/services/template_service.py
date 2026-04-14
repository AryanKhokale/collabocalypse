from sqlalchemy.ext.asyncio import AsyncSession
from core.dbs.postgres_db import get_db_context
from repository.template_repo import TemplateRepository
#from core.DEPENDECIES.dependencies import templ_repo


class TemplateService:
    def __init__(self, repository : TemplateRepository):
        self.repo = repository
        
    
    async def create_with_template(self, template_name: str, doc_id: str, admin_email: str) -> bool:
        async with get_db_context() as db:
             result = await self.repo.create_with_template(db, template_name, doc_id , admin_email)
             if result:
                 return {"status": "success", "doc_id": doc_id}
             else:
                 return {"status": "error", "message": "Document ID already exists"}
                 #raise HTTPException(status_code=409, detail="Document ID already exists")
    
    async def get_all_templates(self) :
        async with get_db_context() as db:
             result = await self.repo.get_all_templates(db)
             return result

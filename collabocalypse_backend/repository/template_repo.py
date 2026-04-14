from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from model.document import Document
from model.template import Template # Assuming Template model is in model/template.py

class TemplateRepository:
    def __init__(self):
        self.doc_model = Document
        self.template_model = Template

    async def create_with_template(
        self, 
        db: AsyncSession, 
        templ_name: str, 
        docid: str, 
        admin_email: str
    ) -> bool:
        # Fetch the template content
        templ_query = select(self.template_model.templ_content).where(
            self.template_model.templ_name == templ_name
        )
        templ_result = await db.execute(templ_query)
        templ_content = templ_result.scalar_one_or_none()

        if templ_content is None:
            return False

        #  Create the new document using the template content
        new_doc = self.doc_model(
            docid=docid,
            admin_email=admin_email,
            allowed_users=[admin_email],
            version=0,
            content=templ_content, # Content comes from the template
            updated_by=admin_email
        )

        try:
            db.add(new_doc)
            await db.commit()
            await db.refresh(new_doc)
            return True
        except Exception:
            await db.rollback()
            return False

    async def get_all_templates(self, db: AsyncSession):
        query = select(self.template_model.templ_name)
        result = await db.execute(query)
        return result.scalars().all()
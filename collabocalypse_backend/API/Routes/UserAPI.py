from fastapi import Query, APIRouter, Depends
from Websockets_handling.ConnectionManager.connection_manager import ConnectionManager
from repository.document_repo import DocumentRepository
from services.document_service import DocumentService
from services.mail_service import MailService
from core.dbs.postgres_db import get_db_context
from Authentication.Verification import verify_token
from fastapi.security import HTTPBearer
from core.DEPENDECIES.dependencies import repo, mail_service, doc_service, manager, users_service

security = HTTPBearer()
user_router = APIRouter()
#repo = DocumentRepository()
#mail_service = MailService() # added
#doc_service = DocumentService(repo, mail_service) # modified line to include mail_service
#manager = ConnectionManager(doc_service)



@user_router.get("/user/me")
async def get_user_details(credentials=Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    
    #await users_service.update_recent_docs(payload.get("email"), doc_id)
    return {
        "user_name": payload.get("name", "Unknown User"),
        "user_email": payload.get("email", "No Email"),
        "preferred_username": payload.get("preferred_username")
    }

@user_router.get("/my-documents")
async def get_my_documents(
    admin_email: str = Query(..., description="Email of the administrator")
):
    
     docs = await users_service.get_my_documents(admin_email)
     
     print(docs)
     #print(docs)
     #return {"status": "success", "documents": docs['documents']}
     return docs
    
    #async with get_db_context() as db:
    #    # only for 'my_documents', i am using repo directly
    #    docs = await repo.get_my_documents(db, admin_email)
    #    recent_docs = await users_service.get_user_recents( admin_email)
    #    print(docs)
    #    print(recent_docs["recent_docs"])
    #    #return {"status": "success", "documents": docs}
    #    return {"status": "success", "documents": recent_docs["recent_docs"]}
    

@user_router.get("/my-recent-documents")
async def get_my_recent_documents(
    admin_email: str = Query(..., description="Email of the administrator")
):
        recent_docs = await users_service.get_user_recents( admin_email)
        return recent_docs


@user_router.post("/add-to-workspace")
async def add_to_workspace(user_email: str, docid: str, folder: str = 'workspace'):
       
       suc = await users_service.add_to_workspace(user_email, docid, folder)
       return suc
    
@user_router.post("/user-notes")
async def add_user_notes(user_email: str, notes: str):
    result = await users_service.user_notes(user_email, notes)
    return result

@user_router.get("/user-notes")
async def get_user_notes(user_email: str):
    user = await users_service.get_user_notes(user_email)
    return user

@user_router.get("/user-folders")
async def get_user_folders(user_email: str):
    folders = await users_service.get_user_workspace(user_email)
    return folders

@user_router.post("/remove-from-workspace")
async def remove_from_workspace(user_email: str, docid: str):
    result = await users_service.remove_from_workspace(user_email, docid)
    return result
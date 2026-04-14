from fastapi import  Query, Body, APIRouter, HTTPException
#from Websockets_handling.ConnectionManager.connection_manager import ConnectionManager
#from repository.document_repo import DocumentRepository
#from services.document_service import DocumentService
from typing import List
#from services.mail_service import MailService
from core.DEPENDECIES.dependencies import doc_service, manager,  templ_service, users_service
from core.dbs.postgres_db import get_db_context

doc_router = APIRouter()
#repo = DocumentRepository()
#mail_service = MailService() # added
#doc_service = DocumentService(repo, mail_service) # modified line to include mail_service
#manager = ConnectionManager(doc_service)

@doc_router.post("/create")
async def create_document(
    doc_id: str = Query(..., description="Unique ID for the new document"),
    admin_email: str = Query(..., description="Email of the document creator")
): #return {"status": "success", "doc_id": doc_id}
    #result = await templ_repo.create_with_template('Letter', doc_id , admin_email)
    result = await doc_service.create_doc( doc_id , admin_email)
    #result = await templ_service.create_with_template( 'Letter', doc_id , admin_email)
    #if result["status"] == "error":
    #    # Returns 409 Conflict if doc_id is already taken
    #    raise HTTPException(status_code=409, detail=result["message"])
    #return result
    if result["status"] == "error":
        # Returns 409 Conflict if doc_id is already taken
        raise HTTPException(status_code=409, detail=result["message"])      
    return result

@doc_router.post("/create_with_template")
async def create_document_with_template(
    doc_id: str = Query(..., description="Unique ID for the new document"),
    admin_email: str = Query(..., description="Email of the document creator"),
    temp_type: str = Query(..., description="template of the document")
): 
    result = await templ_service.create_with_template( temp_type, doc_id , admin_email)
    if result["status"] == "error":
        # Returns 409 Conflict if doc_id is already taken
        raise HTTPException(status_code=409, detail=result["message"])      
    return result


@doc_router.get("/open/{doc_id}")
async def open_existing_document(
    doc_id: str,
    user_email: str = Query(..., description="Email of the user attempting to open the doc")
):
    # permission check
    permission = await doc_service.is_allowed_user(doc_id, user_email)
    
    if not permission["status"]:
        raise HTTPException(status_code=403, detail=permission["message"])
    
   
    doc_state = await doc_service.get_document(doc_id, user_email)
    if not doc_state:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {"status": "success", "doc_id": doc_id, "version": doc_state["version"]}


    
@doc_router.post("/save/{doc_id}")
async def save_document_endpoint(
    doc_id: str, 
    client_version: int = Query(..., description="The version the client currently has"),
    user_email: str = Query(..., description="The email of the person making the save request")
   #SaveRequest: SaveRequest
):

    result = await doc_service.save_document(doc_id, client_version, user_email)
    
    if result["status"] == "outdated":
        # Return a 409 Conflict if the versions don't match
        raise HTTPException(status_code=409, detail=result["message"])
    
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    
    print(result)
        
    return result

@doc_router.post("/share/{doc_id}")
async def share_document(
    doc_id: str, 
    user_email: str = Query(..., description="The email of the person making the request"),
    emails_to_add: List[str] = Body(..., description="List of emails to grant access to")
):
    result = await doc_service.add_to_allowed_users(doc_id, user_email, emails_to_add)
    
    if result["status"] == "error":
        # Handled "Permission denied" or database errors
        status_code = 403 if "Permission denied" in result["message"] else 400
        raise HTTPException(status_code=status_code, detail=result["message"])
        
    return result

#@doc_router.delete("/delete/{doc_id}")
#async def delete_document(
#    doc_id: str, 
#    user_email: str = Query(..., description="The email of the person making the request")
#):   
#    result = await doc_service.delete_document(doc_id, user_email)
#    if result["status"] == "error":
#        status_code = 403 if "Permission denied" in result["message"] else 400
#        raise HTTPException(status_code=status_code, detail=result["message"])
#        
#    return result
@doc_router.delete("/delete/{doc_id}")
async def delete_document(doc_id: str, user_email: str = Query(...)):
    # This now handles both Postgres and Redis cleanup
    result = await doc_service.delete_document(doc_id, user_email)
    if result["status"] == "error":
        raise HTTPException(status_code=403, detail=result["message"])
    return result

@doc_router.get("/all-templates")
async def get_all_templ():
    # This now handles both Postgres and Redis cleanup
    result = await templ_service.get_all_templates()
    return result

@doc_router.get("/get-updates-info")
async def delete_document(doc_id: str):
    res = await doc_service.get_updates_info(doc_id)
    return res

@doc_router.get("/search")
async def search(doc_id: str):
    res = await doc_service.search(doc_id)
    return res



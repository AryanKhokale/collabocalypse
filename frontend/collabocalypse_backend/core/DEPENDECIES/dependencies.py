from repository.document_repo import DocumentRepository
from repository.user_repo import UserRepository
from repository.template_repo import TemplateRepository
from services.document_service1 import DocumentService
from services.mail_service import MailService
from services.user_service import UserService
from services.template_service import TemplateService
from Websockets_handling.ConnectionManager.connection_manager import ConnectionManager


repo = DocumentRepository()
users_repo = UserRepository()
templ_repo = TemplateRepository()
mail_service = MailService()
templ_service = TemplateService(templ_repo)
users_service = UserService(users_repo, repo)
doc_service = DocumentService(repo, mail_service, users_service)
manager = ConnectionManager(doc_service)

#THE ERROR WAS SAME AS I HAD BEFORE, REDDISLISTENER WALA, I had instantiated all the classes in every file, thereby causing the creation of different instances rather than using the same instance.
#BY CREATING A SINGLE INSTANCE IN DEPENDENCIES AND IMPORTING IT EVERYWHERE, THE PROBLEM IS SOLVED.
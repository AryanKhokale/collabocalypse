

from fastapi.middleware.cors import CORSMiddleware

def cors_middlewares(app):
    
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    
     # Note -: i have allowed all the origins here, IF I HAVE TO ALLOW ALL THE ORIGINS THEN I HAVE TO MAKE "allow_credentials = False" caz
     #         browser wont allow all the origins if its "True".

     # Note -: after i add my allowed origins in the params then I MUST MAKE "allow_credentials = True".
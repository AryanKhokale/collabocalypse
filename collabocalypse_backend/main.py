from fastapi import FastAPI
from API.Routes.DocumentAPI import doc_router
from API.Routes.UserAPI import user_router
from API.Routes.RealTimeSyncAPI  import sync_router
from API.Middlewares.CORS import cors_middlewares


app = FastAPI() 

cors_middlewares(app)

app.include_router(doc_router)
app.include_router(user_router)
app.include_router(sync_router)

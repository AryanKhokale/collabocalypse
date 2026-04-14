from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KEYCLOAK_URL = "http://localhost:9000"
REALM = "Myapp"
CLIENT_ID = "quill-client"

# Fetch public key once for verification
keycloak_cert_url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"
jwks = requests.get(keycloak_cert_url).json()

def verify_token(token: str):
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks["keys"] if k["kid"] == header["kid"])

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience="backend-api", # Ensure this matches your Keycloak client audience
            options={"verify_exp": True},
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/user/me")
async def get_user_details(credentials=Depends(security)):
    """
    Verifies the token and returns user identity details.
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    # Keycloak typically stores name in 'name' and email in 'email'
    return {
        "user_name": payload.get("name", "Unknown User"),
        "user_email": payload.get("email", "No Email"),
        "preferred_username": payload.get("preferred_username")
    }
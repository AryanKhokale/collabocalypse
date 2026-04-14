from fastapi import  HTTPException
from jose import jwt
import requests

KEYCLOAK_URL = "http://host.docker.internal:9000" #http://host.docker.internal:9000
REALM = "Myapp"
#REALM = "COLLABOCALYPSE"
CLIENT_ID = "quill-client"

#  public key once for verification
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
            audience="backend-api", #  Keycloak client audience
            options={"verify_exp": True},
        )
        print("Token is valid. Payload:", payload)
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

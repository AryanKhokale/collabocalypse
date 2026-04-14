import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    REDIS_URL = os.getenv("REDIS_URL")
    PASSWORD = os.getenv("PASSWORD")

settings = Settings()
#print(f"DATABASE_URL={settings.DATABASE_URL}, REDIS_URL={settings.REDIS_URL}")

#from sqlalchemy import create_engine
# postgres_db.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from contextlib import asynccontextmanager
from core.config import settings

# 1. Create the Async Engine
# Using the DATABASE_URL from your settings
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# 2. Setup the Session Factory
# expire_on_commit=False is important for async to prevent errors when accessing attributes after commit
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 3. Base class for your Document model
class Base(DeclarativeBase):
    pass
# 4. Dependency for standard FastAPI HTTP routes (@app.get, @app.post)
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# 5. Context Manager for WebSockets (use this inside your 'while True' loops)
@asynccontextmanager
async def get_db_context():
    async with AsyncSessionLocal() as session:
        yield session

#"postgresql+asyncpg://user:password@localhost:5433/collabocalypse_db"
#postgresql+asyncpg://user:password@host.docker.internal:5433/collabocalypse_db

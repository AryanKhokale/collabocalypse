from sqlalchemy import ARRAY, Column, Text, Integer, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from core.dbs.postgres_db import Base

class CollabocalypseUser(Base):
    __tablename__ = "collabocalypse_users"

    user_email = Column(Text, primary_key=True, unique=True)

    recent_docs = Column(ARRAY(Text), default=[], server_default="{}")

    # Pointer to next position in recent_docs array for circular queue behavior
    recent_docs_pointer = Column(Integer, default=0, nullable=True)

   
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    notes = Column(Text,  nullable=True)
    folder_types = Column(JSONB, nullable=True)
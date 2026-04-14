from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import BYTEA
from core.dbs.postgres_db import Base

class Template(Base):
    __tablename__ = "templates"

    templ_name = Column(Text, primary_key=True, unique=True)
    
    templ_content = Column(BYTEA, nullable=True, default=b"")
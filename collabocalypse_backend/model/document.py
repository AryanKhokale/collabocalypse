from sqlalchemy import ARRAY, Column, Integer, Text, BigInteger, TIMESTAMP, LargeBinary
from sqlalchemy.dialects.postgresql import BYTEA
from sqlalchemy.sql import func
from core.dbs.postgres_db import Base

class Document(Base):
    __tablename__ = "new_documents"

    docid = Column(Text, primary_key=True, unique=True)
    version = Column(BigInteger, nullable=False, default=0)
    content = Column(BYTEA, nullable=True, default=b"")
    admin_email = Column(Text, nullable=True)
    allowed_users = Column(ARRAY(Text), default=[], server_default="{}")
    #allowed_users = Column(ARRAY(Text).with_variant(Text, "sqlite"), default=[]) // GPT suggested but relatively complex to use
    updated_by = Column(Text, nullable=True)

    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    folder = Column(Text, nullable=True)

    #recent_docs = Column(ARRAY(Text), default=[], server_default="{}")
#
    ## NEW: Pointer for the circular buffer logic (0 to 4)
    #recent_docs_pointer = Column(Integer, default=0, nullable=True)

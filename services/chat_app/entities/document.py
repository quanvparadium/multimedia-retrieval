import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from connections.postgres import psg_manager
from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from pgvector.sqlalchemy import Vector


class Document(psg_manager.Base):
    __tablename__ = 'documents'

    id = Column(Integer, autoincrement=True, primary_key=True)
    file_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    format = Column(String, nullable=False)
    
    collection_id = Column(String, nullable=True)
    store = Column(String, nullable=False, default='local')
    address = Column(String, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    
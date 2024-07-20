import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import Column, Integer, String, TIMESTAMP, func
from entities import Data

class Document(Data):
    __tablename__ = 'documents'

    id = Column(Integer, autoincrement=True, primary_key=True)
    userId = Column(String, nullable=False)
    author = Column(String, nullable=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    format = Column(String, nullable=False)
    
    createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from connections.postgres import psg_manager
from sqlalchemy import Column, Integer, Float, String, func, TIMESTAMP, JSON
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.hybrid import hybrid_method
    
class Keyframe(psg_manager.Base):
    __tablename__ = 'keyframes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    format = Column(String, nullable=False)
    
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    frame_number = Column(Integer, nullable=True)
    byte_offset = Column(Float, nullable=True)
    frame_second = Column(Float, nullable=True)
    
    embedding = Column(Vector(256), nullable=True)  # Allow null values
    ocr = Column(JSON, nullable=True)
    store = Column(String, nullable=False, default='local')
    address = Column(String, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    
    @hybrid_method
    def distance(self, query_vector):
        query_vector_str = f"[{','.join(map(str, query_vector))}]"
        return (func.sum((self.embedding - query_vector) * (self.embedding - query_vector)))
    
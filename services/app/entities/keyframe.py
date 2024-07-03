import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from connections.postgres import psg_manager
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
    
class Keyframe(psg_manager.Base):
    __tablename__ = 'keyframes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    embedding = Column(Vector(256), nullable=True)  # Allow null values
    store = Column(String, nullable=False)
    address = Column(String, nullable=False)
    dataId = Column(Integer, ForeignKey('data.id'), nullable=False)

    data = relationship("Data", back_populates="keyframes")
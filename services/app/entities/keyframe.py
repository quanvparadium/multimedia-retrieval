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
    video_id = Column(Integer, ForeignKey('videos.id'), nullable=False)
    path = Column(String, nullable=False)
    embedding = Column(Vector(256))
    video = relationship("Video", back_populates="keyframes")
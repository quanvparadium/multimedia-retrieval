import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from connections.postgres import psg_manager

from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Data(psg_manager.Base):
    __tablename__ = 'data'

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    userId = Column(Integer, ForeignKey('users.id'), nullable=False)
    fileName = Column(String, nullable=False)
    size = Column(BigInteger, nullable=False)
    store = Column(String, nullable=False)
    address = Column(String, nullable=False)

    user = relationship("User", back_populates="data")
    keyframes = relationship("Keyframe", back_populates="data")

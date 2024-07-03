import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from connections.postgres import psg_manager

from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(psg_manager.Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    balance = Column(Integer, nullable=False, default= 0)
    createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    password = Column(String, nullable=False)

    data = relationship("Data", back_populates="user")
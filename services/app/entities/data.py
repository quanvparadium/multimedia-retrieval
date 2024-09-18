import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from connections.postgres import psg_manager

from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# class Data(psg_manager.Base):
#     __abstract__ = True

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     type = Column(String, nullable=False)
#     status = Column(String, nullable=False)
#     createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
#     updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
#     userId = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
#     fileName = Column(String, nullable=False)
#     size = Column(BigInteger, nullable=False)
#     store = Column(String, nullable=False)
#     address = Column(String, nullable=False)

# class Video(Data):
#     __tablename__ = 'videos'
    
#     id = Column(Integer, ForeignKey('data.id'), primary_key=True)
#     duration = Column(Integer, nullable=True)
#     width = Column(Integer, nullable=True)
#     height = Column(Integer, nullable=True)
#     keyframes = relationship("Keyframe", back_populates="video", cascade="all, delete-orphan")
#     user = relationship("User", back_populates="videos")
    
# class Document(Data):
#     __tablename__ = 'documents'

#     id = Column(Integer, ForeignKey('data.id'), primary_key=True)
#     format = Column(String, nullable=True)
#     author = Column(String, nullable=True)
#     user = relationship("User", back_populates="documents")
    
# class User(psg_manager.Base):
#     __tablename__ = 'users'

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     name = Column(String, nullable=False)
#     email = Column(String, nullable=False)
#     balance = Column(Integer, nullable=False)
#     createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
#     updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
#     password = Column(String, nullable=False)

#     documents = relationship("Document", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
#     videos = relationship("Video", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)


# Document.user = relationship("User", back_populates="documents")
# Video.user = relationship("User", back_populates="videos")


from sqlalchemy import Column, Integer, String, Boolean, BigInteger, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from connections.postgres import psg_manager
Base = psg_manager.Base

# class Data(Base):
#     __abstract__ = True

#     id = Column(Integer, primary_key=True, autoincrement=True)
#     type = Column(String, nullable=False)
#     status = Column(String, nullable=False)
#     createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
#     updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
#     crawl = Column(Boolean, nullable=False, default=False)
#     fileName = Column(String, nullable=False)
#     size = Column(BigInteger, nullable=False)
#     store = Column(String, nullable=False)
#     address = Column(String, nullable=False)






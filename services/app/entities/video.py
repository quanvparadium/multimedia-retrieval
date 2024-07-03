# import os
# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from sqlalchemy import Column, Integer, String, ForeignKey
# from sqlalchemy.orm import relationship
# from connections.postgres import psg_manager

# class Video(psg_manager.Base):
#     __tablename__ = 'videos'
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     title = Column(String, nullable=False)
#     keyframes = relationship("Keyframe", back_populates="video")
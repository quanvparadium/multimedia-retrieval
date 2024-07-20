import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import Column, Integer, String
from entities import Data

class Video(Data):
    pass
    __tablename__ = 'videos'

    id = Column(Integer, autoincrement=True, primary_key=True)
    author = Column(String, nullable=True)
    format = Column(String, nullable=True)
    duration = Column(Integer, nullable=False)
    youtubeId = Column(String, nullable=True) # If crawl = False, youtubeId = null
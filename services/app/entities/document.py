import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import Column, Integer, String
from entities import Data

class Document(Data):
    __tablename__ = 'documents'

    id = Column(Integer, autoincrement=True, primary_key=True)
    author = Column(String, nullable=True)
    format = Column(String, nullable=True)
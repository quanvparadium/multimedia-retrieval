import os
import numpy as np
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from connections.postgres import psg_manager
from sqlalchemy import Column, Integer, String, TIMESTAMP, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.hybrid import hybrid_method
from pgvector.sqlalchemy import Vector


class PGDocument(psg_manager.Base):
    __tablename__ = 'pg_documents'

    id = Column(Integer, autoincrement=True, primary_key=True)
    file_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    format = Column(String, nullable=False)
    
    collection_id = Column(String, nullable=True)
    page_content = Column(JSON, nullable=True)
    cmetadata = Column(JSONB, nullable=True)
    embedding = Column(Vector(768), nullable=True)
    store = Column(String, nullable=False, default='local')
    address = Column(String, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    @hybrid_method
    def cosine_distance(self, query_embedding):
        # Chuyển đổi embedding và query_embedding thành numpy arrays
        db_embedding = np.array(self.embedding)
        query_embedding = np.array(query_embedding)

        # Tính toán tích vô hướng (dot product) giữa hai vectors
        dot_product = np.dot(db_embedding, query_embedding)

        # Tính toán độ lớn (norm) của từng vector
        norm_db_embedding = np.linalg.norm(db_embedding)
        norm_query_embedding = np.linalg.norm(query_embedding)

        # Tính toán độ tương đồng cosine
        cosine_similarity = dot_product / (norm_db_embedding * norm_query_embedding)

        # Khoảng cách cosine là 1 trừ đi độ tương đồng cosine
        cosine_distance = 1 - cosine_similarity

        return cosine_distance
    
    @hybrid_method
    def l2_distance(self, query_embedding):
        return (func.sum((self.embedding - query_embedding) * (self.embedding - query_embedding)))

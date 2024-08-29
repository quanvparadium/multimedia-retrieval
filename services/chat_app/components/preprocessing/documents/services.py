import os
import sys
from typing import List
from datetime import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import warnings
warnings.filterwarnings("ignore")

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain_community.vectorstores import PGVector
from langchain_community.retrievers import BM25Retriever
# from langchain_postgres import PGVector
from langchain.chains.retrieval_qa.base import RetrievalQA

from langchain.retrievers.merger_retriever import MergerRetriever

from langchain_core.documents import Document
from langchain_core.runnables import chain


from config.constants import CONNECTION_STRING, GOOGLE_API_KEY
from connections.postgres import psg_manager
from entities.document import PGDocument

import google.generativeai as genai
genai.configure(api_key=GOOGLE_API_KEY)
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores.pgvector import DistanceStrategy

import numpy as np

from sqlalchemy import text, sql, delete, exc


# LLMS_BOT = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.2, convert_system_message_to_human=True),


def get_retriever_with_scores(vectorstore, query: str, k: int) -> List[Document]:
    """Get documents and add scores to metadata."""
    docs, scores = zip(*vectorstore.similarity_search_with_score(query, k=k))
    for doc, score in zip(docs, scores):
        doc.metadata["score"] = score
    return docs

@chain
def retriever_with_scores(query: str, k: int) -> List[Document]:
    return get_retriever_with_scores(db_vector, query, k)

def get_output_document(document_file):
    return {
        "file_id": document_file["collection_name"],
        "source": document_file['source'],
        "page": document_file['page'],
        "score": document_file["score"]
    }
    
class DocumentServicesV2:
    @staticmethod
    def _create_document(property):
        db_session = psg_manager.get_session()
        try:
            document_data = PGDocument(
                file_id = property['file_id'],
                user_id = property['user_id'],
                format = property['format'],
                collection_id = property["collection_id"],
                page_content = property["page_content"],
                cmetadata = property["cmetadata"],
                embedding = property["embedding"],
                store = property['store'],
                address= property['address'],
            )
            db_session.add(document_data)
            db_session.commit()
            db_session.refresh(document_data)
            return True
        except Exception as e:
            print("Rollbacking ...")
            db_session.rollback()
            print("Error: ", e)
            return False
        finally:
            db_session.close()          
    
    @staticmethod
    def _semantic_search_by_file_id(file_id: str, query: str, limit: int =5):
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        query_embed = embedding_function.embed_query(query)
        query_vector = f"[{','.join(map(str, query_embed))}]"
        db_session = psg_manager.get_session()

        sql_query = text("""
            SELECT page_content, cmetadata, (embedding <=> :query_embeded) AS distance
            FROM pg_documents
            WHERE "file_id" = :file_id
            ORDER BY distance
            LIMIT :limit;
        """)
        params = {
            "file_id": str(file_id),
            "query_embeded": query_vector,  # Assuming req.query is the vector or will be converted to one
            "limit": limit
        }
        
        # # begin_time = datetime.datetime.now()
        result = db_session.execute(sql_query, params).fetchall()
        print("Semantic search result: ", result)
        return result
    
    @staticmethod
    def _semantic_search_by_user_id(user_id: str, query: str, limit: int = 5):
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        query_embed = embedding_function.embed_query(query)
        query_vector = f"[{','.join(map(str, query_embed))}]"
        db_session = psg_manager.get_session()

        sql_query = text("""
            SELECT page_content, cmetadata, (embedding <=> :query_embeded) AS distance
            FROM pg_documents
            WHERE "user_id" = :user_id
            ORDER BY distance
            LIMIT :limit;
        """)
        params = {
            "user_id": str(user_id),
            "query_embeded": query_vector,  # Assuming req.query is the vector or will be converted to one
            "limit": limit
        }
        
        # # begin_time = datetime.datetime.now()
        result = db_session.execute(sql_query, params).fetchall()
        print("Semantic search result: ", result)
        return result
    
    
    @staticmethod
    def preprocessing(payload):
        try: 
            pdf_loader = PyPDFLoader(file_path= payload['file_path'])  
            pages = pdf_loader.load_and_split()
        except Exception as e:
            print("Error: ", e)
            return {
                "message": "Please check file path again"
            }
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        if pages is None:
            return {
                "message": "PDF file cannot be read or PDF file have no contents"
            }
        convert_texts = [d.page_content for d in pages]
        metadatas = [d.metadata for d in pages]
        if not metadatas:
            metadatas = [{} for _ in convert_texts]
        embeddings = embedding_function.embed_documents(list(convert_texts))
        db_session = psg_manager.get_session()
        try: 
            user_id = payload['user_id']
            file_id = payload['file_id']
            format = payload['format'] 
            file_path = payload['file_path']
            store = payload['store']
            
            is_file_exists = db_session.query(sql.exists().where(PGDocument.file_id == file_id)).scalar()
            if is_file_exists:
                return {
                    "message": "File is existed"
                }
            is_user_exists = db_session.query(sql.exists().where(PGDocument.user_id == user_id)).scalar() 
            print("User id: ", is_user_exists)
            for text, metadata, embedding in zip(convert_texts, metadatas, embeddings): 
                property = {
                    "file_id": file_id,
                    "user_id": user_id,
                    "format": format,
                    "collection_id": f"collect_{file_id}",
                    "page_content": text,
                    "cmetadata": metadata,
                    "embedding": embedding,
                    "store": store,
                    "address": file_path
                }
                is_created = DocumentServicesV2._create_document(property=property)
                if is_created == False:
                    print(f"Failed create file id {file_id} with metadata: {metadata}")

            # Index user_id if not exists
            if bool(is_user_exists) == False:
                psg_manager.create_index_by_user(table_name= "pg_documents", user_id=user_id)
            else:
                print(f"User_id {user_id} indexed")
                
            return {
                "message": "Document is preprocessed successfully!"
            }
        except Exception as e:
            print("Error: ", e)
            return {
                "message": "Preprocessing failed!"
            }
        
    @staticmethod
    def search_all(payload):
        """
            Payload for search API:
            - query: str
            - limit: int
            - user_id: str
        """
        db_session = psg_manager.get_session()
        # is_user_exists = db_session.query(PGDocument).filter(PGDocument.user_id == payload['user_id']).exists()
        is_user_exists = db_session.query(sql.exists().where(PGDocument.user_id == payload['user_id'])).scalar()
        if is_user_exists == False:
            return {
                "message": "User_id is not existed."
            }
              
        # print(is_user_exists)
        # return {
        #     "message": "testing.."
        # }
        item_query = payload['query']
        semantic_search_res = DocumentServicesV2._semantic_search_by_user_id(
            user_id= payload['user_id'],
            query= payload['query'],
            limit= payload['limit']
        )
        # bm25_documents = [
        #     {
        #         'document': Document(page_content=page_content, metadata=cmetadata),
        #         'scores': scores
        #     } for page_content, cmetadata, scores in semantic_search_res
        # ]
        bm25_documents = [Document(page_content=page_content, metadata=cmetadata) for page_content, cmetadata, scores in semantic_search_res]
        retriever = BM25Retriever.from_documents(documents= bm25_documents)
        retriever.k = payload['limit']
        print("Top limit: ", retriever.k)
        result = retriever.invoke(input= item_query, config= {})
        for rank, doc in enumerate(result):
            print(f"Rank: {rank + 1} - Document: {doc.metadata}")
        return {
            "message": "Search successfully!"
        }
    
    @staticmethod
    def search_many_files(payload):
        """
            Payload for search API:
            - query
            - limit
            - files
        """
    
    @staticmethod
    def delete_file(file_id, user_id):
        db_session = psg_manager.get_session()
        rows_to_delete = db_session.query(PGDocument).filter_by(file_id= file_id).all()
        print(len(rows_to_delete))
        for row in rows_to_delete:
            db_session.delete(row)  
            db_session.commit()  
        
        # db_session.commit()    
        # delete_q = PGDocument.__table__.delete().where(Report.data == 'test')
        # print(result)
        # files = db_session.query
        return {
            "message": "testing delete..."
        }
        


            
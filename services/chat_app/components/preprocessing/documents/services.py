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


from config.constants import GOOGLE_API_KEY
from config.status import HTTPSTATUS
from connections.postgres import psg_manager
from entities.document import PGDocument

import google.generativeai as genai
genai.configure(api_key=GOOGLE_API_KEY)
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores.pgvector import DistanceStrategy

import numpy as np
from typing import List
from sqlalchemy import text, sql, and_

def remove_duplicates_set(arr: List[dict]):
    seen = set()
    result = []

    for item in arr:
        page_number = item['page_number']
        if page_number not in seen:
            seen.add(page_number)
            result.append(item)

    return result
# LLMS_BOT = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.2, convert_system_message_to_human=True),

def cosine_score(document):
    return document['cosine_score']

def get_retriever_with_scores(vectorstore, query: str, k: int) -> List[Document]:
    """Get documents and add scores to metadata."""
    docs, scores = zip(*vectorstore.similarity_search_with_score(query, k=k))
    for doc, score in zip(docs, scores):
        doc.metadata["score"] = score
    return docs

def get_rank(array: List[object]):
    # Mảng đầu vào phải tăng dần
    current_rank = 1
    result = []
    if len(array) < 1:
        return None
    else:
        current_value = array[0]
        for i in range(len(array)):
            if array[i] == current_value:
                result.append(current_rank)
            elif array[i] > current_value:
                current_rank += 1
                current_value = array[i]
                result.append(current_rank)
            else:
                raise Exception("Array must be cumulative")
        return result

def remove_ensemble_ranker(array: List[dict]):
    from copy import deepcopy
    new_data = deepcopy(array)
    # Xoá key 'rank_score' khỏi từng dictionary trong list
    for item in new_data:
        item.pop("Rank_score", None)
    return new_data

class DatabaseServices:
    @staticmethod
    def is_user_exist(user_id: str):
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db = psg_manager.get_session(hased_session= hashed_session)
            
        result = db.query(PGDocument).filter(PGDocument.user_id == user_id).all()
        if len(result) == 0:
            return False
        return True
    
    @staticmethod
    def is_file_exist(user_id: str, file_id: str):
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db = psg_manager.get_session(hased_session= hashed_session)
            
        result = db.query(PGDocument).filter(and_(PGDocument.file_id == file_id, PGDocument.user_id == user_id)).all()
        if len(result) == 0:
            return False
        return True  
    
    @staticmethod
    def is_file_exist_in_other_users(user_id: str, file_id: str):
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db = psg_manager.get_session(hased_session= hashed_session)
            
        result = db.query(PGDocument).filter(PGDocument.file_id == file_id).all()
        is_file_exists_in_an_user = (len(result) > 0)
        is_file_exists_in_specific_user = DatabaseServices.is_file_exist(user_id= user_id, file_id= file_id)
        if (is_file_exists_in_specific_user == False) and (is_file_exists_in_an_user == True): 
            print("File_id is existed but not belongs to input user_id")
            return True
        return False
    
    
    @staticmethod
    def is_valid_user(user_id: str):
        try:
            int(user_id)
            return True
        except:
            return False    
    
class DocumentServicesV2:
    @staticmethod
    def _create_document(property):
        user_id = property['user_id']
        file_id = property['file_id']
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db_session = psg_manager.get_session(hased_session= hashed_session)
        if DatabaseServices.is_file_exist_in_other_users(user_id= user_id, file_id= file_id):
            return {
                "status_code": HTTPSTATUS.UNPROCESSABLE_ENTITY.code()
            }
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
            return {
                "status_code": HTTPSTATUS.CREATED.code()
            }        
        except Exception as e:
            db_session.rollback()
            print("Error: ", e)
            return {
                "status_code": HTTPSTATUS.BAD_REQUEST.code(),
                "error": str(e)
            }
        finally:
            db_session.close()          
    
    @staticmethod
    def _semantic_search_by_file_id(user_id: str, file_id: str, query: str, limit: int =5):
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        query_embed = embedding_function.embed_query(query)
        query_vector = f"[{','.join(map(str, query_embed))}]"
        
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db_session = psg_manager.get_session(hased_session= hashed_session)
            

        sql_query = text("""
            SELECT id, page_content, cmetadata, (embedding <=> :query_embeded) AS distance
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
            SELECT id, page_content, cmetadata, (embedding <=> :query_embeded) AS distance
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
                "status_code": HTTPSTATUS.NOT_FOUND.code(),
                "message": "Please check file path again"
            }
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        if pages is None:
            return {
                "status_code": HTTPSTATUS.BAD_REQUEST.code(),
                "message": "PDF file cannot be read or PDF file have no contents"
            }
        convert_texts = [d.page_content for d in pages]
        metadatas = [d.metadata for d in pages]
        if not metadatas:
            metadatas = [{} for _ in convert_texts]
        embeddings = embedding_function.embed_documents(list(convert_texts))
          
        indexing = payload['indexing'] if "indexing" in payload.keys() else False
        try: 
            user_id = payload['user_id']
            file_id = payload['file_id']
            format = payload['format'] 
            file_path = payload['file_path']
            store = payload['store']
            
            if DatabaseServices.is_file_exist(user_id= user_id, file_id= file_id):
                return {
                    "status_code": HTTPSTATUS.UNPROCESSABLE_ENTITY.code(),
                    "message": "Input data existed in database."
                }                
            total_time = 0.0
            for text, metadata, embedding in zip(convert_texts, metadatas, embeddings): 
                start_time = datetime.now()
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
                document_created = DocumentServicesV2._create_document(property=property)
                total_time = total_time + (datetime.now() - start_time).total_seconds()
                if document_created['status_code'] == HTTPSTATUS.BAD_REQUEST.code():
                    return {
                        "status_code": HTTPSTATUS.BAD_REQUEST.code(),
                        "message": f"Document cannot be created. Please check again request body!"
                    }                
                print(f"Extracted chunking document {metadata['page']} successfully!")
            print("Total preprocessing time: ", total_time)
            print("Average time: ", total_time / len(metadatas))
            # Index user_id if not exists
            if indexing: 
                psg_manager.create_kw_index_by_user(table_name= "pg_documents", user_id=user_id)
                psg_manager.create_index_by_user(table_name= "pg_documents", user_id=user_id)
            else:
                print("\033[31m>>> Option INDEX is not chosen!\033[0m")
                
            return {
                "status_code": HTTPSTATUS.CREATED.code(),
                "message": "Saved and extracted document ID('{file_id}') successfully!"
            }
        except Exception as e:
            print("Error: ", e)
            return {
                "status_code": HTTPSTATUS.NOT_IMPLEMENTED.code(),
                "message": "Preprocessing failed!"
            }
            
    @staticmethod
    def query_document(payload):
        """
            payload: dictionary
                - embedding: str (TensorString type)
                - user_id: str (Must be convert into integer)
                - file_id: str
                - limit: int
            
            Output:
                - status_code: 200/400/404
                - message": "..."
                - result: dictionary
                    - "data": List[dict]
        """                
        limit = payload['limit']
        file_id = payload['file_id']
        user_id = payload['user_id']
        query_vector = payload['embedding']
                
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db_session = psg_manager.get_session(hased_session= hashed_session)                 
         
        try:    
            sql_query = text("""
                SELECT id, page_content, cmetadata, (embedding <=> :query_embeded) AS distance
                FROM pg_documents
                WHERE "file_id" = :file_id
                ORDER BY distance
                LIMIT :limit;
            """)
            params = {
                "file_id": str(file_id),
                "query_embeded": query_vector,  # Assuming req.query is the vector or will be converted to one
                "limit": limit * 2
            }        
            
            doc_result = db_session.execute(sql_query, params).fetchall()
            if len(doc_result) > 0:
                score_doc = [doc.distance for doc in doc_result]
                ranker = get_rank(score_doc) 
                data_result = [{
                    "ID": f"{user_id}-{file_id}-{doc.id}-{doc.cmetadata['page']}",
                    "file_id": file_id,
                    "cosine_score": doc.distance,
                    "character_count": len(str(doc.page_content)),
                    "page_number": doc.cmetadata['page'],
                    "cmetadata": doc.cmetadata,
                    "type": "document",                                                  
                    "Rank_score": ranker[idx]
                } for idx, doc in enumerate(doc_result)] 
                
                return {
                    "status_code": HTTPSTATUS.OK.code(),
                    "message": "Semantic Document search (user) successfully!",
                    "result": {
                        "data": remove_duplicates_set(data_result)
                    }
                }   
            else:
                return {
                    "status_code": HTTPSTATUS.NOT_FOUND.code(),
                    "message": f"File_id({file_id}) may not existed in DOCUMENT database."
                } 
        except Exception as e:
            return {
                "status_code": HTTPSTATUS.BAD_REQUEST.code(),
                "error": str(e)
            }            
        finally:
            db_session.close()     
            
    @staticmethod
    def query_folder_document(payload):
        """
            payload: dictionary
                - query: str
                - user_id: str (Must be convert into integer)
                - files: List[str]
                - limit: int
            
            Output:
                - status_code: 200/400/404
                - message": "..."
                - result: dictionary
                    - "data": List[dict]
        """         
        query = payload['query']
        user_id = payload['user_id']
        files = payload['files']
        limit = payload['limit']
        
        for file_id in files:
            is_valid = DatabaseServices.is_file_exist(user_id= user_id, file_id= file_id)
            if is_valid == False:
                return {
                    "status_code": HTTPSTATUS.NOT_FOUND.code(),
                    "message": f"File_id({file_id}) of user({user_id}) may not existed in {database_type.upper()} database."
                }             
        
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        query_embed = embedding_function.embed_query(query)
        query_vector = f"[{','.join(map(str, query_embed))}]"
        
        total_search_time = 0.0
        all_documents = []
        for file_id in files:
            start_time = datetime.now()
            payload_per_file = {
                "embedding": query_vector,
                "limit": limit,
                "file_id": file_id,
                "user_id": user_id,
            }        
            result = DocumentServicesV2.query_document(payload= payload_per_file)
            total_search_time = total_search_time + (datetime.now() - start_time).total_seconds()
            if result['status_code'] == HTTPSTATUS.OK.code():
                data = result['result']['data']
                all_documents = [*all_documents, *data]
            else:
                print(f"\033[91m>>> Please check again file_id({file_id}) - user_id({user_id})!\033[0m")            
        print("Total search time: ", total_search_time)
        print("Average search time: ", total_search_time/len(files))
        
        return {
            "status_code": HTTPSTATUS.OK.code(),
            "message": "Semantic folder search successfully!",
            "count": len(all_documents),
            "result": {
                "data": sorted(all_documents, key=cosine_score)
            }
        }          
    
    @staticmethod
    def query_user_document(payload):
        """
            payload: dictionary
                - query: str
                - limit: int
                - user_id: str (Must be convert into integer)
            
            Output:
                - status_code: 200/400/404
                - message": "..."
                - result: dictionary
                    - "data": List[dict]        
        """   
        query = payload['query']
        limit = payload['limit']
        user_id = payload['user_id']
         
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db_session = psg_manager.get_session(hased_session= hashed_session)        
        
        embedding_function = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        query_embed = embedding_function.embed_query(query)
        query_vector = f"[{','.join(map(str, query_embed))}]"
        
        try:
            sql_query = text("""
                SELECT id, file_id, page_content, cmetadata, (embedding <=> :query_embeded) AS distance
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
            doc_result = db_session.execute(sql_query, params).fetchall()
            if len(doc_result) > 0:
                score_doc = [doc.distance for doc in doc_result]
                ranker = get_rank(score_doc)  
                data_result = [{
                    "ID": f"{user_id}-{doc.file_id}-{doc.id}-{doc.cmetadata['page']}",
                    "file_id": doc.file_id,
                    "cosine_score": doc.distance,
                    "character_count": len(str(doc.page_content)),
                    "page_number": doc.cmetadata['page'],
                    "cmetadata": doc.cmetadata,
                    "type": "document",                                                  
                    "Rank_score": ranker[idx]
                } for idx, doc in enumerate(doc_result)]
                return {
                    "status_code": HTTPSTATUS.OK.code(),
                    "message": "Semantic Document search (user) successfully!",
                    "result": {
                        "data": remove_duplicates_set(data_result)
                    }
                }   
            else:
                return {
                    "status_code": HTTPSTATUS.NOT_FOUND.code(),
                    "message": f"Query {query} related to user_id({user_id}) could not be found in cluster database.",
                    "result": {
                        "data": []
                    }                    
                } 
        except Exception as e:
            return {
                "status_code": HTTPSTATUS.BAD_REQUEST.code(),
                "error": str(e)
            }            
        finally:
            db_session.close()          
                
        
                
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
        # for row in rows_to_delete:
        #     db_session.delete(row)  
        #     db_session.commit()  
        
        # db_session.commit()    
        # delete_q = PGDocument.__table__.delete().where(Report.data == 'test')
        # print(result)
        # files = db_session.query
        return {
            "message": "testing delete..."
        }
        


            
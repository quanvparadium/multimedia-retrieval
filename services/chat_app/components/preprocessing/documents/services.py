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
# from langchain_postgres import PGVector
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain.retrievers.merger_retriever import MergerRetriever

from langchain_core.documents import Document
from langchain_core.runnables import chain


from config.constants import CONNECTION_STRING, GOOGLE_API_KEY
from connections.postgres import psg_manager
from entities.document import Document

import google.generativeai as genai
genai.configure(api_key=GOOGLE_API_KEY)
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores.pgvector import DistanceStrategy

import numpy as np

LLMS_BOT = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.2, convert_system_message_to_human=True),


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

class DocumentPreprocessing:
    @staticmethod
    def load_document(payload):
        db = psg_manager.get_session()
        result = db.query(Document).filter(Document.file_id == payload['file_id']).all()
        if result:
            return {
                "message": "File existed"
            }
        if not os.path.exists(payload['file_path']):
            return {
                "message": "File path is not found"
            }
        pdf_loader = PyPDFLoader(payload['file_path'])
        pages = pdf_loader.load_and_split()
        # print("Page content: ", pages[0].page_content)
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        context = "\n\n".join(str(p.page_content) for p in pages)
        texts = text_splitter.split_text(context)
        print(len(texts))
        
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001",google_api_key=GOOGLE_API_KEY)
        # db_retriever = PGVector.from_texts(
        #     texts = texts,
        #     embedding = embeddings,
        #     collection_name = payload['file_id'],
        #     distance_strategy = DistanceStrategy.COSINE,
        #     connection_string = CONNECTION_STRING
        # )
        db_retriever = PGVector.from_documents(
            documents=pages,
            embedding = embeddings,
            collection_name = payload['file_id'],
            distance_strategy = DistanceStrategy.COSINE,
            connection_string = CONNECTION_STRING
        )

        db_document = Document(
            file_id=payload['file_id'],
            user_id=payload['user_id'],
            format='pdf',
            collection_id=payload['file_id'],
            store='local',
            address=payload['file_path'],
        )
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        db.close()
        print("Add successful: ", db_document.id)
        
        
        return {
            "message": "Add document successfully!"
        }
        
        # embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001",google_api_key=GOOGLE_API_KEY)
        
    @staticmethod
    def search(payload):
        db = psg_manager.get_session()
        
        # Truy vấn các tài liệu dựa trên fileId
        documents = db.query(Document).filter(Document.file_id == payload['file_id']).all()
        if not documents:
            print(f"No documents found for fileId: {payload['file_id']}")
            return []
        
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        # db_vector = PGVector.from_texts(
        #     texts=texts,
        #     embedding=embeddings,
        #     collection_name="your_collection_name",
        #     distance_strategy=DistanceStrategy.COSINE,
        #     connection_string=CONNECTION_STRING
        # )
        # retriever = db_vector.as_retriever(search_kwargs={"k": 3})
        
        db_vector = PGVector(
            collection_name=payload['file_id'],
            connection_string=CONNECTION_STRING,
            embedding_function=embeddings
        )

        retriever = db_vector.as_retriever(search_kwargs={"k": payload['limit'], "include_metadata": True})
        qa_chain = RetrievalQA.from_chain_type(
            llm=ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.2, convert_system_message_to_human=True),
            retriever=retriever,
            return_source_documents=True
        )
        
        question = payload['query']
        result = qa_chain.invoke({"query": question})
        
        # print(result['source_documents']) 
        docs = result.get("source_documents", [])
        print(docs[0])
        for doc in result['source_documents']:
            print("Id: ", (doc))
        print(result.keys())
        # print(result["result"])
        # print("Source document: ", result['source_documents'])
        # result = {
        #     "result": "ok"
        # }
        return {
            "answer": result["result"],
            "source": result['source_documents'][0].metadata['source'],
            "page": result['source_documents'][0].metadata['page'],
        }
    
    def search_folder(payload, generate=False):
        db = psg_manager.get_session()
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)
        query_embed = embeddings.embed_query(payload['query'])
        result = None
        # Truy vấn các tài liệu dựa trên fileId
        files = payload['files']
        similarity_scores = []
        for file_id in files:
            
            documents = db.query(Document).filter(Document.file_id == file_id).all()
            if not documents:
                print(f"No documents found for fileId: {payload['file_id']}")
                # return []
                
            db_vector = PGVector(
                collection_name=file_id,
                connection_string=CONNECTION_STRING,
                embedding_function=embeddings
            )     
            print("=" * 10, " BEGIN SEARCH ", "="*10) 
            
            begin_time = datetime.now()     
            db_vector.asimilarity_search_with_score  
            results = db_vector.similarity_search_with_score_by_vector(embedding=query_embed, k= payload['limit'])
            print("Total search time: ", datetime.now() - begin_time)
            for result in results:
                current_metadata = result[0].metadata
                # print("Score: ", result[1])
                # print("Source: ", result[0].page_content)
                print("Score: ", result[1])
                print(current_metadata)
                print("="*10)
                similarity_scores.append({
                    **current_metadata,
                    "collection_name": file_id,
                    "score": result[1]
                })
            # print(result_search[])
            print("=" * 10, " END SEARCH ", "="*10)         
            
            # retriever = db_vector.as_retriever(
            #     search_type="similarity", 
            #     search_kwargs={
            #         "k": 5, 
            #         "include_metadata": True
            #     }
            # )
            # retrievers.append(retriever)
        def return_score(obj):
            return obj['score']
        begin_time = datetime.now()       
        sort_sim_scores = sorted(similarity_scores, key=return_score)
        print("Length: ", len(sort_sim_scores))
        
        top1 = sort_sim_scores[0]
        print("Total sort time: ", datetime.now() - begin_time)
      
        
        collection_name = top1['collection_name']
        print("Collection name: ", collection_name)
        if generate:  
            top1_vectorstore = PGVector(
                collection_name=collection_name,
                connection_string=CONNECTION_STRING,
                embedding_function=embeddings
            )  
            retriever = top1_vectorstore.as_retriever(
                search_kwargs={
                    "k": payload['limit'], 
                    "include_metadata": True
                }
            )
            qa_chain = RetrievalQA.from_chain_type(
                llm=ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.2, convert_system_message_to_human=True),
                retriever=retriever,
                return_source_documents=True
            )
            
            question = payload['query']
            result = qa_chain.invoke({"query": question})
            for document in result["source_documents"]:
                print("Metadata: ", document.metadata)
                print("="*30)
            print(result["result"])
        
        return {
            "message": "Search document by text successfully!",
            "result": [get_output_document(doc_file) for doc_file in sort_sim_scores]
        }
        
            
            
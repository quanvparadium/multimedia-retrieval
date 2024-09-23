from fastapi import APIRouter
from typing import List
from .services import DocumentServicesV2
preprocessRouter = APIRouter()

from pydantic import BaseModel
class DocumentItem(BaseModel):
    user_id: str
    format: str # TextLoader for .txt, PDFLoader for .pdf, ...
    store: str
    file_path: str
    file_id: str

class SearchItem(BaseModel):
    query: str
    limit: int
    file_id: str
    
class SearchFolder(BaseModel):
    query: str
    limit: int
    files: List[str]
    
class SearchAll(BaseModel):
    query: str
    limit: int
    user_id: str

@preprocessRouter.get('/')
def get():
    return {
        "message": "document"
    }
    
@preprocessRouter.post('/')
def preprocessing(item: DocumentItem):
    assert item.format == 'pdf', "Input file must be PDF file"
    print("Processing document ...")
    payload = {
        "user_id": item.user_id,
        "file_id": item.file_id, #Mongo definition
        "format": item.format,
        "file_path": item.file_path, # Actual storage
        "store": item.store, # Local or S3 Storage
    }
    result = DocumentServicesV2.preprocessing(payload)
    return result

@preprocessRouter.post('/search-all')
def search_all(item: SearchAll):
    payload = {
        "query": item.query,
        "limit": item.limit,
        "user_id": item.user_id
    }
    result = DocumentServicesV2.search_all(payload)
    return result

@preprocessRouter.delete('/')
def delete_file(file_id: str, user_id: str):
    print(file_id)
    result = DocumentServicesV2.delete_file(file_id, user_id)
    return result

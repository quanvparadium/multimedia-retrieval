from fastapi import APIRouter
from typing import List
from .services import DocumentPreprocessing
preprocessRouter = APIRouter()

from pydantic import BaseModel
class DocumentItem(BaseModel):
    user_id: str
    format: str # TextLoader for .txt, PDFLoader for .pdf, ...
    store: str
    # type: str
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

@preprocessRouter.get('/')
def get():
    return {
        "message": "document"
    }

@preprocessRouter.post('/')
def preprocess(item: DocumentItem):
    assert item.format == 'pdf', "Input file must be PDF file"
    print("Processing document ...")
    payload = {
        "user_id": item.user_id,
        "file_id": item.file_id, #Mongo definition
        "file_path": item.file_path, # Actual storage
        "store": item.store, # Local or S3 Storage
    }
    result = DocumentPreprocessing.load_document(payload)
    return result
    
@preprocessRouter.post('/search')
def search(item: SearchItem):
    print("Search document ...")
    # payload = {
    #     "query": item.user_id,
    #     "file_id": item.file_id, #Mongo definition
    #     "file_path": item.file_path, # Actual storage
    # }
    payload = {
        "query": item.query,
        "limit": item.limit,
        "file_id": item.file_id
    }
    result = DocumentPreprocessing.search(payload)
    return result

@preprocessRouter.post('/search-folder')
def search(item: SearchFolder):
    print("Search document ...")
    # payload = {
    #     "query": item.user_id,
    #     "file_id": item.file_id, #Mongo definition
    #     "file_path": item.file_path, # Actual storage
    # }
    payload = {
        "query": item.query,
        "limit": item.limit,
        "files": item.files
    }
    result = DocumentPreprocessing.search_folder(payload)
    return result
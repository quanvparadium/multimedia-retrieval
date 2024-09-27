from fastapi import APIRouter
from fastapi.responses import JSONResponse

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
    indexing: bool = True
    
class SearchFolder(BaseModel):
    query: str
    user_id: str
    files: List[str]
    limit: int
    
class SearchUser(BaseModel):
    query: str
    limit: int
    user_id: str
    limit: int
    
def WrapperResponse(status_code: int, message: str, data: List[object] = None):
    if data:
        return JSONResponse(
            status_code= status_code,
            content= {
                "status_code": status_code,
                "message": message,
                "result": {
                    "data": data
                }
            }
        )
    return JSONResponse(
        status_code= status_code,
        content= {
            "status_code": status_code,
            "message": message
        }
    )    
    

@preprocessRouter.get('/')
def get():
    return {
        "message": "document"
    }
    
@preprocessRouter.post('/document')
def preprocessing(item: DocumentItem):
    assert item.format == 'pdf', "Input file must be PDF file"
    print("Processing document ...")
    payload = {
        "user_id": item.user_id,
        "file_id": item.file_id, #Mongo definition
        "format": item.format,
        "file_path": item.file_path, # Actual storage
        "store": item.store, # Local or S3 Storage
        "indexing": item.indexing
    }
    result = DocumentServicesV2.preprocessing(payload)
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )

@preprocessRouter.post('/document/search-folder')
def search_folder(item: SearchFolder):
    payload = {
        "query": item.query,
        "limit": item.limit,
        "files": item.files,
        "user_id": item.user_id
    }
    result = DocumentServicesV2.query_folder_document(payload)
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )

@preprocessRouter.post('/document/search-all')
def search_all(item: SearchUser):
    payload = {
        "query": item.query,
        "limit": item.limit,
        "user_id": item.user_id
    }
    result = DocumentServicesV2.query_user_document(payload)
    return result

@preprocessRouter.delete('/document')
def delete_file(file_id: str, user_id: str):
    print(file_id)
    result = DocumentServicesV2.delete_file(file_id, user_id)
    return result

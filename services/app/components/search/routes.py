from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .video.services import VideoSearch, OCRSearch, EnsembleSearch
searchRouter = APIRouter()

# Định nghĩa model cho body
class VideoSearchBody(BaseModel):
    query: str
    limit: int
    file_id: str
    user_id: str
    ocr: str
    
class FolderQuerySearchBody(BaseModel):
    query: str
    limit: int
    files: List[str]
    user_id: str
    ocr: str
    
class AllQuerySearchBody(BaseModel):
    query: str
    limit: int
    user_id: str
    ocr: str
    
class FolderImageSearchBody(BaseModel):
    image_path: str
    limit: int
    files: List[str]
    user_id: str
    ocr: str
  
class AllImageSearchBody(BaseModel):
    image_path: str
    limit: int
    user_id: str
    ocr: str
    

@searchRouter.post('/keyframe')
def video_search(req: VideoSearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "file_id": req.file_id,
        "user_id": req.user_id
    }
    ocr_payload = {
        "ocr": req.ocr,
        "limit": req.limit,
        "file_id": req.file_id,
        "user_id": req.user_id        
    }
    vector_result = VideoSearch.query_video(payload)
    is_ocr_search = (req.ocr.strip() != "")
    if is_ocr_search:
        ocr_result = OCRSearch.query_video(ocr_payload)
    else:
        print("\033[93m>>> OCR full text search won't be used.\033[0m")
    result = vector_result if is_ocr_search == False else EnsembleSearch.hybrid_search(ranker_one = vector_result, ranker_two = ocr_result)
    if result is None:
        print("Cannot find file_id")
    return {
        "message": "Search successfully!",
        "Address": result
    } 
    
@searchRouter.post('/folder/keyframe/text')
def folder_search(req: FolderQuerySearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id
    }
    result = VideoSearch.query_folder_with_text(payload)
    return {
        "message": "Search text successfully!",
        "result": result
    } 
    
@searchRouter.post('/all/keyframe/text')
def all_search_by_text(req: AllQuerySearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "user_id": req.user_id
    }
    result = VideoSearch.query_all_folder_with_text(payload)
    return {
        "message": "Search all folders successfully!",
        "result": result
    } 
    
    
    
@searchRouter.post('/folder/keyframe/image')
def folder_search(req: FolderImageSearchBody):
    payload = {
        "image_path": req.image_path,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id,
        "ocr": req.ocr
    }
    result = VideoSearch.query_folder_with_image(payload)
    return {
        "message": "Search image successfully!",
        "result": result
    } 

@searchRouter.post('/all/keyframe/text')
def all_search_by_image(req: AllQuerySearchBody):
    payload = {
        "image_path": req.image_path,
        "limit": req.limit,
        "user_id": req.user_id
    }
    result = VideoSearch.query_all_folder_with_image(payload)
    return {
        "message": "Search all folders successfully!",
        "result": result
    } 
    
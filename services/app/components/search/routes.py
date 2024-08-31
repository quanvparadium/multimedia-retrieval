from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .video.services import VideoSearch
searchRouter = APIRouter()

# Định nghĩa model cho body
class VideoSearchBody(BaseModel):
    query: str
    limit: int
    fileId: str
    
class FolderQuerySearchBody(BaseModel):
    query: str
    limit: int
    files: List[str]
    
class AllQuerySearchBody(BaseModel):
    query: str
    limit: int
    user_id: str
    
class FolderImageSearchBody(BaseModel):
    image_path: str
    limit: int
    files: List[str]
  
class AllImageSearchBody(BaseModel):
    image_path: str
    limit: int
    user_id: str
    

@searchRouter.post('/keyframe')
def video_search(req: VideoSearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "fileId": req.fileId
    }
    result = VideoSearch.query_video(payload)
    if result is None:
        print("Cannot find fileId")
    return {
        "message": "Search successfully!",
        "Address": result
    } 
    
@searchRouter.post('/folder/keyframe/text')
def folder_search(req: FolderQuerySearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "files": req.files
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
        "files": req.files
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
    
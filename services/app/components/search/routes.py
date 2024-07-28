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
    
class FolderImageSearchBody(BaseModel):
    image_path: str
    limit: int
    files: List[str]

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

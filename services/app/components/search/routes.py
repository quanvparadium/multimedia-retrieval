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
    
class FolderSearchBody(BaseModel):
    query: str
    limit: int
    files: List[str]

@searchRouter.post('/video')
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
    
@searchRouter.post('/folder/video/')
def folder_search(req: FolderSearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "files": req.files
    }
    result = VideoSearch.query_folder(payload)
    return {
        "message": "Search successfully!"
    } 


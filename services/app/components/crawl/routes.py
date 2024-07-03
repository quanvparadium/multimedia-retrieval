from typing import Optional
from fastapi import APIRouter
from .video.services import VideoCrawler
from pydantic import BaseModel
crawlRouter = APIRouter()

# Định nghĩa model cho body
class Item(BaseModel):
    id: str

class VideoCreate(BaseModel):
    video_path: str

@crawlRouter.get('/')
async def status(id: Optional[str] = None):
    print("Id: ", id)
    if id != None:
        result = VideoCrawler.get_video(videoId=id)
    else: 
        result = VideoCrawler.get_newest_video()
    status = "In processing"
    return {
        "status": status,
        "video_path": result
    }

@crawlRouter.post('/')
async def create_video(item: Item):
    print("ID: ", item.id)
    res = VideoCrawler.create_video(item.id)
    print("Output: ", res)
    return {
        "message": "OK"
    }
# async def create_video(video: VideoCreate):
#     print(video.video_path)
#     return {
#         "status": "Successful",
#         "video_path": video.video_path
#     }


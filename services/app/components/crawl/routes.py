from typing import Optional
from fastapi import APIRouter
from .video.services import VideoYoutubeCrawler
from pydantic import BaseModel
crawlRouter = APIRouter()

# Định nghĩa model cho body
class ReqBody(BaseModel):
    userId: int

class DocumentVNBReqBody(ReqBody):
    url: str

class VideoYoutubeReqBody(ReqBody):
    videoId: str
    

@crawlRouter.get('/youtube/')
async def status(req: VideoYoutubeReqBody):
    print("Id: ", req.videoId)
    if req.videoId != None:
        result = VideoYoutubeCrawler.get_video(videoId=req.videoId)
    else: 
        result = VideoYoutubeCrawler.get_newest_video(maxResults=50)
    return result

@crawlRouter.post('/youtube/')
async def create_video(req: VideoYoutubeReqBody):
    print("ID: ", req.videoId)
    res = VideoYoutubeCrawler.create_video(videoId=req.videoId, userId=req.userId)
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


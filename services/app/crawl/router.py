from typing import Optional
from fastapi import APIRouter
from .video.services import VideoCrawler
from pydantic import BaseModel
crawlRouter = APIRouter()

# Định nghĩa model cho body
class Item(BaseModel):
    id: str

@crawlRouter.get('/')
async def status(id: Optional[str] = None):
    print("Id: ", id)
    if id != None:
        result = VideoCrawler.get_video(videoId=id)
    else: 
        result = VideoCrawler.get_newest_video()
    status = "In processing"
    return {
        "status": status
    }

# @crawlRouter.get('/')
# def get_video():
#     result = VideoCrawler.get_video(videoId=id)
#     status = "In processing"
#     return {
#         "status": status
#     }
# @crawlRouter.post('/{type}/')
# def extract(type: str, item: Item):
#     print("Preprocessing here")
#     result = None
#     if type == "video":
#         print("Preprocessing ...")
#         # video_dir = AWSS3download
#         # video_name = VideoPreprocessing.get_path(item.id)
#         result = VideoPreprocessing.extract_keyframe(video_path=f"{video_dir}/{item.id}.mp4")
#     else:
#         print(f"1{type}1")
#     print(type, "12323",  item.id)
#     return {
#         "type": type,
#         "id": item.id,
#         # "shape": result['shape']
#     }

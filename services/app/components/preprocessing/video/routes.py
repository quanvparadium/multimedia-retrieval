from fastapi import APIRouter
from .services import VideoPreprocessing
# from ..schemas import VideoItem, DocumentItem, Item
videoPreprocessRouter = APIRouter()

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục Video
video_dir = os.path.join(current_dir, '..', 'tmp', 'video')
sys.path.append(video_dir)


from pydantic import BaseModel
class VideoItem(BaseModel):
    user_id: str
    store: str
    type: str
    file_path: str
    file_id: str
    

# @videoPreprocessRouter.get('/{keyframeId}/')
# def status(keyframeId: str):
#     property = VideoPreprocessing.get_video_properties(keyframeId)
#     print("Preprocessing result: ", property)
#     status = "In processing"
#     return {
#         "status": status
#     }

@videoPreprocessRouter.post('/')
def extract_keyframe(item: VideoItem):
    print("Processing video ...")
    assert item.type == "video", "File must be a video"
    payload = {
        "user_id": item.user_id,
        "type": "video",
        "file_id": item.file_id, #Mongo definition
        "file_path": item.file_path, # Actual storage
        "store": item.store, # Local or S3 Storage
        "threshold": 0.1
    }
    result = VideoPreprocessing.extract_keyframe(payload)
    return result




# @videoPreprocessRouter.post('/{type}/')
# def extract(type: str, item: Union[VideoItem, DocumentItem]):
#     print("Preprocessing here")
#     result = None
#     if type == "video":
#         assert isinstance(item, VideoItem), "Type must be Video"
#         print("Preprocessing ...")
#         # video_dir = AWSS3download
#         # video_name = VideoPreprocessing.get_path(item.id)
#         property = VideoPreprocessing.get_video_properties(id)
#         result = VideoPreprocessing.extract_keyframe(item.id)
#         # result = VideoPreprocessing.extract_keyframe(video_path=f"{video_dir}/{item.id}.mp4", threshold=item.threshold, width=property['width'], height=property['height'])
#     else:
#         print(f"1{type}1")
#     print(type, "12323",  item.id)
#     return {
#         "type": type,
#         "id": item.id,
#         # "shape": result['shape']
#     }
    
# @videoPreprocessRouter.post('/{videoId}')
# def xx
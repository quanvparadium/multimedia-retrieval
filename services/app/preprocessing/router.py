from fastapi import APIRouter
from .video.services import VideoPreprocessing
from .schemas import VideoItem, Item
preprocessRouter = APIRouter()

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục Video
video_dir = os.path.join(current_dir, '..', 'tmp', 'video')
sys.path.append(video_dir)



@preprocessRouter.get('/{id}')
def status(id: int):
    status = "In processing"
    return {
        "status": status
    }

@preprocessRouter.post('/{type}/')
def extract(type: str, item: VideoItem):
    print("Preprocessing here")
    result = None
    if type == "video":
        print("Preprocessing ...")
        # video_dir = AWSS3download
        # video_name = VideoPreprocessing.get_path(item.id)
        result = VideoPreprocessing.extract_keyframe(video_path=f"{video_dir}/{item.id}.mp4", threshold=item.threshold)
    else:
        print(f"1{type}1")
    print(type, "12323",  item.id)
    return {
        "type": type,
        "id": item.id,
        # "shape": result['shape']
    }

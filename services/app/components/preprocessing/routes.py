from fastapi import APIRouter
from .video.services import VideoPreprocessing
from .schemas import VideoItem, DocumentItem, Item
preprocessRouter = APIRouter()

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục Video
video_dir = os.path.join(current_dir, '..', 'tmp', 'video')
sys.path.append(video_dir)



@preprocessRouter.get('/{type}/{id}')
def status(type: str, id: int):
    assert type in ["video", "document", "image"], "Type must be in (Video, Document, Image)" 
    if type == "video":
        property = VideoPreprocessing.get_video_properties(id)
        print("Preprocessing result: ", property)
    status = "In processing"
    return {
        "status": status
    }

@preprocessRouter.post('/video/')
def extract_keyframe(item: Item):
    print("Processing video ...")
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


@preprocessRouter.post('/document/')
def extract_keyframe(item: Item):
    print("Processing document ...")
    result = {
        "message": "Document process done!"
    }
    # result = DocumentPreprocessing.extract_keyframe(int(item.id))
    return result

# @preprocessRouter.post('/{type}/')
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
    
# @preprocessRouter.post('/{videoId}')
# def xx

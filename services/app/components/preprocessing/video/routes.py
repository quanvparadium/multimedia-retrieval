from fastapi import APIRouter
from fastapi.responses import JSONResponse
from .services import VideoPreprocessing
videoPreprocessRouter = APIRouter()

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục Video
video_dir = os.path.join(current_dir, '..', 'tmp', 'video')
sys.path.append(video_dir)


##############################- DEFINE REQUEST BODY -####################################

from pydantic import BaseModel
class VideoItem(BaseModel):
    user_id: str
    file_id: str
    file_path: str
    store: str
    format: str
    accelerate: bool = True
    skip_transaction: bool = False
    indexing: bool = True
    
class TestVideoItem(BaseModel):
    user_id: str
    store: str
    format: str
    folder_path: str
    file_id: str

#########################################- END -#########################################
    
    
##############################- IMAGE SERVICES -##############################
@videoPreprocessRouter.post('/image')
def extract_image(item: VideoItem):
    payload = {
        "user_id": item.user_id,
        "file_id": item.file_id, #Mongo definition
        "file_path": item.file_path, # Actual storage
        "store": item.store, # Local or S3 Storage
        "format": item.format,
        "accelerate": item.accelerate,
        "indexing": item.indexing,
        "skip_transaction": item.skip_transaction
    }
    try:
        int(item.user_id)
    except Exception as e:
        return JSONResponse(
            status_code= 400, 
            content= {
                "status_code": 400,
                "message": f"User_id({item.user_id}) could not be converted into IntegerType."
            }
        )
        
    result = VideoPreprocessing.extract_image(payload)
    return JSONResponse(
        status_code= result['status_code'], # Ensure interger type
        content= result
    )


####################################- END -#################################### 


@videoPreprocessRouter.post('/video')
def extract_keyframe(item: VideoItem):
    print("Processing video ...")
    if item.format != "mp4":
        return JSONResponse(
            status_code= 400, 
            content= {               
                "status_code": 400,
                "message": f"Video format must be 'mp4'."
            }
        )
        
    payload = {
        "user_id": item.user_id,
        "file_id": item.file_id, #Mongo definition
        "file_path": item.file_path, # Actual storage
        "store": item.store, # Local or S3 Storage
        "threshold": 0.1,
        "accelerate": item.accelerate,
        "indexing": item.indexing,
        "skip_transaction": item.skip_transaction
    }
    
    try:
        int(item.user_id)
    except Exception as e:
        return JSONResponse(
            status_code= 400, 
            content= {            
                "status_code": 400,
                "message": f"User_id({item.user_id}) could not be converted into IntegerType."
            }
        )
            
    result = VideoPreprocessing.extract_keyframe(payload)
    return JSONResponse(
        status_code= result['status_code'],
        content= result
    )

@videoPreprocessRouter.post('/test-video')
def test_extract_keyframe(item: TestVideoItem):
    print("Test indexing ...")
    payload = {
        "user_id": item.user_id,
        "file_id": item.file_id, #Mongo definition
        "folder_path": item.folder_path, # Actual storage
        "store": item.store, # Local or S3 Storage
        "threshold": 0.1
    }
    result = VideoPreprocessing.test_indexing(payload)
    result = {
        "message": "Update soon ..."
    }
    return result    

########IMAGE SERVICES##########





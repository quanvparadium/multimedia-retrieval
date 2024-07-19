from fastapi import APIRouter
from pydantic import BaseModel

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục Video
print("Current dir - Components/Extract: ", current_dir)
video_dir = os.path.join(current_dir, '..', 'tmp', 'video')
sys.path.append(video_dir)

from .video.services import kf_extract

class KeyframeReqBody(BaseModel):
    userId: int
    fileId: str 


extractRouter = APIRouter()

@extractRouter.post('/keyframe')
def kf_extraction(req: KeyframeReqBody):
    payload = {
        "user_id": req.userId,
        "file_id": req.fileId,
    }
    result = kf_extract.update_embedding(payload)
    return {
        "message": "OK"
    }


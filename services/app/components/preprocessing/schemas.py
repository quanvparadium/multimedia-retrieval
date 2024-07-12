from pydantic import BaseModel
from typing import Optional
class Item(BaseModel):
    user_id: str
    store: str
    type: str
    file_path: str
    file_id: str
    
# Định nghĩa model cho body
class VideoItem(Item):
    # video_path: str
    threshold: str
    
    
class DocumentItem(Item):
    # video_path: str
    temporature: float
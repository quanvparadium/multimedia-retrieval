from pydantic import BaseModel
from typing import Optional
class Item(BaseModel):
    id: str
    
# Định nghĩa model cho body
class VideoItem(Item):
    # video_path: str
    threshold: float
    
class DocumentItem(Item):
    # video_path: str
    temporature: float
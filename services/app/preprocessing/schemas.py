from pydantic import BaseModel

class Item(BaseModel):
    id: str
    
# Định nghĩa model cho body
class VideoItem(Item):
    # video_path: str
    threshold: float
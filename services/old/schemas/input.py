from pydantic import BaseModel

class Search(BaseModel):
    query: str
    topk: int
    dataset: str
    OCR: str = None
    Speech: str = None
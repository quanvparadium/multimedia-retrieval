from fastapi import APIRouter, HTTPException
from schemas.input import Search
from controllers.search import text_search_controller

searchRouter = APIRouter()

@searchRouter.get("/{id}")
def search(id: int):
    return {
        'message': id
    }

@searchRouter.post("/videos")
async def text_search(item: Search):
    result = await text_search_controller(item)
    return {
        "result": result
    }


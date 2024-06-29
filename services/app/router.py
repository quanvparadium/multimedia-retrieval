from fastapi import APIRouter, HTTPException
from preprocessing.router import preprocessRouter
from crawl.router import crawlRouter
mainRouter = APIRouter()

mainRouter.include_router(router=preprocessRouter, prefix="/preprocessing")
mainRouter.include_router(router=crawlRouter, prefix="/crawl")

@mainRouter.get("/")
def home():
    return {
        'message': 1
    }

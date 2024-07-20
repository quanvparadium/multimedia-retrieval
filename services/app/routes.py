from fastapi import APIRouter, HTTPException
from components.preprocessing.video.routes import videoPreprocessRouter
from components.crawl.routes import crawlRouter
from components.user.routes import userRouter
from components.extract.routes import extractRouter
from components.search.routes import searchRouter

mainRouter = APIRouter()

mainRouter.include_router(router=videoPreprocessRouter, prefix="/preprocessing/video")
mainRouter.include_router(router=crawlRouter, prefix="/crawl")
mainRouter.include_router(router=userRouter, prefix="/user")
mainRouter.include_router(router=extractRouter, prefix="/extract")
mainRouter.include_router(router=searchRouter, prefix="/search")


@mainRouter.get("/")
def home():
    return {
        'message': 1
    }

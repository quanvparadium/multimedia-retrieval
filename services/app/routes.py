from fastapi import APIRouter, HTTPException
from components.preprocessing.routes import preprocessRouter
from components.crawl.routes import crawlRouter
from components.user.routes import userRouter
mainRouter = APIRouter()

mainRouter.include_router(router=preprocessRouter, prefix="/preprocessing")
mainRouter.include_router(router=crawlRouter, prefix="/crawl")
mainRouter.include_router(router=userRouter, prefix="/user")

@mainRouter.get("/")
def home():
    return {
        'message': 1
    }

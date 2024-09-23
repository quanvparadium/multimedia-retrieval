from fastapi import APIRouter, HTTPException
from components.preprocessing.video.routes import videoPreprocessRouter

# from components.extract.routes import extractRouter
from components.search.routes import searchRouter

mainRouter = APIRouter()

mainRouter.include_router(router=videoPreprocessRouter, prefix="/preprocessing")
mainRouter.include_router(router=searchRouter, prefix="/search")

@mainRouter.get("/")
def home():
    return {
        'message': 1
    }

@mainRouter.get("/migrate")
def home():
    from connections.postgres import psg_manager
    psg_manager.create_tables()
    return {
        'message': 1
    }
from fastapi import APIRouter, HTTPException
from components.preprocessing.documents.routes import preprocessRouter
mainRouter = APIRouter()

mainRouter.include_router(router=preprocessRouter, prefix="/api/document")




@mainRouter.get("/")
def home():
    return {
        'message': 1
    }

# @mainRouter.get("/migrate")
# def home():
#     from connections.postgres import psg_manager
#     psg_manager.create_tables()
#     return {
#         'message': 1
#     }
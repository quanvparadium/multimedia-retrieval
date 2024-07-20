import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from components.preprocessing.document.routes import documentPreprocessRouter

chat_app = FastAPI()
# 
origins = [
    f"{os.getenv('HOST')}",
    f"{os.getenv('HOST')}:{os.getenv('FRONTEND_PORT')}",
]

chat_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_app.include_router(router=documentPreprocessRouter, prefix='/api/preprocessing/document')

if __name__ == '__main__':   
    import uvicorn
    uvicorn.run(chat_app, host=os.getenv('HOST'), port=int(os.getenv("CHATAPP_PORT"))) 
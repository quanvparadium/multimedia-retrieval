import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import mainRouter
from dotenv import load_dotenv
load_dotenv()


chat_app = FastAPI()
# 
origins = [
    f"http://{os.getenv('HOST')}",
    f"http://{os.getenv('HOST')}:{os.getenv('FRONTEND_PORT')}",
]

from connections.postgres import psg_manager
psg_manager.create_tables()

chat_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_app.include_router(router=mainRouter)


if __name__ == '__main__':   
    import uvicorn
    uvicorn.run(chat_app, host=os.getenv('HOST'), port=int(os.getenv("CHATAPP_PORT"))) 
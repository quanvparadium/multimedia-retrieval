import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routes import mainRouter
from config.index import *
from dotenv import load_dotenv
load_dotenv()
TESTING = False
app = FastAPI()
# 
origins = [
    "http://localhost",
    f"http://localhost:{os.getenv('FRONTEND_PORT')}",
]

# app.include_router(router=mainRouter, prefix='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if TESTING:
    print("\033[36m>>> Loading test database ...\033[0m")
    from connections.postgres import test_psg_manager
    test_psg_manager.create_tables()
else:
    print("\033[36m>>> Loading database ...\033[0m")
    from connections.postgres import psg_manager
    psg_manager.create_tables()

if __name__ == '__main__':   
    import uvicorn
    print("HOST: ", os.getenv('HOST'))
    print("PORT: ", os.getenv('PORT'))
    
    uvicorn.run(app, host=os.getenv('HOST'), port=int(os.getenv("PORT"))) 
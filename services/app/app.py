import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.index import *
from dotenv import load_dotenv
load_dotenv()


import subprocess
print("Prepare run pip install ...")
# cmd = ["pip", "--default-timeout=2000", "install", "easyocr", "--quiet"]
cmd = ["pip", "--default-timeout=2000", "install", "easyocr", "--quiet"]
r = subprocess.check_output(cmd)
cmd = ["pip", "--default-timeout=2000", "install", "opencv-python-headless==4.5.4.60", "--quiet"]
r = subprocess.check_output(cmd)


app = FastAPI()
# 
origins = [
    "http://localhost",
    f"http://localhost:{os.getenv('FRONTEND_PORT')}",
]

from routes import mainRouter
app.include_router(router=mainRouter, prefix='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TESTING = False
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
    uvicorn.run(app, host=os.getenv('HOST'), port=int(os.getenv("PORT"))) 
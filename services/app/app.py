import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import mainRouter
from dotenv import load_dotenv
load_dotenv()
# from routes.item_routes import router as item_router
print("Accept Origin: ", f"{os.getenv('HOST')}:{os.getenv('FRONTEND_PORT')}")

app = FastAPI()
# 
origins = [
    f"{os.getenv('HOST')}",
    f"{os.getenv('HOST')}:{os.getenv('FRONTEND_PORT')}",
]
app.include_router(router=mainRouter, prefix='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == '__main__':   
    import uvicorn
    uvicorn.run(app, host=os.getenv('HOST'), port=int(os.getenv("PORT"))) 
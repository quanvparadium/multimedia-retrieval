import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
# from routes.item_routes import router as item_router
print("Accept Origin: ", f"http://localhost:{os.getenv('FRONTEND_PORT')}")

app = FastAPI()
# 
origins = [
    "http://localhost",
    f"http://localhost:{os.getenv('FRONTEND_PORT')}",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.search import searchRouter as search_router
# app.include_router(item_router)
app.include_router(search_router, prefix='/search')
# app.include_router()

if __name__ == '__main__':   
    import uvicorn
    uvicorn.run(app, host=os.getenv('HOST'), port=int(os.getenv("PORT"))) 
    # app.run(debug=False, )
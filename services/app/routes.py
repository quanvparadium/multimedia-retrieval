import os
from fastapi import APIRouter, HTTPException
from components.preprocessing.video.routes import videoPreprocessRouter

# from components.extract.routes import extractRouter
from components.search.routes import searchRouter
from tests.routes import testRouter

mainRouter = APIRouter()

mainRouter.include_router(router=videoPreprocessRouter, prefix="/preprocessing")
mainRouter.include_router(router=searchRouter, prefix="/search")
mainRouter.include_router(router=testRouter, prefix="/test")

@mainRouter.get("/")
def home():
    return {
        'message': 1
    }
    
@mainRouter.get("/reset-domain")
def reset_domain():
    import requests
    from datetime import datetime
    print(os.getenv('DOMAIN_FILE'))
    domain = os.getenv('DOMAIN_FILE')if os.getenv('DOMAIN_FILE') else 'https://drive.google.com/uc?export=download&id=1n5Famq339vspIxwT7P5jiPdTQSdOvYll'
    start_time = datetime.now()
    response = requests.get(domain)
    if response.status_code != 200:
        return {
            "message": "Ngrok domain could not be found!"
        }
    else:
        ngrok_url = response.content.decode('utf-8')
        domain_response = requests.get(f"{ngrok_url}/api")
        if domain_response.status_code != 200:
            return {
                "message": "Ngrok domain found but API is not working!",
                "domain": ngrok_url,
            }
        
        local_domain_file = 'local_domain.txt'
        with open(local_domain_file, 'w') as file:
            file.write(ngrok_url)
        return {
            "message": "Reset domain successfully!",
            "domain": ngrok_url,
            "request_time": datetime.now() - start_time
        }

@mainRouter.get("/migrate")
def home():
    from connections.postgres import psg_manager
    psg_manager.create_tables()
    return {
        'message': 1
    }
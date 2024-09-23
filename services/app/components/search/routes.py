import concurrent.futures
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from pydantic import BaseModel
from typing import List
from .video.services import VideoSearch, OCRSearch, EnsembleSearch
from .video.utils import remove_ensemble_ranker

from connections.postgres import psg_manager
from entities import Keyframe
from config.status import HTTPSTATUS
from sqlalchemy import and_

searchRouter = APIRouter()

##############################- DEFINE REQUEST BODY -####################################

# Dùng để test 1 video
class VideoSearchBody(BaseModel):
    query: str
    limit: int
    file_id: str
    user_id: str
    ocr: str
    prior: str = "ocr"
    
    
##############################- SEARCH WITH TEXT INPUT -##############################
# Search specific folder with query input
class FolderQuerySearchBody(BaseModel):
    query: str
    limit: int
    files: List[str]
    user_id: str
    ocr: str
    prior: str = "ocr"
    
# Search all with query input (User_id required) 
    
class AllQuerySearchBody(BaseModel):
    query: str
    limit: int
    user_id: str
    ocr: str
    prior: str = "ocr"
    
##############################- SEARCH WITH IMAGE INPUT -##############################
class FolderImageSearchBody(BaseModel):
    image_path: str
    limit: int
    files: List[str]
    user_id: str
    ocr: str
    prior: str = "ocr"
  
class AllImageSearchBody(BaseModel):
    image_path: str
    limit: int
    user_id: str
    ocr: str
    prior: str = "ocr"
    
#########################################- END -#########################################
    

@searchRouter.post('/keyframe')
def video_search(req: VideoSearchBody):
    try:
        int(req.user_id)
    except Exception as e:
        return JSONResponse(
            status_code= 400, 
            content= {
                "status_code": 400,
                "message": f"User_id({req.user_id}) could not be converted into IntegerType."
            }
        )
        
    hashed_session = psg_manager.hash_session(user_id= req.user_id)
    db = psg_manager.get_session(hased_session= hashed_session)
    
    result = db.query(Keyframe).filter(and_(Keyframe.file_id == req.file_id, Keyframe.user_id == req.user_id)).all()
    if len(result) == 0:
        return JSONResponse(
            status_code=HTTPSTATUS.NOT_FOUND.code(),
            content= {
                "status_code": HTTPSTATUS.NOT_FOUND.code(),
                "message": f"File_id({req.file_id}) belongs to user_id({req.user_id}) is not existed in cluster database."
            }
        ) 
        
    payload = {
        "query": req.query,
        "limit": req.limit,
        "file_id": req.file_id,
        "user_id": req.user_id
    }
    
    ocr_payload = {
        "ocr": req.ocr,
        "limit": req.limit,
        "file_id": req.file_id,
        "user_id": req.user_id        
    }
    is_ocr_search = (req.ocr.strip() != "")
    if is_ocr_search:
        print("\033[93m>>> Multi processing is being used.\033[0m")
        vector_result = {
            "status_code": HTTPSTATUS.BAD_REQUEST,
        }
        if req.query.strip() != "":
            vector_result = VideoSearch.query_video(payload)
        
        ocr_result = OCRSearch.query_video(ocr_payload)

        # with concurrent.futures.ProcessPoolExecutor() as executor:
        #     future_1 = executor.submit(VideoSearch.query_video, payload)
        #     future_2 = executor.submit(OCRSearch.query_video, ocr_payload)

        #     vector_result = future_1.result()
        #     ocr_result = future_2.result()

        print(vector_result)
        print(ocr_result)        
    else:
        print("\033[93m>>> OCR full text search won't be used.\033[0m")
        vector_result = VideoSearch.query_video(payload)
        
        # Thêm ocr_result để tránh bị "No declared"
        ocr_result = {
            "status_code": HTTPSTATUS.OK.code(),
        }
    
    if vector_result['status_code'] == HTTPSTATUS.OK.code() and ocr_result['status_code'] == HTTPSTATUS.OK.code():  
        if is_ocr_search == False:
            return vector_result
        else:
            if req.query.strip() == "":
                return ocr_result
            semantic_ranker = vector_result['result']['data']
            ocr_ranker = ocr_result['result']['data']
            
            combine_ranker = EnsembleSearch.hybrid_search(
                ranker_one= semantic_ranker, 
                ranker_two = ocr_ranker)
            
            if combine_ranker['message'] == 'failed':
                return JSONResponse(
                    status_code= HTTPSTATUS.BAD_REQUEST.code(),
                    content= {
                        "message": "Priority weight is not satisfied!"
                    }
                )
            result = {
                "status_code": vector_result['status_code'],
                "message": "Hybrid search successfully!",
                "result": {
                    "data": remove_ensemble_ranker(combine_ranker['data'])
                }
            }
    else:
        # Trường hợp 1 trong 2 bị lỗi status_code
        # Case 1: semantic Vector status != HTTPSTATUS.OK.code() => 
        #       req.query.strip() == "" => Ưu tiên trả về ocr vector error
        #       req.query.strip() != "" => Ưu tiên trả về semantic vector error
        
        # Case 2: OCR status != HTTPSTATUS.OK.code() => Chắc chắn is_ocr_result = True => Trả về ocr_result (có status_code, message)
        if vector_result["status_code"] == HTTPSTATUS.OK.code():
            result = vector_result
            return JSONResponse(
                status_code= result["status_code"],
                content= result
            )            
        elif ocr_result['status_code'] == HTTPSTATUS.OK.code():
            # return ocr_result
            result = ocr_result
            return JSONResponse(
                status_code= result["status_code"],
                content= result
            )             
        else:
            result = vector_result if req.query.strip() != "" else ocr_result
            return JSONResponse(
                status_code= result["status_code"],
                content= result
            )     
        # result = vector_result if vector_result["status_code"] != HTTPSTATUS.OK.code() else ocr_result
    
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )
    
@searchRouter.post('/folder/keyframe/text')
def folder_search(req: FolderQuerySearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id
    }
    result = VideoSearch.query_folder_with_text(payload)
    return {
        "message": "Search text successfully!",
        "result": result
    } 
    
@searchRouter.post('/all/keyframe/text')
def all_search_by_text(req: AllQuerySearchBody):
    payload = {
        "query": req.query,
        "limit": req.limit,
        "user_id": req.user_id
    }
    result = VideoSearch.query_all_folder_with_text(payload)
    return {
        "message": "Search all folders successfully!",
        "result": result
    } 
    
    
    
@searchRouter.post('/folder/keyframe/image')
def folder_search(req: FolderImageSearchBody):
    payload = {
        "image_path": req.image_path,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id,
        "ocr": req.ocr
    }
    result = VideoSearch.query_folder_with_image(payload)
    return {
        "message": "Search image successfully!",
        "result": result
    } 

@searchRouter.post('/all/keyframe/text')
def all_search_by_image(req: AllQuerySearchBody):
    payload = {
        "image_path": req.image_path,
        "limit": req.limit,
        "user_id": req.user_id
    }
    result = VideoSearch.query_all_folder_with_image(payload)
    return {
        "message": "Search all folders successfully!",
        "result": result
    } 
    
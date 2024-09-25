import concurrent.futures
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from pydantic import BaseModel
from typing import List
from .video.services import VideoSearch, OCRSearch, EnsembleSearch, DatabaseServices
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
    prior: str = "semantic"
    
    
##############################- SEARCH WITH TEXT INPUT -##############################
# Search specific folder with query input
class FolderQuerySearchBody(BaseModel):
    query: str
    limit: int
    files: List[str]
    user_id: str
    ocr: str
    prior: str = "semantic"
    
# Search all with query input (User_id required) 
    
class AllQuerySearchBody(BaseModel):
    query: str
    limit: int
    user_id: str
    ocr: str
    prior: str = "semantic"
    
##############################- SEARCH WITH IMAGE INPUT -##############################
class FolderImageSearchBody(BaseModel):
    image_path: str
    limit: int
    files: List[str]
    user_id: str
  
class AllImageSearchBody(BaseModel):
    image_path: str
    limit: int
    user_id: str
    
def WrapperResponse(status_code: int, message: str, data: List[object] = None):
    if data:
        return JSONResponse(
            status_code= status_code,
            content= {
                "status_code": status_code,
                "message": message,
                "result": {
                    "data": data
                }
            }
        )
    return JSONResponse(
        status_code= status_code,
        content= {
            "status_code": status_code,
            "message": message
        }
    )
#########################################- END -#########################################
    

@searchRouter.post('/keyframe')
def video_search(req: VideoSearchBody):
    if DatabaseServices.is_valid_user(user_id= req.user_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"User_id({req.user_id}) could not be converted into IntegerType."
        )
    if req.prior.lower() not in ['ocr', 'semantic']:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"Priority should be 'ocr' or 'semantic'. Default value is 'ocr'."
        )         
    
    if DatabaseServices.is_file_exist(user_id= req.user_id, file_id= req.file_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.NOT_FOUND.code(),
            message= f"File_id({req.file_id}) belongs to user_id({req.user_id}) is not existed in cluster database."
        )  
    
    if DatabaseServices.is_file_exist_in_other_users(user_id= req.user_id, file_id= req.file_id):
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"File_id({req.file_id}) is existed but belongs to another user_id."
        )          
        
    payload = {
        "query": req.query,
        "limit": req.limit,
        "file_id": req.file_id,
        "user_id": req.user_id,
        "type": "text"
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
            
            weight = 0.3 if req.prior.lower() == 'ocr' else 0.7
            combine_ranker = EnsembleSearch.hybrid_search(
                ranker_one= semantic_ranker, 
                ranker_two = ocr_ranker,
                output_top_k= req.limit,
                weight= weight
            )
            
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
            # Tức là ocr trả về lỗi khác 200 => is_ocr_search = True
            result = vector_result
            return WrapperResponse(
                status_code= HTTPSTATUS.OK.code(),
                message= f"Hybrid search successfully! Keyword {req.ocr} could be not found!",
                data= result['result']['data']
            )
        elif ocr_result['status_code'] == HTTPSTATUS.OK.code():
            # Có thể đầu vào ocr không tồn tại, trả về vector result
            # return ocr_result
            result = ocr_result if is_ocr_search else vector_result
            return JSONResponse(
                status_code= result["status_code"],
                content= result
            )             
        else:
            # Cả hai đều bị lỗi => RẤT HIẾM KHI Semantic search trả lỗi => Ưu tiên trả về nếu query != ''
            result = vector_result if req.query.strip() != "" else ocr_result
            return JSONResponse(
                status_code= result["status_code"],
                content= result
            )     
    
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )
    
@searchRouter.post('/folder/keyframe/text')
def folder_search(req: FolderQuerySearchBody):
    if DatabaseServices.is_valid_user(user_id= req.user_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"User_id({req.user_id}) could not be converted into IntegerType."
        )
    if req.prior.lower() not in ['ocr', 'semantic']:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"Priority should be 'ocr' or 'semantic'. Default value is 'ocr'."
        )         
    for file_id in req.files:
        if DatabaseServices.is_file_exist(user_id= req.user_id, file_id= file_id) == False:
            return WrapperResponse(
                status_code= HTTPSTATUS.NOT_FOUND.code(),
                message= f"File_id({file_id}) belongs to user_id({req.user_id}) is not existed in cluster database."
            ) 
        
        if DatabaseServices.is_file_exist_in_other_users(user_id= req.user_id, file_id= file_id):
            return WrapperResponse(
                status_code= HTTPSTATUS.BAD_REQUEST.code(),
                message= f"File_id({file_id}) is existed but belongs to another user_id."
            ) 
            
    payload = {
        "query": req.query,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id
    }
    
    ocr_payload = {
        "ocr": req.ocr,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id
    }
    if req.query.strip() == "" and req.ocr.strip() == "":
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= "Input data should have 'query' or 'ocr'"
        )
    elif req.ocr.strip() == "":
        result = VideoSearch.query_folder_by_text(payload)
    elif req.query.strip() == "":
        result = OCRSearch.query_folder_by_ocr(ocr_payload)
    else:
        vector_result = VideoSearch.query_folder_by_text(payload)
        ocr_result = OCRSearch.query_folder_by_ocr(ocr_payload)
        if vector_result['status_code'] == HTTPSTATUS.OK.code() \
            and ocr_result['status_code'] == HTTPSTATUS.OK.code():
            semantic_ranker = vector_result['result']['data']
            ocr_ranker = ocr_result['result']['data']
            weight = 0.3 if req.prior.lower() == 'ocr' else 0.7
            combine_ranker = EnsembleSearch.hybrid_search(
                ranker_one=semantic_ranker, 
                ranker_two= ocr_ranker, 
                output_top_k= req.limit, 
                weight=weight
            )
            
            result = {
                "status_code": HTTPSTATUS.OK.code(),
                "message": "Hybrid folder search successfully!",
                "result": {
                    "data": remove_ensemble_ranker(combine_ranker['data'])
                }
            }
     
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )

    
@searchRouter.post('/all/keyframe/text')
def all_search_by_text(req: AllQuerySearchBody):
    if DatabaseServices.is_valid_user(user_id= req.user_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"User_id({req.user_id}) could not be converted into IntegerType."
        )
    if req.prior.lower() not in ['ocr', 'semantic']:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"Priority should be 'ocr' or 'semantic'. Default value is 'ocr'."
        ) 
    
    if DatabaseServices.is_user_exist(user_id= req.user_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.NOT_FOUND.code(),
            message= f"User_id({req.user_id}) is not existed in cluster database."
        )  
    
    payload = {
        "query": req.query,
        "limit": req.limit,
        "user_id": req.user_id
    }
    ocr_payload = {
        "ocr": req.ocr,
        "limit": req.limit,
        "user_id": req.user_id
    }

    
    if req.query.strip() == "" and req.ocr.strip() == "":
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= "Input data should have 'query' or 'ocr'"
        )
    elif req.ocr.strip() == "":
        result = VideoSearch.query_user_by_text(payload)
    elif req.query.strip() == "":
        result = OCRSearch.query_user_by_ocr(ocr_payload)
    else:
        vector_result = VideoSearch.query_user_by_text(payload)
        ocr_result = OCRSearch.query_user_by_ocr(ocr_payload)        
        if vector_result['status_code'] == HTTPSTATUS.OK.code() \
            and ocr_result['status_code'] == HTTPSTATUS.OK.code():
            semantic_ranker = vector_result['result']['data']
            ocr_ranker = ocr_result['result']['data']
            weight = 0.3 if req.prior.lower() == 'ocr' else 0.7
            combine_ranker = EnsembleSearch.hybrid_search(
                ranker_one=semantic_ranker, 
                ranker_two= ocr_ranker, 
                output_top_k= req.limit, 
                weight=weight
            )
            
            result = {
                "status_code": HTTPSTATUS.OK.code(),
                "message": "Hybrid user search successfully!",
                "result": {
                    "data": remove_ensemble_ranker(combine_ranker['data'])
                }
            }    
        elif ocr_result["status_code"] != HTTPSTATUS.OK.code():
            # Tức là ocr trả về lỗi khác 200 => is_ocr_search = True
            result = vector_result
            return WrapperResponse(
                status_code= HTTPSTATUS.OK.code(),
                message= f"Hybrid user search successfully! Keyword {req.ocr} could be not found!",
                data= result['result']['data']
            )
        elif vector_result['status_code'] != HTTPSTATUS.OK.code():
            # Có thể đầu vào ocr không tồn tại, trả về vector result
            # return ocr_result
            result = ocr_result          
        else:
            # Cả hai đều bị lỗi => RẤT HIẾM KHI Semantic search trả lỗi => Ưu tiên trả về nếu query != ''
            result = vector_result if req.query.strip() != "" else ocr_result            
            
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )
    
@searchRouter.post('/folder/keyframe/image')
def folder_search(req: FolderImageSearchBody):
    if DatabaseServices.is_valid_user(user_id= req.user_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.BAD_REQUEST.code(),
            message= f"User_id({req.user_id}) could not be converted into IntegerType."
        )
    
    if DatabaseServices.is_user_exist(user_id= req.user_id) == False:
        return WrapperResponse(
            status_code= HTTPSTATUS.NOT_FOUND.code(),
            message= f"User_id({req.user_id}) is not existed in cluster database."
        )     
        
    payload = {
        "image_path": req.image_path,
        "limit": req.limit,
        "files": req.files,
        "user_id": req.user_id,
    }
    result = VideoSearch.query_folder_by_image(payload)
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )

@searchRouter.post('/all/keyframe/image')
def all_search_by_image(req: AllImageSearchBody):
    payload = {
        "image_path": req.image_path,
        "limit": req.limit,
        "user_id": req.user_id
    }
    result = VideoSearch.query_user_by_image(payload)
    return JSONResponse(
        status_code= result["status_code"],
        content= result
    )
    
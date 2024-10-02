from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from entities.keyframe import Keyframe
from sqlalchemy import and_
from typing import List
keyframeRouter = APIRouter()

from pydantic import BaseModel

from connections.postgres import psg_manager
print("APISUADUAISDUASIDUASDIASUD")



class deleteRequestBody(BaseModel):
    files: List[str]
    user_id: str
    
@keyframeRouter.post("/restore")
def restore(req: deleteRequestBody):
    print("Restoring...")
    hashed_session = psg_manager.hash_session(user_id= req.user_id)
    db_session = psg_manager.get_session(hased_session= hashed_session)
    files = req.files    
    
    for file_id in files:
        result = db_session.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == req.user_id)).all()      
        is_valid = (len(result) > 0)
        if is_valid == False:
            return {
                "status_code": 404,
                "message": f"File_id({file_id}) of user({req.user_id}) may not existed in cluster database."
            }        
    
    for file_id in files:
        result = db_session.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == req.user_id)).all()
        if len(result) == 0:
            print(f"\033[31m>>> File ID({file_id}) is not existed in database.\033[0m")
        else:
            for keyframe in result:
                keyframe.isDeleted = False
            db_session.commit()  # Lưu thay đổi
            print(f"\033[32m>>> File ID({file_id}) is temporarily restored.\033[0m")
    return JSONResponse(
        status_code=200,
        content= {
            "status_code": 200,
            "message": f"All files in folder are temporarily restored."
        }
    )      
    
@keyframeRouter.delete("/temporary")
def delete_temporary(req: deleteRequestBody):
    print("Deleting...")
    hashed_session = psg_manager.hash_session(user_id= req.user_id)
    db_session = psg_manager.get_session(hased_session= hashed_session)
    files = req.files    
    
    for file_id in files:
        result = db_session.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == req.user_id)).all()      
        is_valid = (len(result) > 0)
        if is_valid == False:
            return {
                "status_code": 404,
                "message": f"File_id({file_id}) of user({req.user_id}) may not existed in cluster database."
            }        
    
    for file_id in files:
        result = db_session.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == req.user_id)).all()
        if len(result) == 0:
            print(f"\033[31m>>> File ID({file_id}) is not existed in database.\033[0m")
        else:
            for keyframe in result:
                keyframe.isDeleted = True
            db_session.commit()  # Lưu thay đổi
            print(f"\033[32m>>> File ID({file_id}) is temporarily deleted.\033[0m")
    return JSONResponse(
        status_code=200,
        content= {
            "status_code": 200,
            "message": f"All files in folder are temporarily deleted."
        }
    )        

@keyframeRouter.delete("/")
def delete(req: deleteRequestBody):
    hashed_session = psg_manager.hash_session(user_id= req.user_id)
    db_session = psg_manager.get_session(hased_session= hashed_session)
    
    files = req.files   
    user_id = req.user_id 
    
    for file_id in files:
        # result = db_session.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == req.user_id)).all()      
        deleted_count = db_session.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == user_id)).delete(synchronize_session=False)
        
        if deleted_count == 0:
            raise HTTPException(status_code=400, detail="No keyframes found to delete")
        else:
            db_session.commit() 
    return JSONResponse(
        status_code=200,
        content= {
            "status_code": 200,
            "message": f"All files in folder are permantently deleted."
        }
    )                       

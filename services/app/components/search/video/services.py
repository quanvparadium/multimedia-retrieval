import os
import sys
import torch
import numpy as np
import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from connections.postgres import psg_manager
from sqlalchemy import text
from PIL import Image
from components.ai.visual import DEVICE, BLIP_MODEL, BLIP_TEXT_PROCESSORS, BLIP_VIS_PROCESSORS

def get_result(kf):
    return {
        "fileId": kf.fileId,
        "byte_offset": kf.byte_offset,
        "keyframeId": kf.id,
        "cosine_score": kf.distance,
        "frame_number": kf.frame_number,
        "frame_second": kf.frame_second
    }

def cosine_score(kf):
    return kf['cosine_score']

class VideoSearch:        
    @staticmethod
    def query_video(payload): 
        query = payload['query']
        limit = payload['limit']
        fileId = payload['fileId']
        txt = BLIP_TEXT_PROCESSORS["eval"](query)
        text_features = BLIP_MODEL.encode_text(txt, DEVICE).cpu().detach().numpy()
        text_features = np.array(text_features).astype(float).flatten().tolist()
        
        db = psg_manager.get_session()
        try:
            query_vector_str = f"[{','.join(map(str, text_features))}]"
            sql_query = text(f"""
                SELECT *, (embedding <=> :query_vector) AS distance
                FROM keyframes
                WHERE "fileId" = :video_id
                ORDER BY distance 
                LIMIT :limit;
            """)
            kf_res = db.execute(sql_query, {'video_id': fileId, 'query_vector': query_vector_str, 'limit': limit}).fetchall()
            for kf in kf_res:
                print("Index ", kf.id, "- Address: ", kf.address )
                print(kf)
                print("Distance: ", kf.distance)
            if kf_res:
                print("Return: ", [kf.address for kf in kf_res])
                
                return [{
                    "Address": kf.address,
                    "Cosine_distance": kf.distance
                } for kf in kf_res]
            return None
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    @staticmethod
    def query_folder_with_text(payload):
        # Định nghĩa câu lệnh SQL với placeholders
        db = psg_manager.get_session()
        
        sql_query = text("""
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "fileId" = :video_id
            ORDER BY distance
            LIMIT :limit;
        """)
        
        query = payload['query']
        limit = payload['limit']
        files = payload['files']
        
        txt = BLIP_TEXT_PROCESSORS["eval"](query)
        text_features = BLIP_MODEL.encode_text(txt, DEVICE).cpu().detach().numpy()
        text_features = np.array(text_features).astype(float).flatten().tolist()
        query_vector_str = f"[{','.join(map(str, text_features))}]"
        
        all_keyframes = []
        try:
            for file_id in files:
                params = {
                    "video_id": file_id,
                    "query_vector": query_vector_str,  # Assuming req.query is the vector or will be converted to one
                    "limit": limit
                }
                begin_time = datetime.datetime.now()
                result = db.execute(sql_query, params)
                keyframes = result.fetchall()
                print("Total time search: ", datetime.datetime.now() - begin_time)

                current_kf = [get_result(kf) for kf in keyframes]
                all_keyframes = [*all_keyframes, *current_kf]
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
        print("ALL KEYFRAMES WITH TEXT SEARCH: ", all_keyframes)
        result_keyframes = sorted(all_keyframes, key= cosine_score)
        return result_keyframes
    
    @staticmethod
    def query_folder_with_image(payload):
        # Định nghĩa câu lệnh SQL với placeholders
        db = psg_manager.get_session()
        
        sql_query = text("""
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "fileId" = :video_id
            ORDER BY distance
            LIMIT :limit;
        """)
        
        raw_image = Image.open(payload['image_path']).convert('RGB')
        limit = payload['limit']
        files = payload['files']
        
        img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE)
        img_features = BLIP_MODEL.encode_image(img).cpu().detach().numpy()
        img_features = np.array(img_features).astype(float).flatten().tolist()
        query_vector_str = f"[{','.join(map(str, img_features))}]"
        
        all_keyframes = []
        try:
            for file_id in files:
                params = {
                    "video_id": file_id,
                    "query_vector": query_vector_str,  # Assuming req.query is the vector or will be converted to one
                    "limit": limit
                }
                result = db.execute(sql_query, params)
                keyframes = result.fetchall()
                current_kf = [get_result(kf) for kf in keyframes]
                all_keyframes = [*all_keyframes, *current_kf]
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
        print("ALL KEYFRAMES WITH IMAGE SEARCH: ", all_keyframes)

        result_keyframes = sorted(all_keyframes, key= cosine_score)
        return result_keyframes
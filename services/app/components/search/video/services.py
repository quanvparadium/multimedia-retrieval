import os
import sys
import torch
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from connections.postgres import psg_manager
from sqlalchemy import text
from components.ai.constant import DEVICE, BLIP_MODEL, BLIP_TEXT_PROCESSORS, BLIP_VIS_PROCESSORS


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
            SELECT * FROM keyframes
            WHERE "fileId" = :video_id
            ORDER BY embedding <-> :query_vector LIMIT :limit;
            """)
            kf_res = db.execute(sql_query, {'video_id': fileId, 'query_vector': query_vector_str, 'limit': limit})
            for kf in kf_res:
                print("Index ", kf.id, "- Address: ", kf.address )
            if kf_res:
                print("Return: ", [kf.address for kf in kf_res])
                return [kf.address for kf in kf_res]
            return None
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    @staticmethod
    def query_folder(payload):
        # Định nghĩa câu lệnh SQL với placeholders
        db = psg_manager.get_session()
        
        sql_query = text("""
            SELECT * FROM keyframes
            WHERE "fileId" = :video_id
            ORDER BY embedding <-> :query_vector
            LIMIT :limit;
        """)
        
        query = payload['query']
        limit = payload['limit']
        files = payload['files']
        
        txt = BLIP_TEXT_PROCESSORS["eval"](query)
        text_features = BLIP_MODEL.encode_text(txt, DEVICE).cpu().detach().numpy()
        text_features = np.array(text_features).astype(float).flatten().tolist()
        query_vector_str = f"[{','.join(map(str, text_features))}]"
        
        all_keyframes = dict({})
        try:
            for file_id in files:
                params = {
                    "video_id": file_id,
                    "query_vector": query_vector_str,  # Assuming req.query is the vector or will be converted to one
                    "limit": limit
                }
                result = db.execute(sql_query, params)
                keyframes = result.fetchall()
                all_keyframes[file_id] = [kf.address for kf in keyframes]
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
        print("ALL KEYFRAMES: ", all_keyframes)
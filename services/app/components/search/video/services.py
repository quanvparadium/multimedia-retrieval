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
        "file_id": kf.file_id,
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
        file_id = payload['file_id']
        txt = BLIP_TEXT_PROCESSORS["eval"](query)
        text_features = BLIP_MODEL.encode_text(txt, DEVICE).cpu().detach().numpy()
        text_features = np.array(text_features).astype(float).flatten().tolist()
        
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)  
        try:
            query_vector_str = f"[{','.join(map(str, text_features))}]"
            sql_query = text(f"""
                SELECT *, (embedding <=> :query_vector) AS distance
                FROM keyframes
                WHERE "file_id" = :video_id
                ORDER BY distance 
                LIMIT :limit;
            """)
            kf_res = db.execute(sql_query, {'video_id': file_id, 'query_vector': query_vector_str, 'limit': limit}).fetchall()
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
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)  
        
        sql_query = text("""
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "file_id" = :video_id
            ORDER BY distance
            LIMIT :limit;
        """)
        analysis_sql_query = text("""
            EXPLAIN ANALYZE
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "file_id" = :video_id
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
                analysis = db.execute(analysis_sql_query, params).fetchall()
                print("Analysis: ", analysis)
                keyframes = result.fetchall()
                print("Total time search: ", datetime.datetime.now() - begin_time)

                current_kf = [get_result(kf) for kf in keyframes if kf.distance <= 1.19]
                all_keyframes = [*all_keyframes, *current_kf]
        except Exception as e:
            db.rollback()
            print("Error: ", e)
            return {
                "message": "Search folders with text failed"
            }        
        finally:
            db.close()
    
        print("ALL KEYFRAMES WITH TEXT SEARCH: ", all_keyframes)
        result_keyframes = sorted(all_keyframes, key= cosine_score)
        return result_keyframes
    
    @staticmethod
    def query_all_folder_with_text(payload):
        """
            Input:
                payload: dictionary
                    - query
                    - limit
                    - user_id
        """
        # Định nghĩa câu lệnh SQL với placeholders
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)  
        
        sql_query = text("""
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "user_id" = :user_id
            ORDER BY distance
            LIMIT :limit;
        """)

        query = payload['query']
        limit = payload['limit']
        user_id = payload['user_id']
        
        txt = BLIP_TEXT_PROCESSORS["eval"](query)
        text_features = BLIP_MODEL.encode_text(txt, DEVICE).cpu().detach().numpy()
        text_features = np.array(text_features).astype(float).flatten().tolist()
        query_vector_str = f"[{','.join(map(str, text_features))}]"
        
        try:
            params = {
                "user_id": user_id,
                "query_vector": query_vector_str,  # Assuming req.query is the vector or will be converted to one
                "limit": limit
            }
            begin_time = datetime.datetime.now()
            result = db.execute(sql_query, params)
                # analysis = db.execute(analysis_sql_query, params).fetchall()
                # print("Analysis: ", analysis)
            keyframes = result.fetchall()
            print("Total time search: ", datetime.datetime.now() - begin_time)

            current_kf = [get_result(kf) for kf in keyframes]
            return current_kf
        except Exception as e:
            db.rollback()
            print("Error: ", e)
            return {
                "message": "Search all folders by text failed!"
            }
        finally:
            db.close()
    
    @staticmethod
    def query_folder_with_image(payload):
        # Định nghĩa câu lệnh SQL với placeholders
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)  
        
        sql_query = text("""
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "file_id" = :video_id
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
            print("Error: ", e)
            return {
                "message": "Search folders with image failed"
            }
        finally:
            db.close()
    
        print("ALL KEYFRAMES WITH IMAGE SEARCH: ", all_keyframes)

        result_keyframes = sorted(all_keyframes, key= cosine_score)
        return result_keyframes
    
    
    @staticmethod
    def query_all_folder_with_image(payload):
        """
            Input:
                payload: dictionary
                    - image_path
                    - limit
                    - user_id
        """
        # Định nghĩa câu lệnh SQL với placeholders
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)  
        
        sql_query = text("""
            SELECT *, (embedding <-> :query_vector) AS distance
            FROM keyframes
            WHERE "user_id" = :user_id
            ORDER BY distance
            LIMIT :limit;
        """)

        raw_image = Image.open(payload['image_path']).convert('RGB')
        limit = payload['limit']
        user_id = payload['user_id']
        
        img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE)
        img_features = BLIP_MODEL.encode_image(img).cpu().detach().numpy()
        img_features = np.array(img_features).astype(float).flatten().tolist()
        query_vector_str = f"[{','.join(map(str, img_features))}]"
        
        try:
            params = {
                "user_id": user_id,
                "query_vector": query_vector_str,  # Assuming req.query is the vector or will be converted to one
                "limit": limit
            }
            begin_time = datetime.datetime.now()
            result = db.execute(sql_query, params)
                # analysis = db.execute(analysis_sql_query, params).fetchall()
                # print("Analysis: ", analysis)
            keyframes = result.fetchall()
            print("Total time search: ", datetime.datetime.now() - begin_time)

            current_kf = [get_result(kf) for kf in keyframes]
            return current_kf
        except Exception as e:
            db.rollback()
            print("Error: ", e)
            return {
                "message": "Search all folders with image failed!"
            }
        finally:
            db.close()    
            
class OCRSearch:
    @staticmethod
    def query_video(payload):          
        ocr = payload['ocr']
        limit = payload['limit']
        file_id = payload['file_id']  
        user_id = payload['user_id']  
        
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)
        sql_query = text(f"""
            SELECT *, ts_rank(to_tsvector('english', ocr), plainto_tsquery('english', :search_term)) AS kw_score
            FROM keyframes
            WHERE "user_id" = :user_id
            AND "file_id" = :file_id
            AND to_tsvector('english', ocr) @@ plainto_tsquery('english', :search_term)
            ORDER BY kw_score DESC
            LIMIT :limit;
        """)        
        kf_ocr_res = db.execute(sql_query, {
            'user_id': user_id,
            'file_id': file_id,
            'search_term': ocr,
            'limit': limit
        }).fetchall()
        for kf_ocr in kf_ocr_res:
            print(kf_ocr.kw_score)
        print("LENGTH OCR RESULT: ", len(kf_ocr_res))  
        print("OCR RESULT: ", kf_ocr_res)
        return kf_ocr_res
                
        return {
            "message": "Search OCR successfully"
        }   
             
class EnsembleSearch:
    @staticmethod
    def hybrid_search(ranker_one, ranker_two, output_top_k = 5):
        assert len(ranker_one) >= len(ranker_two), "Ranker one results must be greater than ranker two results"
        return ranker_one
            
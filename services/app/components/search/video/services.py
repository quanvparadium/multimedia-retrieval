import os
import sys
import torch
import numpy as np
import datetime
from typing import List
from .utils import get_rank, get_result, cosine_score, kw_score
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from connections.postgres import psg_manager
from entities import Keyframe
from sqlalchemy import text, and_
from PIL import Image
from components.ai.visual import DEVICE, BLIP_MODEL, BLIP_TEXT_PROCESSORS, BLIP_VIS_PROCESSORS
from config.status import HTTPSTATUS

class DatabaseServices:
    @staticmethod
    def is_user_exist(user_id: str):
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db = psg_manager.get_session(hased_session= hashed_session)
            
        result = db.query(Keyframe).filter(Keyframe.user_id == user_id).all()
        if len(result) == 0:
            return False
        return True
    
    @staticmethod
    def is_file_exist(user_id: str, file_id: str):
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db = psg_manager.get_session(hased_session= hashed_session)
            
        result = db.query(Keyframe).filter(and_(Keyframe.file_id == file_id, Keyframe.user_id == user_id)).all()
        if len(result) == 0:
            return False
        return True  
    
    @staticmethod
    def is_file_exist_in_other_users(user_id: str, file_id: str):
        hashed_session = psg_manager.hash_session(user_id= user_id)
        db = psg_manager.get_session(hased_session= hashed_session)
            
        result = db.query(Keyframe).filter(Keyframe.file_id == file_id).all()
        is_file_exists_in_an_user = (len(result) > 0)
        is_file_exists_in_specific_user = DatabaseServices.is_file_exist(user_id= user_id, file_id= file_id)
        if (is_file_exists_in_specific_user == False) and (is_file_exists_in_an_user == True): 
            print("File_id is existed but not belongs to input user_id")
            return True
        return False
    
    
    @staticmethod
    def is_valid_user(user_id: str):
        try:
            int(user_id)
            return True
        except:
            return False
            
        

class VideoSearch:        
    @staticmethod
    def query_video(payload):
        """
            payload: dictionary
                - query: str
                - limit: int
                - file_id: str
                - user_id: str (Must be convert into integer)
            
            Output:
                - status_code: 200/400/404
                - message": "..."
                - result: dictionary
                    - "data": List[dict]
        """         
        query = payload['query']
        limit = payload['limit']
        file_id = payload['file_id']
        user_id = payload['user_id']
        
        txt = BLIP_TEXT_PROCESSORS["eval"](query)
        text_features = BLIP_MODEL.encode_text(txt, DEVICE).cpu().detach().numpy()
        text_features = np.array(text_features).astype(float).flatten().tolist()
        
        hashed_session = psg_manager.hash_session(user_id= user_id)
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
            kf_res = db.execute(sql_query, {
                'video_id': file_id, 
                'query_vector': query_vector_str, 
                'limit': limit
            }).fetchall()
            
            # for kf in kf_res:
            #     print("Index ", kf.id, "- Address: ", kf.address )
            #     print(kf)
            #     print("Distance: ", kf.distance)
            if len(kf_res) > 0:
                print("Return: ", [kf.address for kf in kf_res])
                score_kf = [kf.distance for kf in kf_res]
                ranker = get_rank(score_kf)
                return {
                    "status_code": HTTPSTATUS.OK.code(),
                    "message": "Semantic search successfully!",
                    "result": {
                        "data": [{
                            "ID": f"{kf.user_id}-{kf.file_id}-{kf.frame_number}",
                            "file_id": kf.file_id,
                            "byte_offset": kf.byte_offset,
                            "keyframe_id": kf.id,
                            "cosine_score": kf.distance,
                            "frame_number": kf.frame_number,
                            "frame_second": kf.frame_second,                           
                            "Rank_score": ranker[idx]
                        } for idx, kf in enumerate(kf_res)]
                    }
                }
            else:
                return {
                    "status_code": HTTPSTATUS.NOT_FOUND.code(),
                    "message": f"File_id({file_id}) may not existed."
                }
        except Exception as e:
            db.rollback()
            return {
                "status_code": HTTPSTATUS.BAD_REQUEST.code(),
                "error": str(e)
            }
        finally:
            db.close()
   
    @staticmethod
    def query_folder_by_text(payload):
        """
            Input: 
                payload: dictionary
                    - query: str
                    - limit: int
                    - files: List[str]
                    - user_id: str (Must be convert into integer)
            
            Output:
                - status_code: 200/400/404
                - message": "..."
                - result: dictionary
                    - "data": List[dict]
            
            Description: Search specific folder by user query input
        """    
        query = payload['query']
        limit = payload['limit']
        user_id = payload['user_id']
        files = payload['files']         
        
        for file_id in files:
            is_valid = DatabaseServices.is_file_exist(user_id= user_id, file_id= file_id)
            if is_valid == False:
                return {
                    "status_code": HTTPSTATUS.NOT_FOUND.code(),
                    "message": f"File_id({file_id}) of user({user_id}) may not existed."
                }    
        
        all_keyframes = []
        for file_id in files:                
            payload_per_file = {
                "query": query,
                "limit": limit,
                "file_id": file_id,
                "user_id": user_id
            }
            result = VideoSearch.query_video(payload= payload_per_file)
            if result['status_code'] == HTTPSTATUS.OK.code():
                data = result['result']['data']
                current_kf = [kf for kf in data if kf['cosine_score'] <= 1.19]
                all_keyframes = [*all_keyframes, *current_kf]
            else:
                print(f"\033[91m>>> Please check again file_id({file_id}) - user_id({user_id})!\033[0m")
        return {
            "status_code": HTTPSTATUS.OK.code(),
            "message": "Semantic folder search successfully!",
            "count": len(all_keyframes),
            "result": {
                "data": sorted(all_keyframes, key=cosine_score)
            }
        }

                
        
   
   
   
class OldVideoSearch: 
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
            SELECT *, ts_rank(to_tsvector('simple', ocr), to_tsquery('simple', :search_term || ':*')) AS kw_score
            FROM keyframes
            WHERE "user_id" = :user_id
            AND "file_id" = :file_id
            AND to_tsvector('simple', ocr) @@ to_tsquery('simple', :search_term || ':*')
            ORDER BY kw_score DESC
            LIMIT :limit;
        """)
        
        kf_ocr_res = db.execute(sql_query, {
            'user_id': user_id,
            'file_id': file_id,
            'search_term': ocr,
            'limit': limit
        }).fetchall()
        
        if len(kf_ocr_res) > 0:
            score_kf = [kf.kw_score for kf in kf_ocr_res]
            ranker = get_rank(score_kf)
            return {
                "status_code": HTTPSTATUS.OK.code(),
                "message": "OCR full-text search successfully!",
                "result": {
                    "data": [{
                        "ID": f"{kf.user_id}-{kf.file_id}-{kf.frame_number}",
                        "file_id": kf.file_id,
                        "byte_offset": kf.byte_offset,
                        "keyframe_id": kf.id,
                        "TF_IDF_score": kf.kw_score,
                        "frame_number": kf.frame_number,
                        "frame_second": kf.frame_second,                         
                        "Rank_score": ranker[idx]
                    } for idx, kf in enumerate(kf_ocr_res)]
                }
            }
        else:
            return {
                "status_code": HTTPSTATUS.NOT_FOUND.code(),
                "message": f"Keyword {ocr} may not existed."
            }     
              
    @staticmethod
    def query_folder_by_ocr(payload):
        """
            Input: 
                payload: dictionary
                    - ocr: str
                    - limit: int
                    - files: List[str]
                    - user_id: str (Must be convert into integer)
            
            Output:
                - status_code: 200/400/404
                - message": "..."
                - result: dictionary
                    - "data": List[dict]
            
            Description: Search specific folder by user query input
        """    
        ocr = payload['ocr']
        limit = payload['limit']
        user_id = payload['user_id']
        files = payload['files']         
        
        for file_id in files:
            is_valid = DatabaseServices.is_file_exist(user_id= user_id, file_id= file_id)
            if is_valid == False:
                return {
                    "status_code": HTTPSTATUS.NOT_FOUND.code(),
                    "message": f"File_id({file_id}) of user({user_id}) may not existed."
                }    
        
        all_keyframes = []
        for file_id in files:                
            payload_per_file = {
                "ocr": ocr,
                "limit": limit,
                "file_id": file_id,
                "user_id": user_id
            }
            result = OCRSearch.query_video(payload= payload_per_file)
            if result['status_code'] == HTTPSTATUS.OK.code():
                data = result['result']['data']
                all_keyframes = [*all_keyframes, *data]
            else:
                print(f"\033[91m>>> Keyword {ocr} could not be found in file_id({file_id})\033[0m")
                # print(f"\033[91m>>> Please check again file_id({file_id}) - user_id({user_id})!\033[0m")
        return {
            "status_code": HTTPSTATUS.OK.code(),
            "message": "OCR folder search successfully!",
            "count": len(all_keyframes),
            "result": {
                "data": sorted(all_keyframes, key=kw_score)
            }
        }                 

class EnsembleSearch:
    @staticmethod
    def reciprocal_rank(array: List[dict]):
        """
            Tuple must be (doc, rank)
        """
        return [1.0 / (doc['Rank_score']) for (doc) in array]
        # return [1.0/(i+1) for i in range(len(array))]
    
    @staticmethod
    def merge_ranker(array_1: List[object], array_2: List[object]):
        merged_dict = {}
        # Duyệt qua array_1 và thêm vào dictionary tạm
        for item in array_1:
            id_key = item['ID']
            merged_dict[id_key] = item  # Thêm từng item theo ID

        # Duyệt qua array_2 và merge các giá trị
        for item in array_2:
            id_key = item['ID']
            if id_key in merged_dict:
                # Nếu ID đã tồn tại, merge các key từ array_2 vào
                merged_dict[id_key].update(item)
            else:
                # Nếu ID chưa tồn tại, thêm mới vào dictionary
                merged_dict[id_key] = item

        # Chuyển dictionary tạm về list nếu cần
        merged_results = list(merged_dict.values())
        return merged_results

        
            
    @staticmethod
    def hybrid_search(ranker_one: List[object], ranker_two: List[object], weight: float = 0.3):
        if (weight < 0) or (weight > 1):
            return {
                "message": "failed"
            }
        result = dict({})
        rr_ranker_one = EnsembleSearch.reciprocal_rank(ranker_one)
        rr_ranker_two = EnsembleSearch.reciprocal_rank(ranker_two)
        
        for idx, doc in enumerate(ranker_one):
            id_doc = doc["ID"]
            
            if id_doc not in result:
                result[id_doc] = rr_ranker_one[idx] * weight
            else:
                print("\033[91m>>> Please check again ranker one!")
                result[id_doc] += rr_ranker_one[idx] * weight
            
        for idx, doc in enumerate(ranker_two):
            id_doc = doc["ID"]
            
            if id_doc not in result:
                result[id_doc] = rr_ranker_two[idx] * (1 - weight)
            else:
                result[id_doc] += rr_ranker_two[idx] * (1 - weight)
        
        ensemble_ranker = EnsembleSearch.merge_ranker(ranker_one, ranker_two)
        def get_ensemble_score(doc):
            return result[doc["ID"]]
        data = sorted(ensemble_ranker, key=get_ensemble_score, reverse= True)
        return {
            "message": "success",
            "data": data
        }
                
        
        
                
        # assert len(ranker_one) >= len(ranker_two), "Ranker one results must be greater than ranker two results"
        # return ranker_one
        
        
            
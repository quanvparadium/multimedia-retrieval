import os
import sys
import torch
from PIL import Image
import numpy as np
import pgvector.sqlalchemy

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from entities import Keyframe
from connections.postgres import psg_manager
from sqlalchemy import text
from components.ai.visual import DEVICE, BLIP_MODEL, BLIP_TEXT_PROCESSORS, BLIP_VIS_PROCESSORS

class KeyframeExtractModel:
    def __init__(self):
        # LOAD MODEL
        # print("Loading AI Model ...")
        # self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # self.model, self.vis_processors, self.text_processors = load_model_and_preprocess("blip_image_text_matching", 
        #                                                                     model_type, 
        #                                                                     device=self.device, 
        #                                                                     is_eval=True)
        # print("Load AI Model done !")
        self.device = DEVICE
        self.model = BLIP_MODEL
        self.vis_processors = BLIP_VIS_PROCESSORS
        self.text_processors = BLIP_TEXT_PROCESSORS
        
    def update_embedding(self, payload):
        db = psg_manager.get_session()
        try:
            kf_data = db.query(Keyframe).filter(
                Keyframe.userId == str(payload["user_id"]),
                Keyframe.fileId == payload["file_id"],
            ).all()
            for idx, kf in enumerate(kf_data):
                raw_image = Image.open(kf.address)
                img = self.vis_processors["eval"](raw_image).unsqueeze(0).to(self.device)
                image_features = self.model.encode_image(img).detach().cpu().numpy()
                print(image_features.shape)
                print(type(image_features))
                image_features = np.array(image_features).astype(float).flatten().tolist()
                kf.embedding = image_features
                db.commit()
                print(f"Updated keyframe index {kf.id} - frame number {kf.frame_number | 0}", )
                print(f"Index {idx} - Keyframe: ", kf)
            self._create_index(videoId=payload["file_id"], count=len(kf_data))
            return kf_data
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            
    def _create_index(self, videoId, count):
        # create_index_query = text(f"""
        #     CREATE INDEX IF NOT EXISTS flat_idx 
        #     ON keyframes ((embedding::vector(256)) vector_cosine_ops) 
        #     WHERE (keyframes.\"fileId\" = :video_id);
        # """)
        can_be_index = False
        if (count > 10000) and (count < 100000):
            create_index_query = text(f"""
                CREATE INDEX IF NOT EXISTS ivflat_idx 
                ON keyframes USING ivfflat ((embedding::vector(256)) vector_cosine_ops) 
                WITH (lists = 100) 
                WHERE (keyframes.\"fileId\" = :video_id);
            """) 
            can_be_index = True
        elif (count >= 100000):
            create_index_query = text(f"""
                CREATE INDEX IF NOT EXISTS ivflat_idx 
                ON keyframes USING ivfflat ((embedding::vector(256)) vector_cosine_ops) 
                WITH (lists = 1000) 
                WHERE (keyframes.\"fileId\" = :video_id);
            """)
            can_be_index = True
        if can_be_index:   
            print("CREATE INDEX QUERY HERE: \n", create_index_query)
            db_res = psg_manager.get_session().execute(create_index_query, {"video_id": str(videoId)})
            print("Db result create index: ", db_res)
        else:
            print("The number of keyframe is too small to create index")
        
            
    # def query_vector(self, videoId, query: str, limit: int = 10): 
    #     txt = self.text_processors["eval"](query)
    #     text_features = self.model.encode_text(txt, self.device).cpu().detach().numpy()
    #     text_features = np.array(text_features).astype(float).flatten().tolist()
        
    #     db = psg_manager.get_session()
    #     try:
    #         # kf_res = db.query(Keyframe).filter(Keyframe.videoId == videoId).order_by(Keyframe.embedding.pgvector_distance(text_features)).limit(limit).all()
    #         # kf_res =  (
    #         #     db.query(Keyframe) \
    #         #     .filter(Keyframe.videoId == videoId) \
    #         #     .order_by(Keyframe.distance(text_features)) \
    #         #     .limit(limit).all()
    #         # )
    #         """ Queries the keyframe items based on a given vector. """
    #         query_vector_str = f"[{','.join(map(str, text_features))}]"
    #         query = text(f"""
    #         SELECT * FROM keyframes
    #         WHERE "videoId" = :video_id
    #         ORDER BY embedding <-> :query_vector LIMIT : limit;
    #         """)
            
    #         kf_res = db.execute(query, {'video_id': videoId, 'query_vector': query_vector_str, 'limit': limit})
    #         for kf in kf_res:
    #             print("Index ", kf.id, "- Address: ", kf.address )
    #         return kf_res
    #     except Exception as e:
    #         db.rollback()
    #         raise e
    #     finally:
    #         db.close()

kf_extract = KeyframeExtractModel()     
import os
import sys
import subprocess
import json
from tqdm import tqdm
import datetime
from typing import List

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from connections.postgres import psg_manager
from entities import Keyframe

import numpy as np
import ffmpeg
import tensorflow as tf
from PIL import Image
tf.compat.v1.disable_resource_variables()
from .models.transnet import TransNetParams, TransNet
from .models.transnet_utils import scenes_from_predictions
from components.ai.visual import (
    DEVICE, 
    BLIP_MODEL, 
    BLIP_TEXT_PROCESSORS, 
    BLIP_VIS_PROCESSORS
)
from components.ai.ocr_reader import EASY_OCR

from sqlalchemy import text
import concurrent.futures


DEFAULT_CHECKPOINT_PATH = "./models/transnet_model-F16_L3_S2_D256"

params = TransNetParams()
# Cách sửa, thêm đuôi meta vào chạy trước, sau đó xoá đi run lại
params.CHECKPOINT_PATH = "../checkpoint/transnet_model-F16_L3_S2_D256"
print("Initialize Transnet")
net = TransNet(params)

"""Add Database path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
video_dir = os.path.join(current_dir, 'tmp', 'video')
sys.path.append(video_dir)


def get_frame_rate(video_path):
    ffprobe_cmd = [
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
        'stream=r_frame_rate', '-of', 'default=noprint_wrappers=1:nokey=1', video_path
    ]
    result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
    frame_rate_str = result.stdout.strip()
    num, denom = map(int, frame_rate_str.split('/'))
    frame_rate = num / denom
    return frame_rate

def get_time_at_frame(frame_number, frame_rate):
    time_at_frame = frame_number / frame_rate
    return time_at_frame

def get_width_and_height(video_path):
    import cv2
    vid = cv2.VideoCapture(video_path)
    height = vid.get(cv2.CAP_PROP_FRAME_HEIGHT)
    width = vid.get(cv2.CAP_PROP_FRAME_WIDTH)
    return width, height

def get_frame_byte_offset(video_path, target_frame_index):
    ffprobe_cmd = [
        'ffprobe', '-show_packets', '-print_format', 'json', '-i', video_path
    ]
    result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)
    
    # Duyệt qua các packet để tìm frame mục tiêu
    current_frame_index = 0
    frame_byte_offset = None
    
    for packet in data['packets']:
        if packet['codec_type'] == 'video':
            # Kiểm tra nếu packet chứa frame mục tiêu
            if current_frame_index == target_frame_index:
                frame_byte_offset = int(packet['pos'])
                break
            current_frame_index += 1

    return frame_byte_offset

def check_index_sql(index_name):
    return text(f"""
        SELECT to_regclass('{index_name}');
    """)

def process_video_concurency(kf_frame_number, video_path, file_id, user_id):
    keyframe_path = '/'.join(video_path.split('/')[:-2])
    frame_rate = get_frame_rate(video_path)
    V_WIDTH, V_HEIGHT = get_width_and_height(video_path)
    
    kf_output_path = os.path.join(f'{keyframe_path}/keyframes/{file_id}', f"{file_id}_{kf_frame_number}.jpg")
    ffmpeg_command = f"ffmpeg -y -i {video_path} -fps_mode:v passthrough -loglevel quiet -vf \"select='eq(n\\,{kf_frame_number})'\" -vsync vfr -frames:v 1 {kf_output_path}"
    os.system(ffmpeg_command)
    target_byte_offset = get_frame_byte_offset(video_path=video_path, target_frame_index=kf_frame_number)
    time_at_frame = get_time_at_frame(frame_number=kf_frame_number, frame_rate=frame_rate)
    
    return True

def extend_keyframe(array: List[str]):
    size = len(array)
    if size <= 0:
        return array
    
    new_array = [array[0]]
    for i in range(len(array) - 1):
        a1 = array[i]
        a2 = array[i + 1]
            
        # Chèn hai số mới chia đều khoảng cách
        new_array.append((2 * a1 + a2) // 3)
        new_array.append((a1 + 2 * a2) // 3)
        
        # Thêm số a2 (số thứ hai trong cặp)
        new_array.append(a2)
        
    return new_array        
    

def ocr_detection(img_path):
    import httpx
    import asyncio
    async def call(img_path):
        async with httpx.AsyncClient() as client:
            response = await client.post("http://localhost:4002/ocr", json={"file_path": img_path})
            return response.json()
    return asyncio.run(call(img_path))
    

class VideoPreprocessing:
    @staticmethod
    def extract_image(payload):
        V_WIDTH = 0
        V_HEIGHT = 0
        image_path = payload["file_path"]
        with Image.open(image_path) as img:
            V_WIDTH, V_HEIGHT = img.size
            
        raw_image = Image.open(image_path)
        ocr_text = EASY_OCR.readtext(image_path, detail=0)
        img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE)
        image_features = BLIP_MODEL.encode_image(img).detach().cpu().numpy()
        image_features = np.array(image_features).astype(float).flatten().tolist()
                        
        property = {
            'file_id': payload['file_id'],
            'user_id': payload['user_id'],
            'format': payload['format'],
            "width": int(V_WIDTH),
            "height": int(V_HEIGHT),
            "embedding": image_features,
            "ocr": ocr_text if len(ocr_text) > 0 else None,
            "store": payload['store'],
            "address": image_path
        }
        img_result = VideoPreprocessing.create_image(property)
        if img_result is None:
            return {
                "message": f"Image {image_path} cannot be created"
            }
        else:
            if isinstance(img_result, dict):
                return img_result if "message" in img_result else "Fail code"
        print(f"Saved and extracted image successfully!")
        psg_manager.create_kw_index_by_user(table_name='keyframes', user_id=payload['user_id'])
        psg_manager.create_index_by_user(table_name='keyframes', user_id=payload['user_id'])
          
        return {
            "message": f"Saved and extracted image {image_path} successfully!"
        }      
        
    
    @staticmethod
    def extract_keyframe(payload):
        """
            Description:
            Input:
                payload: dictionary
                    - file_id
                    - file_path
                    - user_id
                    - 
        """
        # Step 1: Check file if exists in database
        file_id = payload['file_id']
        # print("User id: ", payload['user_id'])
        hashed_session = psg_manager.hash_session(user_id= payload['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)
        # print("current session: ", psg_manager.db_urls[hashed_session])
        result = db.query(Keyframe).filter(Keyframe.file_id == file_id).all()
        if result:
            return {
                "message": "Video is existed"
            }
            
        # Step 2: Detect keyframes in video
        video_path = payload['file_path']        
        keyframe_path = '/'.join(video_path.split('/')[:-2])
        print("Extracting video into frames ...")
        video_stream, err = (
            ffmpeg
            .input(video_path)
            .output('pipe:', format='rawvideo', pix_fmt='rgb24', s='{}x{}'.format(params.INPUT_WIDTH, params.INPUT_HEIGHT))
            .run(capture_stdout=True)
        )
        V_WIDTH, V_HEIGHT = get_width_and_height(video_path)
        
        print("Extracted successfully!")
        video = np.frombuffer(video_stream, np.uint8).reshape([-1, params.INPUT_HEIGHT, params.INPUT_WIDTH, 3])
        # predict transitions using the neural network
        print("Transnet: Detecting keyframes ...")
        predictions = net.predict_video(video)

        scenes = scenes_from_predictions(predictions, threshold=payload['threshold'])
        keyframe_indices = []
        for idx, scene in enumerate(scenes):
            print(f"Frame {idx} - Scene range: ", scene)
            main_scene = (int(scene[0]) + int(scene[1])) // 2
            # Only push 1 scene, not using 2 border scene because cause blur
            keyframe_indices.append(main_scene)
            # keyframe_indices.append(int(scene[0]))
            # keyframe_indices.append(int(scene[1]))
        print(predictions.shape)
        print("Length of index before extending: ", len(keyframe_indices))
        keyframe_indices = extend_keyframe(keyframe_indices)
        print("Length of index after extending: ", len(keyframe_indices))
        
        frame_rate = get_frame_rate(video_path)
        if not os.path.exists(f'{keyframe_path}/keyframes/{file_id}'):
            os.makedirs(f'{keyframe_path}/keyframes/{file_id}')

        # Step 3: Parallel save keyframe into storage
        kf_output_paths = [os.path.join(f'{keyframe_path}/keyframes/{file_id}', f"{file_id}_{kf_frame_number}.jpg") for kf_frame_number in keyframe_indices]
        ffmpeg_commands = [f"ffmpeg -y -i {video_path} -fps_mode:v passthrough -loglevel quiet -vf \"select='eq(n\\,{kf_frame_number})'\" -vsync vfr -frames:v 1 {kf_output_path}" for kf_frame_number, kf_output_path in zip(keyframe_indices, kf_output_paths)]
        # print(ffmpeg_commands)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(os.system, command) for command in ffmpeg_commands]
            results = [future.result() for future in futures]
        # print(results)
        
        print("Start sequential extract embedding")
        begin_time = datetime.datetime.now()
        # for kf_output_path in kf_output_paths:
        for kf_frame_number in keyframe_indices:
            kf_output_path = os.path.join(f'{keyframe_path}/keyframes/{file_id}', f"{file_id}_{kf_frame_number}.jpg")
            time_at_frame = get_time_at_frame(frame_number=kf_frame_number, frame_rate=frame_rate)
            target_byte_offset = get_frame_byte_offset(video_path=video_path, target_frame_index=kf_frame_number)
            
            # Extract embedding
            seq_raw_image = Image.open(kf_output_path)
            ocr_text = EASY_OCR.readtext(kf_output_path, detail=0)
            seq_img = BLIP_VIS_PROCESSORS["eval"](seq_raw_image).unsqueeze(0).to(DEVICE)
            seq_image_features = BLIP_MODEL.encode_image(seq_img).detach().cpu().numpy()
            print("Get features with shape: ", seq_image_features.shape)
            seq_image_features = np.array(seq_image_features).astype(float).flatten().tolist()
            
            property = {
                'file_id': payload['file_id'],
                'user_id': payload['user_id'],
                'format': 'jpg',
                "width": int(V_WIDTH),
                "height": int(V_HEIGHT),
                "embedding": seq_image_features,
                "ocr": ocr_text if len(ocr_text) > 0 else None,
                "frame_number": kf_frame_number,
                "frame_second": time_at_frame,
                "byte_offset": target_byte_offset,
                "store": payload['store'],
                "address": kf_output_path
            }
            kf_result = VideoPreprocessing.create_keyframe(property)
            if kf_result is None:
                # raise Exception(f"Keyframe {index} cannot be created")
                return {
                    "message": f"Keyframe {kf_frame_number} cannot be created"
                }
            else:
                if isinstance(kf_result, dict):
                    return kf_result if "message" in kf_result else "Fail code"
            print(f"Extracted keyframe {kf_frame_number} to {kf_output_path}")
            
        psg_manager.create_index_by_video(table_name='keyframes', file_id=file_id, user_id=payload['user_id'])
        psg_manager.create_kw_index_by_user(table_name='keyframes', user_id=payload['user_id'])
        psg_manager.create_index_by_user(table_name='keyframes', user_id=payload['user_id'])

        print("Time embeded sequential: ", datetime.datetime.now() - begin_time)

        print("Keyframes extracted and saved successfully.")
        return {
            "message": "Keyframes extracted and saved successfully."
        }


    @staticmethod
    def create_keyframe(property):
        hashed_session = psg_manager.hash_session(user_id= property['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)     
        # print("Url current connect:", psg_manager.db_urls[hashed_session])   
        try:
            kf_data = Keyframe(
                file_id = property['file_id'],
                user_id = property['user_id'],
                format = property['format'],
                width = property['width'],
                height = property['height'],
                embedding=property['embedding'],
                ocr=property['ocr'],
                frame_number = property['frame_number'],
                frame_second = property['frame_second'],
                store = property['store'],
                byte_offset = property['byte_offset'],
                address= property['address'],
            )
            db.add(kf_data)
            db.commit()
            db.refresh(kf_data)
            return kf_data
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            
    @staticmethod
    def create_image(property):
        hashed_session = psg_manager.hash_session(user_id= property['user_id'])
        db = psg_manager.get_session(hased_session= hashed_session)          
        result = db.query(Keyframe).filter(Keyframe.file_id == property['file_id']).all()
        if (result):
            print("Image is existed")
            return {
                "message": "Image is existed"
            }
        try:
            img_data = Keyframe(
                file_id = property['file_id'],
                user_id = property['user_id'],
                format = property['format'],
                width = property['width'],
                height = property['height'],
                embedding=property['embedding'],
                ocr=property['ocr'],
                store = property['store'],
                address= property['address'],
            )
            db.add(img_data)
            db.commit()
            db.refresh(img_data)
            return img_data
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()            

    @staticmethod
    def get_video_properties(video_path: str):
        try:
            probe = ffmpeg.probe(video_path)
            video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
            if video_stream is None:
                print(f"No video stream found in {video_path}")
                return None
            
            width = int(video_stream['width'])
            height = int(video_stream['height'])

            return {
                "width": width,
                "height": height,
            }
        except ffmpeg.Error as e:
            print(f"Error retrieving video properties: {e}")
            return None

    @staticmethod
    def test_indexing(payload):
        folder_path = payload['folder_path']
        V_WIDTH = 0
        V_HEIGHT = 0
        subdir_folder = sorted(os.listdir(folder_path))
        for idx, file_name in tqdm(enumerate(subdir_folder)):
            print("="*25)
            print(f"Adding {file_name} ...")
            frame_number = int(file_name.split('.')[0])
            keyframe_path = os.path.join(folder_path, file_name)
            raw_image = Image.open(keyframe_path)
            if idx == 0: 
                V_WIDTH, V_HEIGHT = raw_image.width, raw_image.height
            time_at_frame = float(frame_number / V_WIDTH)
            target_byte_offset = frame_number * V_WIDTH * V_HEIGHT
                
            img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE)
            image_features = BLIP_MODEL.encode_image(img).detach().cpu().numpy()
            image_features = np.array(image_features).astype(float).flatten().tolist()            
            property = {
                'file_id': payload['file_id'],
                'user_id': payload['user_id'],
                'format': 'jpg',
                "width": int(V_WIDTH),
                "height": int(V_HEIGHT),
                "embedding": image_features,
                "frame_number": frame_number,
                "frame_second": time_at_frame,
                "byte_offset": target_byte_offset,
                "store": payload['store'],
                "address": keyframe_path
            }        
            kf_result = VideoPreprocessing.create_keyframe(property)
            if kf_result is None:
                # raise Exception(f"Keyframe {index} cannot be created")
                return {
                    "message": f"Keyframe {frame_number} cannot be created"
                }
            else:
                if isinstance(kf_result, dict):
                    return kf_result if "message" in kf_result else "Fail code"
            print(f"Extracted keyframe {frame_number} to {keyframe_path}")
        VideoPreprocessing._create_index(videoId=payload["file_id"], count=len(subdir_folder))
        VideoPreprocessing._upsert_user_index(userId=payload["user_id"], count=len(subdir_folder))

        print("Keyframes extracted and saved successfully.")
        return {
            "message": "Keyframes extracted and saved successfully."
        }            

    @staticmethod
    def _create_index(videoId, count):
        # create_index_query = text(f"""
        #     CREATE INDEX IF NOT EXISTS flat_idx 
        #     ON keyframes ((embedding::vector(256)) vector_cosine_ops) 
        #     WHERE (keyframes.\"file_id\" = :video_id);
        # """)
        can_be_index = False
        # if (count > 10000) and (count < 100000):
        if (count < 100000):
            # create_index_query = text(f"""
            #     CREATE INDEX IF NOT EXISTS ivflat_idx 
            #     ON keyframes USING ivfflat ((embedding::vector(256)) vector_cosine_ops) 
            #     WITH (lists = 10) 
            #     WHERE (keyframes.\"file_id\" = :video_id);
            # """) 
            create_index_query = text(f"""
                CREATE INDEX ivfflat_idx_video_{videoId} ON keyframes USING ivfflat (embedding) WITH (lists = 10) 
                WHERE (keyframes.\"file_id\" = :video_id);
            """) 
            can_be_index = True
        elif (count >= 100000):
            create_index_query = text(f"""
                CREATE INDEX IF NOT EXISTS ivflat_idx 
                ON keyframes USING ivfflat ((embedding::vector(256)) vector_cosine_ops) 
                WITH (lists = 1000) 
                WHERE (keyframes.\"file_id\" = :video_id);
            """)
            can_be_index = True
        if can_be_index:   
            print("CREATE INDEX QUERY HERE: \n", create_index_query)
            db_res = psg_manager.get_session().execute(create_index_query, {"video_id": str(videoId)})
            print("Db result create index: ", db_res)
        else:
            print("The number of keyframe is too small to create index")

    @staticmethod
    def get_status(id):
        pass
    
    @staticmethod
    def _upsert_user_index(userId, count=-1):
        # can_be_index = False
        # is_exist_index = check_index_sql('ivfflat_idx')
        # db_session = psg_manager.get_session()
        is_user_indexed = psg_manager.index_exists(table_name='keyframes', index_name=f'ivflat_idx_user_{userId}')
        # if (count < 1000):
        if is_user_indexed:
            return None
        create_user_index_query = text(f"""
            CREATE INDEX ivflat_idx_user_{userId}  ON keyframes USING ivfflat (embedding) WITH (lists = 10) 
            WHERE (keyframes.\"userId\" = :user_id);
        """)             
        db_res = psg_manager.get_session().execute(create_user_index_query, {"user_id": str(userId)})
        print("Result create user index: ", db_res)
        print(f"\033[32m>>> Index embedding by user_id({userId}) is created.\033[0m")
        
        
        
            # can_be_index = True
            # Câu lệnh SQL kiểm tra sự tồn tại của index
        

            


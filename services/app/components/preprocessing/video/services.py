import os
import sys
import subprocess
import json

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
from components.ai.visual import DEVICE, BLIP_MODEL, BLIP_TEXT_PROCESSORS, BLIP_VIS_PROCESSORS


DEFAULT_CHECKPOINT_PATH = "./models/transnet_model-F16_L3_S2_D256"

params = TransNetParams()
# Cách sửa, thêm đuôi meta vào chạy trước, sau đó xoá đi run lại
params.CHECKPOINT_PATH = "../checkpoint/transnet_model-F16_L3_S2_D256"
# params.set()
# print("Input width: ", params.INPUT_WIDTH)
# print("Input height: ", params.INPUT_HEIGHT)
print("Initialize Transnet")
net = TransNet(params)
print("Initialize Transnet")

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

class VideoPreprocessing:
    @staticmethod
    def extract_image(payload):
        V_WIDTH = 0
        V_HEIGHT = 0
        image_path = payload["file_path"]
        print("Open image")
        with Image.open(image_path) as img:
            V_WIDTH, V_HEIGHT = img.size
        print("Open image done")
            
        raw_image = Image.open(image_path)
        img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE)
        image_features = BLIP_MODEL.encode_image(img).detach().cpu().numpy()
        print("Get features with shape: ", image_features.shape)
        image_features = np.array(image_features).astype(float).flatten().tolist()
                        
        property = {
            'file_id': payload['file_id'],
            'user_id': payload['user_id'],
            'format': payload['format'],
            "width": int(V_WIDTH),
            "height": int(V_HEIGHT),
            "embedding": image_features,
            "store": payload['store'],
            "address": image_path
        }
        img_result = VideoPreprocessing.create_image(property)
        if img_result is None:
            # raise Exception(f"Keyframe {index} cannot be created")
            return {
                "message": f"Image {image_path} cannot be created"
            }
        else:
                if isinstance(img_result, dict):
                    return img_result if "message" in img_result else "Fail code"
        print(f"Saved and extracted image successfully!")  
        return {
            "message": f"Saved and extracted image {image_path} successfully!"
        }      
        
    
    @staticmethod
    def extract_keyframe(payload):
        file_id = payload['file_id']
        db = psg_manager.get_session()
        result = db.query(Keyframe).filter(Keyframe.fileId == file_id).all()
        if result:
            return {
                "message": "Video is existed"
            }
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
            keyframe_indices.append(int(scene[0]))
            keyframe_indices.append(int(scene[1]))
        print(predictions.shape)
        
        frame_rate = get_frame_rate(video_path)
        for index in keyframe_indices:
            if not os.path.exists(f'{keyframe_path}/keyframes/{file_id}'):
                os.makedirs(f'{keyframe_path}/keyframes/{file_id}')
            kf_output_path = os.path.join(f'{keyframe_path}/keyframes/{file_id}', f"{file_id}_{index}.jpg")
            ffmpeg_command = f"ffmpeg -i {video_path} -fps_mode:v passthrough -loglevel quiet -vf \"select='eq(n\\,{index})'\" -vsync vfr -frames:v 1 {kf_output_path}"
            os.system(ffmpeg_command)
            print(type(index))
            print(type(V_WIDTH))
            target_byte_offset = get_frame_byte_offset(video_path=video_path, target_frame_index=index)
            time_at_frame = get_time_at_frame(frame_number=index, frame_rate=frame_rate)
            print(f"Time at frame {index}: {time_at_frame} seconds")
            
            raw_image = Image.open(kf_output_path)
            img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE)
            image_features = BLIP_MODEL.encode_image(img).detach().cpu().numpy()
            print("Get features with shape: ", image_features.shape)
            image_features = np.array(image_features).astype(float).flatten().tolist()
            
            property = {
                'file_id': payload['file_id'],
                'user_id': payload['user_id'],
                'format': 'jpg',
                "width": int(V_WIDTH),
                "height": int(V_HEIGHT),
                "embedding": image_features,
                "frame_number": index,
                "frame_second": time_at_frame,
                "byte_offset": target_byte_offset,
                "store": payload['store'],
                "address": kf_output_path
            }
            
            kf_result = VideoPreprocessing.create_keyframe(property)
            if kf_result is None:
                # raise Exception(f"Keyframe {index} cannot be created")
                return {
                    "message": f"Keyframe {index} cannot be created"
                }
            else:
                if isinstance(kf_result, dict):
                    return kf_result if "message" in kf_result else "Fail code"
            print(f"Extracted keyframe {index} to {kf_output_path}")

        print("Keyframes extracted and saved successfully.")
        return {
            "message": "Keyframes extracted and saved successfully."
        }


    @staticmethod
    def create_keyframe(property):
        db = psg_manager.get_session()
        try:
            kf_data = Keyframe(
                fileId = property['file_id'],
                userId = property['user_id'],
                format = property['format'],
                width = property['width'],
                height = property['height'],
                embedding=property['embedding'],
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
        db = psg_manager.get_session()
        result = db.query(Keyframe).filter(Keyframe.fileId == property['file_id']).all()
        if (result):
            print("Image is existed")
            return {
                "message": "Image is existed"
            }
        try:
            img_data = Keyframe(
                fileId = property['file_id'],
                userId = property['user_id'],
                format = property['format'],
                width = property['width'],
                height = property['height'],
                embedding=property['embedding'],
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
        for file_name in os.listdir(folder_path):
            print(file_name)
            file_path = os.path.join(folder_path, file_name)
            
        # property = {
        #     'file_id': payload['file_id'],
        #     'user_id': payload['user_id'],
        #     'format': 'jpg',
        #     "width": int(V_WIDTH),
        #     "height": int(V_HEIGHT),
        #     "embedding": image_features,
        #     "frame_number": index,
        #     "frame_second": time_at_frame,
        #     "byte_offset": target_byte_offset,
        #     "store": payload['store'],
        #     "address": kf_output_path
        # }        

    @staticmethod
    def get_status(id):
        pass


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
    def extract_keyframe(payload):
        file_id = payload['file_id']
        video_path = payload['file_path']        
        keyframe_path = '/'.join(video_path.split('/')[:-2])
        print("Initializing Transnet model ...")

        print("Initialize done !")
        video_stream, err = (
            ffmpeg
            .input(video_path)
            .output('pipe:', format='rawvideo', pix_fmt='rgb24', s='{}x{}'.format(params.INPUT_WIDTH, params.INPUT_HEIGHT))
            .run(capture_stdout=True)
        )
        V_WIDTH, V_HEIGHT = get_width_and_height(video_path)
        
        video = np.frombuffer(video_stream, np.uint8).reshape([-1, params.INPUT_HEIGHT, params.INPUT_WIDTH, 3])
        # predict transitions using the neural network
        predictions = net.predict_video(video)

        scenes = scenes_from_predictions(predictions, threshold=payload['threshold'])
        keyframe_indices = []
        for idx, scene in enumerate(scenes):
            print(f"Frame {idx} - Scene range: ", scene)
            keyframe_indices.append(int(scene[0]))
            keyframe_indices.append(int(scene[1]))
        print(predictions.shape)
        print("Keyframe: ", keyframe_indices)
        
        for index in keyframe_indices:
            if not os.path.exists(f'{keyframe_path}/keyframes/{file_id}'):
                os.makedirs(f'{keyframe_path}/keyframes/{file_id}')
            kf_output_path = os.path.join(f'{keyframe_path}/keyframes/{file_id}', f"{file_id}_{index}.jpg")
            ffmpeg_command = f"ffmpeg -i {video_path} -fps_mode:v passthrough -loglevel quiet -vf \"select='eq(n\\,{index})'\" -vsync vfr -frames:v 1 {kf_output_path}"
            os.system(ffmpeg_command)
            print(type(index))
            print(type(V_WIDTH))
            target_byte_offset = get_frame_byte_offset(video_path=video_path, target_frame_index=index)
            
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
                "byte_offset": target_byte_offset,
                "store": payload['store'],
                "address": kf_output_path
            }
            
            kf_result = VideoPreprocessing.create_keyframe(property)
            if kf_result is None:
                raise Exception(f"Keyframe {index} cannot be created")
            print(f"Extracted keyframe {index} to {kf_output_path}")

        print("Keyframes extracted and saved successfully.")
        return {
            "shape": predictions.shape,
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
    def get_status(id):
        pass

    def get_path(id):
        return "test_2.mp4"
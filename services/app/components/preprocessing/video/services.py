import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from connections.postgres import psg_manager
from entities import Data

import numpy as np
import ffmpeg
import tensorflow as tf
from .models.transnet import TransNetParams, TransNet
from .models.transnet_utils import scenes_from_predictions

DEFAULT_CHECKPOINT_PATH = "../checkpoint/transnet_model-F16_L3_S2_D256"

params = TransNetParams()
params.CHECKPOINT_PATH = "../checkpoint/transnet_model-F16_L3_S2_D256"
# params.set()
# print("Input width: ", params.INPUT_WIDTH)
# print("Input height: ", params.INPUT_HEIGHT)

net = TransNet(params)
"""Add Database path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
video_dir = os.path.join(current_dir, 'tmp', 'video')
sys.path.append(video_dir)

class VideoPreprocessing:
    @staticmethod
    def extract_keyframe(videoId, threshold=0.1):
        db = psg_manager.get_session()
        data = db.query(Data).filter(Data.type == "video", Data.id == videoId).first()
        video_path = data.address
        source_id = video_path.split('_')[-1][:-4]
        print("Initializing Transnet model ...")

        print("Initialize done !")
        video_stream, err = (
            ffmpeg
            .input(video_path)
            .output('pipe:', format='rawvideo', pix_fmt='rgb24', s='{}x{}'.format(params.INPUT_WIDTH, params.INPUT_HEIGHT))
            .run(capture_stdout=True)
        )
        
        video = np.frombuffer(video_stream, np.uint8).reshape([-1, params.INPUT_HEIGHT, params.INPUT_WIDTH, 3])
        # predict transitions using the neural network
        predictions = net.predict_video(video)

        scenes = scenes_from_predictions(predictions, threshold=threshold)
        keyframe_indices = []
        for idx, scene in enumerate(scenes):
            print(f"Frame {idx} - Scene range: ", scene)
            keyframe_indices.append(scene[0])
            keyframe_indices.append(scene[1])
        print(predictions.shape)
        print("Keyframe: ", keyframe_indices)
        
        for index in keyframe_indices:
            output_path = os.path.join('./tmp/keyframes', f"{source_id}_{index}.jpg")
            ffmpeg_command = f"ffmpeg -i {video_path} -fps_mode:v passthrough -loglevel quiet -vf \"select='eq(n\\,{index})'\" -vsync vfr -frames:v 1 {output_path}"
            os.system(ffmpeg_command)
            print(f"Extracted keyframe {index} to {output_path}")

        print("Keyframes extracted and saved successfully.")
        return {
            "shape": predictions.shape,
        }

    @staticmethod
    def get_video_properties(video_path):
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

    def get_status(id):
        pass

    def get_path(id):
        return "test_2.mp4"
import os
import ffmpeg
import sys
import numpy as np
import tensorflow as tf
from .models.transnet import TransNetParams, TransNet
from .models.transnet_utils import scenes_from_predictions

params = TransNetParams()
params.CHECKPOINT_PATH = "../checkpoint/transnet_model-F16_L3_S2_D256"
# print("Input width: ", params.INPUT_WIDTH)
# print("Input height: ", params.INPUT_HEIGHT)

net = TransNet(params)
"""Add Database path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
video_dir = os.path.join(current_dir, 'tmp', 'video')
sys.path.append(video_dir)

class VideoPreprocessing:
    def extract_keyframe(video_path, threshold=0.1):
        video_stream, err = (
            ffmpeg
            .input(video_path)
            .output('pipe:', format='rawvideo', pix_fmt='rgb24', s='{}x{}'.format(params.INPUT_WIDTH, params.INPUT_HEIGHT))
            .run(capture_stdout=True)
        )
        
        video = np.frombuffer(video_stream, np.uint8).reshape([-1, params.INPUT_HEIGHT, params.INPUT_WIDTH, 3])
        print(video[1832].shape)
        # predict transitions using the neural network
        predictions = net.predict_video(video)
        print("Satisf: ", len([pred for pred in predictions if pred > threshold]))
        scenes = scenes_from_predictions(predictions, threshold=threshold)
        print(type(predictions[1832]))
        print(predictions[1832])
        for idx, scene in enumerate(scenes):
            print(f"Frame {idx} - Scene range: ", scene)
        print(predictions.shape)
        return {
            "shape": predictions.shape
        }

    def get_status(id):
        pass

    def get_path(id):
        return "test_2.mp4"
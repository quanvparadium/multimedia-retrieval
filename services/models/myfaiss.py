import glob
import numpy as np
import re
import os
import json
import faiss
from collections import defaultdict

DATABASE_PATH = '../Database'
JSON_PATH = './features/keyframe_id.json'

def load_bin_file(bin_file: str):
    return faiss.read_index(bin_file) 

def load_json_path(json_path: str):
    with open(json_path, 'r') as f:
        js = json.loads(f.read())
    # return {int(k):v for k,v in js.items()}
    return js

class MyFaiss: 
    def __init__(self, root_database: str):
        self.root = root_database

    def write_bin_file(self, keyframe_json_path: str, method='L2', feature_shape=256, bin_file='faiss_blip_cosine.bin'):
        count = 0
        index = faiss.IndexFlatL2(feature_shape)
        keyframe_json = load_json_path(keyframe_json_path)
        keyframe_id2path = defaultdict()
        blip_name="features"
        for video, images in keyframe_json.items():
            feat_path = os.path.join(blip_name, video+'.npy')
            feat_path = feat_path.replace('\\','/')
            print('Feat_path: ', feat_path)

            if os.path.exists(feat_path):
                feats = np.load(feat_path)
                assert len(feats) == len(images) , "The quantity of feature must be equal the quantity of image"
                for id in range(len(feats)):
                    feat = feats[id]
                    feat = feat.astype(np.float32)
                    index.add(feat)
                    keyframe_id2path[count] = images[id]
                    count += 1
        faiss.write_index(index, os.path.join(blip_name, bin_file))
        with open(os.path.join(blip_name, 'keyframe_id2path.json'), 'w') as f:
            f.write(json.dumps(keyframe_id2path))
        print(f'Saved {os.path.join(blip_name, bin_file)}')
        print(f"Number of Index: {count}")

if __name__ == "__main__":
    create_file = MyFaiss(DATABASE_PATH)
    # create_file.write_json_file(json_path='./', shot_frames_path='./scenes_txt')
    create_file.write_bin_file(keyframe_json_path='./features/keyframe_id.json')
import os
import sys
import argparse
import json
import torch
import numpy as np
from tqdm import tqdm
from PIL import Image

"""Add LAVIS path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
lavis_dir = os.path.join(current_dir, 'LAVIS')
# Thêm đường dẫn tương đối của thư mục LAVIS vào sys.path
sys.path.append(lavis_dir)
from lavis.models import load_model_and_preprocess
# from lavis.processors import load_processor

JSON_PATH = './features/keyframe_id.json'
if not os.path.exists('features'):
    os.makedirs('features')

def extract_helper(model, vis_proceesors, video_folder, feature_dest_path):
    images = []
    list_dir = os.listdir(video_folder)
    list_dir.sort()
    print(video_folder.split('/')[-1])
    filename_valid = [filename for filename in list_dir if filename.endswith(".jpg")]
    # exit()
    dictionary = []
    for idx, filename in tqdm(enumerate(filename_valid)):
        # print(filename)
        img_path = os.path.join(video_folder, filename)
        # print(img_path)
        raw_image = Image.open(img_path).convert("RGB")
        img = vis_processors_blip["eval"](raw_image).unsqueeze(0).to(device)
        image_features = model.encode_image(img).detach().cpu().numpy()
        
        images.append(image_features)
        dictionary.append(img_path)
    
    print(np.asarray(images).shape)
        
    print(f"feature_dest_path:{feature_dest_path}")
    np.save(feature_dest_path, np.asarray(images))
    print("Save done!\n")
    return {
        video_folder.split('/')[-1]: dictionary
    }

def extract(model, vis_processors, keyframe_folder, feature_dest_path):
    list_dir = os.listdir(keyframe_folder)
    list_dir.sort()
    dictionary = dict({})
    
    for keyframe in list_dir:
        video_list = os.listdir(os.path.join(keyframe_folder, keyframe))
        for (idx, video) in enumerate(video_list):
            print("Video: ", video)
            if (video in ["L01_V002", "L01_V003", "L01_V004", "L01_V005", "L01_V019", "L01_V021", "L01_V026"]): continue
            print("Extracting ...")
            video_path = os.path.join(keyframe_folder, keyframe, video)
            dest_path = os.path.join(feature_dest_path, video+'.npy')
            print(video_path, dest_path)
            result = extract_helper(model, vis_processors_blip, video_path, dest_path)
            dictionary.update(result)
            # exit()
    print(dictionary)
    with open(JSON_PATH, 'w') as f:
        f.write(json.dumps(dictionary))
            

if __name__ == "__main__":
      # Tạo một đối tượng ArgumentParser
    parser = argparse.ArgumentParser(description='Process a video and specify the destination folder.')

    # Thêm đối số keyframe_folder
    parser.add_argument('--keyframe_folder', type=str, default="./Database", 
                        help='Path to the keyframe file')

    # Thêm đối số feature_dest_path
    parser.add_argument('--feature_dest_path', type=str, default='', 
                        help='Path to the destination folder')
    
    # Phân tích đối số từ dòng lệnh
    args = parser.parse_args()

    print("LOADING MODEL ... ")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_blip, vis_processors_blip, text_processors_blip = load_model_and_preprocess("blip_image_text_matching", 
                                                                                      "base", 
                                                                                      device=device, 
                                                                                      is_eval=True)
    print("BEGIN EXTRACT FEATURE")
    extract(model=model_blip, vis_processors=vis_processors_blip, keyframe_folder=args.keyframe_folder, feature_dest_path=args.feature_dest_path)


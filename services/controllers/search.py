import sys
import os
import torch
from fastapi import HTTPException
from schemas.input import Search
from models.myfaiss import load_bin_file, load_json_path


"""Add LAVIS path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
lavis_dir = os.path.join(current_dir, 'LAVIS')
# Thêm đường dẫn tương đối của thư mục LAVIS vào sys.path
sys.path.append(lavis_dir)
from lavis.models import load_model_and_preprocess

"""CONSTANT"""
bin_file='features/faiss_blip_cosine.bin'
keyframe_id2path = 'features/keyframe_id2path.json'
keyframe_path = 'features/keyframe_id.json'
faiss_model = load_bin_file(bin_file)
id2path = load_json_path(keyframe_id2path)
kf_path = load_json_path(keyframe_path)

# LOAD MODEL
__device = "cuda" if torch.cuda.is_available() else "cpu"
model, vis_processors_blip, text_processors_blip = load_model_and_preprocess("blip_image_text_matching", 
                                                                            "base", 
                                                                            device=__device, 
                                                                            is_eval=True)

async def text_search_controller(item: Search):

    txt = text_processors_blip["eval"](item.query)
    text_features = model.encode_text(txt, __device).cpu().detach().numpy()

    scores, idx_images = faiss_model.search(text_features, k=item.topk)
    # print("Output index", idx_images)
    # print("Output score", scores)

    idx_images = idx_images.flatten()
    scores = scores.flatten()
    # print("Index image", idx_images)
    total_img_paths = [id2path[str(idx)] for idx in idx_images]
    result = []
    for i in total_img_paths:
        keyframe_folder = i.split('/')[-3]
        video = i.split('/')[-2]
        image_in_video: list = kf_path[video]
        idx = image_in_video.index(i)
        result.append(f'keyframe={int(keyframe_folder[-2:])}&video={int(video[-3:])}&index={idx}')
    return result
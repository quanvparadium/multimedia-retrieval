import os
import sys
import torch
from datetime import datetime
from PIL import Image
import numpy as np

"""Add LAVIS path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
lavis_dir = os.path.join(current_dir, '..', '..', 'repo', 'LAVIS')
print("LAVIS dir: ", lavis_dir)
# Thêm đường dẫn tương đối của thư mục LAVIS vào sys.path
sys.path.append(lavis_dir)
from lavis.models import load_model_and_preprocess

MODEL_TYPE = "base"
print("\033[33mLoading BLIP model ...\033[0m")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BLIP_MODEL, BLIP_VIS_PROCESSORS, BLIP_TEXT_PROCESSORS = load_model_and_preprocess("blip_image_text_matching", 
                                                                            MODEL_TYPE, 
                                                                            device=DEVICE, 
                                                                            is_eval=True)

print("\033[32mLoaded model successfully! \033[0m")

def test_image_extraction(image_path):
    func_start_time = datetime.now()
    
    start_time = datetime.now()
    raw_image = Image.open(image_path)
    print(f"Open image time: {datetime.now() - start_time} seconds")
    
    start_time = datetime.now()
    seq_img = BLIP_VIS_PROCESSORS["eval"](raw_image).unsqueeze(0).to(DEVICE) 
    print(f"BLIP processor time: {datetime.now() - start_time} seconds")
    
    start_time = datetime.now()
    seq_image_features = BLIP_MODEL.encode_image(seq_img).detach().cpu().numpy()
    print(f"Extract BLIP feature time: {datetime.now() - start_time} seconds")
    
    start_time = datetime.now()
    seq_image_features = np.array(seq_image_features).astype(float).flatten().tolist()
    print(f"Convert float type time: {datetime.now() - start_time} seconds")
    
    print(f"Total time: {datetime.now() - func_start_time} seconds")
    
if __name__ == "__main__":
    test_image_extraction(image_path= './data/tests/keyframes/L03_V004/L03_V004_434.jpg')
    
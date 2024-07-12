import os
import sys
import torch

"""Add LAVIS path"""
current_dir = os.path.dirname(os.path.abspath(__file__))
# Xác định đường dẫn tới thư mục LAVIS
lavis_dir = os.path.join(current_dir, '..', '..', '..', 'repo', 'LAVIS')
print("LAVIS dir: ", lavis_dir)
# Thêm đường dẫn tương đối của thư mục LAVIS vào sys.path
sys.path.append(lavis_dir)
from lavis.models import load_model_and_preprocess

MODEL_TYPE = "base"
print("Loading BLIP model ...")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BLIP_MODEL, BLIP_VIS_PROCESSORS, BLIP_TEXT_PROCESSORS = load_model_and_preprocess("blip_image_text_matching", 
                                                                            MODEL_TYPE, 
                                                                            device=DEVICE, 
                                                                            is_eval=True)

print("Loaded model successful !")

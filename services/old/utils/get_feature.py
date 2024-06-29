import gdown
import os

faiss_bin_url = 'https://drive.google.com/file/d/1qH22Wrs0gXmgQccxR8tTgOw2eEnXtO8w/view?usp=drive_link'
keyframe_id_url = 'https://drive.google.com/file/d/1K9uVxI7dPIJw44Hf7Gu_TnBa5G2Zqiz5/view?usp=drive_link'
keyframe_id2path_url = 'https://drive.google.com/file/d/1gxtm7pSLLwK3EhAVkniBD_PQCq-ZUGeV/view?usp=drive_link'

if not os.path.exists('features'):
    os.makedirs('features')

try: 
    output = 'features/faiss_blip_cosine.bin'
    gdown.download(faiss_bin_url, output, quiet=False)
except:
    raise Exception("Failed to download Binary file")

try: 
    output = 'features/keyframe_id.json'
    gdown.download(keyframe_id_url, output, quiet=False)
    output = 'features/keyframe_id2path.json'
    gdown.download(faiss_bin_url, output, quiet=False)
except:
    raise Exception("Failed to download JSON file")   

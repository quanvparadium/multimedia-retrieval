from fastapi import APIRouter
from fastapi.responses import JSONResponse
from tests.test_time import test_image_extraction
testRouter = APIRouter()
from io import BytesIO
import base64
from PIL import Image
import requests

# import os
# import sys
# current_dir = os.path.dirname(os.path.abspath(__file__))
# # Xác định đường dẫn tới thư mục Video
# video_dir = os.path.join(current_dir, '..', 'tmp', 'video')
# sys.path.append(video_dir)
    
##############################- IMAGE SERVICES -##############################
@testRouter.post('/time')
def test_time_api(image_path: str):
    test_image_extraction(image_path)

@testRouter.post('/ocr')
def test_ocr(image_path: str):
    image = Image.open(image_path)
    
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    base64_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
# Gửi ảnh tới API
    url = "https://5e74-34-32-229-213.ngrok-free.app/api/ocr"  # Thay thế bằng URL của API
    files = {'image_byte': base64_str}
    response = requests.post(url, json=files)
    print("response: ", response)
    print("response: ", response.data)
    print("response: ", response.data.data)
    
    

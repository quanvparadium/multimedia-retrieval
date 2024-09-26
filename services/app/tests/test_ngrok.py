from io import BytesIO
import base64
from PIL import Image
import requests
from datetime import datetime

import json

def main():
    image_path = '../data/tests/keyframes/L03_V004/L03_V004_5265.jpg'
    image = Image.open(image_path)

    start_time = datetime.now()
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    base64_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    # Gửi ảnh tới API
    domain = 'https://drive.google.com/uc?export=download&id=1n5Famq339vspIxwT7P5jiPdTQSdOvYll'
    response = requests.get(domain)
    if response.status_code != 200:
        print("error")
        return None
    ngrok_url = response.content.decode('utf-8')
    print(ngrok_url)
    start_time = datetime.now()
    print("Get NGROK time: ", datetime.now() - start_time)

    # url = "https://e0c8-34-16-166-64.ngrok-free.app/api/ocr"  # Thay thế bằng URL của API
    files = {'image_byte': base64_str}
    ocr_api = f"{ngrok_url}/api/ocr"
    response = requests.post(ocr_api, json=files)
    print("response: ", response)
    print(response.content.decode('utf-8'))
    data_str = response.content.decode('utf-8')
    print(type(response.content.decode('utf-8')))
    # print(type(response.content.data))
    result = json.loads(data_str)
    print("API time: ", datetime.now() - start_time)

    print(result["data"])
    # print("response: ", response.data)
    # print("response: ", response.data.data)
if __name__ == "__main__":
    main()
    
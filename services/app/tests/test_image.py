import os
import sys

from fastapi.testclient import TestClient
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
client = TestClient(app)

def test_upload_image():
    response = client.post(
        "/api/preprocessing/image",
        json={
            "file_id": "L01_V001_00080",
            "user_id": "2",
            "format": "jpg",
            "store": "local",
            "file_path": "./data/images_L01/L01_V001/000804.jpg"
        }                    
    )
    assert response.status_code == 200
    assert response.json() == {
        "id": "foobar",
        "title": "Foo Bar",
        "description": "The Foo Barters",
    }
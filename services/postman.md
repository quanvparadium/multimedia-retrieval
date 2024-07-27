# Python API
## 1. Extract video
* Sau khi preprocessing xong thì vui lòng update status video
* Status: ["Preprocessing", "Preprocessed", "Extracting", "Successful"]
* Output: 
    * Các keyframe của video được tạo ra
    * Embedding của các keyframe phải tồn tại
* Lưu ý:
    * user_id phải tồn tại trong postgres, nếu không tồn tại sẽ trả về 500
```bash
curl --location 'http://localhost:4000/api/preprocessing/video' \
--header 'Content-Type: application/json' \
--data '{
    "file_id": "mO4P2PB7wjA",
    "user_id": "1",
    "store": "local",
    "type": "video",
    
    "file_path": "./tmp/video/mO4P2PB7wjA.mp4"
}'
```


## 2. Search from user query
### Query file (image or video) with text

```bash
$ curl --location 'http://localhost:4000/api/search/folder/keyframe/text' \
--header 'Content-Type: application/json' \
--data '{
    "query": "fire",
    "limit": 5,
    "files": ["mO4P2PB7wjA"]
}'

```

### Query file (image or video) with image

```bash
curl --location 'http://localhost:4000/api/search/folder/keyframe/image' \
--header 'Content-Type: application/json' \
--data '{
    "image_path": "./tmp/keyframes/mO4P2PB7wjA/mO4P2PB7wjA_4420.jpg",
    "limit": 5,
    "files": ["mO4P2PB7wjA"]
}'
```

## 2. Support API
* Query an video by text
```bash
curl --location 'http://localhost:4000/api/search/keyframe' \
--header 'Content-Type: application/json' \
--data '{
    "query": "white",
    "limit": 5,
    "fileId": "mO4P2PB7wjA"
}'
```





---
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from connections.postgres import psg_manager
from entities import Data, User

from googleapiclient.discovery import build
import pafy
import youtube_dl


API_KEY = 'AIzaSyCzwXfY7xSBPMjZXTaMhihe_JpucY9AjMk'
CHANNEL_ID = 'UCRjzfa1E0gA50lvDQipbDMg'

youtube = build('youtube', 'v3', developerKey=API_KEY)

class VideoCrawler:
    def get_newest_video(maxResults=50, channelId= CHANNEL_ID):
        # Lấy danh sách video trong kênh
        newest_videos = youtube.search().list(
            part='snippet',
            channelId=channelId,
            maxResults=maxResults,
            type='video',
            order='date'  # Sắp xếp theo thời gian đăng tải gần nhất
        ).execute()
    
        for video in newest_videos['items']:
            print("======================")
            print(video)
            print("Video Id: ", video['id'])
    
    def get_video(videoId):
        video = pafy.new(videoId)
        res = video.getworstvideo().download(filepath=f'./tmp/video/video_{videoId}.mp4', meta=True)
        print("Video content: ", video)
        print("result download: ", res)
        return {
            "video_path": res
        }

    @staticmethod        
    def create_video(videoId):
        video = pafy.new(videoId)
        res = None
        try:
            res = video.getworstvideo().download(filepath=f'./tmp/video/video_{videoId}.mp4', meta=True)
        except Exception as e:
            print(e)
        if res is None:
            return {
                "status": "Failed"
            }
        else:
            # video.title
            db = psg_manager.get_session()
            try: 
                user_id = 1  # Thay thế bằng userId bạn muốn sử dụng
                user = db.query(User).filter(User.id == user_id).first()
                db_data = Data(
                    type="video", 
                    status="In progress", 
                    userId=user.id, 
                    fileName=video.title,
                    size=video.length,
                    store="",
                    address=res)
                db.add(db_data)
                db.commit()
                db.refresh(db_data)
                return db_data
            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()
                
            
        
        
            

        
        
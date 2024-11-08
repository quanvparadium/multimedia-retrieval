import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from connections.postgres import psg_manager
from entities import (
    # Video, 
    User
)
from .utils import get_seconds
from dotenv import load_dotenv
load_dotenv()

from googleapiclient.discovery import build
import pafy
import youtube_dl


API_KEY = os.getenv('YOUTUBE_API_KEY')
DEFAULT_CHANNEL_ID = os.getenv('DEFAULT_CHANNEL_ID')

youtube = build('youtube', 'v3', developerKey=API_KEY)

class VideoYoutubeCrawler:
    def get_newest_video(maxResults=50, channelId= DEFAULT_CHANNEL_ID):
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
        return {
            "author": video.author,
            "title": video.title,
            "duration": video.duration,
            "views": video.viewcount,
            "thumbnail": video.thumb
        }

    @staticmethod        
    def create_video(videoId, userId):
        video = pafy.new(videoId)
        res = None
        try:
            res = video.getworstvideo().download(filepath=f'./tmp/video/vi_{videoId}.mp4', meta=True)
        except Exception as e:
            print(e)
        if res is None:
            return {
                "status": "Failed"
            }
        else:
            # video.title
            db = psg_manager.get_session()
            # try: 
            #     user = db.query(User).filter(User.id == userId).first()
            #     db_data = Video(
            #         author=video.author,
            #         format=".mp4",
            #         duration=get_seconds(video.duration),
            #         youtubeId=videoId,
            #         type="video", 
            #         status="In progress", 
            #         userId=user.id, 
            #         crawl=True,
            #         fileName=video.title,
            #         size=video.length,
            #         store="",
            #         address=res)
            #     db.add(db_data)
            #     db.commit()
            #     db.refresh(db_data)
            #     return db_data
            # except Exception as e:
            #     db.rollback()
            #     raise e
            # finally:
            #     db.close()
                
    
        
        
            

        
        
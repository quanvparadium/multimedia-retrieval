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
            

        
        
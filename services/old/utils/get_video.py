from googleapiclient.discovery import build
from datetime import datetime
import pafy
import youtube_dl
# Thay thế bằng API key của bạn
API_KEY = 'AIzaSyCzwXfY7xSBPMjZXTaMhihe_JpucY9AjMk'

# Thay thế bằng channel ID của bạn
CHANNEL_ID = 'UCRjzfa1E0gA50lvDQipbDMg'

# Tạo một instance của YouTube API client
youtube = build('youtube', 'v3', developerKey=API_KEY)

# Lấy danh sách video trong kênh
search_response = youtube.search().list(
    part='snippet',
    channelId=CHANNEL_ID,
    maxResults=50,
    type='video',
    order='date'  # Sắp xếp theo thời gian đăng tải gần nhất
).execute()
import youtube_dl
for result in search_response['items']:
    print("=" * 12)
    # for video in result:
    print("Video Id: ", result['id']['videoId'])
    v = pafy.new('-AOf2z8VclY')
    v
    # print(v.title)
    # print(v.__dict__.keys())
    print(v.getworstvideo().download())
    break
    
    # print(result)
    
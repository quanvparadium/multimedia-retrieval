import subprocess
import json
def get_frame_timestamp(video_path, byte_offset):
    ffprobe_cmd = [
        'ffprobe', '-show_packets', '-select_streams', 'v', '-print_format', 'json', '-i', video_path
    ]
    result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
    data = json.loads(result.stdout)

    for packet in data['packets']:
        if packet['codec_type'] == 'video' and int(packet['pos']) == byte_offset:
            return float(packet['pts_time'])
    
    return None


def check_byte_offset(video_path, byte_offset):

    timestamp = get_frame_timestamp(video_path, byte_offset)
    if timestamp is not None:
        print(f"Timestamp của frame tại byte offset {byte_offset}: {timestamp} giây")
    else:
        print(f"Không tìm thấy frame tại byte offset {byte_offset}")

if __name__ == "__main__":
    check_byte_offset('./tmp/video/mO4P2PB7wjA.mp4', 39499)
    check_byte_offset('./tmp/video/mO4P2PB7wjA.mp4', 191480)
    check_byte_offset('./tmp/video/mO4P2PB7wjA.mp4', 60839)
    check_byte_offset('./tmp/video/mO4P2PB7wjA.mp4', 100125)
    
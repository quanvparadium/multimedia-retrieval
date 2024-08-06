import os
import json
import pafy
import time
import subprocess

if __name__ == "__main__":
    files = os.listdir('metadata')
    if not os.path.exists('./data'):
        os.mkdir('./data')
    if not os.path.exists('./logs'):
        os.mkdir('./logs')    
    for id, file in enumerate(files):
        if file != "L01_V013.json": continue
        print('=====================================================')
        print(f"Index {id} - Downloading from {file} ...")
        with open (os.path.join('metadata', file)) as f:
            data = json.load(f)
        filename = file.split('.')[0]
        if data['watch_url']:
            # video_id = data['watch_url'].split('?v=')[-1]
            video = pafy.new(data['watch_url'])
            start_time = time.time()
            try:
                
                res = video.getbest().download(filepath=f'./data/{filename}.mp4', meta=True)
                end_time = time.time()
                print(f"Download {filename}.mp4 in {end_time - start_time} seconds")
                subprocess.run(f'echo "Download {filename}.mp4 in {end_time - start_time} seconds" >> logs/{filename}.txt', shell=True)
            except Exception as e:
                print("Error ", e)
        else:
            continue
        break
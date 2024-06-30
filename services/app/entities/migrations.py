import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from video import Video
from keyframe import Keyframe
from connections.postgres import psg_manager

if __name__ == "__main__":
    psg_manager.create_tables()
    pass
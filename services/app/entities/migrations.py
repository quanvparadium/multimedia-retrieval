import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from entities import *
from connections.postgres import psg_manager

if __name__ == "__main__":
    psg_manager.create_tables()
    pass
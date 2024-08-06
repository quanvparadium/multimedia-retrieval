import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
load_dotenv()

POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = int(os.getenv('POSTGRES_PORT') or 5432)
POSTGRES_USER = os.getenv('POSTGRES_USER') or 'root'
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD') or ''
POSTGRES_DB = os.getenv('POSTGRES_DB') or 'testdatn'

CONNECTION_STRING = f"postgresql://{POSTGRES_USER}:%s@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}" % quote_plus(POSTGRES_PASSWORD)
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')


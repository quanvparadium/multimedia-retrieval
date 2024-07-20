import os
from dotenv import load_dotenv
load_dotenv()

# # 0. Config
# PORT = os.getenv('PORT') | 3000
# JWT_KEY = os.getenv('JWT_KEY') | 'quan_key'
# ACCESS_KEY = os.getenv('ACCESS_KEY') | 'quan_key'
# REFRESH_KEY = os.getenv('REFRESH_KEY') | 'quan_key'
# 1. Config for postgres
POSTGRES_HOST = os.getenv('POSTGRES_HOST') or 'localhost'
POSTGRES_PORT = int(os.getenv('POSTGRES_PORT') or 5432)
POSTGRES_USER = os.getenv('POSTGRES_USER') or 'root'
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD') or ''
POSTGRES_DB = os.getenv('POSTGRES_DB') or 'testdatn'

print(POSTGRES_HOST)
# 2. Config for mongodb
# MONGO_USER = os.getenv('MONGO_INITDB_ROOT_USERNAME')
# MONGO_PASSWORD = os.getenv('MONGO_INITDB_ROOT_PASSWORD
# MONGO_HOST = os.getenv('MONGO_HOST
# MONGO_PORT = os.getenv('MONGO_PORT
# MONGO_DATABASE = os.getenv('MONGO_DATABASE

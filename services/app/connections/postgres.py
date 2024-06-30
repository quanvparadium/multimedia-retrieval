# import os
# import psycopg2
# from psycopg2 import errors

# class PostgresConnection:
#     def __init__(self, database=None, user=None, password=None, host=None, port=None):
#         self.database = database or os.getenv('POSTGRES_DB', 'testdatn')
#         self.user = user or os.getenv('POSTGRES_USER', 'postgres')
#         self.password = password or os.getenv('POSTGRES_PASSWORD', '')
#         self.host = host or os.getenv('POSTGRES_HOST', 'localhost')
#         self.port = port or os.getenv('POSTGRES_PORT', '5432')
#         self.connection = None
#         self.cursor = None

#     def connect(self):
#         try:
#             self.connection = psycopg2.connect(
#                 database=self.database,
#                 user=self.user,
#                 password=self.password,
#                 host=self.host,
#                 port=self.port
#             )
#             self.cursor = self.connection.cursor()
#             print(f"Connected to Postgres database: {self.database}")
#         except (Exception, psycopg2.Error) as error:
#             print(f"Error connecting to Postgres database: {error}")

#     def execute_query(self, query, params=None):
#         try:
#             self.cursor.execute(query, params)
#             return self.cursor.fetchall()
#         except (Exception, psycopg2.Error) as error:
#             print(f"Error executing query: {error}")
#             return None

#     def commit(self):
#         try:
#             self.connection.commit()
#         except (Exception, psycopg2.Error) as error:
#             print(f"Error committing changes: {error}")

#     def rollback(self):
#         try:
#             self.connection.rollback()
#         except (Exception, psycopg2.Error) as error:
#             print(f"Error rolling back changes: {error}")

#     def close(self):
#         try:
#             if self.cursor:
#                 self.cursor.close()
#             if self.connection:
#                 self.connection.close()
#             print("Postgres connection closed.")
#         except (Exception, psycopg2.Error) as error:
#             print(f"Error closing Postgres connection: {error}")

# psg_db = PostgresConnection()

import os
from sqlalchemy import create_engine, text, Column, Integer, String, MetaData, Table
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
load_dotenv()

class PostgresManager:
    def __init__(self, use_pgvector = True):
        self.database = os.getenv('POSTGRES_DB', 'testdatn')
        self.user = os.getenv('POSTGRES_USER', 'postgres')
        self.password = os.getenv('POSTGRES_PASSWORD', '')
        self.host = os.getenv('POSTGRES_HOST', 'localhost')
        self.port = os.getenv('POSTGRES_PORT', '5432')
        db_url = f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
        print("Connection url: ", db_url)
        self.engine = create_engine(db_url)
        self.Session = scoped_session(sessionmaker(bind=self.engine))
        self.Base = declarative_base()
        self.is_connected = self._check_connection()
        if use_pgvector: 
            self._create_pgvector_extension()
        

    def _check_connection(self):
        """Kiểm tra kết nối tới cơ sở dữ liệu."""
        try:
            # Thực hiện một truy vấn đơn giản để kiểm tra kết nối
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print(f"Connected to Postgres database: {self.database}")
            return True
        except OperationalError as err:
            print(f"Error connecting to Postgres database: {err}")
            return False

    def _create_pgvector_extension(self):
        """Tạo tiện ích mở rộng pgvector nếu chưa tồn tại."""
        try:
            with self.engine.connect() as connection:
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                connection.commit()
            print("pgvector extension is ready.")
        except OperationalError as err:
            print(f"Error creating pgvector extension: {err}")

    def create_tables(self):
        print("Migrating...")
        self.Base.metadata.create_all(self.engine)
        print("Migrate done!")

    def drop_tables(self):
        self.Base.metadata.drop_all(self.engine)

    def get_session(self):
        return self.Session()

    def close_session(self):
        self.Session.remove()

    def execute_query(self, query):
        session = self.get_session()
        try:
            result = session.execute(query)
            session.commit()
            return result.fetchall()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            self.close_session()
            
psg_manager = PostgresManager()
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
from sqlalchemy import create_engine, text, inspect, Index
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError
from urllib.parse import quote_plus
from dotenv import load_dotenv
from urllib.parse import quote_plus
load_dotenv()

class PostgresManager:
    def __init__(self, use_pgvector = True):
        self.database = os.getenv('POSTGRES_DB', 'testdatn')
        self.user = os.getenv('POSTGRES_USER', 'postgres')
        self.password = os.getenv('POSTGRES_PASSWORD', '')
        self.host = os.getenv('POSTGRES_HOST', 'localhost')
        self.port = os.getenv('POSTGRES_PORT', '5432')
        db_url = f"postgresql://{self.user}:%s@{self.host}:{self.port}/{self.database}" % quote_plus(self.password)
        self.engine = create_engine(db_url)
        self.Session = scoped_session(sessionmaker(bind=self.engine))
        self.Base = declarative_base()
        self.is_connected = self._check_connection()
        if use_pgvector: 
            self._create_pgvector_extension()
        
    def create_index_if_not_exists(self, engine, table_name, index_name, *columns):
        insp = inspect(engine)
        indexes = [index['name'] for index in insp.get_indexes(table_name)]
        if index_name not in indexes:
            index = Index(index_name, *columns)
            index.create(bind=engine)

    def _check_connection(self):
        """Kiểm tra kết nối tới cơ sở dữ liệu."""
        try:
            # Thực hiện một truy vấn đơn giản để kiểm tra kết nối
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            print(f"\033[32m>>> Connected to Postgres database: {self.database}\033[0m")
            return True
        except OperationalError as err:
            print(f"\033[31mError connecting to Postgres database: {err}\033[0m")
            return False

    def _create_pgvector_extension(self):
        """Tạo tiện ích mở rộng pgvector nếu chưa tồn tại."""
        try:
            with self.engine.connect() as connection:
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                connection.commit()
            print("\033[32m>>> Pgvector extension is ready.\033[0m")
        except OperationalError as err:
            print(f"Error creating pgvector extension: {err}")

    def create_index_by_user(self, table_name, user_id: str, type_index: str = "IVFFlat"):
        is_user_index_exists = self.index_exists(table_name=table_name, index_name=f'ivflat_idx_by_user_{user_id}')
        if is_user_index_exists:
            print(f"\033[32m>>> Index embedding by user_id({user_id}) is EXISTED.\033[0m")
            return None
        create_index_query = text(f""" CREATE INDEX ivflat_idx_by_user_{user_id} ON {table_name} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10) WHERE (\"userId\" = :user_id);""") 
        try:
            with self.engine.connect() as connection:
                connection.execute(create_index_query, {"user_id": str(user_id)})
                connection.commit()
            print(f"\033[32m>>> Index embedding by user_id({user_id}) is created.\033[0m")
        except OperationalError as err:
            print(f"Error creating index by user: {err}")

    def create_index_by_video(self, table_name, file_id: str, type_index: str = "IVFFlat"):
        create_index_query = text(f""" CREATE INDEX ivflat_idx_by_video_{file_id} ON {table_name} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10) WHERE (\"fileId\" = :file_id);""") 
        try:
            with self.engine.connect() as connection:
                connection.execute(create_index_query, {"file_id": str(file_id)})
                connection.commit()
            print(f"\033[32m>>> Index embedding by file_id({file_id}) is created.\033[0m")
        except OperationalError as err:
            print(f"Error creating index by user: {err}")            

    def create_tables(self, is_indexing = False):
        print("Migrating...")
        self.Base.metadata.create_all(self.engine)
        if is_indexing:
            import os
            import sys
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
            from entities import Keyframe
            self.create_index_if_not_exists(self.engine, 'keyframes', 'idx_user_id_embedding', Keyframe.userId, Keyframe.embedding)
            print("Created Index for Keyframe table!")
        print("Migrate done!")

    def index_exists(self, table_name, index_name):
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1 FROM pg_indexes WHERE tablename = :table_name AND indexname = :index_name;"), {
                    "table_name": table_name, "index_name": index_name}
                )
                connection.commit()
                is_exists = bool(result.rowcount > 0) 
                print(f"""\033[32m>>> Index {index_name} is {"" if is_exists else "not"} existed in TABLE {table_name}.\033[0m""")
                return is_exists
        except OperationalError as err:
            print(f"Error creating pgvector extension: {err}")        

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
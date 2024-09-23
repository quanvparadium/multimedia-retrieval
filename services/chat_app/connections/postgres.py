import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError
from urllib.parse import quote_plus
from dotenv import load_dotenv
load_dotenv()

class PostgresManager:
    def __init__(self, use_pgvector = True):
        self.database = os.getenv('POSTGRES_DB', 'testdatn')
        self.user = os.getenv('POSTGRES_USER', 'postgres')
        self.password = os.getenv('POSTGRES_PASSWORD', '')
        self.host = os.getenv('POSTGRES_HOST', 'localhost')
        self.port = os.getenv('POSTGRES_PORT', '5432')
        db_url = f"postgresql://{self.user}:%s@{self.host}:{self.port}/{self.database}" % quote_plus(self.password)
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

    def create_tables(self):
        print("Migrating...")
        self.Base.metadata.create_all(self.engine)
        print("Migrate done!")

    def create_index_by_user(self, table_name, user_id: str, type_index: str = "IVFFlat"):
        create_index_query = text(f""" CREATE INDEX ivflat_idx_by_user_{user_id} ON {table_name} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10) WHERE (\"user_id\" = :user_id);""") 
        try:
            with self.engine.connect() as connection:
                connection.execute(create_index_query, {"user_id": str(user_id)})
                connection.commit()
            print(f"\033[32m>>> Index embedding by user_id({user_id}) is created.\033[0m")
        except OperationalError as err:
            print(f"Error creating index by user: {err}")
        # result_create_index = self.Session().execute(create_index_query, {"user_id": str(user_id)})
        # print("Db result create index: ", result_create_index.all())

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
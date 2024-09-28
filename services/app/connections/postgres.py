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
    def __init__(self, use_pgvector = True, test=False):
        self.database = os.getenv('POSTGRES_DB', 'testdatn') 
        self.user = os.getenv('POSTGRES_USER', 'postgres')
        self.password = os.getenv('POSTGRES_PASSWORD', '')
        self.host = os.getenv('POSTGRES_HOST', 'localhost')
        self.host = f"test_{self.host}" if test else self.host
        # self.port = os.getenv('POSTGRES_PORT', '5432')
        self.ports = ['5432', '5432', '5432']
        if self.host in ['localhost', '127.0.0.1']:
            self.ports = ['5432', '5433', '5434']
            
        # returned_host = self.host + f'_{i}'
        def returned_host(idx, host):
            if host in ['localhost', '127.0.0.1']:
                return self.host
            
            if idx % 3 == 0:
                print(self.host)
                return self.host
            else:
                print(self.host + f'_{idx % 3}')
                return self.host + f'_{idx % 3}'
        self.db_urls = [f"postgresql://{self.user}:%s@{returned_host(idx, self.host)}:{port}/{self.database}" % quote_plus(self.password) for idx, port in enumerate(self.ports)]
        for url in self.db_urls:
            print("DB link: ", url)
        self.engines = [create_engine(db_url) for db_url in self.db_urls]
        self.Session = [scoped_session(sessionmaker(bind=engine)) for engine in self.engines]
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
    
    def hash_session(self, user_id: str):
        try:
            int(user_id)
        except ValueError as e:
            print("\033[31m>>>User_id must be integer\033[0m")
            raise ValueError("User_id must be integer")
        
        return int(user_id) % 3

    def _check_connection(self):
        """Kiểm tra kết nối tới cơ sở dữ liệu."""
        try:
            # Thực hiện một truy vấn đơn giản để kiểm tra kết nối
            for engine in self.engines:
                
                with engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                print(f"\033[32m>>> Connected to Postgres database: {self.database}\033[0m")
                # break
            return True
        except OperationalError as err:
            print(f"\033[31mError connecting to Postgres database: {err}\033[0m")
            return False

    def _create_pgvector_extension(self):
        """Tạo tiện ích mở rộng pgvector nếu chưa tồn tại."""
        try:
            for engine in self.engines:
                with engine.connect() as connection:
                    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    connection.commit()
                print("\033[32m>>> Pgvector extension is ready.\033[0m")
        except OperationalError as err:
            print(f"Error creating pgvector extension: {err}")
            
    def create_kw_index_by_user(self, table_name, user_id: str, type_index: str = "GIN"):
        is_user_index_exists = self.index_exists(table_name=table_name, index_name=f'gin_idx_by_user_{user_id}', user_id= user_id)
        if is_user_index_exists:
            print(f"\033[32m>>> GIN Index embedding by user_id({user_id}) is EXISTED.\033[0m")
            return None  
        hashed_session = self.hash_session(user_id)
        create_index_query = text(f""" CREATE INDEX gin_idx_by_user_{user_id} ON {table_name} USING GIN (to_tsvector('english', ocr)) WHERE (\"user_id\" = :user_id);""")         
        try:
            for idx, engine in enumerate(self.engines):
                if idx == hashed_session:
                    with engine.connect() as connection:
                        connection.execute(create_index_query, {"user_id": str(user_id)})
                        connection.commit()
                    print(f"\033[32m>>> GIN Index embedding by user_id({user_id}) is created.\033[0m")
        except OperationalError as err:
            print(f"Error creating GIN index by user: {err}")              

    def create_index_by_user(self, table_name, user_id: str, type_index: str = "IVFFlat"):
        is_user_index_exists = self.index_exists(table_name=table_name, index_name=f'ivflat_idx_by_user_{user_id}', user_id= user_id)
        hashed_session = self.hash_session(user_id)
        rb_index = text("""RE{choice} INDEX ivflat_idx_by_user_{user};""".format(choice="INDEX", user=user_id))
        if is_user_index_exists:
            print(f"\033[32m>>> {type_index} Index embedding by user_id({user_id}) is EXISTED.\033[0m")
            for idx, engine in enumerate(self.engines):
                if idx == hashed_session:
                    with engine.connect() as connection:
                        connection.execute(rb_index)
                        connection.commit()
                    print(f"\033[33m>>> {type_index} Index embedding by user_id({user_id}) on TABLE {table_name} is EXISTED.\033[0m")            
            return None
        create_index_query = text(f""" CREATE INDEX ivflat_idx_by_user_{user_id} ON {table_name} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10) WHERE (\"user_id\" = :user_id);""") 
        try:
            for idx, engine in enumerate(self.engines):
                if idx == hashed_session:
                    with engine.connect() as connection:
                        connection.execute(create_index_query, {"user_id": str(user_id)})
                        connection.commit()
                    print(f"\033[32m>>> {type_index} Index embedding by user_id({user_id}) is created.\033[0m")
        except OperationalError as err:
            print(f"Error creating {type_index} index by user: {err}")

    def create_index_by_video(self, table_name, file_id: str, user_id: str, type_index: str = "IVFFlat", ):
        is_file_index_exists = self.index_exists(table_name=table_name, index_name=f'ivflat_idx_by_video_{file_id}', user_id= user_id)
        if is_file_index_exists:
            print(f"\033[32m>>> Index embedding by file_id({file_id}) is EXISTED.\033[0m")
            return None
        create_index_query = text(f""" CREATE INDEX ivflat_idx_by_video_{file_id} ON {table_name} USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10) WHERE (\"file_id\" = :file_id);""") 
        hashed_session = self.hash_session(user_id)
        try:
            for idx, engine in enumerate(self.engines):
                if idx == hashed_session:                
                    with engine.connect() as connection:
                        connection.execute(create_index_query, {"file_id": str(file_id)})
                        connection.commit()
                    print(f"\033[32m>>> Index embedding by file_id({file_id}) is created.\033[0m")
        except OperationalError as err:
            print(f"Error creating {type_index} index by user: {err}")            

    def create_tables(self, is_indexing = False):
        print("Migrating...")
        for engine in self.engines:
            self.Base.metadata.create_all(engine)
        if is_indexing:
            import os
            import sys
            sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
            from entities import Keyframe
            for engine in self.engines:
                self.create_index_if_not_exists(engine, 'keyframes', 'idx_user_id_embedding', Keyframe.user_id, Keyframe.embedding)
                print("Created Index for Keyframe table!")
        print("Migrate done!")

    def index_exists(self, table_name, index_name, user_id):
        try:
            hashed_session = self.hash_session(user_id)
            for idx, engine in enumerate(self.engines):
                if idx == hashed_session:
                    with engine.connect() as connection:
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
        for engine in self.engines:
            self.Base.metadata.drop_all(engine)

    def get_session(self, hased_session = 0):
        # Port 5432: session 0
        # Port 5433: session 1
        # Port 5434: session 2
        return self.Session[hased_session]()

    def close_session(self, hased_session = 0):
        self.Session[hased_session].remove()

    def execute_query(self, query, hased_session):
        session = self.get_session(hased_session)
        try:
            result = session.execute(query)
            session.commit()
            return result.fetchall()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            self.close_session()
            
psg_manager = PostgresManager(test=False)
# test_psg_manager = PostgresManager(test=True)
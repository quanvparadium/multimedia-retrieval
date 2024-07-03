import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from connections.postgres import psg_manager
from entities.user import User
class UserServices:
    @staticmethod
    def create_user(name: str, email: str, password: str):
        db = psg_manager.get_session()
        try:
            # hashed_password = UserServices.get_password_hash(password)
            hashed_password = password
            db_user = User(name=name, email=email, password=hashed_password)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
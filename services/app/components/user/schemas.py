from pydantic import BaseModel

class UserRegisterBody(BaseModel):
    name: str
    email: str
    password: str

    
from fastapi import APIRouter
from .schemas import UserRegisterBody
from .services import UserServices

userRouter = APIRouter()

@userRouter.post('/register')
def register(body: UserRegisterBody):
    print("Register API...")
    result = UserServices.create_user(body.name, body.email, body.password)
    return {
        "message": "Register successfully"
    }
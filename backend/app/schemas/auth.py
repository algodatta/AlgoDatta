from pydantic import BaseModel, EmailStr
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
class PasswordResetRequest(BaseModel):
    email: EmailStr
class PasswordResetConfirm(BaseModel):
    token: str
    password: str

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database.db import get_db, DBUser
from backend.auth.auth_utils import get_password_hash, verify_password
from backend.auth.jwt_handler import create_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
async def register(auth_data: AuthRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(DBUser).where(DBUser.username == auth_data.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pwd = get_password_hash(auth_data.password)
    new_user = DBUser(username=auth_data.username, hashed_password=hashed_pwd)
    db.add(new_user)
    await db.commit()
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(auth_data: AuthRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.username == auth_data.username))
    user = result.scalars().first()
    
    if not user or not verify_password(auth_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from datetime import timedelta
from models.user import UserCreate, UserLogin, UserResponse, Token
from services.user_service import UserService
from utils.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from dependencies import get_user_service, get_current_active_user

router = APIRouter()
security = HTTPBearer()

@router.post("/signup", response_model=UserResponse)
async def signup(
    user: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Inscription d'un nouvel utilisateur"""
    try:
        created_user = await user_service.create_user(user)
        return UserResponse(
            id=str(created_user.id),
            email=created_user.email,
            username=created_user.username,
            full_name=created_user.full_name,
            is_active=created_user.is_active,
            created_at=created_user.created_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(
    user_login: UserLogin,
    user_service: UserService = Depends(get_user_service)
):
    """Connexion d'un utilisateur"""
    user = await user_service.authenticate_user(user_login)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Mettre à jour la dernière connexion
    await user_service.update_user_last_login(user.email)
    
    # Créer le token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_active_user)
):
    """Obtenir les informations de l'utilisateur connecté"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

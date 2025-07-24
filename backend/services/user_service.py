from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserCreate, UserInDB, UserLogin
from utils.auth import get_password_hash, verify_password
from bson import ObjectId
from datetime import datetime

class UserService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.users

    async def create_user(self, user: UserCreate) -> UserInDB:
        """Créer un nouvel utilisateur"""
        # Vérifier si l'utilisateur existe déjà
        existing_user = await self.collection.find_one({"email": user.email})
        if existing_user:
            raise ValueError("Un utilisateur avec cet email existe déjà")
        
        existing_username = await self.collection.find_one({"username": user.username})
        if existing_username:
            raise ValueError("Ce nom d'utilisateur est déjà pris")

        # Créer l'utilisateur
        user_dict = user.dict()
        user_dict["hashed_password"] = get_password_hash(user.password)
        del user_dict["password"]
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        user_dict["is_active"] = True

        result = await self.collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return UserInDB(**user_dict)

    async def authenticate_user(self, user_login: UserLogin) -> Optional[UserInDB]:
        """Authentifier un utilisateur"""
        user = await self.collection.find_one({"email": user_login.email})
        if not user:
            return None
        
        if not verify_password(user_login.password, user["hashed_password"]):
            return None
        
        return UserInDB(**user)

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Récupérer un utilisateur par email"""
        user = await self.collection.find_one({"email": email})
        if user:
            return UserInDB(**user)
        return None

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Récupérer un utilisateur par ID"""
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            if user:
                return UserInDB(**user)
        except Exception:
            pass
        return None

    async def update_user_last_login(self, email: str):
        """Mettre à jour la dernière connexion"""
        await self.collection.update_one(
            {"email": email},
            {"$set": {"last_login": datetime.utcnow(), "updated_at": datetime.utcnow()}}
        )

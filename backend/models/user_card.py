from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class UserCardBase(BaseModel):
    card_id: str = Field(..., description="ID de la carte TCGdex")
    card_name: str = Field(..., description="Nom de la carte")
    card_image: Optional[str] = Field(None, description="URL de l'image de la carte")
    set_id: str = Field(..., description="ID de l'extension")
    set_name: str = Field(..., description="Nom de l'extension")
    quantity: int = Field(default=1, ge=1, description="Quantité possédée")
    condition: str = Field(default="Near Mint", description="État de la carte")
    version: Optional[str] = Field(None, description="Version de la carte (normale, holo, etc.)")
    rarity: Optional[str] = Field(None, description="Rareté de la carte")
    local_id: Optional[str] = Field(None, description="Numéro local de la carte dans l'extension")

class UserCardCreate(UserCardBase):
    pass

class UserCardUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=1)
    condition: Optional[str] = None
    version: Optional[str] = None

class UserCardInDB(UserCardBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="ID de l'utilisateur propriétaire")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserCardResponse(UserCardBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

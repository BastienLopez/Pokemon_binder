from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId
from .user import PyObjectId

class BinderSize(str, Enum):
    SMALL = "3x3"
    MEDIUM = "4x4" 
    LARGE = "5x5"

class CardSlot(BaseModel):
    """Représente un slot dans une page de binder"""
    position: int = Field(..., description="Position du slot (0-8 pour 3x3, 0-15 pour 4x4, 0-24 pour 5x5)")
    card_id: Optional[str] = Field(None, description="ID de la carte TCGdx placée dans ce slot")
    user_card_id: Optional[str] = Field(None, description="ID de la UserCard associée")

class BinderPage(BaseModel):
    """Représente une page du binder"""
    page_number: int = Field(..., description="Numéro de la page (commence à 1)")
    slots: List[CardSlot] = Field(default_factory=list, description="Liste des slots de la page")

class BinderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Nom du binder")
    size: BinderSize = Field(..., description="Taille du binder (3x3, 4x4, 5x5)")
    description: Optional[str] = Field(None, max_length=500, description="Description optionnelle du binder")
    is_public: bool = Field(default=False, description="Si le binder est public (pour partage futur)")

class BinderCreate(BinderBase):
    """Modèle pour créer un nouveau binder"""
    pass

class BinderUpdate(BaseModel):
    """Modèle pour mettre à jour un binder"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    size: Optional[BinderSize] = None
    description: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None

class BinderInDB(BinderBase):
    """Modèle pour le binder en base de données"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., description="ID de l'utilisateur propriétaire")
    pages: List[BinderPage] = Field(default_factory=list, description="Pages du binder avec leurs slots")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

    def get_slots_per_page(self) -> int:
        """Retourne le nombre de slots par page selon la taille"""
        if self.size == BinderSize.SMALL:
            return 9  # 3x3
        elif self.size == BinderSize.MEDIUM:
            return 16  # 4x4
        elif self.size == BinderSize.LARGE:
            return 25  # 5x5
        return 9

    def initialize_pages(self, num_pages: int = 1):
        """Initialise les pages du binder avec des slots vides"""
        slots_per_page = self.get_slots_per_page()
        self.pages = []
        
        for page_num in range(1, num_pages + 1):
            slots = [
                CardSlot(position=i, card_id=None, user_card_id=None)
                for i in range(slots_per_page)
            ]
            page = BinderPage(page_number=page_num, slots=slots)
            self.pages.append(page)

class BinderResponse(BinderBase):
    """Modèle de réponse pour un binder"""
    id: str
    user_id: str
    pages: List[BinderPage]
    created_at: datetime
    updated_at: datetime
    total_pages: int = Field(..., description="Nombre total de pages")
    total_cards: int = Field(..., description="Nombre total de cartes dans le binder")

class BinderSummary(BaseModel):
    """Modèle résumé pour la liste des binders"""
    id: str
    name: str
    size: BinderSize
    description: Optional[str]
    is_public: bool
    total_pages: int
    total_cards: int
    created_at: datetime
    updated_at: datetime
    preview_cards: List[str] = Field(default_factory=list, description="IDs des premières cartes pour preview")

class AddCardToBinder(BaseModel):
    """Modèle pour ajouter une carte au binder"""
    user_card_id: str = Field(..., description="ID de la UserCard à ajouter")
    page_number: Optional[int] = Field(None, description="Numéro de page spécifique (optionnel pour placement automatique)")
    position: Optional[int] = Field(None, description="Position spécifique dans la page (optionnel pour placement automatique)")

class RemoveCardFromBinder(BaseModel):
    """Modèle pour retirer une carte du binder"""
    page_number: int = Field(..., description="Numéro de la page")
    position: int = Field(..., description="Position dans la page")

class MoveCardInBinder(BaseModel):
    """Modèle pour déplacer une carte dans le binder"""
    source_page: int = Field(..., description="Numéro de la page source")
    source_position: int = Field(..., description="Position source dans la page")
    destination_page: int = Field(..., description="Numéro de la page destination")
    destination_position: int = Field(..., description="Position destination dans la page")

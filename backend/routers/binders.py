from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import List
import logging

from dependencies import get_database, get_current_user
from models.user import UserInDB
from models.binder import (
    BinderCreate, BinderUpdate, BinderResponse, BinderSummary,
    AddCardToBinder, RemoveCardFromBinder, MoveCardInBinder
)
from services.binder_service import BinderService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/user/binders", tags=["binders"])
security = HTTPBearer()

@router.get("/", response_model=List[BinderSummary])
async def get_user_binders(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Récupère tous les binders de l'utilisateur connecté"""
    try:
        binder_service = BinderService(db)
        binders = await binder_service.get_user_binders(str(current_user.id))
        return binders
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des binders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des binders"
        )

@router.post("/", response_model=BinderResponse, status_code=status.HTTP_201_CREATED)
async def create_binder(
    binder_data: BinderCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Crée un nouveau binder pour l'utilisateur connecté"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.create_binder(str(current_user.id), binder_data)
        
        # Convertir en BinderResponse
        return BinderResponse(
            id=str(binder.id),
            user_id=str(binder.user_id),
            name=binder.name,
            size=binder.size,
            description=binder.description,
            is_public=binder.is_public,
            pages=binder.pages,
            total_pages=len(binder.pages),
            total_cards=0,  # Nouveau binder, pas de cartes
            created_at=binder.created_at,
            updated_at=binder.updated_at
        )
    except Exception as e:
        logger.error(f"Erreur lors de la création du binder: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du binder"
        )

@router.get("/{binder_id}", response_model=BinderResponse)
async def get_binder(
    binder_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Récupère un binder spécifique par son ID"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.get_binder_by_id(binder_id, str(current_user.id))
        
        if not binder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return binder
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération du binder"
        )

@router.patch("/{binder_id}", response_model=BinderResponse)
async def update_binder(
    binder_id: str,
    update_data: BinderUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Met à jour un binder"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.update_binder(binder_id, str(current_user.id), update_data)
        
        if not binder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return binder
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du binder"
        )

@router.delete("/{binder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_binder(
    binder_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Supprime un binder"""
    try:
        binder_service = BinderService(db)
        deleted = await binder_service.delete_binder(binder_id, str(current_user.id))
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du binder"
        )

@router.post("/{binder_id}/cards", response_model=BinderResponse)
async def add_card_to_binder(
    binder_id: str,
    card_data: AddCardToBinder,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Ajoute une carte au binder"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.add_card_to_binder(binder_id, str(current_user.id), card_data)
        
        if not binder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return binder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout de carte au binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'ajout de la carte"
        )

@router.delete("/{binder_id}/cards", response_model=BinderResponse)
async def remove_card_from_binder(
    binder_id: str,
    remove_data: RemoveCardFromBinder,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Retire une carte du binder"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.remove_card_from_binder(binder_id, str(current_user.id), remove_data)
        
        if not binder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return binder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de carte du binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression de la carte"
        )

@router.post("/{binder_id}/pages", response_model=BinderResponse)
async def add_page_to_binder(
    binder_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Ajoute une nouvelle page au binder"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.add_page_to_binder(binder_id, str(current_user.id))
        
        if not binder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return binder
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout de page au binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'ajout de la page"
        )

@router.patch("/{binder_id}/cards/move", response_model=BinderResponse)
async def move_card_in_binder(
    binder_id: str,
    move_data: MoveCardInBinder,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_database)
):
    """Déplace une carte dans le binder (drag & drop)"""
    try:
        binder_service = BinderService(db)
        binder = await binder_service.move_card_in_binder(binder_id, str(current_user.id), move_data)
        
        if not binder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Binder non trouvé"
            )
        
        return binder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du déplacement de carte dans le binder {binder_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du déplacement de la carte"
        )

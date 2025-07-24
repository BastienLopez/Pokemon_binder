from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.user_card import UserCardCreate, UserCardUpdate, UserCardResponse
from services.user_card_service import UserCardService
from dependencies import get_current_active_user, get_user_card_service

router = APIRouter()

@router.get("/cards", response_model=List[UserCardResponse])
async def get_user_cards(
    current_user = Depends(get_current_active_user),
    user_card_service: UserCardService = Depends(get_user_card_service)
):
    """Récupérer toutes les cartes de l'utilisateur connecté"""
    try:
        cards = await user_card_service.get_user_cards(str(current_user.id))
        return cards
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des cartes: {str(e)}"
        )

@router.post("/cards", response_model=UserCardResponse)
async def add_user_card(
    card_data: UserCardCreate,
    current_user = Depends(get_current_active_user),
    user_card_service: UserCardService = Depends(get_user_card_service)
):
    """Ajouter une carte à la collection de l'utilisateur connecté"""
    try:
        result = await user_card_service.add_user_card(str(current_user.id), card_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible d'ajouter la carte"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'ajout de la carte: {str(e)}"
        )

@router.get("/cards/{card_id}", response_model=UserCardResponse)
async def get_user_card(
    card_id: str,
    current_user = Depends(get_current_active_user),
    user_card_service: UserCardService = Depends(get_user_card_service)
):
    """Récupérer une carte spécifique de l'utilisateur"""
    try:
        card = await user_card_service.get_user_card_by_id(card_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Carte non trouvée"
            )
        
        # Vérifier que la carte appartient bien à l'utilisateur connecté
        if card.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé à cette carte"
            )
        
        return card
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de la carte: {str(e)}"
        )

@router.patch("/cards/{card_id}", response_model=UserCardResponse)
async def update_user_card(
    card_id: str,
    update_data: UserCardUpdate,
    current_user = Depends(get_current_active_user),
    user_card_service: UserCardService = Depends(get_user_card_service)
):
    """Modifier les informations d'une carte de l'utilisateur"""
    try:
        # Vérifier que la carte existe et appartient à l'utilisateur
        existing_card = await user_card_service.get_user_card_by_id(card_id)
        if not existing_card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Carte non trouvée"
            )
        
        if existing_card.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé à cette carte"
            )
        
        result = await user_card_service.update_user_card(card_id, update_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de mettre à jour la carte"
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour de la carte: {str(e)}"
        )

@router.delete("/cards/{card_id}")
async def delete_user_card(
    card_id: str,
    current_user = Depends(get_current_active_user),
    user_card_service: UserCardService = Depends(get_user_card_service)
):
    """Supprimer une carte de la collection de l'utilisateur"""
    try:
        # Vérifier que la carte existe et appartient à l'utilisateur
        existing_card = await user_card_service.get_user_card_by_id(card_id)
        if not existing_card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Carte non trouvée"
            )
        
        if existing_card.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé à cette carte"
            )
        
        success = await user_card_service.delete_user_card(card_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer la carte"
            )
        
        return {"message": "Carte supprimée avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de la carte: {str(e)}"
        )

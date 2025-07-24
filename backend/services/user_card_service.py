from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user_card import UserCardCreate, UserCardInDB, UserCardUpdate, UserCardResponse
from bson import ObjectId
from datetime import datetime

class UserCardService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.user_cards

    async def get_user_cards(self, user_id: str) -> List[UserCardResponse]:
        """Récupérer toutes les cartes d'un utilisateur"""
        try:
            cursor = self.collection.find({"user_id": ObjectId(user_id)})
            user_cards = []
            async for card in cursor:
                user_cards.append(UserCardResponse(
                    id=str(card["_id"]),
                    user_id=str(card["user_id"]),
                    card_id=card["card_id"],
                    card_name=card["card_name"],
                    card_image=card.get("card_image"),
                    set_id=card["set_id"],
                    set_name=card["set_name"],
                    quantity=card["quantity"],
                    condition=card["condition"],
                    version=card.get("version"),
                    rarity=card.get("rarity"),
                    local_id=card.get("local_id"),
                    created_at=card["created_at"],
                    updated_at=card["updated_at"]
                ))
            return user_cards
        except Exception as e:
            print(f"Erreur lors de la récupération des cartes: {e}")
            return []

    async def add_user_card(self, user_id: str, card_data: UserCardCreate) -> Optional[UserCardResponse]:
        """Ajouter une carte à la collection d'un utilisateur"""
        try:
            # Vérifier si la carte existe déjà pour cet utilisateur
            existing_card = await self.collection.find_one({
                "user_id": ObjectId(user_id),
                "card_id": card_data.card_id
            })
            
            if existing_card:
                # Si la carte existe déjà, augmenter la quantité
                new_quantity = existing_card["quantity"] + card_data.quantity
                updated_card = await self.update_user_card(
                    str(existing_card["_id"]), 
                    UserCardUpdate(quantity=new_quantity)
                )
                return updated_card
            else:
                # Créer une nouvelle entrée
                card_dict = card_data.dict()
                card_dict["user_id"] = ObjectId(user_id)
                card_dict["created_at"] = datetime.utcnow()
                card_dict["updated_at"] = datetime.utcnow()
                
                result = await self.collection.insert_one(card_dict)
                card_dict["_id"] = result.inserted_id
                
                return UserCardResponse(
                    id=str(result.inserted_id),
                    user_id=user_id,
                    **card_data.dict()
                )
        except Exception as e:
            print(f"Erreur lors de l'ajout de la carte: {e}")
            return None

    async def update_user_card(self, card_id: str, update_data: UserCardUpdate) -> Optional[UserCardResponse]:
        """Modifier les informations d'une carte utilisateur"""
        try:
            update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(card_id)},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                return UserCardResponse(
                    id=str(result["_id"]),
                    user_id=str(result["user_id"]),
                    card_id=result["card_id"],
                    card_name=result["card_name"],
                    card_image=result.get("card_image"),
                    set_id=result["set_id"],
                    set_name=result["set_name"],
                    quantity=result["quantity"],
                    condition=result["condition"],
                    version=result.get("version"),
                    rarity=result.get("rarity"),
                    local_id=result.get("local_id"),
                    created_at=result["created_at"],
                    updated_at=result["updated_at"]
                )
            return None
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la carte: {e}")
            return None

    async def delete_user_card(self, card_id: str) -> bool:
        """Supprimer une carte de la collection d'un utilisateur"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(card_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Erreur lors de la suppression de la carte: {e}")
            return False

    async def get_user_card_by_id(self, card_id: str) -> Optional[UserCardResponse]:
        """Récupérer une carte spécifique par son ID"""
        try:
            card = await self.collection.find_one({"_id": ObjectId(card_id)})
            if card:
                return UserCardResponse(
                    id=str(card["_id"]),
                    user_id=str(card["user_id"]),
                    card_id=card["card_id"],
                    card_name=card["card_name"],
                    card_image=card.get("card_image"),
                    set_id=card["set_id"],
                    set_name=card["set_name"],
                    quantity=card["quantity"],
                    condition=card["condition"],
                    version=card.get("version"),
                    rarity=card.get("rarity"),
                    local_id=card.get("local_id"),
                    created_at=card["created_at"],
                    updated_at=card["updated_at"]
                )
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération de la carte: {e}")
            return None

    async def get_cards_count(self, user_id: str) -> int:
        """Récupérer le nombre total de cartes d'un utilisateur"""
        try:
            count = await self.collection.count_documents({"user_id": ObjectId(user_id)})
            return count
        except Exception as e:
            print(f"Erreur lors du comptage des cartes: {e}")
            return 0

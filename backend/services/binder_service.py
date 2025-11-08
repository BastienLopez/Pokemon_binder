from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.binder import (
    BinderInDB, BinderCreate, BinderUpdate, BinderResponse, BinderSummary,
    AddCardToBinder, RemoveCardFromBinder, MoveCardInBinder, BinderPage, CardSlot
)
from models.user_card import UserCardInDB
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class BinderService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.binders

    async def create_binder(self, user_id: str, binder_data: BinderCreate) -> BinderInDB:
        """Crée un nouveau binder pour l'utilisateur"""
        try:
            # Créer le binder avec les données de base
            binder = BinderInDB(
                **binder_data.dict(),
                user_id=ObjectId(user_id)
            )
            
            # Initialiser avec une page par défaut
            binder.initialize_pages(num_pages=1)
            
            # Insérer en base
            result = await self.collection.insert_one(binder.dict(by_alias=True))
            binder.id = result.inserted_id
            
            logger.info(f"Binder créé avec succès: {result.inserted_id} pour l'utilisateur {user_id}")
            return binder
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du binder: {str(e)}")
            raise

    async def get_user_binders(self, user_id: str) -> List[BinderSummary]:
        """Récupère tous les binders d'un utilisateur avec un résumé"""
        try:
            cursor = self.collection.find({"user_id": ObjectId(user_id)})
            binders_summary = []
            
            async for binder_data in cursor:
                # Compter les cartes
                total_cards = 0
                preview_cards = []
                
                for page in binder_data.get("pages", []):
                    for slot in page.get("slots", []):
                        if slot.get("card_id"):
                            total_cards += 1
                            if len(preview_cards) < 4:  # Limiter à 4 cartes pour la preview
                                preview_cards.append(slot["card_id"])
                
                binder_summary = BinderSummary(
                    id=str(binder_data["_id"]),
                    name=binder_data["name"],
                    size=binder_data["size"],
                    description=binder_data.get("description"),
                    is_public=binder_data.get("is_public", False),
                    total_pages=len(binder_data.get("pages", [])),
                    total_cards=total_cards,
                    preview_cards=preview_cards,
                    created_at=binder_data["created_at"],
                    updated_at=binder_data["updated_at"]
                )
                binders_summary.append(binder_summary)
            
            return binders_summary
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des binders: {str(e)}")
            raise

    async def get_binder_by_id(self, binder_id: str, user_id: str) -> Optional[BinderResponse]:
        """Récupère un binder spécifique par son ID"""
        try:
            binder_data = await self.collection.find_one({
                "_id": ObjectId(binder_id),
                "user_id": ObjectId(user_id)
            })
            
            if not binder_data:
                return None
            
            # Enrichir les slots avec les métadonnées des cartes
            user_cards_collection = self.database.user_cards
            total_cards = 0
            
            for page in binder_data.get("pages", []):
                for slot in page.get("slots", []):
                    if slot.get("card_id"):
                        total_cards += 1
                        # Récupérer les métadonnées de la carte depuis user_cards
                        user_card_id = slot.get("user_card_id")
                        if user_card_id:
                            try:
                                user_card = await user_cards_collection.find_one({
                                    "_id": ObjectId(user_card_id)
                                })
                                if user_card:
                                    slot["card_name"] = user_card.get("card_name", "")
                                    slot["card_image"] = user_card.get("card_image", "")
                                    slot["set_name"] = user_card.get("set_name", "")
                                    slot["rarity"] = user_card.get("rarity", "")
                            except Exception as e:
                                logger.warning(f"Impossible de charger les métadonnées pour user_card_id {user_card_id}: {e}")
            
            # Valider et reconstruire les pages pour s'assurer que page_number existe
            validated_pages = []
            for idx, page_data in enumerate(binder_data.get("pages", []), start=1):
                # S'assurer que page_number existe, sinon utiliser l'index
                page_number = page_data.get("page_number", idx)
                validated_pages.append(BinderPage(
                    page_number=page_number,
                    slots=page_data.get("slots", [])
                ))
            
            binder_response = BinderResponse(
                id=str(binder_data["_id"]),
                user_id=str(binder_data["user_id"]),
                name=binder_data["name"],
                size=binder_data["size"],
                description=binder_data.get("description"),
                is_public=binder_data.get("is_public", False),
                pages=validated_pages,
                total_pages=len(validated_pages),
                total_cards=total_cards,
                created_at=binder_data["created_at"],
                updated_at=binder_data["updated_at"]
            )
            
            return binder_response
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du binder {binder_id}: {str(e)}")
            raise

    async def update_binder(self, binder_id: str, user_id: str, update_data: BinderUpdate) -> Optional[BinderInDB]:
        """Met à jour un binder"""
        try:
            # Préparer les données de mise à jour
            update_dict = {}
            for field, value in update_data.dict(exclude_unset=True).items():
                if value is not None:
                    update_dict[field] = value
            
            if not update_dict:
                # Aucune mise à jour à effectuer
                return await self.get_binder_by_id(binder_id, user_id)
            
            # Ajouter la date de modification
            update_dict["updated_at"] = datetime.utcnow()
            
            # Si la taille change, on doit réinitialiser les pages
            if "size" in update_dict:
                existing_binder = await self.collection.find_one({
                    "_id": ObjectId(binder_id),
                    "user_id": ObjectId(user_id)
                })
                
                if existing_binder and existing_binder["size"] != update_dict["size"]:
                    # Créer un binder temporaire pour initialiser les pages
                    temp_binder = BinderInDB(
                        name=existing_binder["name"],
                        size=update_dict["size"],
                        user_id=ObjectId(user_id)
                    )
                    temp_binder.initialize_pages(len(existing_binder.get("pages", [1])))
                    update_dict["pages"] = [page.dict() for page in temp_binder.pages]
            
            # Effectuer la mise à jour
            result = await self.collection.update_one(
                {"_id": ObjectId(binder_id), "user_id": ObjectId(user_id)},
                {"$set": update_dict}
            )
            
            if result.matched_count == 0:
                return None
            
            return await self.get_binder_by_id(binder_id, user_id)
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du binder {binder_id}: {str(e)}")
            raise

    async def delete_binder(self, binder_id: str, user_id: str) -> bool:
        """Supprime un binder"""
        try:
            result = await self.collection.delete_one({
                "_id": ObjectId(binder_id),
                "user_id": ObjectId(user_id)
            })
            
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du binder {binder_id}: {str(e)}")
            raise

    async def add_card_to_binder(self, binder_id: str, user_id: str, card_data: AddCardToBinder) -> Optional[BinderResponse]:
        """Ajoute une carte au binder"""
        try:
            # Vérifier que la UserCard appartient bien à l'utilisateur
            user_cards_collection = self.database.user_cards
            user_card = await user_cards_collection.find_one({
                "_id": ObjectId(card_data.user_card_id),
                "user_id": ObjectId(user_id)
            })
            
            if not user_card:
                raise ValueError("Carte utilisateur non trouvée ou non autorisée")
            
            # Récupérer le binder
            binder = await self.collection.find_one({
                "_id": ObjectId(binder_id),
                "user_id": ObjectId(user_id)
            })
            
            if not binder:
                return None
            
            # Déterminer la position d'insertion
            if card_data.page_number is not None and card_data.position is not None:
                # Placement manuel
                page_index = card_data.page_number - 1
                if page_index >= len(binder["pages"]):
                    raise ValueError("Numéro de page invalide")
                
                page = binder["pages"][page_index]
                if card_data.position >= len(page["slots"]):
                    raise ValueError("Position invalide")
                
                # Vérifier que le slot est libre
                if page["slots"][card_data.position]["card_id"]:
                    raise ValueError("Ce slot est déjà occupé")
                
                # Placer la carte
                page["slots"][card_data.position]["card_id"] = user_card["card_id"]
                page["slots"][card_data.position]["user_card_id"] = str(user_card["_id"])
                
            else:
                # Placement automatique - trouver le premier slot libre
                placed = False
                for page in binder["pages"]:
                    for slot in page["slots"]:
                        if not slot["card_id"]:
                            slot["card_id"] = user_card["card_id"]
                            slot["user_card_id"] = str(user_card["_id"])
                            placed = True
                            break
                    if placed:
                        break
                
                if not placed:
                    # Créer une nouvelle page
                    temp_binder = BinderInDB(
                        name=binder["name"],
                        size=binder["size"],
                        user_id=ObjectId(user_id)
                    )
                    temp_binder.initialize_pages(1)
                    new_page = temp_binder.pages[0]
                    new_page.page_number = len(binder["pages"]) + 1
                    new_page.slots[0].card_id = user_card["card_id"]
                    new_page.slots[0].user_card_id = str(user_card["_id"])
                    binder["pages"].append(new_page.dict())
            
            # Mettre à jour en base
            await self.collection.update_one(
                {"_id": ObjectId(binder_id)},
                {
                    "$set": {
                        "pages": binder["pages"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return await self.get_binder_by_id(binder_id, user_id)
            
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de carte au binder {binder_id}: {str(e)}")
            raise

    async def remove_card_from_binder(self, binder_id: str, user_id: str, remove_data: RemoveCardFromBinder) -> Optional[BinderResponse]:
        """Retire une carte du binder"""
        try:
            # Récupérer le binder
            binder = await self.collection.find_one({
                "_id": ObjectId(binder_id),
                "user_id": ObjectId(user_id)
            })
            
            if not binder:
                return None
            
            # Valider la page et la position
            page_index = remove_data.page_number - 1
            if page_index >= len(binder["pages"]):
                raise ValueError("Numéro de page invalide")
            
            page = binder["pages"][page_index]
            if remove_data.position >= len(page["slots"]):
                raise ValueError("Position invalide")
            
            # Retirer la carte
            page["slots"][remove_data.position]["card_id"] = None
            page["slots"][remove_data.position]["user_card_id"] = None
            
            # Mettre à jour en base
            await self.collection.update_one(
                {"_id": ObjectId(binder_id)},
                {
                    "$set": {
                        "pages": binder["pages"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return await self.get_binder_by_id(binder_id, user_id)
            
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de carte du binder {binder_id}: {str(e)}")
            raise

    async def add_page_to_binder(self, binder_id: str, user_id: str) -> Optional[BinderResponse]:
        """Ajoute une nouvelle page au binder"""
        try:
            binder = await self.collection.find_one({
                "_id": ObjectId(binder_id),
                "user_id": ObjectId(user_id)
            })
            
            if not binder:
                return None
            
            # Créer une nouvelle page
            temp_binder = BinderInDB(
                name=binder["name"],
                size=binder["size"],
                user_id=ObjectId(user_id)
            )
            temp_binder.initialize_pages(1)
            new_page = temp_binder.pages[0]
            new_page.page_number = len(binder["pages"]) + 1
            
            # Ajouter la page
            binder["pages"].append(new_page.dict())
            
            # Mettre à jour en base
            await self.collection.update_one(
                {"_id": ObjectId(binder_id)},
                {
                    "$set": {
                        "pages": binder["pages"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return await self.get_binder_by_id(binder_id, user_id)
            
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de page au binder {binder_id}: {str(e)}")
            raise

    async def move_card_in_binder(self, binder_id: str, user_id: str, move_data: MoveCardInBinder) -> Optional[BinderResponse]:
        """Déplace une carte dans le binder (drag & drop)"""
        try:
            # Récupérer le binder
            binder = await self.collection.find_one({
                "_id": ObjectId(binder_id),
                "user_id": ObjectId(user_id)
            })
            
            if not binder:
                return None
            
            # Valider les paramètres de déplacement
            source_page_index = move_data.source_page - 1
            dest_page_index = move_data.destination_page - 1
            
            if (source_page_index >= len(binder["pages"]) or 
                dest_page_index >= len(binder["pages"]) or
                source_page_index < 0 or dest_page_index < 0):
                raise ValueError("Numéro de page invalide")
            
            source_page = binder["pages"][source_page_index]
            dest_page = binder["pages"][dest_page_index]
            
            if (move_data.source_position >= len(source_page["slots"]) or
                move_data.destination_position >= len(dest_page["slots"]) or
                move_data.source_position < 0 or move_data.destination_position < 0):
                raise ValueError("Position invalide")
            
            # Vérifier qu'il y a une carte à la position source
            source_slot = source_page["slots"][move_data.source_position]
            if not source_slot["card_id"]:
                raise ValueError("Aucune carte à la position source")
            
            # Vérifier que la destination est libre
            dest_slot = dest_page["slots"][move_data.destination_position]
            if dest_slot["card_id"]:
                raise ValueError("La position de destination est déjà occupée")
            
            # Effectuer le déplacement
            dest_slot["card_id"] = source_slot["card_id"]
            dest_slot["user_card_id"] = source_slot["user_card_id"]
            
            # Vider la position source
            source_slot["card_id"] = None
            source_slot["user_card_id"] = None
            
            # Mettre à jour en base
            await self.collection.update_one(
                {"_id": ObjectId(binder_id)},
                {
                    "$set": {
                        "pages": binder["pages"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return await self.get_binder_by_id(binder_id, user_id)
            
        except Exception as e:
            logger.error(f"Erreur lors du déplacement de carte dans le binder {binder_id}: {str(e)}")
            raise

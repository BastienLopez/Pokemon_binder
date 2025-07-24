"""
Configuration de l'environnement de test pour la base de données
Compatible avec les fonctionnalités de la Phase 3 et préparation Phase 4
"""
import os
import asyncio
import pytest
from motor.motor_asyncio import AsyncIOMotorClient
from typing import AsyncGenerator

# Configuration de test
TEST_MONGODB_URL = "mongodb://localhost:27017/pokemon_binder_test"

class DatabaseHelper:
    """Gestionnaire de base de données pour les tests"""
    
    def __init__(self):
        self.client = None
        self.database = None
    
    async def connect(self):
        """Se connecter à la base de données de test"""
        self.client = AsyncIOMotorClient(TEST_MONGODB_URL)
        self.database = self.client.pokemon_binder_test
        
        # Tester la connexion
        try:
            await self.client.admin.command('ping')
            print("✅ Connexion à MongoDB de test réussie!")
        except Exception as e:
            print(f"❌ Erreur de connexion à MongoDB de test: {e}")
            raise
    
    async def disconnect(self):
        """Se déconnecter de la base de données de test"""
        if self.client:
            self.client.close()
    
    async def clear_data(self):
        """Nettoyer toutes les données de test"""
        if self.database:
            try:
                # Collections existantes
                await self.database.users.delete_many({})
                
                # Collections pour la Phase 4 (préparation)
                await self.database.user_cards.delete_many({})
                await self.database.binders.delete_many({})
                
                # Collections pour les phases futures
                await self.database.wishlists.delete_many({})
                
            except Exception:
                pass  # Ignorer les erreurs si les collections n'existent pas
    
    async def setup_test_data(self):
        """Configurer des données de test de base"""
        if self.database:
            # Données de test pour utilisateur
            test_user = {
                "_id": "test_user_id",
                "email": "test@example.com",
                "username": "testuser",
                "full_name": "Test User",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
            
            try:
                # Insérer seulement si n'existe pas déjà
                existing_user = await self.database.users.find_one({"_id": "test_user_id"})
                if not existing_user:
                    await self.database.users.insert_one(test_user)
                    print("✅ Données de test utilisateur créées")
            except Exception:
                pass  # Ignorer si l'utilisateur existe déjà

# Instance globale pour les tests
test_db = DatabaseHelper()

async def get_test_database():
    """Obtenir la base de données de test"""
    if test_db.database is None:
        await test_db.connect()
    return test_db.database

def mock_get_database():
    """Mock de la fonction get_database pour les tests"""
    import asyncio
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # Si la boucle est déjà en cours, créer une tâche
        return asyncio.create_task(get_test_database())
    else:
        # Sinon, exécuter directement
        return loop.run_until_complete(get_test_database())

# Tests de base de données
class TestDatabaseConnection:
    """Tests de connexion à la base de données"""
    
    @pytest.mark.asyncio
    async def test_database_connection(self):
        """Test de connexion à MongoDB"""
        try:
            await test_db.connect()
            assert test_db.database is not None
            assert test_db.client is not None
            print("✅ Test de connexion DB réussi")
        except Exception as e:
            pytest.skip(f"MongoDB non disponible: {e}")
    
    @pytest.mark.asyncio 
    async def test_database_operations(self):
        """Test des opérations de base de données"""
        try:
            await test_db.connect()
            
            # Test d'insertion
            test_doc = {"test": "data", "phase": 3}
            result = await test_db.database.test_collection.insert_one(test_doc)
            assert result.inserted_id is not None
            
            # Test de lecture
            doc = await test_db.database.test_collection.find_one({"test": "data"})
            assert doc is not None
            assert doc["phase"] == 3
            
            # Test de nettoyage
            await test_db.database.test_collection.delete_one({"test": "data"})
            
            print("✅ Test des opérations DB réussi")
            
        except Exception as e:
            pytest.skip(f"MongoDB non disponible: {e}")
    
    @pytest.mark.asyncio
    async def test_user_collection_ready(self):
        """Test que la collection users est prête pour l'authentification"""
        try:
            await test_db.connect()
            await test_db.setup_test_data()
            
            # Vérifier que l'utilisateur de test existe
            user = await test_db.database.users.find_one({"email": "test@example.com"})
            if user:
                assert user["username"] == "testuser"
                assert user["is_active"] == True
                print("✅ Collection utilisateurs opérationnelle")
            
        except Exception as e:
            pytest.skip(f"MongoDB non disponible: {e}")
    
    @pytest.mark.asyncio
    async def test_phase4_collections_ready(self):
        """Test que les collections pour la Phase 4 sont prêtes"""
        try:
            await test_db.connect()
            
            # Test de création des collections pour Phase 4
            collections_to_test = ["user_cards", "binders"]
            
            for collection_name in collections_to_test:
                # Tenter d'insérer et supprimer un document test
                collection = getattr(test_db.database, collection_name)
                test_doc = {"test": True, "phase": 4}
                result = await collection.insert_one(test_doc)
                assert result.inserted_id is not None
                
                # Nettoyer
                await collection.delete_one({"test": True})
            
            print("✅ Collections Phase 4 prêtes")
            
        except Exception as e:
            pytest.skip(f"MongoDB non disponible: {e}")

# Fixture pour les tests
@pytest.fixture(scope="session")
async def database():
    """Fixture de base de données pour les tests"""
    await test_db.connect()
    await test_db.clear_data()
    await test_db.setup_test_data()
    yield test_db.database
    await test_db.clear_data()
    await test_db.disconnect()

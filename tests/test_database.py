"""
Configuration de l'environnement de test pour la base de données
"""
import os
import asyncio
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
                await self.database.users.delete_many({})
                await self.database.cards.delete_many({})
                await self.database.binders.delete_many({})
            except Exception:
                pass  # Ignorer les erreurs si les collections n'existent pas

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

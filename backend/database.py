import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database():
    return db.database

async def connect_to_mongo():
    """Créer une connexion à MongoDB"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/pokemon_binder")
    
    db.client = AsyncIOMotorClient(
        mongodb_url,
        server_api=ServerApi('1')
    )
    
    # Extraire le nom de la base de données de l'URL
    db_name = mongodb_url.split("/")[-1] or "pokemon_binder"
    db.database = db.client[db_name]
    
    # Test de connexion
    try:
        await db.client.admin.command('ping')
        print("✅ Connexion à MongoDB réussie!")
    except Exception as e:
        print(f"❌ Erreur de connexion à MongoDB: {e}")

async def close_mongo_connection():
    """Fermer la connexion à MongoDB"""
    if db.client:
        db.client.close()
        print("🔌 Connexion MongoDB fermée")

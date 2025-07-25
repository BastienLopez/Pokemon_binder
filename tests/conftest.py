"""
Configuration pytest pour tous les tests - Consolidé et nettoyé
"""

import pytest
import sys
import os
import asyncio
import warnings
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

# Supprimer les warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", module="pydantic")

# Ajouter le répertoire racine au path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

# Configuration de l'environnement de test
os.environ["TESTING"] = "true"

# Configuration pytest
def pytest_configure(config):
    """Configuration pytest"""
    # Ajouter des markers personnalisés
    config.addinivalue_line("markers", "slow: marque les tests lents")
    config.addinivalue_line("markers", "integration: tests d'intégration")
    config.addinivalue_line("markers", "unit: tests unitaires")
    config.addinivalue_line("markers", "frontend: tests frontend")
    config.addinivalue_line("markers", "backend: tests backend")

@pytest.fixture(scope="session")
def event_loop():
    """Créer une boucle d'événement pour les tests"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

@pytest.fixture
def mock_database():
    """Mock de base de données pour les tests"""
    mock_db = MagicMock()
    mock_collection = AsyncMock()
    mock_db.users = mock_collection
    
    # Configuration des mocks pour les tests
    mock_collection.find_one = AsyncMock(return_value=None)
    mock_collection.insert_one = AsyncMock()
    mock_collection.update_one = AsyncMock()
    mock_collection.delete_many = AsyncMock()
    
    return mock_db

@pytest.fixture
def test_client(mock_database):
    """Client de test FastAPI avec base de données mockée"""
    try:
        from fastapi.testclient import TestClient
        from backend.main import app
        from backend.database import db
        
        # Sauvegarder l'état original
        original_database = db.database
        
        # Configurer la DB mockée
        db.database = mock_database
        
        client = TestClient(app)
        
        yield client
        
        # Restaurer l'état original
        db.database = original_database
        
    except Exception as e:
        # Si il y a des problèmes d'import, retourner None
        yield None

@pytest.fixture(scope="session")
def test_user_data():
    """Données d'utilisateur de test"""
    return {
        "email": "pytest.test@example.com",
        "password": "PyTestPassword123!",
        "username": "pytestuser",
        "full_name": "PyTest User"
    }

@pytest.fixture(scope="session")
def api_urls():
    """URLs de l'API"""
    return {
        "base": "http://localhost:8000",
        "auth": "http://localhost:8000/auth",
        "signup": "http://localhost:8000/auth/signup",
        "login": "http://localhost:8000/auth/login",
        "me": "http://localhost:8000/auth/me"
    }

@pytest.fixture(scope="session")
def frontend_urls():
    """URLs du frontend"""
    return {
        "base": "http://localhost:3000",
        "login": "http://localhost:3000/login",
        "signup": "http://localhost:3000/signup",
        "user": "http://localhost:3000/user"
    }

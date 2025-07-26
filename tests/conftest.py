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

@pytest.fixture
def sample_user():
    """Utilisateur de test simulé"""
    class MockUser:
        def __init__(self):
            self.id = "60f7b3b3b3b3b3b3b3b3b3b3"
            self.email = "test@example.com"
            self.username = "testuser"
    
    return MockUser()

@pytest.fixture
def sample_binder_with_cards():
    """Binder de test avec cartes simulé"""
    class MockSlot:
        def __init__(self, card_id=None, user_card_id=None):
            self.card_id = card_id
            self.user_card_id = user_card_id

    class MockPage:
        def __init__(self):
            self.slots = [
                MockSlot("card_1", "user_card_1"),  # Position 0
                MockSlot("card_2", "user_card_2"),  # Position 1
                MockSlot(),  # Position 2 libre
                MockSlot(),  # Position 3 libre
                MockSlot("card_3", "user_card_3"),  # Position 4
                MockSlot(),  # Position 5 libre
                MockSlot(),  # Position 6 libre
                MockSlot(),  # Position 7 libre
                MockSlot(),  # Position 8 libre
            ]

    class MockBinder:
        def __init__(self):
            self.id = "60f7b3b3b3b3b3b3b3b3b3b4"
            self.name = "Test Binder"
            self.size = "3x3"
            self.pages = [MockPage()]

    return MockBinder()

@pytest.fixture
def sample_binder_with_cards_dict():
    """Binder de test en format dictionnaire"""
    return {
        "id": "60f7b3b3b3b3b3b3b3b3b3b4",
        "name": "Test Binder",
        "size": "3x3",
        "pages": [
            {
                "page_number": 1,
                "slots": [
                    {"card_id": "card_1", "user_card_id": "user_card_1"},
                    {"card_id": "card_2", "user_card_id": "user_card_2"},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": "card_3", "user_card_id": "user_card_3"},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                ]
            }
        ]
    }

@pytest.fixture
def sample_binder_with_multiple_pages_dict():
    """Binder multi-pages de test en format dictionnaire"""
    return {
        "id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "name": "Multi-Page Test Binder",
        "size": "3x3",
        "pages": [
            {
                "page_number": 1,
                "slots": [
                    {"card_id": "card_1", "user_card_id": "user_card_1"},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                ]
            },
            {
                "page_number": 2,
                "slots": [
                    {"card_id": None, "user_card_id": None},
                    {"card_id": "card_2", "user_card_id": "user_card_2"},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                    {"card_id": None, "user_card_id": None},
                ]
            }
        ]
    }

@pytest.fixture
def auth_headers():
    """Headers d'authentification de test"""
    return {
        "Authorization": "Bearer test_jwt_token",
        "Content-Type": "application/json"
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

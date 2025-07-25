import pytest
import asyncio
import sys
import os
from unittest.mock import AsyncMock, MagicMock

# Ajouter le répertoire backend au path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

@pytest.fixture(scope="session")
def event_loop():
    """Créer une event loop pour toute la session de test"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_database():
    """Mock de base de données pour les tests"""
    database = MagicMock()
    database.users = AsyncMock()
    database.user_cards = AsyncMock()
    return database

@pytest.fixture
def mock_user_service(mock_database):
    """Mock du service utilisateur"""
    from services.user_service import UserService
    service = UserService(mock_database)
    return service

@pytest.fixture
def mock_user_card_service(mock_database):
    """Mock du service de cartes utilisateur"""
    from services.user_card_service import UserCardService
    service = UserCardService(mock_database)
    return service

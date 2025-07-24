import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
import sys
import os

# Ajouter le répertoire backend au path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from main import app

class TestAPI:
    """Tests de l'API principale"""
    
    def setup_method(self):
        """Setup pour chaque test"""
        self.client = TestClient(app)
    
    def test_root_endpoint(self):
        """Test de l'endpoint racine"""
        response = self.client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "API is running" in data["message"]
    
    def test_health_check(self):
        """Test de santé de l'API"""
        response = self.client.get("/")
        assert response.status_code == 200
        # Vérifier que l'API répond
        assert response.headers["content-type"] == "application/json"

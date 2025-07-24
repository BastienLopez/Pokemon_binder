import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test de l'endpoint racine"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Pokémon TCG Binder API is running!" in response.json()["message"]

def test_health_check():
    """Test du health check"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_endpoints_exist():
    """Test que les endpoints d'authentification existent"""
    # Test signup endpoint
    response = client.post("/auth/signup")
    assert response.status_code in [200, 422]  # 422 pour validation manquante
    
    # Test login endpoint  
    response = client.post("/auth/login")
    assert response.status_code in [200, 422]  # 422 pour validation manquante
    
    # Test me endpoint
    response = client.get("/auth/me")
    assert response.status_code in [200, 401]  # 401 si pas authentifié

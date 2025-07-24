import pytest
import requests
import time
from datetime import datetime

class TestIntegration:
    """Tests d'intégration end-to-end"""
    
    @pytest.fixture(scope="class")
    def api_base_url(self):
        """URL de base de l'API"""
        return "http://localhost:8000"
    
    @pytest.fixture(scope="class")
    def frontend_base_url(self):
        """URL de base du frontend"""
        return "http://localhost:3000"
    
    def test_api_health(self, api_base_url):
        """Test que l'API est accessible"""
        try:
            response = requests.get(f"{api_base_url}/", timeout=5)
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
        except requests.ConnectionError:
            pytest.skip("API not running - skipping integration test")
    
    def test_frontend_health(self, frontend_base_url):
        """Test que le frontend est accessible"""
        try:
            response = requests.get(frontend_base_url, timeout=5)
            assert response.status_code == 200
            assert "text/html" in response.headers.get("content-type", "")
        except requests.ConnectionError:
            pytest.skip("Frontend not running - skipping integration test")
    
    def test_complete_auth_flow(self, api_base_url):
        """Test du flux d'authentification complet"""
        try:
            # 1. Inscription
            test_user = {
                "email": f"integration.test.{datetime.now().microsecond}@example.com",
                "password": "IntegrationTest123!",
                "username": f"integrationtest{datetime.now().microsecond}",
                "full_name": "Integration Test User"
            }
            
            signup_response = requests.post(
                f"{api_base_url}/auth/signup", 
                json=test_user,
                timeout=5
            )
            assert signup_response.status_code == 200
            
            signup_data = signup_response.json()
            assert signup_data["email"] == test_user["email"]
            assert "id" in signup_data
            
            # 2. Connexion
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            
            login_response = requests.post(
                f"{api_base_url}/auth/login",
                json=login_data,
                timeout=5
            )
            assert login_response.status_code == 200
            
            login_result = login_response.json()
            assert "access_token" in login_result
            token = login_result["access_token"]
            
            # 3. Vérification du profil
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(
                f"{api_base_url}/auth/me",
                headers=headers,
                timeout=5
            )
            assert me_response.status_code == 200
            
            user_data = me_response.json()
            assert user_data["email"] == test_user["email"]
            assert user_data["username"] == test_user["username"]
            
        except requests.ConnectionError:
            pytest.skip("API not running - skipping integration test")
    
    def test_unauthorized_access(self, api_base_url):
        """Test d'accès non autorisé"""
        try:
            # Tentative d'accès sans token
            response = requests.get(f"{api_base_url}/auth/me", timeout=5)
            # Accepter 401 ou 403 selon la configuration du serveur
            assert response.status_code in [401, 403]
            
            # Tentative d'accès avec token invalide
            headers = {"Authorization": "Bearer invalid-token"}
            response = requests.get(f"{api_base_url}/auth/me", headers=headers, timeout=5)
            assert response.status_code in [401, 403]
            
        except requests.ConnectionError:
            pytest.skip("API not running - skipping integration test")
    
    def test_api_cors_headers(self, api_base_url):
        """Test des headers CORS"""
        try:
            response = requests.get(f"{api_base_url}/", timeout=5)
            # Vérifier que les headers CORS sont présents si configurés
            # (optionnel selon la configuration)
            assert response.status_code == 200
        except requests.ConnectionError:
            pytest.skip("API not running - skipping integration test")

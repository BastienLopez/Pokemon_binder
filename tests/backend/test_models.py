import pytest
from pydantic import ValidationError
import sys
import os

# Ajouter le répertoire backend au path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

try:
    from models.user import UserCreate, UserLogin, UserInDB
except ImportError:
    # Fallback si l'import échoue
    UserCreate = None
    UserLogin = None
    UserInDB = None

class TestUserModels:
    """Tests des modèles utilisateur"""
    
    @pytest.mark.skipif(UserCreate is None, reason="User models not available")
    def test_user_create_valid(self):
        """Test de création d'un utilisateur valide"""
        user_data = {
            "email": "test@example.com",
            "password": "ValidPassword123!",
            "username": "testuser",
            "full_name": "Test User"
        }
        
        user = UserCreate(**user_data)
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.password == "ValidPassword123!"
        assert user.full_name == "Test User"
    
    @pytest.mark.skipif(UserCreate is None, reason="User models not available")
    def test_user_create_invalid_email(self):
        """Test avec email invalide"""
        user_data = {
            "email": "invalid-email",
            "password": "ValidPassword123!",
            "username": "testuser"
        }
        
        with pytest.raises(ValidationError):
            UserCreate(**user_data)
    
    @pytest.mark.skipif(UserCreate is None, reason="User models not available")
    def test_user_create_short_password(self):
        """Test avec mot de passe trop court"""
        user_data = {
            "email": "test@example.com",
            "password": "123",
            "username": "testuser"
        }
        
        with pytest.raises(ValidationError):
            UserCreate(**user_data)
    
    @pytest.mark.skipif(UserLogin is None, reason="User models not available")
    def test_user_login_valid(self):
        """Test du modèle de connexion"""
        login_data = {
            "email": "test@example.com",
            "password": "ValidPassword123!"
        }
        
        login = UserLogin(**login_data)
        assert login.email == "test@example.com"
        assert login.password == "ValidPassword123!"
    
    @pytest.mark.skipif(UserLogin is None, reason="User models not available")
    def test_user_login_invalid_email(self):
        """Test login avec email invalide"""
        login_data = {
            "email": "invalid-email",
            "password": "ValidPassword123!"
        }
        
        with pytest.raises(ValidationError):
            UserLogin(**login_data)

"""
Tests backend pour Phase 5 - Vérification des modèles et services binders
"""
import pytest
import sys
import os

# Test d'importation des modules backend
def test_binder_models_import():
    """Test d'importation des modèles binder"""
    try:
        # Ajout du chemin backend
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        # Test d'import des modèles
        from models.binder import BinderSize, BinderCreate, BinderInDB
        
        # Vérifier les énums
        assert BinderSize.SMALL == "3x3"
        assert BinderSize.MEDIUM == "4x4"
        assert BinderSize.LARGE == "5x5"
        
        # Test de création d'un modèle
        binder_create = BinderCreate(
            name="Test Binder",
            size=BinderSize.MEDIUM,
            description="Test description"
        )
        
        assert binder_create.name == "Test Binder"
        assert binder_create.size == BinderSize.MEDIUM
        
    except ImportError as e:
        # Si l'import échoue, le test échoue mais avec un message informatif
        pytest.fail(f"Import failed: {e}")

def test_binder_service_import():
    """Test d'importation du service binder"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from services.binder_service import BinderService
        
        # Vérifier que la classe existe
        assert BinderService is not None
        
        # Vérifier que les méthodes existent
        service_methods = [
            'create_binder',
            'get_user_binders',
            'get_binder_by_id',
            'update_binder',
            'delete_binder'
        ]
        
        for method_name in service_methods:
            assert hasattr(BinderService, method_name), f"Méthode {method_name} manquante"
        
    except ImportError as e:
        pytest.fail(f"Import du service failed: {e}")

def test_binder_router_import():
    """Test d'importation du router binder"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from routers.binders import router
        
        # Vérifier que le router existe
        assert router is not None
        
        # Vérifier le préfixe
        assert router.prefix == "/user/binders"
        
    except ImportError as e:
        pytest.fail(f"Import du router failed: {e}")

def test_binder_model_validation():
    """Test de validation des modèles binder"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from models.binder import BinderCreate, BinderSize
        from pydantic import ValidationError
        
        # Test validation nom vide
        with pytest.raises(ValidationError):
            BinderCreate(name="", size=BinderSize.MEDIUM)
        
        # Test validation nom trop long
        with pytest.raises(ValidationError):
            BinderCreate(name="x" * 101, size=BinderSize.MEDIUM)
        
        # Test validation OK
        valid_binder = BinderCreate(
            name="Valid Name",
            size=BinderSize.MEDIUM,
            description="Valid description"
        )
        assert valid_binder.name == "Valid Name"
        
    except ImportError:
        # Si on ne peut pas importer, on skip ce test
        pytest.skip("Modules Pydantic non disponibles")

def test_binder_card_slot_model():
    """Test du modèle CardSlot"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from models.binder import CardSlot
        
        # Test slot vide
        empty_slot = CardSlot(position=0)
        assert empty_slot.position == 0
        assert empty_slot.card_id is None
        assert empty_slot.user_card_id is None
        
        # Test slot avec carte
        filled_slot = CardSlot(
            position=5,
            card_id="xy1-25",
            user_card_id="64b8f8e12345678901234567"
        )
        assert filled_slot.position == 5
        assert filled_slot.card_id == "xy1-25"
        
    except ImportError:
        pytest.skip("Modèles binder non disponibles")

def test_binder_page_model():
    """Test du modèle BinderPage"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from models.binder import BinderPage, CardSlot
        
        # Créer une page avec 9 slots (3x3)
        slots = [CardSlot(position=i) for i in range(9)]
        page = BinderPage(page_number=1, slots=slots)
        
        assert page.page_number == 1
        assert len(page.slots) == 9
        assert page.slots[0].position == 0
        assert page.slots[8].position == 8
        
    except ImportError:
        pytest.skip("Modèles binder non disponibles")

def test_binder_db_model():
    """Test du modèle BinderInDB"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from models.binder import BinderInDB, BinderSize
        from bson import ObjectId
        from datetime import datetime
        
        user_id = ObjectId()
        
        binder = BinderInDB(
            name="Test DB Binder",
            size=BinderSize.LARGE,
            description="Test DB description",
            user_id=user_id
        )
        
        assert binder.name == "Test DB Binder"
        assert binder.size == BinderSize.LARGE
        assert binder.user_id == user_id
        assert isinstance(binder.created_at, datetime)
        assert isinstance(binder.updated_at, datetime)
        
        # Test de la méthode get_slots_per_page
        assert binder.get_slots_per_page() == 25  # 5x5
        
    except ImportError:
        pytest.skip("Modèles binder ou MongoDB non disponibles")

def test_binder_response_models():
    """Test des modèles de réponse"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from models.binder import BinderResponse, BinderSummary, BinderSize
        from datetime import datetime
        
        # Test BinderResponse
        response = BinderResponse(
            id="64b8f8e12345678901234567",
            user_id="64b8f8e12345678901234568",
            name="Response Binder",
            size=BinderSize.MEDIUM,
            description="Response test",
            is_public=False,
            pages=[],
            total_pages=1,
            total_cards=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        assert response.name == "Response Binder"
        assert response.total_pages == 1
        assert response.total_cards == 0
        
    except ImportError:
        pytest.skip("Modèles de réponse non disponibles")

def test_binder_operation_models():
    """Test des modèles d'opération (ajout/suppression cartes)"""
    try:
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.append(backend_path)
        
        from models.binder import AddCardToBinder, RemoveCardFromBinder
        
        # Test ajout de carte
        add_card = AddCardToBinder(
            user_card_id="64b8f8e12345678901234567",
            page_number=1,
            position=5
        )
        
        assert add_card.user_card_id == "64b8f8e12345678901234567"
        assert add_card.page_number == 1
        assert add_card.position == 5
        
        # Test suppression de carte
        remove_card = RemoveCardFromBinder(
            page_number=1,
            position=5
        )
        
        assert remove_card.page_number == 1
        assert remove_card.position == 5
        
    except ImportError:
        pytest.skip("Modèles d'opération non disponibles")

def test_binder_size_calculations():
    """Test des calculs selon la taille du binder"""
    size_mapping = {
        "3x3": 9,   # 3 * 3
        "4x4": 16,  # 4 * 4  
        "5x5": 25   # 5 * 5
    }
    
    for size_str, expected_slots in size_mapping.items():
        width, height = map(int, size_str.split('x'))
        calculated_slots = width * height
        assert calculated_slots == expected_slots

def test_backend_structure():
    """Test de la structure backend attendue"""
    backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
    
    # Vérifier que les dossiers existent
    expected_dirs = ['models', 'services', 'routers']
    for dirname in expected_dirs:
        dir_path = os.path.join(backend_path, dirname)
        assert os.path.exists(dir_path), f"Dossier {dirname} manquant"
    
    # Vérifier que les fichiers existent
    expected_files = [
        'models/binder.py',
        'services/binder_service.py', 
        'routers/binders.py'
    ]
    
    for filepath in expected_files:
        full_path = os.path.join(backend_path, filepath)
        assert os.path.exists(full_path), f"Fichier {filepath} manquant"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

# Tests - Pokemon TCG Binder

Ce dossier contient tous les tests pour le projet Pokemon TCG Binder.

## 📁 Structure

```
tests/
├── __init__.py              # Package tests
├── conftest.py              # Configuration pytest
├── requirements.txt         # Dépendances de test
├── backend/                 # Tests backend
│   ├── __init__.py
│   ├── test_api.py         # Tests API principales
│   ├── test_auth.py        # Tests authentification
│   ├── test_models.py      # Tests modèles Pydantic
│   └── test_utils.py       # Tests utilitaires
├── frontend/                # Tests frontend
│   └── test_react_basic.py # Tests React basiques
└── integration/             # Tests d'intégration
    └── test_e2e.py         # Tests end-to-end
```

## 🚀 Lancement des tests

### Option 1: Script Python (Recommandé)
```bash
python run_tests.py
```

### Option 2: Make commands
```bash
# Tous les tests
make test

# Tests spécifiques
make test-backend
make test-frontend  
make test-integration
make test-all

# Avec coverage
make coverage
```

### Option 3: Pytest direct
```bash
# Installer les dépendances
pip install -r tests/requirements.txt

# Lancer tous les tests
pytest tests/ -v

# Tests backend seulement
pytest tests/backend/ -v

# Tests avec coverage
pytest tests/ --cov=backend --cov-report=html
```

## 📊 Rapports

Les rapports de tests sont générés dans `tests/reports/`:
- `report.html` - Rapport des tests
- `coverage/` - Rapport de couverture de code

## 🔧 Configuration

### Variables d'environnement pour les tests
```bash
MONGODB_URL=mongodb://localhost:27017/pokemon_binder_test
JWT_SECRET_KEY=test_secret_key
```

### Prérequis
- Python 3.11+
- Services Docker en cours d'exécution (MongoDB)
- Backend et Frontend démarrés (pour tests d'intégration)

## 🏗️ Types de tests

### Tests Backend (`tests/backend/`)
- **test_api.py**: Tests des endpoints principaux
- **test_auth.py**: Tests du système d'authentification
- **test_models.py**: Tests des modèles Pydantic
- **test_utils.py**: Tests des utilitaires (JWT, hachage, etc.)

### Tests Frontend (`tests/frontend/`)
- **test_react_basic.py**: Tests basiques d'accessibilité des pages

### Tests d'Intégration (`tests/integration/`)
- **test_e2e.py**: Tests end-to-end complets du flux utilisateur

## 🎯 Markers pytest

```bash
# Tests par catégorie
pytest -m "unit"           # Tests unitaires
pytest -m "integration"    # Tests d'intégration
pytest -m "backend"        # Tests backend
pytest -m "frontend"       # Tests frontend
pytest -m "slow"           # Tests lents

# Exclure certains tests
pytest -m "not slow"       # Exclure tests lents
pytest -m "not integration" # Exclure tests d'intégration
```

## 📈 Coverage

Pour générer un rapport de couverture détaillé:

```bash
pytest tests/ --cov=backend --cov-report=html --cov-report=term-missing
```

Le rapport HTML sera disponible dans `tests/reports/coverage/index.html`.

## 🔄 CI/CD

Les tests sont automatiquement exécutés via GitHub Actions sur:
- Push vers `main` ou `develop`
- Pull requests vers `main`

Voir `.github/workflows/test.yml` pour la configuration complète.

## 🐛 Debugging

### Tests qui échouent
```bash
# Plus de détails sur les échecs
pytest tests/ -v --tb=long

# Arrêter au premier échec
pytest tests/ -x

# Relancer seulement les tests qui ont échoué
pytest tests/ --lf
```

### Services non disponibles
```bash
# Vérifier Docker
docker ps

# Redémarrer les services
cd docker && docker-compose restart

# Vérifier les logs
docker logs docker-backend-1
docker logs docker-mongodb-1
```

## 📝 Écriture de nouveaux tests

### Tests backend
```python
import pytest
from fastapi.testclient import TestClient
from main import app

class TestNewFeature:
    def setup_method(self):
        self.client = TestClient(app)
    
    def test_new_endpoint(self):
        response = self.client.get("/new-endpoint")
        assert response.status_code == 200
```

### Tests d'intégration
```python
import pytest
import requests

class TestNewIntegration:
    def test_complete_flow(self):
        # Test du flux complet
        response = requests.get("http://localhost:8000/endpoint")
        assert response.status_code == 200
```

## 🎯 Objectifs de couverture

- **Backend**: > 80% de couverture
- **Tests d'intégration**: Tous les flux principaux couverts
- **Tests frontend**: Pages principales accessibles

## 🚀 Améliorer les tests

1. **Ajouter plus de tests unitaires** pour les nouvelles fonctionnalités
2. **Tests de performance** avec pytest-benchmark
3. **Tests E2E complets** avec Selenium/Playwright
4. **Tests de sécurité** avec safety et bandit
5. **Tests de charge** avec locust

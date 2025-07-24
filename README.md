# 🃏 Pokémon TCG Binder

Application web pour gérer sa collection de cartes Pokémon TCG avec système de classeurs virtuels.

## 🚀 Technologies

- **Frontend**: React 18
- **Backend**: FastAPI + Uvicorn
- **Base de données**: MongoDB
- **Containerisation**: Docker + Docker Compose
- **Outils**: ESLint, Prettier, Tests unitaires

## 📦 Installation et lancement

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Démarrage rapide

1. **Cloner le projet**
```bash
git clone https://github.com/BastienLopez/Pokemon_binder.git
cd Pokemon_binder
```

2. **Lancer avec Docker** (recommandé)

**Sur Windows:**
```bash
start.bat
```

**Sur Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Ou manuellement:**
```bash
cd docker
docker-compose up --build
```

3. **Accéder à l'application**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API Backend**: http://localhost:8000
- 📚 **Documentation API**: http://localhost:8000/docs
- 🗄️ **MongoDB**: localhost:27017

## 🏗️ Structure du projet

```
Pokemon_binder/
├── frontend/          # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/           # API FastAPI
│   ├── routers/
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── docker/            # Configuration Docker
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── start.bat          # Script Windows
├── start.sh           # Script Linux/Mac
└── ROADMAP.md         # Plan de développement
```

## 🧪 Développement

### Frontend (React)
```bash
cd frontend
npm install
npm start              # http://localhost:3000
npm test               # Tests unitaires
npm run lint           # ESLint
npm run format         # Prettier
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Tests
pytest
```

## 📋 État du développement

### ✅ Phase 1 - Infrastructure (TERMINÉE)
- [x] Configuration Docker
- [x] Frontend React avec routing
- [x] Backend FastAPI avec MongoDB
- [x] Tests unitaires de base
- [x] Outils de développement

### 🔄 Prochaines phases
- **Phase 2**: Authentification utilisateur
- **Phase 3**: Listing des cartes Pokémon TCG
- **Phase 4**: Gestion de la collection personnelle
- **Phase 5**: Système de classeurs virtuels

Voir [ROADMAP.md](ROADMAP.md) pour le détail complet.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📦 Fonctionnalités principales
- 🔍 **Recherche de cartes Pokémon TCG** (via base officielle)
- 🧾 **Mes cartes** : Ajout, modification, suppression des cartes que vous possédez
- 📘 **Mes binders** : Créez des classeurs personnalisés 3x3 ou 4x4 pour organiser vos cartes
- 🎴 **Affichage visuel** en grilles interactives (zoom, lien Cardmarket, prix, artiste…)
- 🔁 **Filtres avancés** : par nom, par prix ou organisation manuelle
- 📊 **Statistiques de collection** et **wishlist**
- 🌍 **Partage public** de binders et export de collection

---

## ⚙️ Technologies utilisées
### Frontend
- HTML, CSS, JavaScript
- ⚛️ [React.js](https://react.dev/) (UI dynamique)
- [React Router](https://reactrouter.com/) (navigation)
- [Axios](https://axios-http.com/) (requêtes HTTP)

### Backend
- 🐍 Python
- [FastAPI](https://fastapi.tiangolo.com/) ou [Flask](https://flask.palletsprojects.com/)
- [PyMongo](https://pymongo.readthedocs.io/) (connexion MongoDB)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Tests
- ✅ [Pytest](https://docs.pytest.org/)
- ✅ [Jest](https://jestjs.io/) (tests React)
- 🧪 GitHub Actions (CI/CD)

---

## 🧰 Installation du projet (en local)
### 1. Clone du dépôt

```bash
git clone https://github.com/votre-utilisateur/pokemon-binder.git
cd pokemon-binder
```

### 2. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Remplir les infos MongoDB dans .env
uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Lancer les tests
### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm run test
```

---

## ✅ Checklist de développement
| Fonctionnalité                        | Statut |
| ------------------------------------- | ------ |
| Authentification utilisateur          | ☐      |
| Listing des cartes par extension      | ☐      |
| Gestion "Mes cartes" (CRUD)           | ☐      |
| Création de binders (3x3 / 4x4)       | ☐      |
| Ajout/suppression de cartes au binder | ☐      |
| Affichage visuel + zoom + prix        | ☐      |
| Filtres (nom, prix, personnalisé)     | ☐      |
| Wishlist, stats, partage              | ☐      |
| Tests unitaires complets              | ☐      |
| CI/CD GitHub Actions                  | ☐      |
| Déploiement Docker + production       | ☐      |

---

## 🗺️ Feuille de route
📌 Voir le fichier [`ROADMAP.md`](./ROADMAP.md) pour consulter toutes les phases de développement.

---

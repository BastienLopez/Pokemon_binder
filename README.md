# 🧠 Pokémon Binder – Web App de gestion de collection Pokémon TCG

Bienvenue dans **Pokémon Binder**, une application Web qui permet aux collectionneurs de cartes Pokémon TCG de gérer, organiser et visualiser leur collection comme dans un vrai classeur !

---

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

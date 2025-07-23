# 🗂️ FICHE DE ROUTE – Projet Web « Pokémon Binder »

---

## 🔰 Phase 0 – Initialisation & Préparation

### 🎯 Objectif :

Préparer le projet et son environnement pour un développement clair, maintenable et testable.

### ✅ Tâches :

* [ ] Initialiser le projet en monorepo ou dossier `/frontend`, `/backend`
* [ ] Configurer le linter + prettier
* [ ] Ajouter les outils de test (Pytest)
* [ ] Ajouter un fichier `.env` et `.env.exemple` (exemple inclus)

### 🔬 Tests :

* [ ] Vérifier que les outils de lint/test sont exécutables (`pytest`)
* [ ] CI/CD de base : GitHub Actions qui lance les tests à chaque PR avec `.github/test.yml`

---

## 🔧 Phase 1 – Architecture du projet

### 🎯 Objectif :

Structurer le backend, le frontend, la base de données, et les modèles de données.

### ✅ Tâches :

#### Backend (Python - FastAPI ou Flask)

* [ ] Créer l'API de base avec routes REST :
  * `/auth`
  * `/cards`
  * `/user-cards`
  * `/binders`

* [ ] Définir les modèles MongoDB :
  * User
  * UserCards
  * Binder

* [ ] Ajouter MongoEngine ou PyMongo
* [ ] Créer la documentation OpenAPI automatique (FastAPI) ou Swagger (Flask + ext.)


#### Frontend (React.js recommandé)
* [ ] Créer les pages :
  * `HomePage`, `LoginPage`, `RegisterPage`
  * `CardListPage`, `MyCardsPage`, `BindersPage`, `BinderDetailPage`

* [ ] Configurer React Router

#### Base de données
* [ ] Héberger MongoDB local ou sur Atlas (connexion sécurisée)

### 🔬 Tests :
* [ ] Test de connexion API avec requêtes simples (`GET /cards`)
* [ ] Test unitaire de chaque modèle (structure, schémas valides)

---

## 🔐 Phase 2 – Authentification
### 🎯 Objectif :
Permettre à un utilisateur de s’inscrire, se connecter et sécuriser ses données.

### ✅ Tâches :
* [ ] API :
  * `/register` : création d’un compte
  * `/login` : récupération d’un token (JWT)
  * Middleware `auth_required` pour protéger les routes

* [ ] Front :
  * Formulaires de login / inscription
  * Gestion du token JWT en localStorage

### 🔬 Tests :
* [ ] Tests unitaires backend :
  * Création d’un user
  * Connexion correcte / échec

* [ ] Tests frontend :
  * Form validation
  * Stockage local du token

* [ ] Tests d’intégration :
  * Navigation vers `Mes cartes` inaccessible sans connexion

---

## 📚 Phase 3 – Listing public des cartes par extension
### 🎯 Objectif :
Afficher toutes les cartes disponibles par extension (via pkmnbinder.com ou base custom).

### ✅ Tâches :
* [ ] Intégrer la base de données ou API ([https://pkmnbinder.com](https://pkmnbinder.com) ou JSON local)
* [ ] Affichage dans un layout responsive
* [ ] Filtrage par extension, nom, type, rareté

### 🔬 Tests :
* [ ] API : endpoint `/cards?extension=X`
* [ ] UI : filtre fonctionne correctement
* [ ] Test snapshot du composant carte

---

## 🃏 Phase 4 – Mes Cartes (User Collection)
### 🎯 Objectif :
Permettre à l’utilisateur de gérer sa propre collection.

### ✅ Tâches :

* [ ] Backend :
  * `/user-cards` CRUD

* [ ] Frontend :
  * Formulaire de recherche/ajout (depuis les cartes existantes)
  * Modifier/supprimer
  * Affichage de la liste personnelle

* [ ] Stocker : quantités, état, version, notes perso, tags

### 🔬 Tests :
* [ ] Test unitaire de la route d’ajout / modification
* [ ] Test frontend : ajouter une carte, modifier, supprimer
* [ ] Test d’affichage conditionnel (cartes de l’utilisateur seulement)

---

## 📘 Phase 5 – Création & gestion des binders
### 🎯 Objectif :
Permettre à l’utilisateur de créer des binders (3x3, 4x4) et y placer ses cartes.

### ✅ Tâches :

* [ ] Backend :
  * `/binders` CRUD (lié à l’utilisateur)
  * `POST /binders/:id/cards` : ajouter une carte

* [ ] Frontend :
  * Création d’un binder (nom, taille)
  * Ajout/suppression de cartes depuis "Mes cartes"
  * Grille dynamique (layout 3x3 ou 4x4)
  * Drag & drop en mode "personnalisé"

### 🔬 Tests :
* [ ] Ajout/suppression d’une carte au binder
* [ ] Affichage correct des grilles selon taille
* [ ] Test unitaire du backend binder + relation user

---

## 🔍 Phase 6 – Affichage enrichi des cartes du binder
### 🎯 Objectif :
Afficher plus d’infos sur les cartes (zoom, lien, artiste, prix...).

### ✅ Tâches :

* [ ] Front :
  * Composant `CardModal` : affichage en grand
  * Infos complémentaires : nom, artiste, prix
  * Lien Cardmarket (via ID)

* [ ] API :
  * Endpoint `/cardmarket/:card_id` → récup prix (si scrape/API possible)

### 🔬 Tests :
* [ ] Tests UI : modal s’ouvre et contient les bonnes données
* [ ] Lien externe fonctionne
* [ ] Test unitaire du composant modal

---

## 🧰 Phase 7 – Filtres du binder
### 🎯 Objectif :

Ajouter 3 types de filtres :
* Par nom
* Par prix
* Par position manuelle (drag & drop)

### ✅ Tâches :
* [ ] UI :
  * Tri alphabétique
  * Tri par prix (si dispo)
  * Mode personnalisé → drag & drop avec sauvegarde de la position

### 🔬 Tests :
* [ ] Filtrage fonctionnel
* [ ] Position des cartes sauvegardée correctement (backend)

---

## 🧠 Phase 8 – Fonctions avancées (wishlist, stats, partage)
### 🎯 Objectif :
Ajouter des fonctionnalités bonus utiles pour le collectionneur.

### ✅ Tâches :
* [ ] Ajouter "wishlist" : carte à acquérir
* [ ] Statistiques : nb de cartes, valeur totale, complétion par extension
* [ ] Lien de partage public d’un binder
* [ ] Export PDF ou JSON

### 🔬 Tests :
* [ ] Génération de stats correcte
* [ ] Accès public à un binder fonctionne
* [ ] Export génère les bonnes données

---

## 🧪 Phase 9 – Tests globaux & CI/CD
### 🎯 Objectif :
Finaliser le projet avec des tests automatisés, CI et couverture complète.

### ✅ Tâches :
* [ ] Intégrer tous les tests (backend et frontend)

* [ ] Pipeline GitHub Actions :
  * Lint
  * Test backend
  * Test frontend
  * Test d’intégration (ex: Playwright ou Cypress)

### 🔬 Tests :
* [ ] Couverture de test > 90%
* [ ] Tests de navigation utilisateur
* [ ] Tests de sécurité (routes protégées)

---

## 🚀 Phase 10 – Déploiement
### 🎯 Objectif :
Mettre l’application en ligne pour la tester ou l’utiliser.

### ✅ Tâches :
* [ ] Dockeriser le backend et le frontend

* [ ] Déployer sur :
  * Frontend : Vercel / Netlify
  * Backend : Render / Railway / Heroku
  * MongoDB : MongoDB Atlas

* [ ] Configuration des variables d’environnement

---

## ✅ Checklist de suivi globale
| Étape                           | Statut    |
| ------------------------------- | --------- |
| Initialisation projet           | ☐ à faire |
| Authentification                | ☐ à faire |
| Listing cartes publiques        | ☐ à faire |
| CRUD "Mes cartes"               | ☐ à faire |
| CRUD "Mes binders"              | ☐ à faire |
| Affichage visuel binder         | ☐ à faire |
| Infos / zoom / lien carte       | ☐ à faire |
| Filtres + organisation manuelle | ☐ à faire |
| Wishlist / stats / partage      | ☐ à faire |
| Tests unitaires / intégration   | ☐ à faire |
| CI/CD                           | ☐ à faire |
| Docker + déploiement            | ☐ à faire |

# 🗂️ Plan### ✅ Tâches :
* [x] Configurer l'environnement :
  * Frontend : React ✅
  * Backend : FastAPI + Uvicorn ✅
  * Base de données : MongoDB (via Docker) ✅

* [x] Créer un script de lancement local (`docker-compose`) ✅

* [x] Configurer les outils de dev :
  * Linter, Prettier ✅
  * Tests unitaires initiaux ✅pement – Pokémon TCG Binder

---

## 🔰 Phase 1 — Initialisation du projet (infrastructure)

### 🎯 Objectif :

Mettre en place les bases techniques du projet côté front, back et base de données.

### ✅ Tâches :
* [ ] Configurer l’environnement :
  * Frontend : React
  * Backend : FastAPI + Uvicorn
  * Base de données : MongoDB (via Docker)

* [ ] Créer un script de lancement local (`docker-compose`)

* [ ] Configurer les outils de dev :
  * Linter, Prettier
  * Tests unitaires initiaux

---

## 🔐 Phase 2 — Authentification utilisateur
### 🎯 Objectif :
Créer le système d’inscription / connexion avec token d’authentification.

### ✅ Tâches :
* [ ] Back :
  * [ ] Créer modèle utilisateur MongoDB
  * [ ] Implémenter les routes : `signup`, `login`, `me`
  * [ ] Authentification JWT

* [ ] Front :
  * [ ] Création de la page site vitrine : site vitrine d'explication du projet avec bouton connection/inscription
  * [ ] Création de pages : **Connexion**, **Inscription**
  * [ ] Affichage conditionnel dans le header
  * [ ] Stocker le token (localStorage ou cookie sécurisé)

* [ ] Test : vérifier accès restreint aux pages protégées

---

## 📦 Phase 3 — Listing des cartes (déjà existant)
### 🎯 Objectif :
Réutiliser le listing des cartes Pokémon TCG par extension.

### ✅ Tâches :
* [ ] Intégrer ou connecter le module de listing
* [ ] Créer une page `/cartes`
* [ ] Ajout filtres basiques : extension, rareté, nom
* [ ] (Facultatif) Affichage pagination / infini scroll

---

## 📂 Phase 4 — “Mes cartes” (collection utilisateur)
### 🎯 Objectif :
Permettre à l’utilisateur de gérer ses cartes.

### ✅ Tâches :

* [ ] Back :
  * [ ] Modèle `UserCard` lié à l’`UserId` (quantité, état, version…)
  * [ ] Routes API :
    * `GET /user/cards`
    * `POST /user/cards`
    * `PATCH /user/cards/:id`
    * `DELETE /user/cards/:id`

* [ ] Front :
  * [ ] Page `/mes-cartes`
  * [ ] Affichage liste des cartes possédées
  * [ ] Formulaire d’ajout depuis base globale
  * [ ] Boutons modifier / supprimer

---

## 📘 Phase 5 — Gestion des binders
### 🎯 Objectif :
Créer, modifier et visualiser ses classeurs.

### ✅ Tâches :
* [ ] Back :
  * [ ] Modèle `Binder` (nom, taille, pages, userId, slots)
  * [ ] Routes API :
    * `GET /binders`
    * `POST /binders`
    * `PATCH /binders/:id`
    * `DELETE /binders/:id`

* [ ] Front :
  * [ ] Page `/mon-binder`
  * [ ] Création d’un binder (choix 3x3 ou 4x4)
  * [ ] Listing des binders
  * [ ] Affichage grid dynamique des cartes

* [ ] Modifications : 
  * [ ] Ajout de cartes depuis “Mes cartes”
  * [ ] Placement **manuel ou automatique** dans le grid
  * [ ] Modification ou suppression d’une carte du classeur
---

## 🧩 Phase 6 — Interaction avec le binder
### 🎯 Objectif :
Pouvoir cliquer sur une carte et accéder à ses infos.

### ✅ Tâches :
* [ ] Front :
  * [ ] Pop-up au clic sur une carte :
    * Image agrandie
    * Nom
    * Artiste
    * Lien Cardmarket
    * Prix (données stockées ou appel externe)
  * [ ] Lien direct vers cardmarket.com

---

## 🎛️ Phase 7 — Filtres dans les binders
### 🎯 Objectif :
Organiser les cartes affichées selon différents critères.

### ✅ Tâches :

* [ ] Filtre par :
  * [ ] Nom
  * [ ] Prix croissant / décroissant
  * [ ] Placement personnalisé (drag & drop dans la grille)

* [ ] Stocker l’ordre de placement si personnalisé

---

## 🌟 Phase 8 — Fonctions avancées (bonus après MVP)
### 🎯 Objectif :
Améliorer l'expérience utilisateur et ajouter de la valeur.

### ✅ Suggestions de modules :
* [ ] 📜 **Wishlist** : système de cartes souhaitées

* [ ] 📊 **Statistiques de collection** :
  * % par extension
  * Nombre total de cartes
  * Valeur totale estimée

* [ ] 🤝 **Partage de binder** :
  * Lien public (lecture seule)

* [ ] 🛒 **Intégration Cardmarket API** pour afficher :
  * Prix en temps réel
  * Lien direct d’achat

---

## 🚀 Phase 9 — Mise en production
### 🎯 Objectif :
Déployer une première version stable.

### ✅ Tâches :
* [ ] Créer un frontend build React
* [ ] Déployer backend (Render, Railway, Fly.io, etc.)
* [ ] Déployer MongoDB (MongoDB Atlas)
* [ ] Lier nom de domaine (ex: `pokemonbinder.app`)
* [ ] Ajouter fichier `README.md` et documentation utilisateur

---

## 🧪 Phase 10 — Tests & Qualité
### 🎯 Objectif :
Valider la stabilité et la robustesse de l'application.

### ✅ Tâches :
* [ ] Tests unitaires backend (`pytest`)
* [ ] Tests frontend (`React Testing Library`)
* [ ] Tests E2E (optionnel avec Playwright / Cypress)
* [ ] CI/CD : GitHub Actions pour lancer les tests automatiquement
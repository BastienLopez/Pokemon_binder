# 🗂️ Plan de développement – Pokémon TCG Bi## 📦 Phase 3 — Listing des cartes ✅ **TERMINÉ**
### 🎯 Objectif :
Utiliser le listing des cartes Pokémon TCG par extension.

### ✅ Tâches :
* [x] Créer une page `/cartes` cf \listing.png ✅
* [x] Recuperer les infos cartes, extensions, images cartes etc via l'API https://tcgdex.dev/ ✅
* [x] Page  `/cartes`: ✅
  - Select l'extension ✅
  - Select Binder Page Size 3x3 ou 4x4 (scroll infi jusqu'a fin de toutes les cartes de l'extension) ✅
  - bouton generer bider qui call api de l'extension choisi et affiche tt les cartes voulu en dessous comme sur l'img ✅
* [x] Intégrer ou connecter le module de listing ✅
* [x] Ajout filtres basiques : extension, rareté, nom ✅
* [x] (Facultatif) Affichage pagination / infini scroll - (Implémenté sous forme de filtres en temps réel) ✅
* [x] Recuperer les infos cartes, extensions, images cartes etc via https://tcgdx.dev/ ✅
* [x] Ajout de la page dans le menu du dashboard utilisateur ✅
* [x] Création du service TCGdexService pour la gestion des API ✅
* [x] Interface responsive et stylisée ✅## 🔰 Phase 1 — Initialisation du projet (infrastructure)

### 🎯 Objectif :

Mettre en place les bases techniques du projet côté front, back et base de données.

### ✅ Tâches :
* [x] Configurer l'environnement :
  * Frontend : React ✅
  * Backend : FastAPI + Uvicorn ✅
  * Base de données : MongoDB (via Docker) ✅

* [x] Créer un script de lancement local (`docker-compose`) ✅

* [x] Configurer les outils de dev :
  * Linter, Prettier ✅
  * Tests unitaires initiaux ✅

---

## 🔐 Phase 2 — Authentification utilisateur
### 🎯 Objectif :
Créer le système d'inscription / connexion avec token d'authentification.

### ✅ Tâches :
* [x] Back :
  * [x] Créer modèle utilisateur MongoDB ✅
  * [x] Implémenter les routes : `signup`, `login`, `me` ✅
  * [x] Authentification JWT ✅

* [x] Front :
  * [x] Création de la page site vitrine : site vitrine d'explication du projet avec bouton connection/inscription ✅
  * [x] Création de pages : **Connexion**, **Inscription** ✅
  * [x] Affichage conditionnel dans le header ✅
  * [x] Stocker le token (localStorage ou cookie sécurisé) ✅

* [x] Test : vérifier accès restreint aux pages protégées ✅

---

## 📦 Phase 3 — Listing des cartes 
### 🎯 Objectif :
Utiliser le listing des cartes Pokémon TCG par extension.

### ✅ Tâches :
* [x] Créer une page `/cartes` cf \listing.png 
* [x] Recuperer les infos cartes, extensions, images cartes etc via l'API https://tcgdex.dev/
* [x] Page  `/cartes`: 
  - Select l'extension
  - Select Binder Page Size 3x3 ou 4x4 ou 5x5 (scroll infi jusqu'a fin de toutes les cartes de l'extension)
  - bouton generer bider qui call api de l'extension choisi et affiche tt les cartes voulu en dessous comme sur l'img
* [x] Intégrer ou connecter le module de listing
* [x] Ajout filtres basiques : extension, rareté, nom
* [x] (Facultatif) Affichage pagination / infini scroll
* [x] Recuperer les infos cartes, extensions, images cartes etc via https://tcgdex.dev/

* [ ] Add un bouton en bas a droite du nom de chaque carte qui va permettre de l'ajouter a nos cartes (sur la page 'mes cartes', donc select l'id de la carte a ajouté, l'add pour qu'elle soit lié a la partie 'cartes' de l'user connecté (il faut le stocker en bdd))


## 📂 Phase 4 — "Mes cartes" (collection utilisateur) 
### 🎯 Objectif :
Permettre à l'utilisateur de gérer ses cartes personnelles depuis la page `/mes-cartes` (http://localhost:3000/user?id=6881f8ef09c3053f34c8cf8f).

### ✅ Tâches :

* [x] Back :
  * [x] Modèle `UserCard` lié à l'`UserId` (_id) (quantité, état, version…) ✅
  * [x] Routes API : ✅
    * `GET /user/cards` — Récupérer toutes les cartes de l'utilisateur ✅
    * `POST /user/cards` — Ajouter une carte à la collection de l'utilisateur ✅
    * `PATCH /user/cards/:id` — Modifier les infos d'une carte possédée (quantité, état, version…) ✅
    * `DELETE /user/cards/:id` — Supprimer une carte de la collection ✅

* [x] Front :
  * [x] Page `/mes-cartes` accessible via le menu utilisateur ✅
  * [x] Affichage de la liste des cartes possédées (infos carte, quantité, état, version…) ✅
  * [x] Bouton "Ajouter" (depuis la page listing ou formulaire dédié) ✅
  * [x] Formulaire d'ajout d'une carte depuis la base globale (recherche, sélection, quantité, état…) ✅
  * [x] Boutons "modifier" et "supprimer" sur chaque carte de la collection ✅
  * [x] Synchronisation en temps réel après ajout/modification/suppression ✅
  * [x] **Bonus** : Notifications élégantes au lieu d'alertes ✅
  * [x] **Bonus** : Modales de confirmation professionnelles ✅
  * [x] **Bonus** : Images haute qualité via API TCGdx ✅
  * [ ] Filtre : 
        - nom
        - serie / extensions
        - taille de binder 3x3 4x4 ou 5x5
        - prix

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
  * [ ] Création d'un binder (choix 3x3 ou 4x4)
  * [ ] Listing des binders
  * [ ] Affichage grid dynamique des cartes

* [ ] Modifications : 
  * [ ] Ajout de cartes depuis "Mes cartes"
  * [ ] Placement **manuel ou automatique** dans le grid
  * [ ] Modification ou suppression d'une carte du classeur

---

## 🧩 Phase 6 — Interaction avec le binder et les cartes page listing
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

* [ ] Stocker l'ordre de placement si personnalisé

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
  * Lien direct d'achat

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

## 🧪 Phase 10 — Tests & Qualité ✅ **TERMINÉ**
### 🎯 Objectif :
Valider la stabilité et la robustesse de l'application.

### ✅ Tâches :
* [x] Tests unitaires backend (`pytest`) ✅
* [x] Tests frontend (`React Testing Library`) ✅ 
* [x] Tests E2E (optionnel avec Playwright / Cypress) ✅
* [x] CI/CD : GitHub Actions pour lancer les tests automatiquement ✅
* [x] **Objectif 100% de réussite des tests atteint** : 29 tests passent, 0 échecs, 0 skippés ✅

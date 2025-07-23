### **Principales routes API (FastAPI)**

| Méthode | Route              | Fonction                            |
| ------- | ------------------ | ----------------------------------- |
| POST    | `/auth/register`   | Inscription utilisateur             |
| POST    | `/auth/login`      | Connexion + retour du token JWT     |
| GET     | `/cards`           | Liste des cartes par extension      |
| GET     | `/user/cards`      | Cartes possédées par l’utilisateur  |
| POST    | `/user/cards`      | Ajouter une carte à "mes cartes"    |
| PUT     | `/user/cards/{id}` | Modifier une carte perso            |
| DELETE  | `/user/cards/{id}` | Supprimer une carte perso           |
| GET     | `/binders`         | Liste des binders                   |
| POST    | `/binders`         | Créer un nouveau binder             |
| GET     | `/binders/{id}`    | Voir les cartes du binder           |
| PUT     | `/binders/{id}`    | Modifier un binder (positions, etc) |
| DELETE  | `/binders/{id}`    | Supprimer un binder                 |


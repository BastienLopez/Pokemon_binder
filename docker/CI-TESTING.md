# 🧪 Test CI/CD en Local

Ce dossier contient des outils pour tester le build CI de GitHub Pages **avant** de pusher, évitant ainsi les allers-retours inutiles.

## 🎯 Pourquoi ?

Le build CI GitHub Actions a des règles strictes :
- `CI=true` : traite les warnings ESLint comme des erreurs
- Build de production optimisé
- Variables d'environnement spécifiques

Ces scripts Docker simulent exactement cet environnement.

## 🚀 Utilisation Rapide

### Option 1 : Test du build uniquement (recommandé)
```powershell
cd docker
.\test-build-only.ps1
```

**Résultat** :
- ✅ Build réussi → vous pouvez pusher
- ❌ Build échoué → corrigez les erreurs avant de pusher

### Option 2 : Test du build + serveur local
```powershell
cd docker
.\test-ci.ps1
```

Ensuite visitez http://localhost:3001 pour voir le site comme il sera sur GitHub Pages.

## 🛠️ Utilisation Manuelle

### Build CI uniquement
```powershell
cd docker
docker compose -f docker-compose.ci.yml build frontend-ci
```

### Build + Lancer le serveur
```powershell
cd docker
docker compose -f docker-compose.ci.yml up frontend-ci
```

Le site sera disponible sur http://localhost:3001

### Arrêter et nettoyer
```powershell
docker compose -f docker-compose.ci.yml down
```

## 📋 Différences avec le docker-compose.yml normal

| Fichier | Usage | Build | Mode |
|---------|-------|-------|------|
| `docker-compose.yml` | Développement | Non | Dev avec hot-reload |
| `docker-compose.ci.yml` | Test CI | Oui | Production (comme GitHub) |

## 🔍 Ce qui est testé

Le `Dockerfile.frontend.ci` simule exactement le processus GitHub Actions :

1. ✅ `npm ci` (installation propre comme CI)
2. ✅ `CI=true` (warnings = errors)
3. ✅ `npm run build` (build de production)
4. ✅ `PUBLIC_URL=/Pokemon_binder` (chemin GitHub Pages)
5. ✅ `REACT_APP_STATIC_DATA=1` (mode statique)

## 💡 Workflow Recommandé

```powershell
# 1. Faire vos modifications
code .

# 2. Tester le build CI
cd docker
.\test-build-only.ps1

# 3. Si ✅ → commit et push
git add .
git commit -m "fix: votre message"
git push

# 4. Si ❌ → corriger et retester
# ... corrections ...
.\test-build-only.ps1
```

## 🐛 Debugging

Si le build échoue, les erreurs s'afficheront exactement comme dans GitHub Actions :

```
[eslint] 
src/pages/Cards.js
  Line 105:6:  React Hook has a missing dependency...
```

Corrigez le code et relancez `.\test-build-only.ps1`.

## 📦 Services Disponibles

### Frontend CI uniquement
```powershell
docker compose -f docker-compose.ci.yml up frontend-ci
```
Port: 3001

### Stack complète (frontend + backend + MongoDB)
```powershell
docker compose -f docker-compose.ci.yml up
```
- Frontend: http://localhost:3001
- Backend: http://localhost:8000
- MongoDB: localhost:27017

## 🎉 Avantages

- ✅ Pas de surprises lors du push
- ✅ Test exact de l'environnement CI
- ✅ Gain de temps (pas d'attente GitHub Actions)
- ✅ Tests locaux illimités

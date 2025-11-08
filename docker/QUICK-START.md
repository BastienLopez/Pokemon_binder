# 🧪 Guide Rapide - Test CI Local

## ✅ Le build CI vient de réussir !

Votre code est prêt à être pushé sur GitHub sans risque d'échec CI.

## 🚀 Commandes Rapides

### Tester le build CI (recommandé avant chaque push)
```powershell
cd docker
powershell -ExecutionPolicy Bypass -File test-build-only.ps1
```

**Si le build réussit** ✅ → Vous pouvez pusher  
**Si le build échoue** ❌ → Corrigez les erreurs et retestez

### Tester le site en local après le build
```powershell
cd docker
docker compose -f docker-compose.ci.yml up frontend-ci
```

Visitez : http://localhost:3001

### Arrêter le serveur
```
Ctrl+C
docker compose -f docker-compose.ci.yml down
```

## 📋 Ce qui est testé

Le build Docker CI teste exactement ce que GitHub Actions va tester :

- ✅ `CI=true` : warnings ESLint = erreurs
- ✅ Build de production optimisé
- ✅ Toutes les dépendances installées proprement (`npm ci`)
- ✅ Variables d'environnement GitHub Pages

## 💡 Workflow Quotidien

```powershell
# 1. Faites vos modifications
code .

# 2. Testez le build CI
cd docker
powershell -ExecutionPolicy Bypass -File test-build-only.ps1

# 3. Si succès → commit et push
git add .
git commit -m "votre message"
git push

# 4. GitHub Actions va réussir car votre build local a réussi !
```

## 🎯 Avantages

- ⚡ Pas d'attente de GitHub Actions (1-2 minutes gagnées par test)
- ✅ Zéro surprise lors du push
- 🔄 Tests locaux illimités
- 🎯 Environnement identique à la CI

## 📦 Fichiers Créés

- `Dockerfile.frontend.ci` : Simule exactement le build GitHub Actions
- `docker-compose.ci.yml` : Orchestration du test CI
- `test-build-only.ps1` : Script de test rapide (build seulement)
- `test-ci.ps1` : Script complet (build + serveur)
- `CI-TESTING.md` : Documentation complète

## 🐛 En cas de problème

Si le build Docker échoue, les erreurs affichées seront **exactement** les mêmes que celles de GitHub Actions :

```
[eslint] 
src/pages/Cards.js
  Line 105:6:  React Hook has a missing dependency...
```

Corrigez le code et relancez le test.

---

**Créé le 8 novembre 2025**  
*Fini les allers-retours GitHub Actions !*

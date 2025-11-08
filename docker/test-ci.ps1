# Script pour tester le build CI GitHub Pages en local
Write-Host "Test du build CI GitHub Pages en local..." -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier docker
Set-Location $PSScriptRoot

# Nettoyer les anciens containers
Write-Host "Nettoyage des anciens containers..." -ForegroundColor Yellow
docker compose -f docker-compose.ci.yml down 2>$null

# Builder et lancer le container CI
Write-Host ""
Write-Host "Build du frontend avec CI=true (comme GitHub Actions)..." -ForegroundColor Yellow
docker compose -f docker-compose.ci.yml build frontend-ci

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ECHEC DU BUILD CI !" -ForegroundColor Red
    Write-Host "Le build a echoue comme il echouerait sur GitHub Actions." -ForegroundColor Red
    Write-Host "Corrigez les erreurs avant de pusher." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "BUILD CI REUSSI !" -ForegroundColor Green
Write-Host ""
Write-Host "Lancement du serveur de test..." -ForegroundColor Yellow
docker compose -f docker-compose.ci.yml up frontend-ci

# Note: Le backend et MongoDB ne seront pas lances par defaut
# Pour tester avec le backend complet, utilisez:
# docker compose -f docker-compose.ci.yml up

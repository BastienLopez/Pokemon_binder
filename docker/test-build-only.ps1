# Script rapide pour tester uniquement le build CI
Write-Host "Test du build CI (sans lancer le serveur)..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Build uniquement
Write-Host "Building avec CI=true..." -ForegroundColor Yellow
docker compose -f docker-compose.ci.yml build frontend-ci

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BUILD CI REUSSI !" -ForegroundColor Green
    Write-Host "Vous pouvez pusher en toute securite." -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour tester le site en local:" -ForegroundColor Cyan
    Write-Host "  docker compose -f docker-compose.ci.yml up frontend-ci" -ForegroundColor White
    Write-Host "  puis visitez http://localhost:3001" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ECHEC DU BUILD CI !" -ForegroundColor Red
    Write-Host "Corrigez les erreurs avant de pusher." -ForegroundColor Red
    exit 1
}

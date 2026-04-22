@echo off
setlocal

:: Ouvrir une nouvelle fenêtre de commande et exécuter npm run dev
start cmd /k "cd backend && node .\server.js"

:: Ouvrir une nouvelle fenêtre de commande et exécuter npm run server
start cmd /k "cd frontend && npm run dev"


endlocal
@echo off
set PORT=5555
cls
color 0A
echo ==============================================
echo   Amelio's Farm - Painel de Status (Batch)
echo ==============================================

REM Inicia servidor de controle em uma nova janela
start "AmeliosFarm-Control" cmd /c "npm run control"

REM Aguarda alguns segundos para subir
powershell -Command "Start-Sleep -Seconds 2"

REM Abre o painel no navegador padrão
start "" http://localhost:%PORT%/status.html

echo Painel aberto em http://localhost:%PORT%/status.html
echo Para parar o servidor feche a janela 'AmeliosFarm-Control' ou use o botao Parar no painel.
echo Pressione qualquer tecla para sair desta janela.
pause >nul

# Dino Clone (Phaser + Vite + TypeScript)

Jogo inspirado no dinossauro do Google, com tela inicial (Iniciar Jogo, Pontuações), sistema de assets via manifest e suporte a GIFs para o jogador/inimigos/background.

## Requisitos
- Node.js 18+ recomendado

## Instalação
```powershell
npm install
```

## Executar em desenvolvimento
```powershell
npm run dev
```
Abra o endereço informado pelo Vite (por padrão `http://localhost:5173`).

## Build de produção
```powershell
npm run build
npm run preview
```

## Erros comuns
- CORS ao abrir `index.html` direto (file://): execute via servidor.
  - Desenvolvimento:
    ```powershell
    npm run dev
    ```
  - Após build:
    ```powershell
    npm run preview
    ```
  Não abra o arquivo `index.html` clicando duas vezes; acesse pelo endereço `http://localhost:5173` (ou o exibido no terminal).

## Sistema de Assets
- Arquivo: `public/assets/manifest.json` (gerado a partir da pasta raiz `assets/`)
- Formato:
```json
{
  "bg1": { "type": "image", "src": "/assets/backgrounds/bg1.png" },
  "bg2": { "type": "image", "src": "/assets/backgrounds/bg2.png" },
  "player_run": { "type": "gif", "src": "/assets/sprites/corrida.gif", "frameRate": 12 },
  "player_jump": { "type": "gif", "src": "/assets/sprites/pulo.gif", "frameRate": 12 },
  "player_dead": { "type": "image", "src": "/assets/sprites/morte.png" },
  "enemy_larva": { "type": "gif", "src": "/assets/enemies/larva.gif" },
  "enemy_percevejo": { "type": "gif", "src": "/assets/enemies/percevejo.gif" },
  "enemy_mosca": { "type": "gif", "src": "/assets/enemies/mosca.gif" },
  "col_certificado": { "type": "image", "src": "/assets/collectibles/certificado.png" },
  "col_soja": { "type": "gif", "src": "/assets/collectibles/soja_supreme.gif" }
}
```
- Tipos suportados: `image` (png/jpg) e `gif`. Fonte TTF é carregada via `this.load.font`.
- Para GIF, os frames são decodificados com `gifuct-js` e criamos uma animação reutilizável.
- Os arquivos da pasta raiz `assets/` são copiados automaticamente para `public/assets/` ao rodar `npm run dev`/`npm run build`.

## Cenas
- `MenuScene`: botões Iniciar Jogo e Pontuações.
- `GameScene`: mecânica do Dino (pular, obstáculos, coletáveis raros/comuns, pontuação e Game Over) com fundo alternando bg1/bg2.
- `ScoreScene`: exibe pontuações (localStorage).

## Observações
- Se algum asset não existir, o jogo usa formas simples (retângulos) temporariamente.
- Para personalizar: edite o `manifest.json` e substitua arquivos em `assets/`.

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

## Sistema de Assets
- Arquivo: `public/assets/manifest.json`
- Formato:
```json
{
  "player": { "type": "gif", "src": "/assets/player.gif", "frameRate": 12 },
  "enemy_cactus": { "type": "image", "src": "/assets/cactus.png" },
  "collectible": { "type": "image", "src": "/assets/coin.png" },
  "background": { "type": "image", "src": "/assets/background.png" }
}
```
- Tipos suportados: `image` (png/jpg) e `gif`.
- Para GIF, os frames são decodificados com `gifuct-js` e criamos uma animação reutilizável.
- Substitua os arquivos em `public/assets/` e ajuste os caminhos no `manifest.json`.

## Cenas
- `MenuScene`: botões Iniciar Jogo e Pontuações.
- `GameScene`: mecânica do Dino (pular, obstáculos, coletáveis, pontuação e Game Over).
- `ScoreScene`: exibe pontuações (localStorage).

## Observações
- Assets padrão no manifest são placeholders. Se não existir o arquivo, o jogo usa formas simples (retângulos) temporariamente.
- Para personalizar: substitua `player`, `enemy_cactus`, `collectible`, `background` no `manifest.json`.

## Próximos passos (sugestão)
- Adicionar ciclo dia/noite e nuvens.
- Animação de agachar do jogador; inimigos voadores.
- Tabela de pontuações persistida em backend (se necessário).

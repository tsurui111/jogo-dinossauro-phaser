# Amelio's Farm (Phaser + Vite + TypeScript)

Jogo estilo Dino do Google com tela inicial (Iniciar Jogo, Pontuações) e sistema de assets via manifest. Todos os assets são estáticos (sem animações em GIF). O jogo preenche toda a área disponível do navegador.

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

## Tela Cheia
- O jogo usa `Phaser.Scale.RESIZE` e CSS para ocupar 100% da viewport.
- Ajustes de layout usam `this.scale.width/height`; evite abrir direto via `file://`.

## Sistema de Assets
- Arquivo: `public/assets/manifest.json` (gerado a partir da pasta raiz `assets/`)
- Formato (estático):
```json
{
  "bg1": { "type": "image", "src": "/assets/backgrounds/bg1.png" },
  "bg2": { "type": "image", "src": "/assets/backgrounds/bg2.png" },
  "player_run": { "type": "image", "src": "/assets/sprites/corrida.gif" },
  "player_jump": { "type": "image", "src": "/assets/sprites/pulo.gif" },
  "player_dead": { "type": "image", "src": "/assets/sprites/morte.png" },
  "enemy_larva": { "type": "image", "src": "/assets/enemies/larva.gif" },
  "enemy_percevejo": { "type": "image", "src": "/assets/enemies/percevejo.gif" },
  "enemy_mosca": { "type": "image", "src": "/assets/enemies/mosca.gif" },
  "col_certificado": { "type": "image", "src": "/assets/collectibles/certificado.png" },
  "col_soja": { "type": "image", "src": "/assets/collectibles/soja_supreme.gif" }
}
```
- Tipos suportados: apenas `image` (inclui PNG/JPG/GIF exibido como frame estático).
- Os arquivos da pasta `assets/` são copiados automaticamente para `public/assets/` ao rodar `npm run dev`/`npm run build`.

## Cenas
- `MenuScene`: botões Iniciar Jogo e Pontuações.
- `GameScene`: mecânica básica (pulo, obstáculos, coletáveis raros/comuns, pontuação e Game Over) com fundo alternando bg1/bg2.
- `ScoreScene`: exibe pontuações (localStorage).

## Observações
- Se algum asset não existir, o jogo usa formas simples (retângulos) temporariamente.
- Para personalizar: edite o `manifest.json` e substitua arquivos em `assets/`.

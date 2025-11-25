import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#000000');
    // Fundo da tela inicial: backgrounds/bg2.png
    if (this.textures.exists('bg2')) {
      const bg = this.add.image(width/2, height/2, 'bg2');
      const sx = width / bg.width;
      const sy = height / bg.height;
      bg.setScale(Math.max(sx, sy));
    }
    this.add.text(width/2, height/2 - 120, "Amelio's Farm", { fontFamily: 'Minecraft, Arial', fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);

    this.createButton(width/2, height/2, 'Iniciar Jogo', () => this.scene.start('Game'));
    this.createButton(width/2, height/2 + 70, 'Pontuações', () => this.scene.start('Scores'));
  }

  private createButton(x: number, y: number, label: string, onClick: () => void) {
    const bg = this.add.rectangle(x, y, 260, 52, 0x222222, 0.8).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, { fontFamily: 'Minecraft, Arial', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x444444));
    bg.on('pointerout', () => bg.setFillStyle(0x333333));
    bg.on('pointerdown', onClick);
    return { bg, txt };
  }
}

import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#f5f5f5');
    this.add.text(width/2, height/2 - 120, 'Dino Clone', { fontFamily: 'Arial', fontSize: '48px', color: '#333' }).setOrigin(0.5);

    this.createButton(width/2, height/2, 'Iniciar Jogo', () => this.scene.start('Game'));
    this.createButton(width/2, height/2 + 70, 'Pontuações', () => this.scene.start('Scores'));
  }

  private createButton(x: number, y: number, label: string, onClick: () => void) {
    const bg = this.add.rectangle(x, y, 260, 52, 0x333333, 1).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, { fontFamily: 'Arial', fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x444444));
    bg.on('pointerout', () => bg.setFillStyle(0x333333));
    bg.on('pointerdown', onClick);
    return { bg, txt };
  }
}

import Phaser from 'phaser';
import { assetManager } from '../assets/AssetManager';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() { super('Preload'); }

  preload() {
    const { width, height } = this.scale;
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width/2 - 160, height/2 - 25, 320, 50);

    this.progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(width/2 - 150, height/2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
    });

    assetManager.preloadStatic(this);
  }

  async create() {
    await assetManager.loadGifs(this);
    this.scene.start('Menu');
  }
}

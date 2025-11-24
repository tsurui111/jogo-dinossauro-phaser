import Phaser from 'phaser';
import { assetManager } from '../assets/AssetManager';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  async create() {
    await assetManager.loadManifest('/assets/manifest.json');
    this.scene.start('Preload');
  }
}

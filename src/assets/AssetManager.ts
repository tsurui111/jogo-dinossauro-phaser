import type { AssetManifest, AssetEntry } from './types';
import Phaser from 'phaser';

export class AssetManager {
  private manifest: AssetManifest = {};

  async loadManifest(url: string = '/assets/manifest.json') {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.manifest = (await res.json()) as AssetManifest;
    } catch {
      this.manifest = {};
    }
  }

  get keys() {
    return Object.keys(this.manifest);
  }

  getEntry(key: string): AssetEntry | undefined {
    return this.manifest[key];
  }

  preloadStatic(scene: Phaser.Scene) {
    for (const [key, entry] of Object.entries(this.manifest)) {
      // Tratar todos como imagem (gif exibirá primeiro frame)
      scene.load.image(key, entry.src);
    }
  }
}

export const assetManager = new AssetManager();

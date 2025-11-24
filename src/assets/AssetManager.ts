import { parseGIF, decompressFrames } from 'gifuct-js';
import type { AssetManifest, AssetEntry } from './types';
import Phaser from 'phaser';

export class AssetManager {
  private manifest: AssetManifest = {};
  private loadedGifAnims: Record<string, string> = {};

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
      if (entry.type === 'image') {
        scene.load.image(key, entry.src);
      }
    }
  }

  async loadGifs(scene: Phaser.Scene) {
    for (const [key, entry] of Object.entries(this.manifest)) {
      if (entry.type === 'gif') {
        const animKey = await this.addGifAsAnimation(scene, key, entry.src, entry.frameRate ?? 12);
        if (animKey) this.loadedGifAnims[key] = animKey;
      }
    }
  }

  getAnimationKeyFor(key: string) {
    return this.loadedGifAnims[key];
  }

  private async addGifAsAnimation(
    scene: Phaser.Scene,
    baseKey: string,
    url: string,
    frameRate: number
  ): Promise<string | null> {
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);

      const frameKeys: { key: string }[] = [];
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const { width, height } = frame.dims;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const imageData = ctx.createImageData(width, height);
        imageData.data.set(frame.patch);
        ctx.putImageData(imageData, 0, 0);

        const frameKey = `${baseKey}__f${i}`;
        if (scene.textures.exists(frameKey)) {
          scene.textures.remove(frameKey);
        }
        scene.textures.addCanvas(frameKey, canvas);
        frameKeys.push({ key: frameKey });
      }

      const animKey = `${baseKey}__anim`;
      if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
      scene.anims.create({ key: animKey, frames: frameKeys, frameRate, repeat: -1 });
      return animKey;
    } catch (e) {
      console.warn('Failed to load GIF', baseKey, e);
      return null;
    }
  }
}

export const assetManager = new AssetManager();

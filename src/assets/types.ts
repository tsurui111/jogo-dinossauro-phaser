export type AssetEntry = {
  type: 'image' | 'gif';
  src: string;
  frameRate?: number;
};

export type AssetManifest = Record<string, AssetEntry>;

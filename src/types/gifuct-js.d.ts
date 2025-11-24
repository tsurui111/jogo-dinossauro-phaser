declare module 'gifuct-js' {
  export function parseGIF(buffer: ArrayBuffer): any;
  export function decompressFrames(gif: any, buildImagePatches: boolean): Array<{
    dims: { width: number; height: number };
    patch: Uint8ClampedArray;
  }>;
}

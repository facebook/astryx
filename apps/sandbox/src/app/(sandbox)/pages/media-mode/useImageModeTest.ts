'use client';

/**
 * Test variant of useImageMode that supports multiple luminance algorithms.
 * Used in the media mode comparison sandbox to evaluate which algorithm
 * produces the best results before updating the core hook.
 */

import {useState, useEffect} from 'react';
import type {ImageSampleRegion} from '@xds/core/hooks';

export type Algorithm = 'gamma' | 'wcag' | 'apca';

/** BT.709 luma on gamma-encoded sRGB (current useImageMode) */
function gammaLuma(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** WCAG 2 relative luminance with sRGB linearization */
function wcagLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** APCA perceptual lightness: linearize, compute Y, apply power curve */
function apcaLightness(r: number, g: number, b: number): number {
  const lin = (c: number) => Math.pow(c / 255, 2.4);
  const y = 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.0721750 * lin(b);
  return Math.pow(y, 0.56);
}

const ALGO_CONFIG: Record<Algorithm, {fn: (r: number, g: number, b: number) => number; threshold: number}> = {
  gamma: {fn: gammaLuma, threshold: 0.5},
  wcag: {fn: wcagLuminance, threshold: 0.18},
  apca: {fn: apcaLightness, threshold: 0.5},
};

export interface UseImageModeTestOptions {
  region?: ImageSampleRegion;
  algorithm?: Algorithm;
  fallback?: 'dark' | 'light' | null;
}

/**
 * Like useImageMode but with a selectable algorithm.
 * Returns {mode, value} so the UI can show the raw number.
 */
export function useImageModeTest(
  src: string | null | undefined,
  options: UseImageModeTestOptions = {},
): {mode: 'dark' | 'light' | null; value: number | null} {
  const {region, algorithm = 'gamma', fallback = null} = options;
  const [result, setResult] = useState<{mode: 'dark' | 'light' | null; value: number | null}>({
    mode: fallback,
    value: null,
  });

  useEffect(() => {
    if (!src) {
      setResult({mode: fallback, value: null});
      return;
    }

    let cancelled = false;
    const config = ALGO_CONFIG[algorithm];

    async function detect() {
      try {
        const response = await fetch(src!, {mode: 'cors'});
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        if (cancelled) return;

        const sx = region ? Math.round(region.x * bitmap.width) : 0;
        const sy = region ? Math.round(region.y * bitmap.height) : 0;
        const sw = region ? Math.round(region.width * bitmap.width) : bitmap.width;
        const sh = region ? Math.round(region.height * bitmap.height) : bitmap.height;

        const sampleSize = 10;
        const canvas = new OffscreenCanvas(sampleSize, sampleSize);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

        let totalR = 0, totalG = 0, totalB = 0;
        const pixelCount = sampleSize * sampleSize;
        for (let i = 0; i < imageData.length; i += 4) {
          totalR += imageData[i];
          totalG += imageData[i + 1];
          totalB += imageData[i + 2];
        }

        if (cancelled) return;

        const r = totalR / pixelCount;
        const g = totalG / pixelCount;
        const b = totalB / pixelCount;
        const value = config.fn(r, g, b);
        const mode = value > config.threshold ? 'light' : 'dark';

        setResult({mode, value});
      } catch {
        if (!cancelled) setResult({mode: fallback, value: null});
      }
    }

    detect();
    return () => { cancelled = true; };
  }, [src, region?.x, region?.y, region?.width, region?.height, algorithm, fallback]);

  return result;
}

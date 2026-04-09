'use client';

/**
 * @file useImageMode.ts
 * @input Image source URL
 * @output Detected mode luminance: 'dark' | 'light' | null
 * @position Hook; used alongside XDSMediaTheme for auto-detection
 *
 * Detects whether an image is predominantly dark or light by sampling
 * its pixels via OffscreenCanvas. Runs entirely off the paint path —
 * no visible canvas element, no layout thrash.
 *
 * The 1×1 downsample trick lets the browser's internal resampling do
 * the averaging — no manual pixel-by-pixel luminance calculation.
 *
 * For regional detection (e.g. "what's the luminance where the text
 * overlay sits"), pass a `region` option to sample a specific area.
 *
 * @example
 * ```tsx
 * function ImageCard({ src }: { src: string }) {
 *   const mode = useImageMode(src);
 *   return (
 *     <div style={{ backgroundImage: `url(${src})` }}>
 *       <XDSMediaTheme mode={mode ?? 'dark'}>
 *         <XDSText>Auto-detected text color</XDSText>
 *       </XDSMediaTheme>
 *     </div>
 *   );
 * }
 * ```
 */

import {useState, useEffect} from 'react';

/**
 * Region to sample within the image (normalized 0-1 coordinates).
 * Useful for detecting luminance where text will be overlaid,
 * rather than the full image average.
 */
export interface ImageSampleRegion {
  /** Left edge (0 = left, 1 = right) */
  x: number;
  /** Top edge (0 = top, 1 = bottom) */
  y: number;
  /** Width as fraction of image width */
  width: number;
  /** Height as fraction of image height */
  height: number;
}

export interface UseImageModeOptions {
  /**
   * Region to sample. Defaults to the full image.
   * Use normalized coordinates (0-1).
   */
  region?: ImageSampleRegion;
  /**
   * Luminance threshold for the dark/light split.
   * Below this = 'dark', above = 'light'.
   * @default 0.5
   */
  threshold?: number;
  /**
   * Fallback value while loading or on error.
   * @default null
   */
  fallback?: 'dark' | 'light' | null;
}

/**
 * Calculate perceptual brightness from sRGB values (0-255).
 * Uses BT.709 luma coefficients on gamma-encoded values (not linearized).
 * This gives a result that matches human perception better than
 * true relative luminance for the purpose of "is this image dark or light."
 * Returns 0-1 where 0 is black, 1 is white.
 */
function perceptualBrightness(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Detect whether an image is predominantly dark or light.
 *
 * Uses OffscreenCanvas to sample the image without interrupting
 * the main render loop. Returns null while loading.
 */
export function useImageMode(
  src: string | null | undefined,
  options: UseImageModeOptions = {},
): 'dark' | 'light' | null {
  const {region, threshold = 0.5, fallback = null} = options;
  const [mode, setMode] = useState<'dark' | 'light' | null>(fallback);

  useEffect(() => {
    if (!src) {
      setMode(fallback);
      return;
    }

    let cancelled = false;

    async function detect() {
      try {
        // Load image as bitmap (async, doesn't block rendering)
        const response = await fetch(src!, {mode: 'cors'});
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);

        if (cancelled) return;

        // Determine source region
        const sx = region ? Math.round(region.x * bitmap.width) : 0;
        const sy = region ? Math.round(region.y * bitmap.height) : 0;
        const sw = region
          ? Math.round(region.width * bitmap.width)
          : bitmap.width;
        const sh = region
          ? Math.round(region.height * bitmap.height)
          : bitmap.height;

        // Sample at a small size and average all pixels manually.
        // OffscreenCanvas 1×1 drawImage can produce inaccurate results
        // depending on the browser's resampling algorithm.
        const sampleSize = 10;
        const canvas = new OffscreenCanvas(sampleSize, sampleSize);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

        // Average all sampled pixels
        let totalR = 0, totalG = 0, totalB = 0;
        const pixelCount = sampleSize * sampleSize;
        for (let i = 0; i < imageData.length; i += 4) {
          totalR += imageData[i];
          totalG += imageData[i + 1];
          totalB += imageData[i + 2];
        }
        const r = totalR / pixelCount;
        const g = totalG / pixelCount;
        const b = totalB / pixelCount;

        if (cancelled) return;

        const brightness = perceptualBrightness(r, g, b);
        setMode(brightness > threshold ? 'light' : 'dark');
      } catch {
        // CORS error, network error, etc. — keep fallback
        if (!cancelled) setMode(fallback);
      }
    }

    detect();

    return () => {
      cancelled = true;
    };
  }, [src, region?.x, region?.y, region?.width, region?.height, threshold, fallback]);

  return mode;
}

'use client';

/**
 * @file useImageSurface.ts
 * @input Image source URL
 * @output Detected surface luminance: 'dark' | 'light' | null
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
 *   const surface = useImageSurface(src);
 *   return (
 *     <div style={{ backgroundImage: `url(${src})` }}>
 *       <XDSMediaTheme surface={surface ?? 'dark'}>
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

export interface UseImageSurfaceOptions {
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
 * Calculate relative luminance from sRGB values (0-255).
 * Uses the BT.709 coefficients per WCAG 2.x.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  // Linearize sRGB
  const linearize = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Detect whether an image is predominantly dark or light.
 *
 * Uses OffscreenCanvas to sample the image without interrupting
 * the main render loop. Returns null while loading.
 */
export function useImageSurface(
  src: string | null | undefined,
  options: UseImageSurfaceOptions = {},
): 'dark' | 'light' | null {
  const {region, threshold = 0.5, fallback = null} = options;
  const [surface, setSurface] = useState<'dark' | 'light' | null>(fallback);

  useEffect(() => {
    if (!src) {
      setSurface(fallback);
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

        // Downsample to 1×1 — browser resampling does the averaging
        const canvas = new OffscreenCanvas(1, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

        if (cancelled) return;

        const luminance = relativeLuminance(r, g, b);
        setSurface(luminance > threshold ? 'light' : 'dark');
      } catch {
        // CORS error, network error, etc. — keep fallback
        if (!cancelled) setSurface(fallback);
      }
    }

    detect();

    return () => {
      cancelled = true;
    };
  }, [src, region?.x, region?.y, region?.width, region?.height, threshold, fallback]);

  return surface;
}

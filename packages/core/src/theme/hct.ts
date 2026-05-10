/**
 * @file hct.ts
 * @input Hex color string (#RRGGBB)
 * @output HCT color representation (Hue, Chroma, Tone)
 * @position Theme utility; consumed by expandColorScale.ts
 *
 * Minimal HCT (Hue, Chroma, Tone) color space implementation.
 * Ported from Google's material-color-utilities (Apache-2.0).
 * Zero runtime dependencies — all math is self-contained.
 *
 * HCT combines:
 * - Hue from CIELab (perceptually uniform hue)
 * - Chroma approximated via CIELab C*ab (colorfulness)
 * - Tone from L* (CIE Lightness, 0=black, 100=white)
 */

// =============================================================================
// Types
// =============================================================================

export interface HCT {
  hue: number;
  chroma: number;
  tone: number;
}

// =============================================================================
// sRGB <-> Linear RGB
// =============================================================================

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, s * 255)));
}

// =============================================================================
// Linear RGB <-> XYZ (D65 illuminant)
// =============================================================================

function linearRgbToXyz(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    0.0193339 * r + 0.119192 * g + 0.9503041 * b,
  ];
}

function xyzToLinearRgb(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  return [
    3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
    -0.969266 * x + 1.8760108 * y + 0.041556 * z,
    0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
  ];
}

// =============================================================================
// XYZ <-> L*a*b*
// =============================================================================

const D65_WHITE: [number, number, number] = [0.95047, 1.0, 1.08883];

function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta * delta * delta
    ? Math.cbrt(t)
    : t / (3 * delta * delta) + 4 / 29;
}

function labFInv(t: number): number {
  const delta = 6 / 29;
  return t > delta ? t * t * t : 3 * delta * delta * (t - 4 / 29);
}

function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const fx = labF(x / D65_WHITE[0]);
  const fy = labF(y / D65_WHITE[1]);
  const fz = labF(z / D65_WHITE[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labToXyz(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  return [
    labFInv(fx) * D65_WHITE[0],
    labFInv(fy) * D65_WHITE[1],
    labFInv(fz) * D65_WHITE[2],
  ];
}

// =============================================================================
// Tone <-> Y (CIE Luminance)
// =============================================================================

export function toneToY(tone: number): number {
  return labFInv((tone + 16) / 116);
}

export function yToTone(y: number): number {
  return 116 * labF(y) - 16;
}

// =============================================================================
// Hex <-> RGB
// =============================================================================

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

// =============================================================================
// Core: Hex <-> HCT
// =============================================================================

/**
 * Convert a hex color to HCT.
 * Hue: 0-360, Chroma: 0-~120, Tone: 0-100.
 */
export function hexToHct(hex: string): HCT {
  const [r, g, b] = hexToRgb(hex);
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const [x, y, z] = linearRgbToXyz(lr, lg, lb);
  const [L, a, bLab] = xyzToLab(x, y, z);

  const hueRad = Math.atan2(bLab, a);
  let hue = (hueRad * 180) / Math.PI;
  if (hue < 0) hue += 360;

  const chroma = Math.sqrt(a * a + bLab * bLab);
  const tone = L;

  return {hue, chroma, tone: Math.max(0, Math.min(100, tone))};
}

/**
 * Convert HCT to hex, with gamut mapping.
 * Uses chroma reduction to find the closest in-gamut sRGB color.
 */
export function hctToHex(hct: HCT): string {
  const {hue, chroma, tone} = hct;

  if (tone <= 0) return '#000000';
  if (tone >= 100) return '#FFFFFF';
  if (chroma < 0.5) {
    const gray = toneToGray(tone);
    return rgbToHex(gray, gray, gray);
  }

  let lo = 0;
  let hi = chroma;
  let bestHex = '#000000';

  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const candidate = hctComponentToHex(hue, mid, tone);
    if (candidate !== null) {
      bestHex = candidate;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return bestHex;
}

function toneToGray(tone: number): number {
  const y = toneToY(tone);
  return linearToSrgb(y);
}

function hctComponentToHex(
  hue: number,
  chroma: number,
  tone: number,
): string | null {
  const hueRad = (hue * Math.PI) / 180;
  const a = Math.cos(hueRad) * chroma;
  const b = Math.sin(hueRad) * chroma;
  const L = tone;

  const [x, y, z] = labToXyz(L, a, b);
  const [lr, lg, lb] = xyzToLinearRgb(x, y, z);

  const r = linearToSrgb(lr);
  const g = linearToSrgb(lg);
  const bVal = linearToSrgb(lb);

  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(bVal);

  const tolerance = 0.02;
  if (
    Math.abs(rLin - lr) > tolerance ||
    Math.abs(gLin - lg) > tolerance ||
    Math.abs(bLin - lb) > tolerance
  ) {
    return null;
  }

  if (r < 0 || r > 255 || g < 0 || g > 255 || bVal < 0 || bVal > 255) {
    return null;
  }

  return rgbToHex(r, g, bVal);
}

// =============================================================================
// Tonal Palette
// =============================================================================

const PALETTE_TONES = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

/**
 * Generate a tonal palette: hex colors at standard tones
 * for a given hue and chroma.
 */
export function tonalPalette(
  hue: number,
  chroma: number,
): Record<number, string> {
  const result: Record<number, string> = {};
  for (const tone of PALETTE_TONES) {
    result[tone] = hctToHex({hue, chroma, tone});
  }
  return result;
}

// =============================================================================
// Utility: hex with alpha
// =============================================================================

/**
 * Append alpha (0-1) to a hex color as a 2-digit hex suffix.
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return hex + alphaHex;
}

/**
 * Color Studio — Color Utilities
 *
 * HCT perceptual color space, tonal palette generation, color harmonies,
 * image extraction, semantic role derivation, and WCAG contrast.
 */

// === sRGB ↔ Linear ===
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, s * 255)));
}

// === Linear RGB ↔ XYZ (D65) ===
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

// === XYZ ↔ CIELab ===
const D65: [number, number, number] = [0.95047, 1.0, 1.08883];
function labF(t: number): number {
  const d = 6 / 29;
  return t > d * d * d ? Math.cbrt(t) : t / (3 * d * d) + 4 / 29;
}
function labFInv(t: number): number {
  const d = 6 / 29;
  return t > d ? t * t * t : 3 * d * d * (t - 4 / 29);
}
function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const fx = labF(x / D65[0]),
    fy = labF(y / D65[1]),
    fz = labF(z / D65[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function labToXyz(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116,
    fx = a / 500 + fy,
    fz = fy - b / 200;
  return [labFInv(fx) * D65[0], labFInv(fy) * D65[1], labFInv(fz) * D65[2]];
}

// === HCT Types ===
export interface HCT {
  hue: number;
  chroma: number;
  tone: number;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map(c =>
        Math.round(Math.max(0, Math.min(255, c)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function hexToHct(hex: string): HCT {
  const [r, g, b] = hexToRgb(hex);
  const [x, y, z] = linearRgbToXyz(
    srgbToLinear(r),
    srgbToLinear(g),
    srgbToLinear(b),
  );
  const [L, a, bLab] = xyzToLab(x, y, z);
  let hue = (Math.atan2(bLab, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return {
    hue,
    chroma: Math.sqrt(a * a + bLab * bLab),
    tone: Math.max(0, Math.min(100, L)),
  };
}

export function hctToHex(hct: HCT): string {
  const {hue, chroma, tone} = hct;
  if (tone <= 0) return '#000000';
  if (tone >= 100) return '#ffffff';
  if (chroma < 0.5) {
    const y = labFInv((tone + 16) / 116);
    const g = linearToSrgb(y);
    return rgbToHex(g, g, g);
  }
  let lo = 0,
    hi = chroma,
    best = '#000000';
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const hRad = (hue * Math.PI) / 180;
    const a = Math.cos(hRad) * mid,
      b = Math.sin(hRad) * mid;
    const [x, y, z] = labToXyz(tone, a, b);
    const [lr, lg, lb] = xyzToLinearRgb(x, y, z);
    const r = linearToSrgb(lr),
      g = linearToSrgb(lg),
      bv = linearToSrgb(lb);
    const ok =
      Math.abs(srgbToLinear(r) - lr) < 0.02 &&
      Math.abs(srgbToLinear(g) - lg) < 0.02 &&
      Math.abs(srgbToLinear(bv) - lb) < 0.02 &&
      r >= 0 &&
      r <= 255 &&
      g >= 0 &&
      g <= 255 &&
      bv >= 0 &&
      bv <= 255;
    if (ok) {
      best = rgbToHex(r, g, bv);
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

// === Tonal Palette ===
export const TONE_STEPS = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
export function tonalPalette(
  hue: number,
  chroma: number,
): Record<number, string> {
  const result: Record<number, string> = {};
  for (const t of TONE_STEPS) result[t] = hctToHex({hue, chroma, tone: t});
  return result;
}

// === Color Harmonies ===
export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic';
export interface HarmonyColor {
  label: string;
  hue: number;
  chroma: number;
  hex: string;
}

export function generateHarmony(seed: HCT, type: HarmonyType): HarmonyColor[] {
  const {hue: h, chroma: c} = seed;
  const mk = (label: string, hue: number, chr?: number): HarmonyColor => ({
    label,
    hue: ((hue % 360) + 360) % 360,
    chroma: chr ?? c,
    hex: hctToHex({hue: ((hue % 360) + 360) % 360, chroma: chr ?? c, tone: 50}),
  });
  switch (type) {
    case 'complementary':
      return [mk('Primary', h), mk('Complement', h + 180)];
    case 'analogous':
      return [
        mk('Analogous A', h - 30),
        mk('Primary', h),
        mk('Analogous B', h + 30),
      ];
    case 'triadic':
      return [
        mk('Primary', h),
        mk('Triadic B', h + 120),
        mk('Triadic C', h + 240),
      ];
    case 'split-complementary':
      return [mk('Primary', h), mk('Split B', h + 150), mk('Split C', h + 210)];
    case 'tetradic':
      return [
        mk('Primary', h),
        mk('Tetradic B', h + 90),
        mk('Tetradic C', h + 180),
        mk('Tetradic D', h + 270),
      ];
    case 'monochromatic':
      return [
        mk('Muted', h, c * 0.3),
        mk('Light', h, c * 0.6),
        mk('Primary', h),
        mk('Vivid', h, Math.min(c * 1.4, 120)),
      ];
    default:
      return [mk('Primary', h)];
  }
}

// === Semantic Roles (Layer 2) ===
export interface SemanticRole {
  name: string;
  group: string;
  light: string;
  dark: string;
  highContrast: string;
  pairedWith?: string;
}

function alpha(hex: string, a: number): string {
  return (
    hex.substring(0, 7) +
    Math.round(a * 255)
      .toString(16)
      .padStart(2, '0')
  );
}

export function deriveSemanticRoles(
  seedHex: string,
  warmth: 'warm' | 'cool' | 'neutral',
): SemanticRole[] {
  const seed = hexToHct(seedHex);
  const h = seed.hue;
  const pc = Math.max(seed.chroma, 48);
  const nc = warmth === 'warm' ? 7 : warmth === 'cool' ? 5 : 3;
  const nvc = nc + 3;
  const P = tonalPalette(h, pc);
  const N = tonalPalette(h, nc);
  const NV = tonalPalette(h, nvc);
  const E = tonalPalette(25, 70);
  const S = tonalPalette(145, 60);
  const W = tonalPalette(90, 70);
  const I = tonalPalette(250, 50);

  return [
    {
      name: 'accent',
      group: 'Interactive',
      light: P[40],
      dark: P[80],
      highContrast: P[30],
      pairedWith: 'surface',
    },
    {
      name: 'accent-muted',
      group: 'Interactive',
      light: alpha(P[40], 0.2),
      dark: alpha(P[80], 0.25),
      highContrast: alpha(P[30], 0.25),
    },
    {
      name: 'on-accent',
      group: 'Interactive',
      light: P[100],
      dark: P[20],
      highContrast: P[100],
      pairedWith: 'accent',
    },
    {
      name: 'accent-hover',
      group: 'Interactive',
      light: P[30],
      dark: P[70],
      highContrast: P[20],
    },
    {
      name: 'accent-pressed',
      group: 'Interactive',
      light: P[20],
      dark: P[60],
      highContrast: P[10],
    },
    {
      name: 'focus-ring',
      group: 'Interactive',
      light: alpha(P[50], 0.5),
      dark: alpha(P[70], 0.5),
      highContrast: P[40],
    },
    {
      name: 'surface',
      group: 'Surface',
      light: N[99],
      dark: N[10],
      highContrast: '#ffffff',
    },
    {
      name: 'body',
      group: 'Surface',
      light: N[95],
      dark: N[5],
      highContrast: '#ffffff',
    },
    {
      name: 'card',
      group: 'Surface',
      light: N[99],
      dark: N[10],
      highContrast: '#ffffff',
    },
    {
      name: 'popover',
      group: 'Surface',
      light: N[99],
      dark: N[20],
      highContrast: '#ffffff',
    },
    {
      name: 'overlay',
      group: 'Surface',
      light: alpha(N[10], 0.4),
      dark: alpha(N[10], 0.6),
      highContrast: alpha(N[0], 0.7),
    },
    {
      name: 'muted',
      group: 'Surface',
      light: alpha(N[10], 0.05),
      dark: alpha(N[10], 0.5),
      highContrast: alpha(N[10], 0.08),
    },
    {
      name: 'inverted',
      group: 'Surface',
      light: N[10],
      dark: N[99],
      highContrast: '#000000',
    },
    {
      name: 'text-primary',
      group: 'Content',
      light: N[10],
      dark: N[90],
      highContrast: N[0],
      pairedWith: 'surface',
    },
    {
      name: 'text-secondary',
      group: 'Content',
      light: NV[30],
      dark: NV[70],
      highContrast: NV[20],
      pairedWith: 'surface',
    },
    {
      name: 'text-disabled',
      group: 'Content',
      light: NV[60],
      dark: NV[40],
      highContrast: NV[50],
      pairedWith: 'surface',
    },
    {
      name: 'text-accent',
      group: 'Content',
      light: P[30],
      dark: P[80],
      highContrast: P[20],
      pairedWith: 'surface',
    },
    {
      name: 'icon-primary',
      group: 'Content',
      light: N[10],
      dark: N[90],
      highContrast: N[0],
      pairedWith: 'surface',
    },
    {
      name: 'icon-secondary',
      group: 'Content',
      light: NV[30],
      dark: NV[70],
      highContrast: NV[20],
      pairedWith: 'surface',
    },
    {
      name: 'icon-disabled',
      group: 'Content',
      light: NV[60],
      dark: NV[40],
      highContrast: NV[50],
      pairedWith: 'surface',
    },
    {
      name: 'error',
      group: 'Feedback',
      light: E[40],
      dark: E[60],
      highContrast: E[30],
      pairedWith: 'surface',
    },
    {
      name: 'error-muted',
      group: 'Feedback',
      light: alpha(E[40], 0.2),
      dark: alpha(E[60], 0.25),
      highContrast: alpha(E[30], 0.25),
    },
    {
      name: 'on-error',
      group: 'Feedback',
      light: E[100],
      dark: E[10],
      highContrast: E[100],
      pairedWith: 'error',
    },
    {
      name: 'success',
      group: 'Feedback',
      light: S[40],
      dark: S[60],
      highContrast: S[30],
      pairedWith: 'surface',
    },
    {
      name: 'success-muted',
      group: 'Feedback',
      light: alpha(S[40], 0.2),
      dark: alpha(S[60], 0.25),
      highContrast: alpha(S[30], 0.25),
    },
    {
      name: 'on-success',
      group: 'Feedback',
      light: S[100],
      dark: S[10],
      highContrast: S[100],
      pairedWith: 'success',
    },
    {
      name: 'warning',
      group: 'Feedback',
      light: W[50],
      dark: W[60],
      highContrast: W[40],
      pairedWith: 'surface',
    },
    {
      name: 'warning-muted',
      group: 'Feedback',
      light: alpha(W[50], 0.2),
      dark: alpha(W[50], 0.25),
      highContrast: alpha(W[40], 0.25),
    },
    {
      name: 'on-warning',
      group: 'Feedback',
      light: N[10],
      dark: N[10],
      highContrast: N[0],
      pairedWith: 'warning',
    },
    {
      name: 'info',
      group: 'Feedback',
      light: I[40],
      dark: I[70],
      highContrast: I[30],
      pairedWith: 'surface',
    },
    {
      name: 'info-muted',
      group: 'Feedback',
      light: alpha(I[40], 0.2),
      dark: alpha(I[70], 0.25),
      highContrast: alpha(I[30], 0.25),
    },
    {
      name: 'border',
      group: 'Border',
      light: alpha(N[10], 0.1),
      dark: alpha(N[95], 0.1),
      highContrast: N[0],
    },
    {
      name: 'border-emphasized',
      group: 'Border',
      light: NV[70],
      dark: NV[30],
      highContrast: NV[0],
    },
  ];
}

// === Categorical Colors (Layer 3) ===
export interface CategoricalColor {
  label: string;
  hex: string;
  hue: number;
}
export function generateCategorical(
  seedHue: number,
  seedChroma: number,
): CategoricalColor[] {
  const labels = [
    'Blue',
    'Orange',
    'Green',
    'Purple',
    'Teal',
    'Pink',
    'Amber',
    'Indigo',
    'Red',
    'Cyan',
  ];
  return labels.map((label, i) => {
    const hue = (((seedHue + i * 36) % 360) + 360) % 360;
    const c = Math.min(Math.max(seedChroma * 0.8, 40), 80);
    return {label, hue, hex: hctToHex({hue, chroma: c, tone: 50})};
  });
}

// === Expressive Colors (Layer 4) ===
export interface ExpressiveColor {
  label: string;
  hex: string;
  hue: number;
  chroma: number;
}
export function generateExpressive(
  seedHue: number,
  seedChroma: number,
): ExpressiveColor[] {
  const configs: Array<{label: string; dH: number; cM: number; t: number}> = [
    {label: 'Vivid', dH: 0, cM: 1.5, t: 55},
    {label: 'Warm', dH: 30, cM: 1.2, t: 60},
    {label: 'Cool', dH: -60, cM: 1.0, t: 55},
    {label: 'Deep', dH: 0, cM: 1.3, t: 30},
    {label: 'Pastel', dH: 15, cM: 0.5, t: 85},
    {label: 'Electric', dH: -30, cM: 1.6, t: 50},
  ];
  return configs.map(({label, dH, cM, t}) => {
    const hue = (((seedHue + dH) % 360) + 360) % 360;
    const chroma = Math.min(seedChroma * cM, 120);
    return {label, hue, chroma, hex: hctToHex({hue, chroma, tone: t})};
  });
}

// === WCAG Contrast ===
export function luminance(hex: string): number {
  if (hex.length > 7) hex = hex.substring(0, 7);
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg),
    l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
export function wcagGrade(ratio: number): 'AAA' | 'AA' | 'AA18' | 'FAIL' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA18';
  return 'FAIL';
}

// === Image Color Extraction (Median Cut) ===
export function extractColorsFromImage(
  img: HTMLImageElement,
  count = 8,
): string[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const w = 200,
    h = Math.round((img.naturalHeight * 200) / img.naturalWidth);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 15 || lum > 245) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (!pixels.length) return ['#0064e0'];
  function medianCut(px: [number, number, number][], depth: number): string[] {
    if (depth === 0 || px.length < 2) {
      const avg = px.reduce(
        (a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]],
        [0, 0, 0],
      );
      const n = px.length || 1;
      return [rgbToHex(avg[0] / n, avg[1] / n, avg[2] / n)];
    }
    const ranges = [0, 1, 2].map(ch => {
      const v = px.map(p => p[ch]);
      return Math.max(...v) - Math.min(...v);
    });
    const ch = ranges.indexOf(Math.max(...ranges));
    px.sort((a, b) => a[ch] - b[ch]);
    const mid = Math.floor(px.length / 2);
    return [
      ...medianCut(px.slice(0, mid), depth - 1),
      ...medianCut(px.slice(mid), depth - 1),
    ];
  }
  const colors = medianCut(pixels, Math.ceil(Math.log2(count)));
  const unique = [colors[0]];
  for (const c of colors.slice(1)) {
    const h1 = hexToHct(c);
    if (
      !unique.some(u => {
        const h2 = hexToHct(u);
        return (
          Math.abs(h1.tone - h2.tone) < 8 &&
          Math.abs(h1.chroma - h2.chroma) < 10
        );
      })
    )
      unique.push(c);
  }
  unique.sort((a, b) => hexToHct(b).chroma - hexToHct(a).chroma);
  return unique.slice(0, count);
}

// === Parse color string ===
export function parseColorInput(input: string): string | null {
  const s = input.trim();
  if (/^#?[0-9a-f]{3}$/i.test(s)) {
    const h = s.replace('#', '');
    return '#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (/^#?[0-9a-f]{6}$/i.test(s)) return '#' + s.replace('#', '');
  const rgbM = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbM) return rgbToHex(+rgbM[1], +rgbM[2], +rgbM[3]);
  const hslM = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/);
  if (hslM) {
    const hh = +hslM[1] / 360,
      ss = +hslM[2] / 100,
      ll = +hslM[3] / 100;
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss,
      p = 2 * ll - q;
    const h2r = (pp: number, qq: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return pp + (qq - pp) * 6 * t;
      if (t < 1 / 2) return qq;
      if (t < 2 / 3) return pp + (qq - pp) * (2 / 3 - t) * 6;
      return pp;
    };
    return rgbToHex(
      Math.round(h2r(p, q, hh + 1 / 3) * 255),
      Math.round(h2r(p, q, hh) * 255),
      Math.round(h2r(p, q, hh - 1 / 3) * 255),
    );
  }
  return null;
}

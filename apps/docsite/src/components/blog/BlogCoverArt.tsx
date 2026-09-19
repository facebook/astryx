// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BlogCoverArt.tsx
 * Generated, theme-aware fallback cover for blog posts without a `coverImage`.
 *
 * Renders a muted field of tiled Astryx marks over a soft brand-hued wash, with
 * a few marks picked out in the brand color. Everything is a deterministic
 * function of the post seed (its slug), so the same post always gets the same
 * cover across server and client renders (no hydration mismatch) while
 * different posts look distinct. Because it renders inline (not via <img>) it
 * paints with the live theme tokens, so it follows light/dark automatically.
 *
 * @input  seed (stable per-post string), feature (larger, denser layout)
 * @output A decorative 16:9 SVG cover
 * @position Used by BlogCard when a post has no explicit coverImage.
 */

import * as stylex from '@stylexjs/stylex';

// Astryx icon mark geometry, mirrored from AstryxIcon in components/logos.tsx
// (40x40 viewBox). Duplicated as a bare path here so it can be tiled via <use>
// with a per-instance fill/opacity, which a full <svg> component can't provide.
const MARK_PATH =
  'M11.2002 0C14.7347 0.000105757 17.6 2.8654 17.6001 6.3999V11.2002C17.6002 12.3047 18.4956 13.2002 19.6001 13.2002H20.3999C21.5044 13.2002 22.3998 12.3047 22.3999 11.2002V6.3999C22.4 2.8654 25.2653 0.000106275 28.7998 0H37.6001C38.9255 5.15369e-05 39.9999 1.07451 40 2.3999V11.2002C39.9999 14.7347 37.1346 17.6 33.6001 17.6001H28.7998C27.6953 17.6002 26.7998 18.4956 26.7998 19.6001V20.3999C26.7998 21.5044 27.6953 22.3998 28.7998 22.3999H33.6001C37.1346 22.4 39.9999 25.2653 40 28.7998V37.6001C40 38.9255 38.9255 39.9999 37.6001 40H28.7998C25.2653 39.9999 22.3999 37.1346 22.3999 33.6001V28.7998C22.3998 27.6953 21.5044 26.7998 20.3999 26.7998H19.6001C18.4956 26.7998 17.6002 27.6953 17.6001 28.7998V33.6001C17.6001 37.1346 14.7347 39.9999 11.2002 40H2.39991C1.07449 39.9999 3.97232e-05 38.9255 0 37.6001V28.7998C0.000118127 25.2653 2.86539 22.4 6.3999 22.3999H11.2002C12.3047 22.3998 13.2002 21.5044 13.2002 20.3999V19.6001C13.2002 18.4956 12.3047 17.6002 11.2002 17.6001H6.3999C2.86538 17.6 9.39063e-05 14.7347 0 11.2002V2.3999C6.46793e-05 1.07451 1.07451 5.28641e-05 2.39991 0H11.2002Z';

// 16:9 art field. A fixed viewBox keeps the tiling identical at any rendered
// size (the AspectRatio wrapper enforces the ratio; the SVG slices to fill).
const VB_W = 160;
const VB_H = 90;

const styles = stylex.create({
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
});

// FNV-1a: small, stable string -> uint32 hash (matches no library; inline so
// the seed->art mapping is self-contained and deterministic across renders).
function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32: seeded PRNG so all randomized choices (layout, gradient position,
// accent marks) are a pure function of the seed.
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Cell {
  x: number;
  y: number;
  size: number;
}

// Even grid with a small gap. Denser for the larger feature card so the mark
// pixel size stays similar across card sizes.
function gridCells(feature: boolean): Cell[] {
  const cols = feature ? 13 : 11;
  const gap = 2;
  const margin = 1;
  const cell = (VB_W - margin * 2) / cols;
  const rows = Math.round((VB_H - margin * 2) / cell);
  const size = cell - gap;
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: margin + c * cell + gap / 2,
        y: margin + r * cell + gap / 2,
        size,
      });
    }
  }
  return cells;
}

// Phyllotaxis (sunflower) spiral: even, non-overlapping distribution that fades
// out toward the corners. x is stretched to fill the 16:9 field.
function spiralCells(feature: boolean): Cell[] {
  const count = feature ? 130 : 90;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const cx = VB_W / 2;
  const cy = VB_H / 2;
  const radial = feature ? 5.2 : 6;
  const size = feature ? 7.2 : 8.2;
  const cells: Cell[] = [];
  for (let n = 1; n <= count; n++) {
    const radius = radial * Math.sqrt(n);
    const theta = n * golden;
    const x = cx + radius * Math.cos(theta) * 1.55;
    const y = cy + radius * Math.sin(theta);
    if (x < -size || x > VB_W + size || y < -size || y > VB_H + size) {
      continue;
    }
    cells.push({x: x - size / 2, y: y - size / 2, size});
  }
  return cells;
}

export interface BlogCoverArtProps {
  /** Stable per-post seed (the slug) — same seed always yields the same art. */
  seed: string;
  /** Larger, denser layout for the featured card. */
  feature?: boolean;
}

export function BlogCoverArt({seed, feature = false}: BlogCoverArtProps) {
  const hash = hashString(seed);
  const rng = makeRng(hash);

  const useSpiral = rng() < 0.5;
  const cells = useSpiral ? spiralCells(feature) : gridCells(feature);

  // Seeded gradient blob centers: yellow low-left, pink high-right (mirrors the
  // home hero's Astryx aurora), each nudged within a corner-biased range so
  // every post's wash sits a little differently.
  const yellowX = 6 + rng() * 22;
  const yellowY = 68 + rng() * 24;
  const pinkX = 72 + rng() * 22;
  const pinkY = 8 + rng() * 22;

  // A few marks (scaled with card size) painted in the brand color.
  const accentCount = 3 + Math.floor(rng() * 3) + (feature ? 1 : 0);
  const accents = new Set<number>();
  while (accents.size < accentCount && accents.size < cells.length) {
    accents.add(Math.floor(rng() * cells.length));
  }

  const scale = (c: Cell) => c.size / 40;

  // Per-instance <defs> id suffix. Multiple covers render on one page (blog
  // index + home showcase), so shared ids would make every card's url(#…)
  // gradient refs resolve to the first card's defs. The suffix is derived from
  // the seed (unique per post, stable across SSR/client) to keep them distinct
  // without a render-time random that would cause hydration mismatch.
  const uid = `${hash.toString(36)}${feature ? 'f' : ''}`;
  const markId = `astryx-cover-mark-${uid}`;
  const yellowId = `astryx-cover-yellow-${uid}`;
  const pinkId = `astryx-cover-pink-${uid}`;

  return (
    <svg
      {...stylex.props(styles.svg)}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true">
      <defs>
        <path id={markId} d={MARK_PATH} />
        <radialGradient
          id={yellowId}
          cx={`${yellowX}%`}
          cy={`${yellowY}%`}
          r="75%">
          <stop offset="0%" stopColor="var(--color-background-yellow)" />
          <stop
            offset="100%"
            stopColor="var(--color-background-yellow)"
            stopOpacity="0"
          />
        </radialGradient>
        <radialGradient id={pinkId} cx={`${pinkX}%`} cy={`${pinkY}%`} r="70%">
          <stop offset="0%" stopColor="var(--color-background-pink)" />
          <stop
            offset="100%"
            stopColor="var(--color-background-pink)"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width={VB_W}
        height={VB_H}
        fill="var(--color-background-body)"
      />
      <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${yellowId})`} />
      <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${pinkId})`} />

      {cells.map((c, i) => {
        const isAccent = accents.has(i);
        return (
          <use
            key={i}
            href={`#${markId}`}
            transform={`translate(${c.x} ${c.y}) scale(${scale(c)})`}
            fill={isAccent ? 'var(--color-brand)' : 'var(--color-text-primary)'}
            opacity={isAccent ? 1 : 0.06}
          />
        );
      })}
    </svg>
  );
}

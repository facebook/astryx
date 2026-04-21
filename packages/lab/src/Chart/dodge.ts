/**
 * @file dodge.ts
 * @output Deterministic beeswarm layout — computes horizontal offsets to avoid dot overlap
 * @position Internal utility; used by XDSChartDot when dodge prop is set
 *
 * Algorithm: for each band, sort points by y, place each at center,
 * then shift left/right alternating if it overlaps a previously placed point.
 */

interface DodgeInput {
  /** Y pixel position for each point */
  yPixels: number[];
  /** Band key for each point (groups that dodge independently) */
  bands: string[];
  /** Center x pixel for each band */
  bandCenters: Map<string, number>;
  /** Max half-width a dot can be displaced (half the band width) */
  bandHalfWidth: number;
  /** Dot radius */
  radius: number;
  /** Padding between dots */
  padding?: number;
}

interface DodgeResult {
  /** Computed x pixel for each point (same indexing as input) */
  x: number[];
}

export function dodgeLayout({
  yPixels,
  bands,
  bandCenters,
  bandHalfWidth,
  radius,
  padding = 1,
}: DodgeInput): DodgeResult {
  const n = yPixels.length;
  const resultX = new Array<number>(n);
  const diameter = (radius + padding) * 2;

  // Group indices by band
  const groups = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const band = bands[i];
    let arr = groups.get(band);
    if (!arr) {
      arr = [];
      groups.set(band, arr);
    }
    arr.push(i);
  }

  // For each band, run dodge
  for (const [band, indices] of groups) {
    const cx = bandCenters.get(band) ?? 0;

    // Sort by y position
    const sorted = [...indices].sort((a, b) => yPixels[a] - yPixels[b]);

    // Placed dots: {x, y} in pixel space
    const placed: {x: number; y: number}[] = [];

    for (const idx of sorted) {
      const py = yPixels[idx];
      let bestX = cx;

      // Check if center position overlaps any placed dot
      let attempt = 0;
      let direction = 1;
      let offset = 0;

      while (attempt < 200) {
        const candidateX = cx + offset;
        let overlaps = false;

        for (const p of placed) {
          const dx = candidateX - p.x;
          const dy = py - p.y;
          if (dx * dx + dy * dy < diameter * diameter) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          bestX = candidateX;
          break;
        }

        // Alternate: +1, -1, +2, -2, +3, -3...
        attempt++;
        if (direction > 0) {
          offset = direction * Math.ceil(attempt / 2) * (radius + padding);
          direction = -1;
        } else {
          offset = direction * Math.ceil(attempt / 2) * (radius + padding);
          direction = 1;
        }
      }

      // Clamp within band
      bestX = Math.max(
        cx - bandHalfWidth + radius,
        Math.min(cx + bandHalfWidth - radius, bestX),
      );

      resultX[idx] = bestX;
      placed.push({x: bestX, y: py});
    }
  }

  return {x: resultX};
}

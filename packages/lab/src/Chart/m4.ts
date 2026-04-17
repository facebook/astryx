/**
 * @file m4.ts
 * @output m4Reduce — pixel-aware time series data reduction
 * @position Utility consumed by chart line/stream components for large datasets
 *
 * Implements the M4 algorithm from "M4: A Visualization-Oriented Time Series
 * Data Aggregation" (Jugel et al., VLDB 2014).
 *
 * For each pixel column, retains 4 values: first, last, min, max.
 * This is the minimum set needed to visually reproduce a line chart at the
 * target resolution. A 1M-point dataset becomes ~4×width points.
 */

export interface M4Point {
  x: number;
  y: number;
}

/**
 * Reduce a time-series dataset to at most 4 points per pixel column.
 *
 * The output preserves all visual features (peaks, troughs, trends) that
 * are distinguishable at the given pixel width. Points within the same
 * pixel column are collapsed to first/min/max/last.
 *
 * @param data — input points, must be sorted by x ascending
 * @param width — chart width in pixels (determines bucket count)
 * @param xDomain — [min, max] of the x-axis. If omitted, derived from data.
 * @returns reduced points (at most 4 × width, typically much fewer)
 *
 * @example
 * ```
 * // Reduce 100k points to fit a 600px chart
 * const reduced = m4Reduce(rawData, 600);
 * ```
 */
export function m4Reduce(
  data: M4Point[],
  width: number,
  xDomain?: [number, number],
): M4Point[] {
  if (data.length === 0 || width <= 0) return [];

  // If data fits without reduction, return as-is
  if (data.length <= width * 4) return data;

  const xMin = xDomain ? xDomain[0] : data[0].x;
  const xMax = xDomain ? xDomain[1] : data[data.length - 1].x;
  const xRange = xMax - xMin;
  if (xRange <= 0) return [data[0]];

  const bucketCount = Math.ceil(width);

  // Each bucket tracks: first, last, min, max
  interface Bucket {
    first: M4Point | null;
    last: M4Point | null;
    min: M4Point | null;
    max: M4Point | null;
  }

  const buckets: Bucket[] = Array.from({length: bucketCount}, () => ({
    first: null,
    last: null,
    min: null,
    max: null,
  }));

  // Single pass through the data
  for (const point of data) {
    const bucketIdx = Math.min(
      bucketCount - 1,
      Math.floor(((point.x - xMin) / xRange) * bucketCount),
    );
    const bucket = buckets[bucketIdx];

    if (!bucket.first) {
      bucket.first = point;
      bucket.last = point;
      bucket.min = point;
      bucket.max = point;
    } else {
      bucket.last = point;
      if (point.y < bucket.min!.y) bucket.min = point;
      if (point.y > bucket.max!.y) bucket.max = point;
    }
  }

  // Emit points in order: first, min, max, last per bucket
  // Sort min/max by x within bucket to maintain temporal order
  const result: M4Point[] = [];

  for (const bucket of buckets) {
    if (!bucket.first) continue;

    const points = [bucket.first, bucket.min!, bucket.max!, bucket.last!];

    // Deduplicate (some may be the same point)
    const seen = new Set<M4Point>();
    const unique: M4Point[] = [];
    for (const p of points) {
      if (!seen.has(p)) {
        seen.add(p);
        unique.push(p);
      }
    }

    // Sort by x to maintain line continuity
    unique.sort((a, b) => a.x - b.x);
    result.push(...unique);
  }

  return result;
}

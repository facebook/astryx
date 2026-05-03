/**
 * @file pathTransforms.ts
 * @description SVG path manipulation utilities for XIF personality axes.
 *
 * Implements corner rounding, segment curvature, and tension adjustments
 * as relative (percentile) transforms on parsed SVG path data.
 *
 * All transforms preserve the artist's hierarchy — sharp corners shift
 * more than gentle ones, straight lines shift more than existing curves.
 */

// =============================================================================
// Path Parser (minimal, handles M/L/H/V/C/Q/A/Z)
// =============================================================================

interface Point {
  x: number;
  y: number;
}

type PathCommand =
  | {type: 'M'; x: number; y: number}
  | {type: 'L'; x: number; y: number}
  | {
      type: 'C';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x: number;
      y: number;
    }
  | {type: 'Q'; cx: number; cy: number; x: number; y: number}
  | {
      type: 'A';
      rx: number;
      ry: number;
      rotation: number;
      large: number;
      sweep: number;
      x: number;
      y: number;
    }
  | {type: 'Z'};

/**
 * Parse an SVG path d-string into an array of absolute commands.
 * Normalizes H/V → L for uniform processing.
 */
function parsePath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  // Match command letter + all following numbers (including negatives and decimals)
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match: RegExpExecArray | null;
  let cx = 0,
    cy = 0; // current position
  let sx = 0,
    sy = 0; // subpath start

  while ((match = re.exec(d)) !== null) {
    const cmd = match[1];
    const args = (match[2].match(/-?[\d.]+(?:e[+-]?\d+)?/gi) || []).map(Number);

    switch (cmd) {
      case 'M':
        cx = args[0];
        cy = args[1];
        sx = cx;
        sy = cy;
        commands.push({type: 'M', x: cx, y: cy});
        // Implicit L for additional coordinate pairs
        for (let i = 2; i < args.length; i += 2) {
          cx = args[i];
          cy = args[i + 1];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'm':
        cx += args[0];
        cy += args[1];
        sx = cx;
        sy = cy;
        commands.push({type: 'M', x: cx, y: cy});
        for (let i = 2; i < args.length; i += 2) {
          cx += args[i];
          cy += args[i + 1];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          cx = args[i];
          cy = args[i + 1];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'l':
        for (let i = 0; i < args.length; i += 2) {
          cx += args[i];
          cy += args[i + 1];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'H':
        for (let i = 0; i < args.length; i++) {
          cx = args[i];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'h':
        for (let i = 0; i < args.length; i++) {
          cx += args[i];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'V':
        for (let i = 0; i < args.length; i++) {
          cy = args[i];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'v':
        for (let i = 0; i < args.length; i++) {
          cy += args[i];
          commands.push({type: 'L', x: cx, y: cy});
        }
        break;
      case 'C':
        for (let i = 0; i < args.length; i += 6) {
          commands.push({
            type: 'C',
            x1: args[i],
            y1: args[i + 1],
            x2: args[i + 2],
            y2: args[i + 3],
            x: args[i + 4],
            y: args[i + 5],
          });
          cx = args[i + 4];
          cy = args[i + 5];
        }
        break;
      case 'c':
        for (let i = 0; i < args.length; i += 6) {
          commands.push({
            type: 'C',
            x1: cx + args[i],
            y1: cy + args[i + 1],
            x2: cx + args[i + 2],
            y2: cy + args[i + 3],
            x: cx + args[i + 4],
            y: cy + args[i + 5],
          });
          cx += args[i + 4];
          cy += args[i + 5];
        }
        break;
      case 'Q':
        for (let i = 0; i < args.length; i += 4) {
          commands.push({
            type: 'Q',
            cx: args[i],
            cy: args[i + 1],
            x: args[i + 2],
            y: args[i + 3],
          });
          cx = args[i + 2];
          cy = args[i + 3];
        }
        break;
      case 'q':
        for (let i = 0; i < args.length; i += 4) {
          commands.push({
            type: 'Q',
            cx: cx + args[i],
            cy: cy + args[i + 1],
            x: cx + args[i + 2],
            y: cy + args[i + 3],
          });
          cx += args[i + 2];
          cy += args[i + 3];
        }
        break;
      case 'A':
      case 'a': {
        const rel = cmd === 'a';
        for (let i = 0; i < args.length; i += 7) {
          const nx = rel ? cx + args[i + 5] : args[i + 5];
          const ny = rel ? cy + args[i + 6] : args[i + 6];
          commands.push({
            type: 'A',
            rx: args[i],
            ry: args[i + 1],
            rotation: args[i + 2],
            large: args[i + 3],
            sweep: args[i + 4],
            x: nx,
            y: ny,
          });
          cx = nx;
          cy = ny;
        }
        break;
      }
      case 'S':
      case 's':
        // Smooth cubic — convert to C (simplified: treat as C with reflected control point)
        // For our purposes, pass through as-is since we mainly transform L→L corners
        break;
      case 'T':
      case 't':
        // Smooth quadratic — similar, pass through
        break;
      case 'Z':
      case 'z':
        commands.push({type: 'Z'});
        cx = sx;
        cy = sy;
        break;
    }
  }

  return commands;
}

// =============================================================================
// Utilities
// =============================================================================

function dist(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function lerp(a: Point, b: Point, t: number): Point {
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
}

function angleBetween(v1: Point, v2: Point): number {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
  if (mag1 === 0 || mag2 === 0) return Math.PI;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
}

function getEndpoint(cmd: PathCommand): Point | null {
  if (cmd.type === 'Z') return null;
  return {x: cmd.x, y: cmd.y};
}

// =============================================================================
// Corner Rounding
// =============================================================================

/**
 * Round corners at L→L junctions by inserting quadratic bezier curves.
 *
 * @param d - SVG path d-string
 * @param cornerRounding - 0-1 percentile. 0 = sharp (no change). 1 = max rounding.
 * @returns Modified d-string with rounded corners
 */
export function roundCorners(d: string, cornerRounding: number): string {
  if (cornerRounding <= 0) return d;
  cornerRounding = Math.min(1, cornerRounding);

  const cmds = parsePath(d);
  const result: PathCommand[] = [];

  // Pre-pass: find the last L before each Z to handle closed path corners
  // We need to round: last-L → Z → M (the closing corner)
  // and also: M → first-L (the opening corner, if preceded by Z-closed path)

  for (let i = 0; i < cmds.length; i++) {
    const prev = i > 0 ? cmds[i - 1] : null;
    const curr = cmds[i];
    const next = i < cmds.length - 1 ? cmds[i + 1] : null;

    // Handle Z: insert rounding for the closing corner
    // The corner is: last point → subpath start (M) → first L after M
    if (curr.type === 'Z' && prev && (prev.type === 'L' || prev.type === 'Q')) {
      // Find the M that started this subpath
      let mIdx = i - 1;
      while (mIdx >= 0 && cmds[mIdx].type !== 'M') mIdx--;
      if (mIdx >= 0) {
        const mCmd = cmds[mIdx];
        const mPt = getEndpoint(mCmd)!;
        const prevPt = getEndpoint(prev)!;
        // Find the first L after M
        let firstL = mIdx + 1;
        while (firstL < cmds.length && cmds[firstL].type !== 'L') firstL++;
        if (firstL < cmds.length) {
          const firstLPt = getEndpoint(cmds[firstL])!;

          const d1 = dist(prevPt, mPt);
          const d2 = dist(mPt, firstLPt);
          const maxR = Math.min(d1, d2) / 2;

          const v1: Point = {x: prevPt.x - mPt.x, y: prevPt.y - mPt.y};
          const v2: Point = {x: firstLPt.x - mPt.x, y: firstLPt.y - mPt.y};
          const ang = angleBetween(v1, v2);
          const sharp = 1 - ang / Math.PI;
          const r = maxR * cornerRounding * sharp * 0.85;

          if (r >= 0.1) {
            const t1 = r / d1;
            const t2 = r / d2;
            const pb1 = lerp(mPt, prevPt, t1);
            const pb2 = lerp(mPt, firstLPt, t2);

            // Insert L to pull-back, Q through M, then Z
            result.push({type: 'L', x: pb1.x, y: pb1.y});
            result.push({type: 'Q', cx: mPt.x, cy: mPt.y, x: pb2.x, y: pb2.y});
            result.push({type: 'Z'});
            continue;
          }
        }
      }
      result.push(curr);
      continue;
    }

    // Only round L commands that have L or M before and L or Z after
    if (
      curr.type === 'L' &&
      prev &&
      (prev.type === 'L' || prev.type === 'M' || prev.type === 'Q') &&
      next &&
      (next.type === 'L' || next.type === 'Z')
    ) {
      const prevPt = getEndpoint(prev)!;
      const cornerPt: Point = {x: curr.x, y: curr.y};
      const nextPt =
        next.type === 'Z'
          ? getEndpoint(cmds.find(c => c.type === 'M')!)!
          : getEndpoint(next)!;

      const d1 = dist(prevPt, cornerPt);
      const d2 = dist(cornerPt, nextPt);
      const maxRadius = Math.min(d1, d2) / 2;

      // Compute angle to determine sharpness
      const v1: Point = {x: prevPt.x - cornerPt.x, y: prevPt.y - cornerPt.y};
      const v2: Point = {x: nextPt.x - cornerPt.x, y: nextPt.y - cornerPt.y};
      const angle = angleBetween(v1, v2);

      // Proportional rounding: sharper corners round MORE, gentle corners round LESS.
      //
      // Sharpness = 1 - (angle / π). Range: 0 (flat/180°) to 1 (fully acute/0°).
      // Linear scaling with sharpness — at cornerRounding=1, a 90° corner
      // uses 50% of maxRadius. Gentler corners get proportionally less.
      // The 0.85 multiplier prevents full radius (which would make very
      // short segments disappear) while still being visually bold.
      const sharpness = 1 - angle / Math.PI;
      const radius = maxRadius * cornerRounding * sharpness * 0.85;

      if (radius < 0.1) {
        // Too small to round, keep original
        result.push(curr);
        continue;
      }

      // Pull back from corner along each segment
      const t1 = radius / d1;
      const t2 = radius / d2;
      const pullBack1 = lerp(cornerPt, prevPt, t1);
      const pullBack2 = lerp(cornerPt, nextPt, t2);

      // L to the pull-back point, then Q through the corner to the other pull-back
      result.push({type: 'L', x: pullBack1.x, y: pullBack1.y});
      result.push({
        type: 'Q',
        cx: cornerPt.x,
        cy: cornerPt.y,
        x: pullBack2.x,
        y: pullBack2.y,
      });
    } else {
      result.push(curr);
    }
  }

  return serializePath(result);
}

// =============================================================================
// Segment Curvature
// =============================================================================

/**
 * Bow straight line segments by replacing L with Q.
 *
 * @param d - SVG path d-string
 * @param curvature - 0-1 percentile. 0 = straight. 1 = max bow.
 * @returns Modified d-string with curved segments
 */
export function addCurvature(d: string, curvature: number): string {
  if (curvature <= 0) return d;
  curvature = Math.min(1, curvature);

  const cmds = parsePath(d);
  const result: PathCommand[] = [];

  for (let i = 0; i < cmds.length; i++) {
    const prev = i > 0 ? cmds[i - 1] : null;
    const curr = cmds[i];

    if (curr.type === 'L' && prev) {
      const prevPt = getEndpoint(prev);
      if (!prevPt) {
        result.push(curr);
        continue;
      }

      const endPt: Point = {x: curr.x, y: curr.y};
      const segLen = dist(prevPt, endPt);

      // Only bow segments longer than a threshold
      if (segLen < 2) {
        result.push(curr);
        continue;
      }

      // Midpoint
      const mid = lerp(prevPt, endPt, 0.5);

      // Perpendicular direction
      const dx = endPt.x - prevPt.x;
      const dy = endPt.y - prevPt.y;
      const perpX = -dy / segLen;
      const perpY = dx / segLen;

      // Offset = segment length × curvature × scale factor
      const offset = segLen * curvature * 0.25;

      // Control point offset perpendicular to the line
      const cp: Point = {
        x: mid.x + perpX * offset,
        y: mid.y + perpY * offset,
      };

      result.push({type: 'Q', cx: cp.x, cy: cp.y, x: endPt.x, y: endPt.y});
    } else {
      result.push(curr);
    }
  }

  return serializePath(result);
}

// =============================================================================
// Tension
// =============================================================================

/**
 * Adjust tension on existing bezier curves.
 *
 * @param d - SVG path d-string
 * @param tension - 0-1. 0 = loose (curves balloon). 0.5 = unchanged. 1 = tight.
 * @returns Modified d-string
 */
export function adjustTension(d: string, tension: number): string {
  if (tension === 0.5) return d;

  const cmds = parsePath(d);
  const result: PathCommand[] = [];
  // Scale factor: tension 0 → 1.5 (looser), tension 0.5 → 1.0, tension 1 → 0.5 (tighter)
  const scale = 1.5 - tension;

  for (let i = 0; i < cmds.length; i++) {
    const prev = i > 0 ? cmds[i - 1] : null;
    const curr = cmds[i];

    if (curr.type === 'C' && prev) {
      const start = getEndpoint(prev) || {x: 0, y: 0};
      const end: Point = {x: curr.x, y: curr.y};

      // Scale control points relative to their anchor
      const cp1: Point = {
        x: start.x + (curr.x1 - start.x) * scale,
        y: start.y + (curr.y1 - start.y) * scale,
      };
      const cp2: Point = {
        x: end.x + (curr.x2 - end.x) * scale,
        y: end.y + (curr.y2 - end.y) * scale,
      };

      result.push({
        type: 'C',
        x1: cp1.x,
        y1: cp1.y,
        x2: cp2.x,
        y2: cp2.y,
        x: end.x,
        y: end.y,
      });
    } else if (curr.type === 'Q' && prev) {
      const start = getEndpoint(prev) || {x: 0, y: 0};
      const end: Point = {x: curr.x, y: curr.y};
      const mid = lerp(start, end, 0.5);

      // Scale control point relative to the midpoint of the chord
      const cp: Point = {
        x: mid.x + (curr.cx - mid.x) * scale,
        y: mid.y + (curr.cy - mid.y) * scale,
      };

      result.push({type: 'Q', cx: cp.x, cy: cp.y, x: end.x, y: end.y});
    } else {
      result.push(curr);
    }
  }

  return serializePath(result);
}

// =============================================================================
// Combined Transform
// =============================================================================

export interface PathPersonality {
  cornerRounding?: number;
  segmentCurvature?: number;
  tension?: number;
}

/**
 * Apply all personality transforms to a path d-string.
 * Order: corner rounding → segment curvature → tension.
 */
export function applyPersonality(
  d: string,
  personality: PathPersonality,
): string {
  let result = d;
  if (personality.cornerRounding != null && personality.cornerRounding > 0) {
    result = roundCorners(result, personality.cornerRounding);
  }
  if (
    personality.segmentCurvature != null &&
    personality.segmentCurvature > 0
  ) {
    result = addCurvature(result, personality.segmentCurvature);
  }
  if (personality.tension != null && personality.tension !== 0.5) {
    result = adjustTension(result, personality.tension);
  }
  return result;
}

// =============================================================================
// Serializer
// =============================================================================

function n(v: number): string {
  return Number(v.toFixed(3)).toString();
}

function serializePath(cmds: PathCommand[]): string {
  return cmds
    .map(cmd => {
      switch (cmd.type) {
        case 'M':
          return `M${n(cmd.x)} ${n(cmd.y)}`;
        case 'L':
          return `L${n(cmd.x)} ${n(cmd.y)}`;
        case 'C':
          return `C${n(cmd.x1)} ${n(cmd.y1)} ${n(cmd.x2)} ${n(cmd.y2)} ${n(cmd.x)} ${n(cmd.y)}`;
        case 'Q':
          return `Q${n(cmd.cx)} ${n(cmd.cy)} ${n(cmd.x)} ${n(cmd.y)}`;
        case 'A':
          return `A${n(cmd.rx)} ${n(cmd.ry)} ${n(cmd.rotation)} ${cmd.large} ${cmd.sweep} ${n(cmd.x)} ${n(cmd.y)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}

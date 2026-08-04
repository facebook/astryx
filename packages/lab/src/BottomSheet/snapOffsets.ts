// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file snapOffsets.ts
 * @input Pure geometry helpers — no React, no DOM.
 * @output Converts snap points to translateY offsets for the sheet surface.
 * @position Internal to BottomSheet; consumed by useSheetGestures, tested by
 *   snapOffsets.test.ts.
 *
 * The sheet is rendered at its full (fully-open) height and *translated down*
 * to express shorter detents — translate is GPU-composited, so this is cheaper
 * than animating layout height. A detent is therefore a translateY offset in
 * px from the fully-open position (0 = fully open, larger = more collapsed).
 * These helpers turn snap points into that offset list; they are pure so the
 * geometry can be unit-tested without a DOM.
 */

/**
 * Detents whose resting offsets land within this many px of each other are
 * treated as the same stop (the taller one wins). Stops the sheet from having
 * two near-identical rest positions — e.g. when a content-hugging height sits
 * a hair away from a fractional snap point.
 */
export const DETENT_DEDUP_PX = 48;

/** Resolve snap points given as viewport fractions (0, 1] to px heights. */
export function snapFractionsToHeights(
  fractions: readonly number[],
  viewportPx: number,
): number[] {
  return fractions.filter(f => f > 0 && f <= 1).map(f => f * viewportPx);
}

/**
 * Given the sheet's full height (px, as rendered fully open) and a set of
 * candidate detent *visible heights* (px), return the resting translateY
 * offsets from fully-open, ascending and de-duplicated.
 *
 * - `0` (fully open) is always the first detent.
 * - Only heights strictly shorter than the sheet become collapsed detents; a
 *   height >= the sheet can't be shown by translating down, so it's dropped.
 * - Offsets closer than `dedupPx` collapse to the smaller (taller) offset, so
 *   near-identical detents — e.g. a hug height ≈ a snap point — become one stop.
 */
export function computeDetentOffsets(
  sheetHeight: number,
  detentHeights: readonly number[],
  dedupPx: number = DETENT_DEDUP_PX,
): number[] {
  const collapsed = detentHeights
    .filter(h => h > 0 && h < sheetHeight)
    .map(h => sheetHeight - h);
  const ascending = [0, ...collapsed].sort((a, b) => a - b);

  const deduped: number[] = [];
  for (const offset of ascending) {
    const last = deduped[deduped.length - 1];
    if (last === undefined || offset - last >= dedupPx) {
      deduped.push(offset);
    }
  }
  return deduped;
}

/** Nearest value in `offsets` to `value` (offsets must be non-empty). */
export function nearestOffset(
  value: number,
  offsets: readonly number[],
): number {
  return offsets.reduce(
    (best, o) => (Math.abs(o - value) < Math.abs(best - value) ? o : best),
    offsets[0],
  );
}

/**
 * Scrim opacity (1 = fully visible, 0 = hidden) for a drag/settle `offset`.
 * The scrim stays full while the sheet is at or above its second-shortest
 * detent, then fades to 0 as it collapses onto the shortest ("peek") detent —
 * a glance state that reveals the content behind — and stays hidden below it.
 * A single-detent sheet has no peek, so it instead fades across the dismiss
 * overshoot toward `dismissOffset`.
 */
export function scrimOpacityForOffset(
  offset: number,
  offsets: readonly number[],
  dismissOffset: number,
): number {
  const shortest = offsets[offsets.length - 1];
  const fadeStart = offsets.length >= 2 ? offsets[offsets.length - 2] : 0;
  const fadeEnd = offsets.length >= 2 ? shortest : dismissOffset;
  if (offset <= fadeStart) {
    return 1;
  }
  if (offset >= fadeEnd) {
    return 0;
  }
  return 1 - (offset - fadeStart) / (fadeEnd - fadeStart);
}

/**
 * Settle target for a released drag. Restricts candidates to the drag
 * direction so a committed drag never snaps *back past* where it started
 * (a down-drag settles at/below the start, an up-drag at/above), then picks
 * the nearest remaining detent. `dir`: 1 = dragged down, -1 = up, 0 = neither.
 */
export function resolveSettleOffset(
  value: number,
  offsets: readonly number[],
  dir: number,
  baseOffset: number,
): number {
  let candidates = offsets;
  if (dir > 0) {
    const downward = offsets.filter(o => o >= baseOffset);
    if (downward.length > 0) {
      candidates = downward;
    }
  } else if (dir < 0) {
    const upward = offsets.filter(o => o <= baseOffset);
    if (upward.length > 0) {
      candidates = upward;
    }
  }
  return nearestOffset(value, candidates);
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file streaming.ts
 * @input Boundary tracking and segment splitting for streaming fade-in animation
 * @output Exports computeBoundaries, computeSegments, and StreamingCursor type
 * @position Utility module; pure logic extracted from Markdown for testability
 */

/**
 * A segment of text produced by splitting at boundary positions.
 * Each segment either "settled" (fully visible) or "fading" (has an animation).
 */
export interface TextSegment {
  /** Stable key for React reconciliation. Never changes for a segment's lifetime. */
  key: string;
  /** The text content of this segment */
  text: string;
  /** Whether this segment should have the fade-in animation */
  fading: boolean;
}

/**
 * Compute the updated boundaries ring buffer given a new rendered text length.
 *
 * Each time the rendered text grows, we push the previous length as a new boundary.
 * The ring buffer is capped at `maxSpans` entries. Evicted boundaries' text becomes
 * "settled" (fully visible, no animation).
 *
 * @param prevBoundaries - The current boundaries array
 * @param prevRenderedLen - The rendered text length from the previous render
 * @param maxSpans - Maximum number of concurrent animating spans
 * @returns Updated boundaries array (new reference only if changed)
 */
export function computeBoundaries(
  prevBoundaries: number[],
  prevRenderedLen: number,
  maxSpans: number,
): number[] {
  // Only push if the boundary actually advanced
  if (
    prevBoundaries.length === 0 ||
    prevRenderedLen > prevBoundaries[prevBoundaries.length - 1]
  ) {
    const next = [...prevBoundaries, prevRenderedLen];
    while (next.length > maxSpans) {
      next.shift();
    }
    return next;
  }
  return prevBoundaries;
}

/**
 * Split a text node into segments based on boundary positions.
 *
 * Each boundary defines the start of a fade span. The span covers from that
 * boundary to the next boundary (or end of text for the last boundary).
 * Text before the oldest boundary is "settled" (no animation).
 *
 * Key stability guarantees:
 * - Settled text always gets key `settled-{nodeKey}`
 * - Each fade span gets key `fade-{nodeKey}-b{boundaryValue}`
 * - A span's key never changes once created — it stays the same until evicted
 * - When a boundary is evicted, its text merges into the settled segment
 *
 * @param content - The full text content of the node
 * @param startOffset - The cursor offset where this node starts
 * @param boundaries - The current boundaries array
 * @param nodeKey - The React key for this text node (usually its index)
 * @returns Array of segments, or null if no splitting needed (all settled)
 */
export function computeSegments(
  content: string,
  startOffset: number,
  boundaries: number[],
  nodeKey: string | number,
): TextSegment[] | null {
  const endOffset = startOffset + content.length;

  if (boundaries.length === 0) {
    return null;
  }

  const oldestBoundary = boundaries[0];

  // Entirely before the oldest boundary — fully settled
  if (endOffset <= oldestBoundary) {
    return null;
  }

  const segments: TextSegment[] = [];
  let pos = startOffset;

  // Text before the oldest boundary — settled
  if (pos < oldestBoundary && oldestBoundary < endOffset) {
    segments.push({
      key: `settled-${nodeKey}`,
      text: content.slice(0, oldestBoundary - startOffset),
      fading: false,
    });
    pos = oldestBoundary;
  }

  // Each boundary gets a span
  for (let i = 0; i < boundaries.length; i++) {
    const bStart = boundaries[i];
    const bEnd = i + 1 < boundaries.length ? boundaries[i + 1] : endOffset;

    if (bStart >= endOffset || bEnd <= pos) {
      continue;
    }

    const clampedStart = Math.max(bStart, pos);
    const clampedEnd = Math.min(bEnd, endOffset);

    if (clampedStart >= clampedEnd) {
      continue;
    }

    segments.push({
      key: `fade-${nodeKey}-b${bStart}`,
      text: content.slice(clampedStart - startOffset, clampedEnd - startOffset),
      fading: true,
    });
    pos = clampedEnd;
  }

  return segments.length > 0 ? segments : null;
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StepStatus.ts
 * @input None
 * @output Exports StepStatus type
 * @position Shared type used by Step and the stepper docs
 */

/**
 * Semantic status for a step, mapped directly onto the Astryx global semantic
 * tokens. In the default `auto` indicator mode it sets both the indicator color
 * and a matching glyph (see below); it never recolors the connector/track.
 *
 * Plain string values aligned with the global token semantics:
 * - 'accent'  → `--color-accent`  (default emphasis / in-progress; color only)
 * - 'success' → `--color-success` (green check-circle glyph)
 * - 'warning' → `--color-warning` (shared Input `warning` glyph)
 * - 'error'   → `--color-error`   (shared Input `error` glyph)
 *
 * `status` is intentionally NOT a lifecycle enum (completed/active/etc.) — the
 * step's progress is derived from the parent's `activeStep`. The current
 * (in-progress) step always keeps its current-step indicator regardless of
 * `status`.
 */
export type StepStatus = 'accent' | 'success' | 'warning' | 'error';

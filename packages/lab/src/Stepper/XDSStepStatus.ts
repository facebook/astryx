// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSStepStatus.ts
 * @input None
 * @output Exports XDSStepStatus type
 * @position Shared type used by XDSStep and the stepper docs
 */

/**
 * Semantic color status for a step. Controls **color only** — it maps directly
 * onto the XDS global semantic color tokens and does not change layout,
 * iconography, or behavior.
 *
 * Plain string values aligned with the global token semantics:
 * - 'accent'  → `--color-accent`  (default emphasis / in-progress)
 * - 'success' → `--color-success` (a positively-resolved step)
 * - 'warning' → `--color-warning` (needs attention)
 * - 'error'   → `--color-error`   (must be resolved)
 *
 * `status` is intentionally NOT a lifecycle enum (completed/active/etc.) — the
 * step's progress is derived from the parent's `activeStep`. Use `status` only
 * when you want to tint a step with a specific semantic color, e.g.
 * `status="error"`.
 */
export type XDSStepStatus = 'accent' | 'success' | 'warning' | 'error';

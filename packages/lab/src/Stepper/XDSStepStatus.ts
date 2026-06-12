// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSStepStatus.ts
 * @input None
 * @output Exports XDSStepStatus type
 * @position Shared type used by XDSStep, XDSStepGroup, and context
 */

/**
 * The status for a given step.
 *
 * Uses plain string values aligned with XDS semantic tokens:
 * - 'not-started': Step has not been started yet
 * - 'in-progress': Step is currently in progress (active)
 * - 'completed': Step has been completed successfully
 * - 'skipped': Step was deliberately skipped
 * - 'warning': Step has a warning that needs attention
 * - 'error': Step has an error that must be resolved
 *
 * When not explicitly set, status is auto-derived from the parent's activeStep:
 * - step < activeStep → 'completed'
 * - step === activeStep → 'in-progress'
 * - step > activeStep → 'not-started'
 */
export type XDSStepStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'skipped'
  | 'warning'
  | 'error';

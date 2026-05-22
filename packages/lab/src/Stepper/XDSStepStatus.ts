// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSStepStatus.ts
 * @input None
 * @output Exports XDSStepStatus enum
 * @position Shared type used by XDSStep, XDSStepGroup, and context
 */

/**
 * The status for a given step.
 *
 * When not explicitly set, status is auto-derived from the parent's activeStep:
 * - step < activeStep → Completed
 * - step === activeStep → InProgress
 * - step > activeStep → NotStarted
 */
export const XDSStepStatus = {
  /** Step has not been started yet */
  NotStarted: 'not-started',
  /** Step is currently in progress (active) */
  InProgress: 'in-progress',
  /** Step has been completed successfully */
  Completed: 'completed',
  /** Step was deliberately skipped */
  Skipped: 'skipped',
  /** Step has a warning that needs attention */
  Warning: 'warning',
  /** Step has an error that must be resolved */
  Error: 'error',
} as const;

export type XDSStepStatus = (typeof XDSStepStatus)[keyof typeof XDSStepStatus];

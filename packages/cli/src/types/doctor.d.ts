// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Doctor command JSON responses.
 *
 * Invocation                  -> type discriminator
 * --------------------------------------------------
 * xds --json doctor           -> doctor
 */

/** Outcome of a single diagnostic check. */
export type DoctorStatus = 'pass' | 'warn' | 'fail' | 'info';

/** A single diagnostic check result. */
export interface DoctorCheck {
  /** Stable machine-readable id (e.g. 'node-version'). */
  id: string;
  /** Human-readable check name. */
  label: string;
  status: DoctorStatus;
  /** One-line result summary. */
  message: string;
  /** Actionable remediation, present when status is not 'pass'. */
  fix?: string;
}

/** Aggregate counts per status. */
export interface DoctorSummary {
  pass: number;
  warn: number;
  fail: number;
  info: number;
}

/** xds --json doctor */
export interface DoctorResponse {
  type: 'doctor';
  data: {
    checks: DoctorCheck[];
    summary: DoctorSummary;
  };
}

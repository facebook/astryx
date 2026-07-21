// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Re-exports the public aria-spec surface
 * @output types, runner, coverage report, jsdom harness, and authored patterns
 * @position Entry point for @astryxdesign/aria-spec; consumed by component binding
 *   tests and the coverage tooling
 *
 * SYNC: When a new pattern or harness is added, export it here and update README.md
 */

export * from './types';
export {runContract, contractHasBlockingFailure} from './runner/runContract';
export type {RunContractOptions} from './runner/runContract';
export {
  collectCoverage,
  formatCoverageSummary,
  type CoverageMatrix,
  type ComponentCoverage,
} from './report/coverage';
export {createJsdomHarness} from './harness/jsdomHarness';

// Authored pattern contracts.
export {switchContract} from './patterns/switch';

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Re-exports the browser-free surface of @astryxdesign/a11y-spec
 * @output Contract vocabulary, completeness checklist, harness seam, runner,
 *   report, the jsdom harness, and the authored pattern contracts. A pattern
 *   exports a helper here only when a BINDING needs it — a helper the contract
 *   uses internally stays module-private.
 * @position Package entry point. The Chromium harness is deliberately NOT here:
 *   it imports Playwright, and the jsdom lane must never drag a browser in. It
 *   is a separate entry, `@astryxdesign/a11y-spec/chromium`.
 *
 * SYNC: When a pattern is authored, export it here and list it in README.md
 */

export {
  NotApplicableHere,
  citeSource,
  definePattern,
  describeExpectation,
  requiredLayers,
  unansweredDimensions,
  type ApgRequirement,
  type Applicability,
  type AstryxRecord,
  type Enforcement,
  type Expectation,
  type ExpectationContext,
  type NormativeSource,
  type PatternContract,
  type WcagCriterion,
} from './contract';

export {
  CHECKLIST_DIMENSIONS,
  type ChecklistDimension,
  type ChecklistDimensionId,
  type ChecklistExemption,
} from './checklist';

export {
  EVIDENCE_LAYERS,
  UnobservableError,
  type ComputedNode,
  type EvidenceLayer,
  type Harness,
  type Key,
  type Subject,
} from './harness';

export {
  MissingBindingCapability,
  runBinding,
  type BindingResult,
  type ExpectationResult,
  type KnownFailure,
  type ResultStatus,
  type RunBindingOptions,
} from './run';

export {
  blockingResults,
  formatFailures,
  neverExercised,
  formatReport,
  summarize,
  type Report,
  type ReportCounts,
} from './report';

export {createJsdomHarness, type JsdomHarnessOptions} from './harness/jsdom';

export {CHECKBOX_PATTERN, type CheckboxStateFacts} from './patterns/checkbox';

export {SWITCH_PATTERN, type SwitchStateFacts} from './patterns/switch';

export {saysInOrder, spokenWords} from './spoken';

export {BUTTON_PATTERN, type ButtonStateFacts} from './patterns/button';

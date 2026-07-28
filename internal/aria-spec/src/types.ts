// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None (pure type/enum declarations)
 * @output Core aria-spec types: ExpectationPriority, Expectation, PatternContract,
 *   ContractResult, and the AriaHarness runtime adapter interface
 * @position Foundation of the aria-spec package; every pattern, runner, and
 *   harness adapter imports from here
 *
 * SYNC: When modified, update internal/aria-spec/README.md
 */

/**
 * How much a failing expectation matters. CI gates on BLOCKER only; the rest are
 * reported into the coverage matrix so partial conformance is visible without
 * turning the whole suite red.
 */
export enum ExpectationPriority {
  /** APG MUST — a real, user-facing a11y break. Fails CI. */
  BLOCKER = 'blocker',
  /** APG SHOULD — degraded but usable. Reported, not gated. */
  MAJOR = 'major',
  /** Nice-to-have / authoring nicety. Reported. */
  MINOR = 'minor',
  /** APG MAY — optional pattern affordance. Reported. */
  OPTIONAL = 'optional',
}

/**
 * A single normative requirement an expectation traces back to. Every
 * expectation MUST cite at least one, so any test result is traceable to the
 * exact clause of the spec it enforces.
 *
 * Two source specs:
 * - `wcag` — a WCAG 2.2 Success Criterion, e.g. `{spec: 'wcag', id: '1.4.1',
 *   name: 'Use of Color', level: 'A'}`.
 * - `apg`  — a WAI-ARIA APG pattern clause, e.g. `{spec: 'apg', id: 'switch-1',
 *   name: 'Space toggles the switch'}` (the id is the APG keyboard-interaction
 *   or roles/states anchor).
 */
export type SpecCriterion =
  | {
      readonly spec: 'wcag';
      /** SC number, e.g. `1.4.1`, `2.1.1`, `2.5.8`. */
      readonly id: string;
      /** SC short name, e.g. `Use of Color`. */
      readonly name: string;
      /** Conformance level. */
      readonly level: 'A' | 'AA' | 'AAA';
      /** Canonical Understanding-doc URL. */
      readonly url?: string;
    }
  | {
      readonly spec: 'apg';
      /** APG clause/interaction id, e.g. `switch-1`, `menu-13`. */
      readonly id: string;
      /** Human name of the clause, e.g. `Space toggles the switch`. */
      readonly name: string;
      /** Canonical APG pattern URL (may include an anchor). */
      readonly url?: string;
    };

/**
 * The spec-traceability naming convention. Every expectation's `description`
 * (which surfaces as the test name) should be prefixed with this, so the WCAG /
 * APG citation is visible in test output and greppable:
 *
 *   "WCAG 1.4.1 Use of Color (A): status is not conveyed by color alone"
 *   "APG switch-1: Space toggles the switch"
 *
 * Build it from an expectation's primary criterion with `specLabel(criterion)`.
 */
export function specLabel(c: SpecCriterion): string {
  return c.spec === 'wcag'
    ? `WCAG ${c.id} ${c.name} (${c.level})`
    : `APG ${c.id} ${c.name}`;
}

/**
 * A single, isolated conformance check. Receives a harness (the runtime adapter)
 * already pointed at a freshly rendered component. Throws / rejects on failure.
 */
export type ExpectationRun = (harness: AriaHarness) => Promise<void> | void;

export interface Expectation {
  /**
   * Stable, greppable id. Where an APG interaction has a canonical id we reuse
   * it (e.g. `checkbox-42`, `switch-1`); otherwise a descriptive slug.
   */
  readonly id: string;
  /**
   * One-line description that becomes the test name. By convention it is
   * PREFIXED with the spec citation via `specLabel()`, so the WCAG/APG number
   * is visible in test output and greppable, e.g.
   * "WCAG 1.4.1 Use of Color (A): state is not conveyed by color alone".
   */
  readonly description: string;
  readonly priority: ExpectationPriority;
  /**
   * The normative requirement(s) this expectation enforces. REQUIRED — every
   * expectation must trace to at least one WCAG SC or APG clause. The first
   * entry is the primary criterion used for the test-name prefix.
   */
  readonly criteria: readonly [SpecCriterion, ...SpecCriterion[]];
  readonly run: ExpectationRun;
}

/**
 * A pattern contract = the full set of expectations for one APG pattern.
 * Authored once, bound to many components.
 */
export interface PatternContract {
  /** APG pattern slug, e.g. `switch`, `checkbox`, `dialog`. */
  readonly pattern: string;
  readonly apg: string;
  readonly expectations: readonly Expectation[];
}

/** Per-expectation outcome, collected by the runner. */
export interface ExpectationResult {
  readonly expectationId: string;
  readonly priority: ExpectationPriority;
  readonly status: 'passed' | 'failed' | 'expected-failure' | 'unexpected-pass';
  readonly error?: string;
}

/** Full result of running a contract against one component binding. */
export interface ContractResult {
  readonly pattern: string;
  readonly component: string;
  /** Which runtime tier produced this result. */
  readonly tier: 'jsdom' | 'browser';
  readonly results: readonly ExpectationResult[];
}

/**
 * Runtime adapter. The SAME contract runs against jsdom (Tier 1, fast) or a real
 * browser (Tier 2, high-fidelity) by swapping the harness implementation. This is
 * the seam that lets one expectation cover both tiers.
 */
export interface AriaHarness {
  readonly tier: 'jsdom' | 'browser';

  /** Assert a single element exists with the given ARIA role; return a handle. */
  getByRole(role: string, options?: {name?: string | RegExp}): AriaElement;
  /** Non-throwing variant — returns null when absent. */
  queryByRole(
    role: string,
    options?: {name?: string | RegExp},
  ): AriaElement | null;

  /** Currently focused element, or null. */
  activeElement(): AriaElement | null;

  /** Fire a keypress at the currently focused element. */
  press(key: KeyName): Promise<void>;
  /** Click an element. */
  click(el: AriaElement): Promise<void>;
  /** Move DOM focus to an element. */
  focus(el: AriaElement): Promise<void>;

  /**
   * Serialize the accessibility tree rooted at `el` (or document) to a stable
   * text form. jsdom returns an approximation; the browser tier returns the real
   * tree via Playwright's aria snapshot. Used for structural snapshot checks.
   */
  ariaSnapshot(el?: AriaElement): Promise<string>;
}

/** A queried element, normalized across runtimes. */
export interface AriaElement {
  /** Computed accessible name (per the browser name-computation algorithm). */
  accessibleName(): Promise<string>;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  tagName(): string;
  isChecked(): boolean;
  isDisabled(): boolean;
  isFocused(): boolean;
}

export type KeyName =
  | 'Space'
  | 'Enter'
  | 'Tab'
  | 'ShiftTab'
  | 'Escape'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End';

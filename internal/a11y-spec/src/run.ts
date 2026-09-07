// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file run.ts
 * @input Uses ./contract (expectations), ./harness (the runtime seam)
 * @output `runBinding` — runs one pattern contract against one component
 *   binding state — plus the known-failure vocabulary it obeys.
 * @position The engine between a pattern and a component. Everything a report
 *   later says about a binding is decided here.
 *
 * The rules come from the accepted migration record,
 * `docs/specs/AST-021/spec.md`:
 *
 * - FR8  a known failure names an expectation, a binding, a state, an evidence
 *        layer, the user impact, a public issue, and why it is not fixed here.
 * - FR9  a known failure changes only its own exact result. A different error,
 *        another state, a new expectation, or a wider failure still fails, and
 *        an expectation that starts passing is reported as an unexpected pass
 *        so the stale record is removed rather than counted as debt forever.
 * - FR10 required expectations that pass gate immediately.
 *
 * and from `docs/specs/AST-020/spec.md`:
 *
 * - Platform: a harness that cannot observe an assigned evidence layer reports
 *   that limitation. It does not pass, skip silently, or answer from a lower
 *   layer.
 *
 * SYNC: When a status is added, update ./report.ts and the README's status table.
 */

import {
  NotApplicableHere,
  describeExpectation,
  requiredLayers,
  type Enforcement,
  type Expectation,
  type PatternContract,
} from './contract';
import type {EvidenceLayer, Harness} from './harness';

export type ResultStatus =
  /** The outcome was observed. */
  | 'pass'
  /** The outcome was absent. */
  | 'fail'
  /** The exact recorded historical failure, still failing. Never a pass. */
  | 'known-failure'
  /** A recorded failure that now passes: the record is stale and must go. */
  | 'unexpected-pass'
  /** This state cannot change the outcome, so the expectation does not apply. */
  | 'not-applicable'
  /** No harness in this run can observe the assigned evidence layer. */
  | 'unrun';

/**
 * One historical failure, pinned tightly enough that it cannot cover anything
 * else (AST-021 FR8, FR9).
 */
export interface KnownFailure {
  readonly expectation: string;
  readonly binding: string;
  readonly state: string;
  readonly evidenceLayer: EvidenceLayer;
  /**
   * A distinctive fragment of the failure this record covers. A failure whose
   * message does not contain it is a different failure, and still fails.
   */
  readonly failureIncludes: string;
  /** What the person using the component actually experiences. */
  readonly userImpact: string;
  /** Public issue tracking the fix. */
  readonly issue: string;
  /** Why this migration records the gap instead of fixing it. */
  readonly reason: string;
}

export interface ExpectationResult {
  readonly expectation: string;
  readonly description: string;
  readonly outcome: string;
  readonly evidenceLayer: EvidenceLayer;
  readonly enforcement: Enforcement;
  readonly status: ResultStatus;
  /** Present for `fail`, `known-failure`, `not-applicable`, and `unrun`. */
  readonly detail?: string;
  /**
   * For an `unrun` result: exactly which layers this run could not observe.
   * Not always the expectation's own layer — an interaction expectation can be
   * unrun because the tree it reads the result from is out of reach.
   */
  readonly missingLayers?: readonly EvidenceLayer[];
  /** Present when a known-failure record was consulted. */
  readonly knownFailure?: KnownFailure;
}

export interface BindingResult {
  readonly pattern: string;
  /** The component this binding is for, e.g. `Switch`. */
  readonly binding: string;
  /** The representative state, e.g. `off` or `focusable-disabled`. */
  readonly state: string;
  readonly harness: string;
  readonly results: readonly ExpectationResult[];
}

export interface RunBindingOptions<Facts> {
  readonly contract: PatternContract<Facts>;
  readonly binding: string;
  readonly state: string;
  readonly facts: Facts;
  /**
   * Mount the binding fresh and return a harness pointed at it. Called once per
   * expectation, so each one starts from the state the binding declares rather
   * than from whatever the previous expectation left behind.
   */
  readonly mount: () => Promise<Harness>;
  /** Unmount between expectations. */
  readonly unmount?: () => Promise<void> | void;
  /**
   * Run only these expectation ids. Used by the contract's own mutation proof,
   * which asks one expectation at a time whether it notices its outcome being
   * removed. A binding leaves it unset and runs the whole contract.
   */
  readonly only?: readonly string[];
  readonly knownFailures?: readonly KnownFailure[];
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function findKnownFailure<Facts>(
  known: readonly KnownFailure[],
  expectation: Expectation<Facts>,
  binding: string,
  state: string,
): KnownFailure | undefined {
  return known.find(
    record =>
      record.expectation === expectation.id &&
      record.binding === binding &&
      record.state === state &&
      record.evidenceLayer === expectation.evidenceLayer,
  );
}

export async function runBinding<Facts>(
  options: RunBindingOptions<Facts>,
): Promise<BindingResult> {
  const {contract, binding, state, facts, mount, unmount} = options;
  const knownFailures = options.knownFailures ?? [];
  const results: ExpectationResult[] = [];
  let harnessName = 'unmounted';

  for (const expectation of contract.expectations) {
    if (options.only != null && !options.only.includes(expectation.id)) {
      continue;
    }
    const base = {
      expectation: expectation.id,
      description: describeExpectation(expectation),
      outcome: expectation.outcome,
      evidenceLayer: expectation.evidenceLayer,
      enforcement: expectation.enforcement,
    } as const;

    if (!expectation.appliesWhen.test(facts)) {
      results.push({
        ...base,
        status: 'not-applicable',
        detail: `applies when ${expectation.appliesWhen.condition}`,
      });
      continue;
    }

    let harness: Harness | undefined;
    let failure: string | undefined;
    let notApplicableReason: string | undefined;
    let ran = false;

    try {
      const mounted = await mount();
      harness = mounted;
      harnessName = mounted.name;
      const unobservable = requiredLayers(expectation).filter(
        layer => !mounted.observes.includes(layer),
      );
      if (unobservable.length > 0) {
        results.push({
          ...base,
          status: 'unrun',
          missingLayers: unobservable,
          detail: `the ${mounted.name} harness cannot observe the ${unobservable.join(' or ')} layer${unobservable.length === 1 ? '' : 's'} this expectation reads`,
        });
        continue;
      }
      ran = true;
      const subject = await harness.subject();
      await expectation.run({
        harness,
        subject,
        facts,
        notApplicable: reason => {
          throw new NotApplicableHere(reason);
        },
      });
    } catch (error) {
      if (error instanceof NotApplicableHere) {
        notApplicableReason = error.message;
      } else {
        failure = messageOf(error);
      }
      if (!ran) {
        // The mount itself failed. That is a harness fault, not a contract
        // result, and it must not be absorbed by a known-failure record.
        throw error;
      }
    } finally {
      await unmount?.();
    }

    if (notApplicableReason !== undefined) {
      // Discovered from the page rather than declared up front. It is reported
      // exactly like a declared one, so neither reads as a pass, and a
      // known-failure record is deliberately NOT consulted: an expectation that
      // did not run has nothing to record a failure against.
      results.push({
        ...base,
        status: 'not-applicable',
        detail: notApplicableReason,
      });
      continue;
    }

    const record = findKnownFailure(knownFailures, expectation, binding, state);

    if (failure === undefined) {
      results.push(
        record == null
          ? {...base, status: 'pass'}
          : {
              ...base,
              status: 'unexpected-pass',
              knownFailure: record,
              detail: `the recorded failure no longer happens; remove the known-failure record and let ${record.issue} close`,
            },
      );
      continue;
    }

    if (record != null && failure.includes(record.failureIncludes)) {
      results.push({
        ...base,
        status: 'known-failure',
        knownFailure: record,
        detail: failure,
      });
      continue;
    }

    results.push({
      ...base,
      status: 'fail',
      detail:
        record == null
          ? failure
          : `${failure}\n\nA known failure is recorded for this expectation, binding, and state, but it covers a different failure (${JSON.stringify(record.failureIncludes)}). A known failure never widens to cover a new one.`,
      knownFailure: record,
    });
  }

  return {
    pattern: contract.pattern,
    binding,
    state,
    harness: harnessName,
    results,
  };
}

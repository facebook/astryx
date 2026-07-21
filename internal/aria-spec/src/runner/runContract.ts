// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file runContract.ts
 * @input Uses ../types (PatternContract, AriaHarness, results), a per-expectation
 *   render/reset callback
 * @output runContract — executes every expectation in a contract in isolation and
 *   returns a ContractResult; recordContractResult — accumulates results for the
 *   coverage matrix
 * @position The engine that binds a pattern contract to a concrete component
 *
 * SYNC: When ExpectationResult / ContractResult in ../types.ts change, update this
 */

import {
  type AriaHarness,
  type ContractResult,
  type ExpectationResult,
  type PatternContract,
} from '../types';

export interface RunContractOptions {
  readonly contract: PatternContract;
  readonly component: string;
  /**
   * Render the component fresh and return a harness pointed at it. Called once
   * per expectation so each runs from a clean initial state (matches the proven
   * "before each expectation" isolation model).
   */
  readonly setup: () => AriaHarness | Promise<AriaHarness>;
  /** Tear down between expectations (unmount / reset DOM). */
  readonly teardown?: () => void | Promise<void>;
  /**
   * Expectation ids known to fail for this component. Each becomes a tracked gap
   * rather than a missing test. An expectedFailure that unexpectedly PASSES is
   * surfaced as `unexpected-pass` so stale entries get cleaned up.
   */
  readonly expectedFailures?: readonly string[];
}

export async function runContract(
  options: RunContractOptions,
): Promise<ContractResult> {
  const {contract, component, setup, teardown, expectedFailures = []} = options;
  const results: ExpectationResult[] = [];
  let tier: 'jsdom' | 'browser' = 'jsdom';

  for (const expectation of contract.expectations) {
    const isExpectedFailure = expectedFailures.includes(expectation.id);
    let harness: AriaHarness | undefined;
    let caught: unknown;

    try {
      harness = await setup();
      tier = harness.tier;
      await expectation.run(harness);
    } catch (err) {
      caught = err;
    } finally {
      await teardown?.();
    }

    const passed = caught === undefined;
    const status: ExpectationResult['status'] = passed
      ? isExpectedFailure
        ? 'unexpected-pass'
        : 'passed'
      : isExpectedFailure
        ? 'expected-failure'
        : 'failed';

    results.push({
      expectationId: expectation.id,
      priority: expectation.priority,
      status,
      error:
        caught instanceof Error
          ? caught.message
          : caught !== undefined
            ? String(caught)
            : undefined,
    });
  }

  return {
    pattern: contract.pattern,
    component,
    tier,
    results,
  };
}

/**
 * The set of statuses that should fail the test process. Only genuine BLOCKER
 * failures (not expected-failures, not lower priorities) break CI.
 */
export function contractHasBlockingFailure(result: ContractResult): boolean {
  return result.results.some(
    r => r.status === 'failed' && r.priority === 'blocker',
  );
}

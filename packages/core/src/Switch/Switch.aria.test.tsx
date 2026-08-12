// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.aria.test.tsx
 * @input Uses @astryxdesign/aria-spec (switchContract, runContract, jsdom harness),
 *   @testing-library/react, React state, the Switch component
 * @output Tier 1 (jsdom) APG conformance run for Switch, asserting no blocking
 *   failures and recording per-expectation coverage
 * @position Binds the shared `switch` pattern contract to the Switch component.
 *   Supersedes the ad-hoc APG-tagged assertions (switch-1) with the shared contract.
 *
 * SYNC: When Switch.tsx a11y behavior changes, update expectedFailures here (and
 *   the switch contract in internal/aria-spec if the pattern itself changes)
 */

import {useState} from 'react';
import {describe, it, expect, afterEach} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import {
  switchContract,
  runContract,
  createJsdomHarness,
  collectCoverage,
  formatCoverageSummary,
  contractHasBlockingFailure,
  ExpectationPriority,
} from '@astryxdesign/aria-spec';
import {Switch} from './Switch';

afterEach(cleanup);

// Switch is a controlled component: `checked` follows the `value` prop, so a
// realistic binding wires it to state. Contract expectations about toggling
// exercise the component the way a consumer actually uses it.
function ControlledSwitch() {
  const [on, setOn] = useState(false);
  return <Switch label="Notifications" value={on} onChange={setOn} />;
}

function DisabledSwitch() {
  return <Switch label="Notifications" value={false} isDisabled />;
}

const EXPECTED_FAILURES = [
  // This binding renders no description, so aria-describedby is absent by design.
  'switch-optionally-described',
  // The enabled binding isn't disabled, so the disabled-state checks can't apply
  // here; they're covered by the dedicated disabled binding below.
  'switch-disabled-state',
  'switch-disabled-not-activatable',
  // The real accessibility tree is only available in the browser tier (Tier 2).
  'switch-aria-snapshot',
];

async function runSwitch() {
  return runContract({
    contract: switchContract,
    component: 'Switch',
    setup: () => {
      render(<ControlledSwitch />);
      return createJsdomHarness();
    },
    teardown: cleanup,
    expectedFailures: EXPECTED_FAILURES,
  });
}

describe('Switch — APG switch pattern conformance (Tier 1: jsdom)', () => {
  it('conforms to the switch contract with no blocking failures', async () => {
    const result = await runSwitch();

    // Human-readable coverage line in the test output.
    console.log(formatCoverageSummary(collectCoverage([result])));

    // Surface stale expectedFailures (entries that now pass) so they get cleaned
    // up rather than silently masking progress.
    const stale = result.results
      .filter(r => r.status === 'unexpected-pass')
      .map(r => r.expectationId);
    expect(stale, 'expectedFailures that now pass — remove them').toEqual([]);

    // The gate: only genuine BLOCKER regressions fail the build.
    expect(contractHasBlockingFailure(result)).toBe(false);
  });

  it('satisfies Space-to-toggle (APG switch-1) as a BLOCKER', async () => {
    const result = await runSwitch();
    const space = result.results.find(r => r.expectationId === 'switch-1');
    expect(space?.priority).toBe(ExpectationPriority.BLOCKER);
    expect(space?.status).toBe('passed');
  });

  it('records the known gaps as tracked expected-failures', async () => {
    const result = await runSwitch();
    const gaps = result.results
      .filter(r => r.status === 'expected-failure')
      .map(r => r.expectationId)
      .sort();
    expect(gaps).toEqual(
      [
        'switch-aria-snapshot',
        'switch-disabled-state',
        'switch-disabled-not-activatable',
        'switch-optionally-described',
      ].sort(),
    );
  });

  it('disabled switch: exposes disabled state and does not activate', async () => {
    const result = await runContract({
      contract: switchContract,
      component: 'Switch (disabled)',
      setup: () => {
        render(<DisabledSwitch />);
        return createJsdomHarness();
      },
      teardown: cleanup,
      // A disabled, description-less switch: only these remain gaps.
      expectedFailures: [
        'switch-optionally-described',
        'switch-aria-snapshot',
        // Disabled control can't be toggled/focused the same way; those
        // interaction checks don't apply to the disabled binding.
        'switch-1',
        'switch-click-toggles',
      ],
    });
    const byId = (id: string) =>
      result.results.find(r => r.expectationId === id)?.status;
    expect(byId('switch-disabled-state')).toBe('passed');
    expect(byId('switch-disabled-not-activatable')).toBe('passed');
    expect(contractHasBlockingFailure(result)).toBe(false);
  });
});

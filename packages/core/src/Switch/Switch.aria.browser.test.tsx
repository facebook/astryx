// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.aria.browser.test.tsx
 * @input Uses @astryxdesign/aria-spec (switchContract, runContract, browser
 *   harness), @vitest/browser render, React state, the Switch component
 * @output Tier 2 (real Chromium) APG conformance run for Switch — asserts the
 *   fidelity-critical expectations jsdom cannot: the real accessibility tree.
 * @position Tier 2 binding. Runs ONLY in the `browser` vitest project
 *   (pnpm test:aria-browser). Proves the same contract runs against a second
 *   harness with zero contract changes.
 *
 * SYNC: Keep expectedFailures in sync with Switch.aria.test.tsx — the browser
 *   tier should have FEWER gaps (e.g. it satisfies switch-aria-snapshot).
 */

import {useState} from 'react';
import {describe, it, expect} from 'vitest';
import {render, cleanup} from 'vitest-browser-react';
import {
  switchContract,
  runContract,
  contractHasBlockingFailure,
} from '@astryxdesign/aria-spec';
import {createBrowserHarness} from '@astryxdesign/aria-spec/browser';
import {Switch} from './Switch';

function ControlledSwitch() {
  const [on, setOn] = useState(false);
  return <Switch label="Notifications" value={on} onChange={setOn} />;
}

describe('Switch — APG switch pattern conformance (Tier 2: real browser)', () => {
  it('conforms including the real accessibility-tree snapshot', async () => {
    const result = await runContract({
      contract: switchContract,
      component: 'Switch',
      setup: async () => {
        // `render` is async in vitest-browser-react (it awaits act), so the
        // mount has to be awaited before an expectation queries the DOM.
        await render(<ControlledSwitch />);
        return createBrowserHarness();
      },
      // Each expectation renders fresh (as in the jsdom tier); without this the
      // mounts pile up and every role query hits a strict-mode violation.
      teardown: cleanup,
      // In the browser tier, switch-aria-snapshot is REAL and should pass, so it
      // is NOT an expected-failure here (unlike the jsdom tier). Only the
      // description gap remains for this binding.
      expectedFailures: ['switch-optionally-described'],
    });

    expect(result.tier).toBe('browser');
    // switch-aria-snapshot passes here where it was a known-gap in jsdom.
    const snap = result.results.find(
      r => r.expectationId === 'switch-aria-snapshot',
    );
    expect(snap?.status).toBe('passed');
    expect(contractHasBlockingFailure(result)).toBe(false);
  });
});

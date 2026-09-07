// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.a11y.test.tsx
 * @input Uses @astryxdesign/a11y-spec (the switch contract, the jsdom harness,
 *   the runner), @testing-library/react, and the Switch component
 * @output The jsdom lane of Switch's binding to the shared switch pattern.
 * @position Binds Switch to the reusable contract at the layers jsdom can
 *   honestly observe. The accessibility-tree and real-browser layers are bound
 *   in Switch.a11y.chromium.spec.ts, and this lane reports them as unrun rather
 *   than pretending markup proves them.
 *
 * What is NOT here is as deliberate as what is. Callback payloads, form
 * participation, tooltip composition, and styling stay in Switch.test.tsx: they
 * are Switch's own contract, not the switch pattern's
 * (`docs/specs/AST-021/spec.md` FR5).
 *
 * SYNC: States live in ./Switch.a11y.states.ts, known failures in
 *   ./Switch.a11y.known-failures.ts, both shared with the Chromium lane.
 */

import {useState} from 'react';
import {describe, expect, it} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {
  SWITCH_PATTERN,
  blockingResults,
  createJsdomHarness,
  formatFailures,
  summarize,
  runBinding,
  type BindingResult,
} from '@astryxdesign/a11y-spec';
import {Switch, type SwitchProps} from '../Switch';
import {SWITCH_KNOWN_FAILURES} from './Switch.a11y.known-failures';
import {
  SWITCH_BINDING_STATES,
  type SwitchBindingState,
} from './Switch.a11y.states';

/**
 * Switch is controlled, so a binding that pinned `value` would be testing a
 * switch nobody ships. The wrapper is the consumer's own wiring.
 */
function ControlledSwitch({value, ...props}: Omit<SwitchProps, 'onChange'>) {
  const [checked, setChecked] = useState(value);
  return <Switch {...props} value={checked} onChange={setChecked} />;
}

async function runState(state: SwitchBindingState): Promise<BindingResult> {
  return runBinding({
    contract: SWITCH_PATTERN,
    binding: 'Switch',
    state: state.id,
    facts: state.facts,
    knownFailures: SWITCH_KNOWN_FAILURES,
    mount: async () => {
      render(<ControlledSwitch {...state.props} />);
      return createJsdomHarness({
        subject: screen.getByRole('switch', {hidden: true}),
      });
    },
    unmount: cleanup,
  });
}

describe('Switch — the shared switch pattern, jsdom lane', () => {
  it.each(
    SWITCH_BINDING_STATES.map(
      state => [state.id, state.summary, state] as const,
    ),
  )('%s (%s)', async (_id, _summary, state) => {
    const result = await runState(state);
    expect(formatFailures(blockingResults([result]))).toBe('');
  });

  it('runs the DOM layer here and reports the higher layers as unrun', async () => {
    const results: BindingResult[] = [];
    for (const state of SWITCH_BINDING_STATES) {
      results.push(await runState(state));
    }
    const report = summarize(SWITCH_PATTERN, results);

    // Something actually ran, or this lane would prove nothing at all.
    expect(report.counts.pass).toBeGreaterThan(0);
    // And what it could not see is named, not quietly counted as covered.
    expect(report.unrunLayers).toEqual(['accessibility-tree', 'real-browser']);
    expect(report.counts.unexpectedPass).toBe(0);
  });
});

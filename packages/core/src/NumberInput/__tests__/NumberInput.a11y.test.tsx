// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @vitest-environment jsdom */

/** Fast DOM binding for NumberInput against the shared Spinbutton contract. */

import {cleanup, render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {
  SPINBUTTON_PATTERN,
  checkAccessibilitySpec,
  createJsdomHarness,
  expectAccessibilitySpec,
  summarize,
  type BindingResult,
} from '@astryxdesign/a11y-spec';
import {NUMBER_INPUT_A11Y_RENDERS} from './NumberInput.a11y.renders';
import {
  NUMBER_INPUT_A11Y_EXCLUSIONS,
  NUMBER_INPUT_A11Y_STATES,
  type NumberInputA11yRow,
} from './NumberInput.a11y.states';

const SUBJECT_SELECTOR = '[data-a11y-spinbutton-subject]';

function subjectFor(): HTMLInputElement {
  const subject = document.querySelector(SUBJECT_SELECTOR);
  if (!(subject instanceof HTMLInputElement)) {
    throw new Error('binding did not render one native spinbutton subject');
  }
  return subject;
}

async function checkState(state: NumberInputA11yRow): Promise<BindingResult> {
  return checkAccessibilitySpec({
    spec: SPINBUTTON_PATTERN,
    binding: 'NumberInput',
    state: state.id,
    facts: state.facts,
    mount: async () => {
      render(NUMBER_INPUT_A11Y_RENDERS[state.id]());
      return createJsdomHarness({subject: subjectFor()});
    },
    unmount: cleanup,
  });
}

describe('the shared Spinbutton pattern, jsdom lane', () => {
  it.each(
    NUMBER_INPUT_A11Y_STATES.map(
      state => [`NumberInput [${state.id}]`, state.summary, state] as const,
    ),
  )('%s — %s', async (_id, _summary, state) => {
    await expectAccessibilitySpec({
      spec: SPINBUTTON_PATTERN,
      binding: 'NumberInput',
      state: state.id,
      facts: state.facts,
      render: () => {
        render(NUMBER_INPUT_A11Y_RENDERS[state.id]());
      },
      subject: subjectFor,
      cleanup,
    });
  });

  it('runs DOM expectations and reports browser-owned layers as unrun', async () => {
    const results: BindingResult[] = [];
    for (const state of NUMBER_INPUT_A11Y_STATES) {
      results.push(await checkState(state));
    }
    const report = summarize(SPINBUTTON_PATTERN, results);
    expect(report.counts.pass).toBeGreaterThan(0);
    expect(report.unrunLayers).toEqual(['accessibility-tree', 'real-browser']);
    expect(report.counts.unexpectedPass).toBe(0);
  });
});

describe('the NumberInput Spinbutton binding inventory', () => {
  it('names a distinct checked-in story for every state', () => {
    const ids = NUMBER_INPUT_A11Y_STATES.map(state => state.storyId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('records every adjacent exclusion with an owner and reason', () => {
    expect(
      NUMBER_INPUT_A11Y_EXCLUSIONS.every(row => row.owner && row.reason),
    ).toBe(true);
  });

  it('renders exactly one subject for every state', () => {
    for (const state of NUMBER_INPUT_A11Y_STATES) {
      render(NUMBER_INPUT_A11Y_RENDERS[state.id]());
      expect(subjectFor(), state.id).toBeTruthy();
      expect(document.querySelectorAll(SUBJECT_SELECTOR)).toHaveLength(1);
      cleanup();
    }
  });
});

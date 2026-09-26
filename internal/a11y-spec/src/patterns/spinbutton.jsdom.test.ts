// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @vitest-environment jsdom */

/** Contract completeness, evidence-boundary, and DOM mutation proof. */

import {afterEach, describe, expect, it} from 'vitest';
import {checkAccessibilitySpec} from '../check';
import {requiredLayers, unansweredDimensions} from '../contract';
import {createJsdomHarness, JSDOM_OBSERVES} from '../harness/jsdom';
import {SPINBUTTON_PATTERN} from './spinbutton';
import {
  CONFORMING_SPINBUTTON_FIXTURES,
  SPINBUTTON_MUTATIONS,
  SPINBUTTON_SUBJECT_SELECTOR,
  spinbuttonFixture,
} from './spinbutton.fixtures';

afterEach(() => document.body.replaceChildren());

async function run(id: string) {
  const fixture = spinbuttonFixture(id);
  return checkAccessibilitySpec({
    spec: SPINBUTTON_PATTERN,
    binding: 'fixture',
    state: id,
    facts: fixture.facts,
    mount: async () => {
      document.body.innerHTML = fixture.html;
      const subject = document.querySelector(SPINBUTTON_SUBJECT_SELECTOR);
      if (subject == null) {
        throw new Error(`fixture "${id}" marks no subject`);
      }
      return createJsdomHarness({subject});
    },
    unmount: () => document.body.replaceChildren(),
  });
}

const observableHere = SPINBUTTON_PATTERN.expectations.filter(expectation =>
  requiredLayers(expectation).every(layer => JSDOM_OBSERVES.includes(layer)),
);

describe('Spinbutton contract — completeness', () => {
  it('answers every checklist dimension', () => {
    expect(unansweredDimensions(SPINBUTTON_PATTERN)).toEqual([]);
  });

  it('gives every expectation a deliberately violating fixture', () => {
    expect(
      SPINBUTTON_PATTERN.expectations
        .filter(
          expectation =>
            (SPINBUTTON_MUTATIONS[expectation.id] ?? []).length === 0,
        )
        .map(expectation => expectation.id),
    ).toEqual([]);
  });

  it('has an expectation for every mutation entry', () => {
    const ids = new Set(
      SPINBUTTON_PATTERN.expectations.map(expectation => expectation.id),
    );
    expect(
      Object.keys(SPINBUTTON_MUTATIONS).filter(id => !ids.has(id)),
    ).toEqual([]);
  });
});

describe('Spinbutton contract — jsdom evidence boundary', () => {
  it('runs DOM expectations and reports browser-owned layers as unrun', async () => {
    const result = await run('conforming-empty');
    expect(result.results.some(row => row.status === 'pass')).toBe(true);
    expect(result.results.some(row => row.status === 'unrun')).toBe(true);
    expect(result.results.filter(row => row.status === 'fail')).toEqual([]);
  });
});

describe.each(observableHere.map(expectation => [expectation.id] as const))(
  '%s',
  id => {
    it.each(CONFORMING_SPINBUTTON_FIXTURES.map(name => [name] as const))(
      'passes against %s (or does not apply)',
      async name => {
        const result = (await run(name)).results.find(
          row => row.expectation === id,
        );
        expect(['pass', 'not-applicable']).toContain(result?.status);
      },
    );

    it.each((SPINBUTTON_MUTATIONS[id] ?? []).map(name => [name] as const))(
      'fails against %s, which removes its outcome',
      async name => {
        const result = (await run(name)).results.find(
          row => row.expectation === id,
        );
        expect(result?.status).toBe('fail');
        expect(result?.description).toContain(id);
      },
    );
  },
);

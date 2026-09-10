// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @vitest-environment jsdom */

/**
 * @file radio-group.jsdom.test.ts
 * @input Uses the radio-group contract, fixtures, and jsdom harness
 * @output DOM-lane evidence that higher-layer radio-group checks remain unrun
 * @position Contract self-test; proves evidence boundaries without a browser.
 */

import {afterEach, describe, expect, it} from 'vitest';
import {checkAccessibilitySpec} from '../check';
import {createJsdomHarness} from '../harness/jsdom';
import {RADIO_GROUP_PATTERN} from './radio-group';
import {
  radioGroupFixture,
  RADIO_GROUP_SUBJECT_SELECTOR,
} from './radio-group.fixtures';

afterEach(() => {
  document.body.replaceChildren();
});

describe('radio-group contract — jsdom evidence boundary', () => {
  it('reports the accessibility-tree role check as unrun, never as a pass', async () => {
    const target = radioGroupFixture('conforming-group');
    const container = document.createElement('div');
    document.body.append(container);
    const run = await checkAccessibilitySpec({
      spec: RADIO_GROUP_PATTERN,
      binding: 'fixture',
      state: target.id,
      facts: target.facts,
      mount: async () => {
        container.innerHTML = target.html;
        const subject = container.querySelector(RADIO_GROUP_SUBJECT_SELECTOR);
        if (subject == null) {
          throw new Error(`fixture "${target.id}" marks no subject element`);
        }
        return createJsdomHarness({subject});
      },
      unmount: () => {
        container.innerHTML = '';
      },
    });

    expect(run.results).toEqual([
      expect.objectContaining({
        expectation: 'radio-group.group.role-exposed',
        status: 'unrun',
        missingLayers: ['accessibility-tree'],
      }),
    ]);
  });
});

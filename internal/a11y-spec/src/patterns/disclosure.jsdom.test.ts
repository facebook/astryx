// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @vitest-environment jsdom */

/**
 * @file disclosure.jsdom.test.ts
 * @input Uses the disclosure contract and real HTML fixtures
 * @output Positive and deliberately violating DOM proof through the public checker
 * @position Contract self-tests; no browser focus or visual claim.
 */

import {afterEach, describe, expect, it} from 'vitest';
import {checkAccessibilitySpec} from '../check';
import {createJsdomHarness} from '../harness/jsdom';
import {DISCLOSURE_PATTERN} from './disclosure';

afterEach(() => document.body.replaceChildren());

async function checkExpanded(attribute: string, expanded = true) {
  return checkAccessibilitySpec({
    spec: DISCLOSURE_PATTERN,
    binding: 'fixture',
    state: 'expanded',
    facts: {expanded},
    mount: async () => {
      document.body.innerHTML = `<button type="button" ${attribute} aria-controls="content">Details</button><div id="content">Body</div>`;
      return createJsdomHarness({subject: document.querySelector('button')!});
    },
    unmount: () => document.body.replaceChildren(),
  });
}

describe('disclosure.state.expanded — WCAG 2.2 4.1.2', () => {
  it('accepts an expanded disclosure with its state exposed', async () => {
    const result = await checkExpanded('aria-expanded="true"');
    expect(result.results[0]?.status).toBe('pass');
  });

  it('detects an expanded disclosure with no expanded state', async () => {
    const result = await checkExpanded('');
    expect(result.results[0]?.status).toBe('fail');
    expect(result.results[0]?.detail).toBe(
      'the disclosure is expanded but aria-expanded is absent',
    );
  });
});

async function checkControls(id: string) {
  return checkAccessibilitySpec({
    spec: DISCLOSURE_PATTERN,
    binding: 'fixture',
    state: 'controlled-content',
    facts: {expanded: true, controls: true},
    only: ['disclosure.relationship.controls'],
    mount: async () => {
      document.body.innerHTML = `<button type="button" aria-expanded="true" aria-controls="${id}">Details</button><div id="content">Body</div><div id="other">Other content</div>`;
      return createJsdomHarness({
        subject: document.querySelector('button')!,
        related: {content: document.getElementById('content')!},
      });
    },
    unmount: () => document.body.replaceChildren(),
  });
}

describe('disclosure.relationship.controls — WCAG 2.2 1.3.1', () => {
  it('rejects a dangling extra target even when the content is also referenced', async () => {
    const result = await checkControls('content missing');
    expect(result.results[0]?.status).toBe('fail');
    expect(result.results[0]?.detail).toBe(
      'aria-controls includes a missing content target',
    );
  });

  it('accepts the relationship to the actual content', async () => {
    const result = await checkControls('content');
    expect(result.results[0]?.status).toBe('pass');
  });

  it('rejects a relationship to unrelated content', async () => {
    const result = await checkControls('other');
    expect(result.results[0]?.status).toBe('fail');
    expect(result.results[0]?.detail).toBe(
      'aria-controls does not identify the disclosed content',
    );
  });
});

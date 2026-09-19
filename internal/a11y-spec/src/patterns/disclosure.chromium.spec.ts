// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file disclosure.chromium.spec.ts
 * @input Uses Playwright, the disclosure contract, and native-button fixtures
 * @output Real-browser proof of complete disclosure transitions and their mutations
 * @position Contract fixtures, independent of any component implementation.
 */

import {expect, test} from '@playwright/test';
import {checkAccessibilitySpec} from '../check';
import {createChromiumHarness} from '../harness/chromium';
import {DISCLOSURE_PATTERN} from './disclosure';

const toggle = `const open = this.getAttribute('aria-expanded') !== 'true'; this.setAttribute('aria-expanded', String(open)); document.getElementById('content').hidden = !open;`;
const openOnly = `this.setAttribute('aria-expanded', 'true'); document.getElementById('content').hidden = false;`;
const stateOnly = `this.setAttribute('aria-expanded', String(this.getAttribute('aria-expanded') !== 'true'));`;

const fixtures = [
  {
    id: 'closed-round-trip',
    expanded: false,
    click: toggle,
    keydown: '',
    failure: null,
  },
  {
    id: 'open-round-trip',
    expanded: true,
    click: toggle,
    keydown: '',
    failure: null,
  },
  {
    id: 'one-way-open',
    expanded: false,
    click: openOnly,
    keydown: '',
    failure: 'click did not collapse the disclosure',
  },
  {
    id: 'state-without-content',
    expanded: false,
    click: stateOnly,
    keydown: '',
    failure: 'click exposed expanded=true while its content stayed hidden',
  },
  {
    id: 'space-unavailable',
    expanded: false,
    click: toggle,
    keydown: "if (event.key === ' ') event.preventDefault();",
    failure: 'Space did not expand the disclosure',
  },
  {
    id: 'enter-unavailable',
    expanded: false,
    click: toggle,
    keydown: "if (event.key === 'Enter') event.preventDefault();",
    failure: 'Enter did not expand the disclosure',
  },
] as const;

for (const fixture of fixtures) {
  test(`disclosure.interaction.round-trip — ${fixture.id}`, async ({page}) => {
    const cdp = await page.context().newCDPSession(page);
    const result = await checkAccessibilitySpec({
      spec: DISCLOSURE_PATTERN,
      binding: 'fixture',
      state: fixture.id,
      facts: {expanded: fixture.expanded, controls: true, operable: true},
      only: ['disclosure.interaction.round-trip'],
      mount: async () => {
        await page.setContent(
          `<button type="button" aria-expanded="${fixture.expanded}" aria-controls="content" onclick="${fixture.click}" onkeydown="${fixture.keydown}">Details</button><div id="content" ${fixture.expanded ? '' : 'hidden'}>Body</div>`,
        );
        return createChromiumHarness({
          page,
          cdp,
          subject: page.getByRole('button', {name: 'Details'}),
          related: {content: page.locator('#content')},
        });
      },
    });
    expect(result.results[0]?.status).toBe(
      fixture.failure === null ? 'pass' : 'fail',
    );
    if (fixture.failure !== null) {
      expect(result.results[0]?.detail).toBe(fixture.failure);
    }
  });
}

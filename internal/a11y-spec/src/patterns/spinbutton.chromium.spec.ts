// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Chromium positive and mutation proof for the shared Spinbutton contract. */

import {expect, test, type Page} from '@playwright/test';
import {checkAccessibilitySpec, requiredLayers} from '../index';
import {CHROMIUM_OBSERVES, createChromiumHarness} from '../harness/chromium';
import {SPINBUTTON_PATTERN} from './spinbutton';
import {
  CONFORMING_SPINBUTTON_FIXTURES,
  SPINBUTTON_MUTATIONS,
  SPINBUTTON_SUBJECT_SELECTOR,
  spinbuttonFixture,
} from './spinbutton.fixtures';

async function run(page: Page, id: string, only?: readonly string[]) {
  const fixture = spinbuttonFixture(id);
  const cdp = await page.context().newCDPSession(page);
  return checkAccessibilitySpec({
    spec: SPINBUTTON_PATTERN,
    binding: 'fixture',
    state: id,
    facts: fixture.facts,
    only,
    mount: async () => {
      await page.setContent(fixture.html);
      return createChromiumHarness({
        page,
        cdp,
        subject: page.locator(SPINBUTTON_SUBJECT_SELECTOR),
      });
    },
  });
}

for (const expectation of SPINBUTTON_PATTERN.expectations) {
  test(`${expectation.id} has Chromium coverage`, async ({page}) => {
    expect(
      requiredLayers(expectation).every(layer =>
        CHROMIUM_OBSERVES.includes(layer),
      ),
    ).toBe(true);
    const conforming = CONFORMING_SPINBUTTON_FIXTURES.find(id => {
      const fixture = spinbuttonFixture(id);
      return expectation.appliesWhen.test(fixture.facts);
    });
    if (conforming == null) {
      throw new Error(`no conforming fixture exercises ${expectation.id}`);
    }
    const result = await run(page, conforming, [expectation.id]);
    expect(result.results[0]?.status).toBe('pass');
  });

  for (const mutation of SPINBUTTON_MUTATIONS[expectation.id] ?? []) {
    test(`${expectation.id} rejects ${mutation}`, async ({page}) => {
      const result = await run(page, mutation, [expectation.id]);
      expect(result.results[0]?.status).toBe('fail');
      expect(result.results[0]?.description).toContain(expectation.id);
    });
  }
}

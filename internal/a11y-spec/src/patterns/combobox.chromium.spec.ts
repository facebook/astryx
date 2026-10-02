// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Real-browser positive and mutation proof for the Combobox contract. */

import {
  expect,
  test,
  type CDPSession,
  type Locator,
  type Page,
} from '@playwright/test';
import {describeExpectation, requiredLayers} from '../contract';
import {checkAccessibilitySpec, type ExpectationResult} from '../check';
import {
  CHROMIUM_OBSERVES,
  createChromiumHarness,
  holdMotionStill,
} from '../harness/chromium';
import {COMBOBOX_PATTERN} from './combobox';
import {
  COMBOBOX_ACTIVE_SELECTOR,
  COMBOBOX_MUTATIONS,
  COMBOBOX_POPUP_SELECTOR,
  COMBOBOX_SUBJECT_SELECTOR,
  CONFORMING_COMBOBOX_FIXTURES,
  comboboxFixture,
  type ComboboxFixture,
} from './combobox.fixtures';

function fixturePage(html: string): string {
  return `<!doctype html><html lang="en"><body>${html}</body></html>`;
}

async function results(
  page: Page,
  cdp: CDPSession,
  target: ComboboxFixture,
  only?: readonly string[],
): Promise<readonly ExpectationResult[]> {
  const run = await checkAccessibilitySpec({
    spec: COMBOBOX_PATTERN,
    binding: 'fixture',
    state: target.id,
    facts: target.facts,
    only,
    mount: async () => {
      await page.setContent(fixturePage(target.html));
      await holdMotionStill(page);
      const related: Record<string, Locator> = {};
      const popup = page.locator(COMBOBOX_POPUP_SELECTOR);
      if ((await popup.count()) > 0) {
        related.popup = popup;
      }
      const active = page.locator(COMBOBOX_ACTIVE_SELECTOR);
      if ((await active.count()) > 0) {
        related['active-descendant'] = active;
      }
      return createChromiumHarness({
        page,
        cdp,
        subject: page.locator(COMBOBOX_SUBJECT_SELECTOR),
        related,
      });
    },
  });
  return run.results;
}

test.describe('Combobox contract — conforming fixtures', () => {
  for (const id of CONFORMING_COMBOBOX_FIXTURES) {
    test(`${id}: every applicable expectation passes`, async ({page}) => {
      const cdp = await page.context().newCDPSession(page);
      const observed = await results(page, cdp, comboboxFixture(id));
      expect(
        observed
          .filter(
            result =>
              result.status !== 'pass' && result.status !== 'not-applicable',
          )
          .map(result => `${result.expectation}: ${result.detail ?? ''}`),
      ).toEqual([]);
    });
  }
});

test.describe('Combobox contract — deliberately violating fixtures', () => {
  for (const expectation of COMBOBOX_PATTERN.expectations) {
    if (
      !requiredLayers(expectation).every(layer =>
        CHROMIUM_OBSERVES.includes(layer),
      )
    ) {
      continue;
    }
    for (const fixtureId of COMBOBOX_MUTATIONS[expectation.id] ?? []) {
      test(`${describeExpectation(expectation)} — fails against ${fixtureId}`, async ({
        page,
      }) => {
        const cdp = await page.context().newCDPSession(page);
        const [result] = await results(page, cdp, comboboxFixture(fixtureId), [
          expectation.id,
        ]);
        expect(result?.status, result?.detail ?? 'no result').toBe('fail');
        expect(result?.detail ?? '').not.toBe('');
      });
    }
  }
});

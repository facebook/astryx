// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Chromium accessibility-tree and relationship proof for Selector's Combobox binding. */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {checkAccessibilitySpec} from '@astryxdesign/a11y-spec';
import {createChromiumHarness} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {COMBOBOX_PATTERN} from '@astryxdesign/a11y-spec';
import {SELECTOR_COMBOBOX_SCENARIOS} from './Combobox.a11y.states';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

async function awaitScenario(page: Page, open: boolean): Promise<void> {
  if (open) {
    await expect(page.getByRole('listbox')).toBeVisible();
  }
}

for (const scenario of SELECTOR_COMBOBOX_SCENARIOS) {
  test(`Selector Combobox contract — ${scenario.id}`, async ({page}) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=${scenario.storyId}&viewMode=story`,
      {waitUntil: 'load'},
    );
    await awaitScenario(page, scenario.open);

    const subject = page.getByRole('combobox', {name: 'Fruit'});
    const related: Record<string, Locator> = {};
    if (scenario.facts.popupVisible) {
      related.popup = page.getByRole('listbox');
      related['active-descendant'] = page.getByRole('option', {name: 'Apple'});
    }
    const cdp = await page.context().newCDPSession(page);
    const run = await checkAccessibilitySpec({
      spec: COMBOBOX_PATTERN,
      binding: 'Selector.trigger',
      state: scenario.id,
      facts: scenario.facts,
      mount: async () => createChromiumHarness({page, cdp, subject, related}),
    });

    expect(
      run.results
        .filter(
          result =>
            result.status !== 'pass' && result.status !== 'not-applicable',
        )
        .map(result => `${result.expectation}: ${result.detail ?? ''}`),
    ).toEqual([]);
  });
}

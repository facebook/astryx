// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorPressOpen.a11y.chromium.spec.ts
 * @input The checked-in Core/Selector › Default story, a built Storybook and
 *   a real mouse in Chromium
 * @output Browser evidence for Selector FR8: a mouse opens the list on
 *   press-down and drags into it to pick; the row the list places under the
 *   press is a click's landing, never a pick, measured against the rows the
 *   press model reports in a real layout
 * @position Chromium proof for the press-to-open trigger half in
 *   packages/core/src/Selector/Selector.tsx
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

const STORY = 'core-selector--default';
const TRIGGER = '#storybook-root [role="combobox"]';

async function mount(page: Page) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await expect(page.locator(TRIGGER)).toBeVisible();
}

async function centerOf(page: Page, selector: string, name?: string) {
  const locator =
    name == null
      ? page.locator(selector)
      : page.getByRole('option', {name, exact: true});
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error(`${selector} ${name ?? ''} has no rendered bounds`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

test('a mouse press opens the list before the button lifts', async ({page}) => {
  await mount(page);
  const trigger = await centerOf(page, TRIGGER);
  await page.mouse.move(trigger.x, trigger.y);
  await page.mouse.down();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.mouse.up();
  await expect(page.getByRole('listbox')).toBeVisible();
});

test('a slow click leaves the list open and picks nothing, though the release lands on the row under the press', async ({
  page,
}) => {
  await mount(page);
  const trigger = await centerOf(page, TRIGGER);
  await page.mouse.move(trigger.x, trigger.y);
  await page.mouse.down();
  await expect(page.getByRole('listbox')).toBeVisible();
  // Past the settle time, and a shaky hand: still over the same row.
  await page.waitForTimeout(400);
  await page.mouse.move(trigger.x + 4, trigger.y + 1, {steps: 2});
  await page.mouse.up();
  await page.waitForTimeout(100);
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(page.locator(TRIGGER)).toHaveText(/Select a fruit/);
});

test('a press that drags onto another option picks it on release', async ({
  page,
}) => {
  await mount(page);
  const trigger = await centerOf(page, TRIGGER);
  await page.mouse.move(trigger.x, trigger.y);
  await page.mouse.down();
  await expect(page.getByRole('listbox')).toBeVisible();
  const orange = await centerOf(page, 'option', 'Orange');
  await page.mouse.move(orange.x, orange.y, {steps: 6});
  await page.mouse.up();
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(page.locator(TRIGGER)).toHaveText(/Orange/);
});

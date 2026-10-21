// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuRadioPosition.a11y.chromium.spec.ts
 * @input The `Core/DropdownMenu` RadioGroupMarkAtEnd and RadioGroupMarkAtStart
 *   stories in a built Storybook, real mouse and keyboard input.
 * @output Real-engine proof that a radio group's `indicatorPosition` puts every
 *   row's radio mark on the edge it names, as Selector's does, and that the
 *   rows keep their menuitemradio semantics.
 * @position Run with `pnpm test:a11y-contract`; jsdom has no layout to show
 *   where the mark sits.
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

const TRIGGER = '#storybook-root [aria-haspopup="menu"]';
const MARK = '.astryx-dropdown-menu-radio';
const ROWS = ['10 rows', '25 rows', '50 rows'];

async function openStory(page: Page, story: string) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-dropdownmenu--${story}&viewMode=story`,
  );
  await page.locator(TRIGGER).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

async function boxes(page: Page, name: string) {
  const row = page.getByRole('menuitemradio', {name});
  const label = await row.getByText(name).boundingBox();
  const mark = await row.locator(MARK).boundingBox();
  const box = await row.boundingBox();
  if (label == null || mark == null || box == null) {
    throw new Error(`row "${name}" has no rendered bounds`);
  }
  return {label, mark, box};
}

test('indicatorPosition="end" puts every row\'s radio mark at its inline end', async ({
  page,
}) => {
  await openStory(page, 'radio-group-mark-at-end');
  await expect(
    page.getByRole('menuitemradio', {name: '25 rows'}),
  ).toHaveAttribute('aria-checked', 'true');
  const labelStarts: number[] = [];
  for (const name of ROWS) {
    const {label, mark, box} = await boxes(page, name);
    // After the label, against the row's inline end.
    expect(mark.x).toBeGreaterThan(label.x + label.width);
    expect(box.x + box.width - (mark.x + mark.width)).toBeLessThan(24);
    labelStarts.push(label.x);
  }
  // The labels line up: no mark sits before any of them.
  expect(Math.max(...labelStarts) - Math.min(...labelStarts)).toBeLessThan(1);
});

test('indicatorPosition="start" keeps every row\'s radio mark before its label', async ({
  page,
}) => {
  await openStory(page, 'radio-group-mark-at-start');
  for (const name of ROWS) {
    const {label, mark} = await boxes(page, name);
    expect(mark.x + mark.width).toBeLessThanOrEqual(label.x);
  }
});

test('choosing another row with the keyboard moves the checked state', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-dropdownmenu--radio-group-mark-at-end&viewMode=story`,
  );
  await page.locator(TRIGGER).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
  // Enter opens on the first row; ArrowDown twice reaches "50 rows".
  await expect(
    page.getByRole('menuitemradio', {name: '10 rows'}),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeHidden();
  await page.locator(TRIGGER).click();
  await expect(
    page.getByRole('menuitemradio', {name: '50 rows'}),
  ).toHaveAttribute('aria-checked', 'true');
  await expect(
    page.getByRole('menuitemradio', {name: '25 rows'}),
  ).toHaveAttribute('aria-checked', 'false');
});

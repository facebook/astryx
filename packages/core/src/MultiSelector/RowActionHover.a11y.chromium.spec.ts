// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RowActionHover.a11y.chromium.spec.ts
 * @input The `Core/MultiSelector` RowActions story in a built Storybook.
 * @output Real-engine proof that a MultiSelector row is lit only while the
 *   pointer is on it when rows carry a `renderOptionAction` control.
 * @position Run with `pnpm test:a11y-contract`; a DOM emulator cannot observe
 *   the pointer path a mouse actually takes between a row and an action.
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

async function litRows(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    const base = rows.find(r => r.textContent?.includes('P1'));
    const baseBg = base
      ? getComputedStyle(base).backgroundColor
      : 'rgba(0, 0, 0, 0)';
    return rows
      .filter(r => getComputedStyle(r).backgroundColor !== baseBg)
      .map(r => r.textContent?.trim() ?? '');
  });
}

async function center(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) {
    throw new Error(`no box for ${selector}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

test('a row stays lit only while the pointer is on it', async ({page}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--row-actions&viewMode=story`,
  );
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('option', {name: 'P1'})).toBeVisible();

  const docs = await center(page, '[role="option"]:has-text("Docs")');
  const p0Action = await center(page, 'button[aria-label="Edit P0"]');
  const reviewAction = await center(
    page,
    'button[aria-label="Edit Design review"]',
  );

  // Hover a plain row (no action): it lights.
  await page.mouse.move(docs.x, docs.y, {steps: 4});
  await expect.poll(async () => litRows(page)).toEqual(['Docs']);

  // Straight onto an action several rows lower: nothing is lit.
  await page.mouse.move(p0Action.x, p0Action.y, {steps: 12});
  await expect.poll(async () => litRows(page)).toEqual([]);

  // Up the action column onto another action: still nothing.
  await page.mouse.move(reviewAction.x, reviewAction.y, {steps: 8});
  await expect.poll(async () => litRows(page)).toEqual([]);

  // Back onto a row: that row alone.
  await page.mouse.move(docs.x, docs.y, {steps: 8});
  await expect.poll(async () => litRows(page)).toEqual(['Docs']);

  // A row, then diagonally down-right to a far action, crossing other rows'
  // text on the way.
  const bug = await center(page, '[role="option"]:has-text("Bug")');
  await page.mouse.move(bug.x, bug.y, {steps: 4});
  await expect.poll(async () => litRows(page)).toEqual(['Bug']);
  await page.mouse.move(p0Action.x, p0Action.y, {steps: 30});
  await expect.poll(async () => litRows(page)).toEqual([]);

  // Rest on the action until its tooltip shows, then leave for a row and
  // come back: the tooltip (a top-layer element over the list) is not a row.
  await expect(page.getByRole('tooltip')).toBeVisible({timeout: 3000});
  await page.mouse.move(docs.x, docs.y, {steps: 10});
  await expect.poll(async () => litRows(page)).toEqual(['Docs']);
  await page.mouse.move(p0Action.x, p0Action.y, {steps: 10});
  await expect.poll(async () => litRows(page)).toEqual([]);

  // A section heading is not a row either.
  const heading = await center(page, 'text=Priority');
  await page.mouse.move(bug.x, bug.y, {steps: 4});
  await expect.poll(async () => litRows(page)).toEqual(['Bug']);
  await page.mouse.move(heading.x, heading.y, {steps: 8});
  await expect.poll(async () => litRows(page)).toEqual([]);
});

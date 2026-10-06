// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file OptionActions.a11y.chromium.spec.ts
 * @input The `Core/MultiSelector` RowActions and RowActionsRtl stories in a
 *   built Storybook.
 * @output Real-engine proof for option actions: the action is visible at rest
 *   beside its row (`spec:AST-058` FR8), the keyboard reaches it through the
 *   inline-end arrow in both directions and fires it with Enter, and the
 *   highlight follows a real mouse across rows and actions.
 * @position Run with `pnpm test:a11y-contract`; paint, pointer paths and the
 *   active descendant as an engine exposes them are not jsdom claims.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
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

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (rect == null) {
    throw new Error(`no box for ${String(locator)}`);
  }
  return rect;
}

async function litRows(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>('[role="row"]'),
    );
    const base = rows.find(r => r.textContent?.includes('P1'));
    const baseBg = base
      ? getComputedStyle(base).backgroundColor
      : 'rgba(0, 0, 0, 0)';
    return rows
      .filter(r => getComputedStyle(r).backgroundColor !== baseBg)
      .map(
        r => r.querySelector('[role="gridcell"]')?.textContent?.trim() ?? '',
      );
  });
}

async function activeDescendant(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const id = document.activeElement?.getAttribute('aria-activedescendant');
    if (!id) {
      return null;
    }
    const el = document.getElementById(id);
    if (!el) {
      return 'missing';
    }
    // The row is named by its option cell; the action cell by the control in
    // it. Report role + that name, not raw text (an icon's title would leak).
    const role = el.getAttribute('role');
    const name =
      role === 'row'
        ? (document.getElementById(el.getAttribute('aria-labelledby') ?? '')
            ?.textContent ?? '')
        : (el.querySelector('button')?.getAttribute('aria-label') ?? '');
    return `${role}:${name.trim()}`;
  });
}

test('actions are visible at rest, in their rows, inside the grid', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--row-actions&viewMode=story`,
  );
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();
  expect(await page.getByRole('listbox').count()).toBe(0);

  for (const label of ['Bug', 'Design review', 'P0', 'P1']) {
    const row = page.getByRole('row', {name: label});
    const action = page.getByRole('button', {name: `Edit ${label}`});
    await expect(action).toBeVisible();
    // Inside its own row, not merely aligned with it.
    expect(await row.locator('button').count()).toBe(1);
    const r = await box(row);
    const a = await box(action);
    expect(Math.abs(r.y + r.height / 2 - (a.y + a.height / 2))).toBeLessThan(2);
    expect(a.x + a.width).toBeLessThanOrEqual(r.x + r.width + 1);
  }
  expect(await page.getByRole('button', {name: 'Edit Docs'}).count()).toBe(0);
  // Two cells per row, every row.
  const shapes = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="row"]')).map(
      r =>
        Array.from(r.children).filter(
          c => c.getAttribute('role') === 'gridcell',
        ).length,
    ),
  );
  expect(shapes.every(n => n === 2)).toBe(true);
});

test('the keyboard reaches an action through the inline-end arrow and fires it with Enter', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--row-actions&viewMode=story`,
  );
  const search = page.getByRole('combobox');
  await expect(search).toBeFocused();
  await search.press('ArrowDown'); // select-all
  await search.press('ArrowDown'); // Feature (no action)
  await search.press('ArrowDown'); // Bug
  await expect.poll(async () => activeDescendant(page)).toBe('row:Bug');
  await search.press('ArrowRight');
  await expect
    .poll(async () => activeDescendant(page))
    .toBe('gridcell:Edit Bug');
  await search.press('Enter');
  await expect(page.getByTestId('last-edited')).toHaveText('Bug');
  // Selection untouched, panel open, highlight where it was.
  await expect(page.getByRole('row', {name: 'Bug'})).toHaveAttribute(
    'aria-selected',
    'false',
  );
  await expect(page.getByRole('grid')).toBeVisible();
  await expect
    .poll(async () => activeDescendant(page))
    .toBe('gridcell:Edit Bug');
  await search.press('ArrowLeft');
  await expect.poll(async () => activeDescendant(page)).toBe('row:Bug');
});

test('under RTL the inline-end arrow is ArrowLeft', async ({page}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--row-actions-rtl&viewMode=story`,
  );
  const trigger = page.getByRole('combobox');
  await expect(page.getByRole('grid')).toBeVisible();
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect.poll(async () => activeDescendant(page)).toBe('row:Bug');
  await trigger.press('ArrowRight');
  await expect.poll(async () => activeDescendant(page)).toBe('row:Bug');
  await trigger.press('ArrowLeft');
  await expect
    .poll(async () => activeDescendant(page))
    .toBe('gridcell:Edit Bug');
  // And the action is painted at the inline end: to the LEFT of the label.
  const label = await box(page.getByText('Bug', {exact: true}));
  const action = await box(page.getByRole('button', {name: 'Edit Bug'}));
  expect(action.x + action.width).toBeLessThanOrEqual(label.x + 1);
});

test('the highlight follows a real mouse across rows and actions', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--row-actions&viewMode=story`,
  );
  await expect(page.getByRole('grid')).toBeVisible();
  const center = async (l: Locator) => {
    const b = await box(l);
    return {x: b.x + b.width / 2, y: b.y + b.height / 2};
  };
  const docs = await center(page.getByRole('row', {name: 'Docs'}));
  const p0Action = await center(page.getByRole('button', {name: 'Edit P0'}));
  const reviewAction = await center(
    page.getByRole('button', {name: 'Edit Design review'}),
  );

  await page.mouse.move(docs.x, docs.y, {steps: 4});
  await expect.poll(async () => litRows(page)).toEqual(['Docs']);
  // Straight onto an action several rows lower: that row, not Docs.
  await page.mouse.move(p0Action.x, p0Action.y, {steps: 12});
  await expect.poll(async () => litRows(page)).toEqual(['P0']);
  await expect
    .poll(async () => activeDescendant(page))
    .toBe('gridcell:Edit P0');
  // Up the action column.
  await page.mouse.move(reviewAction.x, reviewAction.y, {steps: 8});
  await expect.poll(async () => litRows(page)).toEqual(['Design review']);
  // Rest until the tooltip shows, then leave: nothing stale.
  await expect(page.getByRole('tooltip')).toBeVisible({timeout: 3000});
  await page.mouse.move(docs.x, docs.y, {steps: 10});
  await expect.poll(async () => litRows(page)).toEqual(['Docs']);
});

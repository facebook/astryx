// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioCell.a11y.chromium.spec.ts
 * @input The `Core/DropdownMenu` RadioCells story in a built Storybook, real
 *   keyboard and mouse input, forced-colors emulation, and Chromium's own
 *   accessibility tree read over the DevTools protocol.
 * @output Real-engine evidence that radio cells are `menuitemradio` options
 *   named by their labels, that the checked cell carries an accent border
 *   (Highlight under forced colors), and that the arrow keys walk them in DOM
 *   order and Enter picks one.
 * @position Run with `pnpm test:a11y-contract`; jsdom has no computed paint,
 *   no forced colors and no accessibility tree.
 */

import {expect, test, type Page} from '@playwright/test';
import {AxeBuilder} from '@axe-core/playwright';
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

const STORY = 'core-dropdownmenu--radio-cells';

async function openMenu(page: Page) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await page.getByRole('button', {name: 'Customize'}).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

/** Chromium's own name and checked state for every menuitemradio. */
async function radioNodes(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const {nodes} = await cdp.send('Accessibility.getFullAXTree');
  await cdp.detach();
  return nodes
    .filter(node => node.role?.value === 'menuitemradio' && !node.ignored)
    .map(node => ({
      name: String(node.name?.value ?? ''),
      checked:
        node.properties?.find(p => p.name === 'checked')?.value.value ===
        'true',
    }));
}

/** A color resolved the way the page resolves it, for comparing paint. */
async function resolved(page: Page, color: string): Promise<string> {
  return page.evaluate(value => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.querySelector('[role="menu"]')?.append(probe);
    const result = getComputedStyle(probe).color;
    probe.remove();
    return result;
  }, color);
}

async function borderColor(page: Page, name: string): Promise<string> {
  return page
    .getByRole('menuitemradio', {name})
    .evaluate(cell => getComputedStyle(cell).borderTopColor);
}

test('cells are named options with the checked one painted, walked by the arrow keys in DOM order', async ({
  page,
}) => {
  await openMenu(page);
  const radios = await radioNodes(page);
  expect(radios.map(radio => radio.name)).toEqual([
    'Red',
    'Orange',
    'Green',
    'Blue',
    'Purple',
    'Pink',
    'Teal',
    'Gray',
  ]);
  expect(radios.filter(radio => radio.checked).map(r => r.name)).toEqual([
    'Blue',
  ]);
  expect(await borderColor(page, 'Blue')).toBe(
    await resolved(page, 'var(--color-accent)'),
  );
  expect(await borderColor(page, 'Red')).toBe('rgba(0, 0, 0, 0)');

  // The menu takes focus on a pointer open; the arrow keys walk the cells in
  // DOM order, across the grid's rows, and Enter picks one.
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', {name: 'Red'})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', {name: 'Purple'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeHidden();

  await page.getByRole('button', {name: 'Customize'}).click();
  await expect(
    page.getByRole('menuitemradio', {name: 'Purple'}),
  ).toHaveAttribute('aria-checked', 'true');
  expect(await borderColor(page, 'Purple')).toBe(
    await resolved(page, 'var(--color-accent)'),
  );
});

test('after a pointer open, a cell the mouse rests on paints no focus ring, and the keyboard brings it back', async ({
  page,
}) => {
  await openMenu(page);
  const green = page.getByRole('menuitemradio', {name: 'Green'});
  const box = await green.boundingBox();
  if (box == null) {
    throw new Error('the Green cell has no layout box');
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 4,
  });
  await expect(green).toBeFocused();
  expect(
    await green.evaluate(cell => getComputedStyle(cell).outlineStyle),
  ).toBe('none');

  await page.keyboard.press('ArrowDown');
  const blue = page.getByRole('menuitemradio', {name: 'Blue'});
  await expect(blue).toBeFocused();
  expect(await blue.evaluate(cell => getComputedStyle(cell).outlineStyle)).toBe(
    'solid',
  );
});

test('under forced colors the checked cell keeps a visible border and keyboard focus an outline', async ({
  page,
}) => {
  await page.emulateMedia({forcedColors: 'active'});
  await openMenu(page);
  const highlight = await resolved(page, 'Highlight');
  const canvas = await resolved(page, 'Canvas');
  expect(highlight).not.toBe(canvas);
  expect(await borderColor(page, 'Blue')).toBe(highlight);
  expect(await borderColor(page, 'Red')).toBe(canvas);

  await page.keyboard.press('ArrowDown');
  const red = page.getByRole('menuitemradio', {name: 'Red'});
  await expect(red).toBeFocused();
  expect(await red.evaluate(cell => getComputedStyle(cell).outlineStyle)).toBe(
    'solid',
  );
});

test('axe finds no violation in a menu of cells, including tiles in a wrapper grid inside their group', async ({
  page,
}) => {
  await openMenu(page);
  const root = await new AxeBuilder({page}).include('[role="menu"]').analyze();
  expect(root.violations.map(v => v.id)).toEqual([]);

  await page.getByRole('menuitem', {name: 'Tab icon'}).click();
  await expect(page.getByRole('menuitemradio', {name: 'Gear'})).toBeVisible();
  const sub = await new AxeBuilder({page}).include('[role="menu"]').analyze();
  expect(sub.violations.map(v => v.id)).toEqual([]);
});

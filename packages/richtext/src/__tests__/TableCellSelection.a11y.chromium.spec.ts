// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TableCellSelection.a11y.chromium.spec.ts
 * @input The built Storybook's Lab/RichTextEditor "Playground" story, whose
 *   seeded document holds a GFM table in an editable surface.
 * @output Real-browser proof that a table selection is visible: the cells a
 *   drag covers are painted differently from the cells it does not, the paint
 *   marks exactly the cells the next keystroke replaces, and it goes when the
 *   selection goes.
 *
 * A table selection is made of DOM the engine owns and a class name the theme
 * supplies. Nothing in a unit test can see whether that class was ever named:
 * `addClassNamesToElement(element, theme.tableCellSelected)` is a silent
 * no-op when the slot is undefined, which is how cells in a selection came to
 * be painted exactly like cells outside one. Only a real engine, dragging
 * across real cells, can tell the two apart.
 *
 * Run after building Storybook:
 *   pnpm storybook:build
 *   pnpm exec playwright test packages/richtext --project chromium
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const STORYBOOK_DIR = process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR;
const STORY = 'lab-richtexteditor--playground';
const EDITOR = '[data-playground-editor] [role="textbox"]';
const CELLS = `${EDITOR} table th, ${EDITOR} table td`;

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(STORYBOOK_DIR);
});

test.afterAll(async () => {
  await storybook?.close();
});

/** Opens the story and puts a 3×3 table with known content in the editor. */
async function openWithTable(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('404')) {
      errors.push(message.text());
    }
  });
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story&globals=astryxTheme:neutral;colorMode:light;direction:ltr`,
    {waitUntil: 'load'},
  );
  await expect(page.locator(EDITOR)).toBeVisible();

  // A table of its own, away from the seeded document, so the cell indices
  // below mean what they say.
  await page.getByRole('button', {name: 'Clear', exact: true}).click();
  await page.locator(EDITOR).click();
  await page.getByRole('button', {name: 'Table', exact: true}).click();
  await expect(page.locator(CELLS)).toHaveCount(9);
  for (const [index, word] of [
    [0, 'Area'],
    [1, 'Owner'],
    [3, 'Sync'],
    [4, 'Platform'],
  ] as const) {
    await page.locator(CELLS).nth(index).click();
    await page.keyboard.type(word);
  }
  return errors;
}

/** Each cell's background colour, in document order. */
const backgrounds = (page: Page): Promise<string[]> =>
  page.$$eval(CELLS, cells =>
    cells.map(cell => getComputedStyle(cell).backgroundColor),
  );

const texts = (page: Page): Promise<string[]> =>
  page.$$eval(CELLS, cells =>
    cells.map(cell => cell.textContent?.trim() ?? ''),
  );

/** Drags from one cell to another, the gesture that selects a cell range. */
async function dragAcross(page: Page, from: number, to: number) {
  const start = await page.locator(CELLS).nth(from).boundingBox();
  const end = await page.locator(CELLS).nth(to).boundingBox();
  if (start == null || end == null) {
    throw new Error('a cell has no box');
  }
  await page.mouse.move(start.x + 15, start.y + start.height / 2);
  await page.mouse.down();
  // Past the anchor cell's edge first: the engine starts highlighting once
  // the pointer leaves the cell it went down in.
  await page.mouse.move(start.x + 40, start.y + start.height / 2, {steps: 4});
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 20,
  });
  await page.mouse.up();
}

test('the cells a selection covers are painted, and the rest are not', async ({
  page,
}) => {
  const errors = await openWithTable(page);

  const before = await backgrounds(page);
  expect(new Set(before).size, 'no cell is painted before a selection').toBe(1);

  // The top-left 2×2 block of a 3-column table: cells 0, 1, 3 and 4.
  await dragAcross(page, 0, 4);
  const after = await backgrounds(page);

  const selected = [0, 1, 3, 4];
  const unselected = [2, 5, 6, 7, 8];
  const paint = after[0];
  expect(paint, 'the selection paints the cells it covers').not.toBe(before[0]);
  for (const index of selected) {
    expect(after[index], `cell ${index} is in the selection`).toBe(paint);
  }
  for (const index of unselected) {
    expect(after[index], `cell ${index} is outside the selection`).toBe(
      before[index],
    );
  }
  expect(errors).toEqual([]);
});

test('the paint marks exactly the cells the next keystroke replaces', async ({
  page,
}) => {
  const errors = await openWithTable(page);
  const before = await backgrounds(page);
  const filled = (await texts(page))
    .map((text, index) => (text === '' ? -1 : index))
    .filter(index => index !== -1);

  await dragAcross(page, 0, 4);

  // Painted = the cells whose background the selection actually changed, so
  // an unpainted selection yields an empty set rather than every cell.
  const after = await backgrounds(page);
  const painted = after
    .map((background, index) => (background === before[index] ? -1 : index))
    .filter(index => index !== -1);
  expect(painted, 'the selection paints the 2×2 block it covers').toEqual([
    0, 1, 3, 4,
  ]);

  await page.keyboard.press('Backspace');
  const emptied = (await texts(page))
    .map((text, index) => (text === '' ? index : -1))
    .filter(index => index !== -1 && filled.includes(index));

  // Every cell the keystroke emptied was painted first, and nothing else was.
  expect(emptied, 'the keystroke emptied the cells that were painted').toEqual(
    painted.filter(index => filled.includes(index)),
  );
  expect(errors).toEqual([]);
});

test('the paint goes when the selection goes', async ({page}) => {
  const errors = await openWithTable(page);
  const before = await backgrounds(page);

  await dragAcross(page, 0, 4);
  expect(new Set(await backgrounds(page)).size).toBeGreaterThan(1);

  // A caret in one cell is not a cell selection.
  await page.locator(CELLS).nth(8).click();
  await expect.poll(async () => new Set(await backgrounds(page)).size).toBe(1);
  expect(await backgrounds(page)).toEqual(before);
  expect(errors).toEqual([]);
});

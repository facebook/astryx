// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorPressOpen.a11y.chromium.spec.ts
 * @input The checked-in Core/Selector › Default story, a built Storybook and
 *   a real mouse in Chromium
 * @output Browser evidence for Selector FR8: a mouse opens the list on
 *   press-down and drags into it to pick; the row the list places under the
 *   press is a click's landing, never a pick, measured against the rows the
 *   press model reports in a real layout; a quick release off the trigger
 *   button keeps the list open and a settled one closes it; a pointer press
 *   paints no keyboard focus ring on the ghost and secondary triggers
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

// In a searchable Selector the list opens below the field (FR2), so the
// field's padding, outside the trigger button, is outside the list too.
const SEARCHABLE_TRIGGER = '#storybook-root button[aria-haspopup="listbox"]';

async function mountSearchable(page: Page) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-selector--searchable&viewMode=story`,
  );
  await expect(page.locator(SEARCHABLE_TRIGGER)).toBeVisible();
}

async function searchableTriggerPoints(page: Page) {
  const boxes = await page.locator(SEARCHABLE_TRIGGER).evaluate(button => {
    const field = button.parentElement;
    const b = button.getBoundingClientRect();
    const f = field?.getBoundingClientRect();
    return {
      button: {
        left: b.left,
        top: b.top,
        bottom: b.bottom,
        width: b.width,
        height: b.height,
      },
      fieldBottom: f?.bottom ?? null,
    };
  });
  if (
    boxes.fieldBottom == null ||
    boxes.fieldBottom - boxes.button.bottom < 2
  ) {
    throw new Error('the trigger field has no padding below its button');
  }
  return {
    value: {
      x: boxes.button.left + boxes.button.width / 2,
      y: boxes.button.top + boxes.button.height / 2,
    },
    padding: {
      x: boxes.button.left + boxes.button.width / 2,
      y: (boxes.button.bottom + boxes.fieldBottom) / 2,
    },
  };
}

async function isPaddingOutsideList(page: Page, point: {x: number; y: number}) {
  return page.evaluate(
    ({x, y}) => document.elementFromPoint(x, y)?.closest('[popover]') == null,
    point,
  );
}

test('a quick click that drifts off the value onto the field padding leaves the list open, as the click did before', async ({
  page,
}) => {
  await mountSearchable(page);
  const {value, padding} = await searchableTriggerPoints(page);
  await page.mouse.move(value.x, value.y);
  await page.mouse.down();
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await isPaddingOutsideList(page, padding)).toBe(true);
  await page.mouse.move(padding.x, padding.y, {steps: 2});
  await page.mouse.up();
  await page.waitForTimeout(150);
  await expect(page.getByRole('listbox')).toBeVisible();
});

test('a settled press released on the field padding closes the list', async ({
  page,
}) => {
  await mountSearchable(page);
  const {value, padding} = await searchableTriggerPoints(page);
  await page.mouse.move(value.x, value.y);
  await page.mouse.down();
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await isPaddingOutsideList(page, padding)).toBe(true);
  await page.waitForTimeout(400);
  await page.mouse.move(padding.x, padding.y, {steps: 2});
  await page.mouse.up();
  await expect(page.getByRole('listbox')).toBeHidden();
});

for (const variant of ['ghost', 'secondary']) {
  test(`a mouse press on a ${variant} trigger paints no keyboard focus ring`, async ({
    page,
  }) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=core-selector--${variant}-variant&viewMode=story`,
    );
    const button = page.locator(TRIGGER).first();
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    if (box == null) {
      throw new Error('the trigger has no rendered bounds');
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.mouse.up();
    await expect(button).toBeFocused();
    expect(
      await button.evaluate(
        el =>
          `${el.matches(':focus-visible')} ${el.parentElement == null ? '' : getComputedStyle(el.parentElement).outlineStyle}`,
      ),
    ).toBe('false none');
  });
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MonthYearWheels.interaction.browser.spec.ts
 * @input The built "Bottom Sheet Calendar" DateInput story (October 15, 2026
 *   in a 2026 range), real touch input and the interaction harness
 * @output Interaction proofs for the month/year wheels behind the calendar
 *   title moving the date like UIDatePicker's: a drag of the month wheel moves
 *   the chosen date to the next month keeping its day, and the month wheel
 *   loops past December to January of the same year
 * @position Interaction tests of MonthYearWheels.tsx and TouchDateField.tsx
 *   (`*.interaction.browser.spec.ts`, run by `pnpm test:interaction`)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  openStory,
  touchDriver,
  waitForRest,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

async function openWheels(page: Page) {
  await openStory(page, storybook(), 'core-dateinput--bottom-sheet-calendar');
  const driver = await touchDriver(page);
  const tapCenter = async (locator: Locator) => {
    const box = await locator.boundingBox();
    if (box == null) {
      throw new Error('no box');
    }
    await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  };
  await tapCenter(page.getByRole('button', {name: /calendar/i}).first());
  const sheet = page
    .getByRole('dialog')
    .locator('.astryx-bottom-sheet')
    .first();
  await waitForRest(sheet);
  await tapCenter(page.locator('[data-title="month-year"]'));
  const months = page.getByRole('listbox', {name: 'Month'});
  await expect(months).toBeVisible();
  await waitForRest(page.locator('[data-panel="wheels"]').first());
  return {driver, months, field: page.locator('input').first()};
}

/** A slow drag of `rows` rows up (later months), resting before the lift. */
async function turnRows(driver: TouchDriver, column: Locator, rows: number) {
  const box = await column.boundingBox();
  if (box == null) {
    throw new Error('no column');
  }
  const from = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  // 32 px rows plus the pan's hysteresis.
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y - rows * 32 - 10},
      {durationMs: 250 + rows * 100, restMs: 150},
    ),
  );
}

async function restingLabel(column: Locator): Promise<string | null> {
  return column.evaluate(element => {
    const id = element.getAttribute('aria-activedescendant');
    return id == null
      ? null
      : (document.getElementById(id)?.textContent ?? null);
  });
}

test('a turn of the month wheel moves the chosen date, keeping its day', async ({
  page,
}) => {
  const {driver, months, field} = await openWheels(page);
  expect(await restingLabel(months)).toBe('October');
  await turnRows(driver, months, 1);
  await expect.poll(async () => restingLabel(months)).toBe('November');
  await expect(field).toHaveValue('November 15, 2026');
});

test('the month wheel loops past December to January of the same year', async ({
  page,
}) => {
  const {driver, months, field} = await openWheels(page);
  await turnRows(driver, months, 3);
  await expect.poll(async () => restingLabel(months)).toBe('January');
  await expect(field).toHaveValue('January 15, 2026');
});

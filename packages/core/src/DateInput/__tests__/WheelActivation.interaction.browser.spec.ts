// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file WheelActivation.interaction.browser.spec.ts
 * @input The built DateInput stories "BottomSheetWideRange" (200 years) and
 *   "BottomSheetNarrowRange" (2 years), real touch input
 * @output Proof that showing a touch wheel (a finger gets it on every engine)
 *   costs no more per year than today's column: opening the month and year
 *   wheels writes no element per year, each year is drawn once, and only
 *   the rows in sight tip. Under a mouse the year wheel is today's column,
 *   every year listed natively.
 * @position Browser proof for DateInput/PickerWheel.tsx's rows, run by
 *   playwright.interaction.config.ts. It counts the elements an opening
 *   writes rather than timing it: the load on the machine running it moves
 *   a frame clock, never that count.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  touchDriver,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** The most rows a column shows on its cylinder at once, around the band. */
const ROWS_IN_SIGHT = 15;

interface Activation {
  /** Year options listed, and year rows drawn on the drum. */
  yearOptions: number;
  yearRowsDrawn: number;
  /**
   * The year wheel's elements the opening wrote (any attribute) or added,
   * from the tap that shows the wheels until the year wheel rests.
   */
  yearElementsWritten: number;
}

async function openMonthYearWheels(
  page: Page,
  storyId: string,
): Promise<Activation> {
  await openStory(page, storybook(), storyId);
  const driver = await touchDriver(page);
  const field = page.getByRole('combobox', {name: 'Date of birth'});
  const fieldBox = await field.boundingBox();
  if (fieldBox == null) {
    throw new Error('no field');
  }
  await driver.tap({
    x: fieldBox.x + fieldBox.width / 2,
    y: fieldBox.y + fieldBox.height / 2,
  });
  const title = page.locator('[data-title="month-year"]');
  await expect(title).toBeVisible();
  await waitForRest(page.locator('.astryx-bottom-sheet').first());
  const titleBox = await title.boundingBox();
  if (titleBox == null) {
    throw new Error('no month and year title');
  }
  // Every element of the year wheel the opening writes or adds, recorded as
  // it happens.
  await page.evaluate(() => {
    const written = new Set<Element>();
    (window as unknown as {__yearWritten: Set<Element>}).__yearWritten =
      written;
    const inYear = (node: Node): node is Element =>
      node instanceof Element &&
      node.closest('[role="listbox"][aria-label="Year"]') != null;
    new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'attributes' && inYear(record.target)) {
          written.add(record.target);
        }
        for (const node of record.addedNodes) {
          if (node instanceof Element) {
            for (const element of [node, ...node.querySelectorAll('*')]) {
              if (inYear(element)) {
                written.add(element);
              }
            }
          }
        }
      }
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      childList: true,
    });
  });
  await driver.tap({
    x: titleBox.x + titleBox.width / 2,
    y: titleBox.y + titleBox.height / 2,
  });
  const years = page.getByRole('listbox', {name: 'Year'});
  await expect(years).toBeVisible();
  await waitForRest(years.locator('[data-wheel-strip]'));
  return {
    yearOptions: await years.getByRole('option').count(),
    // Rows in sight: every row the wheel draws, copies included, with
    // some opacity (a row out of sight is transparent and upright).
    yearRowsDrawn: await years.evaluate(
      list =>
        [
          ...list.querySelectorAll<HTMLElement>(
            '[data-wheel-row], [data-wheel-copy]',
          ),
        ].filter(row => Number(row.style.opacity) > 0).length,
    ),
    yearElementsWritten: await page.evaluate(
      () =>
        (window as unknown as {__yearWritten: Set<Element>}).__yearWritten.size,
    ),
  };
}

test('the month and year wheels tip the same rows for 200 years as for 2, and opening them writes no element per year', async ({
  page,
}, testInfo) => {
  const narrow = await openMonthYearWheels(
    page,
    'core-dateinput--bottom-sheet-narrow-range',
  );
  const wide = await openMonthYearWheels(
    page,
    'core-dateinput--bottom-sheet-wide-range',
  );
  testInfo.annotations.push({
    type: 'activation',
    description: JSON.stringify({narrow, wide}),
  });
  expect(narrow.yearOptions).toBe(2);
  expect(wide.yearOptions).toBe(200);
  // The touch column.
  await expect(page.locator('[data-wheel]')).toHaveCount(2);
  expect(narrow.yearRowsDrawn).toBe(2);
  // The rows in sight: the same for any range; every other year is drawn
  // once, flat and transparent.
  expect(wide.yearRowsDrawn).toBeLessThanOrEqual(ROWS_IN_SIGHT);
  // What opening costs, counted: the year wheel parks on its year, writing
  // the rows that leave sight and the rows that come into it, and its strip,
  // beside what the two-year wheel writes. A cost per year (every row
  // written as the wheel opens) shows here as 200 or more.
  expect(wide.yearElementsWritten).toBeLessThanOrEqual(
    narrow.yearElementsWritten + 2 * ROWS_IN_SIGHT + 1,
  );
});

test.describe('under a mouse', () => {
  // A desktop: today's column, in the sheet the story asks for.
  test.use({hasTouch: false, isMobile: false});

  test('the year wheel is the scrolling column with every year', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'one engine is enough for the fine-pointer path, which is main’s column',
    );
    await openStory(
      page,
      storybook(),
      'core-dateinput--bottom-sheet-wide-range',
    );
    // A mouse case runs under a fine primary pointer: the page agrees.
    expect(
      await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page.getByRole('combobox', {name: 'Date of birth'}).click();
    const title = page.locator('[data-title="month-year"]');
    await expect(title).toBeVisible();
    await title.click();
    const years = page.getByRole('listbox', {name: 'Year'});
    await expect(years).toBeVisible();
    await expect(page.locator('[data-wheel]')).toHaveCount(0);
    expect(await years.getByRole('option').count()).toBe(200);
  });
});

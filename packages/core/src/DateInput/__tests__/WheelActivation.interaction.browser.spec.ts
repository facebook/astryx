// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file WheelActivation.interaction.browser.spec.ts
 * @input The built DateInput stories "BottomSheetWideRange" (200 years) and
 *   "BottomSheetNarrowRange" (2 years), real touch input, CPU throttling
 * @output Proof that showing a touch wheel (a finger gets it on every engine)
 *   costs no more per year than today's column: the month and year wheels
 *   open about as fast for two centuries as for two years, each year is
 *   drawn once, and only the rows in sight tip. Under a mouse the year wheel
 *   is today's column, every year listed natively.
 * @position Browser proof for DateInput/PickerWheel.tsx's rows, run by
 *   playwright.interaction.config.ts (Chromium: CPU throttling and long-task
 *   timing come from the DevTools protocol)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  touchDriver,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** A phone CPU against the machine running the proof. */
const THROTTLE = 4;

interface Activation {
  /** Year options listed, and year rows drawn on the drum. */
  yearOptions: number;
  yearRowsDrawn: number;
  /** The longest gap between frames after the tap, ms. */
  worstFrameMs: number;
}

async function openMonthYearWheels(
  page: Page,
  storyId: string,
  throttle: boolean,
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
  await waitForRest(page.locator('.astryx-bottom-sheet').first()).catch(
    () => {},
  );
  await page.waitForTimeout(500);
  const titleBox = await title.boundingBox();
  if (titleBox == null) {
    throw new Error('no month and year title');
  }
  const cdp = throttle ? await page.context().newCDPSession(page) : null;
  await cdp?.send('Emulation.setCPUThrottlingRate', {rate: THROTTLE});
  try {
    await page.evaluate(() => {
      const frames: number[] = [];
      (window as unknown as {__frames: number[]}).__frames = frames;
      const loop = (time: number) => {
        frames.push(time);
        if (frames.length < 600) {
          requestAnimationFrame(loop);
        }
      };
      requestAnimationFrame(loop);
    });
    await page.waitForTimeout(300);
    const tapAt = await page.evaluate(() => performance.now());
    await driver.tap({
      x: titleBox.x + titleBox.width / 2,
      y: titleBox.y + titleBox.height / 2,
    });
    await expect(page.getByRole('listbox', {name: 'Year'})).toBeVisible();
    await page.waitForTimeout(1500);
    const worstFrameMs = await page.evaluate(start => {
      const frames = (window as unknown as {__frames: number[]}).__frames;
      const after = frames.filter(time => time >= start);
      let worst = 0;
      for (let i = 1; i < after.length; i++) {
        worst = Math.max(worst, after[i] - after[i - 1]);
      }
      return worst;
    }, tapAt);
    const years = page.getByRole('listbox', {name: 'Year'});
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
      worstFrameMs,
    };
  } finally {
    await cdp?.send('Emulation.setCPUThrottlingRate', {rate: 1});
  }
}

test('the month and year wheels tip the same rows for 200 years as for 2, and open about as fast', async ({
  page,
  browserName,
}, testInfo) => {
  // CPU throttling comes from the DevTools protocol: WebKit checks the rows
  // without it.
  const throttle = browserName === 'chromium';
  // A first opening warms the page up (code and styles loaded, compiled);
  // both measured openings come after it.
  await openMonthYearWheels(
    page,
    'core-dateinput--bottom-sheet-narrow-range',
    throttle,
  );
  const narrow = await openMonthYearWheels(
    page,
    'core-dateinput--bottom-sheet-narrow-range',
    throttle,
  );
  const wide = await openMonthYearWheels(
    page,
    'core-dateinput--bottom-sheet-wide-range',
    throttle,
  );
  testInfo.annotations.push({
    type: 'activation',
    description: JSON.stringify({
      throttle: throttle ? THROTTLE : 1,
      narrow,
      wide,
    }),
  });
  expect(narrow.yearOptions).toBe(2);
  expect(wide.yearOptions).toBe(200);
  // The touch column.
  await expect(page.locator('[data-wheel]')).toHaveCount(2);
  expect(narrow.yearRowsDrawn).toBe(2);
  // The rows in sight: the same for any range; every other year is drawn
  // once, flat and transparent.
  expect(wide.yearRowsDrawn).toBeLessThanOrEqual(15);
  if (throttle) {
    // A guard, not a measure: the long range may cost its plain options
    // (and the frame clock is coarse), never a cost per tipped year.
    expect(wide.worstFrameMs).toBeLessThanOrEqual(
      narrow.worstFrameMs * 1.5 + 50,
    );
  }
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PageControl.interaction.browser.spec.ts
 * @input The built "Default" and "Many Pages" PageControl stories, real touch
 *   input (Chromium CDP / WebKit's tap path) and the interaction harness
 * @output Proof that a tap on either side of the current indicator moves one
 *   page that way when the finger lifts, that a pan never pages, that the
 *   control lets the page scroll under it (touch-action), and that a long
 *   control keeps the current indicator in view
 * @position Browser proof for the lab PageControl, run by
 *   `pnpm test:interaction`
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  openStory,
  touchDriver,
  touchStoryboard,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

async function open(page: Page, story = 'lab-pagecontrol--default') {
  await openStory(page, storybook(), story);
  const slider = page.getByRole('slider');
  const driver = await touchDriver(page);
  return {slider, driver};
}

/** The centre of indicator `index`, page coordinates. */
async function indicatorCenter(slider: Locator, index: number) {
  return slider.evaluate((el, i) => {
    const dot = el.firstElementChild?.children[i] as HTMLElement;
    const box = dot.getBoundingClientRect();
    return {x: box.left + box.width / 2, y: box.top + box.height / 2};
  }, index);
}

const valueNow = async (slider: Locator) =>
  Number(await slider.getAttribute('aria-valuenow'));

test('a tap on the trailing side of the current indicator moves one page forward, the leading side one back', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  expect(await valueNow(slider)).toBe(3);
  const current = await indicatorCenter(slider, 2);
  await driver.tap({x: current.x + 30, y: current.y});
  await expect.poll(async () => valueNow(slider)).toBe(4);
  await expect(page.getByTestId('page')).toHaveText('Page 4');
  const next = await indicatorCenter(slider, 3);
  await driver.tap({x: next.x - 30, y: next.y});
  await expect.poll(async () => valueNow(slider)).toBe(3);
});

test('the page changes when the finger lifts, not when it lands', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  const current = await indicatorCenter(slider, 2);
  const at = {x: current.x + 30, y: current.y};
  let whileDown = NaN;
  // A finger held 200 ms (a 0.4 px creep, so moves are reported) then lifted.
  await driver.play(
    drag(at, {x: at.x + 0.4, y: at.y}, {durationMs: 200, hz: 10}),
    {
      onEvent: async step => {
        if (step.type === 'touchMove' && Number.isNaN(whileDown)) {
          whileDown = await valueNow(slider);
        }
      },
    },
  );
  expect(whileDown).toBe(3);
  await expect.poll(async () => valueNow(slider)).toBe(4);
});

test('a drag across the control does not page, and the page can scroll under it', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  expect(await slider.evaluate(el => getComputedStyle(el).touchAction)).toBe(
    'manipulation',
  );
  const current = await indicatorCenter(slider, 2);
  await driver.play(
    drag(
      {x: current.x + 30, y: current.y},
      {x: current.x - 40, y: current.y},
      {durationMs: 300},
    ),
  );
  await page.waitForTimeout(100);
  expect(await valueNow(slider)).toBe(3);
});

test('outside iOS (an Android phone) the control pages the same: a tap steps one page, the arrow keys step', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  // A finger, and an engine without -webkit-touch-callout: the default idiom.
  expect(
    await page.evaluate(() => ({
      coarse: matchMedia('(pointer: coarse)').matches,
      ios: CSS.supports('(-webkit-touch-callout: none)'),
    })),
  ).toEqual({coarse: true, ios: false});
  const current = await indicatorCenter(slider, 2);
  await driver.tap({x: current.x + 30, y: current.y});
  await expect.poll(async () => valueNow(slider)).toBe(4);
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => valueNow(slider)).toBe(3);
});

test('a long control keeps the current indicator in view', async ({page}) => {
  const {slider} = await open(page, 'lab-pagecontrol--many-pages');
  const box = await slider.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  expect(box.width).toBeCloseTo(161.3, 0);
  const current = await indicatorCenter(slider, 25);
  expect(current.x).toBeGreaterThan(box.x + 14);
  expect(current.x).toBeLessThan(box.x + box.width - 14);
});

test('storyboard: a tap on the trailing side @storyboard', async ({page}) => {
  const {slider, driver} = await open(page);
  const current = await indicatorCenter(slider, 2);
  const at = {x: current.x + 30, y: current.y};
  const box = await slider.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const storyboard = await touchStoryboard(
    page,
    driver,
    drag(at, {x: at.x + 0.4, y: at.y}, {durationMs: 100, hz: 20}),
    {
      name: 'page-control-tap',
      clip: {
        x: box.x - 8,
        y: box.y - 8,
        width: box.width + 16,
        height: box.height + 16,
      },
      measure: async () => ({page: await valueNow(slider)}),
    },
  );
  await storyboard.write(test.info());
  const pages = storyboard.frames.map(f => (f.data as {page: number}).page);
  // Page 3 until the lift, page 4 after it.
  expect(pages[0]).toBe(3);
  expect(pages.slice(0, -1).every(p => p === 3)).toBe(true);
  expect(pages[pages.length - 1]).toBe(4);
});

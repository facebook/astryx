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

test('on an Android phone (no -webkit-touch-callout) the control pages the same: one touch model, no platform idiom', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  // A finger on an engine without -webkit-touch-callout: nothing asks for iOS.
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

/**
 * The painted size of every indicator, in device pixels: the control's
 * screenshot decoded in the page, each dark run across its middle row and the
 * dark run down through that run's centre. Runs cut by the screenshot's edge
 * are left out.
 */
async function paintedDots(page: Page, slider: Locator) {
  const png = await slider.screenshot();
  return page.evaluate(async b64 => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const g = canvas.getContext('2d');
    if (g == null) {
      throw new Error('no 2d context');
    }
    g.drawImage(img, 0, 0);
    const {data, width, height} = g.getImageData(0, 0, img.width, img.height);
    const dark = (x: number, y: number) => data[(y * width + x) * 4] < 200;
    const cy = Math.floor(height / 2);
    const dots: Array<{width: number; height: number}> = [];
    for (let x = 0; x < width;) {
      if (!dark(x, cy)) {
        x++;
        continue;
      }
      let x1 = x;
      while (x1 < width && dark(x1, cy)) {
        x1++;
      }
      const mid = (x + x1) >> 1;
      let y0 = cy;
      while (y0 > 0 && dark(mid, y0 - 1)) {
        y0--;
      }
      let y1 = cy;
      while (y1 < height - 1 && dark(mid, y1 + 1)) {
        y1++;
      }
      if (x > 0 && x1 < width) {
        dots.push({width: x1 - x, height: y1 - y0 + 1});
      }
      x = x1;
    }
    return dots;
  }, png.toString('base64'));
}

for (const [story, count] of [
  ['lab-pagecontrol--default', 5],
  ['lab-pagecontrol--many-pages', 9],
] as const) {
  test(`every indicator paints round, as wide as it is tall (${story})`, async ({
    page,
  }) => {
    const {slider} = await open(page, story);
    const dots = await paintedDots(page, slider);
    expect(dots.length).toBeGreaterThanOrEqual(count);
    for (const dot of dots) {
      expect(
        Math.abs(dot.width - dot.height),
        JSON.stringify(dots),
      ).toBeLessThanOrEqual(1);
    }
  });
}

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

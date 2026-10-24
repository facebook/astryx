// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SliderGeometry.a11y.chromium.spec.ts
 * @input Built Slider stories in real Chromium, under LTR, RTL and mixed-direction regions, and vertical
 * @output Browser evidence that thumbs and fills sit where their values put them and never leave the control, and that a drag of a slider displaying no value lays out nothing per move
 * @position Slider geometry proof; jsdom computes neither container units nor translate, so placement is checked here
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

// Which direction the slider's own region reads in (Storybook's direction
// global sets it on the story's wrapper), and how the page around it is set.
// The mixed cases are where a flip keyed on any RTL ancestor, rather than on
// the element's own direction, puts thumbs outside the control.
const REGIONS = [
  {name: 'LTR page', page: 'ltr', region: 'ltr', rtl: false},
  {name: 'RTL page', page: 'rtl', region: 'rtl', rtl: true},
  {name: 'LTR region of an RTL page', page: 'rtl', region: 'ltr', rtl: false},
  {name: 'RTL region of an LTR page', page: 'ltr', region: 'rtl', rtl: true},
] as const;

const TOLERANCE = 1;

async function mount(
  page: Page,
  storyId: string,
  pageDir: string,
  regionDir: string,
) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story&globals=direction:${regionDir}`,
  );
  await page.locator('.astryx-slider-control').first().waitFor();
  await page.evaluate(pageDirection => {
    document.documentElement.dir = pageDirection;
  }, pageDir);
  await page.evaluate(
    async () =>
      new Promise(resolve => requestAnimationFrame(() => resolve(null))),
  );
}

interface Geometry {
  control: {left: number; right: number};
  thumbs: {left: number; right: number; center: number}[];
  fill: {left: number; right: number} | null;
}

async function measure(page: Page): Promise<Geometry> {
  return page.evaluate(() => {
    const control = document.querySelector<HTMLElement>(
      '.astryx-slider-control',
    );
    if (!control) {
      throw new Error('missing slider control');
    }
    const c = control.getBoundingClientRect();
    const thumbs = Array.from(
      control.querySelectorAll<HTMLElement>('[role="slider"]'),
    ).map(thumb => {
      const r = thumb.getBoundingClientRect();
      return {left: r.left, right: r.right, center: (r.left + r.right) / 2};
    });
    // The painted fill is the bar clipped by its mover and by the fill clip.
    const bar = Array.from(
      control.querySelectorAll<HTMLElement>('[style*="--_slider-fill-end"]'),
    ).at(-1);
    let fill: {left: number; right: number} | null = null;
    if (bar) {
      let left = -Infinity;
      let right = Infinity;
      for (
        let node: HTMLElement | null = bar;
        node && node !== control;
        node = node.parentElement
      ) {
        const r = node.getBoundingClientRect();
        left = Math.max(left, r.left);
        right = Math.min(right, r.right);
      }
      fill = right > left ? {left, right} : {left, right: left};
    }
    return {control: {left: c.left, right: c.right}, thumbs, fill};
  });
}

function expectInside(g: Geometry, label: string) {
  for (const thumb of g.thumbs) {
    expect(thumb.left, `${label}: thumb left edge`).toBeGreaterThanOrEqual(
      g.control.left - TOLERANCE,
    );
    expect(thumb.right, `${label}: thumb right edge`).toBeLessThanOrEqual(
      g.control.right + TOLERANCE,
    );
  }
}

for (const region of REGIONS) {
  test(`a single slider's thumb and fill follow its value: ${region.name}`, async ({
    page,
  }) => {
    await mount(page, 'core-slider--default', region.page, region.region);
    const thumb = page.getByRole('slider');
    const startEdge = (g: Geometry) =>
      region.rtl ? g.control.right : g.control.left;

    // The story starts at 50: the thumb is centred on the control.
    let g = await measure(page);
    expectInside(g, 'value 50');
    const mid = (g.control.left + g.control.right) / 2;
    expect(Math.abs(g.thumbs[0].center - mid)).toBeLessThanOrEqual(TOLERANCE);

    await thumb.focus();
    await page.keyboard.press('Home');
    g = await measure(page);
    expectInside(g, 'value 0');
    // At the minimum the thumb sits flush with the start edge, inside it.
    const atMin = region.rtl ? g.thumbs[0].right : g.thumbs[0].left;
    expect(Math.abs(atMin - startEdge(g))).toBeLessThanOrEqual(TOLERANCE);

    await page.keyboard.press('End');
    g = await measure(page);
    expectInside(g, 'value 100');
    const endEdge = region.rtl ? g.control.left : g.control.right;
    const atMax = region.rtl ? g.thumbs[0].left : g.thumbs[0].right;
    expect(Math.abs(atMax - endEdge)).toBeLessThanOrEqual(TOLERANCE);

    // The fill runs from the start edge to the thumb's center.
    const fill = g.fill;
    if (fill == null) {
      throw new Error('missing fill');
    }
    const fillStart = region.rtl ? fill.right : fill.left;
    const fillEnd = region.rtl ? fill.left : fill.right;
    expect(Math.abs(fillStart - startEdge(g))).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(fillEnd - g.thumbs[0].center)).toBeLessThanOrEqual(
      TOLERANCE,
    );
  });

  test(`a range's thumbs and fill follow its values: ${region.name}`, async ({
    page,
  }) => {
    await mount(page, 'core-slider--range', region.page, region.region);
    const g = await measure(page);
    expectInside(g, 'range 20-80');
    expect(g.thumbs).toHaveLength(2);
    const [lower, upper] = g.thumbs;
    // The lower value sits nearer the region's start edge.
    if (region.rtl) {
      expect(lower.center).toBeGreaterThan(upper.center);
    } else {
      expect(lower.center).toBeLessThan(upper.center);
    }
    // The fill spans exactly between the two thumbs' centers.
    const fill = g.fill;
    if (fill == null) {
      throw new Error('missing fill');
    }
    const span = [lower.center, upper.center].sort((a, b) => a - b);
    expect(Math.abs(fill.left - span[0])).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(fill.right - span[1])).toBeLessThanOrEqual(TOLERANCE);
  });
}

// Moving the thumbs and the fill is a translate in container units, so a
// drag of a slider that displays no value lays out nothing per move; a
// value tooltip or text display still lays out as its text changes.
interface VerticalGeometry {
  control: {top: number; bottom: number};
  thumb: {top: number; bottom: number; center: number};
  fill: {top: number; bottom: number} | null;
}

async function measureVertical(page: Page): Promise<VerticalGeometry> {
  return page.evaluate(() => {
    const control = document.querySelector<HTMLElement>(
      '.astryx-slider-control',
    );
    const thumbEl = control?.querySelector<HTMLElement>('[role="slider"]');
    if (!control || !thumbEl) {
      throw new Error('missing slider control or thumb');
    }
    const c = control.getBoundingClientRect();
    const t = thumbEl.getBoundingClientRect();
    const bar = Array.from(
      control.querySelectorAll<HTMLElement>('[style*="--_slider-fill-end"]'),
    ).at(-1);
    let fill: {top: number; bottom: number} | null = null;
    if (bar) {
      let top = -Infinity;
      let bottom = Infinity;
      for (
        let node: HTMLElement | null = bar;
        node && node !== control;
        node = node.parentElement
      ) {
        const r = node.getBoundingClientRect();
        top = Math.max(top, r.top);
        bottom = Math.min(bottom, r.bottom);
      }
      fill = bottom > top ? {top, bottom} : {top: bottom, bottom};
    }
    return {
      control: {top: c.top, bottom: c.bottom},
      thumb: {top: t.top, bottom: t.bottom, center: (t.top + t.bottom) / 2},
      fill,
    };
  });
}

test("a vertical slider's thumb stays inside the control and its fill follows the value", async ({
  page,
}) => {
  await mount(page, 'core-slider--vertical-orientation', 'ltr', 'ltr');
  const thumb = page.getByRole('slider');
  await thumb.focus();

  // At the minimum the thumb sits flush with the bottom edge, inside it
  // (#5050: half of it used to hang below the control).
  await page.keyboard.press('Home');
  let g = await measureVertical(page);
  expect(Math.abs(g.thumb.bottom - g.control.bottom)).toBeLessThanOrEqual(
    TOLERANCE,
  );
  expect(g.thumb.top).toBeGreaterThanOrEqual(g.control.top - TOLERANCE);

  // At the maximum it sits flush with the top edge.
  await page.keyboard.press('End');
  g = await measureVertical(page);
  expect(Math.abs(g.thumb.top - g.control.top)).toBeLessThanOrEqual(TOLERANCE);
  expect(g.thumb.bottom).toBeLessThanOrEqual(g.control.bottom + TOLERANCE);

  // The fill runs from the bottom edge up to the thumb's center.
  const fill = g.fill;
  if (fill == null) {
    throw new Error('missing fill');
  }
  expect(Math.abs(fill.bottom - g.control.bottom)).toBeLessThanOrEqual(
    TOLERANCE,
  );
  expect(Math.abs(fill.top - g.thumb.center)).toBeLessThanOrEqual(TOLERANCE);
});

test('a drag lays out nothing per move when no value is displayed', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-slider--default&viewMode=story&args=valueDisplay:none`,
  );
  const thumb = page.getByRole('slider');
  await thumb.waitFor();
  const box = await thumb.boundingBox();
  if (box == null) {
    throw new Error('no thumb');
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const layouts = async () => {
    const {metrics} = await cdp.send('Performance.getMetrics');
    return metrics.find(metric => metric.name === 'LayoutCount')?.value ?? 0;
  };
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  // The press itself may restyle (pressed paint, focus); count the moves.
  await page.mouse.move(x + 2, y);
  await page.evaluate(
    async () =>
      new Promise(resolve => requestAnimationFrame(() => resolve(null))),
  );
  const before = await layouts();
  for (let i = 2; i <= 60; i++) {
    await page.mouse.move(x + i * 2, y);
    await page.evaluate(
      async () =>
        new Promise(resolve => requestAnimationFrame(() => resolve(null))),
    );
  }
  const after = await layouts();
  await page.mouse.up();
  expect(Number(await thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
  expect(after - before).toBe(0);
});

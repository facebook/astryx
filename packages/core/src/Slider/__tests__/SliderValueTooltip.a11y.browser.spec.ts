// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SliderValueTooltip.a11y.browser.spec.ts
 * @input Built Slider stories in real Chromium, Firefox and WebKit
 * @output Cross-engine evidence that the value tooltip sits over its thumb at every value: no double translation, inside the control at both ends, flipped below with no room above, under RTL, vertical, both thumbs of a range, forced colors and reduced motion; plus screenshots and a drag clip per engine
 * @position Slider value tooltip contract; the thumb travels by `translate`, which CSS anchor positioning resolves differently across engines, so the tooltip anchors to the untransformed travel box and travels by the same `translate`
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

const TOLERANCE = 1.5;

async function mount(page: Page, storyId: string, direction = 'ltr') {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story&globals=direction:${direction}`,
  );
  await page.locator('.astryx-slider-control').first().waitFor();
  await page.evaluate(dir => {
    document.documentElement.dir = dir;
  }, direction);
}

async function frame(page: Page) {
  await page.evaluate(
    async () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))),
      ),
  );
  // The tooltip's entrance (scale 0.95 → 1, 4px nudge) is short; let it end.
  await page.waitForTimeout(400);
}

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
}

async function measure(page: Page, thumbIndex = 0) {
  return page.evaluate(index => {
    const box = (el: Element): Box => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        cx: (r.left + r.right) / 2,
        cy: (r.top + r.bottom) / 2,
      };
    };
    const control = document.querySelector('.astryx-slider-control');
    const thumb = control?.querySelectorAll('[role="slider"]')[index];
    if (control == null || thumb == null) {
      throw new Error('missing slider');
    }
    const id = thumb.getAttribute('aria-describedby')?.split(' ').at(-1);
    const tooltip = Array.from(
      document.querySelectorAll('[role="tooltip"]'),
    ).find(
      el =>
        (id != null && el.id === id) || el.getBoundingClientRect().width > 0,
    );
    // The anchor the tooltips resolve: no engine may see it transformed.
    const anchors = Array.from(control.querySelectorAll<HTMLElement>('*'))
      .filter(el => {
        const name = getComputedStyle(el).getPropertyValue('anchor-name');
        return name !== '' && name !== 'none';
      })
      .map(el => {
        const style = getComputedStyle(el);
        return {transform: style.transform, translate: style.translate};
      });
    return {
      control: box(control),
      thumb: box(thumb),
      tooltip:
        tooltip == null || tooltip.getBoundingClientRect().width === 0
          ? null
          : box(tooltip),
      anchors,
    };
  }, thumbIndex);
}

type Measured = Awaited<ReturnType<typeof measure>>;

function tipOf(m: Measured, label: string): Box {
  if (m.tooltip == null) {
    throw new Error(`${label}: the value tooltip is not open`);
  }
  return m.tooltip;
}

function expectAbove(m: Measured, label: string) {
  expect(
    tipOf(m, label).bottom,
    `${label}: above the thumb`,
  ).toBeLessThanOrEqual(m.thumb.top + TOLERANCE);
}

/** Centred on the thumb, or flush with the control's edge when clamped. */
function expectOverThumb(m: Measured, label: string) {
  const tip = tipOf(m, label);
  const centred = Math.abs(tip.cx - m.thumb.cx) <= TOLERANCE;
  const clampedStart = Math.abs(tip.left - m.control.left) <= TOLERANCE;
  const clampedEnd = Math.abs(tip.right - m.control.right) <= TOLERANCE;
  expect(
    centred || clampedStart || clampedEnd,
    `${label}: centred on the thumb (${tip.cx} vs ${m.thumb.cx}) or clamped to the control`,
  ).toBe(true);
  expect(tip.left, `${label}: inside the control`).toBeGreaterThanOrEqual(
    m.control.left - TOLERANCE,
  );
  expect(tip.right, `${label}: inside the control`).toBeLessThanOrEqual(
    m.control.right + TOLERANCE,
  );
  // Whatever the clamp, the tooltip still covers the thumb's center.
  expect(tip.left).toBeLessThanOrEqual(m.thumb.cx + TOLERANCE);
  expect(tip.right).toBeGreaterThanOrEqual(m.thumb.cx - TOLERANCE);
}

async function shot(page: Page, name: string) {
  const control = page.locator('.astryx-slider-control').first();
  const box = await control.boundingBox();
  if (box == null) {
    return;
  }
  const path = test.info().outputPath(`${name}.png`);
  await page.screenshot({
    path,
    clip: {
      x: Math.max(0, box.x - 40),
      y: Math.max(0, box.y - 60),
      width: box.width + 80,
      height: box.height + 120,
    },
  });
  await test.info().attach(name, {path, contentType: 'image/png'});
}

for (const direction of ['ltr', 'rtl'] as const) {
  test(`the tooltip follows the thumb at every value with no double translation (${direction})`, async ({
    page,
    browserName,
  }) => {
    await mount(page, 'core-slider--default', direction);
    const thumb = page.getByRole('slider');
    await thumb.focus();
    await page.keyboard.press('ArrowRight');
    await frame(page);
    let m = await measure(page);
    expect(m.anchors.length, 'one untransformed anchor').toBeGreaterThan(0);
    for (const anchor of m.anchors) {
      expect(anchor.transform).toBe('none');
      expect(anchor.translate).toBe('none');
    }
    // Away from the ends the tooltip is centred on the thumb exactly: a
    // double translation would put it at twice the thumb's travel.
    for (const value of [50, 25, 75, 10, 90]) {
      await page.keyboard.press('Home');
      for (let i = 0; i < value; i++) {
        await page.keyboard.press('ArrowRight');
      }
      await frame(page);
      m = await measure(page);
      expectAbove(m, `${value}`);
      expect(
        Math.abs(tipOf(m, `${value}`).cx - m.thumb.cx),
        `${value}: centred on the thumb`,
      ).toBeLessThanOrEqual(TOLERANCE);
      if (value === 75) {
        await shot(page, `${browserName}-${direction}-75`);
      }
    }
    // Both ends: over the thumb, never outside the control.
    for (const key of ['Home', 'End']) {
      await page.keyboard.press(key);
      await frame(page);
      m = await measure(page);
      expectAbove(m, key);
      expectOverThumb(m, key);
      await shot(page, `${browserName}-${direction}-${key.toLowerCase()}`);
    }
  });
}

test('with no room above, the tooltip flips below and stays over the thumb', async ({
  page,
  browserName,
}) => {
  await mount(page, 'core-slider--default');
  // Put the control at the very top of the viewport.
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.style.height = '200vh';
    document.body.append(spacer);
    const control = document.querySelector('.astryx-slider-control');
    const top = (control?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo(0, top);
  });
  const thumb = page.getByRole('slider');
  await thumb.focus();
  await page.keyboard.press('ArrowRight');
  for (const key of ['Home', 'End']) {
    await page.keyboard.press(key);
    await frame(page);
    const m = await measure(page);
    expect(tipOf(m, key).top, `${key}: flipped below`).toBeGreaterThanOrEqual(
      m.thumb.bottom - TOLERANCE,
    );
    expectOverThumb(m, `${key} (flipped)`);
    await shot(page, `${browserName}-flipped-${key.toLowerCase()}`);
  }
});

test('a vertical slider: the tooltip sits beside the thumb at every value', async ({
  page,
  browserName,
}) => {
  await mount(page, 'core-slider--vertical-orientation');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  for (const key of ['Home', 'End', 'PageDown']) {
    await page.keyboard.press(key);
    await frame(page);
    const m = await measure(page);
    const tip = tipOf(m, key);
    expect(tip.right, `${key}: beside the thumb`).toBeLessThanOrEqual(
      m.thumb.left + TOLERANCE,
    );
    expect(
      m.thumb.left - tip.right,
      `${key}: next to the thumb, not at the field's edge`,
    ).toBeLessThanOrEqual(8);
    const centred = Math.abs(tip.cy - m.thumb.cy) <= TOLERANCE;
    const clamped =
      Math.abs(tip.top - m.control.top) <= TOLERANCE ||
      Math.abs(tip.bottom - m.control.bottom) <= TOLERANCE;
    expect(centred || clamped, `${key}: level with the thumb`).toBe(true);
    expect(tip.top).toBeLessThanOrEqual(m.thumb.cy + TOLERANCE);
    expect(tip.bottom).toBeGreaterThanOrEqual(m.thumb.cy - TOLERANCE);
    await shot(page, `${browserName}-vertical-${key.toLowerCase()}`);
  }
});

test('both thumbs of a range carry their own tooltip', async ({
  page,
  browserName,
}) => {
  await mount(page, 'core-slider--range');
  for (const index of [0, 1]) {
    await page.getByRole('slider').nth(index).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await frame(page);
    const m = await measure(page, index);
    expectAbove(m, `thumb ${index}`);
    expect(
      Math.abs(tipOf(m, `thumb ${index}`).cx - m.thumb.cx),
      `thumb ${index}: centred on its thumb`,
    ).toBeLessThanOrEqual(TOLERANCE);
    await shot(page, `${browserName}-range-thumb-${index}`);
  }
});

test('forced colors and reduced motion keep the tooltip over the thumb', async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  if (browserName === 'chromium') {
    await page.emulateMedia({reducedMotion: 'reduce', forcedColors: 'active'});
  }
  await mount(page, 'core-slider--default');
  const thumb = page.getByRole('slider');
  await thumb.focus();
  for (const key of ['ArrowRight', 'Home', 'End']) {
    await page.keyboard.press(key);
    await frame(page);
    const m = await measure(page);
    expectAbove(m, key);
    expectOverThumb(m, key);
  }
  await shot(page, `${browserName}-forced-colors-reduced-motion-end`);
});

test.describe('drag clip', () => {
  test.use({video: {mode: 'on', size: {width: 800, height: 300}}});

  test('the tooltip rides the thumb through a drag', async ({page}) => {
    await page.setViewportSize({width: 800, height: 300});
    await mount(page, 'core-slider--default');
    const thumb = page.getByRole('slider');
    const control = page.locator('.astryx-slider-control').first();
    const box = await control.boundingBox();
    if (box == null) {
      throw new Error('missing slider control');
    }
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    for (const x of [0.5, 0.75, 1, 0.75, 0.25, 0, 0.5]) {
      await page.mouse.move(box.x + box.width * x, y, {steps: 25});
      await frame(page);
      const m = await measure(page);
      expectAbove(m, `drag at ${x}`);
      expectOverThumb(m, `drag at ${x}`);
    }
    await page.mouse.up();
    await expect(thumb).toHaveAttribute('aria-valuenow', /\d+/);
  });
});

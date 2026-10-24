// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ReducedMotionPress.a11y.chromium.spec.ts
 * @input The Button Secondary story and the ClickableCard, SelectableCard
 *   and Thumbnail stories in a built Storybook, emulated
 *   `prefers-reduced-motion: reduce`, a real mouse and real touch input
 *   through CDP
 * @output Real-engine proof that Button and the cards follow
 *   `design:reduced-motion`: a press never scales a button (DR1); with a
 *   fine primary pointer their state changes are immediate (DR3); on a touch
 *   screen they stay cross-fades of 200 ms or less (DR2)
 * @position Run with `pnpm test:a11y-contract`. Browser layer of the
 *   reduced-motion arms in Button.tsx and the cards' overlays.
 */

import {expect, test, type Browser, type Page} from '@playwright/test';
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

/** A phone: touch screen, primary pointer coarse. */
const PHONE = {
  viewport: {width: 402, height: 714},
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
} as const;
/** A desktop: primary pointer fine. */
const DESKTOP = {
  viewport: {width: 1024, height: 768},
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
  reducedMotion: 'reduce',
} as const;

const BUTTON = 'core-button--secondary';
const CARDS = [
  ['ClickableCard', 'core-clickablecard--with-on-click', 0],
  // The second card: the first starts selected.
  ['SelectableCard', 'core-selectablecard--single-select', 1],
  ['Thumbnail', 'core-thumbnail--clickable', 0],
] as const;
const SURFACE = '#storybook-root [data-astryx-pressable]';

async function open(
  browser: Browser,
  device: typeof PHONE | typeof DESKTOP,
  story: string,
): Promise<{page: Page; close: () => Promise<void>}> {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  // Remote demo media never loads here; the styles under test do not need it.
  await page.route(
    url => url.origin !== storybook.origin,
    async route => route.abort(),
  );
  await page.goto(`${storybook.origin}/iframe.html?id=${story}&viewMode=story`);
  await page.locator(SURFACE).first().waitFor();
  // Each case runs on the device it claims: a coarse primary pointer for the
  // phone, a fine one for the desktop, both with Reduce Motion on.
  const media = await page.evaluate(() => ({
    coarse: matchMedia('(pointer: coarse)').matches,
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }));
  expect(media).toEqual({coarse: device.hasTouch, reduce: true});
  await page.mouse.move(1, 1);
  return {page, close: async () => context.close()};
}

/** The element's transform, as the engine resolved it ('none' or a matrix). */
async function transformOf(page: Page, index = 0): Promise<string> {
  return page
    .locator(SURFACE)
    .nth(index)
    .evaluate(element => getComputedStyle(element).transform);
}

const isIdentity = (transform: string) =>
  transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';

/** `0.175s`, `0s`, `175ms` → ms; a list resolves to its longest. */
const longestMs = (value: string) =>
  Math.max(
    ...value.split(',').map(part => {
      const match = part.trim().match(/^([\d.]+)(ms|s)$/);
      return match == null
        ? Number.NaN
        : Number(match[1]) * (match[2] === 's' ? 1000 : 1);
    }),
  );

/** Every transition duration on the element and its overlay, in ms. */
async function transitionsOf(
  page: Page,
  index: number,
): Promise<{element: number; overlay: number}> {
  return page
    .locator(SURFACE)
    .nth(index)
    .evaluate(element => ({
      element: getComputedStyle(element).transitionDuration,
      overlay: getComputedStyle(element, '::after').transitionDuration,
    }))
    .then(({element, overlay}) => ({
      element: longestMs(element),
      overlay: longestMs(overlay),
    }));
}

test('a pressed button never scales under reduced motion, with a mouse or a finger (DR1)', async ({
  browser,
}) => {
  const desktop = await open(browser, DESKTOP, BUTTON);
  try {
    const box = await desktop.page.locator(SURFACE).first().boundingBox();
    if (box == null) {
      throw new Error('the Button story rendered no button');
    }
    await desktop.page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    await desktop.page.mouse.down();
    const pressed = await transformOf(desktop.page);
    await desktop.page.mouse.up();
    expect(isIdentity(pressed), pressed).toBe(true);
  } finally {
    await desktop.close();
  }

  const phone = await open(browser, PHONE, BUTTON);
  try {
    const box = await phone.page.locator(SURFACE).first().boundingBox();
    if (box == null) {
      throw new Error('the Button story rendered no button');
    }
    const cdp = await phone.page.context().newCDPSession(phone.page);
    const point = {x: box.x + box.width / 2, y: box.y + box.height / 2};
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{...point, id: 1}],
    });
    await expect
      .poll(async () =>
        phone.page.locator(SURFACE).first().getAttribute('data-astryx-press'),
      )
      .toBe('on');
    const pressed = await transformOf(phone.page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    expect(isIdentity(pressed), pressed).toBe(true);
  } finally {
    await phone.close();
  }
});

test('with a fine primary pointer, a button’s and a card’s state changes are immediate under reduced motion (DR3)', async ({
  browser,
}) => {
  const button = await open(browser, DESKTOP, BUTTON);
  try {
    expect((await transitionsOf(button.page, 0)).element).toBe(0);
  } finally {
    await button.close();
  }
  for (const [name, story, index] of CARDS) {
    const card = await open(browser, DESKTOP, story);
    try {
      const {element, overlay} = await transitionsOf(card.page, index);
      expect(overlay, `${name} overlay`).toBe(0);
      if (name !== 'Thumbnail') {
        expect(element, `${name} border`).toBe(0);
      }
    } finally {
      await card.close();
    }
  }
});

test('on a touch screen, a button’s and a card’s colour changes stay cross-fades of 200 ms or less under reduced motion (DR2)', async ({
  browser,
}) => {
  const button = await open(browser, PHONE, BUTTON);
  try {
    const {element} = await transitionsOf(button.page, 0);
    expect(element).toBeGreaterThan(0);
    expect(element).toBeLessThanOrEqual(200);
  } finally {
    await button.close();
  }
  for (const [name, story, index] of CARDS) {
    const card = await open(browser, PHONE, story);
    try {
      const {overlay} = await transitionsOf(card.page, index);
      expect(overlay, name).toBeGreaterThan(0);
      expect(overlay, name).toBeLessThanOrEqual(200);
    } finally {
      await card.close();
    }
  }
});

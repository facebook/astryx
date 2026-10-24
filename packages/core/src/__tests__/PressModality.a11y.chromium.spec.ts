// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PressModality.a11y.chromium.spec.ts
 * @input The `Core/Button` Secondary story in a built Storybook, real mouse,
 *   keyboard and touch input in a phone context (primary pointer coarse) and
 *   a desktop context (primary pointer fine)
 * @output Real-engine proof that on a touch-first device a held mouse press
 *   and a held Space press paint the pressed state with the same pixels and
 *   scale a desktop `:active` press paints, and fade at the release; that a
 *   desktop press is still `:active` alone; and that a finger's press still
 *   waits for the touch press model's onset
 * @position Run with `pnpm test:a11y-contract`. Browser layer of the touch
 *   press model (utils/pressFeedback.ts); the jsdom layer is
 *   utils/pressFeedback.test.ts.
 *
 * The stylesheet drops every `:active` arm under `@media (pointer: coarse)`,
 * which reads the PRIMARY pointer, so on such a device the press controller
 * is the only thing that can paint a mouse or keyboard press.
 */

import {expect, test, type Browser, type Page} from '@playwright/test';
// @ts-expect-error -- pngjs ships no declarations; runtime support is pinned.
import {PNG} from 'pngjs';
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

const STORY = 'core-button--secondary';
const SURFACE = '#storybook-root [data-astryx-pressable]';
/** A phone: touch screen, mobile viewport rules, primary pointer coarse. */
const PHONE = {
  viewport: {width: 402, height: 714},
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
} as const;
/** A desktop: primary pointer fine, hover, no touch. */
const DESKTOP = {
  viewport: {width: 1024, height: 768},
  deviceScaleFactor: 1,
  isMobile: false,
  hasTouch: false,
} as const;

type RGB = [number, number, number];

interface Opened {
  page: Page;
  close: () => Promise<void>;
  center: {x: number; y: number};
  /** A point on the button's fill, clear of its label. */
  fill: {x: number; y: number};
}

async function open(
  browser: Browser,
  device: typeof PHONE | typeof DESKTOP,
): Promise<Opened> {
  const context = await browser.newContext(device);
  const page = await context.newPage();
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const box = await page.locator(SURFACE).first().boundingBox();
  if (box == null) {
    throw new Error('the Button story rendered no pressable surface');
  }
  await page.mouse.move(1, 1);
  return {
    page,
    close: async () => context.close(),
    center: {x: box.x + box.width / 2, y: box.y + box.height / 2},
    fill: {x: box.x + 6, y: box.y + box.height / 2},
  };
}

/** The mean colour of a 2 × 2 CSS px patch, as presented. */
async function pixel(page: Page, at: {x: number; y: number}): Promise<RGB> {
  const png = PNG.sync.read(
    await page.screenshot({
      clip: {
        x: Math.round(at.x) - 1,
        y: Math.round(at.y) - 1,
        width: 2,
        height: 2,
      },
      animations: 'allow',
      caret: 'hide',
    }),
  );
  const sum = [0, 0, 0];
  const count = png.width * png.height;
  for (let i = 0; i < count; i++) {
    sum[0] += png.data[i * 4];
    sum[1] += png.data[i * 4 + 1];
    sum[2] += png.data[i * 4 + 2];
  }
  return sum.map(v => Math.round(v / count)) as RGB;
}

/** Resolves once nothing on the surface animates and its transform is still. */
async function settled(page: Page): Promise<void> {
  await page
    .locator(SURFACE)
    .first()
    .evaluate(
      async element =>
        new Promise<void>(resolve => {
          let last = '';
          let still = 0;
          const tick = () => {
            const transform = getComputedStyle(element).transform;
            const running = element
              .getAnimations()
              .some(animation => animation.playState === 'running');
            still = !running && transform === last ? still + 1 : 0;
            last = transform;
            if (still >= 2) {
              resolve();
            } else {
              requestAnimationFrame(tick);
            }
          };
          requestAnimationFrame(tick);
        }),
    );
}

async function pressAttribute(page: Page): Promise<string | null> {
  return page.locator(SURFACE).first().getAttribute('data-astryx-press');
}

async function scale(page: Page): Promise<number> {
  return page
    .locator(SURFACE)
    .first()
    .evaluate(element => {
      const transform = getComputedStyle(element).transform;
      return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
    });
}

async function coarse(page: Page): Promise<boolean> {
  return page.evaluate(() => matchMedia('(pointer: coarse)').matches);
}

function expectSameColour(actual: RGB, expected: RGB): void {
  for (let channel = 0; channel < 3; channel++) {
    expect(
      Math.abs(actual[channel] - expected[channel]),
      `${JSON.stringify(actual)} vs ${JSON.stringify(expected)}`,
    ).toBeLessThanOrEqual(2);
  }
}

type Press = 'mouse' | 'space';

async function holdPress(opened: Opened, press: Press): Promise<void> {
  if (press === 'mouse') {
    await opened.page.mouse.move(opened.center.x, opened.center.y);
    await opened.page.mouse.down();
  } else {
    await opened.page.locator(SURFACE).first().focus();
    await opened.page.keyboard.down('Space');
  }
}

async function releasePress(opened: Opened, press: Press): Promise<void> {
  if (press === 'mouse') {
    await opened.page.mouse.up();
  } else {
    await opened.page.keyboard.up('Space');
  }
}

/** What a desktop paints for the press: the reference, and proof the controller stays out. */
async function desktopReference(
  browser: Browser,
  press: Press,
): Promise<{rest: RGB; pressed: RGB; scale: number; attribute: string | null}> {
  const desktop = await open(browser, DESKTOP);
  try {
    expect(await coarse(desktop.page)).toBe(false);
    const rest = await pixel(desktop.page, desktop.fill);
    await holdPress(desktop, press);
    await settled(desktop.page);
    return {
      rest,
      pressed: await pixel(desktop.page, desktop.fill),
      scale: await scale(desktop.page),
      attribute: await pressAttribute(desktop.page),
    };
  } finally {
    await desktop.close();
  }
}

for (const press of ['mouse', 'space'] as const) {
  test(`on a touch-first device a held ${press} press paints what a desktop press paints, then fades`, async ({
    browser,
  }) => {
    const reference = await desktopReference(browser, press);
    expect(reference.pressed).not.toEqual(reference.rest);

    const phone = await open(browser, PHONE);
    try {
      expect(await coarse(phone.page)).toBe(true);
      await phone.page.evaluate(() => {
        const target = window as unknown as {__clicks: number};
        target.__clicks = 0;
        document.addEventListener('click', () => {
          target.__clicks += 1;
        });
      });
      const rest = await pixel(phone.page, phone.fill);
      expectSameColour(rest, reference.rest);

      await holdPress(phone, press);
      await phone.page.waitForTimeout(250);
      expect(await pressAttribute(phone.page)).toBe('on');
      await settled(phone.page);
      expectSameColour(await pixel(phone.page, phone.fill), reference.pressed);
      expect(await scale(phone.page)).toBeCloseTo(reference.scale, 3);

      await releasePress(phone, press);
      expect(await pressAttribute(phone.page)).toBe('fading');
      expect(
        await phone.page.evaluate(
          () => (window as unknown as {__clicks: number}).__clicks,
        ),
      ).toBe(1);
      await expect.poll(async () => pressAttribute(phone.page)).toBeNull();
      await settled(phone.page);
      expectSameColour(await pixel(phone.page, phone.fill), rest);
    } finally {
      await phone.close();
    }
  });
}

test('a desktop press is unchanged: `:active` paints it and the controller writes nothing', async ({
  browser,
}) => {
  const mouse = await desktopReference(browser, 'mouse');
  expect(mouse.attribute).toBeNull();
  expect(mouse.pressed).not.toEqual(mouse.rest);
  expect(mouse.scale).toBeCloseTo(0.98, 3);
  const space = await desktopReference(browser, 'space');
  expect(space.attribute).toBeNull();
  expectSameColour(space.pressed, mouse.pressed);
});

test("a finger's press is unchanged: it waits for the onset, then fades at the lift", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'touch input goes through CDP, which only Chromium has',
  );
  const phone = await open(browser, PHONE);
  try {
    const cdp = await phone.page.context().newCDPSession(phone.page);
    const touch = async (type: 'touchStart' | 'touchEnd') =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints:
          type === 'touchStart'
            ? [{x: phone.center.x, y: phone.center.y, id: 1}]
            : [],
      });
    await touch('touchStart');
    await phone.page.waitForTimeout(60);
    const early = await pressAttribute(phone.page);
    await phone.page.waitForTimeout(190);
    const believed = await pressAttribute(phone.page);
    await touch('touchEnd');
    const lifted = await pressAttribute(phone.page);
    expect(early).toBeNull();
    expect(believed).toBe('on');
    expect(lifted).toBe('fading');
  } finally {
    await phone.close();
  }
});

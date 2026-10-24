// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxPagingModes.interaction.browser.spec.ts
 * @input The built "Gallery with zoom" Lightbox story on the phone project,
 *   its photos served as test images, real touch input (Chromium CDP /
 *   WebKit's input command), the mouse, and the interaction harness
 * @output Proofs for Lightbox's pager outside plain touch: under Reduce
 *   Motion (design:reduced-motion) a swipe and the Next button on a touch
 *   screen page by a fade of 200 ms or less with no slide, and the Next
 *   button with a mouse pages at once; a mouse drag does not page (paging is
 *   for touch and pen)
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxPaging.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  curveOf,
  drag,
  frames,
  holdAnimations,
  openStory,
  releaseAnimations,
  sampleCurve,
  timeline,
  touchDriver,
  waitForAnimation,
  waitForRest,
  withStorybook,
  type TouchDriver,
  type TouchScript,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// Photos' gap between pages (motion/uikit/zoomMedia.ts), restated.
const GAP = 40;

/** A checkerboard photo with a disc whose colour tells the photos apart. */
function photoSvg(color: string): string {
  let squares = '';
  for (let y = 0; y < 2000; y += 50) {
    for (let x = 0; x < 3000; x += 50) {
      if ((x + y) % 100 === 0) {
        squares += `<rect x="${x}" y="${y}" width="50" height="50"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="2000" viewBox="0 0 3000 2000" shape-rendering="crispEdges"><rect width="3000" height="2000" fill="#fff"/><g fill="#000">${squares}</g><circle cx="1500" cy="1000" r="250" fill="${color}"/></svg>`;
}

const COLORS: Record<string, string> = {
  '10': '#d22',
  '15': '#2a2',
  '20': '#22d',
  '25': '#d80',
};

interface Gallery {
  driver: TouchDriver;
  dialog: Locator;
  /** The pager's viewport (the stage), and the track it translates. */
  viewport: Locator;
  track: Locator;
  /** The viewport's box on the page. */
  box: {x: number; y: number; width: number; height: number};
  counter: () => Promise<string>;
  trackX: () => Promise<number>;
  /** The current photo's zoom transform. */
  photo: () => Promise<{x: number; scale: number}>;
}

async function openGallery(
  page: Page,
  {rtl = false, mouse = false} = {},
): Promise<Gallery> {
  await page.route('https://picsum.photos/**', async route => {
    const id = /\/id\/(\d+)\//.exec(route.request().url())?.[1] ?? '10';
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: photoSvg(COLORS[id] ?? '#888'),
    });
  });
  if (rtl) {
    // Storybook's direction global sets the story's `dir` (and its
    // providers'); openStory has no globals.
    await page.goto(
      `${storybook()}/iframe.html?id=core-lightbox--gallery-with-zoom&viewMode=story&globals=direction:rtl`,
    );
    await page.locator('#storybook-root > *').first().waitFor();
    await frames(page, 2);
  } else {
    await openStory(page, storybook(), 'core-lightbox--gallery-with-zoom');
  }
  const trigger = page.getByRole('button', {name: 'Open gallery with zoom'});
  // A desktop has no touch input: its cases use the mouse alone.
  const driver = mouse
    ? (new Proxy(
        {},
        {
          get: () => {
            throw new Error('no touch on a desktop');
          },
        },
      ) as TouchDriver)
    : await touchDriver(page);
  if (mouse) {
    await trigger.click();
  } else {
    const t = await trigger.boundingBox();
    if (t == null) {
      throw new Error('no trigger');
    }
    await driver.tap({x: t.x + t.width / 2, y: t.y + t.height / 2});
  }
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const viewport = dialog.getByRole('button', {name: 'Zoom'});
  const track = viewport.locator(':scope > div').first();
  await expect
    .poll(async () =>
      viewport.evaluate(el =>
        [...el.querySelectorAll('img')].every(img => img.naturalWidth === 3000),
      ),
    )
    .toBe(true);
  await frames(page, 2);
  const box = await viewport.evaluate(el => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left,
      y: r.top,
      width: el.clientWidth,
      height: el.clientHeight,
    };
  });
  return {
    driver,
    dialog,
    viewport,
    track,
    box,
    counter: async () =>
      (await dialog.getByText(/^\d+ \/ \d+$/).textContent()) ?? '',
    trackX: async () =>
      track.evaluate(el => {
        const value = getComputedStyle(el).translate;
        return value === 'none' ? 0 : parseFloat(value);
      }),
    photo: async () =>
      viewport.evaluate(el => {
        const img = el.querySelector<HTMLElement>('[data-current] img');
        if (img == null) {
          return {x: 0, scale: 1};
        }
        const style = getComputedStyle(img);
        return {
          x: style.translate === 'none' ? 0 : parseFloat(style.translate),
          scale: style.scale === 'none' ? 1 : parseFloat(style.scale),
        };
      }),
  };
}

/** A slow drag by dx, held still before the lift (no release velocity). */
function slowDrag(from: {x: number; y: number}, dx: number): TouchScript {
  return drag(
    from,
    {x: from.x + dx, y: from.y},
    {durationMs: 600, restMs: 150},
  );
}

/** The track's positions over its held animation, and that animation's length. */
async function trackCurve(page: Page, track: Locator) {
  await waitForAnimation(track);
  const held = await holdAnimations(page, track);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const xs = curveOf(
    await sampleCurve(track, timeline(duration)),
    'translateX',
  ).map(s => s.value);
  await releaseAnimations(page);
  return {duration, xs};
}

test('under Reduce Motion a swipe pages by a fade of 200 ms or less: the track never slides', async ({
  page,
}) => {
  // design:reduced-motion DR1–DR2: what a touch release starts fades in
  // place; it never moves.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const g = await openGallery(page);
  const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  await g.driver.play(slowDrag(mid, -g.box.width * 0.6));
  const {duration, xs} = await trackCurve(page, g.track);
  const page2 = -(g.box.width + GAP);
  expect(duration).toBeLessThanOrEqual(205);
  // Only where the finger left it and the next page: nothing between.
  for (const x of xs) {
    expect(Math.min(Math.abs(x - xs[0]), Math.abs(x - page2))).toBeLessThan(
      0.5,
    );
  }
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  expect(await g.trackX()).toBeCloseTo(page2, 0);
});

test('under Reduce Motion the Next button pages by a fade on a touch screen, never a slide', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const g = await openGallery(page);
  const next = await g.dialog.getByRole('button', {name: 'Next'}).boundingBox();
  if (next == null) {
    throw new Error('no Next');
  }
  await g.driver.tap({x: next.x + next.width / 2, y: next.y + next.height / 2});
  const {duration, xs} = await trackCurve(page, g.track);
  const page2 = -(g.box.width + GAP);
  expect(duration).toBeLessThanOrEqual(205);
  for (const x of xs) {
    expect(Math.min(Math.abs(x), Math.abs(x - page2))).toBeLessThan(0.5);
  }
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
});

test('under Reduce Motion the Next button pages at once with a mouse', async ({
  browser,
}) => {
  // design:reduced-motion DR3: any pointer but a coarse one, at once.
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    // A fine primary pointer in this context (the interaction config can report
    // a coarse one without touch).
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const g = await openGallery(page, {mouse: true});
    await g.dialog.getByRole('button', {name: 'Next'}).click();
    await frames(page, 1);
    expect(await g.counter()).toBe('2 / 4');
    expect(
      await g.track.evaluate(
        el => el.getAnimations().filter(a => a.playState === 'running').length,
      ),
    ).toBe(0);
  } finally {
    await context.close();
  }
});

test('a mouse drag does not page: paging is for touch and pen', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
  });
  try {
    const page = await context.newPage();
    // A fine primary pointer in this context (the interaction config can report
    // a coarse one without touch).
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const g = await openGallery(page, {mouse: true});
    const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
    await page.mouse.move(mid.x, mid.y);
    await page.mouse.down();
    await page.mouse.move(mid.x - g.box.width * 0.6, mid.y, {steps: 20});
    await page.mouse.up();
    await frames(page, 10);
    expect(await g.counter()).toBe('1 / 4');
    expect(await g.trackX()).toBe(0);
    await expect(g.dialog).toBeVisible();
  } finally {
    await context.close();
  }
});

test('with a mouse (a fine pointer) a click beside the photo closes the gallery, one on it does not', async ({
  browser,
}) => {
  // A tall viewport leaves stage below the photo: the stage fills the viewer,
  // the photo keeps its 3:2 aspect.
  const context = await browser.newContext({
    viewport: {width: 1280, height: 1400},
    hasTouch: false,
    isMobile: false,
  });
  try {
    const page = await context.newPage();
    // A fine primary pointer in this context (the interaction config can report
    // a coarse one without touch).
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const g = await openGallery(page, {mouse: true});
    const photo = await g.dialog.locator('[data-current] img').boundingBox();
    if (photo == null) {
      throw new Error('no photo');
    }
    const below = {
      x: photo.x + photo.width / 2,
      y: (photo.y + photo.height + g.box.y + g.box.height) / 2,
    };
    // The point is on the stage beside the photo, not on a control.
    expect(
      await page.evaluate(({x, y}) => {
        const el = document.elementFromPoint(x, y);
        return (
          el != null &&
          el.closest('[data-lightbox-chrome]') == null &&
          el.tagName !== 'IMG'
        );
      }, below),
    ).toBe(true);
    // A click on the photo itself leaves the viewer open.
    await page.mouse.click(
      photo.x + photo.width / 2,
      photo.y + photo.height / 2,
    );
    await page.waitForTimeout(500);
    await expect(g.dialog).toBeVisible();
    await page.mouse.click(below.x, below.y);
    await expect(g.dialog).toBeHidden();
  } finally {
    await context.close();
  }
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxPagingModes.interaction.browser.spec.ts
 * @input The built "Gallery with zoom" Lightbox story on the phone project,
 *   its photos served as test images, real touch input (Chromium CDP /
 *   WebKit's input command), the mouse, and the interaction harness
 * @output Proofs for Lightbox's pager outside plain touch: under Reduce
 *   Motion a swipe and the Next button still slide (paging keeps its motion,
 *   as a scroll view does under Reduce Motion); a mouse drag does not page
 *   (paging is for touch and pen)
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

async function openGallery(page: Page, {rtl = false} = {}): Promise<Gallery> {
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
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Open gallery with zoom'});
  const t = await trigger.boundingBox();
  if (t == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: t.x + t.width / 2, y: t.y + t.height / 2});
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

test('under Reduce Motion a swipe and the Next button still slide: paging keeps its motion, as a scroll view does', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const g = await openGallery(page);
  const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  await g.driver.play(slowDrag(mid, -g.box.width * 0.6));
  await waitForAnimation(g.track);
  let held = await holdAnimations(page, g.track);
  let duration = Math.max(...held.map(a => a.curveEndMs));
  let xs = curveOf(
    await sampleCurve(g.track, timeline(duration)),
    'translateX',
  ).map(s => s.value);
  await releaseAnimations(page);
  // A settle, not a jump or a fade: the track passes through the positions
  // between where the finger left it and the next page.
  const page2 = -(g.box.width + GAP);
  expect(duration).toBeGreaterThan(150);
  expect(xs.filter(x => x < xs[0] - 2 && x > page2 + 2).length).toBeGreaterThan(
    3,
  );
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  await g.dialog.getByRole('button', {name: 'Next'}).click();
  await waitForAnimation(g.track);
  held = await holdAnimations(page, g.track);
  duration = Math.max(...held.map(a => a.curveEndMs));
  xs = curveOf(
    await sampleCurve(g.track, timeline(duration)),
    'translateX',
  ).map(s => s.value);
  await releaseAnimations(page);
  const page3 = 2 * page2;
  expect(duration).toBeGreaterThan(150);
  expect(xs.filter(x => x < page2 - 2 && x > page3 + 2).length).toBeGreaterThan(
    3,
  );
  await waitForRest(g.track);
  expect(await g.counter()).toBe('3 / 4');
});

test('a mouse drag does not page: paging is for touch and pen', async ({
  page,
}) => {
  const g = await openGallery(page);
  const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  await page.mouse.move(mid.x, mid.y);
  await page.mouse.down();
  await page.mouse.move(mid.x - g.box.width * 0.6, mid.y, {steps: 20});
  await page.mouse.up();
  await frames(page, 10);
  expect(await g.counter()).toBe('1 / 4');
  expect(await g.trackX()).toBe(0);
  await expect(g.dialog).toBeVisible();
});

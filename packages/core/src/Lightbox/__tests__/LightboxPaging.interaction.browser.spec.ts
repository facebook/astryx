// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxPaging.interaction.browser.spec.ts
 * @input The built "Gallery with zoom" Lightbox story on the phone project,
 *   its photos served as test images, real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Interaction proofs for Lightbox's pager (hooks/usePager.ts, whose
 *   own spec proves the paging physics): a drag past half a photo pages to
 *   the next one with Photos' 40 pt gap between them; a zoomed photo keeps
 *   the drag until its edge, and the next drag from the edge pages; the
 *   photo left behind returns to the fitted size; RTL pages the other way;
 *   the Next button pages on `setContentOffset(animated:)`; a pinch zooms the
 *   photo and never pages; the page settle keeps moving through a blocked
 *   main thread; only the current page takes focus and is in the
 *   accessibility tree; a controlled parent that keeps its index brings a
 *   swiped photo back; two pages on, a rotation keeps a zoomed photo's
 *   centre; a storyboard of a page swipe. Every case runs under a finger (a
 *   coarse pointer), in Chromium and WebKit alike
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxZoom.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  drag,
  frames,
  markElement,
  openStory,
  startScreencast,
  touchDriver,
  touchStoryboard,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
  type TouchScript,
} from '@astryxdesign/interaction-harness';
import {presentedFramesExpected} from './screenSignal';

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
  {
    rtl = false,
    story = 'core-lightbox--gallery-with-zoom',
    trigger: triggerName = 'Open gallery with zoom',
  } = {},
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
    await openStory(page, storybook(), story);
  }
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: triggerName});
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

function doubleTap(at: {x: number; y: number}): TouchScript {
  return [
    {t: 0, fingers: [{id: 0, ...at}]},
    {t: 50, fingers: []},
    {t: 170, fingers: [{id: 0, ...at}]},
    {t: 220, fingers: []},
  ];
}

/** A slow drag by dx, held still before the lift (no release velocity). */
function slowDrag(from: {x: number; y: number}, dx: number): TouchScript {
  return drag(
    from,
    {x: from.x + dx, y: from.y},
    {durationMs: 600, restMs: 150},
  );
}

/** Two fingers spreading while their centroid drifts sideways. */
function driftingPinch(
  centre: {x: number; y: number},
  driftX: number,
): TouchScript {
  const script: TouchScript[number][] = [];
  for (let i = 0; i <= 24; i++) {
    const p = i / 24;
    const half = 50 + 50 * p;
    const x = centre.x + driftX * p;
    script.push({
      t: i * 16,
      fingers: [
        {id: 0, x: x - half, y: centre.y},
        {id: 1, x: x + half, y: centre.y},
      ],
    });
  }
  script.push({t: 25 * 16 + 100, fingers: []});
  return script;
}

test("a drag past half a photo pages to the next one, Photos' 40 pt gap between them", async ({
  page,
}) => {
  const g = await openGallery(page);
  expect(await g.counter()).toBe('1 / 4');
  const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  // Mid-drag: the next page sits one page width plus the gap away.
  let gap = Number.NaN;
  await g.driver.play(slowDrag(mid, -g.box.width * 0.6), {
    onEvent: async step => {
      if (step.type === 'touchMove' && Number.isNaN(gap)) {
        gap = await g.track.evaluate(el => {
          const pages = [...el.children] as HTMLElement[];
          const current = pages.find(p => p.hasAttribute('data-current'));
          const next = current?.nextElementSibling as HTMLElement | null;
          if (current == null || next == null) {
            return Number.NaN;
          }
          return (
            next.getBoundingClientRect().left -
            current.getBoundingClientRect().right
          );
        });
      }
    },
  });
  expect(gap).toBeCloseTo(GAP, 0);
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  expect(await g.trackX()).toBeCloseTo(-(g.box.width + GAP), 0);
  await expect(g.dialog).toHaveAccessibleName('Mountain lake');
});

test('every page centres its photo on the same box, with or without a caption', async ({
  page,
}) => {
  // The story's first photo has a caption and the second none. The pages
  // share one caption row, so the photos line up mid-swipe and the next
  // photo rests where the first one did.
  const g = await openGallery(page);
  const centres = async () =>
    g.track.evaluate(el =>
      ([...el.children] as HTMLElement[]).map(p => {
        const img = p.querySelector('img');
        const r = img?.getBoundingClientRect();
        return {
          current: p.hasAttribute('data-current'),
          y: r == null ? Number.NaN : r.top + r.height / 2,
        };
      }),
    );
  const before = await centres();
  expect(before.length).toBeGreaterThan(1);
  const first = before.find(c => c.current)?.y ?? Number.NaN;
  for (const c of before) {
    expect(Math.abs(c.y - first)).toBeLessThan(1);
  }
  const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  let spread = Number.NaN;
  await g.driver.play(slowDrag(mid, -g.box.width * 0.6), {
    onEvent: async step => {
      if (step.type === 'touchMove' && Number.isNaN(spread)) {
        const ys = (await centres()).map(c => c.y);
        spread = Math.max(...ys) - Math.min(...ys);
      }
    },
  });
  expect(spread).toBeLessThan(1);
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  const after = (await centres()).find(c => c.current)?.y ?? Number.NaN;
  expect(Math.abs(after - first)).toBeLessThan(1);
});

test('a zoomed photo keeps the drag until its edge; the next drag from the edge pages', async ({
  page,
}) => {
  const g = await openGallery(page);
  const centre = {x: g.box.x + g.box.width / 2, y: g.box.y + g.box.height / 2};
  const current = g.viewport.locator('[data-current] img');
  await g.driver.play(doubleTap(centre));
  await waitForAnimation(current);
  await waitForRest(current);
  const zoomed = await g.photo();
  expect(zoomed.scale).toBeGreaterThan(1.5);
  // A drag left pans the photo 1:1 once past the pan's 10 px threshold; the
  // track stays.
  await g.driver.play(slowDrag(centre, -100));
  await waitForRest(current);
  const panned = await g.photo();
  expect(panned.x).toBeCloseTo(zoomed.x - 90, 0);
  expect(await g.trackX()).toBe(0);
  expect(await g.counter()).toBe('1 / 4');
  // Further left than the photo's right edge: it stops there (the drag
  // started inside the photo, so the pager never takes it).
  await g.driver.play(slowDrag(centre, -g.box.width));
  await waitForAnimation(current);
  await waitForRest(current);
  const atEdge = await g.photo();
  expect(await g.trackX()).toBe(0);
  expect(await g.counter()).toBe('1 / 4');
  // From the edge, the next drag left goes to the pager.
  await g.driver.play(slowDrag(centre, -g.box.width * 0.6));
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  expect((await g.photo()).scale).toBe(1);
  // The photo left behind is back at the fitted size (Photos resets it).
  const leftBehind = await g.track.evaluate(el => {
    const img = el.querySelector<HTMLElement>(
      '[data-lightbox-page]:not([data-current]) img',
    );
    return img == null ? null : getComputedStyle(img).scale;
  });
  expect(['none', '1']).toContain(leftBehind);
  expect(atEdge.scale).toBeCloseTo(zoomed.scale, 3);
});

test('right to left, a drag to the right pages to the next photo', async ({
  page,
}) => {
  const g = await openGallery(page, {rtl: true});
  expect(await g.dialog.evaluate(el => getComputedStyle(el).direction)).toBe(
    'rtl',
  );
  const from = {x: g.box.x + g.box.width * 0.2, y: g.box.y + g.box.height / 2};
  await g.driver.play(slowDrag(from, g.box.width * 0.6));
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  expect(await g.trackX()).toBeCloseTo(g.box.width + GAP, 0);
});

test('the Next button pages on setContentOffset(animated:)', async ({page}) => {
  const g = await openGallery(page);
  const next = g.dialog.getByRole('button', {name: 'Next'});
  const b = await next.boundingBox();
  if (b == null) {
    throw new Error('no Next button');
  }
  await g.driver.tap({x: b.x + b.width / 2, y: b.y + b.height / 2});
  const [move] = await waitForAnimation(g.track);
  expect(move.to - move.from).toBeGreaterThan(250);
  expect(move.to - move.from).toBeLessThan(350);
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  expect(await g.trackX()).toBeCloseTo(-(g.box.width + GAP), 0);
});

test('a pinch zooms the photo and never pages', async ({page}) => {
  const g = await openGallery(page);
  const centre = {x: g.box.x + g.box.width / 2, y: g.box.y + g.box.height / 2};
  await g.driver.play(driftingPinch(centre, -60));
  await frames(page, 30);
  expect((await g.photo()).scale).toBeGreaterThan(1.5);
  expect(await g.trackX()).toBe(0);
  expect(await g.counter()).toBe('1 / 4');
});

test('the page settle keeps advancing every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const g = await openGallery(page);
  await markElement(g.track, {mode: 'outline'});
  const cast = await startScreencast(page);
  const from = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  await g.driver.play(slowDrag(from, -g.box.width * 0.6));
  const [settle] = await waitForAnimation(g.track, {minProgressMs: 16});
  const block = await blockMainThread(page, 400);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, settle.to)},
    {axis: 'x', settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/lightbox-page-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, settle, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'lightbox-page-settle-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, settle.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, settle});
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(
    presentedFramesExpected(proof) - 2,
  );
  expect(proof.longestStallMs).toBeLessThan(proof.cadenceMs * 2.5);
  expect(proof.monotonic).toBe(true);
});

test(
  'storyboard: a page swipe in the gallery',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const g = await openGallery(page);
    const from = {
      x: g.box.x + g.box.width * 0.8,
      y: g.box.y + g.box.height / 2,
    };
    const board = await touchStoryboard(
      page,
      g.driver,
      drag(
        from,
        {x: from.x - g.box.width * 0.6, y: from.y},
        {
          durationMs: 300,
          hz: 20,
          restMs: 100,
        },
      ),
      {
        name: 'lightbox-page-swipe',
        measure: async () => ({x: +(await g.trackX()).toFixed(1)}),
        columns: 4,
        cellScale: 0.35,
      },
    );
    await board.write(testInfo);
    await waitForRest(g.track);
    expect(await g.counter()).toBe('2 / 4');
  },
);

test('only the current page takes focus and is in the accessibility tree', async ({
  page,
}) => {
  const g = await openGallery(page);
  const next = g.dialog.getByRole('button', {name: 'Next'});
  const b = await next.boundingBox();
  if (b == null) {
    throw new Error('no Next button');
  }
  await g.driver.tap({x: b.x + b.width / 2, y: b.y + b.height / 2});
  await waitForRest(g.track);
  expect(await g.counter()).toBe('2 / 4');
  const pages = await g.track.evaluate(el =>
    ([...el.children] as HTMLElement[]).map(p => ({
      current: p.hasAttribute('data-current'),
      inert: p.inert,
      hidden: p.getAttribute('aria-hidden'),
    })),
  );
  expect(pages.length).toBe(3);
  for (const p of pages) {
    expect(p.inert).toBe(!p.current);
    expect(p.hidden).toBe(p.current ? null : 'true');
  }
  // Tab through the dialog: focus never enters a page off screen, and the
  // stage never scrolls to show one.
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const page = document.activeElement?.closest('[data-lightbox-page]');
      if (page == null) {
        return 'outside';
      }
      return page.hasAttribute('data-current') ? 'current' : 'off screen';
    });
    expect(where).not.toBe('off screen');
  }
  expect(await g.viewport.evaluate(el => el.scrollLeft)).toBe(0);
});

test('a controlled parent that keeps its index brings a swiped photo back', async ({
  page,
}) => {
  const g = await openGallery(page, {
    story: 'core-lightbox--gallery-keeps-index',
    trigger: 'Open gallery that keeps its photo',
  });
  expect(await g.counter()).toBe('1 / 4');
  const mid = {x: g.box.x + g.box.width * 0.8, y: g.box.y + g.box.height / 2};
  await g.driver.play(slowDrag(mid, -g.box.width * 0.6));
  await waitForRest(g.track);
  await frames(page, 2);
  await waitForRest(g.track);
  expect(await g.counter()).toBe('1 / 4');
  expect(await g.trackX()).toBeCloseTo(0, 0);
  await expect(g.dialog).toHaveAccessibleName('Forest path');
});

test("two pages on, a rotation keeps a zoomed photo's centre point", async ({
  page,
}) => {
  const g = await openGallery(page);
  const next = g.dialog.getByRole('button', {name: 'Next'});
  for (const expected of ['2 / 4', '3 / 4']) {
    const b = await next.boundingBox();
    if (b == null) {
      throw new Error('no Next button');
    }
    await g.driver.tap({x: b.x + b.width / 2, y: b.y + b.height / 2});
    await waitForRest(g.track);
    expect(await g.counter()).toBe(expected);
  }
  const img = g.dialog.locator('[data-current] img');
  const fitted = await img.boundingBox();
  if (fitted == null) {
    throw new Error('no photo');
  }
  await g.driver.play(
    doubleTap({
      x: fitted.x + fitted.width * 0.4,
      y: fitted.y + fitted.height / 2,
    }),
  );
  await waitForAnimation(img);
  await waitForRest(img);
  // Where the stage's centre falls on the photo, as a fraction of it.
  const centreOnPhoto = async () => {
    const photo = await img.boundingBox();
    const stage = await g.viewport.boundingBox();
    if (photo == null || stage == null) {
      throw new Error('no photo');
    }
    return {
      u: (stage.x + stage.width / 2 - photo.x) / photo.width,
      v: (stage.y + stage.height / 2 - photo.y) / photo.height,
    };
  };
  const before = await centreOnPhoto();
  const size = page.viewportSize() ?? {width: 402, height: 714};
  await page.setViewportSize({width: size.height, height: size.width});
  await frames(page, 6);
  await waitForRest(img);
  const after = await centreOnPhoto();
  expect(Math.abs(after.u - before.u)).toBeLessThan(0.02);
  expect(Math.abs(after.v - before.v)).toBeLessThan(0.02);
});

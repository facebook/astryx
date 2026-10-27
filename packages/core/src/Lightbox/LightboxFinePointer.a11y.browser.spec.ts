// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxFinePointer.a11y.browser.spec.ts
 * @input The built Lightbox "with zoom" story, a desktop browser (a fine
 *   primary pointer) and real mouse input; in Chromium, pen input
 * @output Browser evidence that touch work leaves fine-pointer zoom alone
 *   (spec:AST-017 FR59, spec:AST-094 FR19): the zoom target keeps the
 *   browser's touch-action, a double-click from a mouse or a pen zooms 2x
 *   about the centre and back over the released 200 ms ease-out, a pen drag
 *   pans a zoomed photo as a mouse drag does, and a drag stops at the
 *   photo's edges
 * @position Cross-browser proof for Lightbox's mouse, pen and keyboard zoom
 *   where no touch layer runs
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

const PHOTO = {width: 3000, height: 2000};

/** A landscape test photo: a checker with a red disc at its centre. */
function photoSvg(width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/><circle cx="${width / 2}" cy="${height / 2}" r="${height / 4}" fill="#d22"/></svg>`;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Opens the story's viewer with the mouse and waits for the photo. */
async function openViewer(page: Page) {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: photoSvg(PHOTO.width, PHOTO.height),
    }),
  );
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-lightbox--with-zoom&viewMode=story`,
  );
  await page.getByRole('button', {name: 'Open with zoom'}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const stage = dialog.getByRole('button', {name: 'Zoom'});
  const img = dialog.getByRole('img', {name: 'Forest path'});
  await expect
    .poll(async () => img.evaluate(el => (el as HTMLImageElement).naturalWidth))
    .toBe(PHOTO.width);
  await settled(page);
  const fitted = await boxOf(img);
  const stageBox = await boxOf(stage);
  return {dialog, stage, img, fitted, stageBox};
}

async function boxOf(locator: {
  evaluate: <R>(fn: (el: Element) => R) => Promise<R>;
}): Promise<Box> {
  return locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    return {x: r.x, y: r.y, width: r.width, height: r.height};
  });
}

/** Waits until the photo's box holds still for six frames (at most 3 s). */
async function settled(page: Page): Promise<void> {
  await page.evaluate(
    async () =>
      new Promise<void>(resolve => {
        const img = document.querySelector('dialog img');
        const started = performance.now();
        let last = '';
        let still = 0;
        const tick = (now: number) => {
          const r = img?.getBoundingClientRect();
          const key = r ? `${r.x},${r.y},${r.width},${r.height}` : '';
          still = key === last ? still + 1 : 0;
          last = key;
          if (still >= 6 || now - started > 3000) {
            resolve();
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      }),
  );
}

function centre(box: Box) {
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

test('the zoom target keeps the browser’s touch-action where the primary pointer is fine', async ({
  page,
}) => {
  const {stage} = await openViewer(page);
  // No touch layer runs here (spec:AST-094 FR19), so nothing may take the
  // touches from the browser: a touchscreen laptop's pinch still zooms the
  // page.
  expect(await stage.evaluate(el => getComputedStyle(el).touchAction)).toBe(
    'auto',
  );
});

test('a mouse double-click zooms 2x about the centre and back, wherever it lands', async ({
  page,
}) => {
  const {stage, img, fitted, stageBox} = await openViewer(page);
  // A quarter of the way in from the photo's top-left corner: Photos' double
  // tap would bring this point to the centre; Lightbox's released zoom
  // ignores it.
  await page.mouse.dblclick(
    fitted.x + fitted.width / 4,
    fitted.y + fitted.height / 4,
  );
  await expect(stage).toHaveAttribute('aria-pressed', 'true');
  await settled(page);
  const zoomed = await boxOf(img);
  expect(zoomed.width / fitted.width).toBeCloseTo(2, 2);
  expect(zoomed.height / fitted.height).toBeCloseTo(2, 2);
  expect(Math.abs(centre(zoomed).x - centre(stageBox).x)).toBeLessThan(1);
  expect(Math.abs(centre(zoomed).y - centre(stageBox).y)).toBeLessThan(1);
  await page.mouse.dblclick(centre(stageBox).x, centre(stageBox).y);
  await expect(stage).toHaveAttribute('aria-pressed', 'false');
  await settled(page);
  const back = await boxOf(img);
  expect(back.width).toBeCloseTo(fitted.width, 1);
  expect(back.x).toBeCloseTo(fitted.x, 1);
});

test('the double-click zoom plays the released 200 ms ease-out', async ({
  page,
}) => {
  const {fitted, stageBox} = await openViewer(page);
  // Samples the photo's width every frame from the double-click on. The
  // sampler is in place before the double-click (an awaited install): one the
  // page gets first would leave it waiting for a press that already came.
  await page.evaluate(() => {
    (window as unknown as {__samples: Promise<[number, number][]>}).__samples =
      new Promise<[number, number][]>(resolve => {
        const img = document.querySelector('dialog img');
        const samples: [number, number][] = [];
        let start: number | null = null;
        window.addEventListener(
          'dblclick',
          () => {
            start = performance.now();
          },
          {capture: true, once: true},
        );
        const tick = (now: number) => {
          if (start != null && img != null) {
            samples.push([now - start, img.getBoundingClientRect().width]);
          }
          if (start == null || now - start < 800) {
            requestAnimationFrame(tick);
          } else {
            resolve(samples);
          }
        };
        requestAnimationFrame(tick);
      });
  });
  await page.mouse.dblclick(centre(stageBox).x, centre(stageBox).y);
  const samples = await page.evaluate(
    async () =>
      (window as unknown as {__samples: Promise<[number, number][]>}).__samples,
  );
  const to = fitted.width * 2;
  const progress = (width: number) =>
    (width - fitted.width) / (to - fitted.width);
  // Timed from the last frame before the photo moved: an engine can start
  // the animation a frame or more after the double-click, more on a busy
  // runner, and the start-up is not the curve.
  const first = samples.findIndex(([, width]) => progress(width) > 0.001);
  expect(first).toBeGreaterThanOrEqual(0);
  const origin = first > 0 ? samples[first - 1][0] : 0;
  // Progress 100 ms in, interpolated between the frames around it: CSS
  // `ease-out` over 200 ms is past 0.6 there (0.69 at its middle), where
  // UIScrollView's eased settle over its ~0.31 s is near 0.25.
  const after = samples.findIndex(([t]) => t - origin >= 100);
  expect(after).toBeGreaterThan(0);
  const [t0, w0] = samples[after - 1];
  const [t1, w1] = samples[after];
  const at100 = progress(w0 + ((w1 - w0) * (origin + 100 - t0)) / (t1 - t0));
  expect(at100).toBeGreaterThan(0.5);
  // It ends within the 200 ms and a frame or two.
  const doneAt = samples.find(([, width]) => progress(width) > 0.995)?.[0];
  expect(doneAt).toBeDefined();
  expect((doneAt ?? Number.POSITIVE_INFINITY) - origin).toBeLessThan(250);
});

test('a pen double-click zooms too: no touch layer takes the pen', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Pen input is dispatched through the Chrome DevTools Protocol.',
  );
  const {stage, stageBox} = await openViewer(page);
  const cdp = await page.context().newCDPSession(page);
  const {x, y} = centre(stageBox);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x,
    y,
    pointerType: 'pen',
  });
  for (const clickCount of [1, 2]) {
    for (const type of ['mousePressed', 'mouseReleased'] as const) {
      await cdp.send('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: 'left',
        clickCount,
        pointerType: 'pen',
      });
    }
  }
  await expect(stage).toHaveAttribute('aria-pressed', 'true');
});

test('a pen drag pans a zoomed photo too: no touch layer takes the pen', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Pen input is dispatched through the Chrome DevTools Protocol.',
  );
  const {stage, img, stageBox} = await openViewer(page);
  const middle = centre(stageBox);
  await page.mouse.dblclick(middle.x, middle.y);
  await expect(stage).toHaveAttribute('aria-pressed', 'true');
  await settled(page);
  const before = await boxOf(img);
  const cdp = await page.context().newCDPSession(page);
  const pen = async (
    type: 'mouseMoved' | 'mousePressed' | 'mouseReleased',
    x: number,
    pressed: boolean,
  ) =>
    cdp.send('Input.dispatchMouseEvent', {
      type,
      x,
      y: middle.y,
      pointerType: 'pen',
      button: type === 'mouseMoved' && !pressed ? 'none' : 'left',
      buttons: pressed ? 1 : 0,
      clickCount: type === 'mouseMoved' ? 0 : 1,
    });
  await pen('mouseMoved', middle.x, false);
  await pen('mousePressed', middle.x, true);
  for (let i = 1; i <= 8; i++) {
    await pen('mouseMoved', middle.x - i * 10, true);
  }
  await pen('mouseReleased', middle.x - 80, false);
  await settled(page);
  const after = await boxOf(img);
  expect(after.x - before.x).toBeCloseTo(-80, 0);
});

test('a mouse drag stops at the photo’s edges instead of carrying it out of view', async ({
  page,
}) => {
  const {stage, img, stageBox} = await openViewer(page);
  const middle = centre(stageBox);
  await page.mouse.dblclick(middle.x, middle.y);
  await expect(stage).toHaveAttribute('aria-pressed', 'true');
  await settled(page);
  await page.mouse.move(middle.x, middle.y);
  await page.mouse.down();
  await page.mouse.move(middle.x + 1500, middle.y + 900, {steps: 12});
  await page.mouse.up();
  await settled(page);
  const dragged = await boxOf(img);
  // The photo's left edge stops on the stage's left edge, and it still
  // covers the stage's width (2x of a fitted photo is wider than the stage).
  expect(dragged.x).toBeLessThanOrEqual(stageBox.x + 0.5);
  expect(dragged.x + dragged.width).toBeGreaterThanOrEqual(
    stageBox.x + stageBox.width - 0.5,
  );
  // Vertically it stays where a zoomed photo may rest: inside the stage
  // where it is shorter, covering it where taller.
  if (dragged.height <= stageBox.height) {
    expect(dragged.y).toBeGreaterThanOrEqual(stageBox.y - 0.5);
    expect(dragged.y + dragged.height).toBeLessThanOrEqual(
      stageBox.y + stageBox.height + 0.5,
    );
  } else {
    expect(dragged.y).toBeLessThanOrEqual(stageBox.y + 0.5);
  }
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxEveryPointer.interaction.browser.spec.ts
 * @input The built "With zoom", "Gallery with zoom" and "Default" Lightbox
 *   stories, their photos served as a 3000 × 2000 test image; a desktop
 *   context (1280 × 800, a fine primary pointer) with a mouse, a trackpad's
 *   wheel and, in Chromium, a pen and timed mouse events through the Chrome
 *   DevTools Protocol
 * @output Proofs that Lightbox's gestures work for every pointer
 *   (spec:AST-094 FR43): a mouse drag down dismisses and one brought back
 *   springs back, a mouse drag sideways and a trackpad's horizontal scroll
 *   page a gallery, a ctrl-wheel zooms and, out from the fitted size, closes
 *   the viewer, a wheel pans a zoomed photo, a zoomed drag released moving
 *   coasts, a pen drag down dismisses, a wheel scroll down over a fitted
 *   photo begins a dismiss, and under Reduce Motion a mouse's release closes
 *   at once where the primary pointer is fine (design:reduced-motion DR3)
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxZoomModes.interaction.browser.spec.ts
 */

import {
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  frames,
  openStory,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

type Story = 'with-zoom' | 'gallery-with-zoom' | 'default';

const TRIGGER: Record<Story, string> = {
  'with-zoom': 'Open with zoom',
  'gallery-with-zoom': 'Open gallery with zoom',
  default: 'Open lightbox',
};

function photoSvg(width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#5f7fa6"/><circle cx="${width / 2}" cy="${height / 2}" r="${height / 4}" fill="#fff" fill-opacity="0.35"/></svg>`;
}

interface Point {
  x: number;
  y: number;
}

/** Opens a story's viewer in a desktop context: a mouse, no touch. */
async function openDesktop(
  browser: Browser,
  story: Story,
  {reducedMotion = false}: {reducedMotion?: boolean} = {},
) {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  // A fine primary pointer in this context (the interaction config can report
  // a coarse one without touch).
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg(3000, 2000)}),
  );
  await openStory(page, storybook(), `core-lightbox--${story}`);
  await page.getByRole('button', {name: TRIGGER[story]}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const img =
    story === 'gallery-with-zoom'
      ? dialog.locator('[data-current] img')
      : dialog.getByRole('img').first();
  await expect
    .poll(async () => img.evaluate(el => (el as HTMLImageElement).naturalWidth))
    .toBe(3000);
  await frames(page, 2);
  const box = await boxOf(img);
  // A wheel delta as the page receives it, in CSS pixels: Chromium's input
  // divides Playwright's by the device pixel ratio (WebKit's does not), and a
  // mouse wheel's notch is a whole 100 px only as the page sees it.
  const scale =
    page.context().browser()?.browserType().name() === 'chromium'
      ? await page.evaluate(() => window.devicePixelRatio)
      : 1;
  return {
    wheel: async (dx: number, dy: number) =>
      page.mouse.wheel(dx * scale, dy * scale),
    context,
    page,
    dialog,
    img,
    centre: {x: box.x + box.width / 2, y: box.y + box.height / 2},
  };
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return box;
}

/** A mouse pressed at `from` and moved to `to` in `steps`, `stepMs` apart. */
async function mouseDrag(
  page: Page,
  from: Point,
  to: Point,
  {steps, stepMs}: {steps: number; stepMs: number},
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      from.x + ((to.x - from.x) * i) / steps,
      from.y + ((to.y - from.y) * i) / steps,
    );
    await page.waitForTimeout(stepMs);
  }
}

/**
 * Mouse or pen events with exact timestamps through the Chrome DevTools
 * Protocol: a release's velocity is the move's, whatever the runner's pace.
 */
async function timedPointer(page: Page, pointerType: 'mouse' | 'pen') {
  const cdp = await page.context().newCDPSession(page);
  let clock = await page.evaluate(
    () => performance.timeOrigin + performance.now(),
  );
  return async (
    type: 'mousePressed' | 'mouseMoved' | 'mouseReleased',
    at: Point,
    afterMs: number,
  ) => {
    clock += afterMs;
    await cdp.send('Input.dispatchMouseEvent', {
      type,
      x: at.x,
      y: at.y,
      button: 'left',
      buttons: type === 'mouseReleased' ? 0 : 1,
      clickCount: type === 'mouseMoved' ? 0 : 1,
      pointerType,
      timestamp: clock / 1000,
    });
  };
}

test('a mouse drag down from the fitted size follows the pointer and closes the viewer at the release', async ({
  browser,
}) => {
  const {context, page, dialog, img, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    const before = await boxOf(img);
    await mouseDrag(
      page,
      centre,
      {x: centre.x, y: centre.y + 150},
      {
        steps: 10,
        stepMs: 16,
      },
    );
    // The photo follows past the pan's 10 px threshold, as under a finger.
    expect((await boxOf(img)).y - before.y).toBeGreaterThan(100);
    await page.mouse.up();
    await expect(dialog).toBeHidden();
  } finally {
    await context.close();
  }
});

test('a mouse drag down brought back to where it started springs back, the viewer open', async ({
  browser,
}) => {
  const {context, page, dialog, img, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    const before = await boxOf(img);
    await mouseDrag(
      page,
      centre,
      {x: centre.x, y: centre.y + 120},
      {
        steps: 8,
        stepMs: 16,
      },
    );
    // It followed the pointer down.
    expect((await boxOf(img)).y - before.y).toBeGreaterThan(80);
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(centre.x, centre.y + 120 - 15 * i);
      await page.waitForTimeout(16);
    }
    // Held still at the start, then let go: nothing projects past the
    // dismissal's distance.
    await page.waitForTimeout(250);
    await page.mouse.up();
    await waitForRest(img);
    await expect(dialog).toBeVisible();
    expect((await boxOf(img)).y).toBeCloseTo(before.y, 0);
  } finally {
    await context.close();
  }
});

test('a mouse drag sideways pages a gallery', async ({browser}) => {
  const {context, page, dialog, centre} = await openDesktop(
    browser,
    'gallery-with-zoom',
  );
  try {
    const counter = dialog.getByText(/^\d+ \/ \d+$/);
    await expect(counter).toHaveText('1 / 4');
    // Past half a page from the photo's right side, so the release pages on
    // its travel alone, whatever the runner's pace.
    await mouseDrag(
      page,
      {x: 1100, y: centre.y},
      {x: 250, y: centre.y},
      {steps: 17, stepMs: 16},
    );
    await page.mouse.up();
    await expect(counter).toHaveText('2 / 4');
  } finally {
    await context.close();
  }
});

test('a trackpad’s horizontal scroll pages a gallery', async ({browser}) => {
  const {wheel, context, page, dialog, centre} = await openDesktop(
    browser,
    'gallery-with-zoom',
  );
  try {
    const counter = dialog.getByText(/^\d+ \/ \d+$/);
    await expect(counter).toHaveText('1 / 4');
    await page.mouse.move(centre.x, centre.y);
    // Past half a page, so the gesture pages on its travel alone.
    for (let i = 0; i < 20; i++) {
      await wheel(40, 0);
      await page.waitForTimeout(16);
    }
    await expect(counter).toHaveText('2 / 4');
  } finally {
    await context.close();
  }
});

test('a ctrl-wheel zooms the photo, and a ctrl-wheel out from the fitted size closes the viewer', async ({
  browser,
}) => {
  const {wheel, context, page, dialog, img, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    const fitted = await boxOf(img);
    await page.mouse.move(centre.x, centre.y);
    await page.keyboard.down('Control');
    for (let i = 0; i < 3; i++) {
      await wheel(0, -20);
      await page.waitForTimeout(16);
    }
    await page.keyboard.up('Control');
    await expect(dialog.getByRole('button', {name: 'Zoom'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await waitForRest(img);
    expect((await boxOf(img)).width).toBeGreaterThan(fitted.width * 1.05);
  } finally {
    await context.close();
  }
  const reopened = await openDesktop(browser, 'with-zoom');
  try {
    await reopened.page.mouse.move(reopened.centre.x, reopened.centre.y);
    await reopened.page.keyboard.down('Control');
    for (let i = 0; i < 6; i++) {
      await reopened.wheel(0, 40);
      await reopened.page.waitForTimeout(16);
    }
    await reopened.page.keyboard.up('Control');
    await expect(reopened.dialog).toBeHidden();
  } finally {
    await reopened.context.close();
  }
});

test('a wheel pans a zoomed photo', async ({browser}) => {
  const {wheel, context, page, dialog, img, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    await dialog.getByRole('button', {name: 'Zoom'}).focus();
    await page.keyboard.press('+');
    await waitForRest(img);
    const zoomed = await boxOf(img);
    await page.mouse.move(centre.x, centre.y);
    await wheel(0, 120);
    await expect
      .poll(async () => (await boxOf(img)).y, {timeout: 3000})
      .toBeLessThan(zoomed.y - 20);
    await expect(dialog).toBeVisible();
  } finally {
    await context.close();
  }
});

test('a zoomed photo coasts on after a mouse drag released moving', async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Timed mouse events are dispatched through the Chrome DevTools Protocol.',
  );
  const {context, page, dialog, img, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    await dialog.getByRole('button', {name: 'Zoom'}).focus();
    await page.keyboard.press('+');
    await waitForRest(img);
    const mouse = await timedPointer(page, 'mouse');
    await mouse('mouseMoved', centre, 0);
    await mouse('mousePressed', centre, 16);
    for (let i = 1; i <= 6; i++) {
      await mouse('mouseMoved', {x: centre.x - 20 * i, y: centre.y}, 16);
    }
    await mouse('mouseReleased', {x: centre.x - 120, y: centre.y}, 4);
    const atRelease = (await boxOf(img)).x;
    await waitForRest(img);
    // It kept going after the release, as a finger's flick does.
    expect((await boxOf(img)).x).toBeLessThan(atRelease - 20);
  } finally {
    await context.close();
  }
});

test('a pen drag down closes the viewer', async ({browser, browserName}) => {
  test.skip(
    browserName !== 'chromium',
    'Pen input is dispatched through the Chrome DevTools Protocol.',
  );
  const {context, page, dialog, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    const pen = await timedPointer(page, 'pen');
    await pen('mouseMoved', centre, 0);
    await pen('mousePressed', centre, 16);
    for (let i = 1; i <= 8; i++) {
      await pen('mouseMoved', {x: centre.x, y: centre.y + 20 * i}, 24);
    }
    await pen('mouseReleased', {x: centre.x, y: centre.y + 160}, 8);
    await expect(dialog).toBeHidden();
  } finally {
    await context.close();
  }
});

test('a wheel notch that moves a fitted photo down closes the viewer: released still, its 100 px pass the drag’s commit point (spec:AST-094 FR43)', async ({
  browser,
}) => {
  const {wheel, context, page, dialog, img, centre} = await openDesktop(
    browser,
    'with-zoom',
  );
  try {
    const before = await boxOf(img);
    await page.mouse.move(centre.x, centre.y);
    const lowest = page.evaluate(
      async () =>
        new Promise<number>(resolve => {
          const photo = document.querySelector('dialog img');
          let low = photo?.getBoundingClientRect().y ?? 0;
          const t0 = performance.now();
          const tick = () => {
            low = Math.max(low, photo?.getBoundingClientRect().y ?? low);
            if (performance.now() - t0 < 400) {
              requestAnimationFrame(tick);
            } else {
              resolve(low);
            }
          };
          requestAnimationFrame(tick);
        }),
    );
    // A scroll moves the content with it (a trackpad's swipe down, under
    // natural scrolling, or a wheel turned toward the reader).
    await page.evaluate(() => {
      const w = window as unknown as {__deltas: number[]};
      w.__deltas = [];
      window.addEventListener('wheel', e => w.__deltas.push(e.deltaY), {
        capture: true,
      });
    });
    await wheel(0, -100);
    // A mouse wheel's notch, as the page saw it.
    expect(
      await page.evaluate(
        () => (window as unknown as {__deltas: number[]}).__deltas,
      ),
    ).toEqual([-100]);
    // The photo moved down with the scroll, as a drag down moves it.
    expect(await lowest).toBeGreaterThan(before.y + 20);
    // A notch releases still (position alone decides), and 100 px are past
    // the commit point, `zoomMedia.dismiss.cancelTravel` (10 pt): the viewer
    // closes, as a pull held still and lifted does.
    await expect(dialog).toBeHidden();
  } finally {
    await context.close();
  }
});

test('under Reduce Motion a mouse’s release closes the viewer at once where the primary pointer is fine (design:reduced-motion DR3)', async ({
  browser,
}) => {
  const {context, page, dialog, centre} = await openDesktop(
    browser,
    'with-zoom',
    {reducedMotion: true},
  );
  try {
    await mouseDrag(
      page,
      centre,
      {x: centre.x, y: centre.y + 150},
      {
        steps: 10,
        stepMs: 16,
      },
    );
    await page.mouse.up();
    // At once: no fade (DR2 is a coarse pointer's or a finger's release).
    await expect(dialog).toBeHidden({timeout: 150});
  } finally {
    await context.close();
  }
});

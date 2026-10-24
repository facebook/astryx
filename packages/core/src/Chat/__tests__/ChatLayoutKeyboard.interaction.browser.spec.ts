// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatLayoutKeyboard.interaction.browser.spec.ts
 * @input The built "Full AI Chat" ChatLayout story, a stand-in visual
 *   viewport that reports a software keyboard, real touch input and the
 *   interaction harness
 * @output Interaction and animation proofs for ChatLayout's keyboard
 *   behavior: the dock rides the keyboard on `springs.keyboard` (sampled
 *   curve), keeps moving while the main thread is blocked, does no Layout or
 *   Paint per frame, the transcript stays at its newest message, the dock
 *   comes down with the hide and goes back up when the viewport says the
 *   keyboard stayed, a tap on the composer's text focuses it without
 *   scrolling the page; a storyboard of the show
 * @position Browser proofs for Chat/useChatKeyboard.ts and
 *   keyboard/keyboardLayoutGuide.ts. Headless browsers have no software
 *   keyboard, so the page's `visualViewport` is replaced by one the test
 *   shrinks the way Mobile Safari does (one `resize`, final height); Mobile
 *   Safari itself is proven on the iOS simulator (pull request evidence)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  curveOf,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  springStep,
  startScreencast,
  timeline,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// UIKit's keyboard spring (motion/uikit springs.keyboard): mass 1,
// stiffness 555.0265, damping 47.118 — critically damped, response 2π/√k.
const KEYBOARD = {
  response: (2 * Math.PI) / Math.sqrt(555.0265),
  dampingFraction: 47.118 / (2 * Math.sqrt(555.0265)),
};
// The cover Mobile Safari reports on an iPhone 17 Pro (keyboard, accessory
// bar and the floating address bar over a 714 px layout viewport).
const COVER = 337;

/**
 * Replaces `window.visualViewport` before the page loads with one the test
 * drives: `__keyboard(cover)` shrinks it from the bottom and fires one
 * `resize`, as Mobile Safari does.
 */
async function installKeyboard(page: Page) {
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      width: window.innerWidth,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      get: () => viewport,
    });
    (window as unknown as {__keyboard: (cover: number) => void}).__keyboard =
      cover => {
        viewport.height = window.innerHeight - cover;
        viewport.dispatchEvent(new Event('resize'));
      };
  });
}

interface Chat {
  dock: Locator;
  messages: Locator;
  editable: Locator;
  /**
   * How far the dock rises for COVER: until its resting bottom (the root's
   * bottom edge, which may sit below the layout viewport's) clears the cover.
   */
  lift: number;
}

async function openChat(page: Page): Promise<Chat> {
  await installKeyboard(page);
  await openStory(page, storybook(), 'core-chatlayout--full-ai-chat');
  const editable = page.locator('[contenteditable="true"]').first();
  await expect(editable).toBeVisible();
  // Name the dock (the sticky container around the composer) and the
  // message area for the locators below.
  await editable.evaluate(element => {
    let dock: HTMLElement | null = element as HTMLElement;
    while (dock != null && getComputedStyle(dock).position !== 'sticky') {
      dock = dock.parentElement;
    }
    dock?.setAttribute('data-testid', 'keyboard-dock');
    dock?.parentElement?.firstElementChild?.setAttribute(
      'data-testid',
      'keyboard-messages',
    );
  });
  const dock = page.getByTestId('keyboard-dock');
  const messages = page.getByTestId('keyboard-messages');
  // The story opens at its newest message.
  await page.waitForTimeout(300);
  const lift = await dock.evaluate(
    (el, cover) =>
      (el.parentElement as HTMLElement).getBoundingClientRect().bottom -
      (window.innerHeight - cover),
    COVER,
  );
  return {dock, messages, editable, lift};
}

// WebKit's Linux build runs no animation inside a sticky element that sits in
// an overflow scroller on its compositor: with the main thread blocked, the
// dock (and a plain box nested in it) froze, while a box in the same scroller
// outside the sticky dock kept moving, as did a sticky element in the
// document. Mobile Safari scrolls overflow on the compositor with sticky
// nodes of its own; this proof runs in Chromium and on the iOS simulator.
const STICKY_IN_SCROLLER_SKIP =
  "WebKit's Linux build does not composite animations inside a sticky element in an overflow scroller";

const showKeyboard = async (page: Page, cover = COVER) =>
  page.evaluate(
    c => (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c),
    cover,
  );

// The presented vertical `translate` (the animator moves the individual
// property, not `transform`).
const dockY = async (dock: Locator) =>
  dock.evaluate(el => {
    const value = getComputedStyle(el).translate;
    return value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0') || 0;
  });

test('the dock rises on the keyboard spring by the cover over it', async ({
  page,
}, testInfo) => {
  const {dock, lift} = await openChat(page);
  await showKeyboard(page);
  await waitForAnimation(dock);
  const held = await holdAnimations(page, dock);
  const curveEnd = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(dock, timeline(curveEnd)),
    'translateY',
  );
  await releaseAnimations(page);
  // The dock moves from rest to −lift on UIKit's keyboard spring.
  const expected = (t: number) => -lift * springStep(KEYBOARD, t);
  const result = compareCurve(samples, expected, 0.5);
  await writeEvidence(
    'curves/chatlayout-keyboard-show',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {held, comparison: result},
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  expect(samples.at(-1)?.value).toBeCloseTo(-lift, 0);
});

test('the transcript at its newest message stays there', async ({page}) => {
  const {dock, lift} = await openChat(page);
  const atEnd = async () =>
    dock.evaluate(el => {
      const scroller = el.parentElement as HTMLElement;
      return (
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 2
      );
    });
  expect(await atEnd()).toBe(true);
  await showKeyboard(page);
  await waitForRest(dock);
  expect(await atEnd()).toBe(true);
  expect(await dockY(dock)).toBeCloseTo(-lift, 0);
});

test('the dock comes down when the composer text loses focus', async ({
  page,
}) => {
  const {dock, editable} = await openChat(page);
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  await editable.evaluate(el => (el as HTMLElement).blur());
  // The hide starts from the blur; Mobile Safari reports it once the
  // keyboard is down.
  await waitForAnimation(dock);
  await page.waitForTimeout(440);
  await showKeyboard(page, 0);
  await waitForRest(dock);
  expect(await dockY(dock)).toBeCloseTo(0, 0);
});

test('a hide the viewport never confirms puts the dock back on the keyboard', async ({
  page,
}) => {
  const {dock, editable, lift} = await openChat(page);
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  // Focus leaves, but the keyboard stays up (the viewport keeps reporting it).
  await editable.evaluate(el => (el as HTMLElement).blur());
  await waitForAnimation(dock);
  await page.waitForTimeout(800);
  await waitForRest(dock);
  expect(await dockY(dock)).toBeCloseTo(-lift, 0);
});

test('a tap on the composer text focuses it without scrolling the page', async ({
  page,
}) => {
  const {editable} = await openChat(page);
  const driver = await touchDriver(page);
  const box = await editable.boundingBox();
  if (box == null) {
    throw new Error('no editable');
  }
  const before = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
  await driver.tap({x: box.x + 24, y: box.y + box.height / 2});
  await expect(editable).toBeFocused();
  const after = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
  expect(after).toEqual(before);
});

test('the rise keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName === 'webkit', STICKY_IN_SCROLLER_SKIP);
  const {dock} = await openChat(page);
  await markElement(dock);
  const cast = await startScreencast(page);
  await showKeyboard(page);
  // Mid-flight. The show is dated back to the keyboard's start, so its first
  // frame already reads more than 16 ms: blocking in that frame would stop
  // the animation before its first commit, which no compositor can run. Let
  // two frames pass (the first commit) and block once it has run 70 ms.
  await page.evaluate(
    async () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const block = await blockMainThread(page, 500, {
    during: dock,
    minProgressMs: 70,
  });
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(tracked, block, {settledWithin: 2});
  await writeEvidence(
    'busy-main-thread/chatlayout-keyboard-show',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            y: f.box?.y ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'chatlayout-keyboard-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: proof.judged.to + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({y: tracked.find(f => f.t === t)?.box?.y ?? -1}),
  });
  await film.write(testInfo, {block, judged: proof.judged});
  testInfo.annotations.push({
    type: 'busy-main-thread',
    description: proof.summary,
  });
  expect(proof.verdict.failures, proof.summary).toEqual([]);
  expect(proof.monotonic).toBe(true);
});

test('the rise does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await openChat(page);
  // No polling inside the trace: reading a sticky element's presented style
  // from the test forces a layout every frame by itself.
  let rise = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    rise = await page.evaluate(async cover => {
      const from = performance.timeOrigin + performance.now();
      (window as unknown as {__keyboard: (c: number) => void}).__keyboard(
        cover,
      );
      await new Promise(resolve => setTimeout(resolve, 450));
      return {from, to: performance.timeOrigin + performance.now()};
    }, COVER);
  });
  // The steady part of the rise, 150–400 ms after the report. Its start lays
  // out and paints a few times (the spacer, the scroll to the newest message,
  // the scroll's handlers), within 75 ms of the report at a 6x CPU slowdown;
  // its end (about 480 ms) hands the layers back, which lays out once. A
  // window that followed the late timer under load would take that in.
  const during = countBetween(trace, rise.from + 150, rise.from + 400);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test(
  'storyboard: the keyboard shows and the composer rides it',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {dock, messages, lift} = await openChat(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    await showKeyboard(page);
    await waitForAnimation(dock);
    const {storyboard} = await animationStoryboard(page, {
      name: 'chatlayout-keyboard-show',
      clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
      times: timeline(400, 400 / 12),
      columns: 6,
      cellScale: 0.4,
      measure: async () => ({
        dockY: await dockY(dock),
        messagesY: await dockY(messages),
      }),
    });
    await storyboard.write(testInfo);
    const trace = storyboard.frames.map(f => f.data as {dockY: number});
    // The dock only ever rises during the show, ending at the cover.
    for (let i = 1; i < trace.length; i += 1) {
      expect(trace[i].dockY).toBeLessThanOrEqual(trace[i - 1].dockY + 0.01);
    }
    expect(trace.at(-1)?.dockY).toBeCloseTo(-lift, 0);
  },
);

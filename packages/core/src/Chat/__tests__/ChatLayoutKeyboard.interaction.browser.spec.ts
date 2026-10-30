// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatLayoutKeyboard.interaction.browser.spec.ts
 * @input The built "Full AI Chat" ChatLayout story, a stand-in visual
 *   viewport that reports a software keyboard, real touch input and the
 *   interaction harness
 * @output Interaction and animation proofs for ChatLayout's keyboard
 *   behavior: the dock rides the keyboard on `keyboard.spring` (sampled
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
import {cubicBezier} from '../../motion/bezier';
import {keyboard as ANDROID_KEYBOARD} from '../../motion/android/keyboard';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  curveOf,
  holdAnimations,
  type HeldAnimation,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  springStep,
  startScreencast,
  timeline,
  drag,
  touchDriver,
  touchStoryboard,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// UIKit's keyboard spring (motion/uikit keyboard.spring): mass 1,
// stiffness 555.0265, damping 47.118 — critically damped, response 2π/√k.
const KEYBOARD = {
  response: (2 * Math.PI) / Math.sqrt(555.0265),
  dampingFraction: 47.118 / (2 * Math.sqrt(555.0265)),
};
// The cover Mobile Safari reports on an iPhone 17 Pro (keyboard, accessory
// bar and the floating address bar over a 714 px layout viewport).
const COVER = 337;
// How long after the focus UIKit starts the keyboard
// (motion/uikit/keyboard.ts focusToShowMs).
const FOCUS_TO_SHOW_MS = 187;

/**
 * In the page: focuses the composer text, blocks the main thread for
 * `blockMs` from 40 ms after the focus, then reports the keyboard as Mobile
 * Safari does once the block ends (late), and reads the dock's presented
 * position on each of the next `count` frames.
 */
async function blockThenReport(
  editable: Locator,
  blockMs: number,
  count = 24,
): Promise<{focusAt: number; reportAt: number; frames: [number, number][]}> {
  return editable.evaluate(
    async (el, [cover, block, n]) => {
      let dock: HTMLElement | null = el as HTMLElement;
      while (dock != null && getComputedStyle(dock).position !== 'sticky') {
        dock = dock.parentElement;
      }
      // The presented position: translate less the layout's bottom offset.
      const read = () => {
        const style = getComputedStyle(dock as HTMLElement);
        const value = style.translate;
        const translate =
          value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0');
        return translate - (parseFloat(style.bottom) || 0);
      };
      let focusAt = 0;
      el.addEventListener(
        'focus',
        event => {
          focusAt = event.timeStamp;
        },
        {once: true},
      );
      (el as HTMLElement).focus({preventScroll: true});
      await new Promise(resolve => setTimeout(resolve, 40));
      const until = performance.now() + block;
      while (performance.now() < until) {
        // The page's main thread is busy.
      }
      (window as unknown as {__keyboard: (c: number) => void}).__keyboard(
        cover,
      );
      const reportAt = performance.now();
      const frames: [number, number][] = [];
      await new Promise<void>(resolve => {
        const tick = (time: number) => {
          frames.push([time, read()]);
          if (frames.length < n) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });
      return {focusAt, reportAt, frames};
    },
    [COVER, blockMs, count] as const,
  );
}

/**
 * Replaces `window.visualViewport` before the page loads with one the test
 * drives: `__keyboard(cover)` shrinks it from the bottom and fires one
 * `resize`, as Mobile Safari does.
 */
async function installKeyboard(page: Page) {
  await page.addInitScript(() => {
    // Mobile Safari has no keyboard geometry API: where one exists (Chrome's
    // navigator.virtualKeyboard), the keyboard module measures nothing
    // (spec:AST-099 FR6).
    Reflect.deleteProperty(Navigator.prototype, 'virtualKeyboard');
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

/**
 * Chrome on Android: the same visual viewport the test drives (headless
 * browsers have no keyboard), and a VirtualKeyboard object the guide must
 * leave alone, so the guide reads Chrome's profile. Run it under a finger,
 * as Chrome on Android runs: the composer's focus routes are the touch ones
 * there (the keyboard module measures under any pointer).
 */
async function installAndroidKeyboard(page: Page) {
  await page.addInitScript(() => {
    const keyboard = Object.assign(new EventTarget(), {
      overlaysContent: false,
      boundingRect: new DOMRect(0, 0, 0, 0),
    });
    Object.defineProperty(navigator, 'virtualKeyboard', {
      configurable: true,
      value: keyboard,
    });
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

async function openChat(
  page: Page,
  {
    android = false,
    args,
  }: {android?: boolean; args?: Readonly<Record<string, string>>} = {},
): Promise<Chat> {
  if (android) {
    await installAndroidKeyboard(page);
  } else {
    await installKeyboard(page);
  }
  await openStory(page, storybook(), 'core-chatlayout--full-ai-chat', args);
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

// Where the dock is drawn relative to its rest without a keyboard, CSS px
// (negative is up): its presented vertical `translate` (the animator moves
// the individual property, not `transform`), less the `bottom` offset the
// layout gives it from the keyboard height (spec:AST-099 FR3).
const dockY = async (dock: Locator) => dock.evaluate(presentedY);

// How far above the bottom of the transcript's scrollport the dock is drawn:
// 0 at rest with no keyboard. A sticky dock leaves the bottom when the
// content ends inside the scrollport, which a translate or a deferred scroll
// clamp can cause, and its styles alone would not show it.
const dockGap = async (dock: Locator) =>
  dock.evaluate(
    el =>
      (el.parentElement as HTMLElement).getBoundingClientRect().bottom -
      el.getBoundingClientRect().bottom,
  );

function presentedY(el: Element): number {
  const style = getComputedStyle(el);
  const translate =
    style.translate === 'none'
      ? 0
      : parseFloat(style.translate.split(' ')[1] ?? '0') || 0;
  const bottom =
    style.position === 'sticky' || style.position === 'fixed'
      ? parseFloat(style.bottom) || 0
      : 0;
  return translate - bottom;
}

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

test('one keyboard change reads the layout once, however many read the height (architecture:react-component-runtime INV11)', async ({
  page,
}) => {
  const {dock, editable} = await openChat(page);
  await editable.focus();
  const reads = await page.evaluate(async cover => {
    // Count every read of the visual viewport's height from here on: the
    // keyboard module's one measurement per report.
    const viewport = window.visualViewport as unknown as {height: number};
    let height = viewport.height;
    let count = 0;
    Object.defineProperty(viewport, 'height', {
      configurable: true,
      get: () => {
        count += 1;
        return height;
      },
      set: (value: number) => {
        height = value;
      },
    });
    (window as unknown as {__keyboard: (c: number) => void}).__keyboard(cover);
    // The guide, the hook and the ride's commit all run by the next frame.
    await new Promise(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    return count;
  }, COVER);
  await waitForRest(dock);
  expect(reads).toBe(1);
});

test('the lift is the part of the keyboard over the dock\u2019s resting bottom: a root ending below the viewport rises by more than the cover', async ({
  page,
}) => {
  const {dock, editable} = await openChat(page);
  // A root that ends below the layout viewport: the viewport's full height
  // under the preview's 16 px gutter.
  await dock.evaluate(el => {
    const root = el.parentElement as HTMLElement;
    (root.parentElement as HTMLElement).style.height = '100vh';
  });
  await page.waitForTimeout(200);
  const lift = await dock.evaluate(
    (el, cover) =>
      (el.parentElement as HTMLElement).getBoundingClientRect().bottom -
      (window.innerHeight - cover),
    COVER,
  );
  expect(lift).toBeGreaterThan(COVER);
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  await page.waitForTimeout(100);
  const dockBottom = await dock.evaluate(
    el => el.getBoundingClientRect().bottom,
  );
  const keyboardTop = await page.evaluate(c => window.innerHeight - c, COVER);
  expect(dockBottom).toBeCloseTo(keyboardTop, 0);
});

test('a page with room under the chat: the dock rises only by the part of the keyboard that reaches it, and not at all when none does', async ({
  page,
}) => {
  const {dock, editable} = await openChat(page);
  // Leave 200 px of page under the chat's root.
  const room = 200;
  await dock.evaluate((el, r) => {
    const root = el.parentElement as HTMLElement;
    (root.parentElement as HTMLElement).style.height = `calc(100vh - ${r}px)`;
  }, room);
  await page.waitForTimeout(200);
  const restingBottom = await dock.evaluate(
    el => (el.parentElement as HTMLElement).getBoundingClientRect().bottom,
  );
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  await page.waitForTimeout(100);
  const expected = await page.evaluate(
    ([c, b]) => Math.max(0, b - (window.innerHeight - c)),
    [COVER, restingBottom],
  );
  expect(expected).toBeGreaterThan(0);
  expect(expected).toBeLessThan(COVER);
  expect(await dockY(dock)).toBeCloseTo(-expected, 0);
  expect(
    await dock.evaluate(el => el.getBoundingClientRect().bottom),
  ).toBeCloseTo(await page.evaluate(c => window.innerHeight - c, COVER), 0);

  // A keyboard that stops short of the chat's bottom moves nothing.
  const short = Math.floor(
    await page.evaluate(b => window.innerHeight - b - 20, restingBottom),
  );
  await showKeyboard(page, short);
  await waitForRest(dock);
  await page.waitForTimeout(100);
  expect(await dockY(dock)).toBeCloseTo(0, 0);
});

test('in a vertical writing mode the lift stays on the physical bottom, where the keyboard is', async ({
  page,
}) => {
  const {dock, editable, lift} = await openChat(page);
  // A logical inset-block-end would map to left under vertical-rl; the
  // on-screen keyboard is still at the bottom of the screen.
  await dock.evaluate(el => {
    (el.parentElement as HTMLElement).style.writingMode = 'vertical-rl';
  });
  await editable.focus();
  await showKeyboard(page);
  await page.waitForTimeout(1200);
  const style = await dock.evaluate(el => {
    const computed = getComputedStyle(el);
    return {
      bottom: computed.bottom,
      left: computed.left,
      right: computed.right,
    };
  });
  expect(parseFloat(style.bottom)).toBeCloseTo(lift, 0);
  expect(style.left).toBe('auto');
  expect(style.right).toBe('auto');
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

test.describe('under a mouse', () => {
  // A desktop browser: the primary pointer is fine (the projects emulate a
  // phone).
  test.use({hasTouch: false, isMobile: false});

  test('a click in the dock beside the composer does not focus the composer group (spec:AST-017 FR59)', async ({
    page,
  }) => {
    const {dock, editable} = await openChat(page);
    await editable.click();
    // The composer region: the dock's last box, a plain container under a
    // mouse.
    const region = dock.locator(':scope > div').last();
    await expect(
      page.getByRole('group', {name: 'Message composer'}),
    ).toHaveCount(0);
    const outer = await region.boundingBox();
    const inner = await region.locator(':scope > div').boundingBox();
    if (outer == null || inner == null) {
      throw new Error('the composer region is not laid out');
    }
    // The region's own gutter, beside the composer.
    const gutter = inner.x - outer.x;
    expect(gutter).toBeGreaterThan(2);
    await page.mouse.click(outer.x + gutter / 2, inner.y + inner.height / 2);
    expect(
      await region.evaluate(element => element === document.activeElement),
    ).toBe(false);
  });
});

test.describe('a mouse or pen press on the transcript', () => {
  // A desktop browser: the primary pointer is fine (the projects emulate a
  // phone).
  test.use({hasTouch: false, isMobile: false});

  test('takes focus off the composer at the press, so the keyboard leaves before any drag reaches the composer (spec:AST-094 FR43)', async ({
    page,
  }) => {
    const chat = await openChat(page);
    const rows = await keyboardUp(page, chat);
    await page.mouse.move(rows.x, 120);
    await page.mouse.down();
    // The browser's own press moves focus off the composer: the keyboard's
    // hide starts here, with or without the drag's dismissal.
    await expect(chat.editable).not.toBeFocused();
    await page.mouse.move(rows.x, rows.inComposer, {steps: 12});
    await page.mouse.up();
    await expect(chat.editable).not.toBeFocused();
    await expect(
      page.getByRole('group', {name: 'Message composer'}),
    ).toHaveCount(0);
  });

  test('a pen press reported as a pointer does the same', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'pen input is dispatched through the Chrome DevTools Protocol',
    );
    const chat = await openChat(page);
    const rows = await keyboardUp(page, chat);
    await page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as {__pointerTypes: string[]}).__pointerTypes = seen;
      window.addEventListener(
        'pointerdown',
        event => seen.push(event.pointerType),
        true,
      );
    });
    const client = await page.context().newCDPSession(page);
    const pen = async (
      type: 'mousePressed' | 'mouseMoved' | 'mouseReleased',
      y: number,
    ) =>
      client.send('Input.dispatchMouseEvent', {
        type,
        x: rows.x,
        y,
        button: 'left',
        buttons: type === 'mouseReleased' ? 0 : 1,
        clickCount: 1,
        pointerType: 'pen',
      });
    await pen('mousePressed', 120);
    expect(
      await page.evaluate(
        () => (window as unknown as {__pointerTypes: string[]}).__pointerTypes,
      ),
    ).toEqual(['pen']);
    await expect(chat.editable).not.toBeFocused();
    for (let step = 1; step <= 12; step += 1) {
      await pen('mouseMoved', 120 + ((rows.inComposer - 120) * step) / 12);
    }
    await pen('mouseReleased', rows.inComposer);
    await expect(chat.editable).not.toBeFocused();
  });
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
  await page.waitForTimeout(100);
  expect(await dockY(dock)).toBeCloseTo(0, 0);
  // Drawn at the bottom, not where the transcript ends.
  expect(await dockGap(dock)).toBeCloseTo(0, 0);
});

test('a hide the home-screen app reports early: the dock rests at the bottom once the layout takes over', async ({
  page,
}) => {
  const {dock, editable} = await openChat(page);
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  await page.waitForTimeout(300);
  await editable.evaluate(async el => {
    (el as HTMLElement).blur();
    await new Promise(resolve => setTimeout(resolve, 30));
    (window as unknown as {__keyboard: (c: number) => void}).__keyboard(0);
  });
  await page.waitForTimeout(1200);
  expect(await dockY(dock)).toBeCloseTo(0, 0);
  expect(await dockGap(dock)).toBeCloseTo(0, 0);
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

test('Reduce Motion: the dock never travels, it cross-fades to the keyboard (design:reduced-motion)', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {dock, lift} = await openChat(page);
  await showKeyboard(page);
  // Every frame of the change: the dock is where it was or where it lands,
  // never in between (DR1); only its opacity animates (DR2).
  const frames = await dock.evaluate(
    async el =>
      new Promise<{y: number; opacity: number}[]>(resolve => {
        const out: {y: number; opacity: number}[] = [];
        const step = () => {
          const style = getComputedStyle(el);
          const translate =
            style.translate === 'none'
              ? 0
              : Number(style.translate.split(' ')[1]?.replace('px', '') ?? 0);
          out.push({
            // The presented position: translate less the layout's offset.
            y: translate - (parseFloat(style.bottom) || 0),
            opacity: Number(style.opacity),
          });
          if (out.length < 60) {
            requestAnimationFrame(step);
          } else {
            resolve(out);
          }
        };
        requestAnimationFrame(step);
      }),
  );
  for (const {y} of frames) {
    expect(
      Math.abs(y) < 0.5 || Math.abs(y + lift) < 0.5,
      JSON.stringify(frames.map(f => Math.round(f.y))),
    ).toBe(true);
  }
  await waitForRest(dock);
  expect(await dockY(dock)).toBeCloseTo(-lift, 0);
});

test('focus returning mid-hide turns the dock back up without a jump', async ({
  page,
}) => {
  const {dock, editable, lift} = await openChat(page);
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  // In the page, so no round trip sits between the steps: blur, let the
  // hide run 150 ms, focus again, and read the dock's presented position on
  // every frame throughout.
  const ys = await editable.evaluate(async el => {
    let dock: HTMLElement | null = el as HTMLElement;
    while (dock != null && getComputedStyle(dock).position !== 'sticky') {
      dock = dock.parentElement;
    }
    // The presented position: translate less the layout's bottom offset.
    const read = () => {
      const style = getComputedStyle(dock as HTMLElement);
      const value = style.translate;
      const translate =
        value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0');
      return translate - (parseFloat(style.bottom) || 0);
    };
    const out: [number, number][] = [];
    const until = performance.now() + 900;
    const sample = (time: number) => {
      out.push([time, read()]);
      if (performance.now() < until) {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
    (el as HTMLElement).blur();
    await new Promise(resolve => setTimeout(resolve, 150));
    (el as HTMLElement).focus();
    await new Promise(resolve => setTimeout(resolve, 800));
    return out;
  });
  // It went down, came back to the keyboard, and never jumped: nothing
  // moved faster than the hide's own fastest frame (about 51 px in 16.7 ms),
  // judged per elapsed time, so a frame the browser drops is no jump.
  const FASTEST = 80 / (1000 / 60);
  expect(Math.max(...ys.map(([, y]) => y))).toBeGreaterThan(-lift + 5);
  for (let i = 1; i < ys.length; i += 1) {
    const [t0, y0] = ys[i - 1];
    const [t1, y1] = ys[i];
    expect(
      Math.abs(y1 - y0),
      JSON.stringify(ys.map(([t, y]) => [Math.round(t), Math.round(y)])),
    ).toBeLessThan(FASTEST * Math.max(1000 / 60, t1 - t0));
  }
  expect(ys.at(-1)?.[1]).toBeCloseTo(-lift, 0);
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

test('a 600 ms block 40 ms after the focus: the first frame after it shows the dock where the keyboard is', async ({
  page,
}) => {
  const {editable, lift} = await openChat(page);
  const {focusAt, reportAt, frames} = await blockThenReport(editable, 600);
  // UIKit started the keyboard FOCUS_TO_SHOW_MS after the focus; by the
  // first frame after the report its spring is over, so the dock is there
  // at once rather than starting its rise half a second late. (A frame the
  // browser began during the block carries that earlier time.)
  const after = frames.filter(([time]) => time >= reportAt);
  expect(after.length).toBeGreaterThan(10);
  expect(after[0][0] - (focusAt + FOCUS_TO_SHOW_MS)).toBeGreaterThan(400);
  for (const [, y] of after) {
    expect(y).toBeCloseTo(-lift, 0);
  }
});

test('a block that ends mid-rise: the dock joins the keyboard spring where it is and follows it', async ({
  page,
}) => {
  const {editable, lift} = await openChat(page);
  const {focusAt, reportAt, frames} = await blockThenReport(editable, 240);
  const start = focusAt + FOCUS_TO_SHOW_MS;
  const expected = (time: number) => -lift * springStep(KEYBOARD, time - start);
  // The first frame after the report is part-way up the spring, not at rest;
  // every frame shows the dock where the spring is at that frame's time.
  const first = frames.find(([time]) => time >= reportAt);
  expect(first?.[1]).toBeLessThan(-lift / 3);
  for (const [time, y] of frames) {
    expect(
      Math.abs(y - expected(time)),
      JSON.stringify({t: time - start, y, expected: expected(time)}),
    ).toBeLessThan(2);
  }
});

/** Focuses the composer under a shown keyboard and returns two finger rows. */
async function keyboardUp(page: Page, {dock, editable}: Chat) {
  await editable.focus();
  await showKeyboard(page);
  await waitForRest(dock);
  const dockBox = await dock.boundingBox();
  const textBox = await editable.boundingBox();
  if (dockBox == null || textBox == null) {
    throw new Error('no dock');
  }
  return {
    x: textBox.x + textBox.width / 2,
    // Above everything the dock holds, and inside the composer's text.
    aboveDock: dockBox.y - 40,
    inComposer: textBox.y + 4,
  };
}

const transcriptScroll = async (dock: Locator) =>
  dock.evaluate(el => (el.parentElement as HTMLElement).scrollTop);

test('a drag that stays above the composer scrolls and keeps the keyboard', async ({
  page,
}) => {
  const chat = await openChat(page);
  const rows = await keyboardUp(page, chat);
  const driver = await touchDriver(page);
  const before = await transcriptScroll(chat.dock);
  await driver.play(
    drag(
      {x: rows.x, y: 120},
      {x: rows.x, y: rows.aboveDock},
      {durationMs: 300},
    ),
  );
  await expect(chat.editable).toBeFocused();
  if (driver.drivesNativeGestures) {
    expect(await transcriptScroll(chat.dock)).toBeLessThan(before);
  }
});

test('a drag that reaches the composer dismisses the keyboard and the dock rides down', async ({
  page,
}) => {
  const chat = await openChat(page);
  const rows = await keyboardUp(page, chat);
  const driver = await touchDriver(page);
  await driver.play(
    drag(
      {x: rows.x, y: 120},
      {x: rows.x, y: rows.inComposer},
      {durationMs: 300},
    ),
  );
  await expect(chat.editable).not.toBeFocused();
  // The dismissal only blurs the composer (FR10): focus moves nowhere else,
  // not to the composer group the keyboard's Done parks it on.
  await expect(
    page.getByRole('group', {name: 'Message composer'}),
  ).not.toBeFocused();
  await waitForAnimation(chat.dock);
});

test.describe('a finger where the primary pointer is fine, as on a touch-screen laptop', () => {
  test.use({hasTouch: true, isMobile: false});
  test.beforeEach(async ({page}) => {
    // The primary pointer reads fine while touch input is present.
    await page.addInitScript(() => {
      const matchMedia = window.matchMedia.bind(window);
      window.matchMedia = query =>
        /\(pointer:\s*coarse\)/.test(query)
          ? matchMedia('(min-width: 100000px)')
          : /\(pointer:\s*fine\)/.test(query)
            ? matchMedia('(min-width: 0px)')
            : matchMedia(query);
    });
  });

  test('a drag that reaches the composer dismisses the keyboard (spec:AST-094 FR19, FR43)', async ({
    page,
  }) => {
    const chat = await openChat(page);
    expect(
      await page.evaluate(() => window.matchMedia('(pointer: fine)').matches),
    ).toBe(true);
    const rows = await keyboardUp(page, chat);
    const driver = await touchDriver(page);
    await driver.play(
      drag(
        {x: rows.x, y: 120},
        {x: rows.x, y: rows.inComposer},
        {durationMs: 300},
      ),
    );
    await expect(chat.editable).not.toBeFocused();
  });
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
  const trace = await traceRendering(
    page,
    async () => {
      rise = await page.evaluate(async cover => {
        const from = performance.timeOrigin + performance.now();
        (window as unknown as {__keyboard: (c: number) => void}).__keyboard(
          cover,
        );
        await new Promise(resolve => setTimeout(resolve, 450));
        return {from, to: performance.timeOrigin + performance.now()};
      }, COVER);
    },
    {invalidations: true},
  );
  // The steady part of the rise, 150–400 ms after the report. Its start lays
  // out and paints a few times (the end padding, the scroll to the newest message,
  // the scroll's handlers), within 75 ms of the report at a 6x CPU slowdown;
  // its end (about 480 ms) hands the layers back, which lays out once. A
  // window that followed the late timer under load would take that in. On a
  // loaded machine Chrome may also deliver the dock's and the messages'
  // compositor start times late and make one pass for them by itself (no
  // script, every recalculation for `Animation` on those composited
  // elements): that pass is Chrome's, not the rise's, and is left out.
  const during = countBetween(trace, rise.from + 150, rise.from + 400, {
    skipCompositorAnimationUpdates: true,
  });
  // On failure, every rendering event of the rise and the long tasks, in ms
  // after the report.
  const detail = JSON.stringify({
    during,
    events: trace.events
      .filter(e => e.t >= rise.from - 20 && e.t <= rise.from + 500)
      .map(e => `${e.name}@${Math.round(e.t - rise.from)}`),
    longTasks: trace.longTasks.map(
      task =>
        `${Math.round(task.start - rise.from)}+${Math.round(task.durationMs)}`,
    ),
    recalcs: (trace.styleInvalidations ?? [])
      .filter(inv => inv.t >= rise.from - 20 && inv.t <= rise.from + 500)
      .map(
        inv => `${inv.reason}#${inv.nodeId}@${Math.round(inv.t - rise.from)}`,
      ),
    scripts: (trace.scripts ?? [])
      .filter(t => t >= rise.from + 100 && t <= rise.from + 450)
      .map(t => Math.round(t - rise.from)),
  });
  expect(during.Layout ?? 0, detail).toBe(0);
  expect(during.Paint ?? 0, detail).toBe(0);
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

test.describe('under a finger', () => {
  test.use({hasTouch: true, isMobile: true});

  test('Reduce Motion: the dock cross-fades down on a hide and rests where the layout puts it (design:reduced-motion)', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {dock, editable, lift} = await openChat(page);
    await editable.focus();
    // The home-screen app reports the show in two steps, 33 ms apart (the
    // keyboard, then its bar settling).
    await page.evaluate(async cover => {
      const keyboard = (window as unknown as {__keyboard: (c: number) => void})
        .__keyboard;
      keyboard(cover + 17);
      await new Promise(resolve => setTimeout(resolve, 33));
      keyboard(cover);
    }, COVER);
    await page.waitForTimeout(800);
    expect(await dockY(dock)).toBeCloseTo(-lift, 0);
    // In the page, so the frames are read without a round trip: blur (the
    // predicted hide), report the keyboard gone the way the home-screen app
    // does, 30 ms later, and read every frame.
    const {ys, faded} = await editable.evaluate(async el => {
      let host: HTMLElement | null = el as HTMLElement;
      while (host != null && getComputedStyle(host).position !== 'sticky') {
        host = host.parentElement;
      }
      const read = () => {
        const style = getComputedStyle(host as HTMLElement);
        const value = style.translate;
        const translate =
          value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0');
        return translate - (parseFloat(style.bottom) || 0);
      };
      const out: number[] = [];
      // When the dock was less than fully opaque: the fade's span.
      const faded: number[] = [];
      const until = performance.now() + 900;
      const sample = (now: number) => {
        out.push(read());
        if (parseFloat(getComputedStyle(host as HTMLElement).opacity) < 0.999) {
          faded.push(now);
        }
        if (performance.now() < until) {
          requestAnimationFrame(sample);
        }
      };
      requestAnimationFrame(sample);
      (el as HTMLElement).blur();
      await new Promise(resolve => setTimeout(resolve, 30));
      (window as unknown as {__keyboard: (c: number) => void}).__keyboard(0);
      await new Promise(resolve => setTimeout(resolve, 900));
      return {ys: out, faded};
    });
    for (const y of ys) {
      expect(
        Math.abs(y) < 0.5 || Math.abs(y + lift) < 0.5,
        JSON.stringify(ys.map(Math.round)),
      ).toBe(true);
    }
    expect(ys.at(-1)).toBeCloseTo(0, 0);
    expect(await dockGap(dock)).toBeCloseTo(0, 0);
    // An opacity-only fade of at most 200 ms (DR2), give or take a frame
    // either side.
    expect(faded.length).toBeGreaterThan(0);
    expect((faded.at(-1) ?? 0) - (faded[0] ?? 0)).toBeLessThanOrEqual(200 + 34);
    // The fade ends shown: the dock and the transcript are fully opaque.
    const opacities = await dock.evaluate(el => {
      const read = (node: Element) => getComputedStyle(node).opacity;
      const transcript = (el.parentElement as HTMLElement).firstElementChild;
      return [read(el), transcript == null ? '1' : read(transcript)];
    });
    expect(opacities).toEqual(['1', '1']);
  });

  test('the browser\u2019s own reveal pan is put back: the composer rests on the keyboard and the page does not move (spec:AST-099 FR4)', async ({
    page,
  }) => {
    const {dock, editable} = await openChat(page);
    await editable.focus();
    await showKeyboard(page);
    await page.waitForTimeout(150);
    const result = await page.evaluate(async cover => {
      const viewport = window.visualViewport as unknown as EventTarget & {
        offsetTop: number;
      };
      // The browser's side of a put-back: scrolling a fixed element's top
      // into view pans the visual viewport to it.
      let putBacks = 0;
      const original = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (
        this: Element,
        ...args: Parameters<Element['scrollIntoView']>
      ) {
        if (getComputedStyle(this).position === 'fixed') {
          putBacks += 1;
          viewport.offsetTop = Math.max(0, this.getBoundingClientRect().top);
        }
        original.apply(this, args);
      };
      // As Chrome 124 does while the composer is still riding up: it pans
      // the visual viewport to the composer by the keyboard's height.
      viewport.offsetTop = cover;
      viewport.dispatchEvent(new Event('scroll'));
      await new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      Element.prototype.scrollIntoView = original;
      return {putBacks, offsetTop: viewport.offsetTop};
    }, COVER);
    await waitForRest(dock);
    expect(result.putBacks).toBeGreaterThan(0);
    expect(result.offsetTop).toBe(0);
  });
});

// The dock's ride among what a hold takes on the dock (a CSS transition that
// starts at the blur comes too): the one script animation that moves
// `translate`. Its samples count from its own start, `offsetMs` after the
// held origin (the earliest start the hold took).
function rideOf(held: ReadonlyArray<HeldAnimation>): HeldAnimation {
  const ride = held.find(
    a => a.kind === 'Animation' && a.keyframes.some(k => 'translate' in k),
  );
  if (ride == null) {
    throw new Error(`no ride among ${JSON.stringify(held)}`);
  }
  return ride;
}

test.describe('Chrome on Android (spec:AST-099 FR8)', () => {
  test.use({hasTouch: true, isMobile: true});
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'Chrome’s keyboard profile needs the VirtualKeyboard API',
  );

  const reportAt = async (page: Page, cover: number) =>
    page.evaluate(c => {
      let at = 0;
      const view = window.visualViewport as unknown as EventTarget;
      view.addEventListener(
        'resize',
        event => {
          at = event.timeStamp;
        },
        {once: true},
      );
      (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c);
      return at;
    }, cover);

  test('the dock rides up on Gboard’s slide from the report, dated back to Gboard’s start', async ({
    page,
  }) => {
    const {dock, editable, lift} = await openChat(page, {android: true});
    await editable.focus();
    const reported = await reportAt(page, COVER);
    await waitForAnimation(dock);
    const start = await dock.evaluate(el =>
      Math.max(
        ...el.getAnimations().map(a => Number(a.startTime ?? -Infinity)),
      ),
    );
    expect(
      Math.abs(start - (reported - ANDROID_KEYBOARD.showReportLagMs)),
    ).toBeLessThan(2);
    const ride = rideOf(await holdAnimations(page, dock));
    const samples = curveOf(
      await sampleCurve(dock, timeline(ride.offsetMs + ride.curveEndMs)),
      'translateY',
    );
    await releaseAnimations(page);
    const ease = cubicBezier(ANDROID_KEYBOARD.showCurve);
    const result = compareCurve(
      samples,
      t =>
        -lift *
        ease(
          Math.min(
            1,
            Math.max(0, (t - ride.offsetMs) / ANDROID_KEYBOARD.showMs),
          ),
        ),
      0.5,
    );
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      0.5,
    );
    // And the layout takes the lift once the ride ends.
    await waitForRest(dock);
    await page.waitForTimeout(100);
    expect(await dockY(dock)).toBeCloseTo(-lift, 0);
    expect(
      await page.evaluate(
        () =>
          (
            navigator as unknown as {
              virtualKeyboard: {overlaysContent: boolean};
            }
          ).virtualKeyboard.overlaysContent,
      ),
    ).toBe(false);
  });

  test('the dock rides down on Gboard’s slide from the blur', async ({
    page,
  }) => {
    const {dock, editable} = await openChat(page, {android: true});
    await editable.focus();
    await reportAt(page, COVER);
    await waitForRest(dock);
    await page.waitForTimeout(100);
    const lifted = -(await dockY(dock));
    const blurAt = await editable.evaluate(el => {
      let at = 0;
      el.addEventListener(
        'focusout',
        event => {
          at = event.timeStamp;
        },
        {once: true},
      );
      (el as HTMLElement).blur();
      return at;
    });
    await waitForAnimation(dock);
    const start = await dock.evaluate(el =>
      Math.max(
        ...el.getAnimations().map(a => Number(a.startTime ?? -Infinity)),
      ),
    );
    expect(
      Math.abs(start - (blurAt + ANDROID_KEYBOARD.hideAfterBlurMs)),
    ).toBeLessThan(8);
    const ride = rideOf(await holdAnimations(page, dock));
    const samples = curveOf(
      await sampleCurve(dock, timeline(ride.offsetMs + ride.curveEndMs)),
      'translateY',
    );
    await releaseAnimations(page);
    // The layout still holds the lift; the translate takes the dock down.
    const ease = cubicBezier(ANDROID_KEYBOARD.hideCurve);
    const result = compareCurve(
      samples,
      t =>
        lifted *
        ease(
          Math.min(
            1,
            Math.max(0, (t - ride.offsetMs) / ANDROID_KEYBOARD.hideMs),
          ),
        ),
      0.5,
    );
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      0.5,
    );
    expect(ride.curveEndMs).toBeCloseTo(ANDROID_KEYBOARD.hideMs, -1);
  });

  test('Reduce Motion: the dock never travels with Gboard (design:reduced-motion)', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {dock, editable, lift} = await openChat(page, {android: true});
    await editable.focus();
    const ys = await editable.evaluate(async (el, cover) => {
      let host: HTMLElement | null = el as HTMLElement;
      while (host != null && getComputedStyle(host).position !== 'sticky') {
        host = host.parentElement;
      }
      const read = () => {
        const style = getComputedStyle(host as HTMLElement);
        const value = style.translate;
        const translate =
          value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0');
        return translate - (parseFloat(style.bottom) || 0);
      };
      const out: number[] = [];
      const until = performance.now() + 900;
      const sample = () => {
        out.push(read());
        if (performance.now() < until) {
          requestAnimationFrame(sample);
        }
      };
      requestAnimationFrame(sample);
      (window as unknown as {__keyboard: (c: number) => void}).__keyboard(
        cover,
      );
      await new Promise(resolve => setTimeout(resolve, 900));
      return out;
    }, COVER);
    for (const y of ys) {
      expect(
        Math.abs(y) < 0.5 || Math.abs(y + lift) < 0.5,
        JSON.stringify(ys.map(Math.round)),
      ).toBe(true);
    }
    expect(ys.at(-1)).toBeCloseTo(-lift, 0);
    expect(await dock.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  });
});

test(
  'storyboard: a drag down the conversation reaches the composer and the keyboard leaves',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const chat = await openChat(page);
    const rows = await keyboardUp(page, chat);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    // The finger, drawn for the film only (it never takes a touch).
    await page.evaluate(() => {
      const dot = document.createElement('div');
      dot.style.cssText =
        'position:fixed;left:-100px;top:-100px;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:rgba(255,40,40,.3);border:2px solid rgba(255,40,40,.9);pointer-events:none;z-index:2147483647';
      document.body.append(dot);
      const follow = (event: TouchEvent) => {
        const touch = event.touches[0];
        dot.style.left = touch == null ? '-100px' : `${touch.clientX}px`;
        dot.style.top = touch == null ? '-100px' : `${touch.clientY}px`;
      };
      for (const type of ['touchstart', 'touchmove', 'touchend']) {
        window.addEventListener(type, follow as EventListener, {
          capture: true,
          passive: true,
        });
      }
      // As Mobile Safari does, report the keyboard down once it is down.
      window.addEventListener('focusout', () => {
        setTimeout(() => {
          (window as unknown as {__keyboard: (c: number) => void}).__keyboard(
            0,
          );
        }, 430);
      });
    });
    const focused = async () =>
      chat.editable.evaluate(el => el === document.activeElement);
    const driver = await touchDriver(page);
    // Down the conversation to just above the composer, then into it.
    const over = rows.inComposer - 64;
    const drag = await touchStoryboard(
      page,
      driver,
      [
        ...[0, 1, 2, 3].map(i => ({
          t: i * 40,
          fingers: [{id: 0, x: rows.x, y: 120 + ((over - 120) * i) / 3}],
        })),
        {t: 160, fingers: [{id: 0, x: rows.x, y: rows.inComposer}]},
        {t: 200, fingers: []},
      ],
      {
        name: 'chatlayout-keyboard-dismiss-drag',
        clip,
        columns: 4,
        cellScale: 0.4,
        measure: async () => ({
          focused: await focused(),
          dockY: await dockY(chat.dock),
        }),
      },
    );
    // The keyboard and the composer ride down from the blur.
    const {storyboard: ride} = await animationStoryboard(page, {
      name: 'chatlayout-keyboard-dismiss-ride',
      clip,
      scope: chat.dock,
      // From the hold's origin: the composer's own blur transition can start
      // before the ride, so the samples run past the ride's 383 ms.
      times: timeline(480, 480 / 12),
      columns: 6,
      cellScale: 0.4,
      measure: async () => ({dockY: await dockY(chat.dock)}),
    });
    await drag.write(testInfo);
    await ride.write(testInfo);
    const steps = drag.frames.map(f => f.data as {focused: boolean});
    // Focus holds while the finger is over the conversation and in the
    // composer, and the lift there blurs it: the drag decides once, at the
    // release (spec:AST-094 FR36).
    expect(steps.slice(0, 5).every(f => f.focused)).toBe(true);
    expect(steps.at(-1)?.focused).toBe(false);
    const trace = ride.frames.map(f => f.data as {dockY: number});
    expect(trace[0].dockY).toBeLessThan(-100);
    for (let i = 1; i < trace.length; i += 1) {
      expect(trace[i].dockY).toBeGreaterThanOrEqual(trace[i - 1].dockY - 0.01);
    }
    expect(trace.at(-1)?.dockY).toBeCloseTo(0, 0);
  },
);

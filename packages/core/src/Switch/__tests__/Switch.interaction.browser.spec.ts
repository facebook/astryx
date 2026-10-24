// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.interaction.browser.spec.ts
 * @input The built Switch stories, real touch input (Chromium CDP / WebKit's
 *   input command) and @astryxdesign/interaction-harness
 * @output Interaction and animation proofs of Switch's touch presentation
 *   against UISwitch on iOS 26.2, one named case per path (P1–P14): a press
 *   lifts the thumb into a glass lens and a release toggles; a drag flips
 *   26/63 of the track from where the finger landed and commits at the lift,
 *   back to the landing point commits nothing, shorter toggles like a tap; a
 *   vertical pan scrolls the page while a held switch keeps the touch; Reduce
 *   Motion keeps the lift and the springs; right to left mirrors the ends and
 *   the drag; a second tap mid-travel turns the thumb around where it is; a
 *   disabled or busy switch stays inert; the lift, travel and track-color
 *   curves match the UIKit springs when sampled; the motion keeps advancing
 *   through a blocked main thread and does no Layout or Paint; storyboards of
 *   a tap and of a drag.
 * @position The browser layer of Switch's touch tests; the pure model is
 *   switchTouch.test.ts. Runs on the phone profile (coarse pointer), where
 *   the touch presentation is the one rendered.
 *
 * SYNC: useSwitchTouch.ts, switchTouch.ts, motion/uikit/switch.ts.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  compareCurve,
  countBetween,
  drag,
  freezeTimers,
  holdAnimations,
  installTimerGate,
  markElement,
  openStory,
  releaseAnimations,
  springStep,
  startScreencast,
  tap,
  thawTimers,
  timeline,
  touchDriver,
  touchStoryboard,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type CastFrame,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {SWITCH_CLAIMS_HELD_TOUCH} from '../switchTouchClaim';

const storybook = withStorybook(test);

// UISwitch on iOS 26.2 (motion/uikit/switch.ts), restated here as the oracle.
const LIFT = {response: 0.23, dampingFraction: 0.55};
const TRAVEL = {response: 0.3, dampingFraction: 1};
const WELL_ON = {response: 0.68, dampingFraction: 1};
/** The md track is 40 × 24: thumb 37/63 of the width, 24/28 of the height. */
const TRACK = {width: 40, height: 24};
const THUMB_WIDTH = (TRACK.width * 37) / 63;
const INSET = (TRACK.height - (TRACK.height * 24) / 28) / 2;
const TRAVEL_PX = TRACK.width - THUMB_WIDTH - 2 * INSET;
const FLIP_DISTANCE = (TRACK.width * 26) / 63;
const LIFT_SCALE = {x: 58 / 37, y: 38.333 / 24};

interface OpenSwitch {
  driver: TouchDriver;
  input: Locator;
  thumb: Locator;
  onLayer: Locator;
  /** The thumb's center at rest, client px. */
  center: {x: number; y: number};
}

async function openSwitch(
  page: Page,
  storyId = 'core-switch--default',
  {direction = 'ltr'}: {direction?: 'ltr' | 'rtl'} = {},
): Promise<OpenSwitch> {
  if (direction === 'ltr') {
    await openStory(page, storybook(), storyId);
  } else {
    // Storybook's direction global wraps the story in `dir="rtl"` from its
    // first render, so the switch mounts right to left.
    await page.goto(
      `${storybook()}/iframe.html?id=${storyId}&viewMode=story&globals=direction:rtl`,
    );
    await page
      .locator('#storybook-root > *')
      .first()
      .waitFor({state: 'attached'});
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
  }
  const driver = await touchDriver(page);
  const root = page.locator('#storybook-root');
  const input = root.getByRole('switch').first();
  const thumb = root.locator('.astryx-switch-thumb').first().locator('..');
  const onLayer = root.locator('.astryx-switch > span').first();
  const box = await thumb.boundingBox();
  if (box == null) {
    throw new Error('no thumb');
  }
  return {
    driver,
    input,
    thumb,
    onLayer,
    center: {x: box.x + box.width / 2, y: box.y + box.height / 2},
  };
}

interface Presented {
  scaleX: number;
  scaleY: number;
  on: number;
  fill: number;
}

/** The thumb's lift and the track's color, as presented. */
async function presented(page: Page): Promise<Presented> {
  return page.evaluate(() => {
    const thumb = document.querySelector<HTMLElement>(
      '#storybook-root .astryx-switch-thumb',
    )!;
    const on = document.querySelector<HTMLElement>(
      '#storybook-root .astryx-switch > span',
    )!;
    const scale = getComputedStyle(thumb.parentElement!).scale;
    const [sx, sy = sx] = (scale === 'none' ? '1' : scale)
      .split(' ')
      .map(Number);
    return {
      scaleX: sx,
      scaleY: sy,
      on: Number(getComputedStyle(on).opacity),
      fill: Number(getComputedStyle(thumb).opacity),
    };
  });
}

/**
 * The thumb's offset from the track's start edge, exact: its center (a scale
 * about the center does not move it) less half its unscaled width.
 */
async function thumbOffset(page: Page): Promise<number> {
  return page.evaluate(() => {
    const box = document.querySelector<HTMLElement>(
      '#storybook-root .astryx-switch-thumb',
    )!.parentElement!;
    const rect = box.getBoundingClientRect();
    const track = box.parentElement!.getBoundingClientRect();
    return (
      rect.left +
      rect.width / 2 -
      track.left -
      parseFloat(getComputedStyle(box).width) / 2
    );
  });
}

/**
 * The thumb's travel: the newest animation of its `translate`, from its start
 * to the end of its motion, epoch ms.
 */
async function travelAnimation(
  page: Page,
): Promise<{from: number; to: number}> {
  for (let attempt = 0; attempt < 500; attempt++) {
    const found = await page.evaluate(() => {
      const box = document.querySelector<HTMLElement>(
        '#storybook-root .astryx-switch-thumb',
      )!.parentElement!;
      const travel = box
        .getAnimations()
        .filter(
          a =>
            a.playState === 'running' &&
            (a.effect as KeyframeEffect)
              .getKeyframes()
              .some(k => 'translate' in k),
        )
        .at(-1);
      if (travel == null || travel.startTime == null) {
        return null;
      }
      const from = performance.timeOrigin + Number(travel.startTime);
      // The animator's keyframes end with a hold of the end state: the
      // motion ends at the last keyframe before it.
      const effect = travel.effect as KeyframeEffect;
      const offsets = effect
        .getKeyframes()
        .map(k => k.computedOffset)
        .filter(o => o < 1);
      return {
        from,
        to:
          from +
          Number(effect.getComputedTiming().activeDuration) *
            Math.max(...offsets),
      };
    });
    if (found != null) {
      return found;
    }
    await page.waitForTimeout(4);
  }
  throw new Error('the thumb never travelled');
}

test.describe('Switch touch presentation (UISwitch, iOS 26.2)', () => {
  test('P1 · a tap lifts the thumb into the lens, then toggles: it travels and the track turns on', async ({
    page,
  }) => {
    const {driver, input, thumb, center} = await openSwitch(page);
    await expect(input).not.toBeChecked();
    expect(await thumbOffset(page)).toBeCloseTo(INSET, 0);
    await driver.play(tap(center, {holdMs: 50}));
    await expect(input).toBeChecked();
    // Lifted right after the release (no sooner than the minimum lift).
    const lifted = await presented(page);
    expect(lifted.scaleX).toBeGreaterThan(1.2);
    await waitForRest(thumb);
    const rest = await presented(page);
    expect(rest.scaleX).toBeCloseTo(1, 2);
    expect(rest.on).toBeCloseTo(1, 2);
    expect(rest.fill).toBeCloseTo(1, 2);
    expect(await thumbOffset(page)).toBeCloseTo(INSET + TRAVEL_PX, 0);
  });

  test('P2 · a hold keeps the lens lifted, and the release toggles', async ({
    page,
  }) => {
    const {driver, input, center} = await openSwitch(page);
    const script = tap(center, {holdMs: 700});
    let held: Presented | null = null;
    await driver.play(script, {
      onEvent: async step => {
        if (step.type === 'touchStart') {
          await page.waitForTimeout(500);
          held = await presented(page);
        }
      },
    });
    expect(held).not.toBeNull();
    expect(held!.scaleX).toBeCloseTo(LIFT_SCALE.x, 1);
    expect(held!.scaleY).toBeCloseTo(LIFT_SCALE.y, 1);
    // The white fill gave way to the clear glass.
    expect(held!.fill).toBeLessThan(0.05);
    await expect(input).toBeChecked();
  });

  /**
   * The element under a held finger, read 300 ms into a 600 ms hold and
   * again after the lift: its role, how it selects text, and whether an
   * inline lock is on it.
   */
  interface HeldHit {
    role: string | null;
    userSelect: string;
    locked: boolean;
  }
  async function hitDuringHold(
    page: Page,
    driver: TouchDriver,
    at: {x: number; y: number},
  ): Promise<{during: HeldHit | null; after: HeldHit | null}> {
    const read = async () =>
      page.evaluate(({x, y}) => {
        const el = document.elementFromPoint(x, y) as HTMLElement | null;
        if (el == null) {
          return null;
        }
        const style = getComputedStyle(el);
        return {
          role: el.getAttribute('role'),
          userSelect:
            style.getPropertyValue('-webkit-user-select') || style.userSelect,
          locked:
            el.style.getPropertyValue('user-select') === 'none' ||
            el.style.getPropertyValue('-webkit-user-select') === 'none',
        };
      }, at);
    let during: HeldHit | null = null;
    await driver.play(tap(at, {holdMs: 600}), {
      onEvent: async step => {
        if (step.type === 'touchStart') {
          await page.waitForTimeout(300);
          during = await read();
        }
      },
    });
    // The lock lets go when the contact ends.
    await page.waitForTimeout(300);
    return {during, after: await read()};
  }

  test('P2 · while a finger holds the switch, the input under it selects no text, so a still hold opens no loupe', async ({
    page,
  }) => {
    // The finger lands on the switch's own input, and the engine's form
    // control styles give an input `-webkit-user-select: text` whatever its
    // ancestors say: iOS Safari then opened its text loupe 0.65 s into a still
    // hold (simulator, iOS 26.2). The gesture host locks a non-text input
    // under a held finger on a touch control, and lets go after the lift.
    const {driver, center} = await openSwitch(page);
    const held = await hitDuringHold(page, driver, center);
    expect(held.during?.role).toBe('switch');
    expect(held.during?.userSelect).toBe('none');
    expect(held.during?.locked).toBe(true);
    expect(held.after?.locked).toBe(false);
  });

  test('P3 · a drag flips once the finger is 26/63 of the track past where it landed, and the lift commits it', async ({
    page,
  }) => {
    const {driver, input, onLayer, center} = await openSwitch(page);
    const script = drag(
      center,
      {x: center.x + FLIP_DISTANCE + 6, y: center.y},
      {durationMs: 600, holdMs: 300, restMs: 200},
    );
    const onAt: {dx: number; on: number}[] = [];
    await driver.play(script, {
      onEvent: async step => {
        if (step.type === 'touchMove') {
          onAt.push({
            dx: step.fingers[0].x - center.x,
            on: Number(
              await onLayer.evaluate(el => getComputedStyle(el).opacity),
            ),
          });
        }
      },
    });
    // The track turned on during the drag, only after the flip distance.
    const before = onAt.filter(s => s.dx < FLIP_DISTANCE - 0.5);
    expect(before.every(s => s.on < 0.01)).toBe(true);
    expect(onAt.at(-1)!.on).toBeGreaterThan(0.1);
    await expect(input).toBeChecked();
  });

  test('P4 · a drag past the flip and back to where it landed commits nothing', async ({
    page,
  }) => {
    const {driver, input, thumb, center} = await openSwitch(page);
    const out = {x: center.x + FLIP_DISTANCE + 6, y: center.y};
    const script = [
      ...drag(center, out, {durationMs: 400, holdMs: 300}).slice(0, -1),
      ...drag(
        out,
        {x: center.x - 4, y: center.y},
        {durationMs: 400, restMs: 200},
      )
        .slice(1)
        .map(frame => ({...frame, t: frame.t + 700})),
    ];
    await driver.play(script);
    await waitForRest(thumb);
    await expect(input).not.toBeChecked();
    expect(await thumbOffset(page)).toBeCloseTo(INSET, 0);
  });

  test('P5 · a drag shorter than the flip distance toggles at the lift, like a tap', async ({
    page,
  }) => {
    const {driver, input, center} = await openSwitch(page);
    await driver.play(
      drag(
        center,
        {x: center.x + FLIP_DISTANCE - 4, y: center.y},
        {durationMs: 300, holdMs: 200, restMs: 150},
      ),
    );
    await expect(input).toBeChecked();
  });

  test('P6 · a quick swipe toward the side it is already on toggles it', async ({
    page,
  }) => {
    const {driver, input, center} = await openSwitch(page);
    await driver.play(
      drag(center, {x: center.x - 30, y: center.y}, {durationMs: 80}),
    );
    await expect(input).toBeChecked();
  });

  test('P7 · a vertical pan that starts on the switch scrolls the page and changes nothing', async ({
    page,
  }) => {
    const {driver, input, thumb, center} = await openSwitch(
      page,
      'core-switch--in-scrolling-list',
    );
    test.skip(
      !driver.drivesNativeGestures,
      'injected touches do not scroll natively in this engine (the iOS simulator rig covers it)',
    );
    await driver.play(
      drag(center, {x: center.x, y: center.y - 300}, {durationMs: 300}),
    );
    await waitForRest(thumb);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    // The first row starts on and stays on.
    await expect(input).toBeChecked();
    const rest = await presented(page);
    expect(rest.scaleX).toBeCloseTo(1, 2);
    expect(rest.on).toBeCloseTo(1, 2);
  });

  test('P8 · a held switch in a scrolling list keeps the touch: a held drag up toggles and never scrolls', async ({
    page,
  }) => {
    const {driver, input, thumb, center} = await openSwitch(
      page,
      'core-switch--in-scrolling-list',
    );
    test.skip(
      !driver.drivesNativeGestures,
      'injected touches do not scroll natively in this engine (the iOS simulator rig covers it)',
    );
    // Held 300 ms, then dragged up 200 px. UIKit (a switch in a table cell):
    // only the switch tracks, the table stays put and the lift toggles. The
    // passive variant (switchTouchClaim.ts) scrolls the page and the switch
    // yields instead.
    await driver.play(
      drag(
        center,
        {x: center.x, y: center.y - 200},
        {durationMs: 300, holdMs: 300},
      ),
    );
    await waitForRest(thumb);
    const scrollY = await page.evaluate(() => window.scrollY);
    if (SWITCH_CLAIMS_HELD_TOUCH) {
      expect(scrollY).toBe(0);
      // The first row starts on: the lift turned it off.
      await expect(input).not.toBeChecked();
    } else {
      expect(scrollY).toBeGreaterThan(100);
      await expect(input).toBeChecked();
      const rest = await presented(page);
      expect(rest.scaleX).toBeCloseTo(1, 2);
      expect(rest.on).toBeCloseTo(1, 2);
    }
  });

  test('P9 · a horizontal drag in a scrolling list flips the switch and never scrolls the page', async ({
    page,
  }) => {
    const {driver, input, center} = await openSwitch(
      page,
      'core-switch--in-scrolling-list',
    );
    // The first row starts on: dragging left past the flip distance turns
    // it off, whichever way a held touch is handled.
    await driver.play(
      drag(
        center,
        {x: center.x - FLIP_DISTANCE - 6, y: center.y},
        {durationMs: 400, holdMs: 200, restMs: 150},
      ),
    );
    await expect(input).not.toBeChecked();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('P11 · a mouse click toggles once, through the native checkbox', async ({
    page,
  }) => {
    const {input} = await openSwitch(page);
    await input.click({force: true});
    await expect(input).toBeChecked();
  });

  test('P11 · under a mouse the switch keeps its desktop look: the track’s fill and padding, the thumb’s size and slide', async ({
    browser,
  }) => {
    // A context with no touch screen: the primary pointer is not coarse (a
    // headless box reports no pointer at all), so no touch presentation rule
    // applies and the switch must look as it always has (a later style that
    // names a property replaces all of it).
    // (Contexts made here inherit the project's phone options unless
    // they are named.)
    const context = await browser.newContext({
      viewport: {width: 480, height: 320},
      screen: {width: 480, height: 320},
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
    });
    try {
      const page = await context.newPage();
      await openStory(page, storybook(), 'core-switch--default');
      expect(
        await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const read = async () =>
        page.evaluate(() => {
          const track = document.querySelector<HTMLElement>(
            '#storybook-root .astryx-switch',
          );
          const thumb = track?.querySelector<HTMLElement>(
            '.astryx-switch-thumb',
          );
          const layer = track?.firstElementChild;
          if (track == null || thumb == null || layer == null) {
            throw new Error('the switch has no track, thumb or on layer');
          }
          const t = getComputedStyle(track);
          const box = thumb.getBoundingClientRect();
          return {
            fill: t.backgroundColor,
            padding: t.paddingTop,
            fade: t.transitionDuration,
            size: [box.width, box.height],
            slide: getComputedStyle(thumb).transitionProperty,
            layer: getComputedStyle(layer).display,
          };
        });
      const off = await read();
      expect(off.fill).not.toBe('rgba(0, 0, 0, 0)');
      expect(off.padding).toBe('4px');
      expect(off.fade).not.toBe('0s');
      expect(off.size).toEqual([16, 16]);
      expect(off.slide).toBe('transform, width, height');
      expect(off.layer).toBe('none');

      const input = page.locator('#storybook-root').getByRole('switch');
      await input.click({force: true});
      await expect(input).toBeChecked();
      // The thumb slides and grows over the theme's fast duration.
      await page.waitForTimeout(500);
      const on = await read();
      expect(on.fill).not.toBe('rgba(0, 0, 0, 0)');
      expect(on.fill).not.toBe(off.fill);
      expect(on.size).toEqual([20, 20]);
    } finally {
      await context.close();
    }
  });

  test('P12 · Reduce Motion keeps the lift, as UISwitch does: a hold grows the lens and the release toggles', async ({
    page,
  }) => {
    // UIKit with Reduce Motion on keeps the lift's growth and timing; it
    // drops only the lens's squash and stretch, which this does not draw.
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver, input, center} = await openSwitch(page);
    expect(
      await page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    ).toBe(true);
    let held: Presented | null = null;
    await driver.play(tap(center, {holdMs: 700}), {
      onEvent: async step => {
        if (step.type === 'touchStart') {
          await page.waitForTimeout(500);
          held = await presented(page);
        }
      },
    });
    expect(held).not.toBeNull();
    expect(held!.scaleX).toBeCloseTo(LIFT_SCALE.x, 1);
    expect(held!.fill).toBeLessThan(0.05);
    await expect(input).toBeChecked();
  });

  test('P12 · Reduce Motion keeps the travel on its spring: the thumb slides and never cross-fades', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {thumb} = await openSwitch(page, 'core-switch--controlled-update');
    await page.getByRole('button', {name: 'Turn on remotely'}).click();
    await waitForAnimation(thumb);
    await holdAnimations(page, page.locator('#storybook-root .astryx-switch'));
    const samples = await sampleThumb(page, timeline(500));
    await releaseAnimations(page);
    const travel = compareCurve(
      samples.map(s => ({t: s.t, value: s.x})),
      t => -TRAVEL_PX * (1 - springStep(TRAVEL, t)),
      0.15,
    );
    expect(travel.maxError, JSON.stringify(travel.worst)).toBeLessThanOrEqual(
      0.15,
    );
    // A cross-fade would dip the thumb's opacity; the thumb stays opaque.
    expect(Math.min(...samples.map(s => s.boxOpacity))).toBe(1);
  });

  test('P13 · RTL: the off thumb rests at the right, and a tap carries it to the left end and turns the track on', async ({
    page,
  }) => {
    const {driver, input, thumb, center} = await openSwitch(
      page,
      'core-switch--default',
      {direction: 'rtl'},
    );
    expect(await input.evaluate(el => getComputedStyle(el).direction)).toBe(
      'rtl',
    );
    expect(await thumbOffset(page)).toBeCloseTo(
      TRACK.width - THUMB_WIDTH - INSET,
      0,
    );
    await driver.play(tap(center, {holdMs: 50}));
    await expect(input).toBeChecked();
    await waitForRest(thumb);
    expect(await thumbOffset(page)).toBeCloseTo(INSET, 0);
    expect((await presented(page)).on).toBeCloseTo(1, 2);
  });

  test('P13 · RTL: a drag toward the left flips the switch during the drag; a drag toward the right never flips and toggles at the lift', async ({
    page,
  }) => {
    // Toward the left: the track turns on once the finger has travelled the
    // flip distance, before the lift.
    {
      const {driver, input, onLayer, center} = await openSwitch(
        page,
        'core-switch--default',
        {direction: 'rtl'},
      );
      const onAt: {dx: number; on: number}[] = [];
      await driver.play(
        drag(
          center,
          {x: center.x - FLIP_DISTANCE - 6, y: center.y},
          {durationMs: 600, holdMs: 300, restMs: 200},
        ),
        {
          onEvent: async step => {
            if (step.type === 'touchMove') {
              onAt.push({
                dx: center.x - step.fingers[0].x,
                on: Number(
                  await onLayer.evaluate(el => getComputedStyle(el).opacity),
                ),
              });
            }
          },
        },
      );
      const before = onAt.filter(s => s.dx < FLIP_DISTANCE - 0.5);
      expect(before.every(s => s.on < 0.01)).toBe(true);
      expect(onAt.at(-1)!.on).toBeGreaterThan(0.1);
      await expect(input).toBeChecked();
    }
    // Toward the right, the side an off switch already is on: no flip
    // during the drag, and the lift toggles like a tap.
    {
      const {driver, input, onLayer, center} = await openSwitch(
        page,
        'core-switch--default',
        {direction: 'rtl'},
      );
      const ons: number[] = [];
      await driver.play(
        drag(
          center,
          {x: center.x + 30, y: center.y},
          {durationMs: 600, holdMs: 300, restMs: 200},
        ),
        {
          onEvent: async step => {
            if (step.type === 'touchMove') {
              ons.push(
                Number(
                  await onLayer.evaluate(el => getComputedStyle(el).opacity),
                ),
              );
            }
          },
        },
      );
      expect(ons.every(on => on < 0.01)).toBe(true);
      await expect(input).toBeChecked();
    }
  });

  test('P14 · a second tap mid-travel catches the thumb where it is and sends it back, without a jump', async ({
    page,
  }) => {
    const {driver, input, thumb, center} = await openSwitch(page);
    // The thumb's on-screen center, every frame.
    await page.evaluate(() => {
      const box = document.querySelector<HTMLElement>(
        '#storybook-root .astryx-switch-thumb',
      )!.parentElement!;
      const record = window as unknown as {__thumbXs: number[]};
      record.__thumbXs = [];
      const loop = () => {
        const rect = box.getBoundingClientRect();
        record.__thumbXs.push(rect.left + rect.width / 2);
        if (record.__thumbXs.length < 240) {
          requestAnimationFrame(loop);
        }
      };
      requestAnimationFrame(loop);
    });
    const finger = {id: 0, ...center};
    // The second tap lands 70 ms into the first one's travel.
    await driver.play([
      {t: 0, fingers: [finger]},
      {t: 40, fingers: []},
      {t: 110, fingers: [finger]},
      {t: 140, fingers: []},
    ]);
    await waitForRest(thumb);
    await expect(input).not.toBeChecked();
    expect(await thumbOffset(page)).toBeCloseTo(INSET, 0);
    const xs = await page.evaluate(
      () => (window as unknown as {__thumbXs: number[]}).__thumbXs,
    );
    const farthest = Math.max(...xs) - xs[0];
    // It turned around mid-travel, short of the on end...
    expect(farthest).toBeGreaterThan(1);
    expect(farthest).toBeLessThan(TRAVEL_PX - 1);
    // ...from where it was: no frame moves it more than a few px.
    const steps = xs.slice(1).map((x, i) => Math.abs(x - xs[i]));
    expect(Math.max(...steps)).toBeLessThan(4);
  });

  test('a disabled or busy switch neither lifts nor toggles under a finger', async ({
    page,
  }) => {
    for (const storyId of ['core-switch--disabled', 'core-switch--loading']) {
      const {driver, input, center} = await openSwitch(page, storyId);
      const wasOn = await input.isChecked();
      let held: Presented | null = null;
      await driver.play(tap(center, {holdMs: 400}), {
        onEvent: async step => {
          if (step.type === 'touchStart') {
            await page.waitForTimeout(250);
            held = await presented(page);
          }
        },
      });
      expect(held!.scaleX, storyId).toBe(1);
      expect(await input.isChecked(), storyId).toBe(wasOn);
    }
  });

  test('the lift and the travel follow the UIKit springs, sampled frame by frame', async ({
    page,
  }, testInfo) => {
    const {driver, thumb, center} = await openSwitch(page);
    // The lift: hold the finger down and sample the held animations.
    let liftSamples: {t: number; scaleX: number; fill: number}[] = [];
    await driver.play(tap(center, {holdMs: 400}), {
      onEvent: async step => {
        if (step.type !== 'touchStart') {
          return;
        }
        await waitForAnimation(thumb);
        await holdAnimations(page, thumb);
        liftSamples = await sampleThumb(page, timeline(400));
        await releaseAnimations(page);
      },
    });
    const liftResult = compareCurve(
      liftSamples.map(s => ({t: s.t, value: s.scaleX})),
      t => 1 + (LIFT_SCALE.x - 1) * springStep(LIFT, t),
      0.01,
    );
    await waitForRest(thumb);
    // The travel and the track color, from a programmatic change: the thumb
    // starts at rest, as UISwitch's `setOn(_:animated:)` does.
    await openStory(page, storybook(), 'core-switch--controlled-update');
    await page.getByRole('button', {name: 'Turn on remotely'}).click();
    await waitForAnimation(thumb);
    await holdAnimations(page, page.locator('#storybook-root .astryx-switch'));
    const travelSamples = await sampleThumb(page, timeline(500));
    await releaseAnimations(page);
    const travelResult = compareCurve(
      travelSamples.map(s => ({t: s.t, value: s.x})),
      t => -TRAVEL_PX * (1 - springStep(TRAVEL, t)),
      0.15,
    );
    const wellResult = compareCurve(
      travelSamples.map(s => ({t: s.t, value: s.on})),
      t => springStep(WELL_ON, t),
      0.01,
    );
    await writeEvidence(
      'curves/switch',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {liftSamples, travelSamples, liftResult, travelResult, wellResult},
          null,
          1,
        ),
      },
      testInfo,
    );
    expect(
      liftResult.maxError,
      JSON.stringify(liftResult.worst),
    ).toBeLessThanOrEqual(0.01);
    expect(
      travelResult.maxError,
      JSON.stringify(travelResult.worst),
    ).toBeLessThanOrEqual(0.15);
    expect(
      wellResult.maxError,
      JSON.stringify(wellResult.worst),
    ).toBeLessThanOrEqual(0.01);
  });

  test('P10 · the toggle keeps advancing every frame while the main thread is blocked', async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
    );
    const {driver, input, thumb, center} = await openSwitch(page);
    await markElement(thumb, {size: 6, inset: 2});
    const cast = await startScreencast(page);
    await driver.play(tap(center, {holdMs: 50}));
    await expect(input).toBeChecked();
    await waitForAnimation(thumb, {minProgressMs: 16});
    const travel = await travelAnimation(page);
    const block = await blockMainThread(page, 700);
    await page.waitForTimeout(150);
    const castFrames = await cast.stop();
    const tracked = await trackMarker(page, castFrames);
    const proof = busyWindowProof(
      tracked,
      {from: block.from, to: Math.min(block.to, travel.to)},
      // The travel's tail moves less than a frame pixel per frame.
      {axis: 'x', settledWithin: 1.5},
    );
    await writeEvidence(
      'busy-main-thread/switch-toggle',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {
            block,
            travel,
            proof,
            frames: tracked.map(f => ({
              t: +(f.t - block.from).toFixed(1),
              x: f.box?.x ?? null,
              w: f.box?.width ?? null,
            })),
          },
          null,
          1,
        ),
      },
      testInfo,
    );
    expect(proof.medianFrameMs).toBeLessThan(20);
    expect(proof.longestStallMs).toBeLessThan(40);
    expect(proof.monotonic).toBe(true);
    // The travel is 13 px: past its first half it moves less than a
    // screencast pixel per frame, so not every frame changes...
    expect(proof.changed).toBeGreaterThanOrEqual(Math.floor(proof.frames / 2));
    // ...but most of it happened while the main thread was held.
    const held = tracked.filter(
      f => f.t >= block.from && f.t <= block.to && f.box != null,
    );
    expect(held.at(-1)!.box!.x - held[0].box!.x).toBeGreaterThanOrEqual(8);
  });

  test('P10 · the track colour keeps fading in while the main thread is blocked', async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
    );
    const {driver, input, onLayer, center} = await openSwitch(page);
    // Hide the thumb (its animations still run) so the whole track shows
    // its colour.
    await page.addStyleTag({
      content:
        '#storybook-root .astryx-switch > span:not(:first-child) { visibility: hidden }',
    });
    const box = await page
      .locator('#storybook-root .astryx-switch')
      .first()
      .boundingBox();
    if (box == null) {
      throw new Error('no track');
    }
    const cast = await startScreencast(page);
    await driver.play(tap(center, {holdMs: 50}));
    await expect(input).toBeChecked();
    await waitForAnimation(onLayer, {minProgressMs: 16});
    const block = await blockMainThread(page, 700);
    await page.waitForTimeout(150);
    const castFrames = await cast.stop();
    const luma = await sampleLuma(page, castFrames, {
      x: box.x + 4,
      y: box.y + 4,
      width: box.width - 8,
      height: box.height - 8,
    });
    await writeEvidence(
      'busy-main-thread/switch-track-colour',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {
            block,
            frames: luma.map(f => ({
              t: +(f.t - block.from).toFixed(1),
              luma: +f.luma.toFixed(1),
            })),
          },
          null,
          1,
        ),
      },
      testInfo,
    );
    const off = luma[0].luma;
    const on = luma.at(-1)!.luma;
    const held = luma.filter(
      f => f.t >= block.from + 20 && f.t <= block.to - 20,
    );
    expect(held.length).toBeGreaterThan(20);
    // Most of the fade happened while the main thread was held.
    expect(held[0].luma - held.at(-1)!.luma).toBeGreaterThan(0.5 * (off - on));
  });

  test('P10 · the toggle does no Layout or Paint per frame', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
    const {driver, input, thumb, center} = await openSwitch(page);
    let travel = {from: 0, to: 0};
    const trace = await traceRendering(page, async () => {
      await driver.play(tap(center, {holdMs: 50}));
      // The commit re-bases the travel in the same frame: read it after.
      await expect(input).toBeChecked();
      travel = await travelAnimation(page);
      await waitForRest(thumb);
    });
    // The steady part of the travel, while the lens settles and the track
    // color rises too: the value's commit comes before it.
    const during = countBetween(trace, travel.from + 50, travel.to - 50);
    expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
    expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
    expect(trace.longTasks).toEqual([]);
  });

  test(
    'storyboard: tap — lift, travel and settle',
    {tag: '@storyboard'},
    async ({page}, testInfo) => {
      const {driver, thumb, center} = await openSwitch(page);
      await installTimerGate(page);
      const clip = page.locator('#storybook-root .astryx-switch');
      await driver.play(tap(center, {holdMs: 50}));
      await waitForAnimation(thumb);
      await freezeTimers(page);
      const {storyboard} = await animationStoryboard(page, {
        name: 'switch-tap',
        // The motion: the lens settles last, about 1.2 s after the release.
        times: timeline(1250),
        clip: {...(await clipAround(clip))},
        measure: async () => ({
          ...(await presented(page)),
          offset: await thumbOffset(page),
        }),
        columns: 8,
        cellScale: 2,
      });
      await releaseAnimations(page, {finish: true});
      await thawTimers(page);
      await storyboard.write(testInfo);
      const offsets = storyboard.frames.map(f => f.data.offset as number);
      expect(offsets.at(-1)).toBeCloseTo(INSET + TRAVEL_PX, 0);
      // Critically damped travel: never past the on end.
      expect(Math.max(...offsets)).toBeLessThanOrEqual(INSET + TRAVEL_PX + 0.1);
    },
  );

  test(
    'storyboard: hold, drag across, lift',
    {tag: '@storyboard'},
    async ({page}, testInfo) => {
      const {driver, center} = await openSwitch(page);
      const clip = page.locator('#storybook-root .astryx-switch');
      const board = await touchStoryboard(
        page,
        driver,
        drag(
          center,
          {x: center.x + FLIP_DISTANCE + 8, y: center.y},
          {durationMs: 400, hz: 20, holdMs: 300, restMs: 100},
        ),
        {
          name: 'switch-hold-drag',
          clip: {...(await clipAround(clip))},
          measure: async () => ({
            ...(await presented(page)),
            offset: await thumbOffset(page),
          }),
          columns: 6,
          cellScale: 2,
        },
      );
      await board.write(testInfo);
      const ons = board.frames.map(f => f.data.on as number);
      // Off until the flip, then the track color rises.
      expect(ons[0]).toBeCloseTo(0, 2);
      expect(ons.at(-1)!).toBeGreaterThan(0.05);
    },
  );
});

/**
 * The mean luma of a box (CSS px) in each screencast frame, decoded in a
 * scratch page like the harness's marker tracking.
 */
async function sampleLuma(
  page: Page,
  frames: ReadonlyArray<CastFrame>,
  region: {x: number; y: number; width: number; height: number},
): Promise<{t: number; luma: number}[]> {
  const scratch = await page.context().newPage();
  try {
    const out: {t: number; luma: number}[] = [];
    for (let i = 0; i < frames.length; i += 12) {
      const batch = frames.slice(i, i + 12);
      const values = await scratch.evaluate(
        async ({items, box}) => {
          const result: number[] = [];
          for (const item of items) {
            const blob = await (
              await fetch(`data:image/${item.format};base64,${item.data}`)
            ).blob();
            const bitmap = await createImageBitmap(blob);
            const scale = bitmap.width / item.viewportWidth;
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const context = canvas.getContext('2d');
            if (context == null) {
              throw new Error('no 2d context');
            }
            context.drawImage(bitmap, 0, 0);
            const {data} = context.getImageData(
              Math.round(box.x * scale),
              Math.round(box.y * scale),
              Math.max(1, Math.round(box.width * scale)),
              Math.max(1, Math.round(box.height * scale)),
            );
            let sum = 0;
            for (let o = 0; o < data.length; o += 4) {
              sum +=
                0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
            }
            result.push(sum / (data.length / 4));
          }
          return result;
        },
        {
          items: batch.map(f => ({
            data: f.data,
            format: f.format,
            viewportWidth: f.viewportWidth,
          })),
          box: region,
        },
      );
      values.forEach((luma, k) => out.push({t: batch[k].t, luma}));
    }
    return out;
  } finally {
    await scratch.close();
  }
}

/** The track with room for the lifted lens around it. */
async function clipAround(track: Locator) {
  const box = await track.boundingBox();
  if (box == null) {
    throw new Error('no track');
  }
  return {
    x: box.x - 12,
    y: box.y - 10,
    width: box.width + 24,
    height: box.height + 20,
  };
}

/** Seek the held animations and read the thumb's x delta, scale and the track color. */
async function sampleThumb(
  page: Page,
  times: ReadonlyArray<number>,
): Promise<
  {
    t: number;
    x: number;
    scaleX: number;
    fill: number;
    on: number;
    boxOpacity: number;
  }[]
> {
  return page.evaluate(
    ts => {
      const held =
        (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
        [];
      const thumb = document.querySelector<HTMLElement>(
        '#storybook-root .astryx-switch-thumb',
      )!;
      const box = thumb.parentElement!;
      const on = document.querySelector<HTMLElement>(
        '#storybook-root .astryx-switch > span',
      )!;
      const start = Math.min(...held.map(a => Number(a.startTime ?? 0)));
      return ts.map(t => {
        for (const animation of held) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          const offset = Number(animation.startTime ?? start) - start;
          animation.currentTime = Math.max(0, Math.min(t - offset, end - 0.5));
        }
        const style = getComputedStyle(box);
        const translate = style.translate === 'none' ? '0px' : style.translate;
        const scale = style.scale === 'none' ? '1' : style.scale;
        return {
          t,
          x: parseFloat(translate),
          scaleX: Number(scale.split(' ')[0]),
          fill: Number(getComputedStyle(thumb).opacity),
          on: Number(getComputedStyle(on).opacity),
          boxOpacity: Number(style.opacity),
        };
      });
    },
    [...times],
  );
}

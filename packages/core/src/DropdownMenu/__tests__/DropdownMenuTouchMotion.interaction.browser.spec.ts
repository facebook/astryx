// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuTouchMotion.interaction.browser.spec.ts
 * @input The built Default DropdownMenu story, real touch input (Chromium
 *   CDP / WebKit's input command), the interaction harness, and UIMenu's
 *   values from the UIKit constants table
 * @output Animation and dismissal proofs for the touch presentation: the
 *   open grows out of the trigger on UIKit's open spring and the close
 *   collapses into it on the close spring, on screen through the light
 *   dismiss; the open keeps advancing through a blocked main thread; neither
 *   does Layout or Paint per frame; Reduce Motion cross-fades; a pan outside
 *   dismisses as it begins; storyboards of the open and the close
 * @position Evidence for DropdownMenu's touch presentation (and MoreMenu,
 *   which renders it); the model itself is unit-tested in
 *   menuSurfaceMotion.test.ts. The finger's press model has its own spec,
 *   DropdownMenuTouchPress.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  drag,
  freezeTimers,
  holdAnimations,
  installLongTaskLog,
  installTimerGate,
  markElement,
  openStory,
  readLongTasks,
  releaseAnimations,
  startScreencast,
  tap,
  thawTimers,
  timeline,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {settlingDuration, solveSpring, toSpring} from '../../motion/spring';
import {menu} from '../../motion/uikit/menu';
import {springs} from '../../motion/uikit/springs';

/** The page's viewport; every spec here sets one. */
function viewportOf(page: Page): {width: number; height: number} {
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  return viewport;
}

/** The element's rendered box; a missing one fails the spec. */
async function boxOf(locator: Locator): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('the element has no rendered box');
  }
  return box;
}

/** The last sample; an empty series fails the spec. */
function lastOf<T>(values: ReadonlyArray<T>): T {
  if (values.length === 0) {
    throw new Error('no samples');
  }
  return values[values.length - 1];
}

const storybook = withStorybook(test);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OpenStory {
  driver: TouchDriver;
  trigger: Locator;
  popover: Locator;
  center: {x: number; y: number};
  triggerBox: Box;
}

/** Page-side log of the gesture and the menu: performance.now() times. */
async function installMenuLog(page: Page) {
  await page.evaluate(() => {
    const log = {
      down: [] as number[],
      up: [] as number[],
      cancel: [] as number[],
      opened: [] as number[],
      closed: [] as number[],
      picked: [] as string[],
    };
    (window as unknown as {__menuLog: typeof log}).__menuLog = log;
    document.addEventListener(
      'pointerdown',
      () => log.down.push(performance.now()),
      true,
    );
    document.addEventListener(
      'pointerup',
      () => log.up.push(performance.now()),
      true,
    );
    document.addEventListener(
      'pointercancel',
      () => log.cancel.push(performance.now()),
      true,
    );
    document.addEventListener(
      'toggle',
      event => {
        const state = event.newState;
        (state === 'open' ? log.opened : log.closed).push(performance.now());
      },
      true,
    );
    // The story reports a pick by logging "<label> clicked"; the spec
    // reads those lines through this page-side capture.
    // eslint-disable-next-line no-console -- see above
    const original = console.log.bind(console);
    // eslint-disable-next-line no-console -- see above
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].endsWith(' clicked')) {
        log.picked.push(args[0].replace(' clicked', ''));
      }
      original(...args);
    };
  });
}

const readMenuLog = async (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __menuLog: {
            down: number[];
            up: number[];
            cancel: number[];
            opened: number[];
            closed: number[];
            picked: string[];
          };
        }
      ).__menuLog,
  );

async function openDefault(page: Page): Promise<OpenStory> {
  await installLongTaskLog(page);
  await openStory(page, storybook(), 'core-dropdownmenu--default');
  await installMenuLog(page);
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Actions'});
  const triggerBox = await trigger.boundingBox();
  if (triggerBox == null) {
    throw new Error('no trigger');
  }
  return {
    driver,
    trigger,
    popover: page.locator('[popover]:has([role="menu"])').first(),
    center: {
      x: triggerBox.x + triggerBox.width / 2,
      y: triggerBox.y + triggerBox.height / 2,
    },
    triggerBox,
  };
}

/**
 * The element's presented box at each time of its held animations: its
 * layout box scaled by the presented `scale` about its `transform-origin`.
 * Read from the computed style, which follows a seek; a composited animation
 * of an individual transform property does not reach getBoundingClientRect
 * in Chromium.
 */
async function sampleBoxes(
  locator: Locator,
  layout: Box,
  times: ReadonlyArray<number>,
): Promise<{t: number; box: Box; opacity: number}[]> {
  const raw = await locator.evaluate((element, ts) => {
    const held =
      (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ?? [];
    if (held.length === 0) {
      throw new Error('sampleBoxes: no held animations');
    }
    return ts.map(t => {
      for (const animation of held) {
        const end = Number(
          animation.effect?.getComputedTiming().endTime ?? Infinity,
        );
        animation.currentTime = Math.min(t, end - 0.5);
      }
      const style = getComputedStyle(element);
      return {
        t,
        scale: style.scale,
        origin: style.transformOrigin,
        opacity: Number(style.opacity),
      };
    });
  }, times);
  return raw.map(({t, scale, origin, opacity}) => {
    const [sx, sy = sx] =
      scale === 'none' ? [1, 1] : scale.split(' ').map(Number);
    const [ox, oy] = origin.split(' ').map(value => parseFloat(value));
    return {
      t,
      opacity,
      box: {
        x: layout.x + ox * (1 - sx),
        y: layout.y + oy * (1 - sy),
        width: layout.width * sx,
        height: layout.height * sy,
      },
    };
  });
}

const centerOf = (box: Box) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

/** UIMenu's path at progress p: a square on the anchor grows into the menu. */
function expectedBox(
  anchor: {x: number; y: number},
  final: Box,
  p: number,
): {width: number; height: number; cx: number; cy: number} {
  const size = menu.collapsedSize;
  const finalCenter = centerOf(final);
  return {
    width: size + (final.width - size) * p,
    height: size + (final.height - size) * p,
    cx: anchor.x + (finalCenter.x - anchor.x) * p,
    cy: anchor.y + (finalCenter.y - anchor.y) * p,
  };
}

/** The surface's own scale animation among those running in it. */
async function scaleAnimationOf(locator: Locator) {
  for (;;) {
    const found = await waitForAnimation(locator);
    const scale = found.find(a => a.keyframes.some(k => 'scale' in k));
    if (scale != null) {
      return scale;
    }
  }
}

/** The static copy the close plays on. */
const exitCopyOf = (page: Page) =>
  page.locator('[data-astryx-menu-exit]').first();

async function openWithTap(story: OpenStory) {
  await story.driver.tap(story.center);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
}

test('a pan that starts outside the menu dismisses it as the pan begins; a tap outside dismisses at the lift', async ({
  page,
}) => {
  const story = await openDefault(page);
  test.skip(
    !story.driver.drivesNativeGestures,
    'scripted touches do not start native pans in this engine (iOS evidence: the simulator run)',
  );
  await openWithTap(story);
  await waitForRest(story.popover);
  const viewport = viewportOf(page);
  // A pan in the empty space below: the browser takes it for a scroll.
  const from = {x: viewport.width / 2, y: viewport.height - 120};
  const before = await readMenuLog(page);
  await story.driver.play(
    drag(from, {x: from.x, y: from.y - 100}, {durationMs: 250, hz: 60}),
  );
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  const log = await readMenuLog(page);
  const closedAt = log.closed[before.closed.length];
  const panDown = lastOf(log.down);
  // The browser took the pan (no lift reached the page), and the menu
  // closed as it did, within the 250 ms the finger moved.
  expect(log.cancel.length).toBeGreaterThan(before.cancel.length);
  expect(log.up.filter(t => t > panDown)).toEqual([]);
  expect(closedAt - panDown).toBeLessThan(250);
  expect(closedAt).toBeGreaterThanOrEqual(lastOf(log.cancel) - 1);
  // A tap outside: the browser's light dismiss, at the lift.
  await expect(exitCopyOf(page)).toHaveCount(0);
  await openWithTap(story);
  await waitForRest(story.popover);
  const beforeTap = await readMenuLog(page);
  await story.driver.play(tap({x: 20, y: viewport.height - 20}, {holdMs: 300}));
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  const afterTap = await readMenuLog(page);
  expect(afterTap.closed[beforeTap.closed.length]).toBeGreaterThanOrEqual(
    lastOf(afterTap.up) - 1,
  );
});

test('the open grows out of the trigger on UIKit\u2019s open spring', async ({
  page,
}, testInfo) => {
  const story = await openDefault(page);
  // The menu's layout box, from a first open run to rest.
  await openWithTap(story);
  await waitForRest(story.popover);
  const final = await boxOf(story.popover);
  await page.keyboard.press('Escape');
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  // Reopening during the close would continue from the closing frame.
  await expect(exitCopyOf(page)).toHaveCount(0);
  await openWithTap(story);
  await scaleAnimationOf(story.popover);
  const held = await holdAnimations(page, story.popover);
  const samples = await sampleBoxes(story.popover, final, timeline(700));
  await releaseAnimations(page, {finish: true});
  const progress = solveSpring(toSpring(springs.menuOpen), {from: 0, to: 1});
  const p = (t: number) => progress.value(t / 1000);
  const width = compareCurve(
    samples.map(s => ({t: s.t, value: s.box.width})),
    t => expectedBox(story.center, final, p(t)).width,
    0.75,
  );
  const height = compareCurve(
    samples.map(s => ({t: s.t, value: s.box.height})),
    t => expectedBox(story.center, final, p(t)).height,
    0.75,
  );
  const cx = compareCurve(
    samples.map(s => ({t: s.t, value: centerOf(s.box).x})),
    t => expectedBox(story.center, final, p(t)).cx,
    0.75,
  );
  const cy = compareCurve(
    samples.map(s => ({t: s.t, value: centerOf(s.box).y})),
    t => expectedBox(story.center, final, p(t)).cy,
    0.75,
  );
  const opacity = compareCurve(
    samples.map(s => ({t: s.t, value: s.opacity})),
    t => Math.min(1, Math.max(0, p(t))),
    0.02,
  );
  await writeEvidence(
    'curves/dropdownmenu-touch-open',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {held, final, anchor: story.center, width, height, cx, cy, opacity},
        null,
        1,
      ),
    },
    testInfo,
  );
  // The first frame is UIMenu's collapsed square on the trigger's center.
  expect(samples[0].box.width).toBeCloseTo(menu.collapsedSize, 0);
  expect(samples[0].box.height).toBeCloseTo(menu.collapsedSize, 0);
  expect(centerOf(samples[0].box).x).toBeCloseTo(story.center.x, 0);
  expect(centerOf(samples[0].box).y).toBeCloseTo(story.center.y, 0);
  for (const result of [width, height, cx, cy, opacity]) {
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      result.tolerance,
    );
  }
});

test('the close collapses into the trigger on UIKit\u2019s close spring, on screen through the light dismiss', async ({
  page,
}, testInfo) => {
  const story = await openDefault(page);
  await openWithTap(story);
  await waitForRest(story.popover);
  const open = await boxOf(story.popover);
  // Tap outside: the browser's light dismiss closes the popover at once.
  const viewport = viewportOf(page);
  await story.driver.tap({x: 20, y: viewport.height - 20});
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  const copy = exitCopyOf(page);
  await scaleAnimationOf(copy);
  const held = await holdAnimations(page, copy);
  // The popover is closed and gone; the close plays on a static copy where
  // it stood, out of the accessibility tree and out of reach.
  const state = await page.evaluate(() => {
    const popover = document.querySelector<HTMLElement>(
      '[popover]:has([role="menu"])',
    );
    const ghost = document.querySelector<HTMLElement>(
      '[data-astryx-menu-exit]',
    );
    if (popover == null || ghost == null) {
      throw new Error('no popover or no exit copy');
    }
    return {
      popoverOpen: popover.matches(':popover-open'),
      popoverDisplay: getComputedStyle(popover).display,
      copyHidden: ghost.getAttribute('aria-hidden'),
      copyInert: ghost.hasAttribute('inert'),
      copyPointerEvents: getComputedStyle(ghost).pointerEvents,
      copyIds: ghost.querySelectorAll('[id]').length,
    };
  });
  expect(state).toEqual({
    popoverOpen: false,
    popoverDisplay: 'none',
    copyHidden: 'true',
    copyInert: true,
    copyPointerEvents: 'none',
    copyIds: 0,
  });
  const samples = await sampleBoxes(copy, open, timeline(400));
  await releaseAnimations(page, {finish: true});
  const progress = solveSpring(toSpring(springs.menuClose), {from: 0, to: 1});
  const q = (t: number) => progress.value(t / 1000);
  // The close runs UIMenu's path backwards: the menu at q = 0, the square at q = 1.
  const at = (t: number) => expectedBox(story.center, open, 1 - q(t));
  const width = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.box.width})),
    t => at(t).width,
    0.75,
  );
  const cy = compareCurve(
    samples.map(sample => ({t: sample.t, value: centerOf(sample.box).y})),
    t => at(t).cy,
    0.75,
  );
  const opacity = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.opacity})),
    t => Math.min(1, Math.max(0, 1 - q(t))),
    0.02,
  );
  await writeEvidence(
    'curves/dropdownmenu-touch-close',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {held, open, anchor: story.center, state, width, cy, opacity},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const result of [width, cy, opacity]) {
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      result.tolerance,
    );
  }
  // Once the close has run, the copy is gone and focus is back on the trigger.
  await expect(page.locator('[data-astryx-menu-exit]')).toHaveCount(0);
  await expect(story.trigger).toBeFocused();
});

test('the open keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const story = await openDefault(page);
  // The screencast finds the element by its marker's exact color, which the
  // content fade would blend away: hold opacity at 1 for this proof (an
  // important declaration outranks the animation); the scale, composited
  // the same way, carries the evidence.
  await page.addStyleTag({
    content: '[popover]:has([role="menu"]) { opacity: 1 !important; }',
  });
  await markElement(story.popover, {size: 24, inset: 0});
  const cast = await startScreencast(page);
  await openWithTap(story);
  const [open] = await waitForAnimation(story.popover, {minProgressMs: 16});
  const block = await blockMainThread(page, 400);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  // Up to the spring's peak (about 260 ms in): before it the marker moves
  // one way only.
  const window = {from: block.from, to: Math.min(block.to, open.from + 240)};
  const proof = busyWindowProof(tracked, window, {axis: 'x'});
  await writeEvidence(
    'busy-main-thread/dropdownmenu-touch-open',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, open, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'dropdownmenu-touch-open-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: window.to + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, open});
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
});

test('the open and the close do no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const story = await openDefault(page);
  let open = {from: 0, to: 0};
  let close = {from: 0, to: 0};
  const started = Date.now();
  // Opened from the keyboard (the phone's primary pointer is still coarse,
  // so the touch presentation runs) to keep the trigger's own press
  // feedback out of the measurement. Nothing polls the page inside the
  // windows: a style read during an animation forces a style update, and on
  // an anchored element a layout.
  await story.trigger.focus();
  const trace = await traceRendering(page, async () => {
    await page.keyboard.press('Enter');
    open = await scaleAnimationOf(story.popover);
    await page.waitForTimeout(open.to - Date.now() + 100);
    await page.keyboard.press('Escape');
    close = await scaleAnimationOf(exitCopyOf(page));
    await page.waitForTimeout(close.to - Date.now() + 100);
  });
  // The animations hold their end state for a while past the curve; judge
  // the curves themselves, less their first and last frames. The open's
  // first 150 ms also carry the first row's own highlight transition
  // (background-color, DropdownMenuItem), which is not this motion.
  const openSettle = settlingDuration(toSpring(springs.menuOpen)) * 1000;
  const closeSettle = settlingDuration(toSpring(springs.menuClose)) * 1000;
  const windows = [
    {name: 'open', from: open.from + 150, to: open.from + openSettle - 50},
    {name: 'close', from: close.from + 50, to: close.from + closeSettle - 50},
  ];
  for (const window of windows) {
    const during = countBetween(trace, window.from, window.to);
    expect(during.Layout ?? 0, `${window.name} ${JSON.stringify(during)}`).toBe(
      0,
    );
    expect(during.Paint ?? 0, `${window.name} ${JSON.stringify(during)}`).toBe(
      0,
    );
  }
  expect(trace.longTasks).toEqual([]);
  expect(await readLongTasks(page, {from: started, to: Date.now()})).toEqual(
    [],
  );
});

test('Reduce Motion: the menu lands at its size and cross-fades on springs.menuReducedMotion', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const story = await openDefault(page);
  await openWithTap(story);
  await waitForAnimation(story.popover);
  await holdAnimations(page, story.popover);
  const unit = {x: 0, y: 0, width: 100, height: 100};
  const fade = solveSpring(toSpring(springs.menuReducedMotion), {
    from: 0,
    to: 1,
  });
  const samples = await sampleBoxes(story.popover, unit, timeline(400));
  // Resume rather than finish: the close below starts from what the
  // animator presents, which follows the clock.
  await releaseAnimations(page);
  await page.waitForTimeout(800);
  // No growth: every frame is the menu at full size; it only fades in.
  for (const sample of samples) {
    expect(sample.box.width).toBeCloseTo(100, 3);
  }
  const opacity = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.opacity})),
    t => Math.min(1, Math.max(0, fade.value(t / 1000))),
    0.02,
  );
  expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
    0.02,
  );
  // The close fades out where the menu stands.
  await page.keyboard.press('Escape');
  const copy = exitCopyOf(page);
  await waitForAnimation(copy);
  await holdAnimations(page, copy);
  const [closing] = await sampleBoxes(copy, unit, [100]);
  await releaseAnimations(page, {finish: true});
  expect(closing.box.width).toBeCloseTo(100, 3);
  expect(closing.opacity).toBeCloseTo(1 - fade.value(0.1), 2);
});

test(
  'storyboard: tap to open, tap outside to close',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const story = await openDefault(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    // The presented scale and opacity (a composited scale does not reach
    // getBoundingClientRect in Chromium), and the layout width they apply to.
    const measure = async () =>
      story.popover.evaluate(node => {
        const el = node as HTMLElement;
        const style = getComputedStyle(el);
        const [sx, sy = sx] =
          style.scale === 'none' ? [1, 1] : style.scale.split(' ').map(Number);
        return {
          w: el.offsetWidth * sx,
          h: el.offsetHeight * sy,
          opacity: Number(style.opacity),
        };
      });
    await openWithTap(story);
    await waitForAnimation(story.popover);
    await freezeTimers(page);
    const {storyboard: openBoard} = await animationStoryboard(page, {
      name: 'dropdownmenu-touch-open',
      clip,
      scope: story.popover,
      measure,
      // The spring settles within 0.7 s; the animation holds its end state
      // past that.
      times: timeline(700),
      columns: 8,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await waitForRest(story.popover);
    await story.driver.tap({x: 20, y: viewport.height - 20});
    const copy = exitCopyOf(page);
    await waitForAnimation(copy);
    await freezeTimers(page);
    const measureCopy = async () =>
      copy.evaluate(node => {
        const el = node as HTMLElement;
        const style = getComputedStyle(el);
        const [sx, sy = sx] =
          style.scale === 'none' ? [1, 1] : style.scale.split(' ').map(Number);
        return {
          w: el.offsetWidth * sx,
          h: el.offsetHeight * sy,
          opacity: Number(style.opacity),
        };
      });
    const {storyboard: closeBoard} = await animationStoryboard(page, {
      name: 'dropdownmenu-touch-close',
      clip,
      scope: copy,
      measure: measureCopy,
      times: timeline(400),
      columns: 8,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await openBoard.write(testInfo);
    await closeBoard.write(testInfo);
    // The trace is the assertion: it grows from the square, and shrinks back.
    const openWidths = openBoard.frames.map(f => f.data.w as number);
    expect(Math.abs(openWidths[0] - menu.collapsedSize)).toBeLessThan(1);
    // The spring's overshoot: the menu peaks past its width, then settles.
    expect(Math.max(...openWidths)).toBeGreaterThan(lastOf(openWidths));
    const closeWidths = closeBoard.frames.map(f => f.data.w as number);
    expect(lastOf(closeWidths)).toBeLessThan(closeWidths[0] / 2);
  },
);

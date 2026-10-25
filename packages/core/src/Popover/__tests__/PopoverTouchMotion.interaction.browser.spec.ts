// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PopoverTouchMotion.interaction.browser.spec.ts
 * @input The built Default Popover story, real touch input (Chromium CDP /
 *   WebKit's input command), the interaction harness, and the popover's
 *   values from the UIKit constants table
 * @output Animation proofs for Popover's touch presentation (under a finger,
 *   one touch model on every touch device): it grows out of its trigger on UIKit's present
 *   spring (the edge on the trigger, the scale
 *   and the length on one spring) and shrinks back into it on the dismiss
 *   spring, on screen through the light dismiss; the presentation keeps
 *   advancing through a blocked main thread; neither does Layout or Paint
 *   per frame; Reduce Motion cross-fades, opacity only, in 200 ms or less;
 *   a mouse keeps the layer's own entrance; a tap or a pan outside during
 *   the presentation starts nothing, and a pinch zooms the page; storyboards
 *   of both
 * @position Evidence for Popover's touch presentation; the model itself is
 *   unit-tested in popoverSurfaceMotion.test.ts
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
  pinch,
  readLongTasks,
  releaseAnimations,
  startScreencast,
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
import {springs} from '../../motion/uikit/springs';
import {timing} from '../../motion/uikit/timing';
import {cubicBezier} from '../../motion/bezier';
import {popoverCollapsedState, popoverFrame} from '../popoverSurfaceFrame';

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
  layer: Locator;
  center: {x: number; y: number};
  triggerBox: Box;
}

async function openDefault(page: Page): Promise<OpenStory> {
  await installLongTaskLog(page);
  await openStory(page, storybook(), 'core-popover--default');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Settings'});
  const triggerBox = await trigger.boundingBox();
  if (triggerBox == null) {
    throw new Error('no trigger');
  }
  return {
    driver,
    trigger,
    layer: page.locator('[popover]:has([role="dialog"])').first(),
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

/** UIKit's popover path at progress p of its spring, as a visual box. */
function expectedBox(final: Box, trigger: Box, p: number): Box {
  const geometry = {
    surface: {
      left: final.x,
      top: final.y,
      width: final.width,
      height: final.height,
    },
    source: {
      left: trigger.x,
      top: trigger.y,
      width: trigger.width,
      height: trigger.height,
    },
  };
  const state = popoverCollapsedState(geometry);
  const frame = popoverFrame(state, p);
  return {
    x: final.x + state.originX * (1 - frame.scaleX),
    y: final.y + state.originY * (1 - frame.scaleY),
    width: final.width * frame.scaleX,
    height: final.height * frame.scaleY,
  };
}

/** The layer's own scale animation among those running in it. */
async function scaleAnimationOf(locator: Locator) {
  for (;;) {
    const found = await waitForAnimation(locator);
    const scale = found.find(a => a.keyframes.some(k => 'scale' in k));
    if (scale != null) {
      return scale;
    }
  }
}

/** The static copy the dismissal plays on. */
const exitCopyOf = (page: Page) =>
  page.locator('[data-astryx-popover-exit]').first();

async function openWithTap(story: OpenStory) {
  await story.driver.tap(story.center);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
}

/** Page-side log of the touches and the popover: performance.now() times. */
async function installTouchLog(page: Page) {
  await page.evaluate(() => {
    const log = {
      down: [] as number[],
      up: [] as number[],
      cancel: [] as number[],
      closed: [] as number[],
      // Per touch after the first: whether it landed on the hold.
      held: [] as boolean[],
    };
    (window as unknown as {__touchLog: typeof log}).__touchLog = log;
    const push = (list: number[]) => () => list.push(performance.now());
    document.addEventListener('pointerdown', push(log.down), true);
    document.addEventListener(
      'pointerdown',
      event => {
        if (log.down.length > 1) {
          log.held.push(
            event.target instanceof Element &&
              event.target.closest('[data-astryx-popover-hold]') != null,
          );
        }
      },
      true,
    );
    document.addEventListener('pointerup', push(log.up), true);
    document.addEventListener('pointercancel', push(log.cancel), true);
    document.addEventListener(
      'toggle',
      event => {
        if (event.newState === 'closed') {
          log.closed.push(performance.now());
        }
      },
      true,
    );
  });
}

const readTouchLog = async (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __touchLog: {
            down: number[];
            up: number[];
            cancel: number[];
            closed: number[];
            held: boolean[];
          };
        }
      ).__touchLog,
  );

test.describe('with a mouse (a fine primary pointer)', () => {
  test.use({hasTouch: false, isMobile: false});

  test('the layer keeps its own entrance and the popover closes at once', async ({
    page,
  }) => {
    await installLongTaskLog(page);
    await openStory(page, storybook(), 'core-popover--default');
    const trigger = page.getByRole('button', {name: 'Settings'});
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const layer = page.locator('[popover]:has([role="dialog"])').first();
    // The layer's own CSS entrance runs; no UIKit scale is set or played.
    const entrance = await layer.evaluate(element => ({
      inlineScale: (element as HTMLElement).style.getPropertyValue('scale'),
      inlineAnimation: (element as HTMLElement).style.getPropertyValue(
        'animation-name',
      ),
      animationName: getComputedStyle(element).animationName,
      played: element
        .getAnimations()
        .some(
          animation =>
            !(animation instanceof CSSAnimation) &&
            (animation.effect as KeyframeEffect | null)
              ?.getKeyframes()
              .some(frame => 'scale' in frame) === true,
        ),
    }));
    expect(entrance.inlineScale).toBe('');
    expect(entrance.inlineAnimation).toBe('');
    expect(entrance.animationName).not.toBe('none');
    expect(entrance.played).toBe(false);
    await waitForRest(layer);
    // A click outside closes it at once: no copy shrinks back into the trigger.
    const viewport = page.viewportSize();
    if (viewport == null) {
      throw new Error('no viewport');
    }
    await page.mouse.click(20, viewport.height - 20);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(exitCopyOf(page)).toHaveCount(0);
  });
});

test('a tap outside during the presentation is ignored: the presentation finishes and the popover stays', async ({
  page,
}) => {
  const story = await openDefault(page);
  await installTouchLog(page);
  // A button outside that counts the taps that reach it.
  await page.evaluate(() => {
    const probe = document.createElement('button');
    probe.textContent = 'Outside';
    Object.assign(probe.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      width: '120px',
      height: '44px',
    });
    const counter = window as unknown as {__outsideClicks: number};
    counter.__outsideClicks = 0;
    probe.addEventListener('click', () => {
      counter.__outsideClicks += 1;
    });
    document.body.append(probe);
  });
  const outsideClicks = async () =>
    page.evaluate(
      () => (window as unknown as {__outsideClicks: number}).__outsideClicks,
    );
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  const outside = {x: viewport.width - 80, y: viewport.height - 42};
  const focused = async () =>
    page.evaluate(() => document.activeElement?.outerHTML.slice(0, 120));
  await story.driver.tap(story.center);
  // 60 ms into the presentation, where UIKit ignored the tap.
  await page.waitForTimeout(60);
  const focusedAtOpen = await focused();
  await story.driver.tap(outside);
  await waitForRest(story.layer);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
  const log = await readTouchLog(page);
  expect(log.closed).toEqual([]);
  expect(await outsideClicks()).toBe(0);
  // Without a trace: the control the popover focused keeps focus.
  expect(focusedAtOpen).toContain('role="switch"');
  expect(await focused()).toBe(focusedAtOpen);
  // It was the hold that took the tap, inside the popover's own subtree.
  expect(log.held).toEqual([true]);
  // Once it is in, the hold is gone and a tap outside dismisses it.
  await expect(page.locator('[data-astryx-popover-hold]')).toHaveCount(0);
  await story.driver.tap(outside);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
});

test('a pan outside during the presentation starts nothing: no scroll, and the popover stays', async ({
  page,
}) => {
  const story = await openDefault(page);
  test.skip(
    !story.driver.drivesNativeGestures,
    'scripted touches do not start native pans in this engine (iOS evidence: the simulator run)',
  );
  await installTouchLog(page);
  // Room to scroll, so a pan the browser took would scroll the page.
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.style.height = '2000px';
    document.body.append(spacer);
  });
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  const focused = async () =>
    page.evaluate(() => document.activeElement?.outerHTML.slice(0, 120));
  await story.driver.tap(story.center);
  // 60 ms into the presentation, a finger drags up from outside.
  await page.waitForTimeout(60);
  const focusedAtOpen = await focused();
  const from = {x: viewport.width - 40, y: viewport.height - 120};
  await story.driver.play(
    drag(from, {x: from.x, y: from.y - 100}, {durationMs: 200, hz: 60}),
  );
  await waitForRest(story.layer);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
  const log = await readTouchLog(page);
  // The hold took the touch: the browser started no pan, so nothing
  // scrolled and the pan-outside dismissal never fired.
  expect(log.held).toEqual([true]);
  expect(log.cancel).toEqual([]);
  expect(log.closed).toEqual([]);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // Without a trace: the control the popover focused keeps focus.
  expect(focusedAtOpen).toContain('role="switch"');
  expect(await focused()).toBe(focusedAtOpen);
});

test('a pinch during the presentation zooms the page, and the presentation finishes and stays', async ({
  page,
}) => {
  const story = await openDefault(page);
  test.skip(
    !story.driver.drivesNativeGestures,
    'scripted touches do not start a native pinch-zoom in this engine (iOS evidence: the simulator run)',
  );
  await installTouchLog(page);
  const scale = async () =>
    page.evaluate(() => window.visualViewport?.scale ?? 1);
  expect(await scale()).toBe(1);
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  await story.driver.tap(story.center);
  // 60 ms into the presentation, two fingers spread apart below the popover.
  await page.waitForTimeout(60);
  await story.driver.play(
    pinch({
      center: {x: viewport.width / 2, y: viewport.height - 160},
      fromDistance: 60,
      toDistance: 240,
      durationMs: 250,
      hz: 60,
    }),
  );
  await waitForRest(story.layer);
  const log = await readTouchLog(page);
  // Both fingers landed on the hold, which leaves a pinch to the browser
  // (spec:AST-094 FR35, FR10): the page zoomed.
  expect(log.held).toEqual([true, true]);
  await expect.poll(scale).toBeGreaterThan(1.1);
  // The presentation finished, and the popover stayed open.
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
  expect(log.closed).toEqual([]);
});

test('the presentation grows out of the trigger on UIKit\u2019s present spring', async ({
  page,
}, testInfo) => {
  const story = await openDefault(page);
  // The popover's layout box, from a first presentation run to rest.
  await openWithTap(story);
  await waitForRest(story.layer);
  const final = (await story.layer.boundingBox())!;
  await page.keyboard.press('Escape');
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  // Presenting during the dismissal would continue from the closing frame.
  await expect(exitCopyOf(page)).toHaveCount(0);
  await openWithTap(story);
  await scaleAnimationOf(story.layer);
  const held = await holdAnimations(page, story.layer);
  const samples = await sampleBoxes(story.layer, final, timeline(700));
  await releaseAnimations(page, {finish: true});
  const progress = solveSpring(toSpring(springs.popoverPresent), {
    from: 0,
    to: 1,
  });
  const at = (t: number) =>
    expectedBox(final, story.triggerBox, progress.value(t / 1000));
  const compare = (read: (box: Box) => number) =>
    compareCurve(
      samples.map(sample => ({t: sample.t, value: read(sample.box)})),
      t => read(at(t)),
      0.75,
    );
  const width = compare(box => box.width);
  const height = compare(box => box.height);
  const top = compare(box => box.y);
  const cx = compare(box => box.x + box.width / 2);
  const opacity = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.opacity})),
    t => Math.min(1, Math.max(0, progress.value(t / 1000))),
    0.02,
  );
  await writeEvidence(
    'curves/popover-touch-present',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {held, final, trigger: story.triggerBox, width, height, top, cx},
        null,
        1,
      ),
    },
    testInfo,
  );
  // The popover's edge stays on the trigger's bottom edge throughout.
  for (const sample of samples) {
    expect(sample.box.y).toBeCloseTo(final.y, 0);
  }
  for (const result of [width, height, top, cx, opacity]) {
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      result.tolerance,
    );
  }
});

test('the dismissal shrinks back into the trigger on UIKit\u2019s dismiss spring, on screen through the light dismiss', async ({
  page,
}, testInfo) => {
  const story = await openDefault(page);
  await openWithTap(story);
  await waitForRest(story.layer);
  const open = (await story.layer.boundingBox())!;
  // Tap outside: the browser's light dismiss closes the popover at once.
  const viewport = page.viewportSize()!;
  await story.driver.tap({x: 20, y: viewport.height - 20});
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  const copy = exitCopyOf(page);
  await scaleAnimationOf(copy);
  const held = await holdAnimations(page, copy);
  // The popover is closed and gone; the dismissal plays on a static copy
  // where it stood, out of the accessibility tree and out of reach.
  const state = await page.evaluate(() => {
    const layer = document.querySelector<HTMLElement>(
      '[popover]:has([role="dialog"])',
    )!;
    const exitCopy = document.querySelector<HTMLElement>(
      '[data-astryx-popover-exit]',
    )!;
    return {
      layerOpen: layer.matches(':popover-open'),
      layerDisplay: getComputedStyle(layer).display,
      copyHidden: exitCopy.getAttribute('aria-hidden'),
      copyInert: exitCopy.hasAttribute('inert'),
      copyPointerEvents: getComputedStyle(exitCopy).pointerEvents,
      copyIds: exitCopy.querySelectorAll('[id]').length,
    };
  });
  expect(state).toEqual({
    layerOpen: false,
    layerDisplay: 'none',
    copyHidden: 'true',
    copyInert: true,
    copyPointerEvents: 'none',
    copyIds: 0,
  });
  const samples = await sampleBoxes(copy, open, timeline(500));
  await releaseAnimations(page, {finish: true});
  const progress = solveSpring(toSpring(springs.popoverDismiss), {
    from: 0,
    to: 1,
  });
  // The dismissal runs the presentation's path backwards.
  const at = (t: number) =>
    expectedBox(open, story.triggerBox, 1 - progress.value(t / 1000));
  const width = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.box.width})),
    t => at(t).width,
    0.75,
  );
  const height = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.box.height})),
    t => at(t).height,
    0.75,
  );
  const opacity = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.opacity})),
    t => Math.min(1, Math.max(0, 1 - progress.value(t / 1000))),
    0.02,
  );
  await writeEvidence(
    'curves/popover-touch-dismiss',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {held, open, trigger: story.triggerBox, state, width, height},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const result of [width, height, opacity]) {
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      result.tolerance,
    );
  }
  // Once the dismissal has run, the copy is gone.
  await expect(page.locator('[data-astryx-popover-exit]')).toHaveCount(0);
});

test('the presentation keeps advancing every frame while the main thread is blocked', async ({
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
    content: '[popover]:has([role="dialog"]) { opacity: 1 !important; }',
  });
  await markElement(story.layer, {size: 24, inset: 0});
  const cast = await startScreencast(page);
  await openWithTap(story);
  const [present] = await waitForAnimation(story.layer, {minProgressMs: 16});
  const block = await blockMainThread(page, 400);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  // Up to the spring's peak (about 280 ms in): before it the marker moves
  // one way only.
  const window = {
    from: block.from,
    to: Math.min(block.to, present.from + 260),
  };
  const proof = busyWindowProof(tracked, window, {axis: 'x'});
  await writeEvidence(
    'busy-main-thread/popover-touch-present',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, present, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'popover-touch-present-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: window.to + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, present});
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  // A stall is judged in the screencast's own intervals, as the harness's
  // verdict judges it: no more than two dropped frames.
  expect(proof.longestStallFrames).toBeLessThanOrEqual(3);
  expect(proof.monotonic).toBe(true);
});

test('the presentation and the dismissal do no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const story = await openDefault(page);
  let present = {from: 0, to: 0};
  let dismiss = {from: 0, to: 0};
  const started = Date.now();
  // Opened from the keyboard (the phone's primary pointer is still coarse,
  // so the touch presentation runs) to keep the trigger's own press
  // feedback out of the measurement. Nothing polls the page inside the
  // windows: a style read during an animation forces a style update, and on
  // an anchored element a layout.
  await story.trigger.focus();
  const trace = await traceRendering(page, async () => {
    await page.keyboard.press('Enter');
    present = await scaleAnimationOf(story.layer);
    await page.waitForTimeout(present.to - Date.now() + 100);
    await page.keyboard.press('Escape');
    dismiss = await scaleAnimationOf(exitCopyOf(page));
    await page.waitForTimeout(dismiss.to - Date.now() + 100);
  });
  // The animations hold their end state for a while past the curve; judge
  // the curves themselves, less their first and last frames. The
  // presentation's first 150 ms also carry the focus moving into the
  // popover (its first control paints its ring), which is not this motion.
  const presentSettle =
    settlingDuration(toSpring(springs.popoverPresent)) * 1000;
  const dismissSettle =
    settlingDuration(toSpring(springs.popoverDismiss)) * 1000;
  const windows = [
    {
      name: 'present',
      from: present.from + 150,
      to: present.from + presentSettle - 50,
    },
    {
      name: 'dismiss',
      from: dismiss.from + 50,
      to: dismiss.from + dismissSettle - 50,
    },
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

test('Reduce Motion: the popover cross-fades in at its size and out where it stands, in 200 ms or less with no spring', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const story = await openDefault(page);
  await openWithTap(story);
  await waitForAnimation(story.layer);
  await holdAnimations(page, story.layer);
  const unit = {x: 0, y: 0, width: 100, height: 100};
  // design:reduced-motion DR2: opacity only, 200 ms or less, here on
  // UIKit's cross-fade curve.
  const ease = cubicBezier(timing.curves.move);
  const fade = (t: number) =>
    ease(Math.min(1, Math.max(0, t / timing.reducedMotionCrossFadeMs)));
  const samples = await sampleBoxes(story.layer, unit, timeline(300));
  // Resume rather than finish: the dismissal below starts from what the
  // animator presents, which follows the clock.
  await releaseAnimations(page);
  await page.waitForTimeout(400);
  // No growth: every frame is the popover at full size; it only fades in.
  for (const sample of samples) {
    expect(sample.box.width).toBeCloseTo(100, 3);
    expect(sample.box.height).toBeCloseTo(100, 3);
  }
  const opacity = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.opacity})),
    fade,
    0.02,
  );
  expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
    0.02,
  );
  // In by 200 ms.
  for (const sample of samples.filter(
    s => s.t >= timing.reducedMotionCrossFadeMs,
  )) {
    expect(sample.opacity).toBeCloseTo(1, 3);
  }
  // The dismissal fades out where the popover stands, on the same curve.
  await page.keyboard.press('Escape');
  const copy = exitCopyOf(page);
  await waitForAnimation(copy);
  await holdAnimations(page, copy);
  const [closing, gone] = await sampleBoxes(copy, unit, [
    100,
    timing.reducedMotionCrossFadeMs,
  ]);
  await releaseAnimations(page, {finish: true});
  expect(closing.box.width).toBeCloseTo(100, 3);
  expect(closing.opacity).toBeCloseTo(1 - fade(100), 2);
  expect(gone.opacity).toBeCloseTo(0, 3);
});

test(
  'storyboard: tap to present, tap outside to dismiss',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const story = await openDefault(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    // The presented scale and opacity (a composited scale does not reach
    // getBoundingClientRect in Chromium), and the layout size they apply to.
    const measureOf = (locator: Locator) => async () =>
      locator.evaluate(node => {
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
    await waitForAnimation(story.layer);
    await freezeTimers(page);
    const {storyboard: presentBoard} = await animationStoryboard(page, {
      name: 'popover-touch-present',
      clip,
      scope: story.layer,
      measure: measureOf(story.layer),
      // The spring settles within 0.6 s; the animation holds its end state
      // past that.
      times: timeline(600),
      columns: 8,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await waitForRest(story.layer);
    await story.driver.tap({x: 20, y: viewport.height - 20});
    const copy = exitCopyOf(page);
    await waitForAnimation(copy);
    await freezeTimers(page);
    const {storyboard: dismissBoard} = await animationStoryboard(page, {
      name: 'popover-touch-dismiss',
      clip,
      scope: copy,
      measure: measureOf(copy),
      times: timeline(500),
      columns: 8,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await presentBoard.write(testInfo);
    await dismissBoard.write(testInfo);
    // The trace is the assertion: it grows from a point, wide before tall,
    // overshoots, and shrinks back.
    const widths = presentBoard.frames.map(f => f.data.w as number);
    const heights = presentBoard.frames.map(f => f.data.h as number);
    expect(widths[0]).toBeLessThan(widths.at(-1)! / 10);
    expect(Math.max(...widths)).toBeGreaterThan(widths.at(-1)!);
    const middle = Math.floor(widths.length / 8);
    expect(heights[middle] / heights.at(-1)!).toBeLessThan(
      widths[middle] / widths.at(-1)!,
    );
    const dismissWidths = dismissBoard.frames.map(f => f.data.w as number);
    expect(dismissWidths.at(-1)!).toBeLessThan(dismissWidths[0] / 2);
  },
);

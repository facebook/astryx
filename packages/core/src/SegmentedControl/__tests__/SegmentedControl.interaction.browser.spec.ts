// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SegmentedControl.interaction.browser.spec.ts
 * @input The built SegmentedControl stories ("Default", "Selection motion"),
 *   real touch input (Chromium CDP / WebKit's input command) and the
 *   interaction harness
 * @output Interaction and animation proofs for the touch presentation's
 *   selection motion: a tap, an arrow key and a programmatic change slide the
 *   selected surface on UIKit's spring (sampled curve vs the spring), the
 *   surface lands where the segment paints it (pixels), the titles
 *   cross-fade on UIKit's clock and curve, a change
 *   mid-flight keeps position and velocity, Reduce Motion drops the travel,
 *   RTL, the slide keeps moving through a blocked main thread, no Layout or
 *   Paint per frame, assistive technology sees no extra node, and storyboards.
 * @position Browser layer of the SegmentedControl selection motion
 *   (useSegmentedSelectionMotion.ts); the unit layers are
 *   useSegmentedSelectionMotion.test.ts and motion/uikit/segmented.test.ts.
 *
 * The oracles come from the harness (`springStep`, `cubicBezier`): math that
 * shares nothing with the code under test, fed the UIKit constants
 * (response 0.40 s and damping ratio 0.85 for the slide; 200 ms on
 * (0.25, 0.1, 0.25, 1) for the titles), read from UISegmentedControl on the
 * iOS 26.2 simulator.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import pixelmatch from 'pixelmatch';
// @ts-expect-error -- pngjs ships no declarations; runtime support is pinned.
import {PNG} from 'pngjs';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  cubicBezier,
  freezeTimers,
  holdAnimations,
  installLongTaskLog,
  installTimerGate,
  markElement,
  openStory,
  readLongTasks,
  releaseAnimations,
  seekAnimations,
  springStep,
  startScreencast,
  thawTimers,
  timeline,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForAnimation,
  withStorybook,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {emulateIosWebKit} from './iosWebKit';

const storybook = withStorybook(test);

/** UIKit's slide, from the constants table (motion/uikit/segmented.ts). */
const SLIDE = {response: 0.4, dampingFraction: 0.85} as const;
/** UIKit's title cross-fade. */
const TITLE_FADE_MS = 200;
const TITLE_EASE = cubicBezier(0.25, 0.1, 0.25, 1);
/** design:reduced-motion DR2: a cross-fade, opacity only, 200 ms or less. */
const RM_MAX_FADE_MS = 200;

interface SegmentBox {
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Control {
  driver: TouchDriver;
  group: Locator;
  proxy: Locator;
  segment: (value: string) => Locator;
  boxes: () => Promise<SegmentBox[]>;
  tapSegment: (value: string) => Promise<void>;
}

async function openControl(
  page: Page,
  storyId = 'core-segmentedcontrol--default',
  groupName = 'View mode',
  {
    direction,
    idiom = 'ios',
  }: {
    direction?: 'rtl';
    /** `ios`: the phone is WebKit on iOS; `default`: any other (Android). */
    idiom?: 'ios' | 'default';
  } = {},
): Promise<Control> {
  if (idiom === 'ios') {
    await emulateIosWebKit(page);
  }
  await installLongTaskLog(page);
  if (direction == null) {
    await openStory(page, storybook(), storyId);
  } else {
    // Storybook's direction toolbar (a global, not an arg).
    await page.goto(
      `${storybook()}/iframe.html?id=${storyId}&viewMode=story&globals=direction:${direction}`,
    );
    await page.locator('#storybook-root > *').first().waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    });
  }
  const driver = await touchDriver(page);
  const group = page.getByRole('radiogroup', {name: groupName, exact: true});
  await expect(group).toBeVisible();
  const proxy = group.locator('[data-selection-proxy]');
  const segment = (value: string) => group.locator(`[data-value="${value}"]`);
  // Boxes in the track's padding-box coordinates, the proxy's own space.
  const boxes = async () =>
    group.evaluate(track => {
      const trackRect = track.getBoundingClientRect();
      return [...track.querySelectorAll<HTMLElement>('[role="radio"]')].map(
        element => {
          const rect = element.getBoundingClientRect();
          return {
            value: element.dataset.value ?? '',
            x: rect.left - trackRect.left - track.clientLeft,
            y: rect.top - trackRect.top - track.clientTop,
            width: rect.width,
            height: rect.height,
          };
        },
      );
    });
  const tapSegment = async (value: string) => {
    const box = await segment(value).boundingBox();
    if (box == null) {
      throw new Error(`no segment ${value}`);
    }
    await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  };
  return {driver, group, proxy, segment, boxes, tapSegment};
}

/** The proxy's presented position and width at each held time. */
async function sampleProxy(
  proxy: Locator,
  times: ReadonlyArray<number>,
): Promise<{t: number; x: number; width: number; visible: boolean}[]> {
  return proxy.evaluate((element, ts) => {
    const held =
      (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ?? [];
    const baseWidth = parseFloat(getComputedStyle(element).width);
    return ts.map(t => {
      for (const animation of held) {
        const end = Number(animation.effect?.getComputedTiming().endTime ?? 0);
        animation.currentTime = Math.min(t, end - 0.5);
      }
      const style = getComputedStyle(element);
      const translate =
        style.translate === 'none' ? 0 : parseFloat(style.translate);
      const scaleX = style.scale === 'none' ? 1 : parseFloat(style.scale);
      return {
        t,
        x: translate,
        width: baseWidth * scaleX,
        visible: style.visibility === 'visible',
      };
    });
  }, times);
}

/**
 * Records, on the page's clock (epoch ms), each moment a selection proxy
 * hands its surface back (it is hidden again). The animator's keyframes hold
 * the end state for a few seconds past the curve, so an animation's end time
 * is not when the slide is over; the hand-back is.
 */
async function recordHandBacks(page: Page): Promise<() => Promise<number[]>> {
  await page.evaluate(() => {
    const times: number[] = [];
    (window as unknown as {__handBacks: number[]}).__handBacks = times;
    for (const proxy of document.querySelectorAll<HTMLElement>(
      '[data-selection-proxy]',
    )) {
      let visible = proxy.style.visibility === 'visible';
      new MutationObserver(() => {
        const now = proxy.style.visibility === 'visible';
        if (visible && !now) {
          times.push(performance.timeOrigin + performance.now());
        }
        visible = now;
      }).observe(proxy, {attributes: true, attributeFilter: ['style']});
    }
  });
  return async () =>
    page.evaluate(
      () => (window as unknown as {__handBacks: number[]}).__handBacks,
    );
}

/** The box of one segment; a missing segment is a broken story, not a pass. */
function boxOf(boxes: ReadonlyArray<SegmentBox>, value: string): SegmentBox {
  const box = boxes.find(b => b.value === value);
  if (box == null) {
    throw new Error(`no segment "${value}" in ${JSON.stringify(boxes)}`);
  }
  return box;
}

test('a tap slides the selected surface to the new segment on UIKit’s spring', async ({
  page,
}, testInfo) => {
  const control = await openControl(page);
  // Under a finger the segments leave the change to this motion: no CSS
  // transition runs a second, main-thread version of it.
  for (const value of ['grid', 'list', 'table']) {
    await expect(control.segment(value)).toHaveCSS(
      'transition-property',
      'none',
    );
  }
  const before = await control.boxes();
  const from = boxOf(before, 'grid');
  const to = boxOf(before, 'table');
  await control.tapSegment('table');
  // The value commits at the lift, as UISegmentedControl's valueChanged does.
  await expect(control.segment('table')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await waitForAnimation(control.proxy);
  const held = await holdAnimations(page, control.proxy);
  expect(held.map(a => a.easing)).toEqual(['linear', 'linear']);
  const times = timeline(700);
  const samples = await sampleProxy(control.proxy, times);
  await releaseAnimations(page);
  expect(samples.every(s => s.visible)).toBe(true);
  const expectedX = (t: number) =>
    from.x + (to.x - from.x) * springStep(SLIDE, t);
  const expectedWidth = (t: number) =>
    from.width + (to.width - from.width) * springStep(SLIDE, t);
  const x = compareCurve(
    samples.map(s => ({t: s.t, value: s.x})),
    expectedX,
    0.25,
  );
  const width = compareCurve(
    samples.map(s => ({t: s.t, value: s.width})),
    expectedWidth,
    0.25,
  );
  await writeEvidence(
    'curves/segmented-slide',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {from, to, held, samples, x, width},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(x.maxError, JSON.stringify(x.worst)).toBeLessThanOrEqual(0.25);
  expect(width.maxError, JSON.stringify(width.worst)).toBeLessThanOrEqual(0.25);
  // UIKit overshoots by about 0.6 % of the move, then settles back.
  const peak = Math.max(...samples.map(s => s.x));
  expect(peak - to.x).toBeGreaterThan(0.003 * (to.x - from.x));
  expect(peak - to.x).toBeLessThan(0.01 * (to.x - from.x));
});

test('the surface lands exactly where the segment paints it', async ({
  page,
}) => {
  const control = await openControl(page);
  // Gate timers: the hand-back runs from the slide's completion timer, which
  // must wait while the landed frame is photographed.
  await installTimerGate(page);
  await control.tapSegment('list');
  await waitForAnimation(control.proxy);
  await freezeTimers(page);
  // Every animation in the control, the title cross-fades included, at its
  // last presented frame.
  await holdAnimations(page, control.group);
  await seekAnimations(page, Infinity);
  // The last frame of the slide: the proxy carries the surface, the segment's
  // own is hidden.
  const landed = await control.group.screenshot({animations: 'allow'});
  expect(
    await control.segment('list').evaluate(el => el.style.backgroundColor),
  ).toBe('transparent');
  await releaseAnimations(page, {finish: true});
  await thawTimers(page);
  await expect(control.proxy).toHaveCSS('visibility', 'hidden');
  expect(
    await control.segment('list').evaluate(el => el.getAttribute('style')),
  ).toBeFalsy();
  const rest = await control.group.screenshot({animations: 'allow'});
  const a = PNG.sync.read(landed);
  const b = PNG.sync.read(rest);
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  const differing = pixelmatch(a.data, b.data, undefined, a.width, a.height, {
    threshold: 0.05,
  });
  // The hand-back is invisible: the same pixels before and after it.
  expect(differing).toBeLessThanOrEqual(Math.ceil(a.width * a.height * 0.001));
});

test('the titles cross-fade over 200 ms on Core Animation’s default curve', async ({
  page,
}) => {
  const control = await openControl(page);
  await control.tapSegment('table');
  const title = control.segment('table').locator('[data-segment-title="text"]');
  const twin = control.segment('table').locator('[data-segment-title="twin"]');
  await waitForAnimation(title);
  const held = await holdAnimations(page, control.group);
  // The two titles that change rendering, each with its twin (the slide's
  // own animations are on translate and scale).
  const fades = held.filter(a => a.keyframes.some(k => 'opacity' in k));
  expect(fades.length).toBe(4);
  for (const fade of fades) {
    expect(fade.durationMs).toBe(TITLE_FADE_MS);
    // CSS defines `ease` as exactly this curve; WebKit serializes it by name.
    expect(['cubic-bezier(0.25, 0.1, 0.25, 1)', 'ease']).toContain(fade.easing);
  }
  const read = async () =>
    Promise.all([
      title.evaluate(el => Number(getComputedStyle(el).opacity)),
      twin.evaluate(el => Number(getComputedStyle(el).opacity)),
    ]);
  for (const t of [0, 40, 100, 160, 199]) {
    await seekAnimations(page, t);
    const [titleOpacity, twinOpacity] = await read();
    const p = TITLE_EASE(t / TITLE_FADE_MS);
    expect(titleOpacity).toBeCloseTo(p, 2);
    expect(twinOpacity).toBeCloseTo(1 - p, 2);
  }
  await releaseAnimations(page, {finish: true});
  // After the fade the twin is a hidden sizer again.
  await expect(twin).toHaveCSS('visibility', 'hidden');
});

test('a second tap mid-flight retargets from what is on screen, keeping its velocity', async ({
  page,
}) => {
  const control = await openControl(page);
  await control.tapSegment('table');
  await waitForAnimation(control.proxy, {minProgressMs: 60});
  const describe = async () =>
    control.proxy.evaluate(async element => {
      const animations = element.getAnimations().filter(a => {
        const keyframes = (a.effect as KeyframeEffect).getKeyframes();
        return 'translate' in (keyframes[0] ?? {});
      });
      // A call starts when the browser commits it: wait for its start time.
      await Promise.all(animations.map(async a => a.ready));
      return animations.map(a => ({
        startTime: a.startTime as number,
        duration: Number(a.effect?.getComputedTiming().duration),
        keyframes: (a.effect as KeyframeEffect).getKeyframes().map(k => ({
          offset: k.computedOffset,
          x: parseFloat(String(k.translate)),
        })),
      }))[0];
    });
  const first = await describe();
  await control.tapSegment('list');
  await expect(control.segment('list')).toHaveAttribute('aria-checked', 'true');
  const second = await describe();
  expect(second.startTime).toBeGreaterThan(first.startTime);
  // The first curve, read where the second one starts.
  const at = (
    curve: typeof first,
    time: number,
  ): {value: number; slope: number} => {
    const offset = (time - curve.startTime) / curve.duration;
    const k = curve.keyframes;
    for (let i = 0; i + 1 < k.length; i++) {
      if (offset <= k[i + 1].offset) {
        const span = k[i + 1].offset - k[i].offset;
        const f = span === 0 ? 0 : (offset - k[i].offset) / span;
        return {
          value: k[i].x + (k[i + 1].x - k[i].x) * f,
          slope:
            span === 0 ? 0 : (k[i + 1].x - k[i].x) / (span * curve.duration),
        };
      }
    }
    return {value: k[k.length - 1].x, slope: 0};
  };
  const old = at(first, second.startTime);
  const fresh = at(second, second.startTime + 0.001);
  // No jump at the retarget: at most the travel of 2 ms (the animator's clock
  // and the document timeline can disagree by a fraction of a frame).
  expect(Math.abs(fresh.value - old.value)).toBeLessThan(
    Math.max(0.5, Math.abs(old.slope) * 2),
  );
  // ...and the velocity carries over (px/ms, within 10 %).
  expect(Math.abs(fresh.slope - old.slope)).toBeLessThan(
    Math.abs(old.slope) * 0.1 + 0.02,
  );
  // It lands on the second segment.
  const boxes = await control.boxes();
  const list = boxOf(boxes, 'list');
  expect(second.keyframes.at(-1)?.x).toBeCloseTo(list.x, 1);
});

test('a change mid-flight paints no press over the lens on the segment it leaves', async ({
  page,
}) => {
  const control = await openControl(page);
  await control.tapSegment('table');
  // The app changes the selection while the lens is still on its way and the
  // tap on Table is still fading (a second touch would end that fade itself).
  const paint = await control.group.evaluate(async group => {
    const segment = (value: string): HTMLElement => {
      const element = group.querySelector<HTMLElement>(
        `[data-value="${value}"]`,
      );
      if (element == null) {
        throw new Error(`no segment ${value}`);
      }
      return element;
    };
    const proxy = group.querySelector<HTMLElement>('[data-selection-proxy]');
    if (proxy == null) {
      throw new Error('no selection proxy');
    }
    segment('list').click();
    // The layout effect that retargets has run once the frame is drawn.
    await new Promise(resolve => requestAnimationFrame(resolve));
    const table = segment('table');
    const style = getComputedStyle(table);
    return {
      press: table.getAttribute('data-astryx-press'),
      image: style.backgroundImage,
      color: style.backgroundColor,
      lensVisible: getComputedStyle(proxy).visibility === 'visible',
    };
  });
  await expect(control.segment('list')).toHaveAttribute('aria-checked', 'true');
  expect(paint.press, 'the tap on Table is still fading').not.toBeNull();
  expect(paint.lensVisible).toBe(true);
  // Table paints nothing of its own until the lens lands: its press would
  // cover the lens, which sits under the segments' backgrounds.
  expect(paint.image).toBe('none');
  expect(paint.color).toBe('rgba(0, 0, 0, 0)');
  // Once the lens lands, Table gets its own styles back.
  await expect(control.proxy).toHaveCSS('visibility', 'hidden', {
    timeout: 3000,
  });
  await expect
    .poll(async () =>
      control.segment('table').evaluate(element => element.style.cssText),
    )
    .toBe('');
});

test('an arrow key and a programmatic change slide the selection too', async ({
  page,
}) => {
  const control = await openControl(
    page,
    'core-segmentedcontrol--selection-motion',
    'Period',
  );
  // An arrow key on the focused segment: selection follows focus.
  await control.segment('day').focus();
  await page.keyboard.press('ArrowRight');
  await expect(control.segment('week')).toHaveAttribute('aria-checked', 'true');
  const [keyed] = await waitForAnimation(control.proxy);
  expect(keyed.easing).toBe('linear');
  await releaseAnimations(page, {finish: true});
  // A change made by the app (the button sets the value from outside).
  const button = page.getByRole('button', {name: 'Next period'});
  const box = await button.boundingBox();
  if (box == null) {
    throw new Error('no button');
  }
  await control.driver.tap({
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  });
  await expect(control.segment('month')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  const animations = await waitForAnimation(control.proxy);
  expect(animations.length).toBeGreaterThan(0);
});

test('Reduce Motion (design:reduced-motion): no travel or scale; the old surface fades out where it is as the new one fades in, opacity only, in 200 ms or less; the titles cross-fade on the same clock', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const control = await openControl(page);
  const boxes = await control.boxes();
  const {samples, titleFades} = await sampleReducedMotionChange(page, control);
  const grid = boxOf(boxes, 'grid');
  const table = boxOf(boxes, 'table');
  // Over in 200 ms or less (DR2), and the titles fade on that clock.
  const fadeEnd = fadeEndOf(samples);
  expect(fadeEnd).toBeGreaterThan(0);
  expect(fadeEnd).toBeLessThanOrEqual(RM_MAX_FADE_MS);
  expect(samples[samples.length - 1].entering?.opacity).toBe(1);
  expect(titleFades.length).toBeGreaterThan(0);
  for (const duration of titleFades) {
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThanOrEqual(RM_MAX_FADE_MS);
  }
  for (const {t, entering, leaving} of samples) {
    const label = JSON.stringify({t, entering, leaving});
    expect(entering, label).not.toBeNull();
    // The new surface: at Table from the first frame, full size; only its
    // opacity changes (DR1).
    expect(Math.abs((entering?.x ?? 0) - table.x), label).toBeLessThan(0.5);
    expect(Math.abs((entering?.width ?? 0) - table.width), label).toBeLessThan(
      0.5,
    );
    expect(entering?.sx, label).toBe(1);
    expect(entering?.sy, label).toBe(1);
    // The old surface, while it shows: at Grid, full size.
    if (leaving != null && leaving.opacity > 0.001) {
      expect(Math.abs(leaving.x - grid.x), label).toBeLessThan(0.5);
      expect(Math.abs(leaving.width - grid.width), label).toBeLessThan(0.5);
      expect(leaving.sx, label).toBe(1);
      // One surface's worth of paint between the two.
      expect(
        Math.abs((entering?.opacity ?? 0) + leaving.opacity - 1),
        label,
      ).toBeLessThan(0.02);
    }
  }
  expect(samples[0].leaving?.opacity ?? 0).toBeGreaterThan(0.9);
  expect(samples[0].entering?.opacity ?? 1).toBeLessThan(0.1);
  // Then the segment paints its own surface again, and the copy is gone.
  await expect(control.proxy).toHaveCSS('visibility', 'hidden', {
    timeout: 3000,
  });
  await expect(control.group.locator('[data-selection-leaving]')).toHaveCount(
    0,
  );
  await expect(control.segment('table')).not.toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
});

test('Reduce Motion: a theme cannot lengthen the fade, the title cross-fade or bring back travel (design:reduced-motion DR4)', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const control = await openControl(page);
  await page.evaluate(() => {
    const root = document.documentElement.style;
    root.setProperty('--motion-segmented-control-label-cross-fade-ms', '600ms');
    root.setProperty('--motion-segmented-control-selection-spring', '1.2s 0.4');
  });
  const {samples, titleFades} = await sampleReducedMotionChange(page, control);
  const fadeEnd = fadeEndOf(samples);
  expect(fadeEnd).toBeGreaterThan(0);
  expect(fadeEnd).toBeLessThanOrEqual(RM_MAX_FADE_MS);
  // No visible surface ever moves, scales or resizes.
  const first = samples[0];
  for (const {t, entering, leaving} of samples) {
    const label = JSON.stringify({t, entering, leaving});
    expect(entering?.x, label).toBe(first.entering?.x);
    expect(entering?.width, label).toBe(first.entering?.width);
    expect(entering?.sx, label).toBe(1);
    if (leaving != null && leaving.opacity > 0.001) {
      expect(leaving.x, label).toBe(first.leaving?.x);
      expect(leaving.sx, label).toBe(1);
    }
  }
  expect(titleFades.length).toBeGreaterThan(0);
  for (const duration of titleFades) {
    expect(duration).toBeLessThanOrEqual(RM_MAX_FADE_MS);
  }
});

interface SurfaceSample {
  opacity: number;
  sx: number;
  sy: number;
  x: number;
  width: number;
}

/**
 * Taps Table under Reduced Motion with the lens's animations held from
 * their birth, and reads both surfaces (the proxy fading in, the copy fading
 * out) every 8 ms of their animations, and the title fades' durations.
 */
async function sampleReducedMotionChange(
  page: Page,
  control: Control,
): Promise<{
  samples: {
    t: number;
    entering: SurfaceSample | null;
    leaving: SurfaceSample | null;
  }[];
  titleFades: number[];
}> {
  await installTimerGate(page);
  await holdLensAnimationsAtBirth(page);
  await control.tapSegment('table');
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          (window as unknown as {__harnessHeld: Animation[]}).__harnessHeld
            .length,
      ),
    )
    .toBeGreaterThan(1);
  await freezeTimers(page);
  await page.evaluate(() => {
    (window as unknown as {__restoreAnimate: () => void}).__restoreAnimate();
  });
  const samples = await control.group.evaluate(group => {
    const held = (window as unknown as {__harnessHeld: Animation[]})
      .__harnessHeld;
    const read = (selector: string) => {
      const element = group.querySelector<HTMLElement>(selector);
      if (element == null) {
        return null;
      }
      const style = getComputedStyle(element);
      const [sx, sy = sx] =
        style.scale === 'none' ? [1, 1] : style.scale.split(' ').map(Number);
      return {
        opacity: style.visibility === 'visible' ? Number(style.opacity) : 0,
        sx,
        sy,
        x: style.translate === 'none' ? 0 : parseFloat(style.translate),
        width: parseFloat(style.width),
      };
    };
    const out = [];
    for (let t = 0; t <= 1000; t += 8) {
      for (const animation of held) {
        const animationEnd = Number(
          animation.effect?.getComputedTiming().endTime ?? 0,
        );
        animation.currentTime = Math.min(t, Math.max(0, animationEnd - 0.5));
      }
      out.push({
        t,
        entering: read('[data-selection-proxy]'),
        leaving: read('[data-selection-leaving]'),
      });
    }
    return out;
  });
  const titleFades = await control.group.evaluate(group =>
    [...group.querySelectorAll('[data-segment-title]')].flatMap(element =>
      element
        .getAnimations()
        .map(a => Number(a.effect?.getComputedTiming().duration)),
    ),
  );
  await releaseAnimations(page);
  await thawTimers(page);
  return {samples, titleFades};
}

/** The last sampled time either surface's opacity is still on its way. */
function fadeEndOf(
  samples: {
    t: number;
    entering: SurfaceSample | null;
    leaving: SurfaceSample | null;
  }[],
): number {
  const last = samples[samples.length - 1];
  return Math.max(
    0,
    ...samples
      .filter(
        ({entering, leaving}) =>
          Math.abs((entering?.opacity ?? 0) - (last.entering?.opacity ?? 0)) >
            0.002 ||
          Math.abs((leaving?.opacity ?? 0) - (last.leaving?.opacity ?? 0)) >
            0.002,
      )
      .map(({t}) => t),
  );
}

/**
 * Pauses every animation started on the lens (the proxy and anything inside
 * it) the moment it is created, into the harness's held set;
 * `__restoreAnimate` puts `Element.animate` back.
 */
async function holdLensAnimationsAtBirth(page: Page): Promise<void> {
  await page.evaluate(() => {
    const original = Element.prototype.animate;
    const held: Animation[] = [];
    const w = window as unknown as {
      __harnessHeld: Animation[];
      __restoreAnimate: () => void;
    };
    w.__harnessHeld = held;
    w.__restoreAnimate = () => {
      Element.prototype.animate = original;
    };
    Element.prototype.animate = function (
      this: Element,
      ...args: Parameters<Element['animate']>
    ): Animation {
      const animation = original.apply(this, args);
      if (
        this.closest('[data-selection-proxy], [data-selection-leaving]') != null
      ) {
        animation.pause();
        held.push(animation);
      }
      return animation;
    };
  });
}

test('Android and other non-iOS touch screens keep today’s presentation: no slide, the tap selects', async ({
  page,
}) => {
  const control = await openControl(page, undefined, undefined, {
    idiom: 'default',
  });
  // No proxy, and the segments keep the theme's color transition.
  await expect(control.proxy).toHaveCount(0);
  await expect(control.segment('list')).toHaveCSS(
    'transition-property',
    'color, background-color, box-shadow',
  );
  await control.tapSegment('table');
  await expect(control.segment('table')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(control.proxy).toHaveCount(0);
});

test('Android with Reduce Motion keeps today’s values', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const control = await openControl(page, undefined, undefined, {
    idiom: 'default',
  });
  await expect(control.proxy).toHaveCount(0);
  // The segment's transition is the theme's duration token, as on main,
  // whatever Reduce Motion makes of it.
  const [duration, token] = await control.segment('list').evaluate(element => {
    const style = getComputedStyle(element);
    const probe = document.createElement('div');
    probe.style.transitionDuration = 'var(--duration-fast)';
    element.append(probe);
    const expected = getComputedStyle(probe).transitionDuration;
    probe.remove();
    return [style.transitionDuration, expected];
  });
  expect(duration).toBe(token);
  await control.tapSegment('table');
  await expect(control.segment('table')).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('a theme retunes the slide through its motion role', async ({page}) => {
  const control = await openControl(page);
  // A theme sets the role's variable on its scope (here the root):
  // critically damped, 0.25 s.
  await page.evaluate(() => {
    document.documentElement.style.setProperty(
      '--motion-segmented-control-selection-spring',
      '0.25s 0',
    );
  });
  const before = await control.boxes();
  const from = boxOf(before, 'grid');
  const to = boxOf(before, 'table');
  await control.tapSegment('table');
  await waitForAnimation(control.proxy);
  await holdAnimations(page, control.proxy);
  const samples = await sampleProxy(control.proxy, timeline(400));
  await releaseAnimations(page);
  const retuned = {response: 0.25, dampingFraction: 1} as const;
  const fit = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.x})),
    t => from.x + (to.x - from.x) * springStep(retuned, t),
    0.25,
  );
  expect(fit.maxError, JSON.stringify(fit.worst)).toBeLessThanOrEqual(0.25);
  // ...not UIKit's default spring.
  const uikit = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.x})),
    t => from.x + (to.x - from.x) * springStep(SLIDE, t),
    0.25,
  );
  expect(uikit.maxError).toBeGreaterThan(5);
});

test('RTL: the surface slides toward the tapped segment', async ({page}) => {
  const control = await openControl(
    page,
    'core-segmentedcontrol--default',
    'View mode',
    {direction: 'rtl'},
  );
  const boxes = await control.boxes();
  const grid = boxOf(boxes, 'grid');
  const table = boxOf(boxes, 'table');
  // The first segment is on the right in RTL.
  expect(grid.x).toBeGreaterThan(table.x);
  await control.tapSegment('table');
  await waitForAnimation(control.proxy);
  await holdAnimations(page, control.proxy);
  const [start, end] = await sampleProxy(control.proxy, [0, 2000]);
  expect(start.x).toBeCloseTo(grid.x, 1);
  expect(end.x).toBeCloseTo(table.x, 1);
  // On screen, not only in the numbers: held at its last frame, the proxy
  // covers the tapped segment exactly.
  const [proxyBox, tableBox] = await Promise.all([
    control.proxy.boundingBox(),
    control.segment('table').boundingBox(),
  ]);
  await releaseAnimations(page);
  expect(proxyBox).not.toBeNull();
  expect(tableBox).not.toBeNull();
  for (const key of ['x', 'y', 'width', 'height'] as const) {
    expect(
      Math.abs((proxyBox?.[key] ?? NaN) - (tableBox?.[key] ?? NaN)),
    ).toBeLessThan(0.5);
  }
});

test('the slide keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const control = await openControl(page);
  await markElement(control.proxy);
  const cast = await startScreencast(page);
  await control.tapSegment('table');
  // Running and composited before the block.
  const [slide] = await waitForAnimation(control.proxy, {minProgressMs: 16});
  const block = await blockMainThread(page, 500);
  await page.waitForTimeout(250);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, slide.to)},
    {axis: 'x', settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/segmented-slide',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          slide,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            x: f.box?.x ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'segmented-slide-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, slide.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, slide});
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
});

test('the slide does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await openControl(page, 'core-segmentedcontrol--selection-motion', 'Period');
  // A change the app makes (a DOM click on the story's button): the same
  // slide, with no touch press model, focus ring or keyboard hint beside it.
  const next = page.getByRole('button', {name: 'Next period'});
  // The story's two controls share the value, so both slide; each lands (and
  // hands its surface back) on its own clock.
  const proxies = page.locator('[data-selection-proxy]');
  await expect(proxies).toHaveCount(2);
  const handBacks = await recordHandBacks(page);
  let start = 0;
  const started = Date.now();
  const trace = await traceRendering(page, async () => {
    await next.evaluate(button => (button as HTMLButtonElement).click());
    const slides = await Promise.all(
      [0, 1].map(async i => (await waitForAnimation(proxies.nth(i)))[0]),
    );
    start = Math.max(...slides.map(slide => slide.from));
    // Wait in the test runner, not in the page: polling the page would force
    // style and layout work of its own into the window being measured.
    await new Promise(resolve => setTimeout(resolve, 1500));
  });
  const landed = await handBacks();
  expect(landed).toHaveLength(2);
  // The steady part of the slides: their first frame commits the selection
  // and the first hand-back ends it.
  const during = countBetween(trace, start + 50, Math.min(...landed) - 50);
  expect(Math.min(...landed) - start).toBeGreaterThan(500);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  expect(trace.longTasks).toEqual([]);
  expect(await readLongTasks(page, {from: started, to: Date.now()})).toEqual(
    [],
  );
});

test('assistive technology sees the same radios: the proxy and title twins are hidden', async ({
  page,
}) => {
  const control = await openControl(page);
  await control.tapSegment('list');
  await expect(control.group).toMatchAriaSnapshot(`
    - radiogroup "View mode":
      - radio "Grid"
      - radio "List" [checked]
      - radio "Table"
  `);
  await expect(control.proxy).toHaveAttribute('aria-hidden', 'true');
});

test(
  'storyboard: tap to slide, and a second tap mid-flight',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const control = await openControl(page);
    await installTimerGate(page);
    const measure = async () => {
      const [sample] = await control.proxy.evaluate(element => {
        const style = getComputedStyle(element);
        return [
          {
            x: style.translate === 'none' ? 0 : parseFloat(style.translate),
            scaleX: style.scale === 'none' ? 1 : parseFloat(style.scale),
            visible: style.visibility === 'visible',
          },
        ];
      });
      return sample;
    };
    await control.tapSegment('table');
    await waitForAnimation(control.proxy);
    await freezeTimers(page);
    const {storyboard: slideBoard} = await animationStoryboard(page, {
      name: 'segmented-tap-slide',
      times: timeline(700),
      clip: control.group,
      scope: control.group,
      measure,
      columns: 8,
      cellScale: 1,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await slideBoard.write(testInfo);
    const xs = slideBoard.frames.map(f => f.data.x as number);
    const boxes = await control.boxes();
    const table = boxOf(boxes, 'table');
    // Rises to the destination, overshoots a little, settles on it.
    expect(xs.at(-1)).toBeCloseTo(table.x, 0);
    expect(Math.max(...xs)).toBeGreaterThan(table.x);
    expect(Math.max(...xs) - table.x).toBeLessThan(2);

    // A second tap 80 ms into a slide back to the first segment.
    await control.tapSegment('grid');
    await waitForAnimation(control.proxy, {minProgressMs: 80});
    await control.tapSegment('list');
    await waitForAnimation(control.proxy);
    await freezeTimers(page);
    const {storyboard: retargetBoard} = await animationStoryboard(page, {
      name: 'segmented-retarget',
      times: timeline(700),
      clip: control.group,
      scope: control.group,
      measure,
      columns: 8,
      cellScale: 1,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await retargetBoard.write(testInfo);
    const retargetXs = retargetBoard.frames.map(f => f.data.x as number);
    const list = boxOf(boxes, 'list');
    expect(retargetXs.at(-1)).toBeCloseTo(list.x, 0);
    // Continuous: no frame-to-frame jump larger than the fastest frame of a
    // fresh slide would make.
    for (let i = 1; i < retargetXs.length; i++) {
      expect(Math.abs(retargetXs[i] - retargetXs[i - 1])).toBeLessThan(25);
    }
  },
);

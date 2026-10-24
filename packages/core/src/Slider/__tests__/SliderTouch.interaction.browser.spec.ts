// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SliderTouch.interaction.browser.spec.ts
 * @input The built Slider stories ("Default", "Touch tracking", "In a
 *   scrolling list"), real touch input (Chromium CDP / WebKit's input
 *   command) and the interaction harness
 * @output Interaction and animation proofs for Slider's touch presentation
 *   (UISlider's tracking): a tap on the track sets the value on its lift
 *   (the thumb springs there; WCAG 2.5.7, a departure from UISlider), the thumb's
 *   48 px touch target takes a finger beside it and the thumb lifts 1.55×;
 *   the value follows the finger's travel past the 10 px threshold over the
 *   track's length; past an end the value waits for the finger to come back;
 *   a release coasts on UIKit's spring to 0.4 of the momentum projection
 *   (final value and presented curve against an independent spring), a slow
 *   release does not coast, a drag that rests before the lift still coasts
 *   on its last velocity, under Reduce Motion no lift and a release or tap
 *   cross-fades (design:reduced-motion), a
 *   finger landing on a coasting thumb stops it where it is, a held thumb
 *   selects no text, and a finger lifted outside stays at the lift value;
 *   `onChangeEnd`
 *   reports after the coast; coincident range thumbs; a vertical swipe from
 *   a thumb scrolls a list; RTL; the coast keeps moving through a blocked
 *   main thread (with its storyboard); no Layout per drag move and no Layout
 *   or Paint per coast frame.
 * @position Browser layer of Slider's touch presentation (useSliderTouch.ts);
 *   the unit layers are useSliderTouch.test.tsx and
 *   motion/uikit/slider.test.ts.
 *
 * The oracles come from the harness (`springStep`) and plain arithmetic fed
 * the UIKit constants (motion/uikit/slider.ts, measured on UISlider, iOS 26.2
 * simulator): the value moves by the pan's translation ÷ the track length;
 * the coast is a critically damped spring of response 0.4 s that starts with
 * the release velocity and ends at the lift value + 0.4 × v × 0.996 ÷ 0.004
 * ÷ 1000 (px of finger travel).
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  drag,
  flick,
  frames,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  springStep,
  startScreencast,
  tap,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForRest,
  withStorybook,
  writeEvidence,
  type Point,
  type TouchDriver,
  type TouchScript,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** UISlider, from the constants table (motion/uikit/slider.ts). */
const UISLIDER = {
  hysteresis: 10,
  hitTarget: 48,
  liftScale: 1.55,
  lift: {response: 0.215, dampingFraction: 0.6},
  release: {response: 0.4, dampingFraction: 1},
  projectionRate: 0.996,
  projectionShare: 0.4,
} as const;
/** Slider's thumb, px: its travel is the track minus one thumb. */
const THUMB = 20;

interface Opened {
  driver: TouchDriver;
  thumb: Locator;
  control: Locator;
  /** The thumb's center, client px. */
  center: () => Promise<Point>;
  value: () => Promise<number>;
  /** The control's layout length along the travel, px. */
  length: number;
}

/**
 * Makes the engine take the iOS gate (C07's emulation, installed before the
 * first script runs): `CSS.supports` answers yes for `-webkit-touch-callout`,
 * which only WebKit on iOS implements and which the touch presentation
 * resolver reads at its first render. Its rules come with
 * `rewriteIosSupportsRules`. Real iOS evidence is the simulator's.
 */
async function emulateIosWebKit(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = CSS.supports.bind(CSS);
    CSS.supports = (condition: string, value?: string) =>
      `${condition}${value ?? ''}`.includes('-webkit-touch-callout') ||
      (value === undefined ? original(condition) : original(condition, value));
  });
}

/**
 * Every `@supports (-webkit-touch-callout: none)` rule, rewritten to a
 * condition the engine meets, keeping the touch query inside it.
 */
async function rewriteIosSupportsRules(page: Page): Promise<void> {
  await page.evaluate(() => {
    const visit = (owner: CSSStyleSheet | CSSGroupingRule) => {
      const rules = owner.cssRules;
      for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];
        if (
          rule instanceof CSSSupportsRule &&
          rule.conditionText.includes('-webkit-touch-callout')
        ) {
          const inner = Array.from(rule.cssRules, r => r.cssText).join('\n');
          owner.deleteRule(i);
          owner.insertRule(`@supports (display: block) {${inner}}`, i);
        } else if (rule instanceof CSSGroupingRule) {
          visit(rule);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        visit(sheet);
      } catch {
        // a cross-origin sheet
      }
    }
  });
}

async function openSlider(
  page: Page,
  storyId: string,
  {
    name,
    args,
    direction,
    idiom = 'ios',
  }: {
    name?: string;
    args?: Readonly<Record<string, string>>;
    direction?: 'rtl';
    /** The engine's idiom: iOS (emulated) or another touch screen, Android's. */
    idiom?: 'ios' | 'android';
  } = {},
): Promise<Opened> {
  if (idiom === 'ios') {
    await emulateIosWebKit(page);
  }
  if (direction == null) {
    await openStory(page, storybook(), storyId, args);
  } else {
    await page.goto(
      `${storybook()}/iframe.html?id=${storyId}&viewMode=story&globals=direction:${direction}`,
    );
    await page.locator('#storybook-root > *').first().waitFor();
    await frames(page, 2);
  }
  if (idiom === 'ios') {
    await rewriteIosSupportsRules(page);
  }
  const driver = await touchDriver(page);
  const thumb =
    name == null
      ? page.getByRole('slider').first()
      : page.getByRole('slider', {name});
  await expect(thumb).toBeVisible();
  // The touch presentation renders the touch targets after hydration, on
  // iOS only.
  await expect(thumb.locator('[data-slider-hit]')).toHaveCount(
    idiom === 'ios' ? 1 : 0,
  );
  const control = thumb.locator(
    'xpath=ancestor::*[contains(@class, "astryx-slider-control")][1]',
  );
  const length = await control.evaluate(element =>
    parseFloat(getComputedStyle(element).width),
  );
  const center = async () => {
    const box = await thumb.boundingBox();
    if (box == null) {
      throw new Error('no thumb box');
    }
    return {x: box.x + box.width / 2, y: box.y + box.height / 2};
  };
  const value = async () => Number(await thumb.getAttribute('aria-valuenow'));
  return {driver, thumb, control, center, value, length};
}

interface Leg {
  /** Where the finger goes. */
  readonly to: Point;
  readonly durationMs: number;
  /** Rest after the leg (no events), ms. */
  readonly restMs?: number;
}

/**
 * One finger: press at `from`, move through `legs` at `hz`, lift. Returns
 * the script and the event index of each leg's last move (every frame
 * moves, so event indices follow frame indices; the press is event 0).
 */
function legs(
  from: Point,
  path: ReadonlyArray<Leg>,
  {hz = 60, liftAfterMs = 4}: {hz?: number; liftAfterMs?: number} = {},
): {script: TouchScript; ends: number[]} {
  const moves: {t: number; fingers: {id: number; x: number; y: number}[]}[] = [
    {t: 0, fingers: [{id: 0, ...from}]},
  ];
  const ends: number[] = [];
  let t = 0;
  let at = from;
  for (const leg of path) {
    const steps = Math.max(1, Math.round((leg.durationMs * hz) / 1000));
    for (let i = 1; i <= steps; i++) {
      moves.push({
        t: t + (leg.durationMs * i) / steps,
        fingers: [
          {
            id: 0,
            x: at.x + ((leg.to.x - at.x) * i) / steps,
            y: at.y + ((leg.to.y - at.y) * i) / steps,
          },
        ],
      });
    }
    ends.push(moves.length - 1);
    t += leg.durationMs + (leg.restMs ?? 0);
    at = leg.to;
  }
  moves.push({t: t + liftAfterMs, fingers: []});
  return {script: moves, ends};
}

/** Plays `script`, reading `read()` two frames after each event in `at`. */
async function playReading<T>(
  page: Page,
  driver: TouchDriver,
  script: TouchScript,
  at: ReadonlyArray<number>,
  read: () => Promise<T>,
): Promise<T[]> {
  const readings: T[] = [];
  await driver.play(script, {
    onEvent: async (_step, index) => {
      if (at.includes(index)) {
        await frames(page, 2);
        readings.push(await read());
      }
    },
  });
  return readings;
}

/** WWDC18's projection, px of finger travel. */
function project(velocity: number): number {
  return (
    ((velocity / 1000) * UISLIDER.projectionRate) /
    (1 - UISLIDER.projectionRate)
  );
}

/** The value UISlider reports for `travel` px of finger past touch-down. */
function trackedValue(
  start: number,
  travel: number,
  length: number,
  range = 100,
): number {
  const translation = Math.max(0, Math.abs(travel) - UISLIDER.hysteresis);
  return start + (Math.sign(travel) * translation * range) / length;
}

test('a tap on the track sets the value when it lifts and the thumb springs there; the thumb takes a finger through a target larger than it', async ({
  page,
}) => {
  const {driver, thumb, center, value, length} = await openSlider(
    page,
    'core-slider--default',
  );
  const start = await value();
  const at = await center();
  const hit = await thumb.locator('[data-slider-hit]').boundingBox();
  expect(hit?.width).toBeCloseTo(UISLIDER.hitTarget, 0);
  expect(hit?.height).toBeCloseTo(UISLIDER.hitTarget, 0);
  // 20 px beside the thumb's center, inside its 48 px touch target: the
  // thumb takes the finger and lifts, and a tap there changes nothing.
  const beside = {x: at.x + 20, y: at.y};
  const [scale] = await playReading(
    page,
    driver,
    tap(beside, {holdMs: 500}),
    [0],
    async () => {
      await page.waitForTimeout(400);
      return thumb.evaluate(element => getComputedStyle(element).scale);
    },
  );
  expect(Number(scale)).toBeCloseTo(UISLIDER.liftScale, 2);
  await frames(page, 4);
  expect(await value()).toBe(start);
  // Far on the track: nothing while the finger is down; on the lift the
  // value is the tap's and the thumb springs there (WCAG 2.5.7: a drag is
  // not the only pointer way; UISlider itself ignores the tap).
  const far = {x: at.x + length * 0.3, y: at.y};
  const [held] = await playReading(
    page,
    driver,
    tap(far, {holdMs: 300}),
    [0],
    async () => {
      await page.waitForTimeout(150);
      return value();
    },
  );
  expect(held).toBe(start);
  const box = await thumb
    .locator('xpath=ancestor::*[contains(@class, "astryx-slider-control")][1]')
    .boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const expected = Math.round(
    ((far.x - box.x - THUMB / 2) / (box.width - THUMB)) * 100,
  );
  // Mid-spring the thumb is on its way (a compositor animation), not there.
  await page.waitForTimeout(60);
  expect(
    await thumb.evaluate(element => element.getAnimations().length),
  ).toBeGreaterThan(0);
  await waitForRest(thumb);
  await frames(page, 4);
  expect(await value()).toBe(expected);
});

test('the value follows the pan’s travel over the track length, past the 10 px hysteresis', async ({
  page,
}, testInfo) => {
  const {driver, center, value, length} = await openSlider(
    page,
    'core-slider--default',
  );
  const start = await value();
  const at = await center();
  const travels = [6, 10, 30, 60, 90];
  let previous = 0;
  const path: Leg[] = travels.map(travel => {
    const leg = {
      to: {x: at.x + travel, y: at.y},
      durationMs: Math.max(17, (travel - previous) * 8),
      restMs: 120,
    };
    previous = travel;
    return leg;
  });
  const {script, ends} = legs(at, path);
  const values = await playReading(page, driver, script, ends, value);
  const readings = travels.map((travel, i) => ({
    travel,
    value: values[i],
    expected: Math.round(trackedValue(start, travel, length)),
  }));
  await page.waitForTimeout(800);
  await writeEvidence(
    'tracking/slider-pan-travel',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {length, readings},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const reading of readings) {
    expect(reading.value, JSON.stringify(reading)).toBe(reading.expected);
  }
});

test('past an end the value waits for the finger to come back', async ({
  page,
}) => {
  const {driver, center, value, length} = await openSlider(
    page,
    'core-slider--default',
  );
  const start = await value();
  const at = await center();
  // To the max end and 60 px past it, then 40 px back: still at the max.
  const toEnd = ((100 - start) / 100) * length + UISLIDER.hysteresis;
  const past = {x: at.x + toEnd + 60, y: at.y};
  const back = {x: past.x - 40, y: at.y};
  const {script, ends} = legs(at, [
    {to: past, durationMs: 500, restMs: 100},
    {to: back, durationMs: 300, restMs: 200},
  ]);
  const values = await playReading(page, driver, script, ends, value);
  expect(values).toEqual([100, 100]);
});

test('a release coasts on UIKit’s spring to 0.4 of the momentum projection, then onChangeEnd reports', async ({
  page,
}, testInfo) => {
  const {driver, thumb, center, value, length} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness'},
  );
  const at = await center();
  const velocity = 300;
  // A steady 300 px/s for 120 ms (36 px), lifted while moving.
  const script = flick(at, {velocity: {x: velocity, y: 0}, durationMs: 120});
  const lastMove = script.length - 2;
  const [liftValue] = await playReading(
    page,
    driver,
    script,
    [lastMove],
    value,
  );
  const [held] = await holdAnimations(page, thumb);
  expect(held, 'the coast plays on the compositor').toBeDefined();
  const times = Array.from({length: 31}, (_, i) => i * 20);
  const samples = await sampleCurve(thumb, times);
  await releaseAnimations(page);
  await waitForRest(thumb);
  await frames(page, 4);
  const range = 100;
  const travel = length - THUMB;
  const pxPerValue = travel / range;
  const finalValue = await value();
  // Chromium hands the page the scripted timestamps, so the release velocity
  // is exactly 300 px/s and the target follows. WebKit's injected touches
  // carry their real dispatch times: there the velocity is whatever the
  // page measured, and the proof is the coast's shape (the spring that
  // starts with the velocity its own projection implies).
  const exact = driver.scriptedTimestamps;
  const target = exact
    ? Math.round(
        liftValue +
          (UISLIDER.projectionShare * project(velocity) * range) / length,
      )
    : finalValue;
  const fromPx = samples[0].transform.translateX;
  const toPx = fromPx + (target - liftValue) * pxPerValue;
  // The finger velocity the target implies (inverse projection), in the
  // thumb's px per second: travel ÷ length of it.
  const impliedVelocity = exact
    ? velocity
    : ((target - liftValue) * length) /
      range /
      (UISLIDER.projectionShare * project(1));
  const v0 =
    toPx === fromPx
      ? 0
      : ((impliedVelocity / length) * range * pxPerValue) / (toPx - fromPx);
  const comparison = compareCurve(
    samples.map(sample => ({t: sample.t, value: sample.transform.translateX})),
    ms =>
      fromPx +
      (toPx - fromPx) *
        springStep(
          {
            response: UISLIDER.release.response,
            dampingFraction: 1,
            initialVelocity: v0,
          },
          ms,
        ),
    // Snapping the target to a whole value moves the end by up to half a
    // step (WebKit's implied velocity carries it).
    exact ? 0.75 : 1.75,
  );
  await writeEvidence(
    'curves/slider-coast',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          velocity,
          exact,
          impliedVelocity,
          length,
          liftValue,
          target,
          finalValue,
          comparison,
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(finalValue).toBe(target);
  expect(finalValue).toBeGreaterThan(liftValue);
  expect(
    comparison.maxError,
    JSON.stringify(comparison.worst),
  ).toBeLessThanOrEqual(exact ? 0.75 : 1.75);
  await expect(page.getByTestId('slider-change-end')).toHaveText(
    `Brightness ${target}`,
  );
  // Handed back: no inline translate left, the thumb where the CSS puts it.
  expect(await thumb.evaluate(element => element.style.translate)).toBe('');
});

test('the lifted thumb grows around its own center, as UISlider’s lens does', async ({
  page,
}) => {
  // UIKit's lens grows from 24 to 39 pt with its center fixed on the track
  // (b40). The thumb's centering must not scale with the lift.
  for (const {storyId, name, args} of [
    {storyId: 'core-slider--touch-tracking', name: 'Brightness', args: {}},
    {
      storyId: 'core-slider--vertical-orientation',
      name: undefined,
      args: {valueDisplay: 'none'},
    },
  ]) {
    const {driver, thumb, center} = await openSlider(page, storyId, {
      name,
      args,
    });
    const rest = await thumb.boundingBox();
    if (rest == null) {
      throw new Error('no thumb');
    }
    const at = await center();
    const box = async () => {
      const b = await thumb.boundingBox();
      if (b == null) {
        throw new Error('no thumb');
      }
      return b;
    };
    const [midLift, lifted] = await playReading(
      page,
      driver,
      tap(at, {holdMs: 700}),
      [0],
      async () => {
        await page.waitForTimeout(60);
        const mid = await box();
        await page.waitForTimeout(450);
        return [mid, await box()] as const;
      },
    ).then(readings => readings[0]);
    for (const [label, b] of [
      ['mid-lift', midLift],
      ['lifted', lifted],
    ] as const) {
      expect(
        b.width,
        `${storyId} ${label}: the thumb is lifted`,
      ).toBeGreaterThan(rest.width + 2);
      expect(
        Math.abs(b.x + b.width / 2 - (rest.x + rest.width / 2)),
        `${storyId} ${label}: x center`,
      ).toBeLessThanOrEqual(0.5);
      expect(
        Math.abs(b.y + b.height / 2 - (rest.y + rest.height / 2)),
        `${storyId} ${label}: y center`,
      ).toBeLessThanOrEqual(0.5);
    }
    await page.waitForTimeout(700);
  }
});

test('a slow release does not coast: the value stays where the finger left it', async ({
  page,
}) => {
  const {driver, thumb, center, value} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness'},
  );
  const at = await center();
  // Past the 10 px threshold, then the last moves at 6 px/s: the projection
  // (0.4 × 0.0996 s × 6 px/s, about 0.24 px) is under half a step.
  const quick = {x: at.x + 40, y: at.y};
  const {script, ends} = legs(
    at,
    [
      {to: quick, durationMs: 200},
      {to: {x: quick.x + 1.2, y: at.y}, durationMs: 200},
    ],
    {hz: 60},
  );
  const [atLift] = await playReading(page, driver, script, [ends[1]], value);
  await page.waitForTimeout(600);
  expect(await value()).toBe(atLift);
  // No coast ran: no translate animation, and the thumb is back on its CSS
  // position (the drop of its lift still runs on scale).
  expect(
    await thumb.evaluate(
      element =>
        element
          .getAnimations()
          .filter(animation =>
            (animation.effect as KeyframeEffect | null)
              ?.getKeyframes()
              .some(frame => 'translate' in frame),
          ).length,
    ),
  ).toBe(0);
  expect(await thumb.evaluate(element => element.style.translate)).toBe('');
  await expect(page.getByTestId('slider-change-end')).toHaveText(
    `Brightness ${atLift}`,
  );
});

test('a drag that rests before the lift still coasts on its last velocity, as UIKit does', async ({
  page,
}) => {
  const {driver, center, value, length} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness'},
  );
  test.skip(
    !driver.scriptedTimestamps,
    'the velocity filter needs the scripted timestamps (README: engine limits)',
  );
  const at = await center();
  // 60 px at 300 px/s, then 300 ms without a move: UIKit's pan velocity does
  // not decay while the finger rests (a 312 ms rest still coasted 12.56 pt).
  const {script, ends} = legs(
    at,
    [{to: {x: at.x + 60, y: at.y}, durationMs: 200, restMs: 300}],
    {hz: 60},
  );
  const [atLift] = await playReading(page, driver, script, [ends[0]], value);
  await page.waitForTimeout(900);
  const expected = Math.round(
    atLift + (UISLIDER.projectionShare * project(300) * 100) / length,
  );
  expect(expected).toBeGreaterThan(atLift);
  expect(await value()).toBe(expected);
});

test('Reduce Motion: no lift, and a release or a track tap cross-fades the thumb to its value within 200 ms (design:reduced-motion)', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, thumb, center} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness'},
  );
  /** The thumb's opacity, scale and value each frame for `ms` from now. */
  const watch = async (ms: number) =>
    thumb.evaluate(async (element, duration) => {
      const samples: {
        t: number;
        opacity: number;
        scale: number;
        value: number;
      }[] = [];
      const start = performance.now();
      while (performance.now() - start < duration) {
        await new Promise(requestAnimationFrame);
        const style = getComputedStyle(element);
        samples.push({
          t: performance.now() - start,
          opacity: Number(style.opacity),
          scale: style.scale === 'none' ? 1 : Number(style.scale),
          value: Number(element.getAttribute('aria-valuenow')),
        });
      }
      return samples;
    }, ms);
  type Sample = Awaited<ReturnType<typeof watch>>[number];
  /** Opacity only, back to 1 within 200 ms of the change, nothing scaled. */
  const expectCrossFade = (samples: ReadonlyArray<Sample>) => {
    expect(Math.min(...samples.map(sample => sample.opacity))).toBeLessThan(
      0.5,
    );
    expect(Math.max(...samples.map(sample => sample.scale))).toBe(1);
    const after = samples.filter(sample => sample.t > 220);
    expect(after.length).toBeGreaterThan(0);
    expect(after.every(sample => sample.opacity === 1)).toBe(true);
  };
  // A held thumb keeps its size: the press shows in its paint alone (DR1).
  const at = await center();
  const [held] = await playReading(
    page,
    driver,
    tap(at, {holdMs: 400}),
    [0],
    async () => watch(250),
  );
  expect(Math.max(...held.map(sample => sample.scale))).toBe(1);
  await frames(page, 6);
  // A flick's release: the thumb fades out and back in where the coast
  // would have taken it (the value moves on past the lift's), opacity only
  // (DR2).
  const from = await center();
  const script = flick(from, {velocity: {x: 400, y: 0}, durationMs: 100});
  const [release] = await playReading(
    page,
    driver,
    script,
    [script.length - 1],
    async () => watch(320),
  );
  expectCrossFade(release);
  expect(release[release.length - 1].value).toBeGreaterThan(release[0].value);
  await frames(page, 6);
  // A tap on the track: the same cross-fade, to the tap's value.
  const control = thumb.locator(
    'xpath=ancestor::*[contains(@class, "astryx-slider-control")][1]',
  );
  const box = await control.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const target = {x: box.x + box.width * 0.1, y: box.y + box.height / 2};
  const tapScript = tap(target);
  const [tapped] = await playReading(
    page,
    driver,
    tapScript,
    [tapScript.length - 1],
    async () => watch(320),
  );
  expectCrossFade(tapped);
  expect(tapped[tapped.length - 1].value).toBe(
    Math.round(((target.x - box.x - THUMB / 2) / (box.width - THUMB)) * 100),
  );
});

test('a finger landing on a coasting thumb stops it where it is', async ({
  page,
}) => {
  const {driver, thumb, center, value, length} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness'},
  );
  test.skip(
    !driver.scriptedTimestamps,
    'the coast target needs the scripted release velocity (README: engine limits)',
  );
  const at = await center();
  const velocity = 600;
  const script = flick(at, {velocity: {x: velocity, y: 0}, durationMs: 100});
  const [liftValue] = await playReading(
    page,
    driver,
    script,
    [script.length - 2],
    value,
  );
  const target = Math.round(
    liftValue + (UISLIDER.projectionShare * project(velocity) * 100) / length,
  );
  // At once, on the thumb where the coast presents it now.
  const box = await thumb.boundingBox();
  if (box == null) {
    throw new Error('no thumb');
  }
  await driver.play(
    tap({x: box.x + box.width / 2, y: box.y + box.height / 2}, {holdMs: 200}),
  );
  await page.waitForTimeout(700);
  const caught = await value();
  expect(caught).toBeGreaterThan(liftValue);
  expect(caught).toBeLessThan(target);
  // The interrupted coast reports where it stopped, then the catching touch
  // ends there too, and nothing moves on.
  await expect(page.getByTestId('slider-change-end')).toHaveText(
    `Brightness ${caught}, Brightness ${caught}`,
  );
  expect(await thumb.evaluate(element => element.style.translate)).toBe('');
});

test('a finger held on a thumb or on the track starts no selection: the gesture host locks it until the lift', async ({
  page,
}) => {
  const {driver, thumb, center} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness'},
  );
  const hit = thumb.locator('[data-slider-hit]');
  const control = thumb.locator(
    'xpath=ancestor::*[contains(@class, "astryx-slider-control")][1]',
  );
  // The lock is inline, on the element the finger holds (Safari reads the
  // prefixed forms; this engine keeps the standard one in the CSSOM).
  const lockOf = async (element: Locator) =>
    element.evaluate(node =>
      (node as HTMLElement).style.getPropertyValue('user-select'),
    );
  const at = await center();
  const [onThumb] = await playReading(
    page,
    driver,
    tap(at, {holdMs: 600}),
    [0],
    async () => {
      await page.waitForTimeout(300);
      return lockOf(hit);
    },
  );
  expect(onThumb).toBe('none');
  await frames(page, 4);
  expect(await lockOf(hit)).toBe('');
  const box = await control.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const onTrack = {x: box.x + box.width * 0.9, y: box.y + box.height / 2};
  const [held] = await playReading(
    page,
    driver,
    tap(onTrack, {holdMs: 600}),
    [0],
    async () => {
      await page.waitForTimeout(300);
      return lockOf(control);
    },
  );
  expect(held).toBe('none');
  await frames(page, 4);
  expect(await lockOf(control)).toBe('');
});

test('a finger lifted outside the tracking bounds coasts back to the lift value', async ({
  page,
}) => {
  const {driver, center, value} = await openSlider(
    page,
    'core-slider--default',
  );
  const at = await center();
  // Drag right 40 px, then 150 px up (outside the 70 px tracking margin),
  // and lift while moving right at 400 px/s.
  const right = {x: at.x + 40, y: at.y};
  const up = {x: right.x, y: at.y - 150};
  const out = {x: up.x + 20, y: up.y};
  const {script, ends} = legs(
    at,
    [
      {to: right, durationMs: 300},
      {to: up, durationMs: 300, restMs: 100},
      {to: out, durationMs: 50},
    ],
    {hz: 120},
  );
  const [atLift] = await playReading(page, driver, script, [ends[2]], value);
  await page.waitForTimeout(900);
  // Outside the tracking bounds the release does not project: the value
  // settles where the finger left it.
  expect(await value()).toBe(atLift);
});

test('coincident range thumbs: the first movement picks the thumb that can follow it', async ({
  page,
}) => {
  await emulateIosWebKit(page);
  await openStory(page, storybook(), 'core-slider--touch-tracking');
  await rewriteIosSupportsRules(page);
  const driver = await touchDriver(page);
  const low = page.getByRole('slider', {name: 'Minimum value'});
  const high = page.getByRole('slider', {name: 'Maximum value'});
  await expect(high.locator('[data-slider-hit]')).toHaveCount(1);
  expect(await low.getAttribute('aria-valuenow')).toBe(
    await high.getAttribute('aria-valuenow'),
  );
  const box = await high.boundingBox();
  if (box == null) {
    throw new Error('no thumb');
  }
  const at = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  await driver.play(
    drag(at, {x: at.x - 60, y: at.y}, {durationMs: 400, hz: 60, restMs: 150}),
  );
  await page.waitForTimeout(800);
  expect(Number(await low.getAttribute('aria-valuenow'))).toBeLessThan(40);
  expect(await high.getAttribute('aria-valuenow')).toBe('40');
});

test('a vertical swipe from a thumb scrolls the list; a horizontal one drags it', async ({
  page,
}) => {
  await emulateIosWebKit(page);
  await openStory(page, storybook(), 'core-slider--in-scrolling-list');
  await rewriteIosSupportsRules(page);
  const driver = await touchDriver(page);
  test.skip(
    !driver.drivesNativeGestures,
    'these touches cannot scroll natively in this engine (README: engine limits)',
  );
  const list = page.getByTestId('slider-list');
  const thumb = page.getByRole('slider', {name: 'Channel 2'});
  await expect(thumb.locator('[data-slider-hit]')).toHaveCount(1);
  const before = await thumb.getAttribute('aria-valuenow');
  const box = await thumb.boundingBox();
  if (box == null) {
    throw new Error('no thumb');
  }
  const at = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  await driver.play(
    drag(at, {x: at.x, y: at.y - 120}, {durationMs: 200, hz: 60}),
  );
  await page.waitForTimeout(600);
  expect(await list.evaluate(element => element.scrollTop)).toBeGreaterThan(40);
  expect(await thumb.getAttribute('aria-valuenow')).toBe(before);
  // Let the list's own deceleration finish: a finger on a moving list
  // brakes it and the control does not track that touch.
  let top = -1;
  for (let i = 0; i < 40; i++) {
    const now = await list.evaluate(element => element.scrollTop);
    if (now === top) {
      break;
    }
    top = now;
    await page.waitForTimeout(100);
  }
  // A thumb in view after the scroll.
  const listBox = await list.boundingBox();
  const visible = page.getByRole('slider', {name: 'Channel 6'});
  const visibleBefore = await visible.getAttribute('aria-valuenow');
  const next = await visible.boundingBox();
  if (next == null || listBox == null) {
    throw new Error('no thumb');
  }
  expect(next.y).toBeGreaterThan(listBox.y);
  expect(next.y + next.height).toBeLessThan(listBox.y + listBox.height);
  const from = {x: next.x + next.width / 2, y: next.y + next.height / 2};
  await driver.play(
    drag(
      from,
      {x: from.x + 70, y: from.y},
      {durationMs: 300, hz: 60, restMs: 150},
    ),
  );
  await page.waitForTimeout(800);
  expect(await list.evaluate(element => element.scrollTop)).toBe(top);
  expect(Number(await visible.getAttribute('aria-valuenow'))).toBeGreaterThan(
    Number(visibleBefore),
  );
});

test('right to left: dragging toward the inline end raises the value', async ({
  page,
}) => {
  const {driver, center, value, length} = await openSlider(
    page,
    'core-slider--default',
    {direction: 'rtl'},
  );
  const start = await value();
  const at = await center();
  const {script, ends} = legs(at, [
    {to: {x: at.x - 60, y: at.y}, durationMs: 400, restMs: 150},
  ]);
  const [reached] = await playReading(page, driver, script, ends, value);
  expect(reached).toBe(Math.round(trackedValue(start, 60, length)));
});

test(
  'the coast keeps advancing every frame while the main thread is blocked',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    // A fast throw with room ahead: about 90 px of coast, never clamped.
    const {driver, thumb, center} = await openSlider(
      page,
      'core-slider--touch-tracking',
      {name: 'Brightness'},
    );
    await markElement(thumb);
    const cast = await startScreencast(page);
    const at = await center();
    await driver.play(flick(at, {velocity: {x: 900, y: 0}, durationMs: 60}));
    const block = await blockMainThread(page, 400, {
      during: thumb,
      minProgressMs: 16,
    });
    await page.waitForTimeout(150);
    const castFrames = await cast.stop();
    const tracked = await trackMarker(page, castFrames);
    const proof = busyWindowProof(tracked, block, {
      axis: 'x',
      settledWithin: 2,
    });
    await writeEvidence(
      'busy-main-thread/slider-coast',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {
            block,
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
    const box = await thumb.boundingBox();
    const film = await castStoryboard(page, castFrames, {
      name: 'slider-coast-busy-main-thread',
      clip: {x: 0, y: Math.max(0, (box?.y ?? 0) - 40), width: 402, height: 100},
      zero: block.from,
      from: block.from - 40,
      to: proof.judged.to + 40,
      columns: 8,
      cellScale: 0.5,
      data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
    });
    await film.write(testInfo, {block, judged: proof.judged});
    testInfo.annotations.push({
      type: 'busy-main-thread',
      description: proof.summary,
    });
    expect(proof.verdict.failures, proof.summary).toEqual([]);
  },
);

test('Android (no iOS engine): today’s slider takes the finger — a track tap moves the value, a drag follows it, no touch target and no lift', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Android is Chromium: touch emulation without the iOS engine',
  );
  const {driver, thumb, center, value} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness', idiom: 'android'},
  );
  const control = thumb.locator(
    'xpath=ancestor::*[contains(@class, "astryx-slider-control")][1]',
  );
  expect(
    await control.evaluate(element => getComputedStyle(element).touchAction),
  ).toBe('none');
  const box = await control.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  // A tap on the track moves the thumb to it (Material's slider does too).
  const start = await value();
  await driver.play(
    tap({x: box.x + box.width * 0.85, y: box.y + box.height / 2}),
  );
  await frames(page, 4);
  const tapped = await value();
  expect(tapped).toBeGreaterThan(start);
  expect(tapped).toBeGreaterThanOrEqual(80);
  // A drag follows the finger from the touch, with no lift.
  const at = await center();
  const [scaleMid] = await playReading(
    page,
    driver,
    drag(at, {x: at.x - 60, y: at.y}, {durationMs: 300, hz: 60}),
    [6],
    async () => thumb.evaluate(element => getComputedStyle(element).scale),
  );
  expect(scaleMid).toBe('none');
  await frames(page, 4);
  const dragged = await value();
  expect(dragged).toBeLessThan(tapped);
  const after = await center();
  expect(Math.abs(after.x - (at.x - 60))).toBeLessThanOrEqual(3);
});

test('Android with Reduce Motion: today’s slider, its thumb’s transitions off', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Android is Chromium: touch emulation without the iOS engine',
  );
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, thumb, value} = await openSlider(
    page,
    'core-slider--touch-tracking',
    {name: 'Brightness', idiom: 'android'},
  );
  expect(
    await thumb.evaluate(
      element => getComputedStyle(element).transitionDuration,
    ),
  ).toBe('0s');
  const control = thumb.locator(
    'xpath=ancestor::*[contains(@class, "astryx-slider-control")][1]',
  );
  const box = await control.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const start = await value();
  await driver.play(
    tap({x: box.x + box.width * 0.15, y: box.y + box.height / 2}),
  );
  await frames(page, 2);
  expect(await value()).toBeLessThan(start);
  expect(await thumb.evaluate(element => element.getAnimations().length)).toBe(
    0,
  );
});

test('a drag lays out nothing per move, and the coast neither lays out nor paints', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, thumb, center} = await openSlider(
    page,
    'core-slider--default',
    {
      args: {valueDisplay: 'none'},
    },
  );
  const at = await center();
  let moves = {from: 0, to: 0};
  let coast = {from: 0, to: 0};
  const {script, ends} = legs(
    at,
    [
      {to: {x: at.x + 90, y: at.y}, durationMs: 500},
      {to: {x: at.x + 110, y: at.y}, durationMs: 50},
    ],
    {hz: 60},
  );
  const trace = await traceRendering(page, async () => {
    const played = await driver.play(script);
    moves = {
      from: played[3].dispatchedAt,
      to: played[ends[0]].dispatchedAt,
    };
    const start = played[played.length - 1].dispatchedAt;
    await waitForRest(thumb);
    coast = {from: start, to: Date.now()};
  });
  const duringMoves = countBetween(trace, moves.from, moves.to);
  expect(duringMoves.Layout ?? 0, JSON.stringify(duringMoves)).toBe(0);
  const duringCoast = countBetween(trace, coast.from + 80, coast.to - 120);
  expect(duringCoast.Layout ?? 0, JSON.stringify(duringCoast)).toBe(0);
  expect(duringCoast.Paint ?? 0, JSON.stringify(duringCoast)).toBe(0);
});

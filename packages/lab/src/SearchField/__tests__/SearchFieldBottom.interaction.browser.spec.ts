// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SearchFieldBottom.interaction.browser.spec.ts
 * @input The built "Lab/SearchField" Bottom story on the harness's phone
 *   (a finger, so the touch presentation applies), a stand-in visual
 *   viewport that reports a software keyboard, real touch input (Chromium
 *   CDP / WebKit's input command), the UIKit search table and the
 *   interaction harness
 * @output Proofs that the bottom (toolbar) placement moves as iOS 26.2's
 *   does under any finger: a tap plays the measured activation on every part
 *   (the field's swell and narrowing, the close button growing in) within
 *   half a pixel; a change of mind turns around from where the field is; a
 *   tap focuses without Safari's reveal (preventScroll), puts the caret where
 *   the finger lifted and swallows its own late mouse events; the field
 *   keeps above the keyboard by layout (its centre 36 px above the keyboard's
 *   top), each keyboard report moving it at once with no animation and no
 *   prediction (spec:AST-099 FR8: a Lab surface commits at rest); the close
 *   button narrows the field 16 px at each side, springs it out to rest and
 *   shrinks the button in place; under reduced motion only opacity fades,
 *   within 200 ms; where the browser reports the keyboard itself (Chrome on
 *   Android) the field reads that report while it has focus, the keyboard
 *   overlaying the page meanwhile; under a mouse the parts take their places
 *   at once.
 *   Storyboards of the activation and the cancel
 * @position Interaction proof for lab SearchField's bottom placement
 *   (SearchField.tsx, SearchFieldTouch.ts, searchFieldModel.ts). Headless
 *   browsers have no software keyboard, so the page's `visualViewport` is
 *   replaced by one the test shrinks the way Mobile Safari does (one
 *   `resize`, final height); Mobile Safari itself is proven on the iOS
 *   simulator (pull request evidence)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  holdAnimations,
  openStory,
  phone,
  releaseAnimations,
  sampleCurve,
  timeline,
  touchDriver,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

import {readFades, recordFades} from './fadeRecorder';
import {END_CAP, MIDDLE, START, samplePart} from './pseudoParts';

const storybook = withStorybook(test);

// The bottom placement's measurements, as in the UIKit table
// (`search.bottom`, motion/uikit/search.ts, which search.test.ts holds
// together): the field's geometry and its measured frames, [ms, leading
// progress, trailing progress, height scale] for the field and [ms, opacity,
// scale, x] for the close button. Spelled out here because a spec runs
// against the built Storybook, outside the packages' builds.
const bottom = {
  fieldHeight: 38,
  keyboardCenterOffset: 36,
  restInset: 33,
  activeInset: 17,
  closeSize: 38,
  closeGap: 22,
  cancelNarrowing: 16,
  // prettier-ignore
  activationFrames: [[0, 0, 0, 1], [66, 1.076, -0.365, 1.003], [87, 1.008, -0.35, 0.999], [103, 0.994, -0.203, 0.998], [120, 1.099, -0.019, 1.076], [137, 1.201, 0.183, 1.152], [153, 1.243, 0.387, 1.162], [170, 1.206, 0.581, 1.115], [187, 1.146, 0.742, 1.059], [203, 1.042, 0.877, 1.014], [220, 0.994, 0.96, 0.989], [237, 0.946, 1.017, 0.979], [253, 0.933, 1.043, 0.979], [270, 0.931, 1.052, 0.983], [287, 0.938, 1.051, 0.989], [303, 0.952, 1.043, 0.994], [320, 0.964, 1.033, 0.997], [337, 0.978, 1.024, 0.998], [353, 0.986, 1.016, 0.999], [370, 0.993, 1.002, 0.999], [387, 0.996, 1.002, 0.999], [403, 0.999, 1, 1], [420, 0.999, 1, 1], [437, 0.999, 1, 1], [453, 1, 1, 1]],
  // prettier-ignore
  cancelFrames: [[0, 0, 1.364, 1], [17, 0, 1.364, 1], [34, 0, 1.252, 1], [51, -0.004, 0.948, 1.079], [67, -0.007, 0.631, 1.144], [84, -0.009, 0.351, 1.191], [101, -0.009, 0.15, 1.2], [117, -0.009, 0.001, 1.202], [134, -0.009, -0.103, 1.176], [151, -0.008, -0.142, 1.119], [167, -0.006, -0.128, 1.052], [184, -0.003, -0.094, 1.02], [201, -0.001, -0.058, 0.992], [217, 0, -0.031, 0.985], [234, 0.001, -0.013, 0.984], [251, 0.001, -0.003, 0.988], [267, 0.001, 0, 0.994], [284, 0.001, 0.001, 0.997], [301, 0, 0, 1]],
  // prettier-ignore
  closeEnterFrames: [[0, 0, 0.2, -16.67], [153, 0, 0.238, -16.67], [170, 0.024, 0.257, -16.26], [187, 0.067, 0.287, -15.55], [203, 0.157, 0.348, -14.05], [220, 0.228, 0.396, -12.86], [237, 0.342, 0.474, -10.96], [253, 0.42, 0.53, -9.67], [270, 0.532, 0.615, -7.81], [287, 0.602, 0.671, -6.64], [303, 0.698, 0.75, -5.04], [320, 0.755, 0.798, -4.09], [337, 0.829, 0.861, -2.85], [353, 0.871, 0.896, -2.15], [370, 0.923, 0.939, -1.28], [387, 0.958, 0.966, -0.7], [403, 0.985, 0.988, -0.25], [420, 1, 1.005, 0.1], [437, 1, 1.015, 0.31], [453, 1, 1.025, 0.52], [470, 1, 1.029, 0.61], [487, 1, 1.033, 0.68], [503, 1, 1.033, 0.7], [520, 1, 1.033, 0.68], [537, 1, 1.031, 0.65], [553, 1, 1.028, 0.59], [570, 1, 1.026, 0.54], [587, 1, 1.022, 0.46], [603, 1, 1.019, 0.41], [620, 1, 1.016, 0.33], [637, 1, 1.013, 0.27], [653, 1, 1.011, 0.22], [670, 1, 1.008, 0.16], [687, 1, 1.006, 0], [703, 1, 1, 0]],
  // prettier-ignore
  closeExitFrames: [[0, 1, 1.069], [17, 1, 1.387], [34, 0.918, 1.282], [51, 0.76, 1.083], [67, 0.581, 0.861], [84, 0.414, 0.66], [101, 0.274, 0.497], [117, 0.167, 0.376], [134, 0.089, 0.291], [151, 0.037, 0.236], [167, 0.005, 0.201], [184, 0, 0.182]],
} as const;

// The cover Mobile Safari reports on an iPhone 17 Pro.
const COVER = 337;
// The phone's width: the field's edges as on a 402 pt iPhone 17 Pro.
const WIDTH = phone.viewport.width;
const REST = {leading: bottom.restInset, trailing: WIDTH - bottom.restInset};
const ACTIVE = {
  leading: bottom.activeInset,
  trailing: WIDTH - bottom.activeInset - bottom.closeSize - bottom.closeGap,
};
const CAP = bottom.fieldHeight / 2;

/** A frame table's column at `ms`, linear between rows, held at the ends. */
function frameAt(
  table: readonly (readonly number[])[],
  column: number,
  ms: number,
) {
  if (ms <= table[0][0]) {
    return table[0][column];
  }
  const last = table[table.length - 1];
  if (ms >= last[0]) {
    return last[column];
  }
  let i = 1;
  while (table[i][0] < ms) {
    i++;
  }
  const a = table[i - 1];
  const b = table[i];
  return a[column] + ((b[column] - a[column]) * (ms - a[0])) / (b[0] - a[0]);
}

/** The field's edges at `ms` into a gel table, px. */
function edgesAt(table: readonly (readonly number[])[], ms: number) {
  return {
    leading:
      REST.leading + frameAt(table, 1, ms) * (ACTIVE.leading - REST.leading),
    trailing:
      REST.trailing + frameAt(table, 2, ms) * (ACTIVE.trailing - REST.trailing),
    heightScale: frameAt(table, 3, ms),
  };
}

/**
 * Before the page loads: `window.visualViewport` becomes one the test
 * drives: `__keyboard(cover)` shrinks it from the bottom and fires one
 * `resize`, as Mobile Safari does. Mobile Safari has no VirtualKeyboard API,
 * so it is removed (Chromium has one), unless `virtualKeyboardApi` asks for
 * Chrome on Android's: then `navigator.virtualKeyboard` is one the test
 * drives, and `__chromeKeyboard(cover)` sets its rect and fires
 * `geometrychange`, as Chrome does while the keyboard overlays the page.
 */
async function installKeyboard(
  page: Page,
  {virtualKeyboardApi = false}: {virtualKeyboardApi?: boolean} = {},
) {
  await page.addInitScript(withApi => {
    if (withApi) {
      const keyboard = Object.assign(new EventTarget(), {
        overlaysContent: false,
        boundingRect: new DOMRect(0, 0, 0, 0),
      });
      Object.defineProperty(navigator, 'virtualKeyboard', {
        configurable: true,
        value: keyboard,
      });
      (
        window as unknown as {__chromeKeyboard: (cover: number) => void}
      ).__chromeKeyboard = cover => {
        keyboard.boundingRect = new DOMRect(
          0,
          window.innerHeight - cover,
          window.innerWidth,
          cover,
        );
        keyboard.dispatchEvent(new Event('geometrychange'));
      };
    } else {
      Reflect.deleteProperty(Navigator.prototype, 'virtualKeyboard');
      Reflect.deleteProperty(navigator, 'virtualKeyboard');
    }
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
  }, virtualKeyboardApi);
}

const showKeyboard = async (page: Page, cover = COVER) =>
  page.evaluate(
    c => (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c),
    cover,
  );

/** Chrome on Android's own keyboard report (with `virtualKeyboardApi`). */
const reportChromeKeyboard = async (page: Page, cover = COVER) =>
  page.evaluate(
    c =>
      (
        window as unknown as {__chromeKeyboard: (c: number) => void}
      ).__chromeKeyboard(c),
    cover,
  );

/** Whether the keyboard overlays the page (Chrome's `overlaysContent`). */
const overlaysContent = async (page: Page) =>
  page.evaluate(
    () =>
      (navigator as unknown as {virtualKeyboard: {overlaysContent: boolean}})
        .virtualKeyboard.overlaysContent,
  );

/** The field's computed `touch-action` (the gesture host writes it). */
const touchActionOf = async (page: Page) =>
  root(page).evaluate(element =>
    element.firstElementChild == null
      ? null
      : getComputedStyle(element.firstElementChild).touchAction,
  );

/** How many animations the root itself runs. */
const rootAnimations = async (page: Page) =>
  root(page).evaluate(element => element.getAnimations().length);

// The first page of a fresh WebKit worker stops presenting frames for about
// a second after its first composited animation starts (the engine setting
// up compositing). One throwaway activation pays that cost first.
test.beforeAll(async ({browser, browserName}) => {
  if (browserName !== 'webkit') {
    return;
  }
  const context = await browser.newContext(phone);
  const page = await context.newPage();
  await installKeyboard(page);
  await openStory(page, storybook(), 'lab-searchfield--bottom');
  const field = page.getByRole('searchbox', {name: 'Search'});
  const box = await field.boundingBox();
  if (box != null) {
    await (
      await touchDriver(page)
    ).tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    await page.waitForTimeout(2000);
  }
  await context.close();
});

async function openBottom(
  page: Page,
  {virtualKeyboardApi = false}: {virtualKeyboardApi?: boolean} = {},
) {
  await installKeyboard(page, {virtualKeyboardApi});
  await openStory(page, storybook(), 'lab-searchfield--bottom');
  const driver = await touchDriver(page);
  const field = page.getByRole('searchbox', {name: 'Search'});
  await expect(field).toBeVisible();
  await waitForRest(page.locator('[data-search-field-end]'));
  return {driver, field};
}

const root = (page: Page) => page.getByRole('search');
const end = (page: Page) => page.locator('[data-search-field-end]');
const close = (page: Page) => page.locator('[data-search-field-close]');

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** The presented `translate`, px: [x, y]. */
const translate = async (locator: Locator) =>
  locator.evaluate(element => {
    const value = getComputedStyle(element).translate;
    if (value === 'none') {
      return [0, 0];
    }
    const [x, y] = value.split(' ').map(part => parseFloat(part) || 0);
    return [x ?? 0, y ?? 0];
  });

/** The root's layout lift above its resting place (its `bottom`), px. */
const liftOf = async (page: Page) =>
  root(page).evaluate(element => parseFloat(getComputedStyle(element).bottom));

/** Where the field's resting centre sits above the viewport's bottom, px. */
const restGapOf = async (page: Page) =>
  root(page).evaluate(element => {
    const rect = element.getBoundingClientRect();
    const lift = parseFloat(getComputedStyle(element).bottom) || 0;
    return window.innerHeight - (rect.top + lift + rect.height / 2);
  });

/** Opens the Bottom story, activates it and brings the keyboard up. */
async function openActive(page: Page) {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await showKeyboard(page);
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  await waitForRest(close(page));
  await waitForRest(root(page));
  return {driver, field};
}

test('a tap plays iOS’s measured activation on every part', async ({
  page,
}, testInfo) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await waitForAnimation(end(page));
  const held = await holdAnimations(page);
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  const curveEnd = Math.max(...held.map(a => a.curveEndMs));
  const times = timeline(curveEnd);
  const [ends, closes] = await Promise.all(
    [end, close].map(async part => sampleCurve(part(page), times)),
  );
  // The rounded ends and the middle are pseudo-elements (pseudoParts.ts),
  // each sampled by seeking every held animation: one after another.
  const starts = await samplePart(page, START, times);
  const middles = await samplePart(page, MIDDLE, times);
  const caps = await samplePart(page, END_CAP, times);
  await releaseAnimations(page, {finish: true});
  const samples = times.map((t, i) => {
    const edges = edgesAt(bottom.activationFrames, t);
    return {
      t: +t.toFixed(1),
      startX: starts[i].translateX,
      middleScale: middles[i].scaleX,
      endX: ends[i].transform.translateX,
      heightScale: caps[i].scaleY,
      closeX: closes[i].transform.translateX,
      closeScale: closes[i].transform.scaleX,
      closeOpacity: closes[i].opacity,
      measured: {
        startX: edges.leading - REST.leading,
        middleScale:
          (edges.trailing - edges.leading - 2 * CAP) /
          (REST.trailing - REST.leading - 2 * CAP),
        endX: edges.trailing - REST.trailing,
        heightScale: edges.heightScale,
        closeX: frameAt(bottom.closeEnterFrames, 3, t),
        closeScale: frameAt(bottom.closeEnterFrames, 2, t),
        closeOpacity: frameAt(bottom.closeEnterFrames, 1, t),
      },
    };
  });
  await writeEvidence(
    'curves/searchfield-bottom-activation',
    {[`${testInfo.project.name}.json`]: JSON.stringify(samples, null, 1)},
    testInfo,
  );
  for (const sample of samples) {
    const {measured} = sample;
    const at = `at ${sample.t} ms`;
    expect(Math.abs(sample.startX - measured.startX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.endX - measured.endX), at).toBeLessThan(0.5);
    expect(
      Math.abs(sample.middleScale - measured.middleScale) *
        (REST.trailing - REST.leading - 2 * CAP),
      at,
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.heightScale - measured.heightScale),
      at,
    ).toBeLessThan(0.01);
    expect(Math.abs(sample.closeX - measured.closeX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.closeScale - measured.closeScale), at).toBeLessThan(
      0.01,
    );
    expect(
      Math.abs(sample.closeOpacity - measured.closeOpacity),
      at,
    ).toBeLessThan(0.02);
  }
  // It swells past rest before it narrows, as iOS's field does.
  expect(Math.max(...samples.map(s => s.endX))).toBeGreaterThan(10);
  await waitForRest(end(page));
  expect((await translate(end(page)))[0]).toBeCloseTo(
    ACTIVE.trailing - REST.trailing,
    1,
  );
});

/**
 * Waits for an animation on `locator` that started after `after` (epoch ms,
 * an earlier animation's `from`).
 */
async function waitForNewAnimation(locator: Locator, after: number) {
  const deadline = Date.now() + 5_000;
  for (;;) {
    const fresh = (await waitForAnimation(locator)).filter(
      a => a.from > after + 1,
    );
    if (fresh.length > 0) {
      return fresh;
    }
    if (Date.now() > deadline) {
      throw new Error('no new animation started');
    }
    await locator.page().waitForTimeout(8);
  }
}

/**
 * The trailing end's samples from its own start. The parts' turns start a few
 * ms apart (each is created after the one before it), and a hold samples from
 * the earliest start among them: until the end's own start it reads its first
 * keyframe, the same presented frame again. On a slow runner that gap passes a
 * sample step (24 ms at 8x CPU throttling), so the repeats are dropped and
 * every sample left is a new frame.
 */
function fromOwnStart(xs: number[]): number[] {
  let first = 0;
  while (first + 1 < xs.length && xs[first + 1] === xs[first]) {
    first += 1;
  }
  return xs.slice(first);
}

/** When a frame table column reaches its largest or smallest value, ms. */
function extremeMs(
  table: readonly (readonly number[])[],
  column: number,
  pick: 'max' | 'min',
): number {
  let best = table[0];
  for (const row of table) {
    if (
      pick === 'max' ? row[column] > best[column] : row[column] < best[column]
    ) {
      best = row;
    }
  }
  return best[0];
}

/** When the activation's trailing edge narrows furthest: the gel's peak, ms. */
const ACTIVATION_PEAK_MS = extremeMs(bottom.activationFrames, 2, 'max');
/** When the cancel's trailing edge widens furthest, past rest, ms. */
const CANCEL_PEAK_MS = extremeMs(bottom.cancelFrames, 2, 'min');

/** One frame at 60 Hz, ms: the step between samples. */
const FRAME_MS = 1000 / 60;

/**
 * Whether a turn started at least two frames before the first motion's peak,
 * so that "keeps going for a moment, then turns once" can be checked: the gel
 * slows to a stop over the frames before its peak, where a first step no
 * longer shows it going. A slow runner's tap can land there or past the
 * peak, where the field already moves back and a turn that adds to it reads
 * like one that does not; then the test records, as an annotation naming the
 * measured start and the peak, that it checked only the rest.
 */
function turnsBeforePeak(turnAtMs: number, peakMs: number, motion: string) {
  if (turnAtMs < peakMs - 2 * FRAME_MS) {
    return true;
  }
  test.info().annotations.push({
    type: 'reduced',
    description: `the turn started ${Math.round(turnAtMs)} ms into the ${motion}, not two frames before its peak at ${peakMs} ms: "keeps going, then turns once" not checked`,
  });
  return false;
}

/** The largest step between neighbouring samples, px. */
const largestStep = (xs: number[]) =>
  Math.max(...xs.slice(1).map((x, i) => Math.abs(x - xs[i])));

/** How many times the samples change direction (steps under 0.01 px skipped). */
function turnsOf(xs: number[]) {
  let turns = 0;
  let direction = 0;
  for (let i = 1; i < xs.length; i++) {
    const step = xs[i] - xs[i - 1];
    if (Math.abs(step) < 0.01) {
      continue;
    }
    const next = Math.sign(step);
    if (direction !== 0 && next !== direction) {
      turns++;
    }
    direction = next;
  }
  return turns;
}

/** The measured gel's own fastest step of the trailing edge per frame, px. */
const GEL_PEAK_STEP = Math.max(
  ...[bottom.activationFrames, bottom.cancelFrames].flatMap(table =>
    table
      .slice(1)
      .map(
        (row, i) =>
          (Math.abs(row[2] - table[i][2]) *
            Math.abs(ACTIVE.trailing - REST.trailing) *
            16.667) /
          (row[0] - table[i][0]),
      ),
  ),
);

test('a cancel mid-activation turns around from where the field is, without a snap', async ({
  page,
}) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  const [forward] = await waitForAnimation(end(page), {minProgressMs: 150});
  const before = (await translate(end(page)))[0];
  await driver.tap(await centerOf(close(page)));
  const [reverse] = await waitForNewAnimation(end(page), forward.from);
  await holdAnimations(page);
  await expect(root(page)).not.toHaveAttribute('data-search-field-active');
  const times = timeline(reverse.to - reverse.from);
  const xs = fromOwnStart(
    (await sampleCurve(end(page), times)).map(
      sample => sample.transform.translateX,
    ),
  );
  await releaseAnimations(page, {finish: true});
  // The measured cancel starts from the settled active field, so replaying
  // it from its first row snapped the trailing edge to it (32 px on this
  // screen). The turn adds to the curves on screen instead, as UIKit's
  // animations do: it starts where the activation had brought the field
  // (further along than before the second tap; the gel itself overshoots
  // the end), keeps narrowing for a moment if the turn starts before the
  // gel's peak, turns once and widens back to rest, never stepping faster
  // than the measured gel itself.
  const turnAtMs = reverse.from - forward.from;
  const detail = JSON.stringify({before, turnAtMs, xs});
  if (turnsBeforePeak(turnAtMs, ACTIVATION_PEAK_MS, 'activation')) {
    expect(xs[0], detail).toBeLessThanOrEqual(before + 0.5);
    expect(xs[1], detail).toBeLessThan(xs[0]);
    expect(turnsOf(xs), detail).toBe(1);
  } else {
    // Past the peak the field has moved back since `before`: the turn
    // starts where the measured activation is at that time.
    const there =
      edgesAt(bottom.activationFrames, turnAtMs).trailing - REST.trailing;
    expect(Math.abs(xs[0] - there), detail).toBeLessThan(1);
    expect(turnsOf(xs), detail).toBeLessThanOrEqual(1);
  }
  expect(largestStep(xs), detail).toBeLessThan(GEL_PEAK_STEP + 0.5);
  await waitForRest(end(page));
  expect(Math.abs((await translate(end(page)))[0])).toBeLessThan(0.5);
});

test('focusing the field early in a cancel re-activates from where the field is, without a snap', async ({
  page,
}) => {
  const {driver, field} = await openActive(page);
  await driver.tap(await centerOf(close(page)));
  const [cancel] = await waitForAnimation(end(page), {minProgressMs: 60});
  const before = (await translate(end(page)))[0];
  // The bar is moving to its resting gap by then, faster than a scripted
  // tap can land on it; the field's own tap focuses it this way.
  await field.evaluate(element =>
    (element as HTMLInputElement).focus({preventScroll: true}),
  );
  const [again] = await waitForNewAnimation(end(page), cancel.from);
  await holdAnimations(page);
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  const times = timeline(again.to - again.from);
  const xs = fromOwnStart(
    (await sampleCurve(end(page), times)).map(
      sample => sample.transform.translateX,
    ),
  );
  await releaseAnimations(page, {finish: true});
  // From where the cancel had brought it (further toward rest than before
  // the tap), it keeps widening for a moment if the turn starts before the
  // cancel's peak, turns once and narrows again, never stepping faster than
  // the measured gel itself.
  const turnAtMs = again.from - cancel.from;
  const detail = JSON.stringify({before, turnAtMs, xs});
  if (turnsBeforePeak(turnAtMs, CANCEL_PEAK_MS, 'cancel')) {
    expect(xs[0], detail).toBeGreaterThanOrEqual(before - 0.5);
    expect(xs[1], detail).toBeGreaterThan(xs[0]);
    expect(turnsOf(xs), detail).toBe(1);
  } else {
    // Past the peak the field has moved back since `before`: the turn
    // starts where the measured cancel is at that time.
    const there =
      edgesAt(bottom.cancelFrames, turnAtMs).trailing - REST.trailing;
    expect(Math.abs(xs[0] - there), detail).toBeLessThan(1);
    expect(turnsOf(xs), detail).toBeLessThanOrEqual(1);
  }
  expect(largestStep(xs), detail).toBeLessThan(GEL_PEAK_STEP + 0.5);
  await waitForRest(end(page));
  expect((await translate(end(page)))[0]).toBeCloseTo(
    ACTIVE.trailing - REST.trailing,
    1,
  );
});

test('a tap focuses the field without Safari’s reveal', async ({page}) => {
  const {driver, field} = await openBottom(page);
  // Every focus the page makes, with the options it passes.
  await page.evaluate(() => {
    const calls: unknown[] = [];
    (window as unknown as {__focusCalls: unknown[]}).__focusCalls = calls;
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options?: FocusOptions) {
      calls.push({role: this.getAttribute('role'), options: options ?? null});
      focus.call(this, options);
    };
  });
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await driver.tap(await centerOf(field));
  await expect(field).toBeFocused();
  const calls = await page.evaluate(
    () => (window as unknown as {__focusCalls: unknown[]}).__focusCalls,
  );
  // The field's own tap focused it, asking the browser not to scroll it into
  // view (Mobile Safari would pan the page instead of letting the bar ride).
  expect(calls).toEqual([{role: 'searchbox', options: {preventScroll: true}}]);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
});

test('the tap claim attaches only where it claims taps', async ({page}) => {
  // Where the keyboard covers the page (Mobile Safari), the bottom field
  // claims a tap, so the gesture host owns its touch-action.
  await openBottom(page);
  expect(await touchActionOf(page)).not.toBe('auto');
  // A stacked field never claims a tap: it keeps the browser's own.
  await openStory(page, storybook(), 'lab-searchfield--default');
  await expect(page.getByRole('searchbox').first()).toBeVisible();
  expect(await touchActionOf(page)).toBe('auto');
});

/**
 * Records every focus call on the search field and every document scroll,
 * from here on.
 */
async function spyFocusAndScroll(page: Page) {
  await page.evaluate(() => {
    const spy = {focus: [] as unknown[], scrolls: 0, scrollY: window.scrollY};
    (window as unknown as {__spy: typeof spy}).__spy = spy;
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options?: FocusOptions) {
      if (this.getAttribute('role') === 'searchbox') {
        spy.focus.push(options ?? null);
      }
      focus.call(this, options);
    };
    window.addEventListener('scroll', () => {
      spy.scrolls++;
    });
  });
  return async () =>
    page.evaluate(() => {
      const spy = (
        window as unknown as {
          __spy: {focus: unknown[]; scrolls: number; scrollY: number};
        }
      ).__spy;
      return {...spy, scrolled: window.scrollY - spy.scrollY};
    });
}

test('focus moved from another control (Tab, as the keyboard’s next button moves it) reaches the field without a reveal', async ({
  page,
}) => {
  const {field} = await openBottom(page);
  // Another text field, before the bar in the document.
  await page.evaluate(() => {
    const other = document.createElement('input');
    other.setAttribute('aria-label', 'Name');
    document.body.prepend(other);
  });
  await page.getByRole('textbox', {name: 'Name'}).focus();
  const read = await spyFocusAndScroll(page);
  await page.keyboard.press('Tab');
  await expect(field).toBeFocused();
  // The field took the move over with preventScroll (spec:AST-099 FR4), and
  // the document did not move.
  const spy = await read();
  expect(spy.focus).toEqual([{preventScroll: true}]);
  expect(spy.scrolls).toBe(0);
  expect(spy.scrolled).toBe(0);
});

test('after the keyboard’s Done, the next tap focuses the field without a reveal', async ({
  page,
}) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await expect(field).toBeFocused();
  // Done ends editing: focus leaves the field for nothing.
  await field.evaluate(element => (element as HTMLElement).blur());
  const read = await spyFocusAndScroll(page);
  await driver.tap(await centerOf(field));
  await expect(field).toBeFocused();
  const spy = await read();
  expect(spy.focus).toEqual([{preventScroll: true}]);
  expect(spy.scrolls).toBe(0);
  expect(spy.scrolled).toBe(0);
});

test('a tap into an existing query puts the caret where the finger lifted', async ({
  page,
}) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await expect(field).toBeFocused();
  await page.keyboard.type('hello world');
  // Editing ends (the keyboard goes down) and the field stays active.
  await field.evaluate(element => (element as HTMLInputElement).blur());
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  // The parts finish moving first: as the keyboard goes down the field is
  // still on its way to rest, and a point read mid-move lands the tap a
  // character or two off once it arrives.
  await waitForRest(root(page));
  await waitForRest(end(page));
  await waitForRest(close(page));
  // Where "hello" ends, measured with a span in the input's font.
  const point = await field.evaluate(element => {
    const input = element as HTMLInputElement;
    const style = getComputedStyle(input);
    const span = document.createElement('span');
    span.textContent = 'hello';
    span.style.font = style.font;
    span.style.letterSpacing = style.letterSpacing;
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    document.body.appendChild(span);
    const width = span.getBoundingClientRect().width;
    span.remove();
    const rect = input.getBoundingClientRect();
    return {
      x:
        rect.left +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.paddingLeft) +
        width,
      y: rect.top + rect.height / 2,
    };
  });
  await driver.tap(point);
  await expect(field).toBeFocused();
  const caret = await field.evaluate(element => [
    (element as HTMLInputElement).selectionStart,
    (element as HTMLInputElement).selectionEnd,
  ]);
  // Script focus alone would leave it at the end (11).
  expect(caret[0], JSON.stringify(caret)).toBeGreaterThanOrEqual(4);
  expect(caret[0], JSON.stringify(caret)).toBeLessThanOrEqual(6);
  expect(caret[1]).toBe(caret[0]);
});

test('the clear button refocuses the field without Safari’s reveal', async ({
  page,
}) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await expect(field).toBeFocused();
  // The gel settled, so the clear button is where it rests.
  await waitForRest(end(page));
  await page.keyboard.type('apples');
  await field.evaluate(element => (element as HTMLInputElement).blur());
  await page.evaluate(() => {
    const calls: unknown[] = [];
    (window as unknown as {__focusCalls: unknown[]}).__focusCalls = calls;
    const focus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options?: FocusOptions) {
      calls.push({role: this.getAttribute('role'), options: options ?? null});
      focus.call(this, options);
    };
  });
  const clear = page.getByRole('button', {name: 'Clear text'});
  await driver.tap(await centerOf(clear));
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('');
  const calls = await page.evaluate(
    () => (window as unknown as {__focusCalls: unknown[]}).__focusCalls,
  );
  expect(calls).toEqual([{role: 'searchbox', options: {preventScroll: true}}]);
});

test.describe('with Reduce Motion', () => {
  test('a finger sees only opacity fades of 200 ms or less, and the bar moves to the keyboard at once', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver, field} = await openBottom(page);
    // design:reduced-motion DR1 and DR2: no travel, opacity only, 200 ms or
    // less. The page records each animation as it starts, so a busy runner
    // cannot make the proof miss one; it reads once the parts have landed
    // and come to rest.
    await recordFades(page);
    await driver.tap(await centerOf(field));
    await expect
      .poll(async () => (await translate(end(page)))[0])
      .toBeCloseTo(ACTIVE.trailing - REST.trailing, 1);
    await waitForRest(end(page));
    await waitForRest(close(page));
    const activation = await readFades(page);
    expect(activation.properties).toEqual(['opacity']);
    expect(activation.fadeMs).toBeLessThanOrEqual(200);
    // The keyboard: the field's layout takes the new place at once.
    const restGap = await restGapOf(page);
    await showKeyboard(page);
    await expect
      .poll(async () => liftOf(page))
      .toBeCloseTo(COVER + bottom.keyboardCenterOffset - restGap, 0);
    expect(await rootAnimations(page)).toBe(0);
  });
});

test('the field keeps 36 px above the keyboard by layout, each report moving it at once', async ({
  page,
}) => {
  const {driver, field} = await openBottom(page);
  await driver.tap(await centerOf(field));
  await waitForRest(end(page));
  await waitForRest(close(page));
  // Active with the keyboard not yet reported: the field rests.
  expect(await liftOf(page)).toBeCloseTo(0, 1);
  const restGap = await restGapOf(page);
  await showKeyboard(page);
  // Committed at rest (spec:AST-099 FR8): the layout takes the new place
  // at once, with no animation and no translate.
  await expect
    .poll(async () => liftOf(page))
    .toBeCloseTo(COVER + bottom.keyboardCenterOffset - restGap, 0);
  expect(await rootAnimations(page)).toBe(0);
  expect((await translate(root(page)))[1]).toBeCloseTo(0, 1);
  const box = await root(page).boundingBox();
  const keyboardTop = await page.evaluate(
    cover => window.innerHeight - cover,
    COVER,
  );
  expect(keyboardTop - ((box?.y ?? 0) + (box?.height ?? 0) / 2)).toBeCloseTo(
    bottom.keyboardCenterOffset,
    0,
  );
  // The keyboard down: back at rest, at once.
  await showKeyboard(page, 0);
  await expect.poll(async () => liftOf(page)).toBeCloseTo(0, 1);
  expect(await rootAnimations(page)).toBe(0);
});

test('the close button narrows the field, springs it out to rest and shrinks in place, and the bar goes down with the keyboard’s report', async ({
  page,
}, testInfo) => {
  const {driver} = await openActive(page);
  await driver.tap(await centerOf(close(page)));
  await showKeyboard(page, 0);
  await waitForAnimation(end(page));
  const held = await holdAnimations(page);
  await expect(root(page)).not.toHaveAttribute('data-search-field-active');
  const fieldEnd = Math.max(
    ...held.filter(a => a.curveEndMs < 1000).map(a => a.curveEndMs),
  );
  const times = timeline(fieldEnd);
  const [ends, closes] = await Promise.all(
    [end, close].map(async part => sampleCurve(part(page), times)),
  );
  await releaseAnimations(page, {finish: true});
  const samples = times.map((t, i) => ({
    t: +t.toFixed(1),
    endX: ends[i].transform.translateX,
    closeX: closes[i].transform.translateX,
    closeScale: closes[i].transform.scaleX,
    closeOpacity: closes[i].opacity,
    measured: {
      endX: edgesAt(bottom.cancelFrames, t).trailing - REST.trailing,
      closeX: -bottom.cancelNarrowing,
      closeScale: frameAt(bottom.closeExitFrames, 2, t),
      closeOpacity: frameAt(bottom.closeExitFrames, 1, t),
    },
  }));
  await writeEvidence(
    'curves/searchfield-bottom-cancel',
    {[`${testInfo.project.name}.json`]: JSON.stringify(samples, null, 1)},
    testInfo,
  );
  // The trailing edge starts 16 px inside the active field's.
  expect(samples[0].endX).toBeCloseTo(
    ACTIVE.trailing - bottom.cancelNarrowing - REST.trailing,
    0,
  );
  for (const sample of samples) {
    const {measured} = sample;
    const at = `at ${sample.t} ms`;
    expect(Math.abs(sample.endX - measured.endX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.closeX - measured.closeX), at).toBeLessThan(0.5);
    expect(Math.abs(sample.closeScale - measured.closeScale), at).toBeLessThan(
      0.01,
    );
    expect(
      Math.abs(sample.closeOpacity - measured.closeOpacity),
      at,
    ).toBeLessThan(0.02);
  }
  await waitForRest(root(page));
  // The bar back at rest by layout, with no translate left.
  expect(await liftOf(page)).toBeCloseTo(0, 1);
  expect((await translate(root(page)))[1]).toBeCloseTo(0, 0);
  await expect(close(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('searchbox')).not.toBeFocused();
});

test('a cancel keeps the bar above the keyboard until Safari reports the hide, with no prediction', async ({
  page,
}) => {
  const {driver} = await openActive(page);
  await driver.tap(await centerOf(close(page)));
  await expect(root(page)).not.toHaveAttribute('data-search-field-active');
  // Inactive with the keyboard still reported up: the bar keeps its resting
  // gap above it, at once.
  await expect.poll(async () => liftOf(page)).toBeCloseTo(COVER, 0);
  await page.waitForTimeout(400);
  expect(await liftOf(page)).toBeCloseTo(COVER, 0);
  // Safari's report: the bar goes down at once.
  await showKeyboard(page, 0);
  await expect.poll(async () => liftOf(page)).toBeCloseTo(0, 1);
  expect(await rootAnimations(page)).toBe(0);
});

test(
  'storyboard: the bottom field activating with the keyboard',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, field} = await openBottom(page);
    const restTop = (await root(page).boundingBox())?.y ?? 0;
    await driver.tap(await centerOf(field));
    await showKeyboard(page);
    await waitForAnimation(end(page));
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-bottom-activation',
      clip: {x: 0, y: 300, width: WIDTH, height: 414},
      times: Array.from({length: 30}, (_, i) => i * 16.667),
      measure: async () => ({
        y: ((await root(page).boundingBox())?.y ?? 0) - restTop,
        endX: (await translate(end(page)))[0],
        closeOpacity: await close(page).evaluate(element =>
          parseFloat(getComputedStyle(element).opacity),
        ),
      }),
      columns: 6,
      cellScale: 0.4,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {y: number; endX: number; closeOpacity: number},
    );
    expect(frames.at(-1)?.y ?? 0).toBeLessThan(-200);
    expect(frames.at(-1)?.closeOpacity ?? 0).toBeGreaterThan(0.95);
  },
);

test(
  'storyboard: the bottom field cancelling with the keyboard',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, field} = await openBottom(page);
    const restTop = (await root(page).boundingBox())?.y ?? 0;
    await driver.tap(await centerOf(field));
    await showKeyboard(page);
    await expect(root(page)).toHaveAttribute(
      'data-search-field-active',
      'true',
    );
    await waitForRest(close(page));
    await waitForRest(root(page));
    await driver.tap(await centerOf(close(page)));
    await showKeyboard(page, 0);
    await waitForAnimation(end(page));
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-bottom-cancel',
      clip: {x: 0, y: 300, width: WIDTH, height: 414},
      times: Array.from({length: 30}, (_, i) => i * 16.667),
      measure: async () => ({
        y: ((await root(page).boundingBox())?.y ?? 0) - restTop,
        endX: (await translate(end(page)))[0],
        closeOpacity: await close(page).evaluate(element =>
          parseFloat(getComputedStyle(element).opacity),
        ),
      }),
      columns: 6,
      cellScale: 0.4,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {y: number; endX: number; closeOpacity: number},
    );
    expect(Math.abs(frames.at(-1)?.y ?? 99)).toBeLessThan(2);
    expect(frames.at(-1)?.closeOpacity ?? 1).toBeLessThan(0.01);
  },
);

test('a claimed tap swallows its own late mouse events, until the next touch', async ({
  page,
}) => {
  const {driver, field} = await openBottom(page);
  // What reaches the page's own listeners below the field.
  await page.evaluate(() => {
    const seen: string[] = [];
    (window as unknown as {__seen: string[]}).__seen = seen;
    for (const type of ['mousedown', 'mouseup', 'click']) {
      document.body.addEventListener(type, event =>
        seen.push(`${type}:${(event as MouseEvent).detail}`),
      );
    }
  });
  await driver.tap(await centerOf(field));
  await expect(field).toBeFocused();
  const late = () =>
    page.evaluate(() => {
      const seen = (window as unknown as {__seen: string[]}).__seen;
      seen.length = 0;
      // A held tap's mouse events, a few ms after its touchend, aimed at
      // whatever is under the finger by then (here, the page itself).
      const target = document.body;
      for (const type of ['mousedown', 'mouseup', 'click']) {
        target.dispatchEvent(
          new MouseEvent(type, {bubbles: true, cancelable: true, detail: 1}),
        );
      }
      return [...seen];
    });
  expect(await late()).toEqual([]);
  // That click disarmed it: the next ones reach the page.
  expect(await late()).toEqual(['mousedown:1', 'mouseup:1', 'click:1']);
});

test.describe('where the browser reports the keyboard itself (Chrome on Android)', () => {
  test('the tap stays the browser’s, and the field reads its report while it has focus, the keyboard overlaying the page meanwhile, moving at once', async ({
    page,
  }) => {
    const {driver, field} = await openBottom(page, {virtualKeyboardApi: true});
    expect(await overlaysContent(page)).toBe(false);
    // No tap claim attached: the field keeps the browser's touch-action.
    expect(await touchActionOf(page)).toBe('auto');
    // The tap stays the browser's: only Chrome's own tap brings its keyboard
    // up, so no focus comes from script.
    await page.evaluate(() => {
      const calls: unknown[] = [];
      (window as unknown as {__focusCalls: unknown[]}).__focusCalls = calls;
      const focus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function (options?: FocusOptions) {
        calls.push(this.getAttribute('role'));
        focus.call(this, options);
      };
    });
    await driver.tap(await centerOf(field));
    await expect(field).toBeFocused();
    expect(
      await page.evaluate(
        () => (window as unknown as {__focusCalls: unknown[]}).__focusCalls,
      ),
    ).toEqual([]);
    // Focused: the keyboard overlays the page and reports itself.
    expect(await overlaysContent(page)).toBe(true);
    await waitForRest(end(page));
    await waitForRest(close(page));
    const restGap = await restGapOf(page);
    // The visual viewport is not the measure there (spec:AST-099 FR8).
    await showKeyboard(page);
    await page.waitForTimeout(100);
    expect(await liftOf(page)).toBeCloseTo(0, 1);
    // Chrome's report: committed at once, with no ride.
    await reportChromeKeyboard(page);
    await expect
      .poll(async () => liftOf(page))
      .toBeCloseTo(COVER + bottom.keyboardCenterOffset - restGap, 0);
    expect(await rootAnimations(page)).toBe(0);
    // The close button: the bar stays above the keyboard until Chrome
    // reports it down (the inactive bar keeps its resting gap), so the tap
    // lands on the button and cancels; then the app's own setting goes back
    // and the bar is at rest.
    await driver.tap(await centerOf(close(page)));
    await expect(root(page)).not.toHaveAttribute('data-search-field-active');
    expect(await liftOf(page)).toBeCloseTo(COVER, 0);
    expect(await overlaysContent(page)).toBe(true);
    await reportChromeKeyboard(page, 0);
    expect(await overlaysContent(page)).toBe(false);
    await expect.poll(async () => liftOf(page)).toBeCloseTo(0, 1);
  });
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a click puts every part at its end at once, and a keyboard report moves nothing', async ({
    page,
  }) => {
    await installKeyboard(page);
    await openStory(page, storybook(), 'lab-searchfield--bottom');
    // A fine primary pointer, asserted in this test's own context.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const field = page.getByRole('searchbox', {name: 'Search'});
    await field.click();
    await expect(root(page)).toHaveAttribute(
      'data-search-field-active',
      'true',
    );
    // No animation moves anything. (The animator holds the rounded ends and
    // the middle, pseudo-elements with no inline style, by static filling
    // animations whose keyframes keep one value.)
    expect(
      await root(page).evaluate(
        element =>
          element.getAnimations({subtree: true}).filter(animation => {
            const frames =
              (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
            return Object.keys(frames[0] ?? {}).some(
              key =>
                !['offset', 'computedOffset', 'easing', 'composite'].includes(
                  key,
                ) && new Set(frames.map(frame => String(frame[key]))).size > 1,
            );
          }).length,
      ),
    ).toBe(0);
    expect((await translate(end(page)))[0]).toBeCloseTo(
      ACTIVE.trailing - REST.trailing,
      1,
    );
    await showKeyboard(page);
    await page.waitForTimeout(100);
    expect(await liftOf(page)).toBeCloseTo(0, 1);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInputStepperHold.interaction.browser.spec.ts
 * @input The built "With Number Steppers" NumberInput story, real touch input
 *   (Chromium CDP / WebKit's input command) and the interaction harness
 * @output Interaction proofs for the steppers under a finger and a mouse
 *   (motion/uikit/stepper.ts): a tap steps once at the lift, paints only
 *   while the finger is down, and the engine's click after it adds nothing,
 *   a light tap trembling on the edge too; a hold shows a step at 0.5 s, then
 *   on one steady ramp, stops at the bound and commits once, at the release;
 *   a slide onto the other half carries the paint and the repeat; trembling
 *   on the edge adds no step; leaving the column pauses the repeat and coming
 *   back resumes it, never with a step at once; a scroll that starts on a
 *   stepper scrolls and steps nothing; a mouse holds like a finger; a step
 *   made late by a blocked main thread runs once, with no burst; storyboards
 *   of a tap, a hold, a slide, leaving and coming back, and a hold in a
 *   scrolling page
 * @position NumberInput's `*.interaction.browser.spec.ts`, shaped like the
 *   harness exemplar (BottomSheetDetent). The paths run under a finger (the
 *   phone profile, as Android Chrome is); one runs with a mouse. Times are
 *   read in the page, on its own clock: the value the field shows, sampled
 *   every frame; the committed value (aria-valuenow, what assistive
 *   technology hears); and the press-paint mutations.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  blockMainThread,
  openStory,
  Storyboard,
  touchDriver,
  withStorybook,
  writeEvidence,
  type ClipBox,
  type Point,
  type TouchDriver,
  type TouchFrame,
  type TouchScript,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const STORY = 'core-numberinput--with-number-steppers';
/** How far a step may land from its scheduled time, ms (a timer's jitter plus a render). */
const SLACK = 45;
/** UIStepper's first step of a hold, iOS 26.2, ms after touch-down. */
const UIKIT_FIRST_STEP = 514;
/**
 * A hold's steps, ms after touch-down (motion/uikit/stepper.ts): 500, then
 * 250 ms, each interval 0.9 of the one before.
 */
const SCHEDULE = [
  500, 750, 975, 1177.5, 1359.75, 1523.775, 1671.3975, 1804.25775,
];

interface Log {
  /** The value the field shows, sampled every frame. */
  shown: {t: number; value: number}[];
  /** The committed value (aria-valuenow): what assistive technology hears. */
  commits: {t: number; value: number}[];
  paints: {
    t: number;
    half: 'increment' | 'decrement';
    from: string | null;
    paint: string | null;
  }[];
  touches: {t: number; type: string}[];
}

/** The page time of the log's first `type` touch event; fails if it has none. */
function touchTime(log: Log, type: string): number {
  const touch = log.touches.find(entry => entry.type === type);
  if (touch == null) {
    throw new Error(`the log has no ${type}`);
  }
  return touch.t;
}

/** The last item of a list that must not be empty. */
function last<T>(items: ReadonlyArray<T>): T {
  const item = items.at(-1);
  if (item === undefined) {
    throw new Error('the list is empty');
  }
  return item;
}

interface Stepper {
  driver: TouchDriver;
  plus: Point;
  minus: Point;
  /** The column's top edge, CSS px. */
  top: number;
  /** The column's bottom edge, CSS px. */
  bottom: number;
  clip: ClipBox;
}

/**
 * Records the shown value every frame, every commit, press paint, touch and
 * pointer press, in epoch ms on the page clock.
 */
function installLog(): void {
  const now = () => performance.timeOrigin + performance.now();
  const log: Log = {shown: [], commits: [], paints: [], touches: []};
  (window as unknown as {stepperLog: Log}).stepperLog = log;
  const input = document.querySelector('[role="spinbutton"]');
  const plus = document.querySelector('[aria-label^="Increment"]');
  const minus = document.querySelector('[aria-label^="Decrement"]');
  if (input == null || plus == null || minus == null) {
    throw new Error('no stepper');
  }
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('no input');
  }
  let lastShown = input.value;
  const sample = () => {
    if (input.value !== lastShown) {
      lastShown = input.value;
      log.shown.push({t: now(), value: Number(input.value)});
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
  new MutationObserver(() => {
    log.commits.push({
      t: now(),
      value: Number(input.getAttribute('aria-valuenow')),
    });
  }).observe(input, {attributes: true, attributeFilter: ['aria-valuenow']});
  const paints = new MutationObserver(records => {
    for (const record of records) {
      const target = record.target as Element;
      log.paints.push({
        t: now(),
        half: target === plus ? 'increment' : 'decrement',
        from: record.oldValue,
        paint: target.getAttribute('data-astryx-press'),
      });
    }
  });
  for (const half of [plus, minus]) {
    paints.observe(half, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-astryx-press'],
    });
  }
  for (const type of [
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'pointerdown',
    'pointerup',
  ]) {
    document.addEventListener(type, () => log.touches.push({t: now(), type}), {
      capture: true,
      passive: true,
    });
  }
}

const readLog = async (page: Page): Promise<Log> =>
  page.evaluate(() => (window as unknown as {stepperLog: Log}).stepperLog);

/** Opens the story and reads where the steppers are. */
async function openStepper(page: Page): Promise<Stepper> {
  await openStory(page, storybook(), STORY);
  await page.getByRole('spinbutton', {name: 'Quantity'}).waitFor();
  const driver = await touchDriver(page);
  const box = async (name: string) => {
    const rect = await page.getByRole('button', {name}).boundingBox();
    if (rect == null) {
      throw new Error(`no ${name} button`);
    }
    return rect;
  };
  const plusBox = await box('Increment Quantity');
  const minusBox = await box('Decrement Quantity');
  const input = await page
    .getByRole('spinbutton', {name: 'Quantity'})
    .boundingBox();
  if (input == null) {
    throw new Error('no field');
  }
  await page.evaluate(installLog);
  // The field with its label above it.
  const label = await page.getByText('Quantity', {exact: true}).boundingBox();
  const left = Math.max(0, Math.floor(input.x - 12));
  const top = Math.max(0, Math.floor((label?.y ?? plusBox.y) - 8));
  return {
    driver,
    plus: {x: plusBox.x + plusBox.width / 2, y: plusBox.y + plusBox.height / 2},
    minus: {
      x: minusBox.x + minusBox.width / 2,
      y: minusBox.y + minusBox.height / 2,
    },
    top: plusBox.y,
    bottom: minusBox.y + minusBox.height,
    clip: {
      x: left,
      y: top,
      width: Math.ceil(plusBox.x + plusBox.width + 12) - left,
      height: Math.ceil(minusBox.y + minusBox.height + 12) - top,
    },
  };
}

/**
 * Turns the page's own panning off. Until a press is delivered the steppers
 * claim nothing, so a drag the page can pan is the browser's and cancels the
 * press (the scroll test below); once delivered, the press keeps its touch
 * (keepsTouch, the slide test on a scrolling page). With panning off the
 * browser feeds every touch to the page, which a finger outside the column
 * needs to be seen at all.
 */
const keepTouchInPage = async (page: Page) =>
  page.evaluate(() => {
    document.documentElement.style.touchAction = 'none';
  });

/** Makes the page itself a scroll view, as a long form on a phone is. */
const makePageScroll = async (page: Page) =>
  page.evaluate(() => {
    document.body.style.minHeight = '3000px';
  });

/** A finger held still at `at` for `ms`. */
const hold = (at: Point, ms: number): TouchScript => [
  {t: 0, fingers: [{id: 0, ...at}]},
  {t: ms, fingers: []},
];

/** Moves from `from` to `to` between `t0` and `t1` at 60 Hz. */
function moves(from: Point, to: Point, t0: number, t1: number): TouchFrame[] {
  const count = Math.max(1, Math.round(((t1 - t0) / 1000) * 60));
  return Array.from({length: count}, (_, i) => {
    const p = (i + 1) / count;
    return {
      t: t0 + (t1 - t0) * p,
      fingers: [
        {
          id: 0,
          x: from.x + (to.x - from.x) * p,
          y: from.y + (to.y - from.y) * p,
        },
      ],
    };
  });
}

/** The first press's down time: its touchstart, or a mouse's pointerdown. */
function downTime(log: Log): number {
  const down =
    log.touches.find(touch => touch.type === 'touchstart') ??
    log.touches.find(touch => touch.type === 'pointerdown');
  if (down == null) {
    throw new Error('no press logged');
  }
  return down.t;
}

/** Shown step times and values, relative to the first press. */
function stepsOf(log: Log): {t: number; value: number}[] {
  const down = downTime(log);
  return log.shown.map(({t, value}) => ({t: t - down, value}));
}

/** The commits: exactly one, at the release, with `value`. */
function expectOneCommitAtRelease(log: Log, value: number): void {
  expect(log.commits.map(commit => commit.value)).toEqual([value]);
  const release = last(
    log.touches.filter(
      touch => touch.type === 'touchend' || touch.type === 'pointerup',
    ),
  ).t;
  expect(log.commits[0].t).toBeGreaterThanOrEqual(release - 1);
  expect(log.commits[0].t - release).toBeLessThan(SLACK);
}

function expectSchedule(times: number[], schedule: number[]): void {
  expect(times, JSON.stringify(times)).toHaveLength(schedule.length);
  schedule.forEach((at, i) => {
    expect(
      Math.abs(times[i] - at),
      `step ${i + 1} at ${times[i]}`,
    ).toBeLessThanOrEqual(SLACK);
  });
}

test('a tap steps once, at the lift, and paints only while the finger is down', async ({
  page,
}) => {
  const {driver, plus} = await openStepper(page);
  await driver.play(hold(plus, 80));
  await page.waitForTimeout(700);
  const log = await readLog(page);
  const down = touchTime(log, 'touchstart');
  const up = touchTime(log, 'touchend');
  // One step, at the lift, not at touch-down; the engine's click after the
  // lift adds nothing.
  expect(log.shown.map(v => v.value)).toEqual([3]);
  expectOneCommitAtRelease(log, 3);
  // The touched half lights in the touch-down frame and clears at the lift,
  // with no fade (UIStepper's fill switches in one frame both ways).
  expect(log.paints.map(({half, paint}) => [half, paint])).toEqual([
    ['increment', 'on'],
    ['increment', null],
  ]);
  expect(log.paints[0].t - down).toBeLessThan(20);
  expect(log.paints[1].t - up).toBeLessThan(20);
});

test('a light tap trembling on the top edge steps exactly once', async ({
  page,
}) => {
  const {driver, plus, top} = await openStepper(page);
  const at = (dy: number) => ({x: plus.x, y: top + dy});
  await driver.play([
    {t: 0, fingers: [{id: 0, ...at(1)}]},
    {t: 20, fingers: [{id: 0, ...at(-2)}]},
    {t: 40, fingers: [{id: 0, ...at(1)}]},
    {t: 60, fingers: [{id: 0, ...at(-3)}]},
    {t: 80, fingers: []},
  ]);
  await page.waitForTimeout(700);
  const log = await readLog(page);
  expect(log.shown.map(v => v.value)).toEqual([3]);
  expectOneCommitAtRelease(log, 3);
});

test('a hold shows a step at 0.5 s, then on one steady ramp, stops at the bound and commits once at the release', async ({
  page,
}, testInfo) => {
  const {driver, plus} = await openStepper(page);
  await driver.play(hold(plus, 2400));
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  // The story counts 0 to 10 from 2: eight steps reach the maximum, and the
  // finger held on past it steps no more.
  expect(steps.map(s => s.value)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
  const times = steps.map(s => Math.round(s.t));
  expectSchedule(times, SCHEDULE);
  testInfo.annotations.push({
    type: 'uikit-parity',
    description: `first step at ${times[0]} ms; UIStepper's at ${UIKIT_FIRST_STEP} ms`,
  });
  await writeEvidence(
    'traces/numberinput-stepper-hold',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {steps: times, schedule: SCHEDULE, log},
        null,
        1,
      ),
    },
    testInfo,
  );
  // Nothing was committed, or told to assistive technology, until the lift.
  expectOneCommitAtRelease(log, 10);
  // The lift after a repeat adds nothing, and the paint clears with it.
  expect(log.paints.at(-1)).toMatchObject({half: 'increment', paint: null});
});

test('a slide onto the other half carries the paint and the repeat', async ({
  page,
}) => {
  const {driver, plus, minus} = await openStepper(page);
  await keepTouchInPage(page);
  await driver.play([
    {t: 0, fingers: [{id: 0, ...plus}]},
    ...moves(plus, minus, 800, 900),
    {t: 1450, fingers: []},
  ]);
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  // + at 500 and 750 ms, then − on the same ramp: 975, 1177.5, 1359.75 ms.
  expect(steps.map(s => s.value)).toEqual([3, 4, 3, 2, 1]);
  expectSchedule(
    steps.map(s => Math.round(s.t)),
    SCHEDULE.slice(0, 5),
  );
  expect(log.paints.map(({half, paint}) => [half, paint])).toEqual([
    ['increment', 'on'],
    ['increment', null],
    ['decrement', 'on'],
    ['decrement', null],
  ]);
  expectOneCommitAtRelease(log, 1);
});

test('a finger trembling on the edge during a hold adds no step', async ({
  page,
}) => {
  const {driver, plus, top} = await openStepper(page);
  await keepTouchInPage(page);
  // Across the column's top edge and back every frame from 800 to 1000 ms,
  // within the press's tracking area.
  const tremble = Array.from({length: 12}, (_, i) => ({
    t: 800 + i * 17,
    fingers: [{id: 0, x: plus.x, y: top + (i % 2 === 0 ? -6 : 4)}],
  }));
  await driver.play([
    {t: 0, fingers: [{id: 0, ...plus}]},
    ...tremble,
    {t: 1270, fingers: []},
  ]);
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  // The steady hold's steps, on the steady hold's times.
  expect(steps.map(s => s.value)).toEqual([3, 4, 5, 6]);
  expectSchedule(
    steps.map(s => Math.round(s.t)),
    SCHEDULE.slice(0, 4),
  );
  expectOneCommitAtRelease(log, 6);
});

test('on a page that scrolls, a delivered press keeps its touch: a slide up onto + carries the repeat', async ({
  page,
}) => {
  const {driver, plus, minus, top} = await openStepper(page);
  test.skip(
    !driver.drivesNativeGestures,
    'injected touches do not pan this engine natively; the hand-off is proven on the Android emulator',
  );
  await makePageScroll(page);
  const start = Number(
    await page
      .getByRole('spinbutton', {name: 'Quantity'})
      .getAttribute('aria-valuenow'),
  );
  // A press on − delivered after the content-touch delay (150 ms in a scroll
  // view), then slid up onto + (about 20 px, past the browser's slop, the way
  // the page scrolls) before any long press: a pan the browser would take,
  // which a tracking UIControl keeps. Held on + past its first step (+650 ms).
  const onPlus = {x: plus.x, y: (plus.y + top) / 2};
  await driver.play([
    {t: 0, fingers: [{id: 0, ...minus}]},
    ...moves(minus, onPlus, 300, 400),
    {t: 1300, fingers: []},
  ]);
  await page.waitForTimeout(300);
  // The page did not take the slide as a pan...
  expect(await page.evaluate(() => scrollY)).toBe(0);
  // ...and the repeat went on, on +.
  const log = await readLog(page);
  const steps = stepsOf(log);
  expect(steps.length).toBeGreaterThan(0);
  expect(steps.map(step => step.value)).toEqual(
    steps.map((_, i) => start + 1 + i),
  );
  expectOneCommitAtRelease(log, last(steps).value);
});

test('leaving the column pauses the repeat, and coming back resumes it with no step at once', async ({
  page,
}) => {
  const {driver, plus, bottom} = await openStepper(page);
  await keepTouchInPage(page);
  // Below the column, past the press's 70 pt tracking area.
  const below = {x: plus.x, y: bottom + 100};
  await driver.play([
    {t: 0, fingers: [{id: 0, ...plus}]},
    {t: 800, fingers: [{id: 0, ...below}]},
    {t: 2700, fingers: [{id: 0, ...plus}]},
    {t: 3000, fingers: []},
  ]);
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  const down = downTime(log);
  const movesAt = log.touches
    .filter(touch => touch.type === 'touchmove')
    .map(touch => touch.t - down);
  const out = movesAt.find(t => t > 700);
  const back = movesAt.find(t => t > 2600);
  if (out == null || back == null) {
    throw new Error(`moves not logged: ${JSON.stringify(movesAt)}`);
  }
  expect(steps.map(s => s.value)).toEqual([3, 4, 5]);
  expectSchedule(
    steps.slice(0, 2).map(s => Math.round(s.t)),
    [500, 750],
  );
  // Nothing while outside; back inside, the rest of the beat that was
  // running when the finger left (975 ms) runs first: no step at once.
  expect(steps[2].t - back).toBeGreaterThan(40);
  expect(Math.abs(steps[2].t - (back + (975 - out)))).toBeLessThanOrEqual(
    SLACK,
  );
  // The paint goes off when the finger leaves and comes back with it.
  expect(log.paints.map(({paint}) => paint)).toEqual(['on', null, 'on', null]);
  expectOneCommitAtRelease(log, 5);
});

test('under a finger each half takes at least the theme touch target square, and the layout does not move', async ({
  page,
}) => {
  const {driver} = await openStepper(page);
  const columnBox = async (p: Page) =>
    p.evaluate(() => {
      const column = document.querySelector(
        '[aria-label^="Increment"]',
      )?.parentElement;
      if (column == null) {
        throw new Error('no stepper column');
      }
      const {left, right, top, bottom} = column.getBoundingClientRect();
      return {left, right, top, bottom};
    });
  const column = await columnBox(page);
  // The theme's touch target, as the column reads it (44 px by default).
  const target = await page.evaluate(() => {
    const column = document.querySelector(
      '[aria-label^="Increment"]',
    )?.parentElement;
    return column == null
      ? 0
      : parseFloat(
          getComputedStyle(column).getPropertyValue('--size-touch-target'),
        );
  });
  expect(target).toBe(44);
  // Each half's reach past the column: one target square per half.
  const block = Math.max(0, target - (column.bottom - column.top) / 2);
  const inline = Math.max(0, (target - (column.right - column.left)) / 2);
  expect(block).toBeGreaterThan(0);
  const hits = await page.evaluate(
    ({box, block, inline}) => {
      const column = document.querySelector(
        '[aria-label^="Increment"]',
      )?.parentElement;
      const hits = (x: number, y: number) => {
        const element = document.elementFromPoint(x, y);
        return element != null && column?.contains(element) === true;
      };
      const midX = (box.left + box.right) / 2;
      const midY = (box.top + box.bottom) / 2;
      return {
        aboveInside: hits(midX, box.top - block + 1),
        aboveOutside: hits(midX, box.top - block - 2),
        belowInside: hits(midX, box.bottom + block - 1),
        belowOutside: hits(midX, box.bottom + block + 2),
        startInside: hits(box.left - inline + 1, midY - 4),
        endInside: hits(box.right + inline - 1, midY + 4),
      };
    },
    {box: column, block, inline},
  );
  expect(hits).toEqual({
    aboveInside: true,
    aboveOutside: false,
    belowInside: true,
    belowOutside: false,
    startInside: true,
    endInside: true,
  });
  // A tap in the reach above + steps +, once.
  await driver.play(
    hold({x: (column.left + column.right) / 2, y: column.top - block + 2}, 80),
  );
  await page.waitForTimeout(500);
  expectOneCommitAtRelease(await readLog(page), 3);
  // A tap in the reach focuses nothing (no on-screen keyboard comes up).
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(
    'BODY',
  );
  // The reach moves no layout: with it taken away, every box is where it was
  // (and the point above the column no longer reaches it).
  const boxes = async () =>
    page.evaluate(() => {
      const column = document.querySelector(
        '[aria-label^="Increment"]',
      )?.parentElement;
      const input = document.querySelector('[role="spinbutton"]');
      if (column?.parentElement == null || input == null) {
        throw new Error('no stepper column');
      }
      return [column, column.parentElement, input].map(element => {
        const {left, top, width, height} = element.getBoundingClientRect();
        return {left, top, width, height};
      });
    });
  const withReach = await boxes();
  await page.addStyleTag({
    content: '[data-no-reach]::before { content: none !important; }',
  });
  await page.evaluate(() => {
    document
      .querySelector('[aria-label^="Increment"]')
      ?.parentElement?.setAttribute('data-no-reach', '');
  });
  expect(await boxes()).toEqual(withReach);
  expect(
    await page.evaluate(
      ({x, y}) => {
        const column = document.querySelector(
          '[aria-label^="Increment"]',
        )?.parentElement;
        const element = document.elementFromPoint(x, y);
        return element != null && column?.contains(element) === true;
      },
      {x: (column.left + column.right) / 2, y: column.top - block + 1},
    ),
  ).toBe(false);
});

test('a scroll that starts on a stepper scrolls the page and steps nothing', async ({
  page,
}) => {
  const {driver, plus} = await openStepper(page);
  test.skip(
    !driver.drivesNativeGestures,
    'injected touches do not scroll this engine natively; the scroll hand-off is proven on the iOS simulator',
  );
  await makePageScroll(page);
  await driver.play([
    {t: 0, fingers: [{id: 0, ...plus}]},
    ...moves(plus, {x: plus.x, y: plus.y - 160}, 30, 230),
    {t: 260, fingers: []},
  ]);
  await expect
    .poll(async () => page.evaluate(() => scrollY))
    .toBeGreaterThan(0);
  await page.waitForTimeout(700);
  const log = await readLog(page);
  expect(log.shown).toEqual([]);
  expect(log.commits).toEqual([]);
  // The page is a scroll view, so the press waits for the content-touch
  // delay; a finger that moves before it is a scroll and paints nothing.
  expect(log.paints).toEqual([]);
});

test('inside a scrolling page, a held press reaches the stepper after the content-touch delay', async ({
  page,
}) => {
  const {driver, plus} = await openStepper(page);
  await makePageScroll(page);
  await driver.play(hold(plus, 1000));
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const down = touchTime(log, 'touchstart');
  // UIScrollView delivers a still finger after 150 ms; in one, UIStepper's
  // first step came at +653 ms. The ramp then runs from the delivery.
  expect(log.paints[0]).toMatchObject({half: 'increment', paint: 'on'});
  expect(Math.abs(log.paints[0].t - down - 150)).toBeLessThanOrEqual(SLACK);
  expectSchedule(
    stepsOf(log).map(s => Math.round(s.t)),
    [650, 900],
  );
  expectOneCommitAtRelease(log, 4);
});

test('inside a scrolling page, a quick tap steps at the lift and flashes the press', async ({
  page,
}) => {
  const {driver, plus} = await openStepper(page);
  await makePageScroll(page);
  await driver.play(hold(plus, 60));
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const up = touchTime(log, 'touchend');
  expect(log.shown.map(v => v.value)).toEqual([3]);
  expectOneCommitAtRelease(log, 3);
  // Quicker than the delay: the press shows at the lift for UIKit's 100 ms
  // flash.
  expect(log.paints.map(p => p.paint)).toEqual(['on', null]);
  expect(log.paints[0].t - up).toBeLessThan(20);
  expect(Math.abs(log.paints[1].t - log.paints[0].t - 100)).toBeLessThanOrEqual(
    SLACK,
  );
});

test('with a mouse, a held press repeats like a finger and commits once, at the release', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 402, height: 714},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  const {plus} = await openStepper(page);
  // A mouse: this context has no coarse pointer.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  await page.mouse.move(plus.x, plus.y);
  await page.mouse.down();
  await page.waitForTimeout(1230);
  await page.mouse.up();
  await page.waitForTimeout(400);
  const log = await readLog(page);
  const steps = stepsOf(log);
  expect(steps.map(s => s.value)).toEqual([3, 4, 5, 6]);
  expectSchedule(
    steps.map(s => Math.round(s.t)),
    SCHEDULE.slice(0, 4),
  );
  // One commit, at the release; the click after it adds nothing.
  expectOneCommitAtRelease(log, 6);
  expect(log.paints.map(({half, paint}) => [half, paint])).toEqual([
    ['increment', 'on'],
    ['increment', null],
  ]);
  // A mouse press moves focus to the field, as a click on a spin button does.
  await expect(page.getByRole('spinbutton', {name: 'Quantity'})).toBeFocused();
  await context.close();
});

test('after a scroll takes the touch, a click with no pointer still steps', async ({
  page,
}) => {
  // A screen reader's activation or a programmatic click() has detail 0 and
  // no pointerdown. No click follows a touch a scroll took, so that press must
  // leave nothing behind that would swallow the next activation.
  const {driver, plus} = await openStepper(page);
  test.skip(
    !driver.drivesNativeGestures,
    'injected touches do not scroll this engine natively; the cancel path is covered in jsdom',
  );
  await makePageScroll(page);
  await driver.play([
    {t: 0, fingers: [{id: 0, ...plus}]},
    ...moves(plus, {x: plus.x, y: plus.y - 160}, 30, 230),
    {t: 260, fingers: []},
  ]);
  await expect
    .poll(async () => page.evaluate(() => scrollY))
    .toBeGreaterThan(0);
  await page.waitForTimeout(700);
  expect((await readLog(page)).commits).toEqual([]);
  await page.evaluate(() => {
    const increment = document.querySelector('button[aria-label^="Increment"]');
    if (!(increment instanceof HTMLElement)) {
      throw new Error('no increment button');
    }
    increment.click();
  });
  await page.waitForTimeout(200);
  expect((await readLog(page)).commits.map(({value}) => value)).toEqual([3]);
});

test('a step made late by a blocked main thread runs once, and the cadence resumes from it', async ({
  page,
}, testInfo) => {
  const {driver, plus} = await openStepper(page);
  const playing = driver.play(hold(plus, 2800));
  await expect
    .poll(async () => (await readLog(page)).shown.length, {intervals: [20]})
    .toBe(2);
  // Hold the main thread past the 975 ms beat.
  const block = await blockMainThread(page, 700);
  await playing;
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const after = log.shown.filter(v => v.t > block.from);
  await writeEvidence(
    'busy-main-thread/numberinput-stepper-hold',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify({block, log}, null, 1),
    },
    testInfo,
  );
  // The beat the block swallowed runs once, right after it; the next one is a
  // full interval later (202.5 ms after a third step: no catch-up burst).
  expect(after.length).toBeGreaterThanOrEqual(2);
  expect(after[0].t - block.to).toBeLessThan(SLACK);
  expect(after[1].t - after[0].t).toBeGreaterThan(202.5 - SLACK);
  expect(after[1].t - after[0].t).toBeLessThan(202.5 + SLACK);
});

test(
  'storyboard: a tap, a hold, a slide, leaving and coming back, and a hold in a scrolling page',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    // The value the field shows (a press's value while it lasts).
    const value = async () =>
      Number(
        await page.getByRole('spinbutton', {name: 'Quantity'}).inputValue(),
      );
    const paint = async () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('[aria-label$="Quantity"]'))
          .filter(el => el.tagName === 'BUTTON')
          .map(el => el.getAttribute('data-astryx-press') ?? '-')
          .join(' '),
      );
    const board = (name: string, clip: ClipBox) =>
      new Storyboard(page, {name, clip, columns: 6, cellScale: 1});
    const shoot = async (b: Storyboard, label: string, t: number) =>
      b.capture(label, t, {value: await value(), paint: await paint()});
    /** Starts one take's clock on the page: the moment of its first touch. */
    const armTouchClock = async () =>
      page.evaluate(() => {
        const take = window as unknown as {takeDown?: number | null};
        take.takeDown = null;
        document.addEventListener(
          'touchstart',
          () => {
            take.takeDown ??= performance.now();
          },
          {capture: true, passive: true},
        );
      });
    /**
     * Waits on the page's own clock until `at` ms after the take's first
     * touch, so the host's load cannot move a moment onto the next step.
     */
    const untilPage = async (at: number) =>
      page.evaluate(
        async after =>
          new Promise<void>(resolve => {
            const take = window as unknown as {takeDown?: number | null};
            const tick = () => {
              if (
                take.takeDown != null &&
                performance.now() - take.takeDown >= after
              ) {
                resolve();
              } else {
                requestAnimationFrame(tick);
              }
            };
            tick();
          }),
        at,
      );
    /** Plays `script` and photographs the field at each of `moments` (ms). */
    async function filmed(
      b: Storyboard,
      driver: TouchDriver,
      script: TouchScript,
      moments: [number, string][],
    ) {
      await shoot(b, 'before', -1);
      await armTouchClock();
      const playing = driver.play(script);
      for (const [at, label] of moments) {
        await untilPage(at);
        await shoot(b, label, at);
      }
      await playing;
      await page.waitForTimeout(150);
      await shoot(b, 'lifted', last(script).t + 150);
    }

    // Each board starts from the story as it loads: 2, counting 0 to 10. The
    // moments sit between the hold's steps (500, 750, 975, 1177.5, 1359.75,
    // 1523.8 … ms).
    let stepper = await openStepper(page);
    const tap = board('numberinput-stepper-tap', stepper.clip);
    await filmed(tap, stepper.driver, hold(stepper.plus, 250), [
      [100, 'finger down on +'],
    ]);
    stepper = await openStepper(page);
    const held = board('numberinput-stepper-hold', stepper.clip);
    await filmed(held, stepper.driver, hold(stepper.plus, 2400), [
      [200, 'held, before 0.5 s'],
      [620, 'first step at 0.5 s'],
      [860, 'the next 250 ms later'],
      [1440, 'the ramp quickens'],
      [2200, 'stopped at the maximum'],
    ]);
    stepper = await openStepper(page);
    await keepTouchInPage(page);
    const slide = board('numberinput-stepper-slide', stepper.clip);
    await filmed(
      slide,
      stepper.driver,
      [
        {t: 0, fingers: [{id: 0, ...stepper.plus}]},
        ...moves(stepper.plus, stepper.minus, 780, 840),
        {t: 1250, fingers: []},
      ],
      [
        [620, 'held on +'],
        [900, 'slid onto −'],
        [1080, '− steps on the beat'],
      ],
    );
    stepper = await openStepper(page);
    await keepTouchInPage(page);
    const below = {x: stepper.plus.x, y: stepper.bottom + 100};
    const leave = board('numberinput-stepper-leave', stepper.clip);
    await filmed(
      leave,
      stepper.driver,
      [
        {t: 0, fingers: [{id: 0, ...stepper.plus}]},
        {t: 760, fingers: [{id: 0, ...below}]},
        {t: 2000, fingers: [{id: 0, ...stepper.plus}]},
        {t: 2360, fingers: []},
      ],
      [
        [620, 'held on +'],
        [1200, 'finger off the stepper'],
        [1900, 'nothing steps outside'],
        [2080, 'back on +: no step at once'],
        [2300, 'the paused beat resumes'],
      ],
    );
    stepper = await openStepper(page);
    await makePageScroll(page);
    const scroller = board('numberinput-stepper-scroller-hold', stepper.clip);
    await filmed(scroller, stepper.driver, hold(stepper.plus, 1000), [
      [60, 'held, before the delay'],
      [300, 'reached at 150 ms'],
      [780, 'first step at 0.65 s'],
    ]);
    for (const b of [tap, held, slide, leave, scroller]) {
      await b.write(testInfo);
    }
    // The traces are the assertion; the sheets are the evidence.
    const values = (b: Storyboard) => b.frames.map(f => f.data.value as number);
    const paints = (b: Storyboard) => b.frames.map(f => f.data.paint as string);
    expect(values(tap)).toEqual([2, 2, 3]);
    expect(paints(tap)).toEqual(['- -', 'on -', '- -']);
    expect(values(held)).toEqual([2, 2, 3, 4, 7, 10, 10]);
    expect(paints(held).slice(1, 6)).toEqual(Array(5).fill('on -'));
    expect(paints(held).at(-1)).toBe('- -');
    // + steps at 500 and 750 ms, the finger slides at 0.8 s, − steps at 975
    // and 1177.5 ms.
    expect(values(slide)).toEqual([2, 3, 4, 3, 2]);
    expect(paints(slide)).toEqual(['- -', 'on -', '- on', '- on', '- -']);
    // Out at 760 ms with 215 ms of the 975 ms beat left; back at 2 s, so the
    // next step comes at 2215 ms.
    expect(values(leave)).toEqual([2, 3, 4, 4, 4, 5, 5]);
    expect(paints(leave)).toEqual([
      '- -',
      'on -',
      '- -',
      '- -',
      'on -',
      'on -',
      '- -',
    ]);
    expect(values(scroller)).toEqual([2, 2, 2, 3, 4]);
    expect(paints(scroller)).toEqual(['- -', '- -', 'on -', 'on -', '- -']);
  },
);

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInputStepperHold.interaction.browser.spec.ts
 * @input The built "With Number Steppers" NumberInput story, real touch input
 *   (Chromium CDP / WebKit's input command) and the interaction harness
 * @output Interaction proofs for the steppers under a finger, against
 *   UIStepper's measured behavior (motion/uikit/stepper.ts): a tap steps once
 *   at the lift and paints only while the finger is down; a hold steps at
 *   0.5 s and repeats on UIStepper's cadence; a slide onto the other half
 *   carries the paint and the repeat; leaving the column stops the repeat and
 *   coming back steps at once; a scroll that starts on a stepper scrolls and
 *   steps nothing; a step made late by a blocked main thread runs once, with
 *   no burst; storyboards of a tap, a hold and a slide
 * @position NumberInput's `*.interaction.browser.spec.ts`, shaped like the
 *   harness exemplar (BottomSheetDetent). Times are read in the page, on its
 *   own clock, from the value and press-paint mutations the steps produce.
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
/** UIStepper, iOS 26.2: value changes during a hold on +, ms after touch-down. */
const UIKIT_HOLD = [514, 1017, 1520, 2023, 2525, 3028, 3130, 3233];
/** The same steps on the schedule motion/uikit/stepper.ts gives. */
const SCHEDULE = [500, 1000, 1500, 2000, 2500, 3000, 3100, 3200];

interface Log {
  values: {t: number; value: number}[];
  paints: {
    t: number;
    half: 'increment' | 'decrement';
    from: string | null;
    paint: string | null;
  }[];
  touches: {t: number; type: string}[];
}

interface Stepper {
  driver: TouchDriver;
  plus: Point;
  minus: Point;
  /** The column's top edge, CSS px. */
  top: number;
  clip: ClipBox;
}

/** Records every value change, press paint and touch, in epoch ms on the page clock. */
function installLog(): void {
  const now = () => performance.timeOrigin + performance.now();
  const log: Log = {values: [], paints: [], touches: []};
  (window as unknown as {stepperLog: Log}).stepperLog = log;
  const input = document.querySelector('[role="spinbutton"]');
  const plus = document.querySelector('[aria-label^="Increment"]');
  const minus = document.querySelector('[aria-label^="Decrement"]');
  if (input == null || plus == null || minus == null) {
    throw new Error('no stepper');
  }
  new MutationObserver(() => {
    log.values.push({
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
  for (const type of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) {
    document.addEventListener(type, () => log.touches.push({t: now(), type}), {
      capture: true,
      passive: true,
    });
  }
}

const readLog = async (page: Page): Promise<Log> =>
  page.evaluate(() => (window as unknown as {stepperLog: Log}).stepperLog);

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
    clip: {
      x: left,
      y: top,
      width: Math.ceil(plusBox.x + plusBox.width + 12) - left,
      height: Math.ceil(minusBox.y + minusBox.height + 12) - top,
    },
  };
}

/**
 * Turns the page's own panning off. The steppers never claim a touch (a
 * control stays passive, so scrolling never waits on script): a drag the
 * page can pan is the browser's, which cancels the press (the scroll test
 * below). With panning off the browser keeps feeding the touch to the page,
 * which is what a slide between the halves and a finger outside the column
 * need to be seen at all.
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

/** Step times and values, relative to the first touch-down. */
function stepsOf(log: Log): {t: number; value: number}[] {
  const down = log.touches.find(touch => touch.type === 'touchstart')?.t;
  if (down == null) {
    throw new Error('no touchstart logged');
  }
  return log.values.map(({t, value}) => ({t: t - down, value}));
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
  const down = log.touches.find(touch => touch.type === 'touchstart')!.t;
  const up = log.touches.find(touch => touch.type === 'touchend')!.t;
  expect(log.values.map(v => v.value)).toEqual([3]);
  // The step lands at the lift, not at touch-down.
  expect(log.values[0].t).toBeGreaterThanOrEqual(up - 1);
  expect(log.values[0].t - up).toBeLessThan(SLACK);
  // The touched half lights in the touch-down frame and clears at the lift,
  // with no fade (UIStepper's fill switches in one frame both ways).
  expect(log.paints.map(({half, paint}) => [half, paint])).toEqual([
    ['increment', 'on'],
    ['increment', null],
  ]);
  expect(log.paints[0].t - down).toBeLessThan(20);
  expect(log.paints[1].t - up).toBeLessThan(20);
});

test('a hold steps at 0.5 s, repeats on UIStepper’s cadence and stops at the bound', async ({
  page,
}, testInfo) => {
  const {driver, plus} = await openStepper(page);
  await driver.play(hold(plus, 3450));
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  // The story counts 0 to 10 from 2: eight steps reach the maximum, and the
  // finger held on past it steps no more (UIStepper: 8, 9, 10, then nothing).
  expect(steps.map(s => s.value)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
  const times = steps.map(s => Math.round(s.t));
  expectSchedule(times, SCHEDULE);
  // Against UIKit's own times on the same hold (its timer re-arms after each
  // step's work, so it drifts later by a few ms per step).
  const parity = times.map((t, i) => UIKIT_HOLD[i] - t);
  testInfo.annotations.push({
    type: 'uikit-parity',
    description: `step times vs UIStepper: ${parity.map(d => `${d >= 0 ? '+' : ''}${d}`).join(', ')} ms`,
  });
  await writeEvidence(
    'traces/numberinput-stepper-hold',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {steps: times, schedule: SCHEDULE, uikit: UIKIT_HOLD, log},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const delta of parity) {
    expect(Math.abs(delta)).toBeLessThanOrEqual(SLACK + 40);
  }
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
    ...moves(plus, minus, 1100, 1200),
    {t: 2600, fingers: []},
  ]);
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  // + at 0.5 and 1 s, then − on the same beat: 1.5, 2 and 2.5 s.
  expect(steps.map(s => s.value)).toEqual([3, 4, 3, 2, 1]);
  expectSchedule(
    steps.map(s => Math.round(s.t)),
    [500, 1000, 1500, 2000, 2500],
  );
  expect(log.paints.map(({half, paint}) => [half, paint])).toEqual([
    ['increment', 'on'],
    ['increment', null],
    ['decrement', 'on'],
    ['decrement', null],
  ]);
});

test('leaving the column stops the repeat, and coming back steps at once', async ({
  page,
}) => {
  const {driver, plus, top} = await openStepper(page);
  await keepTouchInPage(page);
  const above = {x: plus.x, y: top - 14};
  await driver.play([
    {t: 0, fingers: [{id: 0, ...plus}]},
    ...moves(plus, above, 1100, 1200),
    ...moves(above, plus, 2700, 2800),
    {t: 3000, fingers: []},
  ]);
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const steps = stepsOf(log);
  const down = log.touches.find(touch => touch.type === 'touchstart')!.t;
  // The first move back inside the column, after the 1.5 s outside.
  const back = log.touches
    .filter(touch => touch.type === 'touchmove' && touch.t - down > 2700)
    .map(touch => touch.t - down);
  expect(steps.map(s => s.value)).toEqual([3, 4, 5]);
  expectSchedule(
    steps.slice(0, 2).map(s => Math.round(s.t)),
    [500, 1000],
  );
  // Nothing while outside; the return steps within the moves that bring the
  // finger back (2.7–2.8 s), not on a beat of the old cadence.
  expect(steps[2].t).toBeGreaterThan(back[0]);
  expect(steps[2].t).toBeLessThan(back.at(-1)! + SLACK);
  // The paint goes off when the finger leaves and comes back with it.
  expect(log.paints.map(({paint}) => paint)).toEqual(['on', null, 'on', null]);
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
  expect(log.values).toEqual([]);
  // The page is a scroll view, so the press waits for the content-touch
  // delay; a finger that moves before it is a scroll and paints nothing.
  expect(log.paints).toEqual([]);
});

test('inside a scrolling page, a held press reaches the stepper after the content-touch delay', async ({
  page,
}) => {
  const {driver, plus} = await openStepper(page);
  await makePageScroll(page);
  await driver.play(hold(plus, 1250));
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const down = log.touches.find(touch => touch.type === 'touchstart')!.t;
  // UIScrollView delivers a still finger after 150 ms; in one, UIStepper's
  // first step came at +653 ms and its second at +1155 ms.
  expect(log.paints[0]).toMatchObject({half: 'increment', paint: 'on'});
  expect(Math.abs(log.paints[0].t - down - 150)).toBeLessThanOrEqual(SLACK);
  expectSchedule(
    stepsOf(log).map(s => Math.round(s.t)),
    [650, 1150],
  );
});

test('inside a scrolling page, a quick tap steps at the lift and flashes the press', async ({
  page,
}) => {
  const {driver, plus} = await openStepper(page);
  await makePageScroll(page);
  await driver.play(hold(plus, 60));
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const up = log.touches.find(touch => touch.type === 'touchend')!.t;
  expect(log.values.map(v => v.value)).toEqual([3]);
  expect(log.values[0].t - up).toBeLessThan(SLACK);
  // Quicker than the delay: the press shows at the lift for UIKit's 100 ms
  // flash.
  expect(log.paints.map(p => p.paint)).toEqual(['on', null]);
  expect(log.paints[0].t - up).toBeLessThan(20);
  expect(Math.abs(log.paints[1].t - log.paints[0].t - 100)).toBeLessThanOrEqual(
    SLACK,
  );
});

test('a step made late by a blocked main thread runs once, and the cadence resumes from it', async ({
  page,
}, testInfo) => {
  const {driver, plus} = await openStepper(page);
  const playing = driver.play(hold(plus, 2800));
  await expect
    .poll(async () => (await readLog(page)).values.length, {intervals: [20]})
    .toBe(2);
  // Hold the main thread past the 1.5 s beat.
  const block = await blockMainThread(page, 700);
  await playing;
  await page.waitForTimeout(600);
  const log = await readLog(page);
  const after = log.values.filter(v => v.t > block.from);
  await writeEvidence(
    'busy-main-thread/numberinput-stepper-hold',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify({block, log}, null, 1),
    },
    testInfo,
  );
  // The beat the block swallowed runs once, right after it; the next one is a
  // full interval later (no catch-up burst).
  expect(after.length).toBeGreaterThanOrEqual(2);
  expect(after[0].t - block.to).toBeLessThan(SLACK);
  expect(after[1].t - after[0].t).toBeGreaterThan(500 - SLACK);
  expect(after[1].t - after[0].t).toBeLessThan(500 + SLACK);
});

test(
  'storyboard: a tap, a hold, a slide, leaving and coming back, and a hold in a scrolling page',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const value = async () =>
      Number(
        await page
          .getByRole('spinbutton', {name: 'Quantity'})
          .getAttribute('aria-valuenow'),
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
    /** Plays `script` and photographs the field at each of `moments` (ms). */
    async function filmed(
      b: Storyboard,
      driver: TouchDriver,
      script: TouchScript,
      moments: [number, string][],
    ) {
      await shoot(b, 'before', -1);
      const started = Date.now();
      const playing = driver.play(script);
      for (const [at, label] of moments) {
        await page.waitForTimeout(Math.max(0, at - (Date.now() - started)));
        await shoot(b, label, at);
      }
      await playing;
      await page.waitForTimeout(150);
      await shoot(b, 'lifted', script.at(-1)!.t + 150);
    }

    // Each board starts from the story as it loads: 2, counting 0 to 10.
    let stepper = await openStepper(page);
    const tap = board('numberinput-stepper-tap', stepper.clip);
    await filmed(tap, stepper.driver, hold(stepper.plus, 250), [
      [100, 'finger down on +'],
    ]);
    stepper = await openStepper(page);
    const held = board('numberinput-stepper-hold', stepper.clip);
    await filmed(held, stepper.driver, hold(stepper.plus, 3400), [
      [200, 'held, before 0.5 s'],
      [700, 'first step at 0.5 s'],
      [1200, 'second at 1 s'],
      [3150, 'every 0.1 s after 3 s'],
      [3300, 'stopped at the maximum'],
    ]);
    stepper = await openStepper(page);
    await keepTouchInPage(page);
    const slide = board('numberinput-stepper-slide', stepper.clip);
    await filmed(
      slide,
      stepper.driver,
      [
        {t: 0, fingers: [{id: 0, ...stepper.plus}]},
        ...moves(stepper.plus, stepper.minus, 1100, 1200),
        {t: 2100, fingers: []},
      ],
      [
        [700, 'held on +'],
        [1300, 'slid onto −'],
        [1700, '− steps on the beat'],
      ],
    );
    stepper = await openStepper(page);
    await keepTouchInPage(page);
    const above = {x: stepper.plus.x, y: stepper.top - 14};
    const leave = board('numberinput-stepper-leave', stepper.clip);
    await filmed(
      leave,
      stepper.driver,
      [
        {t: 0, fingers: [{id: 0, ...stepper.plus}]},
        ...moves(stepper.plus, above, 1100, 1200),
        ...moves(above, stepper.plus, 2700, 2800),
        {t: 3000, fingers: []},
      ],
      [
        [700, 'held on +'],
        [1400, 'finger above the column'],
        [2500, 'nothing steps outside'],
        [2900, 'back inside: steps at once'],
      ],
    );
    stepper = await openStepper(page);
    await makePageScroll(page);
    const scroller = board('numberinput-stepper-scroller-hold', stepper.clip);
    await filmed(scroller, stepper.driver, hold(stepper.plus, 1250), [
      [60, 'held, before the delay'],
      [300, 'reached at 150 ms'],
      [800, 'first step at 0.65 s'],
    ]);
    for (const b of [tap, held, slide, leave, scroller]) {
      await b.write(testInfo);
    }
    // The traces are the assertion; the sheets are the evidence.
    const values = (b: Storyboard) => b.frames.map(f => f.data.value as number);
    const paints = (b: Storyboard) => b.frames.map(f => f.data.paint as string);
    expect(values(tap)).toEqual([2, 2, 3]);
    expect(paints(tap)).toEqual(['- -', 'on -', '- -']);
    expect(values(held)).toEqual([2, 2, 3, 4, 9, 10, 10]);
    expect(paints(held).slice(1, 6)).toEqual(Array(5).fill('on -'));
    expect(paints(held).at(-1)).toBe('- -');
    // + steps at 0.5 and 1 s, the finger slides at 1.1 s, − steps at 1.5 and 2 s.
    expect(values(slide)).toEqual([2, 3, 4, 3, 2]);
    expect(paints(slide)).toEqual(['- -', 'on -', '- on', '- on', '- -']);
    expect(values(leave)).toEqual([2, 3, 4, 4, 5, 5]);
    expect(paints(leave)).toEqual(['- -', 'on -', '- -', '- -', 'on -', '- -']);
    expect(values(scroller)).toEqual([2, 2, 2, 3, 4]);
    expect(paints(scroller)).toEqual(['- -', '- -', 'on -', 'on -', '- -']);
  },
);

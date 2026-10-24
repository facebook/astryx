// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file gestures.browser.spec.ts
 * @input The gesture fixture bundled with esbuild, a phone-sized touch
 *   screen, and real engine touch input: Chromium through CDP with explicit
 *   timestamps, WebKit through its own input command (real-time pacing)
 * @output Browser proof of the negotiation the unit tests cannot see:
 *   touch-action per element, touchmove cancelled exactly while a recognizer
 *   owns the finger, native scrolling untouched otherwise, click suppression
 *   with no ghost click, scroll handoff at the content's edge, pinch-zoom
 *   left to the browser, a second finger that never breaks the first, and
 *   timing taken from event timestamps under a blocked main thread
 * @position Browser tests of packages/core/src/gestures (see
 *   playwright.config.ts beside this file). WebKit's Linux build cannot
 *   scroll, fling or pinch-zoom from injected touches, and synthesises a
 *   click only from its tap gesture; the checks that need those run in
 *   Chromium here and in Mobile Safari on the iOS simulator.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  bundleFixture,
  center,
  drag,
  openFixture,
  type Driver,
  type Point,
  type Step,
} from './drivers';

interface Entry {
  name: string;
  state: string;
  time: number;
  x?: number;
  y?: number;
  scale?: number;
  handoff?: boolean;
  beganAt?: number | null;
  startedAt?: number;
}

let bundle = '';

test.beforeAll(async () => {
  bundle = await bundleFixture('fixture.ts');
});

const open = async (page: Page, engine: string): Promise<Driver> =>
  openFixture(page, engine, bundle);

async function log(page: Page): Promise<Entry[]> {
  await page.waitForTimeout(50);
  return page.evaluate(() => window.__gestures);
}

async function clearLog(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__gestures.length = 0;
  });
}

async function scrollTop(page: Page, id: string): Promise<number> {
  return page.evaluate(
    target => document.getElementById(target)?.scrollTop ?? -1,
    id,
  );
}

/** Record whether each touchmove reached the page cancelled. */
async function logTouchMoves(page: Page): Promise<void> {
  await page.evaluate(() => {
    const moves: boolean[] = [];
    (window as unknown as {__moves: boolean[]}).__moves = moves;
    window.addEventListener(
      'touchmove',
      event => moves.push(event.defaultPrevented),
      {passive: true},
    );
  });
}

async function readTouchMoves(page: Page): Promise<boolean[]> {
  return page.evaluate(
    () => (window as unknown as {__moves: boolean[]}).__moves,
  );
}

const states = (entries: Entry[], name: string) =>
  entries.filter(entry => entry.name === name).map(entry => entry.state);

test('derives touch-action per element from its recognizers', async ({
  page,
  browserName,
}) => {
  await open(page, browserName);
  const actions = await page.evaluate(() =>
    Object.fromEntries(
      ['hpan', 'tapper', 'presser', 'pinchable', 'sheetBody'].map(id => [
        id,
        getComputedStyle(document.getElementById(id) as HTMLElement)
          .touchAction,
      ]),
    ),
  );
  expect(actions).toEqual({
    hpan: 'pan-y pinch-zoom',
    tapper: 'manipulation',
    presser: 'manipulation',
    pinchable: 'none',
    sheetBody: 'auto',
  });
});

test('only elements whose recognizers claim a moving touch carry a blocking touchmove listener', async ({
  page,
  browserName,
}) => {
  await open(page, browserName);
  const blocking = await page.evaluate(() =>
    window.__listeners
      .filter(entry => entry.type === 'touchmove' && entry.passive === false)
      .map(entry => entry.id),
  );
  // Pans (the cards' too), a long press, a pinch and the sheet's pan can take
  // a moving touch; a tap-only element and a press consumer never wait.
  expect(new Set(blocking)).toEqual(
    new Set(['hpan', 'presser', 'pinchable', 'sheetBody', 'card', 'cardLate']),
  );
});

test('a horizontal drag on a pan-y element is the recognizer’s: cancelled moves, no scroll, no click', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  await logTouchMoves(page);
  const start = await center(page, 'hbutton');
  // A 4:1 drag, the shape WebKit would otherwise pan natively.
  await driver.play(drag(start, {x: start.x + 120, y: start.y + 30}));
  const entries = await log(page);
  const hpan = states(entries, 'hpan');
  expect(hpan[0]).toBe('began');
  expect(hpan.slice(-2)).toEqual(['ended', 'possible']);
  const last = entries
    .filter(entry => entry.name === 'hpan' && entry.state === 'changed')
    .at(-1);
  // As in UIKit, the 10 px hysteresis is not part of the translation.
  expect(last?.x).toBeCloseTo(120 - 10, 0);
  // Every touchmove after the claim was cancelled.
  const moves = await readTouchMoves(page);
  expect(moves.length).toBeGreaterThan(0);
  expect(moves.slice(-3).every(Boolean)).toBe(true);
  expect(await scrollTop(page, 'scroller')).toBe(0);
  expect(entries.some(entry => entry.name.startsWith('click:'))).toBe(false);
  expect(entries.some(entry => entry.name.startsWith('mousedown:'))).toBe(
    false,
  );
});

test('a vertical drag on the same element fails the pan and is never cancelled', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  await logTouchMoves(page);
  const start = await center(page, 'hpan');
  await driver.play(drag(start, {x: start.x + 4, y: start.y - 120}));
  const entries = await log(page);
  expect(states(entries, 'hpan')).toEqual(['failed', 'possible']);
  expect((await readTouchMoves(page)).some(Boolean)).toBe(false);
  if (driver.engine === 'chromium') {
    // The browser scrolled it natively.
    expect(await scrollTop(page, 'scroller')).toBeGreaterThan(60);
  }
  expect(entries.some(entry => entry.name.startsWith('click:'))).toBe(false);
});

test('a horizontal drag on a passive pan-y control keeps its press: uncancelable moves the browser cannot pan are not a claim', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  await page.evaluate(() => {
    document.getElementById('passive')?.scrollIntoView({block: 'center'});
  });
  const start = await center(page, 'passive');
  await driver.play(
    drag({x: start.x - 120, y: start.y}, {x: start.x + 120, y: start.y + 6}),
  );
  const consumed = (await log(page))
    .filter(entry => entry.name === 'passive')
    .map(entry => entry.state);
  expect(consumed[0]).toBe('began');
  expect(consumed).not.toContain('cancelled');
  expect(consumed.at(-1)).toBe('ended');
});

test('a one-way overlay pan keeps its direction from the page, and leaves the other way to it', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'needs native scrolling from injected touches (Mobile Safari on the simulator)',
  );
  const driver = await open(page, browserName);
  await page.evaluate(() => {
    document.getElementById('card')?.scrollIntoView({block: 'center'});
  });
  const before = await page.evaluate(() => window.scrollY);
  const start = await center(page, 'card');
  // Up, slowly: the card's pan begins at 10 px and the page never moves.
  await driver.play(drag(start, {x: start.x, y: start.y - 40}, 40));
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  const up = (await log(page)).filter(entry => entry.name === 'card');
  expect(up[0]?.state).toBe('began');
  expect(up.filter(entry => entry.state === 'changed').at(-1)?.y).toBe(-30);
  // Down: the page's.
  await clearLog(page);
  await driver.play(drag(start, {x: start.x, y: start.y + 60}, 30));
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(before - 20);
  expect(states(await log(page), 'card')).toEqual(['failed', 'possible']);
});

test('a tap recognizer replaces the click: no ghost click, no compatibility mouse events', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  await driver.tap(await center(page, 'tapper'));
  let entries = await log(page);
  expect(states(entries, 'tap')).toEqual(['ended', 'possible']);
  expect(entries.filter(entry => entry.state === 'dom')).toEqual([]);

  // A tap the pan does not take keeps its click (exactly one).
  await clearLog(page);
  await driver.tap(await center(page, 'hbutton'));
  entries = await log(page);
  expect(entries.filter(entry => entry.name === 'click:hbutton')).toHaveLength(
    1,
  );
});

test('scroll handoff: at the top the pull is the sheet’s at once', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  const start = await center(page, 'sheetBody');
  await driver.play(drag(start, {x: start.x, y: start.y + 96}));
  const entries = await log(page);
  const sheet = entries.filter(entry => entry.name === 'sheet');
  expect(sheet[0]?.state).toBe('began');
  expect(sheet[0]?.handoff).toBe(false);
  expect(
    sheet.filter(entry => entry.state === 'changed').at(-1)?.y,
  ).toBeCloseTo(96 - 10, 0);
  expect(await scrollTop(page, 'sheetBody')).toBe(0);
});

test('scroll handoff: mid-content the browser scrolls first and the sheet takes the rest', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'needs native scrolling from injected touches (Mobile Safari on the simulator)',
  );
  const driver = await open(page, browserName);
  await page.evaluate(() => {
    (document.getElementById('sheetBody') as HTMLElement).scrollTop = 60;
  });
  const start = await center(page, 'sheetBody');
  start.y -= 60;
  await driver.play(drag(start, {x: start.x, y: start.y + 200}, 25));
  const entries = await log(page);
  const sheet = entries.filter(entry => entry.name === 'sheet');
  expect(await scrollTop(page, 'sheetBody')).toBe(0);
  expect(sheet[0]?.state).toBe('began');
  expect(sheet[0]?.handoff).toBe(true);
  // The content took the first 60 px (and the browser its touch slop); the
  // sheet got the rest of the finger's travel.
  const final = sheet.filter(entry => entry.state === 'changed').at(-1)?.y ?? 0;
  expect(final).toBeGreaterThan(200 - 60 - 24);
  expect(final).toBeLessThanOrEqual(200 - 60 + 1);
});

/** Two fingers that land one after the other and spread apart. */
function spread(at: Point, from: number, by: number, drift = 0): Step[] {
  const steps: Step[] = [
    {t: 0, down: [{x: at.x - from, y: at.y, id: 1}]},
    {
      t: 30,
      down: [
        {x: at.x - from, y: at.y, id: 1},
        {x: at.x + from, y: at.y, id: 2},
      ],
    },
  ];
  for (let i = 1; i <= 12; i++) {
    const half = from + (by * i) / 12;
    steps.push({
      t: 30 + i * 16,
      down: [
        {x: at.x - half + drift * i, y: at.y, id: 1},
        {x: at.x + half + drift * i, y: at.y, id: 2},
      ],
    });
  }
  steps.push({t: 30 + 13 * 16, down: []});
  return steps;
}

test('pinch-zoom stays the browser’s on an element without a pinch recognizer', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'needs native pinch-zoom from injected touches (Mobile Safari on the simulator)',
  );
  const driver = await open(page, browserName);
  await driver.play(spread(await center(page, 'tapper'), 20, 96));
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(() => window.visualViewport?.scale ?? 1),
  ).toBeGreaterThan(1.2);
  expect(states(await log(page), 'tap')).not.toContain('ended');
});

test('a pinch recognizer takes the two-finger gesture on its element only, alongside its pan', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  await driver.play(spread(await center(page, 'pinchable'), 20, 40, 1));
  const entries = await log(page);
  expect(states(entries, 'pinch')[0]).toBe('began');
  const scale = entries
    .filter(entry => entry.name === 'pinch' && entry.state === 'changed')
    .at(-1)?.scale;
  // The span grew from 40 to 120; as in UIKit, the scale is measured from
  // the starting span moved by the 8 px hysteresis.
  expect(scale).toBeCloseTo(120 / (40 + 8), 1);
  expect(states(entries, 'pinchPan')).toContain('began');
  expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
});

test('a second finger never breaks a claimed one-finger pan', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  const start = await center(page, 'hbutton');
  const other = await center(page, 'tapper');
  const steps: Step[] = [{t: 0, down: [{...start, id: 1}]}];
  for (let i = 1; i <= 4; i++) {
    steps.push({t: i * 16, down: [{x: start.x + i * 10, y: start.y, id: 1}]});
  }
  const first = {x: start.x + 40, y: start.y, id: 1};
  steps.push({t: 80, down: [first, {...other, id: 2}]});
  for (let i = 1; i <= 6; i++) {
    steps.push({
      t: 80 + i * 16,
      down: [
        {x: first.x + i * 5, y: first.y, id: 1},
        {x: other.x + i * 15, y: other.y + i * 15, id: 2},
      ],
    });
  }
  steps.push({
    t: 200,
    down: [{x: other.x + 90, y: other.y + 90, id: 2}],
  });
  steps.push({t: 216, down: []});
  await driver.play(steps);
  const entries = await log(page);
  const hpan = entries.filter(entry => entry.name === 'hpan');
  expect(hpan.map(entry => entry.state)).not.toContain('cancelled');
  expect(hpan.map(entry => entry.state)).toContain('ended');
  expect(hpan.filter(entry => entry.state === 'changed').at(-1)?.x).toBeCloseTo(
    70 - 10,
    0,
  );
  expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(1);
});

test('a long press begins at touch-down + 500 ms on the event clock, even when the main thread was blocked', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  const at = await center(page, 'presser');
  const base = await driver.play([{t: 0, down: [{...at, id: 1}]}]);
  // Block the main thread well past the press duration.
  await page.evaluate(() => {
    const end = performance.now() + 800;
    while (performance.now() < end) {
      // busy
    }
  });
  await page.waitForTimeout(100);
  await driver.play([{t: 0, down: []}]);
  const entries = await log(page);
  const began = entries.find(
    entry => entry.name === 'press' && entry.state === 'began',
  );
  if (driver.engine === 'chromium') {
    // The touch carries the timestamp CDP gave it (to the browser's 0.1 ms
    // timestamp precision).
    expect(Math.abs((began?.startedAt ?? 0) - base)).toBeLessThan(0.5);
  }
  // The press began exactly 500 ms after the touch, though the timer that
  // noticed it ran 300 ms late.
  expect((began?.beganAt ?? 0) - (began?.startedAt ?? 0)).toBeCloseTo(500, 6);
  expect(states(entries, 'press')).toEqual(['began', 'ended', 'possible']);
  expect(entries.some(entry => entry.name.startsWith('click:'))).toBe(false);
});

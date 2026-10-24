// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorder.interaction.browser.spec.ts
 * @input The built List "Reorderable" and "Reorder Long List" stories in the
 *   touch phone context, the interaction harness, and the reorder values of
 *   the UIKit constants table (motion/uikit/reorder.ts)
 * @output Interaction and animation proofs of a List with `onReorder`, against
 *   UIKit's measured edit-mode reorder: a finger held still on a handle picks
 *   the row up and the drop moves it; a flick on a handle scrolls instead; the
 *   row follows the finger one to one and stops with its centre at the list's
 *   edge; the rows it passes slide on the table spring; the drop springs from
 *   rest on the distance-scaled spring; the page autoscrolls by whole points
 *   every 20 ms near the edge; a second finger does not break the drag; a
 *   pinch that starts on a handle zooms; the drop and the slides keep moving
 *   while the main thread is blocked; a drag does no Layout or Paint per move;
 *   a mouse drags at once with no motion; Reduce Motion keeps the slides and
 *   the drop; in RTL the handle is on the left and the drag keeps x;
 *   storyboards of a drag and a drop
 * @position Interaction evidence for List/useListReorder.ts and
 *   List/ListReorderHandle.tsx
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  busyWindowProof,
  compareCurve,
  countBetween,
  drag,
  flick,
  holdAnimations,
  markElement,
  merge,
  openStory,
  pinch,
  releaseAnimations,
  seekAnimations,
  startScreencast,
  tap,
  timeline,
  touchDriver,
  touchStoryboard,
  trackMarker,
  traceRendering,
  withStorybook,
  writeEvidence,
  type BusyWindow,
  type Point,
  type TouchEventStep,
} from '@astryxdesign/interaction-harness';
import {solveSpring, toSpring} from '../../motion/spring';
import {reorder} from '../../motion/uikit/reorder';
import {autoscrollStep, settleSpring} from '../reorderModel';

const storybook = withStorybook(test);

const STORY = 'core-list--reorderable';
const LONG_STORY = 'core-list--reorder-long-list';
const FIXED_STORY = 'core-list--reorder-with-fixed-row';
const ROWS = ['Inbox', 'Sent', 'Drafts', 'Archive', 'Spam', 'Trash'];
const HOLD_MS = reorder.claim.delayMs + 80;

const row = (page: Page, label: string) =>
  page.locator('#storybook-root li').filter({hasText: label}).first();

const handle = (page: Page, label: string) =>
  page.getByRole('button', {name: `Reorder ${label}`, exact: true});

const labels = async (page: Page) =>
  page
    .locator('#storybook-root li')
    .evaluateAll(rows => rows.map(element => element.textContent ?? ''));

const translateY = async (element: Locator) =>
  element.evaluate(el => {
    const value = getComputedStyle(el).translate;
    if (value === 'none' || value === '') {
      return 0;
    }
    const [, y = '0px'] = value.split(' ');
    return Number.parseFloat(y);
  });

const topOf = async (element: Locator) =>
  element.evaluate(el => el.getBoundingClientRect().top);

async function centerOf(element: Locator): Promise<Point> {
  const box = await element.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** Distance between two consecutive rows' tops, and a row's height. */
async function pitchOf(page: Page): Promise<{pitch: number; height: number}> {
  return row(page, ROWS[0]).evaluate(el => {
    const next = el.nextElementSibling as HTMLElement | null;
    const height = (el as HTMLElement).offsetHeight;
    return {
      pitch:
        next == null ? height : next.offsetTop - (el as HTMLElement).offsetTop,
      height,
    };
  });
}

async function open(page: Page, story = STORY) {
  await openStory(page, storybook(), story);
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the touch reorder runs on a touch screen');
  await expect(
    handle(
      page,
      story === STORY
        ? 'Inbox'
        : story === FIXED_STORY
          ? 'Favorites'
          : 'Item 1',
    ),
  ).toBeVisible();
}

const waitForRest = async (page: Page) =>
  expect
    .poll(async () =>
      page.evaluate(
        () =>
          document.getAnimations().filter(a => a.playState === 'running')
            .length,
      ),
    )
    .toBe(0);

const tableProgress = (duration: number) => {
  const curve = solveSpring(toSpring({duration, bounce: 0}), {from: 0, to: 1});
  return {
    at: (ms: number) => curve.value(ms / 1000),
    settleMs: curve.settleTime(0.001) * 1000,
  };
};

test('a finger held still on a handle picks the row up, and the drop moves it', async ({
  page,
}) => {
  await open(page);
  const {pitch} = await pitchOf(page);
  const inbox = row(page, 'Inbox');
  const background = async () =>
    inbox.evaluate(el => getComputedStyle(el).backgroundColor);
  const resting = await background();
  const from = await centerOf(handle(page, 'Inbox'));
  const driver = await touchDriver(page);
  let dragging = '';
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y + 1.6 * pitch},
      {
        holdMs: HOLD_MS,
        durationMs: 300,
        restMs: 150,
      },
    ),
    {
      onEvent: async (step: TouchEventStep) => {
        if (step.type === 'touchMove' && dragging === '') {
          if (step.t > HOLD_MS + 100) {
            dragging = await background();
          }
        }
      },
    },
  );
  // Opaque while it moves, as a table cell is, so the rows it passes stay
  // under it; its own background again once it rests.
  expect(resting).toBe('rgba(0, 0, 0, 0)');
  expect(dragging).not.toBe('rgba(0, 0, 0, 0)');
  expect(dragging).not.toBe('');
  await expect
    .poll(async () => labels(page))
    .toEqual(['Sent', 'Drafts', 'Inbox', 'Archive', 'Spam', 'Trash']);
  await waitForRest(page);
  for (const label of ROWS) {
    expect(await translateY(row(page, label))).toBe(0);
  }
  await expect(page.locator('[data-astryx-reordering]')).toHaveCount(0);
  await expect.poll(background).toBe(resting);
});

test('a flick that starts on a handle scrolls the page and moves no row', async ({
  page,
}) => {
  await open(page, LONG_STORY);
  const driver = await touchDriver(page);
  test.skip(!driver.drivesNativeGestures, 'needs native scrolling from touch');
  const before = await labels(page);
  const from = await centerOf(handle(page, 'Item 8'));
  await driver.play(flick(from, {velocity: {x: 0, y: -1500}, durationMs: 80}));
  await expect
    .poll(async () => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(40);
  expect(await labels(page)).toEqual(before);
  await expect(page.locator('[data-astryx-reordering]')).toHaveCount(0);
});

test('after the hold the row follows the finger one to one, and stops with its centre at the list top', async ({
  page,
}) => {
  await open(page);
  const archive = row(page, 'Archive');
  const from = await centerOf(handle(page, 'Archive'));
  const start = await topOf(archive);
  const listTop = await page
    .locator('#storybook-root ul')
    .evaluate(el => el.getBoundingClientRect().top);
  const height = await archive.evaluate(el => (el as HTMLElement).offsetHeight);
  const driver = await touchDriver(page);
  const errors: number[] = [];
  let lastTop = 0;
  // Down 80 px, then far up past the top of the list, without lifting.
  const script = drag(
    from,
    {x: from.x, y: from.y + 80},
    {
      holdMs: HOLD_MS,
      durationMs: 300,
    },
  ).slice(0, -1);
  const up = drag(
    {x: from.x, y: from.y + 80},
    {x: from.x, y: 0},
    {
      durationMs: 300,
      restMs: 100,
    },
  );
  const offset = script[script.length - 1].t;
  const full = [
    ...script,
    ...up.slice(1).map(frame => ({...frame, t: frame.t + offset})),
  ];
  await driver.play(full, {
    onEvent: async (step: TouchEventStep) => {
      if (step.type !== 'touchMove' || step.t < HOLD_MS + 20) {
        return;
      }
      const top = await topOf(archive);
      lastTop = top;
      const finger = step.fingers[0].y;
      if (finger > from.y - 40) {
        errors.push(top - start - (finger - from.y));
      }
    },
  });
  await writeEvidence(
    'reorder/tracking',
    {'tracking.json': JSON.stringify({errors, lastTop, listTop}, null, 1)},
    test.info(),
  );
  expect(errors.length).toBeGreaterThan(5);
  for (const error of errors) {
    expect(Math.abs(error)).toBeLessThan(1);
  }
  // Clamped: its centre stopped on the list's top edge.
  expect(lastTop + height / 2).toBeCloseTo(Math.max(listTop, 0), 0);
});

test('the rows it passes slide out of the way on the table spring', async ({
  page,
}, testInfo) => {
  await open(page);
  const {pitch} = await pitchOf(page);
  const sent = row(page, 'Sent');
  const from = await centerOf(handle(page, 'Inbox'));
  const driver = await touchDriver(page);
  const script = drag(
    from,
    {x: from.x, y: from.y + 0.6 * pitch},
    {
      holdMs: HOLD_MS,
      durationMs: 160,
      restMs: 1200,
    },
  );
  const samples: {t: number; value: number}[] = [];
  const spring = tableProgress(reorder.slide.spring.duration);
  const lastMove = script.length - 2;
  let index = -1;
  await driver.play(script, {
    onEvent: async (step: TouchEventStep) => {
      index += 1;
      if (step.type !== 'touchMove' || index !== lastMove) {
        return;
      }
      await holdAnimations(page, sent);
      for (const t of timeline(spring.settleMs)) {
        await seekAnimations(page, t);
        samples.push({t, value: await translateY(sent)});
      }
      await releaseAnimations(page, {finish: true});
    },
  });
  const expected = (t: number) => -pitch * spring.at(t);
  const comparison = compareCurve(samples, expected, 0.5);
  await writeEvidence(
    'curves/list-reorder-slide',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: reorder.slide.spring, pitch, samples, comparison},
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(samples.length).toBeGreaterThan(5);
  expect(comparison.maxError, JSON.stringify(comparison.worst)).toBeLessThan(
    0.5,
  );
  await expect
    .poll(async () => labels(page))
    .toEqual(['Sent', 'Inbox', 'Drafts', 'Archive', 'Spam', 'Trash']);
});

test('the drop springs the row from rest into its slot, its duration scaled by the distance left', async ({
  page,
}, testInfo) => {
  await open(page);
  const {pitch, height} = await pitchOf(page);
  const inbox = row(page, 'Inbox');
  const start = await topOf(inbox);
  const from = await centerOf(handle(page, 'Inbox'));
  const travel = 0.62 * pitch;
  const driver = await touchDriver(page);
  const samples: {t: number; value: number}[] = [];
  // The row is released `pitch - travel` above its slot (slot 1).
  const distance = pitch - travel;
  const spring = settleSpring(distance, height);
  const progress = tableProgress(spring.duration);
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y + travel},
      {
        holdMs: HOLD_MS,
        durationMs: 200,
        restMs: 300,
      },
    ),
    {
      onEvent: async (step: TouchEventStep) => {
        if (step.type !== 'touchEnd') {
          return;
        }
        await holdAnimations(page, inbox);
        for (const t of timeline(progress.settleMs)) {
          await seekAnimations(page, t);
          samples.push({t, value: (await topOf(inbox)) - start});
        }
        await releaseAnimations(page, {finish: true});
      },
    },
  );
  const curve = (t: number) => travel + distance * progress.at(t);
  // The commit that applies the drop lands a few ms into it and continues the
  // same curve from there (its value and velocity kept): the held animation
  // starts that much into the drop.
  let lag = 0;
  for (let t = 0; t <= 30; t += 0.1) {
    if (
      Math.abs(curve(t) - samples[0].value) <
      Math.abs(curve(lag) - samples[0].value)
    ) {
      lag = t;
    }
  }
  const comparison = compareCurve(samples, t => curve(t + lag), 0.5);
  await writeEvidence(
    'curves/list-reorder-drop',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring, pitch, height, travel, distance, lag, samples, comparison},
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(spring.duration).toBeLessThan(reorder.settle.maxDuration);
  expect(samples[0].value).toBeCloseTo(travel, 0);
  expect(lag).toBeLessThan(30);
  expect(comparison.maxError, JSON.stringify(comparison.worst)).toBeLessThan(
    0.5,
  );
  await expect
    .poll(async () => labels(page))
    .toEqual(['Sent', 'Inbox', 'Drafts', 'Archive', 'Spam', 'Trash']);
});

test('near the bottom edge the page autoscrolls by whole points every 20 ms', async ({
  page,
}, testInfo) => {
  await open(page, LONG_STORY);
  const target = row(page, 'Item 6');
  const from = await centerOf(handle(page, 'Item 6'));
  const rowBox = await target.boundingBox();
  const viewport = page.viewportSize();
  if (rowBox == null || viewport == null) {
    throw new Error('no box');
  }
  await page.evaluate(() => {
    const element = document.scrollingElement as Element;
    const proto = Object.getOwnPropertyDescriptor(
      Element.prototype,
      'scrollTop',
    ) as PropertyDescriptor;
    const writes: [number, number][] = [];
    (window as unknown as {__writes: typeof writes}).__writes = writes;
    Object.defineProperty(element, 'scrollTop', {
      configurable: true,
      get(): number {
        return proto.get?.call(this) as number;
      },
      set(value: number) {
        writes.push([performance.now(), value]);
        proto.set?.call(this, value);
      },
    });
  });
  // Bring the row's bottom edge 10 px past the bottom of the viewport.
  const depth = 10;
  const dy = viewport.height + depth - (rowBox.y + rowBox.height);
  const driver = await touchDriver(page);
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y + dy},
      {
        holdMs: HOLD_MS,
        durationMs: 300,
        hz: 30,
        restMs: 1200,
      },
    ),
  );
  const writes = await page.evaluate(
    () => (window as unknown as {__writes: [number, number][]}).__writes,
  );
  // The steady part, with the finger still at the edge.
  const steady = writes.slice(Math.floor(writes.length / 3));
  const steps = steady.slice(1).map(([, v], i) => v - steady[i][1]);
  const intervals = steady.slice(1).map(([t], i) => t - steady[i][0]);
  const [t0, v0] = steady[0];
  const [t1, v1] = steady[steady.length - 1];
  // Points per 20 ms tick on average, whatever the engine's timer jitter.
  const perTick = ((v1 - v0) / (t1 - t0)) * reorder.autoscroll.tickMs;
  const expected = autoscrollStep(depth);
  await writeEvidence(
    'reorder/autoscroll',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {depth, expected, perTick, steps, intervals},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(steady.length).toBeGreaterThan(20);
  // Whole ticks only: one step, or two when a late timer catches up.
  for (const step of steps) {
    expect([expected, 2 * expected]).toContain(step);
  }
  expect(perTick).toBeGreaterThan(expected * 0.93);
  expect(perTick).toBeLessThan(expected * 1.07);
  // The row stayed under the finger and moved down the list.
  await expect
    .poll(async () => (await labels(page)).indexOf('Item 6'))
    .toBeGreaterThan(8);
});

test('a second finger does not break the drag', async ({page, browserName}) => {
  test.skip(
    browserName === 'webkit',
    "Linux WebKit's touchstart lists only the finger that landed, so the " +
      'gesture system reads the first finger as gone (iOS Safari lists every ' +
      'finger: simulator evidence)',
  );
  await open(page);
  const {pitch} = await pitchOf(page);
  const from = await centerOf(handle(page, 'Inbox'));
  const other = await centerOf(row(page, 'Trash'));
  const driver = await touchDriver(page);
  const first = drag(
    from,
    {x: from.x, y: from.y + 1.6 * pitch},
    {
      holdMs: HOLD_MS,
      durationMs: 400,
      restMs: 150,
    },
  );
  const second = tap(other, {holdMs: 120, id: 1}).map(frame => ({
    ...frame,
    t: frame.t + HOLD_MS + 120,
  }));
  await driver.play(merge(first, second));
  await expect
    .poll(async () => labels(page))
    .toEqual(['Sent', 'Drafts', 'Inbox', 'Archive', 'Spam', 'Trash']);
});

test('a pinch whose first finger lands on a handle zooms the page', async ({
  page,
}) => {
  await open(page);
  const driver = await touchDriver(page);
  test.skip(!driver.drivesNativeGestures, 'needs native pinch-zoom from touch');
  const on = await centerOf(handle(page, 'Sent'));
  const before = await labels(page);
  // The first finger on the handle, the second 120 px to its left.
  await driver.play(
    pinch({
      center: {x: on.x - 60, y: on.y},
      fromDistance: 120,
      toDistance: 300,
      durationMs: 300,
      restMs: 100,
    }).map(frame => ({
      ...frame,
      fingers: frame.fingers.map(finger =>
        finger.id === 0 ? {...finger, id: 1} : {...finger, id: 0},
      ),
    })),
  );
  await expect
    .poll(async () => page.evaluate(() => visualViewport?.scale ?? 1))
    .toBeGreaterThan(1.2);
  expect(await labels(page)).toEqual(before);
});

test('two fingers held still with one on a handle, then spread, zoom the page', async ({
  page,
}) => {
  await open(page);
  const driver = await touchDriver(page);
  test.skip(!driver.drivesNativeGestures, 'needs native pinch-zoom from touch');
  const on = await centerOf(handle(page, 'Sent'));
  const before = await labels(page);
  // Both fingers rest past the hold before they spread: the handle must not
  // claim a touch while another finger is on the screen.
  const spread = pinch({
    center: {x: on.x - 60, y: on.y},
    fromDistance: 120,
    toDistance: 300,
    durationMs: 400,
    restMs: 100,
  }).map((frame, index) => ({
    t: index === 0 ? 0 : frame.t + HOLD_MS + 100,
    fingers: frame.fingers.map(finger =>
      finger.id === 0 ? {...finger, id: 1} : {...finger, id: 0},
    ),
  }));
  await driver.play(spread);
  await expect
    .poll(async () => page.evaluate(() => visualViewport?.scale ?? 1))
    .toBeGreaterThan(1.2);
  expect(await labels(page)).toEqual(before);
  await expect(page.locator('[data-astryx-reordering]')).toHaveCount(0);
});

/**
 * Films `marked` while a drag held at `travel` rows (then released when
 * `releaseFirst`) runs. The page itself blocks its main thread for `blockMs`
 * once the motion under test has run 50 ms on its own clock (three frames:
 * an engine hands a new animation to its compositor in a rendering update,
 * so a block in its first frame holds the start, by design), and reports the
 * window; a test-side trigger would land a variable number of frames late.
 */
async function busyProof(
  page: Page,
  marked: Locator,
  travel: number,
  {
    blockMs,
    releaseFirst,
    dragged = 'Inbox',
    durationMs = 160,
  }: {
    blockMs: number;
    releaseFirst: boolean;
    dragged?: string;
    durationMs?: number;
  },
) {
  const {pitch} = await pitchOf(page);
  const from = await centerOf(handle(page, dragged));
  await marked.evaluate((element, ms) => {
    const target = element as HTMLElement;
    const won = window as unknown as {__block?: BusyWindow};
    const check = () => {
      const moving = target
        .getAnimations()
        .find(a => a.playState === 'running' && Number(a.currentTime) >= 50);
      if (moving == null) {
        requestAnimationFrame(check);
        return;
      }
      // From a task, not inside the frame's callbacks: the frame being
      // rendered finishes first.
      setTimeout(() => {
        const start = performance.now();
        while (performance.now() - start < ms) {
          // the main thread is held
        }
        won.__block = {
          from: performance.timeOrigin + start,
          to: performance.timeOrigin + performance.now(),
        };
      }, 0);
    };
    requestAnimationFrame(check);
  }, blockMs);
  const unmark = await markElement(marked);
  const cast = await startScreencast(page);
  const driver = await touchDriver(page);
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y + travel * pitch},
      {
        holdMs: HOLD_MS,
        durationMs,
        restMs: releaseFirst ? 150 : 900,
      },
    ),
  );
  await page.waitForTimeout(300);
  const frames = await cast.stop();
  await unmark();
  const block = await page.evaluate(
    () => (window as unknown as {__block?: BusyWindow}).__block ?? null,
  );
  if (block == null) {
    throw new Error('the motion under test never started');
  }
  const tracked = await trackMarker(page, frames);
  return busyWindowProof(tracked, block, {axis: 'y', settledWithin: 1});
}

test('the rows it passes keep sliding while the main thread is blocked', async ({
  page,
}, testInfo) => {
  await open(page, FIXED_STORY);
  // In one move Favorites jumps past Inbox and Sent toward the fixed row (its
  // slot stops before it) and the finger stays down below them: Sent slides
  // up a row, clear of the dragged row, while script cannot run.
  const proof = await busyProof(page, row(page, 'Sent'), 3.2, {
    blockMs: 200,
    releaseFirst: false,
    dragged: 'Favorites',
    durationMs: 16,
  });
  await writeEvidence(
    'busy-main-thread/list-reorder-slide',
    {[`${testInfo.project.name}.json`]: JSON.stringify(proof, null, 1)},
    testInfo,
  );
  expect(proof.changed, JSON.stringify(proof)).toBeGreaterThanOrEqual(3);
  expect(proof.monotonic, JSON.stringify(proof)).toBe(true);
  expect(proof.longestStallMs, JSON.stringify(proof)).toBeLessThan(40);
});

test('the drop keeps settling while the main thread is blocked', async ({
  page,
}, testInfo) => {
  await open(page);
  // Released half a row from its slot: the drop takes its full duration.
  const proof = await busyProof(page, row(page, 'Inbox'), 1.49, {
    blockMs: 150,
    releaseFirst: true,
  });
  await writeEvidence(
    'busy-main-thread/list-reorder-drop',
    {[`${testInfo.project.name}.json`]: JSON.stringify(proof, null, 1)},
    testInfo,
  );
  expect(proof.changed, JSON.stringify(proof)).toBeGreaterThanOrEqual(3);
  expect(proof.monotonic, JSON.stringify(proof)).toBe(true);
  expect(proof.longestStallMs, JSON.stringify(proof)).toBeLessThan(40);
});

test('a drag does no Layout or Paint per move', async ({page, browserName}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await open(page);
  const {pitch} = await pitchOf(page);
  const from = await centerOf(handle(page, 'Inbox'));
  const driver = await touchDriver(page);
  let played: Awaited<ReturnType<typeof driver.play>> = [];
  const trace = await traceRendering(page, async () => {
    // Past two rows: two slot changes start the neighbours' slides.
    played = await driver.play(
      drag(
        from,
        {x: from.x, y: from.y + 2.6 * pitch},
        {
          holdMs: HOLD_MS,
          durationMs: 600,
          restMs: 100,
        },
      ),
    );
    await page.waitForTimeout(400);
  });
  // From the first move after the claim to the last move: the drag itself.
  const moves = played.filter(
    step => step.type === 'touchMove' && step.t > HOLD_MS + 20,
  );
  const during = countBetween(
    trace,
    moves[0].dispatchedAt,
    moves[moves.length - 1].dispatchedAt,
  );
  expect(moves.length).toBeGreaterThan(20);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test.describe('with a mouse', () => {
  test.use({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 900, height: 700},
  });

  test('a mouse drags a handle at once and the rows jump, with no motion', async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    const {pitch} = await pitchOf(page);
    const grip = handle(page, 'Inbox');
    const cursor = async () =>
      grip.evaluate(element => getComputedStyle(element).cursor);
    expect(await cursor()).toBe('grab');
    const from = await centerOf(grip);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x, from.y + 1.6 * pitch, {steps: 12});
    // Rows that make room jump: nothing animates.
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    // The handle shows a grabbing hand while the drag holds it.
    expect(await cursor()).toBe('grabbing');
    await page.mouse.up();
    await expect
      .poll(async () => labels(page))
      .toEqual(['Sent', 'Drafts', 'Inbox', 'Archive', 'Spam', 'Trash']);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    for (const label of ROWS) {
      expect(await translateY(row(page, label))).toBe(0);
    }
    expect(await cursor()).toBe('grab');
  });
});

// UIKit keeps a table's reorder motion under Reduce Motion (iOS 26.2,
// measured): the rows still slide and the drop still springs, with no
// cross-fade in their place.
test.describe('with Reduce Motion', () => {
  test('the rows it passes still slide on the table spring, and the drop still springs', async ({
    page,
  }) => {
    // Reduce Motion on, before the story opens.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await open(page);
    expect(
      await page.evaluate(
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    ).toBe(true);
    const {pitch} = await pitchOf(page);
    const sent = row(page, 'Sent');
    const inbox = row(page, 'Inbox');
    const from = await centerOf(handle(page, 'Inbox'));
    const driver = await touchDriver(page);
    const script = drag(
      from,
      {x: from.x, y: from.y + 0.6 * pitch},
      {
        holdMs: HOLD_MS,
        durationMs: 160,
        restMs: 400,
      },
    );
    const samples: {t: number; value: number; opacity: number}[] = [];
    const spring = tableProgress(reorder.slide.spring.duration);
    const lastMove = script.length - 2;
    let index = -1;
    let fades = -1;
    await driver.play(script, {
      onEvent: async (step: TouchEventStep) => {
        index += 1;
        if (step.type !== 'touchMove' || index !== lastMove) {
          return;
        }
        fades = await page.evaluate(
          () =>
            document
              .getAnimations()
              .filter(animation =>
                (animation.effect as KeyframeEffect | null)
                  ?.getKeyframes()
                  .some(frame => 'opacity' in frame),
              ).length,
        );
        await holdAnimations(page, sent);
        for (const t of timeline(spring.settleMs)) {
          await seekAnimations(page, t);
          samples.push({
            t,
            value: await translateY(sent),
            opacity: Number(
              await sent.evaluate(el => getComputedStyle(el).opacity),
            ),
          });
        }
        await releaseAnimations(page, {finish: true});
      },
    });
    const comparison = compareCurve(samples, t => -pitch * spring.at(t), 0.5);
    expect(fades).toBe(0);
    expect(samples.length).toBeGreaterThan(5);
    expect(comparison.maxError, JSON.stringify(comparison.worst)).toBeLessThan(
      0.5,
    );
    expect(samples.every(sample => sample.opacity === 1)).toBe(true);
    // The drop springs the dragged row home too: a translate, not a fade.
    const drop = await inbox.evaluate(el =>
      el.getAnimations().map(animation => {
        const frames = (
          animation.effect as KeyframeEffect | null
        )?.getKeyframes();
        return {
          translate: frames?.some(frame => 'translate' in frame) ?? false,
          opacity: frames?.some(frame => 'opacity' in frame) ?? false,
        };
      }),
    );
    expect(drop.some(animation => animation.translate)).toBe(true);
    expect(drop.some(animation => animation.opacity)).toBe(false);
    await expect
      .poll(async () => labels(page))
      .toEqual(['Sent', 'Inbox', 'Drafts', 'Archive', 'Spam', 'Trash']);
  });
});

test.describe('right to left', () => {
  test('the handle sits at the row end on the left, and a hold then drag reorders with x fixed', async ({
    page,
  }) => {
    await page.goto(
      `${storybook()}/iframe.html?id=${STORY}&viewMode=story&globals=direction:rtl`,
    );
    await expect(handle(page, 'Inbox')).toBeVisible();
    const touch = await page.evaluate(
      () => matchMedia('(pointer: coarse)').matches,
    );
    test.skip(!touch, 'the touch reorder runs on a touch screen');
    expect(
      await row(page, 'Inbox').evaluate(el => getComputedStyle(el).direction),
    ).toBe('rtl');
    const rowBox = await row(page, 'Inbox').boundingBox();
    const handleBox = await handle(page, 'Inbox').boundingBox();
    if (rowBox == null || handleBox == null) {
      throw new Error('no box');
    }
    // The trailing control is on the inline end, the left in RTL.
    expect(handleBox.x + handleBox.width / 2).toBeLessThan(
      rowBox.x + rowBox.width / 4,
    );
    const {pitch} = await pitchOf(page);
    const from = await centerOf(handle(page, 'Inbox'));
    const driver = await touchDriver(page);
    const xs: string[] = [];
    await driver.play(
      drag(
        from,
        {x: from.x + 30, y: from.y + 1.6 * pitch},
        {
          holdMs: HOLD_MS,
          durationMs: 300,
          restMs: 150,
        },
      ),
      {
        onEvent: async (step: TouchEventStep) => {
          if (step.type === 'touchMove' && step.t > HOLD_MS + 60) {
            xs.push(
              await row(page, 'Inbox').evaluate(
                el => getComputedStyle(el).translate.split(' ')[0] ?? '',
              ),
            );
          }
        },
      },
    );
    await expect
      .poll(async () => labels(page))
      .toEqual(['Sent', 'Drafts', 'Inbox', 'Archive', 'Spam', 'Trash']);
    // A sideways component is ignored: the row moves along y only.
    expect(xs.length).toBeGreaterThan(3);
    expect(xs.every(x => x === '0px' || x === 'none' || x === '')).toBe(true);
  });
});

test(
  'storyboard: a row held, dragged past two rows and dropped',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await open(page);
    const {pitch} = await pitchOf(page);
    const from = await centerOf(handle(page, 'Inbox'));
    const driver = await touchDriver(page);
    const storyboard = await touchStoryboard(
      page,
      driver,
      drag(
        from,
        {x: from.x, y: from.y + 1.6 * pitch},
        {
          holdMs: HOLD_MS,
          durationMs: 300,
          hz: 20,
          restMs: 150,
        },
      ),
      {
        name: 'list-reorder-drag',
        clip: {x: 0, y: 0, width: 402, height: 360},
        columns: 6,
        cellScale: 0.45,
      },
    );
    await storyboard.write(testInfo);
  },
);

test(
  'storyboard: the drop settling into its slot',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await open(page);
    const {pitch} = await pitchOf(page);
    const from = await centerOf(handle(page, 'Inbox'));
    const driver = await touchDriver(page);
    let written = false;
    await driver.play(
      drag(
        from,
        {x: from.x, y: from.y + 1.45 * pitch},
        {
          holdMs: HOLD_MS,
          durationMs: 300,
          restMs: 200,
        },
      ),
      {
        onEvent: async (step: TouchEventStep) => {
          if (step.type !== 'touchEnd' || written) {
            return;
          }
          written = true;
          const {storyboard} = await animationStoryboard(page, {
            name: 'list-reorder-drop',
            clip: {x: 0, y: 0, width: 402, height: 360},
            times: [0, 33, 67, 100, 150, 200, 300],
            columns: 7,
            cellScale: 0.45,
          });
          await releaseAnimations(page, {finish: true});
          await storyboard.write(testInfo);
        },
      },
    );
  },
);

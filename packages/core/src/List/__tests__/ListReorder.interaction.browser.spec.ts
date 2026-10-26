// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorder.interaction.browser.spec.ts
 * @input The built List "Reorderable", "Reorder With Pinned Rows" and
 *   "Reorder Long List" stories in the touch phone context, the interaction
 *   harness, and the reorder values of the UIKit constants table
 *   (motion/uikit/reorder.ts)
 * @output Interaction and animation proofs of a List with `reorderable`
 *   (spec:AST-103), against
 *   UIKit's measured edit-mode reorder, on a touch screen that is not iOS
 *   (the motion is the same on every touch screen): a finger held still on a
 *   handle picks the row up and the drop moves it; a flick on a handle
 *   scrolls instead; the row follows the finger one to one and stops at the
 *   list's end; the rows it passes slide on the table spring; the drop
 *   springs from rest on the distance-scaled spring; the page autoscrolls by
 *   whole points every 20 ms near the edge; a second finger does not break the drag; a
 *   pinch that starts on a handle zooms; the drop and the slides keep moving
 *   while the main thread is blocked; a drag does no Layout or Paint per move;
 *   a mouse drags at once with no motion; under Reduce Motion the rows it
 *   passes, the drop and a key move cross-fade in place within 200 ms; in RTL
 *   the handle is on the left and the drag keeps x; a focused handle shows one
 *   whole ring, clear of its lines, on a 44 pt target that makes its row no
 *   taller; a held finger locks text selection on the handle until the lift,
 *   and a mouse sees a plain button's styles; a tap on a handle turns on
 *   reorder mode and taps on its hint's moves and Done reorder, and a drag
 *   leaves the mode off; in each engine, Space or Enter turns the mode on,
 *   each arrow commits a move at once with the focus on the handle, and
 *   Escape ends the mode keeping the moves; start(key) from a button or a
 *   context menu enters the same mode with the focus on the handle; a pinned
 *   first row bounds a drag; storyboards of a drag and a drop
 * @position Interaction evidence for List/listReorderEngine.tsx,
 *   List/ListReorderTouch.ts and List/ListReorderHandle.tsx
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
const PINNED_STORY = 'core-list--reorder-with-pinned-rows';
const START_STORY = 'core-list--reorder-from-your-ui';
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

/**
 * Opens a story on a touch screen: Chromium's touch emulation is a coarse
 * pointer, and UIKit's motion is the same on every touch screen.
 */
async function open(page: Page, story = STORY) {
  await openStory(page, storybook(), story);
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the touch reorder runs on a touch screen');
  await expect(
    handle(page, story === LONG_STORY ? 'Item 1' : 'Inbox'),
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

test('after the hold the row follows the finger one to one, and stops with its top at the list top', async ({
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
  // Clamped at the list's own end (the page's top edge is further up): the
  // row stops with its top on the list's top, never hanging over what is
  // above the list. At the visible edge itself its centre would stop there.
  expect(lastTop).toBeCloseTo(Math.max(listTop, -height / 2), 0);
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
  // starts that much into the drop. The lag is fitted to every sample (a
  // spring from rest is flat at its start, so its first sample cannot place
  // it).
  let lag = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let t = 0; t <= 30; t += 0.1) {
    const error = compareCurve(samples, s => curve(s + t), 0.5).maxError;
    if (error < best) {
      best = error;
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
 * How finely the screencast places the marker, in CSS px. For the same
 * spring, Chromium's (PNG) frames move it in 1 px steps and WebKit's (JPEG)
 * frames in 2 px steps, so a spring's last few px, which move less than a
 * step per frame, show as a plateau (80, 80, 80 against a final 77) though
 * every frame is presented. Judging stops two steps from the end.
 */
function castStepPx(page: Page): number {
  return page.context().browser()?.browserType().name() === 'webkit' ? 2 : 1;
}

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
  return busyWindowProof(tracked, block, {
    axis: 'y',
    settledWithin: 2 * castStepPx(page),
  });
}

test('the rows it passes keep sliding while the main thread is blocked', async ({
  page,
}, testInfo) => {
  await open(page);
  // In one move Inbox jumps past Sent, Drafts and Archive, and the finger
  // stays down below them: Sent slides up a row, clear of the dragged row,
  // while script cannot run.
  const proof = await busyProof(page, row(page, 'Sent'), 3.2, {
    blockMs: 200,
    releaseFirst: false,
    durationMs: 16,
  });
  await writeEvidence(
    'busy-main-thread/list-reorder-slide',
    {[`${testInfo.project.name}.json`]: JSON.stringify(proof, null, 1)},
    testInfo,
  );
  expect(proof.changed, JSON.stringify(proof)).toBeGreaterThanOrEqual(3);
  expect(proof.monotonic, JSON.stringify(proof)).toBe(true);
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

  /** This context's primary pointer is fine: a case here is a mouse's. */
  const expectFinePointer = async (page: Page) =>
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);

  test("with a mouse the handle keeps a plain button's text selection and callout", async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    await expectFinePointer(page);
    await expect(handle(page, 'Inbox')).toBeVisible();
    const styles = await handle(page, 'Inbox').evaluate(element => {
      const read = (el: Element) => {
        const style = getComputedStyle(el) as CSSStyleDeclaration & {
          webkitUserSelect?: string;
          webkitTouchCallout?: string;
        };
        return {
          userSelect: style.userSelect,
          webkitUserSelect: style.webkitUserSelect ?? '',
          callout: style.getPropertyValue('-webkit-touch-callout'),
        };
      };
      const plain = document.createElement('button');
      element.parentElement?.append(plain);
      const result = {handle: read(element), plain: read(plain)};
      plain.remove();
      return result;
    });
    // No local override: a held finger's lock comes from the gesture host.
    expect(styles.handle).toEqual(styles.plain);
  });

  test('a mouse drags a handle at once and the rows jump, with no motion', async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    await expectFinePointer(page);
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

  test('where the primary pointer is fine, no recognizer attaches: the gesture host listens to nothing', async ({
    page,
  }) => {
    // spec:AST-094 FR19, FR24. The gesture host, which every recognizer
    // attaches through, listens on the document; each touch listener a page
    // script puts there is recorded, through a mouse drag too (the test
    // driver's own listeners are left out).
    await page.addInitScript(() => {
      const seen: string[] = [];
      Object.assign(window, {__documentTouchListeners: seen});
      const add = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (
        this: EventTarget,
        type: string,
        ...rest: unknown[]
      ) {
        if (
          type.startsWith('touch') &&
          this === document &&
          !(new Error().stack ?? '').includes('InjectedScript')
        ) {
          seen.push(type);
        }
        return (add as (...args: unknown[]) => void).call(this, type, ...rest);
      };
    });
    await openStory(page, storybook(), STORY);
    await expectFinePointer(page);
    const {pitch} = await pitchOf(page);
    const from = await centerOf(handle(page, 'Inbox'));
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x, from.y + 1.6 * pitch, {steps: 8});
    await page.mouse.up();
    await expect
      .poll(async () => labels(page))
      .toEqual(['Sent', 'Drafts', 'Inbox', 'Archive', 'Spam', 'Trash']);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as {__documentTouchListeners: string[]})
            .__documentTouchListeners,
      ),
    ).toEqual([]);
  });

  test("a mouse click on a handle turns on reorder mode and shows its hint's moves and Done, and announces no drop", async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    await expectFinePointer(page);
    await handle(page, 'Inbox').click();
    await expect(handle(page, 'Inbox')).toHaveAttribute('aria-pressed', 'true');
    for (const name of ['Move up', 'Move down', 'Done']) {
      await expect(page.getByRole('button', {name})).toBeVisible();
    }
    // A click's focus is the handle's, whatever the engine does with a
    // clicked button.
    await expect(handle(page, 'Inbox')).toBeFocused();
    // Nothing was picked up: the click announces no drop.
    const announced = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[aria-live], [role="status"]'))
        .map(element => element.textContent ?? '')
        .join(' '),
    );
    expect(announced).not.toContain('Dropped');
  });

  for (const from of ['a button', 'the context menu']) {
    test(`start(key) from ${from} turns on reorder mode with the focus on the handle, and the arrows and the hint work`, async ({
      page,
    }) => {
      // spec:AST-103 FR4a: a closing menu restores its trigger's focus; the
      // handle takes it back.
      await openStory(page, storybook(), START_STORY);
      await expectFinePointer(page);
      if (from === 'a button') {
        await page.getByRole('button', {name: 'Move Sent'}).click();
      } else {
        await row(page, 'Drafts').click({button: 'right'});
        await page.getByRole('menuitem', {name: 'Move Sent'}).click();
      }
      await expect(handle(page, 'Sent')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(handle(page, 'Sent')).toBeFocused();
      await expect(page.getByRole('button', {name: 'Done'})).toBeVisible();
      await page.keyboard.press('ArrowDown');
      await expect
        .poll(async () => labels(page))
        .toEqual(['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash']);
      await page.getByRole('button', {name: 'Move up'}).click();
      await expect.poll(async () => labels(page)).toEqual(ROWS);
      await expect(handle(page, 'Sent')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(handle(page, 'Sent')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });
  }

  test('a mouse drag selects no text', async ({page}) => {
    await openStory(page, storybook(), STORY);
    await expectFinePointer(page);
    const {pitch} = await pitchOf(page);
    const from = await centerOf(handle(page, 'Inbox'));
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x - 120, from.y + 2.4 * pitch, {steps: 10});
    await page.mouse.up();
    expect(
      await page.evaluate(() => window.getSelection()?.toString() ?? ''),
    ).toBe('');
  });

  for (const key of ['Space', 'Enter']) {
    test(`${key} turns on reorder mode, each arrow commits a move at once with the focus on the handle, and Escape ends the mode keeping the moves`, async ({
      page,
    }) => {
      // spec:AST-103 FR4, in this engine: the key's own activation of the
      // button (Space's comes with its keyup) toggles the mode once.
      await openStory(page, storybook(), STORY);
      await expectFinePointer(page);
      await page.keyboard.press('Shift');
      await handle(page, 'Inbox').focus();
      await page.keyboard.press(key);
      await expect(handle(page, 'Inbox')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.getByRole('button', {name: 'Done'})).toBeVisible();
      await page.keyboard.press('ArrowDown');
      await expect
        .poll(async () => labels(page))
        .toEqual(['Sent', 'Inbox', 'Drafts', 'Archive', 'Spam', 'Trash']);
      await expect(handle(page, 'Inbox')).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect
        .poll(async () => labels(page))
        .toEqual(['Sent', 'Drafts', 'Inbox', 'Archive', 'Spam', 'Trash']);
      await expect(handle(page, 'Inbox')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(handle(page, 'Inbox')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      await expect(page.getByRole('button', {name: 'Done'})).toBeHidden();
      // Kept, and at rest: with a mouse nothing travels.
      expect(await labels(page)).toEqual([
        'Sent',
        'Drafts',
        'Inbox',
        'Archive',
        'Spam',
        'Trash',
      ]);
      await expect(handle(page, 'Inbox')).toBeFocused();
      for (const label of ROWS) {
        expect(await translateY(row(page, label))).toBe(0);
      }
    });
  }
});

// design:reduced-motion (current): under Reduce Motion a reorder's own
// motion — the rows it passes, the drop, a key move — never travels or
// springs; on a coarse pointer it cross-fades (opacity only, at most 200 ms),
// on a fine pointer it completes at once. The row under the finger still
// follows it: the person drags it themselves.
const ROW_FADE_MS = 200;

/**
 * How long, from now, until none of the list's rows runs an animation and
 * every row is fully opaque: measured in the page, frame by frame.
 */
async function msUntilRowsRest(page: Page) {
  return page.evaluate(
    async () =>
      new Promise<number>(resolve => {
        const start = performance.now();
        const check = () => {
          const rows = Array.from(
            document.querySelectorAll<HTMLElement>('#storybook-root li'),
          );
          const busy = rows.some(
            row =>
              row
                .getAnimations()
                .some(animation => animation.playState === 'running') ||
              Number(getComputedStyle(row).opacity) < 1,
          );
          if (!busy || performance.now() - start > 2000) {
            resolve(performance.now() - start);
            return;
          }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }),
  );
}

/**
 * Starts sampling `label`'s row every frame for `ms`: its opacity and its top
 * on screen. Read the samples with `rowSamples`.
 */
async function sampleRow(page: Page, label: string, ms: number) {
  await page.evaluate(
    ({label, ms}) => {
      const row = Array.from(
        document.querySelectorAll<HTMLElement>('#storybook-root li'),
      ).find(li => li.textContent?.trim().startsWith(label));
      const samples: {t: number; opacity: number; top: number}[] = [];
      (window as unknown as {__rowSamples: typeof samples}).__rowSamples =
        samples;
      const start = performance.now();
      const tick = () => {
        if (row == null) {
          return;
        }
        const t = performance.now() - start;
        samples.push({
          t,
          opacity: Number(getComputedStyle(row).opacity),
          top: row.getBoundingClientRect().top,
        });
        if (t < ms) {
          requestAnimationFrame(tick);
        }
      };
      tick();
    },
    {label, ms},
  );
}

async function rowSamples(page: Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __rowSamples: {t: number; opacity: number; top: number}[];
        }
      ).__rowSamples,
  );
}

/** Every running animation of `locator`: what it animates and how long. */
async function rowAnimations(locator: Locator) {
  return locator.evaluate(el =>
    el.getAnimations().map(animation => {
      const effect = animation.effect as KeyframeEffect | null;
      const frames = effect?.getKeyframes() ?? [];
      return {
        translate: frames.some(
          frame => 'translate' in frame || 'transform' in frame,
        ),
        opacity: frames.some(frame => 'opacity' in frame),
        endTime: Number(effect?.getComputedTiming().endTime ?? 0),
      };
    }),
  );
}

// The cross-fade is the animator's Reduced Motion default; the rows take it
// as every row motion does (no row keeps travel under Reduced Motion).
test.describe('with Reduce Motion', () => {
  test('the rows it passes and the drop cross-fade in place: no travel, at most 200 ms', async ({
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
      {holdMs: HOLD_MS, durationMs: 160, restMs: 120},
    );
    const lastMove = script.length - 2;
    let index = -1;
    let passed: Awaited<ReturnType<typeof rowAnimations>> = [];
    await driver.play(script, {
      onEvent: async (step: TouchEventStep) => {
        index += 1;
        if (step.type === 'touchMove' && index === lastMove) {
          passed = await rowAnimations(sent);
        }
        if (step.type === 'touchEnd') {
          await sampleRow(page, 'Inbox', ROW_FADE_MS + 100);
        }
      },
    });
    // Sent made room for Inbox: by a cross-fade, not a slide.
    expect(passed.length).toBeGreaterThan(0);
    for (const animation of passed) {
      expect(animation.translate).toBe(false);
      expect(animation.opacity).toBe(true);
    }
    // The drop too: Inbox fades into its slot instead of springing to it,
    // and every row is at rest, fully shown, within the fade (two frames of
    // slack for the measurement).
    for (const animation of await rowAnimations(inbox)) {
      expect(animation.translate).toBe(false);
    }
    expect(await msUntilRowsRest(page)).toBeLessThanOrEqual(ROW_FADE_MS + 34);
    // The drop is a cross-fade too (DR2), not a jump: Inbox fades out where
    // the finger left it, takes its slot while transparent, and fades in.
    const dropped = await rowSamples(page);
    const lowest = Math.min(...dropped.map(sample => sample.opacity));
    expect(lowest).toBeLessThanOrEqual(0.1);
    const released = dropped[0].top;
    const landed = dropped[dropped.length - 1].top;
    for (const sample of dropped) {
      if (sample.opacity > 0.1) {
        expect(
          [released, landed].some(top => Math.abs(sample.top - top) < 0.5),
          `t=${sample.t.toFixed(0)}`,
        ).toBe(true);
      }
    }
    await expect
      .poll(async () => labels(page))
      .toEqual(['Sent', 'Inbox', 'Drafts', 'Archive', 'Spam', 'Trash']);
    // At rest every row is fully shown where it belongs.
    for (const label of ['Sent', 'Inbox']) {
      expect(await translateY(row(page, label))).toBe(0);
      expect(
        Number(
          await row(page, label).evaluate(el => getComputedStyle(el).opacity),
        ),
      ).toBe(1);
    }
  });

  test('a key move cross-fades its rows too', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await open(page);
    await page.keyboard.press('Shift');
    await handle(page, 'Inbox').focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await expect
      .poll(async () => labels(page))
      .toEqual(['Sent', 'Inbox', 'Drafts', 'Archive', 'Spam', 'Trash']);
    const moved = [
      ...(await rowAnimations(row(page, 'Inbox'))),
      ...(await rowAnimations(row(page, 'Sent'))),
    ];
    expect(moved.length).toBeGreaterThan(0);
    for (const animation of moved) {
      expect(animation.translate).toBe(false);
      expect(animation.opacity).toBe(true);
    }
    expect(await msUntilRowsRest(page)).toBeLessThanOrEqual(ROW_FADE_MS + 34);
    await page.keyboard.press('Escape');
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
    // The last cell: the drop settled in its slot.
    await page.waitForTimeout(500);
    await storyboard.capture('settled, 500 ms after touchEnd', 1500, {});
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
        // Just short of the next crossing: the row drops almost half a row
        // past its slot, the longest settle a drop can have.
        {x: from.x, y: from.y + 1.48 * pitch},
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
            clip: {x: 0, y: 0, width: 402, height: 240},
            times: [0, 33, 67, 100, 150, 200, 300],
            columns: 4,
            cellScale: 0.8,
          });
          await releaseAnimations(page, {finish: true});
          await storyboard.write(testInfo);
        },
      },
    );
  },
);

test('a focused handle shows its own ring, whole, and its row shows none', async ({
  page,
}) => {
  await open(page);
  // Keyboard modality: the next focus is focus-visible.
  await page.keyboard.press('Shift');
  await handle(page, 'Inbox').focus();
  const ring = await handle(page, 'Inbox').evaluate(element => {
    const row = element.closest('li') as HTMLElement;
    const list = element.closest('ul') as HTMLElement;
    const style = getComputedStyle(element);
    const reach =
      parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth);
    const box = element.getBoundingClientRect();
    const bounds = list.getBoundingClientRect();
    return {
      handle: style.outlineStyle,
      row: getComputedStyle(row).outlineStyle,
      left: box.left - reach - bounds.left,
      right: bounds.right - (box.right + reach),
    };
  });
  expect(ring.handle).not.toBe('none');
  // One ring: the row's own (Item's focus-within) stays off for the handle.
  expect(ring.row).toBe('none');
  // Whole: inside the list, which clips its inline overflow.
  expect(ring.left).toBeGreaterThanOrEqual(-0.5);
  expect(ring.right).toBeGreaterThanOrEqual(-0.5);
});

test('a held finger locks text selection on the handle, and the lift unlocks it', async ({
  page,
}) => {
  await open(page);
  const target = handle(page, 'Inbox');
  // WebKit computes only the prefixed property.
  const read = async () =>
    target.evaluate(element => {
      const style = getComputedStyle(element);
      return (
        style.getPropertyValue('user-select') ||
        style.getPropertyValue('-webkit-user-select')
      );
    });
  const before = await read();
  const driver = await touchDriver(page);
  let held = '';
  // Lifted before the hold would claim the drag: the lock is the finger's.
  await driver.play(tap(await centerOf(target), {holdMs: 120}), {
    onEvent: async (step: TouchEventStep) => {
      if (step.type === 'touchStart') {
        held = await read();
      }
    },
  });
  expect(held).toBe('none');
  await expect.poll(read).toBe(before);
});

test('the handle is a 44 pt target whose ring clears its lines, and its row is no taller for it', async ({
  page,
}) => {
  await open(page);
  await page.keyboard.press('Shift');
  await handle(page, 'Inbox').focus();
  const geometry = await handle(page, 'Inbox').evaluate(element => {
    const row = element.closest('li') as HTMLElement;
    const style = getComputedStyle(element);
    const inset =
      -parseFloat(style.outlineOffset) || parseFloat(style.outlineWidth);
    const box = element.getBoundingClientRect();
    // The lines are the handle's ::before: one bar centred in it, and a
    // shadow of it on each side.
    const lines = getComputedStyle(element, '::before');
    const bar = parseFloat(lines.height);
    const shadows = Array.from(
      lines.boxShadow.matchAll(/(-?[\d.]+)px\s+(-?[\d.]+)px/g),
      ([, , y]) => Math.abs(parseFloat(y)),
    );
    const reach = Math.max(0, ...shadows) + bar / 2;
    const centre = box.top + box.height / 2;
    const glyph = {top: centre - reach, bottom: centre + reach};
    const withHandle = row.getBoundingClientRect().height;
    // The same row without its handle.
    element.style.display = 'none';
    const withoutHandle = row.getBoundingClientRect().height;
    element.style.display = '';
    return {
      width: box.width,
      height: box.height,
      // The ring's inner edge to the lines, above and below.
      above: glyph.top - (box.top + inset),
      below: box.bottom - inset - glyph.bottom,
      withHandle,
      withoutHandle,
    };
  });
  expect(geometry.width).toBeCloseTo(44, 0);
  expect(geometry.height).toBeCloseTo(44, 0);
  expect(geometry.above).toBeGreaterThanOrEqual(8);
  expect(geometry.below).toBeGreaterThanOrEqual(8);
  // The handle takes only its lines' height in the row's layout: the row is
  // as tall with it as without it.
  expect(geometry.withHandle).toBeCloseTo(geometry.withoutHandle, 1);
});

test("taps alone reorder: the handle turns on reorder mode, the hint's moves move the row, and Done ends the mode", async ({
  page,
  browserName,
}) => {
  // Linux WebKit's injected touches dispatch pointer and touch events but no
  // click, so a tap cannot activate a button there (iOS Safari's tap does).
  test.skip(browserName === 'webkit', 'injected touches synthesize no click');
  await open(page);
  const before = await labels(page);
  const driver = await touchDriver(page);
  await driver.play(tap(await centerOf(handle(page, 'Inbox'))));
  await expect(handle(page, 'Inbox')).toHaveAttribute('aria-pressed', 'true');
  const down = page.getByRole('button', {name: 'Move down'});
  await expect(down).toBeVisible();
  await driver.play(tap(await centerOf(down)));
  await expect
    .poll(async () => labels(page))
    .toEqual([before[1], before[0], ...before.slice(2)]);
  // The focus stayed on the handle through the taps.
  await expect(handle(page, 'Inbox')).toBeFocused();
  await driver.play(
    tap(await centerOf(page.getByRole('button', {name: 'Done'}))),
  );
  await expect(handle(page, 'Inbox')).toHaveAttribute('aria-pressed', 'false');
  await expect(down).toBeHidden();
  expect(await labels(page)).toEqual([
    before[1],
    before[0],
    ...before.slice(2),
  ]);
});

test('a drag does not also turn on reorder mode', async ({page}) => {
  await open(page);
  const {pitch} = await pitchOf(page);
  const from = await centerOf(handle(page, 'Inbox'));
  const driver = await touchDriver(page);
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y + 1.2 * pitch},
      {holdMs: HOLD_MS, durationMs: 300, restMs: 150},
    ),
  );
  await page.waitForTimeout(400);
  await expect(handle(page, 'Inbox')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', {name: 'Done'})).toBeHidden();
});

test('a pinned first row bounds a drag: nothing drops above it', async ({
  page,
}) => {
  await open(page, PINNED_STORY);
  const before = await labels(page);
  // Favorites, which the story's isReorderable rejects, has no handle.
  await expect(handle(page, 'Favorites')).toHaveCount(0);
  const {pitch} = await pitchOf(page);
  const from = await centerOf(handle(page, 'Inbox'));
  const driver = await touchDriver(page);
  await driver.play(
    drag(
      from,
      {x: from.x, y: from.y - 1.5 * pitch},
      {holdMs: HOLD_MS, durationMs: 300, restMs: 150},
    ),
  );
  await waitForRest(page);
  expect(await labels(page)).toEqual(before);
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TimeWheels.interaction.browser.spec.ts
 * @input The built "Bottom Sheet Wheels" and "Bottom Sheet With Increment"
 *   TimeInput stories, real touch input and the interaction harness
 * @output Interaction proofs for the sheet's time wheels following
 *   UIDatePicker: a drag of the hour from 11 to 12 turns AM to PM, the AM/PM
 *   column turning on UIDatePicker's own curve (`datePicker.wheels.columnTurn`:
 *   0.3 s on a sinusoid) after the hour commits; the turn keeps advancing every
 *   frame through a blocked main thread and keeps its curve under Reduced
 *   Motion; a finger on the AM/PM column mid-turn stops it, and the lift rests
 *   it on the nearest row, which the time takes; the minute column steps by
 *   the increment; a storyboard of the AM/PM column's turn.
 * @position Interaction tests of TimeWheels.tsx (`*.interaction.browser.spec.ts`,
 *   run by `pnpm test:interaction`)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  compareCurve,
  curveOf,
  drag,
  freezeTimers,
  holdAnimations,
  installTimerGate,
  openStory,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  tap as press,
  thawTimers,
  timeline,
  touchDriver,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type CastFrame,
  type TouchDriver,
  type TrackedFrame,
} from '@astryxdesign/interaction-harness';
import {datePicker} from '../../motion/uikit/datePicker';

const storybook = withStorybook(test);

const TURN_MS = datePicker.wheels.columnTurn.durationMs;
/** The column turn's oracle: ½ − ½ cos(πt), independent of the bézier. */
const sinusoid = (t: number) =>
  t >= TURN_MS ? 1 : 0.5 - 0.5 * Math.cos((Math.PI * Math.max(t, 0)) / TURN_MS);

interface OpenWheels {
  driver: TouchDriver;
  sheet: Locator;
  hour: Locator;
  meridiem: Locator;
}

async function openWheels(page: Page, story: string): Promise<OpenWheels> {
  await openStory(page, storybook(), story);
  const driver = await touchDriver(page);
  const opener = page.getByRole('button', {name: /^Open /}).first();
  const box = await opener.boundingBox();
  if (box == null) {
    throw new Error('no field');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const hour = page.getByRole('listbox', {name: 'Hour'});
  await expect(hour).toBeVisible();
  const sheet = page.getByRole('dialog').first();
  await waitForRest(sheet);
  return {
    driver,
    sheet,
    hour,
    meridiem: page.getByRole('listbox', {name: 'AM/PM'}),
  };
}

/** The label of the row at rest under the band. */
async function restingLabel(column: Locator): Promise<string | null> {
  return column.evaluate(element => {
    const id = element.getAttribute('aria-activedescendant');
    return id == null
      ? null
      : (document.getElementById(id)?.textContent ?? null);
  });
}

/** A slow drag that rests before the lift: one row up, no fling. */
async function turnOneRowDown(driver: TouchDriver, column: Locator) {
  const box = await column.boundingBox();
  if (box == null) {
    throw new Error('no column');
  }
  const from = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  // One 32 px row plus the pan's hysteresis.
  await driver.play(
    drag(from, {x: from.x, y: from.y - 42}, {durationMs: 300, restMs: 150}),
  );
}

/** The strip of the band's copy moves by one row pitch per row. */
const stripOf = (column: Locator) => column.locator('[data-wheel-strip]');

test('the AM/PM column follows the hour from 11 to 12 on UIDatePicker’s turn', async ({
  page,
}) => {
  const {driver, hour, meridiem} = await openWheels(
    page,
    'core-timeinput--bottom-sheet-wheels',
  );
  expect(await restingLabel(hour)).toBe('11');
  expect(await restingLabel(meridiem)).toBe('AM');

  // The Wheel ends a turn from a timer at the curve's duration: hold it with
  // the animations while they are sampled.
  await installTimerGate(page);
  await turnOneRowDown(driver, hour);
  // The hour commits at rest; the AM/PM column then turns by itself.
  await waitForAnimation(stripOf(meridiem));
  await freezeTimers(page);
  const held = await holdAnimations(page, meridiem);
  expect(held.length).toBeGreaterThan(0);
  const times = timeline(TURN_MS, 1000 / 60);
  const samples = await sampleCurve(stripOf(meridiem), times);
  const ys = curveOf(samples, 'translateY');
  const start = ys[0].value;
  const end = ys[ys.length - 1].value;
  expect(Math.abs(end - start)).toBeCloseTo(32, 0);
  const progress = ys.map(({t, value}) => ({
    t,
    value: (value - start) / (end - start),
  }));
  const fit = compareCurve(progress, sinusoid, 0.02);
  expect(fit.pass, JSON.stringify(fit.worst)).toBe(true);
  await releaseAnimations(page);
  await thawTimers(page);
  await waitForRest(meridiem);

  await expect.poll(async () => restingLabel(hour)).toBe('12');
  await expect.poll(async () => restingLabel(meridiem)).toBe('PM');
  await expect(page.getByRole('dialog').first()).toBeVisible();
});

/**
 * The vertical centre of the text in a column's box, per frame: the labels
 * on the drum and in the band move with the column, so it moves as it turns.
 */
async function textCentres(
  page: Page,
  frames: ReadonlyArray<CastFrame>,
  rect: {x: number; y: number; width: number; height: number},
): Promise<TrackedFrame[]> {
  const scratch = await page.context().newPage();
  try {
    const out: TrackedFrame[] = [];
    for (let i = 0; i < frames.length; i += 12) {
      const batch = frames.slice(i, i + 12);
      const centres = await scratch.evaluate(
        async ({items, box}) => {
          const results: (number | null)[] = [];
          for (const item of items) {
            const blob = await (
              await fetch(`data:image/${item.format};base64,${item.data}`)
            ).blob();
            const bitmap = await createImageBitmap(blob);
            const scale = bitmap.width / item.viewportWidth;
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const context = canvas.getContext('2d');
            if (context == null) {
              throw new Error('no 2d context');
            }
            context.drawImage(bitmap, 0, 0);
            const x = Math.round(box.x * scale);
            const y = Math.round(box.y * scale);
            const w = Math.round(box.width * scale);
            const h = Math.round(box.height * scale);
            const {data} = context.getImageData(x, y, w, h);
            let weight = 0;
            let sum = 0;
            for (let row = 0; row < h; row += 1) {
              for (let col = 0; col < w; col += 1) {
                const o = (row * w + col) * 4;
                // Ink: how far below white, summed over the channels.
                const ink = Math.max(
                  0,
                  600 - data[o] - data[o + 1] - data[o + 2],
                );
                weight += ink;
                sum += ink * row;
              }
            }
            results.push(weight === 0 ? null : sum / weight / scale);
          }
          return results;
        },
        {
          items: batch.map(f => ({
            data: f.data,
            format: f.format,
            viewportWidth: f.viewportWidth,
          })),
          box: rect,
        },
      );
      centres.forEach((centre, k) =>
        out.push({
          t: batch[k].t,
          box:
            centre == null ? null : {x: 0, y: centre * 10, width: 0, height: 0},
          pixels: 1,
        }),
      );
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('the AM/PM turn keeps advancing every frame through a blocked main thread', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName === 'webkit',
    "WebKit's screencast clock is not the page's (frames arrive ~100 ms off), so a 0.3 s turn cannot be placed inside the block; Mobile Safari on the iOS simulator is this proof's WebKit evidence",
  );
  const {driver, hour, meridiem} = await openWheels(
    page,
    'core-timeinput--bottom-sheet-wheels',
  );
  const rect = await meridiem.boundingBox();
  if (rect == null) {
    throw new Error('no AM/PM column');
  }
  const cast = await startScreencast(page);
  await page.waitForTimeout(300);
  await turnOneRowDown(driver, hour);
  // The page blocks itself once the AM/PM column has turned for 32 ms.
  const busy = await blockMainThread(page, 600, {
    during: stripOf(meridiem),
    minProgressMs: 32,
  });
  await page.waitForTimeout(500);
  const tracked = await textCentres(page, await cast.stop(), rect);
  // Judged until the turn's end (the text centre in tenths of a px).
  const spanned = {...busy, to: Math.min(busy.to, busy.from + TURN_MS - 32)};
  const proof = busyWindowProof(tracked, spanned, {
    axis: 'y',
    settledWithin: 5,
  });
  await writeEvidence(
    'busy-main-thread/timewheels-meridiem-turn',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          busy,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - busy.from).toFixed(1),
            y: f.box == null ? null : +(f.box.y / 10).toFixed(2),
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  testInfo.annotations.push({
    type: 'busy-main-thread',
    description: proof.summary,
  });
  expect(proof.verdict.failures, proof.summary).toEqual([]);
  await expect.poll(async () => restingLabel(meridiem)).toBe('PM');
});

test('Reduced Motion keeps the AM/PM turn on its curve: a picker’s own motion', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, hour, meridiem} = await openWheels(
    page,
    'core-timeinput--bottom-sheet-wheels',
  );
  await installTimerGate(page);
  await turnOneRowDown(driver, hour);
  await waitForAnimation(stripOf(meridiem));
  await freezeTimers(page);
  await holdAnimations(page, meridiem);
  const ys = curveOf(
    await sampleCurve(stripOf(meridiem), timeline(TURN_MS, 1000 / 60)),
    'translateY',
  );
  const start = ys[0].value;
  const end = ys[ys.length - 1].value;
  expect(Math.abs(end - start)).toBeCloseTo(32, 0);
  const fit = compareCurve(
    ys.map(({t, value}) => ({t, value: (value - start) / (end - start)})),
    sinusoid,
    0.02,
  );
  expect(fit.pass, JSON.stringify(fit.worst)).toBe(true);
  await releaseAnimations(page);
  await thawTimers(page);
  await expect.poll(async () => restingLabel(meridiem)).toBe('PM');
});

test('a finger on the AM/PM column mid-turn stops it; the lift rests it on the nearest row', async ({
  page,
}) => {
  const {driver, hour, meridiem} = await openWheels(
    page,
    'core-timeinput--bottom-sheet-wheels',
  );
  const field = page.locator('input').first();
  await turnOneRowDown(driver, hour);
  // Early in the turn, while AM is still the nearer row.
  await stripOf(meridiem).evaluate(
    async element =>
      new Promise<void>(resolve => {
        const check = () => {
          const running = element
            .getAnimations()
            .some(a => Number(a.currentTime ?? 0) >= 20);
          if (running) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      }),
  );
  const box = await meridiem.boundingBox();
  if (box == null) {
    throw new Error('no AM/PM column');
  }
  const at = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  const caught = stripOf(meridiem).evaluate(
    async element =>
      new Promise<number[]>(resolve => {
        // The strip's offset each frame while the finger is down.
        const ys: number[] = [];
        const t0 = performance.now();
        const tick = () => {
          ys.push(
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
          );
          if (performance.now() - t0 < 200) {
            requestAnimationFrame(tick);
          } else {
            resolve(ys);
          }
        };
        tick();
      }),
  );
  // A press held in place for 250 ms, then the lift.
  await driver.play(press(at, {holdMs: 250}));
  const held = await caught;
  // Stopped where the finger caught it: still at most 1 px of drift.
  const tail = held.slice(Math.floor(held.length / 2));
  expect(Math.max(...tail) - Math.min(...tail)).toBeLessThan(1);
  await waitForRest(meridiem);
  await expect.poll(async () => restingLabel(meridiem)).toBe('AM');
  await expect(field).toHaveValue('12:58 AM');
});

test('the minute column steps by the increment', async ({page}) => {
  await openWheels(page, 'core-timeinput--bottom-sheet-with-increment');
  const minutes = page.getByRole('listbox', {name: 'Minute'});
  await expect(minutes.getByRole('option')).toHaveText([
    '00',
    '15',
    '30',
    '45',
  ]);
});

test(
  'storyboard: the AM/PM column turns after the hour',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, sheet, hour, meridiem} = await openWheels(
      page,
      'core-timeinput--bottom-sheet-wheels',
    );
    await installTimerGate(page);
    await turnOneRowDown(driver, hour);
    await waitForAnimation(stripOf(meridiem));
    await freezeTimers(page);
    const clip = (await sheet.boundingBox()) ?? undefined;
    const {storyboard} = await animationStoryboard(page, {
      name: 'timewheels-meridiem-follows-hour',
      clip,
      scope: meridiem,
      times: timeline(TURN_MS, 1000 / 30),
      columns: 6,
      cellScale: 0.4,
      measure: async () => ({
        y: await stripOf(meridiem).evaluate(element =>
          Number(
            new DOMMatrixReadOnly(
              getComputedStyle(element).transform,
            ).m42.toFixed(2),
          ),
        ),
      }),
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
  },
);

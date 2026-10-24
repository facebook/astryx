// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetPresent.interaction.browser.spec.ts
 * @input The built "Snap points" BottomSheet story, real touch input
 *   (Chromium CDP / WebKit's input command), the interaction harness and the
 *   UIKit constants table (the parameters the oracle spring uses)
 * @output Interaction and animation proofs that, under a finger, the sheet
 *   opens and closes on UIKit's sheet spring: the entrance and the exit
 *   sampled frame by frame against an independent spring oracle (from the
 *   sheet's resting top to the bottom of the screen and back), the dim on the
 *   same spring's progress, the entrance advancing every frame through a
 *   blocked main thread, a fade on the spring instead under Reduce Motion,
 *   and a storyboard of the entrance.
 * @position Interaction proof for BottomSheet's presentation, in the shape of
 *   BottomSheetDetent.interaction.browser.spec.ts
 *
 * The sheet travels on the `translate` property (the motion foundation's
 * animator) from its resting `transform`; the dim is the dialog's
 * `::backdrop` opacity, animated by the same animator.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  freezeTimers,
  holdAnimations,
  installTimerGate,
  markElement,
  openStory,
  releaseAnimations,
  springStep,
  startScreencast,
  thawTimers,
  timeline,
  touchDriver,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TimedValue,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {springs} from '../../motion/uikit/springs';

const storybook = withStorybook(test);

/**
 * The oracle's parameters for a table spring. A Core Animation spring
 * (mass, stiffness, damping) renders critically damped when overdamped, as
 * UIKit attaches it (allowsOverdamping NO).
 */
function oracleParameters(
  spring:
    | {readonly response: number; readonly dampingRatio: number}
    | {
        readonly mass: number;
        readonly stiffness: number;
        readonly damping: number;
      },
): {response: number; dampingFraction: number} {
  if ('response' in spring) {
    return {response: spring.response, dampingFraction: spring.dampingRatio};
  }
  const omega = Math.sqrt(spring.stiffness / spring.mass);
  return {
    response: (2 * Math.PI) / omega,
    dampingFraction: Math.min(
      1,
      spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass)),
    ),
  };
}

/** The sheet spring from `from` to `to` px, from rest. */
function sheetSpring(
  spring: Parameters<typeof oracleParameters>[0],
  from: number,
  to: number,
) {
  const parameters = oracleParameters(spring);
  return (t: number) => from + (to - from) * springStep(parameters, t);
}

interface Story {
  driver: TouchDriver;
  dialog: Locator;
  sheet: Locator;
  tapTrigger: () => Promise<void>;
}

async function story(page: Page): Promise<Story> {
  await openStory(page, storybook(), 'core-bottomsheet--snap-points');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Open nearby places'});
  // CSS, not the role: a closing dialog is aria-hidden and inert, and must
  // still be found while its exit runs.
  const dialog = page.locator('dialog[aria-label="Nearby places"]');
  return {
    driver,
    dialog,
    sheet: dialog.locator('.astryx-bottom-sheet').first(),
    tapTrigger: async () => {
      const box = await trigger.boundingBox();
      if (box == null) {
        throw new Error('no trigger');
      }
      await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    },
  };
}

/**
 * The sheet's travel and the dim at each time (ms from the held animations'
 * start): its `translate` plus its `transform`, and the `::backdrop`
 * opacity. Hold the animations first.
 */
async function sampleSheet(
  dialog: Locator,
  sheet: Locator,
  times: ReadonlyArray<number>,
): Promise<{t: number; travel: number; dim: number}[]> {
  const element = await sheet.elementHandle();
  return dialog.evaluate(
    (dialogElement, {ts, sheetElement}) => {
      const held =
        (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
        [];
      return ts.map(t => {
        for (const animation of held) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
        const style = getComputedStyle(sheetElement as Element);
        const translate =
          style.translate === 'none'
            ? 0
            : Number.parseFloat(style.translate.split(' ')[1] ?? '0');
        const transform =
          style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42;
        return {
          t,
          travel: translate + transform,
          dim: Number(getComputedStyle(dialogElement, '::backdrop').opacity),
        };
      });
    },
    {ts: [...times], sheetElement: element},
  );
}

const sheetTop = async (sheet: Locator) =>
  sheet.evaluate(el => el.getBoundingClientRect().y);

test('opens on the sheet spring from below the screen, the dim on the same curve', async ({
  page,
}) => {
  const {dialog, sheet, tapTrigger} = await story(page);
  await tapTrigger();
  const [entrance] = await waitForAnimation(sheet);
  await holdAnimations(page, dialog);
  const samples = await sampleSheet(
    dialog,
    sheet,
    timeline(entrance.durationMs),
  );
  await releaseAnimations(page);
  await waitForRest(sheet);
  const restTop = await sheetTop(sheet);
  const viewportHeight = page.viewportSize()?.height ?? 0;
  // From the bottom of the screen to the sheet's rest.
  const from = samples[0].travel;
  expect(from).toBeCloseTo(viewportHeight - restTop, 0);
  const travel: TimedValue[] = samples.map(s => ({t: s.t, value: s.travel}));
  const result = compareCurve(
    travel,
    sheetSpring(springs.sheetPresent, from, 0),
    0.5,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  // The dim rises with the spring's progress: clear below the screen.
  for (const s of samples) {
    expect(s.dim, `t=${s.t}`).toBeCloseTo(1 - s.travel / from, 2);
  }
});

test('closes on the sheet spring, back below the screen', async ({page}) => {
  const {driver, dialog, sheet, tapTrigger} = await story(page);
  await tapTrigger();
  await expect(sheet).toBeVisible();
  await waitForRest(sheet);
  const restTop = await sheetTop(sheet);
  const viewport = page.viewportSize() ?? {width: 402, height: 714};
  const viewportHeight = viewport.height;
  // A tap on the dimmed page above the sheet closes it (purpose "info").
  await driver.tap({x: viewport.width / 2, y: restTop / 2});
  const [exit] = await waitForAnimation(sheet);
  await holdAnimations(page, dialog);
  const samples = await sampleSheet(dialog, sheet, timeline(exit.durationMs));
  await releaseAnimations(page);
  const distance = viewportHeight - restTop;
  const travel: TimedValue[] = samples.map(s => ({t: s.t, value: s.travel}));
  const result = compareCurve(
    travel,
    sheetSpring(springs.sheetDismiss, 0, distance),
    0.5,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  for (const s of samples) {
    expect(s.dim, `t=${s.t}`).toBeCloseTo(1 - s.travel / distance, 2);
  }
  await expect(dialog).not.toHaveAttribute('open');
});

test('the entrance keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName === 'webkit',
    "Playwright WebKit's screencast sends no frames while a dialog's entrance runs; the iOS simulator recording is the WebKit proof",
  );
  const {sheet, tapTrigger} = await story(page);
  const cast = await startScreencast(page);
  await tapTrigger();
  await markElement(sheet);
  const [entrance] = await waitForAnimation(sheet, {minProgressMs: 16});
  const block = await blockMainThread(page, 700);
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  // Judge while the sheet still moves more than a screencast frame resolves
  // per frame. This spring (ω 18.3/s) moves about 0.3 × the remaining
  // distance a 60 Hz frame, under Chromium's 1 px within ~4 px of the end;
  // WebKit's frames resolve 2 px every ~11 ms, so 10 px there.
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, entrance.to)},
    {settledWithin: browserName === 'webkit' ? 10 : 4},
  );
  await writeEvidence(
    'busy-main-thread/bottomsheet-present',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          entrance,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            y: f.box?.y ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'bottomsheet-present-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, entrance.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({y: tracked.find(f => f.t === t)?.box?.y ?? -1}),
  });
  await film.write(testInfo, {block, entrance});
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
});

test('under Reduce Motion the sheet fades in on the sheet spring instead of sliding', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {dialog, sheet, tapTrigger} = await story(page);
  await tapTrigger();
  await expect(sheet).toBeVisible();
  const [fade] = await waitForAnimation(sheet);
  await holdAnimations(page, dialog);
  const opacity = await sheet.evaluate((element, ts) => {
    const held =
      (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ?? [];
    return ts.map(t => {
      for (const animation of held) {
        animation.currentTime = t;
      }
      const style = getComputedStyle(element);
      const translate =
        style.translate === 'none'
          ? 0
          : Number.parseFloat(style.translate.split(' ')[1] ?? '0');
      return {t, opacity: Number(style.opacity), translate};
    });
  }, timeline(fade.durationMs));
  await releaseAnimations(page);
  // In place from the first frame, rising on the spring.
  const rising = sheetSpring(springs.sheetPresent, 0, 1);
  for (const s of opacity) {
    expect(s.translate, `t=${s.t}`).toBe(0);
    expect(s.opacity, `t=${s.t}`).toBeCloseTo(rising(s.t), 1);
  }
});

test(
  'storyboard: the sheet opens on its spring',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {dialog, sheet, tapTrigger} = await story(page);
    // Gate the page's timers, so the entrance's completion timer is held with
    // its animation while the filmstrip is photographed.
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    await tapTrigger();
    await waitForAnimation(sheet);
    await freezeTimers(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'bottomsheet-present',
      clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
      scope: dialog,
      measure: async () => ({
        top: await sheetTop(sheet),
        dim: await dialog.evaluate(el =>
          Number(getComputedStyle(el, '::backdrop').opacity),
        ),
      }),
      columns: 7,
      cellScale: 0.4,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await storyboard.write(testInfo);
    // The top only falls toward its rest and the dim only rises.
    const frames = storyboard.frames.map(f => ({
      top: f.data.top as number,
      dim: f.data.dim as number,
    }));
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].top).toBeLessThanOrEqual(frames[i - 1].top + 0.5);
      expect(frames[i].dim).toBeGreaterThanOrEqual(frames[i - 1].dim - 0.005);
    }
    expect(frames[0].dim).toBeLessThan(0.1);
    expect(frames.at(-1)?.dim).toBeCloseTo(1, 1);
  },
);

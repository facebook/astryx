// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.motion.interaction.browser.spec.ts
 * @input The built "Delete" AlertDialog story on the phone profile (and a
 *   desktop pointer profile for the unchanged path), real touch input and the
 *   interaction harness
 * @output Animation proofs for the alert's touch presentation, which follows
 *   UIKit's measured alert (iOS 26.2): presenting, it scales from 1.2 to 1 and
 *   fades in while the dimming fades in, all on springs.alertPresent;
 *   dismissing, both only fade out on springs.alertDismiss, the dialog closes
 *   when the fade ends and focus returns to the opener; both run on the
 *   compositor (frames keep coming through a blocked main thread, no Layout or
 *   Paint per frame); a tap during either transition reaches nothing; under
 *   Reduce Motion the scale is dropped and the fade keeps its spring; a mouse
 *   keeps the theme's entrance and closes at once; storyboards of the present
 *   and the dismiss.
 * @position Motion lane of AlertDialog, beside the touch-tracking spec. Run
 *   with `pnpm test:interaction AlertDialog`.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  compareCurve,
  countBetween,
  freezeTimers,
  installTimerGate,
  openStory,
  releaseAnimations,
  springStep,
  startScreencast,
  thawTimers,
  timeline,
  touchDriver,
  traceRendering,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type Point,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {alertController} from '../../motion/uikit/alert';
import {springs} from '../../motion/uikit/springs';

const storybook = withStorybook(test);

/** Progress of a mass-stiffness-damping spring, from the harness's oracle. */
function progressOf(spring: {
  mass: number;
  stiffness: number;
  damping: number;
}): (t: number) => number {
  const response = (2 * Math.PI) / Math.sqrt(spring.stiffness / spring.mass);
  const dampingFraction =
    spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
  return t => springStep({response, dampingFraction}, t);
}

const present = progressOf(springs.alertPresent);
const dismiss = progressOf(springs.alertDismiss);
const {scaleFrom} = alertController.present;
const PRESENT_MS = alertController.present.durationMs;
const DISMISS_MS = alertController.dismiss.durationMs;

// The animator bakes curves into keyframes within 0.002 (opacity) and 0.0002
// (scale) of the curve; the engines round computed values on top of that.
const OPACITY_TOLERANCE = 0.004;
const SCALE_TOLERANCE = 0.001;

const centerOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
};

interface Opened {
  driver: TouchDriver;
  trigger: Locator;
  dialog: Locator;
}

/** Opens the story with the alert closed. */
async function openPage(page: Page): Promise<Opened> {
  await openStory(page, storybook(), 'core-alertdialog--delete');
  return {
    driver: await touchDriver(page),
    trigger: page.getByRole('button', {name: 'Delete item'}),
    dialog: page.getByRole('alertdialog', {name: 'Delete item?'}),
  };
}

interface AlertSample {
  t: number;
  scale: number;
  opacity: number;
  dim: number;
}

/**
 * Pauses the open dialog's animations (its own and its ::backdrop's, all on
 * one start time) and reads the presented scale, opacity and dimming opacity
 * at each time from their start.
 */
async function sampleAlert(
  page: Page,
  times: ReadonlyArray<number>,
): Promise<{held: number; samples: AlertSample[]}> {
  return page.evaluate(ts => {
    const dialog = document.querySelector('dialog[open]');
    if (dialog == null) {
      throw new Error('no open dialog');
    }
    // The transition in flight: the dialog's animations that started last
    // (an earlier transition's curves may still hold their end state).
    const onDialog = document
      .getAnimations()
      .filter(a => (a.effect as KeyframeEffect | null)?.target === dialog);
    const latest = Math.max(...onDialog.map(a => Number(a.startTime)));
    const held = onDialog.filter(a => Number(a.startTime) === latest);
    for (const animation of held) {
      animation.pause();
    }
    // releaseAnimations resumes them.
    (window as unknown as {__harnessHeld: Animation[]}).__harnessHeld = held;
    const scaleOf = (value: string) =>
      value === 'none' ? 1 : Number(value.split(' ')[0]);
    const samples = ts.map(t => {
      for (const animation of held) {
        animation.currentTime = t;
      }
      const own = getComputedStyle(dialog);
      return {
        t,
        scale: scaleOf(own.scale),
        opacity: Number(own.opacity),
        dim: Number(getComputedStyle(dialog, '::backdrop').opacity),
      };
    });
    return {held: held.length, samples};
  }, times);
}

const channel = (samples: AlertSample[], key: 'scale' | 'opacity' | 'dim') =>
  samples.map(s => ({t: s.t, value: s[key]}));

/** Frames the compositor presented inside a window, and the longest gap. */
function cadence(
  frameTimes: ReadonlyArray<number>,
  window: {from: number; to: number},
): {frames: number; expected: number; longestGapMs: number} {
  const inside = frameTimes.filter(t => t >= window.from && t <= window.to);
  const edges = [window.from, ...inside, window.to];
  let longestGapMs = 0;
  for (let i = 1; i < edges.length; i += 1) {
    longestGapMs = Math.max(longestGapMs, edges[i] - edges[i - 1]);
  }
  return {
    frames: inside.length,
    expected: Math.floor((window.to - window.from) / (1000 / 60)),
    longestGapMs,
  };
}

test.describe('under a finger', () => {
  test('presents from scale 1.2 and opacity 0 with the dimming, on the alert spring', async ({
    page,
  }, testInfo) => {
    const {driver, trigger, dialog} = await openPage(page);
    await driver.tap(await centerOf(trigger));
    await waitForAnimation(dialog);
    const {held, samples} = await sampleAlert(page, timeline(PRESENT_MS));
    // The alert's scale and opacity, and the dimming's opacity.
    expect(held).toBe(3);
    const scale = compareCurve(
      channel(samples, 'scale'),
      t => scaleFrom + (1 - scaleFrom) * present(t),
      SCALE_TOLERANCE,
    );
    const opacity = compareCurve(
      channel(samples, 'opacity'),
      present,
      OPACITY_TOLERANCE,
    );
    const dim = compareCurve(
      channel(samples, 'dim'),
      present,
      OPACITY_TOLERANCE,
    );
    await releaseAnimations(page);
    await writeEvidence(
      'curves/alertdialog-present',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {spring: springs.alertPresent, scaleFrom, scale, opacity, dim},
          null,
          1,
        ),
      },
      testInfo,
    );
    expect(scale.maxError, JSON.stringify(scale.worst)).toBeLessThanOrEqual(
      SCALE_TOLERANCE,
    );
    expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
      OPACITY_TOLERANCE,
    );
    expect(dim.maxError, JSON.stringify(dim.worst)).toBeLessThanOrEqual(
      OPACITY_TOLERANCE,
    );
    // Nothing moves from the opener: the alert stays centred.
    await waitForRest(dialog);
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (box != null && viewport != null) {
      expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0);
    }
  });

  test('dismisses with a fade alone on the alert spring, closes at its end and returns focus', async ({
    page,
  }, testInfo) => {
    const {driver, trigger, dialog} = await openPage(page);
    await driver.tap(await centerOf(trigger));
    await waitForRest(dialog);
    await installTimerGate(page);
    await driver.tap(
      await centerOf(dialog.getByRole('button', {name: 'Cancel'})),
    );
    await waitForAnimation(dialog);
    // The exit's backstop timer must not close the dialog while it is held.
    await freezeTimers(page);
    const {held, samples} = await sampleAlert(page, timeline(DISMISS_MS));
    // The alert's opacity and the dimming's: nothing scales.
    expect(held).toBe(2);
    const scale = compareCurve(channel(samples, 'scale'), () => 1, 0);
    const opacity = compareCurve(
      channel(samples, 'opacity'),
      t => 1 - dismiss(t),
      OPACITY_TOLERANCE,
    );
    const dim = compareCurve(
      channel(samples, 'dim'),
      t => 1 - dismiss(t),
      OPACITY_TOLERANCE,
    );
    // Still presented while it fades: the caller's state is already closed.
    await expect(dialog).toBeAttached();
    expect(await dialog.evaluate(el => (el as HTMLDialogElement).open)).toBe(
      true,
    );
    await releaseAnimations(page);
    await thawTimers(page);
    await writeEvidence(
      'curves/alertdialog-dismiss',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {spring: springs.alertDismiss, scale, opacity, dim},
          null,
          1,
        ),
      },
      testInfo,
    );
    expect(scale.maxError, JSON.stringify(scale.worst)).toBe(0);
    expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
      OPACITY_TOLERANCE,
    );
    expect(dim.maxError, JSON.stringify(dim.worst)).toBeLessThanOrEqual(
      OPACITY_TOLERANCE,
    );
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a tap while the alert presents reaches nothing', async ({page}) => {
    const {driver, trigger, dialog} = await openPage(page);
    const triggerPoint = await centerOf(trigger);
    await driver.tap(triggerPoint);
    await waitForAnimation(dialog);
    const cancelPoint = await centerOf(
      dialog.getByRole('button', {name: 'Cancel'}),
    );
    await page.evaluate(() => {
      const dialogElement = document.querySelector('dialog[open]');
      const start = document
        .getAnimations()
        .find(
          a => (a.effect as KeyframeEffect | null)?.target === dialogElement,
        )?.startTime;
      const log = {start: Number(start), touches: [] as number[]};
      (window as unknown as {__presentLog: typeof log}).__presentLog = log;
      document.addEventListener(
        'touchstart',
        event => log.touches.push(event.timeStamp),
        true,
      );
    });
    await driver.tap(cancelPoint);
    const log = await page.evaluate(
      () =>
        (
          window as unknown as {
            __presentLog: {start: number; touches: number[]};
          }
        ).__presentLog,
    );
    // The tap must have landed inside the presentation for this to prove
    // anything.
    expect(log.touches[0] - log.start).toBeLessThan(
      alertController.present.ignoresTouchesForMs,
    );
    await waitForRest(dialog);
    await page.waitForTimeout(100);
    await expect(dialog).toBeVisible();
  });

  test('a tap while the alert leaves reaches nothing', async ({page}) => {
    const {driver, trigger, dialog} = await openPage(page);
    await driver.tap(await centerOf(trigger));
    await waitForRest(dialog);
    const del = dialog.getByRole('button', {name: 'Delete'});
    const deletePoint = await centerOf(del);
    await page.evaluate(() => {
      const clicks: string[] = [];
      (window as unknown as {__leaveClicks: string[]}).__leaveClicks = clicks;
      document.addEventListener(
        'click',
        event => {
          const button = (event.target as Element).closest('button');
          if (button != null) {
            clicks.push(button.textContent ?? '');
          }
        },
        true,
      );
    });
    await driver.tap(
      await centerOf(dialog.getByRole('button', {name: 'Cancel'})),
    );
    // A second tap on Delete while the alert fades out.
    await driver.tap(deletePoint);
    await expect(dialog).toBeHidden();
    const clicks = await page.evaluate(
      () => (window as unknown as {__leaveClicks: string[]}).__leaveClicks,
    );
    expect(clicks).toEqual(['Cancel']);
  });

  test('present and dismiss keep presenting frames while the main thread is blocked', async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
    );
    const {driver, trigger, dialog} = await openPage(page);
    const proofs: Record<string, ReturnType<typeof cadence>> = {};
    for (const phase of ['present', 'dismiss'] as const) {
      const cast = await startScreencast(page, {format: 'jpeg', quality: 40});
      await driver.tap(
        await centerOf(
          phase === 'present'
            ? trigger
            : dialog.getByRole('button', {name: 'Cancel'}),
        ),
      );
      const [running] = await waitForAnimation(dialog, {minProgressMs: 16});
      const block = await blockMainThread(page, 250);
      const frames = await cast.stop();
      // The curve's own end: the animation keeps holding its end state after.
      const curveEnd =
        running.from + (phase === 'present' ? PRESENT_MS : DISMISS_MS);
      proofs[phase] = cadence(
        frames.map(f => f.t),
        {from: block.from + 20, to: Math.min(block.to, curveEnd) - 20},
      );
      if (phase === 'present') {
        await waitForRest(dialog);
        await page.waitForTimeout(100);
      } else {
        await expect(dialog).toBeHidden();
      }
    }
    await writeEvidence(
      'busy-main-thread/alertdialog',
      {[`${testInfo.project.name}.json`]: JSON.stringify(proofs, null, 1)},
      testInfo,
    );
    for (const proof of Object.values(proofs)) {
      expect(proof.frames, JSON.stringify(proofs)).toBeGreaterThanOrEqual(
        proof.expected - 2,
      );
      expect(proof.longestGapMs, JSON.stringify(proofs)).toBeLessThan(40);
    }
  });

  test('present and dismiss do no Layout or Paint per frame', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
    const {trigger, dialog} = await openPage(page);
    const windows: Record<string, {from: number; to: number}> = {};
    // Opened by a script click and closed with Escape: a tapped button's own
    // press highlight fades with a paint per frame, which is not the alert's.
    const trace = await traceRendering(page, async () => {
      await trigger.evaluate(el => (el as HTMLElement).click());
      windows.present = (await waitForAnimation(dialog))[0];
      await waitForRest(dialog);
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
      windows.dismiss = (await waitForAnimation(dialog))[0];
      await expect(dialog).toBeHidden();
    });
    const counts = Object.fromEntries(
      Object.entries(windows).map(([phase, window]) => [
        phase,
        // The steady part of the curve (the animation holds its end state
        // after it): the first and last frames may commit.
        countBetween(
          trace,
          window.from + 50,
          window.from + (phase === 'present' ? PRESENT_MS : DISMISS_MS) - 50,
        ),
      ]),
    );
    for (const during of Object.values(counts)) {
      expect(during.Layout ?? 0, JSON.stringify(counts)).toBe(0);
      expect(during.Paint ?? 0, JSON.stringify(counts)).toBe(0);
    }
  });

  test('under Reduce Motion the scale is dropped and the fade keeps the spring', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver, trigger, dialog} = await openPage(page);
    await driver.tap(await centerOf(trigger));
    await waitForAnimation(dialog);
    const {samples} = await sampleAlert(page, timeline(PRESENT_MS));
    await releaseAnimations(page);
    expect(compareCurve(channel(samples, 'scale'), () => 1, 0).maxError).toBe(
      0,
    );
    const opacity = compareCurve(
      channel(samples, 'opacity'),
      present,
      OPACITY_TOLERANCE,
    );
    expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
      OPACITY_TOLERANCE,
    );
  });

  test(
    'storyboard: present and dismiss',
    {tag: '@storyboard'},
    async ({page}, testInfo) => {
      const {driver, trigger, dialog} = await openPage(page);
      await installTimerGate(page);
      const measure = async () =>
        page.evaluate(() => {
          const element = document.querySelector('dialog[open]');
          if (element == null) {
            return {scale: null, opacity: null, dim: null};
          }
          const own = getComputedStyle(element);
          return {
            scale: own.scale,
            opacity: Number(own.opacity),
            dim: Number(getComputedStyle(element, '::backdrop').opacity),
          };
        });
      await driver.tap(await centerOf(trigger));
      await waitForAnimation(dialog);
      await freezeTimers(page);
      const {storyboard: presentBoard} = await animationStoryboard(page, {
        name: 'alertdialog-present',
        scope: dialog,
        times: timeline(PRESENT_MS, 1000 / 30),
        measure,
        columns: 7,
        cellScale: 0.35,
      });
      await presentBoard.write(testInfo, {spring: springs.alertPresent});
      await releaseAnimations(page);
      await thawTimers(page);
      await waitForRest(dialog);
      await driver.tap(
        await centerOf(dialog.getByRole('button', {name: 'Cancel'})),
      );
      await waitForAnimation(dialog);
      await freezeTimers(page);
      const {storyboard: dismissBoard} = await animationStoryboard(page, {
        name: 'alertdialog-dismiss',
        scope: dialog,
        times: timeline(DISMISS_MS, 1000 / 30),
        measure,
        columns: 7,
        cellScale: 0.35,
      });
      await dismissBoard.write(testInfo, {spring: springs.alertDismiss});
      await releaseAnimations(page);
      await thawTimers(page);
      await expect(dialog).toBeHidden();
      const first = presentBoard.frames[0].data;
      const last = dismissBoard.frames.at(-1)?.data;
      expect(first).toMatchObject({opacity: 0, dim: 0});
      expect(Number(String(first.scale).split(' ')[0])).toBeCloseTo(
        scaleFrom,
        3,
      );
      expect(Number(last?.opacity)).toBeLessThan(0.01);
    },
  );
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('keeps the theme entrance and closes at once', async ({page}) => {
    const {trigger, dialog} = await openPage(page);
    await trigger.click();
    const [entrance] = await waitForAnimation(dialog);
    expect(entrance.kind).toBe('CSSAnimation');
    await waitForRest(dialog);
    // A closed dialog leaves the accessibility tree: hold on to the element.
    const element = await dialog.elementHandle();
    await dialog.getByRole('button', {name: 'Cancel'}).click();
    // No exit: the dialog is closed by the next frame.
    expect(
      await element?.evaluate(
        async el =>
          new Promise<boolean>(resolve =>
            requestAnimationFrame(() =>
              resolve((el as HTMLDialogElement).open),
            ),
          ),
      ),
    ).toBe(false);
  });
});

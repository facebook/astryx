// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.motion.interaction.browser.spec.ts
 * @input The built "Delete" AlertDialog story on the phone profile (and a
 *   desktop pointer profile for the unchanged path), real touch input and the
 *   interaction harness
 * @output Animation proofs for the alert's presentation under a finger (a
 *   coarse pointer, in Chromium and WebKit alike: one touch model on every
 *   touch device), which follows UIKit's measured alert (iOS 26.2):
 *   presenting, it scales from 1.2 to 1 and
 *   fades in while the dimming fades in, all on springs.alertPresent;
 *   dismissing, both only fade out on springs.alertDismiss, the dialog closes
 *   when the fade ends and focus returns to the opener; it starts inside the
 *   viewport (UIKit's 320 pt width); closed mid-presentation it fades from
 *   where it is: from the presented value at the close, with its velocity,
 *   never above that fade; both run on the
 *   compositor (frames keep coming through a blocked main thread, judged
 *   with the backdrop blur off because this rig composites in software; no
 *   Layout or Paint per frame); a tap during either transition reaches
 *   nothing; under
 *   reduced motion the alert and the dimming cross-fade in and out, opacity
 *   only, settled within 200 ms (design:reduced-motion DR1, DR2); a finger in
 *   Chrome's engine gets the same presentation; a mouse keeps the theme's
 *   entrance and closes at once, and so does a finger with
 *   `presentation="dialog"` (Dialog's 400 width too); storyboards of the
 *   present and the dismiss.
 * @position Motion lane of AlertDialog, beside the touch-tracking spec. Run
 *   with `pnpm test:interaction AlertDialog`.
 */

import {
  expect,
  test,
  type ElementHandle,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  compareCurve,
  countBetween,
  drag,
  freezeTimers,
  installTimerGate,
  openStory,
  pinch,
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
import {solveSpring, toSpring} from '../../motion/spring';
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

/**
 * Opens the alert and closes it 100 ms into its presentation, inside the
 * page on its own clock (no round trip between the presentation's start and
 * the close). Returns the presentation's and the fade's timing, the
 * presented value at the close, and the alert's opacity at every frame until
 * the dialog has closed.
 */
async function closeMidPresentation(page: Page) {
  const {trigger} = await openPage(page);
  // Opened and closed inside the page, on the page's own clock: no
  // round trip between the presentation's start and the close.
  await trigger.evaluate(async opener => {
    (opener as HTMLElement).click();
  });
  return page.evaluate(async () => {
    const element = document.querySelector('dialog') as HTMLElement;
    const opacityAnimations = () =>
      element.getAnimations().filter(animation => {
        const effect = animation.effect as KeyframeEffect;
        return (
          effect.target === element &&
          effect.pseudoElement == null &&
          effect.getKeyframes().some(keyframe => 'opacity' in keyframe)
        );
      });
    // The presentation, once the browser has started it.
    const present = await new Promise<Animation>((resolve, reject) => {
      const giveUp = performance.now() + 2000;
      const look = () => {
        const found = opacityAnimations().find(
          animation => animation.startTime != null,
        );
        if (found != null) {
          resolve(found);
        } else if (performance.now() > giveUp) {
          reject(new Error('the alert did not present'));
        } else {
          requestAnimationFrame(look);
        }
      };
      look();
    });
    const presentEffect = present.effect as KeyframeEffect;
    const keyframes = presentEffect.getKeyframes().map(keyframe => ({
      offset: keyframe.computedOffset,
      value: Number(keyframe.opacity),
    }));
    const span = Number(presentEffect.getTiming().duration);
    const presentStart = Number(present.startTime);
    // The presentation's value at a time, as the browser computes it from
    // its keyframes (linear between them).
    const presentedAt = (time: number) => {
      const progress = Math.min(1, Math.max(0, (time - presentStart) / span));
      for (let i = 1; i < keyframes.length; i += 1) {
        const a = keyframes[i - 1];
        const b = keyframes[i];
        if (progress <= b.offset) {
          return b.offset === a.offset
            ? b.value
            : a.value +
                ((b.value - a.value) * (progress - a.offset)) /
                  (b.offset - a.offset);
        }
      }
      return keyframes[keyframes.length - 1].value;
    };
    // Mid-presentation: 100 ms after it started.
    await new Promise(resolve =>
      setTimeout(resolve, Math.max(0, presentStart + 100 - performance.now())),
    );
    const closedAt = performance.now();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    // React commits the close in a microtask queued during the dispatch,
    // and the leave runs in that commit.
    await Promise.resolve();
    const leftBy = performance.now();
    const fade = opacityAnimations().find(animation => animation !== present);
    if (fade == null) {
      throw new Error('no fade after the close');
    }
    // A fade that interrupts motion starts at the call (the animator
    // continues it from the frame on screen): its start is the close's own
    // instant, and its first keyframe the value it springs from. Read now,
    // before it can retire.
    const fadeStart = Number(fade.startTime);
    const from = Number(
      (fade.effect as KeyframeEffect).getKeyframes()[0].opacity,
    );
    // Every frame until the dialog has closed, however far apart the
    // browser puts them.
    const frames: number[] = [];
    let openFrames = 0;
    await new Promise<void>(resolve => {
      const tick = () => {
        frames.push(Number(getComputedStyle(element).opacity));
        const isOpen = element.matches('[open]');
        openFrames += isOpen ? 1 : 0;
        if (isOpen && frames.length < 90) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
    return {
      presentStart,
      closedAt,
      leftBy,
      fadeStart,
      from,
      presentedAtClose: presentedAt(fadeStart),
      frames,
      openFrames,
    };
  });
}

interface AnimateCall {
  pseudoElement: string | null;
  /** The properties its keyframes animate. */
  properties: string[];
  /** When every property has reached its end, ms after the start. */
  settleMs: number;
}

/**
 * Records every Web Animations call on the dialog and its `::backdrop`: what
 * the browser was asked to run, however short it is.
 */
async function recordAnimateCalls(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const calls: unknown[] = [];
    (window as unknown as {__animateCalls: unknown[]}).__animateCalls = calls;
    const original = Element.prototype.animate;
    Element.prototype.animate = function (
      this: Element,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      const animation = original.call(this, keyframes, options);
      if (this.tagName === 'DIALOG') {
        const effect = animation.effect as KeyframeEffect;
        const frames = effect.getKeyframes();
        const properties = [
          ...new Set(
            frames.flatMap(frame =>
              Object.keys(frame).filter(
                key =>
                  !['offset', 'computedOffset', 'easing', 'composite'].includes(
                    key,
                  ),
              ),
            ),
          ),
        ].sort();
        const duration = Number(effect.getTiming().duration);
        let settleMs = 0;
        for (const property of properties) {
          const end = frames[frames.length - 1][property];
          let reached = frames.length - 1;
          while (reached > 0 && frames[reached - 1][property] === end) {
            reached -= 1;
          }
          settleMs = Math.max(
            settleMs,
            frames[reached].computedOffset * duration,
          );
        }
        calls.push({
          // What the call asked for: an engine may report the target's
          // pseudo-element differently (Linux WebKit answers '').
          pseudoElement:
            typeof options === 'object'
              ? (options.pseudoElement ?? null)
              : null,
          properties,
          settleMs,
        });
      }
      return animation;
    };
  });
}

async function animateCalls(page: Page): Promise<AnimateCall[]> {
  return page.evaluate(
    () => (window as unknown as {__animateCalls: AnimateCall[]}).__animateCalls,
  );
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
/**
 * Pauses every animation started on a dialog the moment it is created
 * (`sampleAlert` seeks them, and releaseAnimations plays them).
 */
async function holdDialogAnimationsAtCreation(page: Page): Promise<void> {
  await page.evaluate(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function hold(
      this: Element,
      ...args: Parameters<Element['animate']>
    ) {
      const animation = animate.apply(this, args);
      if (this instanceof HTMLDialogElement) {
        animation.pause();
        const held =
          (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
          [];
        (window as unknown as {__harnessHeld: Animation[]}).__harnessHeld = [
          ...held,
          animation,
        ];
      }
      return animation;
    };
  });
}

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

/**
 * Frames the screencast delivered inside a window, judged at its own cadence,
 * as the harness's busy-window verdict judges them: the median interval
 * between the frames around the window (a loaded machine's screencast can
 * deliver one frame in several), the frames that cadence makes room for, and
 * the longest gap in those intervals. A main-thread animation delivers no
 * frame for the whole block.
 */
function cadence(
  frameTimes: ReadonlyArray<number>,
  window: {from: number; to: number},
): {
  frames: number;
  expected: number;
  cadenceMs: number;
  longestGapMs: number;
  longestGapFrames: number;
} {
  const inside = frameTimes.filter(t => t >= window.from && t <= window.to);
  const edges = [window.from, ...inside, window.to];
  let longestGapMs = 0;
  for (let i = 1; i < edges.length; i += 1) {
    longestGapMs = Math.max(longestGapMs, edges[i] - edges[i - 1]);
  }
  const around = frameTimes.filter(
    t => t >= window.from - 250 && t <= window.to + 250,
  );
  const intervals = around
    .slice(1)
    .map((t, i) => t - around[i])
    .sort((a, b) => a - b);
  const cadenceMs =
    intervals.length >= 4
      ? intervals[Math.floor(intervals.length / 2)]
      : 1000 / 60;
  return {
    frames: inside.length,
    expected: Math.floor((window.to - window.from) / cadenceMs),
    cadenceMs,
    longestGapMs,
    longestGapFrames: Math.round(longestGapMs / cadenceMs),
  };
}

test.describe('under a finger', () => {
  test('presents from scale 1.2 and opacity 0 with the dimming, on the alert spring', async ({
    page,
  }, testInfo) => {
    const {driver, trigger, dialog} = await openPage(page);
    // The dialog's animations are held as they are created, so the curves
    // are sampled however late the page answers: a presentation that ran
    // through before a poll after the tap first read the page (a fresh
    // WebKit is that slow) left nothing to sample.
    await holdDialogAnimationsAtCreation(page);
    await driver.tap(await centerOf(trigger));
    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter(
                a =>
                  (a.effect as KeyframeEffect | null)?.target instanceof
                  HTMLDialogElement,
              ).length,
        ),
      )
      .toBe(3);
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

  test("starts inside the viewport: UIKit's 320 pt alert, never scaled past the screen", async ({
    page,
  }) => {
    const {driver, trigger, dialog} = await openPage(page);
    await driver.tap(await centerOf(trigger));
    await waitForAnimation(dialog);
    // Paused at the presentation's first frame: scale 1.2.
    await sampleAlert(page, [0]);
    const box = await dialog.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: (el as HTMLElement).offsetWidth,
        viewport: document.documentElement.clientWidth,
      };
    });
    await releaseAnimations(page);
    expect(box.width).toBe(alertController.width);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(box.viewport);
  });

  test('closed right after opening, it fades from where it is: from the presented value at the close, with its velocity, and never above that fade', async ({
    page,
  }) => {
    // A take in which the renderer painted no frame while the alert faded
    // measured nothing: the WebKit container can stall a second under load
    // (its first frame came 1.3 s after the close, with the dialog already
    // closed). Such a take is taken again.
    let result = await closeMidPresentation(page);
    for (let take = 1; take < 3 && result.openFrames < 2; take += 1) {
      result = await closeMidPresentation(page);
    }
    const detail = JSON.stringify(result);
    // Closed mid-presentation.
    expect(result.presentedAtClose, detail).toBeGreaterThan(0.2);
    expect(result.presentedAtClose, detail).toBeLessThan(0.99);
    // The fade starts in the close's own commit, not at an earlier time.
    expect(result.fadeStart, detail).toBeGreaterThanOrEqual(result.closedAt);
    expect(result.fadeStart, detail).toBeLessThanOrEqual(result.leftBy);
    // It springs from the presented value at that instant...
    expect(
      Math.abs(result.from - result.presentedAtClose),
      detail,
    ).toBeLessThanOrEqual(OPACITY_TOLERANCE);
    // ...with the presentation's velocity there: the fade rises to its own
    // peak, then falls. No frame goes above that peak (the presented alert
    // would), and none rises again after it.
    const velocity = solveSpring(toSpring(springs.alertPresent), {
      from: 0,
      to: 1,
    }).velocity((result.fadeStart - result.presentStart) / 1000);
    const fade = solveSpring(toSpring(springs.alertDismiss), {
      from: result.from,
      to: 0,
      velocity,
    });
    let fadePeak = result.from;
    for (let t = 0; t <= 0.1; t += 0.0001) {
      fadePeak = Math.max(fadePeak, fade.value(t));
    }
    expect(result.openFrames, detail).toBeGreaterThanOrEqual(2);
    const peak = Math.max(...result.frames);
    const peakAt = result.frames.indexOf(peak);
    expect(peak, detail).toBeLessThanOrEqual(fadePeak + OPACITY_TOLERANCE);
    // Before its peak the fade has only risen from where it started: no frame
    // there shows less (the fade's end, say, painted early).
    for (const value of result.frames.slice(0, peakAt)) {
      expect(value, detail).toBeGreaterThanOrEqual(
        result.from - OPACITY_TOLERANCE,
      );
    }
    // After it, the fade only falls. The engine's own rounding of computed
    // values (WebKit's animation clock can put two frames a fraction of a
    // millisecond apart, out of order) is the measurement's precision, as for
    // every curve here.
    let previous = peak;
    for (const value of result.frames.slice(peakAt)) {
      expect(value, detail).toBeLessThanOrEqual(previous + OPACITY_TOLERANCE);
      previous = value;
    }
  });

  test('a tap while the alert presents reaches nothing', async ({page}) => {
    const {driver, trigger, dialog} = await openPage(page);
    const triggerPoint = await centerOf(trigger);
    // On the window, ahead of the hold's own listeners there (the hold
    // swallows a held touch at the window, so the document never hears it).
    await page.evaluate(() => {
      const log = {start: Number.NaN, touches: [] as number[]};
      (window as unknown as {__presentLog: typeof log}).__presentLog = log;
      window.addEventListener(
        'touchstart',
        event => log.touches.push(event.timeStamp),
        true,
      );
    });
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
      const log = (window as unknown as {__presentLog: {start: number; touches: number[]}}).__presentLog;
      log.start = Number(start);
      log.touches.length = 0;
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

  test('a key still reaches the alert while it presents: Escape closes it', async ({
    page,
  }) => {
    // Keys and assistive technology stay live while it presents (the hold
    // covers touches, presses and clicks alone). The key must land inside
    // the presentation, under its hold, for this to prove anything: a busy
    // page can push it past, and then it is taken again.
    let heldAtKey = false;
    for (let attempt = 0; attempt < 3 && !heldAtKey; attempt += 1) {
      const {driver, trigger, dialog} = await openPage(page);
      await page.evaluate(() => {
        const log = {heldAtKey: [] as boolean[]};
        (window as unknown as {__keyLog: typeof log}).__keyLog = log;
        document.addEventListener(
          'keydown',
          () =>
            log.heldAtKey.push(
              document.querySelector('dialog > [popover]') != null,
            ),
          true,
        );
      });
      await driver.tap(await centerOf(trigger));
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      heldAtKey = await page.evaluate(
        () =>
          (window as unknown as {__keyLog: {heldAtKey: boolean[]}}).__keyLog
            .heldAtKey[0] === true,
      );
      if (heldAtKey) {
        await expect(dialog).toBeHidden();
      }
    }
    expect(heldAtKey).toBe(true);
  });

  // spec:AST-094 FR35 (DEC-16): a drag that lands during the entrance
  // reaches nothing and scrolls nothing; an assistive-technology activation
  // acts; a pinch still zooms the page. Each must land inside the
  // presentation's hold to prove anything (the hold's shield is in the alert
  // when it lands): a busy page can push it past, so each retries.
  test('a drag that lands while the alert presents reaches nothing and scrolls nothing (spec:AST-094 FR35)', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'needs native scrolling from injected touches (Mobile Safari on the simulator)',
    );
    let heldAtDrag = false;
    for (let attempt = 0; attempt < 3 && !heldAtDrag; attempt += 1) {
      const {driver, trigger, dialog} = await openPage(page);
      const viewport = page.viewportSize();
      if (viewport == null) {
        throw new Error('no viewport');
      }
      await page.evaluate(() => {
        // A page that scrolls under the alert.
        const spacer = document.createElement('div');
        spacer.style.height = '300vh';
        document.body.append(spacer);
        const log = {heldAtDrag: [] as boolean[], clicks: [] as string[]};
        (window as unknown as {__dragLog: typeof log}).__dragLog = log;
        window.addEventListener(
          'touchstart',
          () =>
            log.heldAtDrag.push(
              document.querySelector('dialog > [popover]') != null,
            ),
          true,
        );
        document.addEventListener(
          'click',
          event => {
            const button = (event.target as Element).closest('dialog button');
            if (button != null) {
              log.clicks.push(button.textContent ?? '');
            }
          },
          true,
        );
      });
      await driver.tap(await centerOf(trigger));
      await waitForAnimation(dialog);
      const x = viewport.width / 2;
      await driver.play(
        drag(
          {x, y: viewport.height - 40},
          {x, y: viewport.height - 340},
          {durationMs: 150, restMs: 50},
        ),
      );
      const log = await page.evaluate(
        () =>
          (
            window as unknown as {
              __dragLog: {heldAtDrag: boolean[]; clicks: string[]};
            }
          ).__dragLog,
      );
      heldAtDrag = log.heldAtDrag.at(-1) === true;
      if (heldAtDrag) {
        await waitForRest(dialog);
        await expect(dialog).toBeVisible();
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(log.clicks).toEqual([]);
      }
    }
    expect(heldAtDrag).toBe(true);
  });

  test('an assistive-technology activation reaches its action while the alert presents (spec:AST-094 FR35)', async ({
    page,
  }) => {
    let heldAtActivation = false;
    for (let attempt = 0; attempt < 3 && !heldAtActivation; attempt += 1) {
      const {driver, trigger, dialog} = await openPage(page);
      await driver.tap(await centerOf(trigger));
      await waitForAnimation(dialog);
      // An activation with no pointer, as assistive technology sends it:
      // the button's own click, with no click count.
      heldAtActivation = await page.evaluate(() => {
        const held = document.querySelector('dialog > [popover]') != null;
        const cancel = [...document.querySelectorAll('dialog button')].find(
          button => button.textContent === 'Cancel',
        ) as HTMLButtonElement | undefined;
        cancel?.click();
        return held;
      });
      if (heldAtActivation) {
        await expect(dialog).toBeHidden();
      }
    }
    expect(heldAtActivation).toBe(true);
  });

  test('a pinch that lands while the alert presents still zooms the page (spec:AST-094 FR35, FR10)', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'needs pinch-zoom from injected touches (Mobile Safari on the simulator)',
    );
    let heldAtPinch = false;
    for (let attempt = 0; attempt < 3 && !heldAtPinch; attempt += 1) {
      const {driver, trigger, dialog} = await openPage(page);
      const viewport = page.viewportSize();
      if (viewport == null) {
        throw new Error('no viewport');
      }
      await page.evaluate(() => {
        const log = {heldAtPinch: [] as boolean[]};
        (window as unknown as {__pinchLog: typeof log}).__pinchLog = log;
        window.addEventListener(
          'touchstart',
          () =>
            log.heldAtPinch.push(
              document.querySelector('dialog > [popover]') != null,
            ),
          true,
        );
      });
      await driver.tap(await centerOf(trigger));
      await waitForAnimation(dialog);
      await driver.play(
        pinch({
          center: {x: viewport.width / 2, y: viewport.height / 2},
          fromDistance: 60,
          toDistance: 220,
          durationMs: 200,
        }),
      );
      // The pinch's first finger (the trigger's tap came before it).
      heldAtPinch = await page.evaluate(
        () =>
          (window as unknown as {__pinchLog: {heldAtPinch: boolean[]}})
            .__pinchLog.heldAtPinch[1] === true,
      );
      if (heldAtPinch) {
        await expect
          .poll(async () =>
            page.evaluate(() => window.visualViewport?.scale ?? 1),
          )
          .toBeGreaterThan(1.2);
        await expect(dialog).toBeVisible();
      }
    }
    expect(heldAtPinch).toBe(true);
  });

  test('a tap or a key while the alert leaves reaches nothing, on the alert or under it', async ({
    page,
  }) => {
    const {driver, trigger, dialog} = await openPage(page);
    const triggerPoint = await centerOf(trigger);
    await driver.tap(triggerPoint);
    await waitForRest(dialog);
    const del = dialog.getByRole('button', {name: 'Delete'});
    const deletePoint = await centerOf(del);
    await page.evaluate(
      ([onDelete, onPage]) => {
        const log = {
          clicks: [] as string[],
          heldHits: [] as boolean[],
          keys: [] as {open: boolean; focusInAlert: boolean}[],
        };
        (window as unknown as {__leave: typeof log}).__leave = log;
        // A key while it leaves: whether the alert was still up, and whether
        // focus was still in it (an action that turns inert while focused
        // would still take Enter).
        document.addEventListener(
          'keydown',
          () => {
            log.keys.push({
              open: document.querySelector('dialog[open]') != null,
              focusInAlert: document.activeElement?.closest('dialog') != null,
            });
          },
          true,
        );
        // While it leaves, what a touch would hit, on the alert and on the
        // page under it: the hold's shield, inside the alert, not the inert
        // content and not whatever lies beneath it.
        const hits = () => {
          for (const point of [onDelete, onPage]) {
            const hit = document.elementFromPoint(point.x, point.y);
            log.heldHits.push(
              hit?.matches('dialog > [popover]') === true &&
                hit.parentElement?.matches('dialog[open]') === true,
            );
          }
        };
        document.addEventListener(
          'click',
          event => {
            const button = (event.target as Element).closest('button');
            if (button != null) {
              log.clicks.push(button.textContent ?? '');
              if (button.textContent === 'Cancel') {
                requestAnimationFrame(() => requestAnimationFrame(hits));
              }
            }
          },
          true,
        );
      },
      [deletePoint, triggerPoint],
    );
    // Focus is in the alert when it starts to leave (its initial focus).
    expect(
      await page.evaluate(
        () => document.activeElement?.closest('dialog') != null,
      ),
    ).toBe(true);
    await driver.tap(
      await centerOf(dialog.getByRole('button', {name: 'Cancel'})),
    );
    // A second tap on Delete, and Enter, while the alert fades out.
    await driver.tap(deletePoint);
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    const log = await page.evaluate(
      () =>
        (
          window as unknown as {
            __leave: {
              clicks: string[];
              heldHits: boolean[];
              keys: {open: boolean; focusInAlert: boolean}[];
            };
          }
        ).__leave,
    );
    expect(log.clicks).toEqual(['Cancel']);
    expect(log.heldHits).toEqual([true, true]);
    // The key landed while it was leaving, with focus already out of it.
    expect(log.keys).toEqual([{open: true, focusInAlert: false}]);
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
    // This rig composites in software (no GPU), where Dialog's backdrop blur
    // alone takes most of every frame: Chromium's DrawFrame costs 9.0 ms with
    // it and 1.3 ms without, on an idle core. On a busy runner that drops
    // frames inside the block and around it alike (3 CPU hogs on the test's 4
    // cores: 18 of 20 runs at about 30 fps with the blur, 0 of 20 without),
    // while what this proves, which thread runs the motion, does not depend
    // on it. The blur stays in every other proof and in the storyboard.
    await page.addStyleTag({
      content: 'dialog::backdrop { backdrop-filter: none !important; }',
    });
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
        expect(
          await dialog.evaluate(
            el => getComputedStyle(el, '::backdrop').backdropFilter,
          ),
        ).toBe('none');
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
    // Judged at the screencast's own cadence (the harness's verdict, from
    // #8045): something to judge, nearly every frame that cadence makes room
    // for, and no gap over three of its intervals. No bound is absolute.
    for (const proof of Object.values(proofs)) {
      expect(proof.expected, JSON.stringify(proofs)).toBeGreaterThanOrEqual(4);
      expect(proof.frames, JSON.stringify(proofs)).toBeGreaterThanOrEqual(
        proof.expected - 2,
      );
      expect(
        proof.longestGapFrames,
        JSON.stringify(proofs),
      ).toBeLessThanOrEqual(3);
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

  test('under reduced motion it cross-fades in and out, opacity only, settled within 200 ms, with no scale; the dimming too (design:reduced-motion DR1, DR2)', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await recordAnimateCalls(page);
    const {driver, trigger, dialog} = await openPage(page);
    await driver.tap(await centerOf(trigger));
    await expect(dialog).toBeVisible();
    await waitForRest(dialog);
    const presented = await animateCalls(page);
    // A cross-fade of the alert and of its dimming, not a change with none.
    expect(new Set(presented.map(call => call.pseudoElement))).toEqual(
      new Set([null, '::backdrop']),
    );
    for (const call of presented) {
      expect(call.properties, JSON.stringify(presented)).toEqual(['opacity']);
      expect(call.settleMs, JSON.stringify(presented)).toBeLessThanOrEqual(200);
    }
    // At its own size: no scale, or the identity the animator writes in
    // place.
    expect(['none', '1', '1 1']).toContain(
      await dialog.evaluate(el => getComputedStyle(el).scale),
    );
    await page.evaluate(() => {
      (window as unknown as {__animateCalls: unknown[]}).__animateCalls.length =
        0;
    });
    await driver.tap(
      await centerOf(dialog.getByRole('button', {name: 'Cancel'})),
    );
    await expect(dialog).toBeHidden();
    const left = await animateCalls(page);
    expect(new Set(left.map(call => call.pseudoElement))).toEqual(
      new Set([null, '::backdrop']),
    );
    for (const call of left) {
      expect(call.properties, JSON.stringify(left)).toEqual(['opacity']);
      expect(call.settleMs, JSON.stringify(left)).toBeLessThanOrEqual(200);
    }
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

test.describe('under a finger with presentation="dialog"', () => {
  test("keeps the dialog a mouse gets: the theme entrance, Dialog's 400 width, and a close at once", async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-alertdialog--dialog-presentation');
    const driver = await touchDriver(page);
    const trigger = page.getByRole('button', {name: 'Delete item'});
    const dialog = page.getByRole('alertdialog', {name: 'Delete item?'});
    // A coarse pointer in this context, before anything is checked.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(true);
    // Recorded as it starts, as with a mouse: a short entrance can end before
    // a poll after the tap first reads the page.
    await page.evaluate(() => {
      const record = window as unknown as {__entrance: number};
      record.__entrance = 0;
      document.addEventListener(
        'animationstart',
        event => {
          const {target, pseudoElement} = event;
          if (
            target instanceof Element &&
            target.tagName === 'DIALOG' &&
            !pseudoElement
          ) {
            record.__entrance += 1;
          }
        },
        {capture: true},
      );
    });
    await driver.tap(await centerOf(trigger));
    await expect(dialog).toBeVisible();
    await waitForRest(dialog);
    // The theme's CSS entrance ran on the alert, not UIKit's motion.
    expect(
      await page.evaluate(
        () => (window as unknown as {__entrance: number}).__entrance,
      ),
    ).toBeGreaterThan(0);
    expect(await dialog.getAttribute('style')).toContain('--x-width: 400px');
    const element = await dialog.elementHandle();
    await driver.tap(
      await centerOf(dialog.getByRole('button', {name: 'Cancel'})),
    );
    // No exit: the dialog is closed by the next frame.
    await expect.poll(async () => openOnNextFrame(element)).toBe(false);
  });
});

/**
 * Whether the dialog is still open on the next frame. Takes the element
 * before the close: a closed dialog leaves the accessibility tree.
 */
const openOnNextFrame = async (element: ElementHandle | null) =>
  element?.evaluate(
    async el =>
      new Promise<boolean>(resolve =>
        requestAnimationFrame(() => resolve((el as HTMLDialogElement).open)),
      ),
  );

test.describe("under a finger in Chrome's engine", () => {
  test.beforeEach(({browserName}) => {
    test.skip(browserName !== 'chromium', "Chrome's engine");
  });

  test("a finger gets the same presentation: UIKit's alert motion, not the theme's entrance", async ({
    page,
  }) => {
    await recordAnimateCalls(page);
    const {driver, trigger, dialog} = await openPage(page);
    expect(
      await page.evaluate(() => ({
        coarse: matchMedia('(pointer: coarse)').matches,
        ios: CSS.supports('(-webkit-touch-callout: none)'),
      })),
    ).toEqual({coarse: true, ios: false});
    await driver.tap(await centerOf(trigger));
    await expect(dialog).toBeVisible();
    await waitForRest(dialog);
    // The animator's scale and fade on the alert, and the dimming's fade.
    const calls = await animateCalls(page);
    expect(
      calls.some(
        call => call.pseudoElement == null && call.properties.includes('scale'),
      ),
      JSON.stringify(calls),
    ).toBe(true);
    expect(
      calls.some(call => call.pseudoElement === '::backdrop'),
      JSON.stringify(calls),
    ).toBe(true);
    expect(
      await dialog.evaluate(el => getComputedStyle(el).animationName),
    ).toBe('none');
  });
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('keeps the theme entrance and closes at once', async ({page}) => {
    const {trigger, dialog} = await openPage(page);
    // A fine pointer in this context, before anything is checked.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    // Recorded as it starts: a short entrance can end before a poll after the
    // click first reads the page (a busy WebKit takes longer than it runs).
    await page.evaluate(() => {
      const record = window as unknown as {__entrance: number};
      record.__entrance = 0;
      document.addEventListener(
        'animationstart',
        event => {
          const {target, pseudoElement} = event;
          if (
            target instanceof Element &&
            target.tagName === 'DIALOG' &&
            !pseudoElement
          ) {
            record.__entrance += 1;
          }
        },
        {capture: true},
      );
    });
    await trigger.click();
    await waitForRest(dialog);
    // The theme's CSS entrance ran on the alert (an animationstart is a CSS
    // animation's).
    expect(
      await page.evaluate(
        () => (window as unknown as {__entrance: number}).__entrance,
      ),
    ).toBeGreaterThan(0);
    // A closed dialog leaves the accessibility tree: hold on to the element.
    const element = await dialog.elementHandle();
    await dialog.getByRole('button', {name: 'Cancel'}).click();
    // No exit: the dialog is closed by the next frame.
    expect(await openOnNextFrame(element)).toBe(false);
  });
});

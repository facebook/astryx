// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuActionSheet.interaction.browser.spec.ts
 * @input The built "Presentation / action sheet" DropdownMenu story on the
 *   phone profile, real touch input, the interaction harness and the alert
 *   entries of the UIKit constants table
 * @output Proofs for the action sheet's iOS 26 presentation on a phone: an
 *   alert-style card that presents from scale 1.2 and opacity 0 with its
 *   dimming on the alert spring; a finger that lands on one action and lifts
 *   on another runs the one it lifts on, once; a tap outside dismisses it with
 *   a fade alone; storyboards of the present and the dismiss
 * @position Evidence for DropdownMenu's action-sheet card
 *   (MenuActionSheetCard); the alert motion and the group tracking it reuses
 *   have their own proofs beside AlertDialog
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  compareCurve,
  drag,
  freezeTimers,
  installTimerGate,
  openStory,
  releaseAnimations,
  springStep,
  thawTimers,
  timeline,
  touchDriver,
  waitForAnimation,
  withStorybook,
  writeEvidence,
  type Point,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {alertController} from '../../motion/uikit/alert';
import {springs} from '../../motion/uikit/springs';

/** The element's rendered box; a missing one fails the spec. */
async function boxOf(locator: Locator): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('the element has no rendered box');
  }
  return box;
}

/** The page's viewport; every spec here sets one. */
function viewportOf(page: Page): {width: number; height: number} {
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  return viewport;
}

/** The last sample; an empty series fails the spec. */
function lastOf<T>(values: ReadonlyArray<T>): T {
  if (values.length === 0) {
    throw new Error('no samples');
  }
  return values[values.length - 1];
}

const storybook = withStorybook(test);

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
  card: Locator;
}

/** Opens the story with the card closed (the story opens it on load). */
async function openPage(page: Page): Promise<Opened> {
  await openStory(
    page,
    storybook(),
    'core-dropdownmenu--action-sheet-presentation',
  );
  await page.evaluate(() => {
    const picked: string[] = [];
    (window as unknown as {__picked: string[]}).__picked = picked;
    // The story reports a pick by logging "<label> clicked"; the spec
    // reads those lines through this page-side capture.
    // eslint-disable-next-line no-console -- see above
    const original = console.log.bind(console);
    // eslint-disable-next-line no-console -- see above
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].endsWith(' selected')) {
        picked.push(args[0].replace(' selected', ''));
      }
      original(...args);
    };
  });
  const card = page.getByRole('dialog', {name: 'Project actions'});
  await expect(card).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  return {
    driver: await touchDriver(page),
    trigger: page.getByRole('button', {name: /Project actions/}),
    card,
  };
}

const picked = async (page: Page) =>
  page.evaluate(() =>
    (window as unknown as {__picked: string[]}).__picked.slice(),
  );

interface CardSample {
  t: number;
  scale: number;
  opacity: number;
  dim: number;
}

/** Holds the open card's latest transition and samples it at each time. */
async function sampleCard(
  page: Page,
  times: ReadonlyArray<number>,
): Promise<{held: number; samples: CardSample[]}> {
  return page.evaluate(ts => {
    const dialog = document.querySelector('dialog[open]');
    if (dialog == null) {
      throw new Error('no open dialog');
    }
    const onDialog = document
      .getAnimations()
      .filter(a => (a.effect as KeyframeEffect | null)?.target === dialog);
    const latest = Math.max(...onDialog.map(a => Number(a.startTime)));
    const held = onDialog.filter(a => Number(a.startTime) === latest);
    for (const animation of held) {
      animation.pause();
    }
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

const channel = (samples: CardSample[], key: 'scale' | 'opacity' | 'dim') =>
  samples.map(s => ({t: s.t, value: s[key]}));

test('presents as a card from scale 1.2 and opacity 0 with the dimming, on the alert spring', async ({
  page,
}, testInfo) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await waitForAnimation(card);
  const {held, samples} = await sampleCard(page, timeline(PRESENT_MS));
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
  const dim = compareCurve(channel(samples, 'dim'), present, OPACITY_TOLERANCE);
  await releaseAnimations(page);
  await writeEvidence(
    'curves/dropdownmenu-action-sheet-present',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: springs.alertPresent, scaleFrom, scale, opacity, dim},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const result of [scale, opacity, dim]) {
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      result.tolerance,
    );
  }
  // Centered on the screen, not docked at the bottom.
  const box = await boxOf(card);
  const viewport = viewportOf(page);
  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(1);
  expect(box.y + box.height).toBeLessThan(viewport.height - 8);
});

test('a finger that lands on one action and lifts on another runs the one it lifts on, once', async ({
  page,
}) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await expect(card).toBeVisible();
  // Input comes back once the presentation completes.
  await page.waitForTimeout(alertController.present.ignoresTouchesForMs + 100);
  const actions = card.locator('[data-astryx-action-sheet-action]');
  const first = await centerOf(actions.nth(0));
  const third = await centerOf(actions.nth(2));
  const thirdLabel = (await actions.nth(2).textContent())?.trim();
  await driver.play(
    drag(first, third, {holdMs: 120, durationMs: 300, hz: 60, restMs: 80}),
  );
  await expect(card).toBeHidden();
  expect(await picked(page)).toEqual([thirdLabel]);
});

test('a tap outside dismisses it with a fade alone, on the alert spring', async ({
  page,
}, testInfo) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await expect(card).toBeVisible();
  await page.waitForTimeout(alertController.present.ignoresTouchesForMs + 100);
  const viewport = viewportOf(page);
  await driver.tap({x: 12, y: viewport.height - 12});
  await waitForAnimation(card);
  const {samples} = await sampleCard(page, timeline(DISMISS_MS));
  const opacity = compareCurve(
    channel(samples, 'opacity'),
    t => 1 - dismiss(t),
    OPACITY_TOLERANCE,
  );
  await releaseAnimations(page);
  await writeEvidence(
    'curves/dropdownmenu-action-sheet-dismiss',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: springs.alertDismiss, opacity},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
    OPACITY_TOLERANCE,
  );
  for (const sample of samples) {
    expect(sample.scale).toBeCloseTo(1, 3);
  }
  await expect(card).toBeHidden();
  expect(await picked(page)).toEqual([]);
});

test(
  'storyboard: the card presents and a tap outside dismisses it',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, trigger, card} = await openPage(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    const measure = async () =>
      page.evaluate(() => {
        const dialog = document.querySelector('dialog[open]');
        if (dialog == null) {
          return {scale: 0, opacity: 0};
        }
        const style = getComputedStyle(dialog);
        return {
          scale: style.scale === 'none' ? 1 : Number(style.scale.split(' ')[0]),
          opacity: Number(style.opacity),
        };
      });
    await driver.tap(await centerOf(trigger));
    await waitForAnimation(card);
    await freezeTimers(page);
    const {storyboard: presentBoard} = await animationStoryboard(page, {
      name: 'dropdownmenu-action-sheet-present',
      clip,
      scope: card,
      measure,
      times: timeline(PRESENT_MS, 1000 / 30),
      columns: 7,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await page.waitForTimeout(
      alertController.present.ignoresTouchesForMs + 100,
    );
    await driver.tap({x: 12, y: viewport.height - 12});
    await waitForAnimation(card);
    await freezeTimers(page);
    const {storyboard: dismissBoard} = await animationStoryboard(page, {
      name: 'dropdownmenu-action-sheet-dismiss',
      clip,
      scope: card,
      measure,
      times: timeline(DISMISS_MS, 1000 / 30),
      columns: 7,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await presentBoard.write(testInfo);
    await dismissBoard.write(testInfo);
    const scales = presentBoard.frames.map(f => f.data.scale as number);
    expect(scales[0]).toBeCloseTo(scaleFrom, 2);
    expect(scales.at(-1)).toBeCloseTo(1, 2);
    const fades = dismissBoard.frames.map(f => f.data.opacity as number);
    expect(lastOf(fades)).toBeLessThan(fades[0]);
  },
);

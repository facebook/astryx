// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ToggleButtonGroupTracking.interaction.browser.spec.ts
 * @input The ToggleButton GroupMultiple story, driven by real touches (the
 *   interaction harness's touch driver), a real mouse and the keyboard
 * @output Real-browser evidence that a toggle group tracks a held pointer
 *   across its toggles and toggles only the one lifted on
 *   (`family:action-groups` FR1–FR5): a slide toggles only the lifted toggle,
 *   a lift outside toggles nothing, a finger's target reaches 44 px through
 *   the group's hit layer, only the highlighted toggle looks pressed under a
 *   mouse, and the keyboard is unchanged
 * @position Beside ToggleButtonGroupTracking.test.tsx (the unit evidence)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  openStory,
  tap,
  touchDriver,
  withStorybook,
  type Point,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const STORY = 'core-togglebutton--group-multiple';

const centerOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
};

const slide = (from: Point, to: Point) =>
  drag(from, to, {durationMs: 240, hz: 60, holdMs: 60, restMs: 120});

/**
 * A toggle's look once its transitions have run out. A toggle the press has
 * just left is still easing back from the press scale; read part-way, it is
 * neither pressed nor at rest, and how far it got depends on how fast the
 * machine runs the page. Its settled look is the one the group decided.
 */
async function settledLook(toggle: Locator) {
  await expect
    .poll(async () =>
      toggle.evaluate(
        el =>
          el
            .getAnimations()
            .filter(animation => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
  return toggle.evaluate(el => {
    const style = getComputedStyle(el);
    return {image: style.backgroundImage, transform: style.transform};
  });
}

async function open(page: Page) {
  await openStory(page, storybook(), STORY);
  const group = page.getByRole('group', {name: 'Text formatting'});
  await expect(group).toBeVisible();
  const toggle = (name: string) => group.getByRole('button', {name});
  return {
    group,
    bold: toggle('Bold'),
    italic: toggle('Italic'),
    underline: toggle('Underline'),
  };
}

/** Which toggles are pressed, in order. */
const pressed = async (group: Locator) =>
  group
    .getByRole('button')
    .evaluateAll(toggles =>
      toggles.map(toggle => toggle.getAttribute('aria-pressed') === 'true'),
    );

test('a finger slid from Bold across Italic to Underline toggles only Underline (family:action-groups FR4)', async ({
  page,
}) => {
  const {group, bold, underline} = await open(page);
  const driver = await touchDriver(page);
  await driver.play(slide(await centerOf(bold), await centerOf(underline)));
  await expect.poll(async () => pressed(group)).toEqual([false, false, true]);
});

/** The accessible name of the focused element, or `body`. */
const focusedName = async (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    return element == null || element === document.body
      ? 'body'
      : (element.getAttribute('aria-label') ?? element.textContent ?? '');
  });

test('after a finger slides from Bold to Underline, Underline has focus, as a tap on it leaves it (family:action-groups FR1)', async ({
  page,
}) => {
  const {group, bold, underline} = await open(page);
  const driver = await touchDriver(page);
  await driver.play(slide(await centerOf(bold), await centerOf(underline)));
  await expect.poll(async () => pressed(group)).toEqual([false, false, true]);
  expect(await focusedName(page)).toBe('Underline');
});

test('a finger tap on Italic leaves Italic with focus, as a tap on any button does (family:action-groups FR1)', async ({
  page,
}) => {
  const {group, italic} = await open(page);
  const driver = await touchDriver(page);
  await driver.play(tap(await centerOf(italic), {holdMs: 60}));
  await expect.poll(async () => pressed(group)).toEqual([false, true, false]);
  expect(await focusedName(page)).toBe('Italic');
});

test('a finger lifted outside the group toggles nothing (family:action-groups FR3)', async ({
  page,
}) => {
  const {group, bold} = await open(page);
  const box = await group.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  const driver = await touchDriver(page);
  await driver.play(
    slide(await centerOf(bold), {
      x: box.x + box.width / 2,
      y: box.y + box.height + 120,
    }),
  );
  await page.waitForTimeout(150);
  expect(await pressed(group)).toEqual([false, false, false]);
});

test("under a finger a toggle's target reaches 44 px: the point just below it lands on the group, and a tap there toggles it (family:action-groups FR5)", async ({
  page,
}) => {
  const {group, bold} = await open(page);
  const box = await bold.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  expect(box.height).toBeLessThan(44);
  const below = {
    x: box.x + box.width / 2,
    y: box.y + box.height + (44 - box.height) / 2 - 1,
  };
  await expect
    .poll(async () =>
      page.evaluate(
        ({x, y}) =>
          document
            .elementFromPoint(x, y)
            ?.closest('[role="group"]')
            ?.getAttribute('aria-label') ?? null,
        below,
      ),
    )
    .toBe('Text formatting');
  const driver = await touchDriver(page);
  await driver.play(tap(below));
  await expect.poll(async () => pressed(group)).toEqual([true, false, false]);
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a press on Bold slid to Underline toggles only Underline, and only Underline looks pressed while held (family:action-groups FR2, FR4, FR5)', async ({
    page,
  }) => {
    const {group, bold, underline} = await open(page);
    const from = await centerOf(bold);
    const to = await centerOf(underline);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // Whether this engine focuses a button its press lands on (Safari's do
    // not): after the slide, focus does what a click on Underline would do.
    const pressFocuses = await bold.evaluate(
      el => document.activeElement === el,
    );
    await page.mouse.move(to.x, to.y, {steps: 8});
    const looks = await group.getByRole('button').evaluateAll(toggles =>
      toggles.map(toggle => ({
        press: toggle.getAttribute('data-astryx-press'),
        image: getComputedStyle(toggle).backgroundImage,
      })),
    );
    expect(looks[0]).toEqual({press: null, image: 'none'});
    expect(looks[2].press).toBe('on');
    // Only the lit toggle takes the press scale: Bold, where the press began
    // and which keeps `:active` while the button is held, stays at rest.
    const scaleOf = async (toggle: Locator) =>
      toggle.evaluate(el => getComputedStyle(el).transform);
    await expect
      .poll(async () => scaleOf(underline))
      .toBe('matrix(0.98, 0, 0, 0.98, 0, 0)');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(
      (await settledLook(bold)).transform,
    );
    await page.mouse.up();
    await expect.poll(async () => pressed(group)).toEqual([false, false, true]);
    // After the slide, focus does what a click on Underline does
    // (family:action-groups FR1), so a following Space toggles Underline.
    const focused = await page.evaluate(
      () => document.activeElement?.getAttribute('aria-label') ?? '',
    );
    if (pressFocuses) {
      expect(focused).toBe('Underline');
    } else {
      expect(focused).not.toBe('Bold');
    }
  });

  test('a press that starts on a keyboard-focused toggle lights only the toggle under the mouse (family:action-groups FR2)', async ({
    page,
  }) => {
    const {bold, underline} = await open(page);
    await bold.focus();
    expect(await bold.evaluate(el => el.matches(':focus-visible'))).toBe(true);
    const from = await centerOf(bold);
    const to = await centerOf(underline);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, {steps: 8});
    await expect
      .poll(async () => underline.getAttribute('data-astryx-press'))
      .toBe('on');
    // Bold keeps its focus ring, but neither the press scale nor the
    // pressed overlay beside Underline's.
    const look = await settledLook(bold);
    expect(look.image).toBe('none');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(look.transform);
    await page.mouse.up();
  });

  test('holding Space on a focused toggle scales it, as on any button (family:action-groups FR5: the keyboard is unchanged)', async ({
    page,
  }) => {
    const {bold} = await open(page);
    await bold.focus();
    expect(await bold.evaluate(el => el.matches(':focus-visible'))).toBe(true);
    await page.keyboard.down('Space');
    await expect
      .poll(async () => bold.evaluate(el => getComputedStyle(el).transform))
      .toBe('matrix(0.98, 0, 0, 0.98, 0, 0)');
    await page.keyboard.up('Space');
  });

  test('the keyboard is unchanged: Space on a focused toggle toggles it once', async ({
    page,
  }) => {
    const {group, bold} = await open(page);
    await bold.focus();
    await page.keyboard.press('Space');
    await expect.poll(async () => pressed(group)).toEqual([true, false, false]);
    await page.keyboard.press('Space');
    await expect
      .poll(async () => pressed(group))
      .toEqual([false, false, false]);
  });
});

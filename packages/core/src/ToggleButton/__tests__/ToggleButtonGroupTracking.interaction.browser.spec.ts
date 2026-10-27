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
    await page.mouse.move(to.x, to.y, {steps: 8});
    const looks = await group.getByRole('button').evaluateAll(toggles =>
      toggles.map(toggle => ({
        press: toggle.getAttribute('data-astryx-press'),
        image: getComputedStyle(toggle).backgroundImage,
      })),
    );
    expect(looks[0]).toEqual({press: null, image: 'none'});
    expect(looks[2].press).toBe('on');
    await page.mouse.up();
    await expect.poll(async () => pressed(group)).toEqual([false, false, true]);
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

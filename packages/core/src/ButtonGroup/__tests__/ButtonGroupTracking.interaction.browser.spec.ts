// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonGroupTracking.interaction.browser.spec.ts
 * @input The ButtonGroup SlideAcross story, driven by real touches (the
 *   interaction harness's touch driver), a real mouse and the keyboard
 * @output Real-browser evidence that a button group tracks a held pointer
 *   across its buttons (`family:action-groups` FR1–FR5): a slide runs the
 *   button lifted on, a lift outside runs nothing, a finger's target reaches
 *   44 px through the group's hit layer (and a mouse's does not), only the
 *   highlighted button looks pressed under a mouse, and the keyboard is
 *   unchanged
 * @position Beside ButtonGroupTracking.test.tsx (the unit evidence)
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

const STORY = 'core-buttongroup--slide-across';

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
  const group = page.getByRole('group', {name: 'Edit actions'});
  await expect(group).toBeVisible();
  const button = (name: string) => group.getByRole('button', {name});
  return {
    group,
    cut: button('Cut'),
    copy: button('Copy'),
    paste: button('Paste'),
    log: page.getByTestId('slide-log'),
  };
}

/**
 * A point just below Cut: outside its box, inside the 44 px a finger's
 * target reaches (half the shortfall below a small button, less 1 px).
 */
async function justBelow(button: Locator): Promise<Point> {
  const box = await button.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  expect(box.height).toBeLessThan(44);
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height + (44 - box.height) / 2 - 1,
  };
}

/** The accessible name of the group the topmost element at `point` is in. */
const groupAt = async (page: Page, point: Point) =>
  page.evaluate(({x, y}) => {
    const element = document.elementFromPoint(x, y);
    return (
      element?.closest('[role="group"]')?.getAttribute('aria-label') ?? null
    );
  }, point);

test('a finger that presses Cut and slides to Paste runs Paste, once (family:action-groups FR1)', async ({
  page,
}) => {
  const {cut, paste, log} = await open(page);
  const driver = await touchDriver(page);
  await driver.play(slide(await centerOf(cut), await centerOf(paste)));
  await expect(log).toHaveText('Pressed: Paste');
});

test('a finger lifted outside the group runs nothing (family:action-groups FR3)', async ({
  page,
}) => {
  const {group, cut, log} = await open(page);
  const box = await group.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  const driver = await touchDriver(page);
  await driver.play(
    slide(await centerOf(cut), {
      x: box.x + box.width / 2,
      y: box.y + box.height + 120,
    }),
  );
  await page.waitForTimeout(150);
  await expect(log).toHaveText('Nothing pressed');
});

test("under a finger a small button's target reaches 44 px: the point just below it lands on the group, and a tap there runs it (family:action-groups FR5)", async ({
  page,
}) => {
  const {cut, log} = await open(page);
  const below = await justBelow(cut);
  // The hit layer's insets are measured in the frame after the group shows.
  await expect.poll(async () => groupAt(page, below)).toBe('Edit actions');
  const driver = await touchDriver(page);
  await driver.play(tap(below));
  await expect(log).toHaveText('Pressed: Cut');
});

test('a menu trigger in the group keeps its own opening: a tap on it opens its menu (spec:AST-094 FR29)', async ({
  page,
}) => {
  await openStory(page, storybook(), 'core-buttongroup--with-dropdown-menu');
  const trigger = page.getByRole('button', {name: 'Allow options'});
  await expect(trigger).toBeVisible();
  // The engine's own tap path: WebKit synthesises the click only from it,
  // and the trigger opens on that click.
  const driver = await touchDriver(page);
  await driver.tap(await centerOf(trigger));
  await expect(
    page.getByRole('menuitem', {name: 'Always allow'}),
  ).toBeVisible();
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test("a mouse's target does not grow: the point just below a small button is not the group", async ({
    page,
  }) => {
    const {cut} = await open(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const below = await justBelow(cut);
    await page.waitForTimeout(100);
    expect(await groupAt(page, below)).toBeNull();
  });

  test('a press on Cut slid to Paste runs Paste once, and only Paste looks pressed while the button is held (family:action-groups FR2, FR5)', async ({
    page,
  }) => {
    const {group, cut, paste, log} = await open(page);
    const from = await centerOf(cut);
    const to = await centerOf(paste);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, {steps: 8});
    const looks = await group.getByRole('button').evaluateAll(buttons =>
      buttons.map(button => ({
        press: button.getAttribute('data-astryx-press'),
        image: getComputedStyle(button).backgroundImage,
      })),
    );
    // Cut, where the press began, still matches `:active`, but shows no
    // pressed image; Paste, under the mouse, carries the tracker's paint.
    expect(looks[0]).toEqual({press: null, image: 'none'});
    expect(looks[2].press).toBe('on');
    expect(looks[2].image).not.toBe('none');
    await page.mouse.up();
    await expect(log).toHaveText('Pressed: Paste');
  });

  test('a menu trigger in the group keeps its own opening: a click on it opens its menu', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-buttongroup--with-dropdown-menu');
    await page.getByRole('button', {name: 'Allow options'}).click();
    await expect(
      page.getByRole('menuitem', {name: 'Always allow'}),
    ).toBeVisible();
  });

  test('the keyboard is unchanged: Space and Enter on a focused button run it once each', async ({
    page,
  }) => {
    const {cut, log} = await open(page);
    await cut.focus();
    await page.keyboard.press('Space');
    await expect(log).toHaveText('Pressed: Cut');
    await page.keyboard.press('Enter');
    await expect(log).toHaveText('Pressed: Cut, Cut');
  });
});

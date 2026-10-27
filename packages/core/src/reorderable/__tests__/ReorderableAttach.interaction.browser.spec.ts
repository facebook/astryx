// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ReorderableAttach.interaction.browser.spec.ts
 * @input The Core/createReorderable stories' built Storybook, real mouse,
 *   pen and touch input (the interaction harness's drivers)
 * @output Browser proofs of createReorderable's attach on plain elements in a
 *   positions() layout (spec:AST-103 FR1, FR3, FR4b): a mouse and a pen drag
 *   a grip at once, a finger holds it first, each drop reports once, and the
 *   dropped card settles on its slot's centre on both axes
 * @position Interaction proofs for reorderable/createReorderable.ts's attach
 */

import {expect, test, type Page} from '@playwright/test';
import {
  drag,
  openStory,
  touchDriver,
  webInputDriver,
  withStorybook,
  type Point,
} from '@astryxdesign/interaction-harness';
import {reorder} from '../../motion/uikit/reorder';

const storybook = withStorybook(test);

const STORY = 'core-createreorderable--attached-cards-in-a-row';
/** The cards' slot centres, as the story's positions() gives them. */
const SLOTS = [0, 1, 2, 3, 4].map(index => ({x: 44 + index * 88, y: 56}));
const HOLD_MS = reorder.claim.delayMs + 80;

const table = (page: Page) => page.locator('#storybook-root [data-moves]');

const order = async (page: Page) =>
  table(page)
    .locator('[data-card]')
    .evaluateAll(cards =>
      cards.map(card => (card as HTMLElement).dataset.card ?? ''),
    );

/** How many moves the story's onReorder has reported. */
const moves = async (page: Page) =>
  Number(await table(page).getAttribute('data-moves'));

/** The centre of `card`'s grip in the viewport. */
async function gripOf(page: Page, card: string): Promise<Point> {
  const box = await table(page)
    .locator(`[data-card="${card}"] [data-grip]`)
    .boundingBox();
  if (box == null) {
    throw new Error(`no grip for ${card}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** `card`'s centre in the table's padding box, as shown now. */
async function centreOf(page: Page, card: string) {
  return table(page).evaluate((element, name) => {
    const box = element.getBoundingClientRect();
    const item = element
      .querySelector(`[data-card="${name}"]`)
      ?.getBoundingClientRect();
    return item == null
      ? null
      : {
          x: item.left + item.width / 2 - box.left - element.clientLeft,
          y: item.top + item.height / 2 - box.top - element.clientTop,
        };
  }, card);
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

test.describe('with a mouse or a pen', () => {
  test.use({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 900, height: 700},
  });

  test('a mouse drags a grip at once: one report, and the card lands on the slot nearest its centre', async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const before = await moves(page);
    const from = await gripOf(page, 'A');
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    // Past the third slot's centre, slightly low.
    await page.mouse.move(from.x + 2 * 88 + 10, from.y + 6, {steps: 12});
    await page.mouse.up();
    await expect
      .poll(async () => order(page))
      .toEqual(['K', 'Q', 'A', 'J', '10']);
    expect(await moves(page)).toBe(before + 1);
    await waitForRest(page);
    const centre = await centreOf(page, 'A');
    expect(Math.abs((centre?.x ?? Number.NaN) - SLOTS[2].x)).toBeLessThan(0.5);
    expect(Math.abs((centre?.y ?? Number.NaN) - SLOTS[2].y)).toBeLessThan(0.5);
  });

  test('a pen drags a grip at once, with no hold (spec:AST-103 FR3)', async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    const input = await webInputDriver(page);
    test.skip(!input.pens, 'this engine has no pen input');
    const from = await gripOf(page, 'A');
    await input.pen(
      Array.from({length: 13}, (_, index) => ({
        x: from.x + ((88 + 10) * index) / 12,
        y: from.y,
        t: index * 16,
      })),
    );
    await expect
      .poll(async () => order(page))
      .toEqual(['K', 'A', 'Q', 'J', '10']);
  });

  test("a grip is reorder mode's toggle, named for its card, in the Tab order", async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    const grip = page.getByRole('button', {name: 'Reorder Card A'});
    await expect(grip).toHaveAttribute('aria-pressed', 'false');
    await expect(grip).toHaveAttribute('tabindex', '0');
    await grip.focus();
    await page.keyboard.press('Enter');
    await expect(grip).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(grip).toHaveAttribute('aria-pressed', 'false');
  });
});

test('a finger holds a grip, then drags: one report, and the card glides into its slot on both axes', async ({
  page,
}) => {
  await openStory(page, storybook(), STORY);
  test.skip(
    !(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)),
    'the hold runs on a touch screen',
  );
  const before = await moves(page);
  const from = await gripOf(page, 'A');
  const driver = await touchDriver(page);
  const samples: {x: number; y: number}[] = [];
  await driver.play(
    drag(
      from,
      // Past the second slot's centre and above it: the glide moves on both
      // axes.
      {x: from.x + 88 + 12, y: from.y - 18},
      {holdMs: HOLD_MS, durationMs: 300, restMs: 50},
    ),
  );
  // The card glides from where it was dropped to its slot.
  for (let frame = 0; frame < 12; frame += 1) {
    const shift = await table(page).evaluate(element => {
      const card = element.querySelector<HTMLElement>('[data-card="A"]');
      const [x = '0', y = '0'] = (
        card == null ? '' : getComputedStyle(card).translate
      ).split(' ');
      return {x: parseFloat(x) || 0, y: parseFloat(y) || 0};
    });
    samples.push(shift);
    await page.evaluate(
      async () =>
        new Promise<void>(resolve => requestAnimationFrame(() => resolve())),
    );
  }
  await expect
    .poll(async () => order(page))
    .toEqual(['K', 'A', 'Q', 'J', '10']);
  expect(await moves(page)).toBe(before + 1);
  expect(
    samples.some(({x, y}) => Math.abs(x) > 1 && Math.abs(y) > 1),
    JSON.stringify(samples),
  ).toBe(true);
  await waitForRest(page);
  const centre = await centreOf(page, 'A');
  expect(Math.abs((centre?.x ?? Number.NaN) - SLOTS[1].x)).toBeLessThan(0.5);
  expect(Math.abs((centre?.y ?? Number.NaN) - SLOTS[1].y)).toBeLessThan(0.5);
});

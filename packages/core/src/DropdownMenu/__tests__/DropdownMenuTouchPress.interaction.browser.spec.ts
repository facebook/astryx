// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuTouchPress.interaction.browser.spec.ts
 * @input The built Default DropdownMenu story, real touch input (Chromium
 *   CDP / WebKit's input command), the interaction harness, and UIMenu's
 *   values from the UIKit constants table
 * @output Interaction proofs for a finger on DropdownMenu's trigger: a held
 *   finger opens the menu at UIKit's hold-open delay and its lift picks
 *   nothing; a tap opens at the lift; a held press slides onto a row and
 *   picks it, once; a storyboard of the press, hold, slide and lift
 * @position Evidence for the finger's press model in DropdownMenu (and
 *   MoreMenu, which renders it); the machine itself is unit-tested in
 *   menuPressGesture.test.ts and useMenuPress.test.tsx
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  frames,
  installLongTaskLog,
  openStory,
  Storyboard,
  tap,
  touchDriver,
  waitForRest,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {menu} from '../../motion/uikit/menu';

const storybook = withStorybook(test);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OpenStory {
  driver: TouchDriver;
  trigger: Locator;
  popover: Locator;
  center: {x: number; y: number};
  triggerBox: Box;
}

/** Page-side log of the gesture and the menu: performance.now() times. */
async function installMenuLog(page: Page) {
  await page.evaluate(() => {
    const log = {
      down: [] as number[],
      up: [] as number[],
      cancel: [] as number[],
      opened: [] as number[],
      closed: [] as number[],
      picked: [] as string[],
    };
    (window as unknown as {__menuLog: typeof log}).__menuLog = log;
    document.addEventListener(
      'pointerdown',
      () => log.down.push(performance.now()),
      true,
    );
    document.addEventListener(
      'pointerup',
      () => log.up.push(performance.now()),
      true,
    );
    document.addEventListener(
      'pointercancel',
      () => log.cancel.push(performance.now()),
      true,
    );
    document.addEventListener(
      'toggle',
      event => {
        const state = event.newState;
        (state === 'open' ? log.opened : log.closed).push(performance.now());
      },
      true,
    );
    const original = console.log.bind(console);
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].endsWith(' clicked')) {
        log.picked.push(args[0].replace(' clicked', ''));
      }
      original(...args);
    };
  });
}

const readMenuLog = async (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __menuLog: {
            down: number[];
            up: number[];
            cancel: number[];
            opened: number[];
            closed: number[];
            picked: string[];
          };
        }
      ).__menuLog,
  );

async function openDefault(page: Page): Promise<OpenStory> {
  await installLongTaskLog(page);
  await openStory(page, storybook(), 'core-dropdownmenu--default');
  await installMenuLog(page);
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Actions'});
  const triggerBox = await trigger.boundingBox();
  if (triggerBox == null) {
    throw new Error('no trigger');
  }
  return {
    driver,
    trigger,
    popover: page.locator('[popover]:has([role="menu"])').first(),
    center: {
      x: triggerBox.x + triggerBox.width / 2,
      y: triggerBox.y + triggerBox.height / 2,
    },
    triggerBox,
  };
}

/**
 * The element's presented box at each time of its held animations: its
 * layout box scaled by the presented `scale` about its `transform-origin`.
 * Read from the computed style, which follows a seek; a composited animation
 * of an individual transform property does not reach getBoundingClientRect
 * in Chromium.
 */

const centerOf = (box: Box) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

async function openWithTap(story: OpenStory) {
  await story.driver.tap(story.center);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
}

test('a held finger opens the menu at UIKit\u2019s hold-open delay and its lift picks nothing', async ({
  page,
}) => {
  const story = await openDefault(page);
  await story.driver.play(tap(story.center, {holdMs: 400}));
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
  const log = await readMenuLog(page);
  const delay = log.opened[0] - log.down[0];
  // The timer fires at 150 ms; the toggle event follows in a task.
  expect(delay).toBeGreaterThanOrEqual(menu.holdOpenMs - 2);
  expect(delay).toBeLessThan(menu.holdOpenMs + 60);
  // Open with the finger still down, and the lift acts on nothing.
  expect(log.opened[0]).toBeLessThan(log.up[0]);
  await frames(page, 2);
  expect(log.picked).toEqual([]);
  expect((await readMenuLog(page)).picked).toEqual([]);
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'true');
});

test('a tap opens the menu at the lift', async ({page}) => {
  const story = await openDefault(page);
  await openWithTap(story);
  // The toggle event is queued as a task after the open.
  await expect
    .poll(async () => (await readMenuLog(page)).opened.length)
    .toBe(1);
  const log = await readMenuLog(page);
  expect(log.opened[0]).toBeGreaterThanOrEqual(log.up[0]);
  // Focus moves into the menu, as for any pointer open.
  await expect(page.getByRole('menu')).toBeVisible();
});

test('press, hold, slide onto a row and lift picks that row once', async ({
  page,
}) => {
  const story = await openDefault(page);
  await openWithTap(story);
  await waitForRest(story.popover);
  const row = await page
    .getByRole('menuitem', {name: 'Duplicate'})
    .boundingBox();
  if (row == null) {
    throw new Error('no row');
  }
  await page.keyboard.press('Escape');
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  await waitForRest(story.popover);
  await story.driver.play(
    drag(story.center, centerOf(row), {
      holdMs: 250,
      durationMs: 250,
      hz: 60,
      restMs: 60,
    }),
  );
  await expect(story.trigger).toHaveAttribute('aria-expanded', 'false');
  expect((await readMenuLog(page)).picked).toEqual(['Duplicate']);
});

test(
  'storyboard: press, hold, slide onto a row and lift',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const story = await openDefault(page);
    await openWithTap(story);
    await waitForRest(story.popover);
    const row = (await page
      .getByRole('menuitem', {name: 'Duplicate'})
      .boundingBox())!;
    await page.keyboard.press('Escape');
    await waitForRest(story.popover);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const board = new Storyboard(page, {
      name: 'dropdownmenu-touch-hold-slide-pick',
      clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
      columns: 6,
      cellScale: 0.35,
    });
    const measure = async () => ({
      expanded: await story.trigger.getAttribute('aria-expanded'),
      highlighted: await page.evaluate(() =>
        document.activeElement?.getAttribute('role') === 'menuitem'
          ? (document.activeElement.textContent ?? '')
          : '',
      ),
    });
    await board.capture('before', 0, await measure());
    // Paced on the wall clock: the hold-open delay is a real timer. Photos
    // are taken once the menu is open; from there the pick depends on
    // distance, not time, so the photos' delay changes nothing.
    await story.driver.play(
      drag(story.center, centerOf(row), {
        holdMs: 250,
        durationMs: 200,
        hz: 30,
        restMs: 60,
      }),
      {
        onEvent: async step => {
          if (step.type === 'touchStart') {
            return;
          }
          const where = step.changed
            .map(f => `${Math.round(f.x)},${Math.round(f.y)}`)
            .join(' ');
          await board.capture(
            `${step.type} t=${+step.t.toFixed(1)} @${where}`,
            step.t,
            await measure(),
          );
        },
      },
    );
    await board.write(testInfo);
    const highlighted = board.frames.map(f => f.data.highlighted as string);
    // The highlight followed the finger onto the row, which the lift picked.
    expect(highlighted).toContain('Duplicate');
    expect((await readMenuLog(page)).picked).toEqual(['Duplicate']);
  },
);

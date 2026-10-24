// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.interaction.browser.spec.ts
 * @input The built "Delete" AlertDialog story on the phone profile, real
 *   touch input (Chromium CDP / WebKit's input command) and the interaction
 *   harness
 * @output Interaction proofs for a finger on the alert's actions, which UIKit
 *   tracks as one group (iOS 26.2): the touched action is highlighted in the
 *   frame of the touch; the highlight follows the finger from one action to
 *   the other; lifting runs the action under the finger, once, and nothing
 *   off both; a touch that lands on the message can slide onto an action; a
 *   tap and a mouse click still run their action once; a storyboard of the
 *   slide from Delete to Cancel.
 * @position Touch lane of AlertDialog, beside the accessibility bindings in
 *   this folder. Run with `pnpm test:interaction AlertDialog`.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  openStory,
  tap,
  touchDriver,
  touchStoryboard,
  waitForRest,
  withStorybook,
  type Point,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

interface OpenAlert {
  driver: TouchDriver;
  dialog: Locator;
  cancel: Locator;
  del: Locator;
  centers: {cancel: Point; del: Point; message: Point};
  /** Bottom edge of the alert surface, CSS px. */
  bottom: number;
}

const centerOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
};

/**
 * Opens the story's alert with a tap on its trigger, waits for the entrance
 * to rest, and starts a page-side log: every click an action receives, and
 * every write of the press attribute with the animation frame it landed in.
 */
async function openAlert(page: Page): Promise<OpenAlert> {
  await openStory(page, storybook(), 'core-alertdialog--delete');
  const driver = await touchDriver(page);
  await driver.tap(
    await centerOf(page.getByRole('button', {name: 'Delete item'})),
  );
  const dialog = page.getByRole('alertdialog', {name: 'Delete item?'});
  await expect(dialog).toBeVisible();
  await waitForRest(dialog);
  const cancel = dialog.getByRole('button', {name: 'Cancel'});
  const del = dialog.getByRole('button', {name: 'Delete'});
  const message = dialog.getByText('This action cannot be undone', {
    exact: false,
  });
  await page.evaluate(() => {
    const log = {
      clicks: [] as string[],
      paints: [] as string[],
      touchFrames: [] as number[],
      frame: 0,
    };
    (window as unknown as {__alertLog: typeof log}).__alertLog = log;
    const tick = () => {
      log.frame += 1;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.addEventListener(
      'click',
      event => {
        const button = (event.target as Element).closest('button');
        if (button != null) {
          log.clicks.push(button.textContent ?? '');
        }
      },
      true,
    );
    document.addEventListener(
      'touchstart',
      () => log.touchFrames.push(log.frame),
      true,
    );
    new MutationObserver(records => {
      for (const record of records) {
        const target = record.target as Element;
        log.paints.push(
          `${target.textContent}=${target.getAttribute('data-astryx-press') ?? '-'}@${log.frame}`,
        );
      }
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-astryx-press'],
    });
  });
  const box = await dialog.boundingBox();
  if (box == null) {
    throw new Error('no dialog box');
  }
  return {
    driver,
    dialog,
    cancel,
    del,
    centers: {
      cancel: await centerOf(cancel),
      del: await centerOf(del),
      message: await centerOf(message),
    },
    bottom: box.y + box.height,
  };
}

const readLog = async (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __alertLog: {
            clicks: string[];
            paints: string[];
            touchFrames: number[];
          };
        }
      ).__alertLog,
  );

const paintOf = async (locator: Locator) =>
  locator.evaluate(el => el.getAttribute('data-astryx-press'));

/** A slow slide that rests before the lift, as a finger reconsidering. */
const slide = (from: Point, to: Point) =>
  drag(from, to, {durationMs: 240, hz: 60, holdMs: 60, restMs: 120});

test('a finger that lands on Delete and lifts on Cancel cancels', async ({
  page,
}) => {
  const {driver, dialog, centers} = await openAlert(page);
  await driver.play(slide(centers.del, centers.cancel));
  await expect(dialog).toBeHidden();
  expect((await readLog(page)).clicks).toEqual(['Cancel']);
});

test('the touched action is highlighted in the frame of the touch, and the highlight follows the finger', async ({
  page,
}) => {
  const {driver, cancel, del, centers} = await openAlert(page);
  await driver.play(slide(centers.del, centers.cancel), {
    onEvent: async (step, index) => {
      if (index !== 0) {
        return;
      }
      // Read synchronously after the touch-down was dispatched.
      expect(step.type).toBe('touchStart');
      expect(await paintOf(del)).toBe('on');
      expect(await paintOf(cancel)).toBeNull();
    },
  });
  const {paints, clicks, touchFrames} = await readLog(page);
  // The first write is Delete's, in the animation frame of the touchstart.
  expect(touchFrames).toHaveLength(1);
  expect(paints[0]).toBe(`Delete=on@${touchFrames[0]}`);
  // Delete is cut (no fade) when the finger leaves it; Cancel lights when it
  // enters; the lift fades Cancel.
  const sequence = paints.map(entry => entry.split('@')[0]);
  expect(sequence).toEqual([
    'Delete=on',
    'Delete=-',
    'Cancel=on',
    'Cancel=fading',
  ]);
  expect(clicks).toEqual(['Cancel']);
});

test('a lift off both actions runs nothing and leaves the alert open', async ({
  page,
}) => {
  const {driver, dialog, del, centers, bottom} = await openAlert(page);
  await driver.play(slide(centers.del, {x: centers.del.x, y: bottom + 60}));
  expect(await paintOf(del)).toBeNull();
  await expect(dialog).toBeVisible();
  expect((await readLog(page)).clicks).toEqual([]);
});

test('a touch that lands on the message can slide onto Cancel and run it', async ({
  page,
}) => {
  const {driver, dialog, centers} = await openAlert(page);
  await driver.play(slide(centers.message, centers.cancel));
  await expect(dialog).toBeHidden();
  expect((await readLog(page)).clicks).toEqual(['Cancel']);
});

test('a tap runs its action exactly once', async ({page}) => {
  const {driver, dialog, centers} = await openAlert(page);
  await driver.play(tap(centers.cancel, {holdMs: 80}));
  await expect(dialog).toBeHidden();
  // Let any click the browser might still synthesize arrive.
  await page.waitForTimeout(400);
  expect((await readLog(page)).clicks).toEqual(['Cancel']);
});

test('a mouse click is the browser click, as before', async ({page}) => {
  const {dialog, centers} = await openAlert(page);
  await page.mouse.click(centers.cancel.x, centers.cancel.y);
  await expect(dialog).toBeHidden();
  expect((await readLog(page)).clicks).toEqual(['Cancel']);
});

test(
  'storyboard: slide from Delete to Cancel and lift',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, dialog, centers} = await openAlert(page);
    // CSS locators rather than roles: they still resolve once the alert has
    // closed, so the paint left on Cancel can be read after the lift.
    const cancel = page.locator('[data-astryx-alert-action]', {
      hasText: 'Cancel',
    });
    const del = page.locator('[data-astryx-alert-action]', {
      hasText: 'Delete',
    });
    const box = await dialog.boundingBox();
    if (box == null) {
      throw new Error('no dialog box');
    }
    const clip = {
      x: Math.max(0, box.x - 8),
      y: Math.max(0, box.y - 8),
      width: box.width + 16,
      height: box.height + 16,
    };
    const board = await touchStoryboard(
      page,
      driver,
      drag(centers.del, centers.cancel, {durationMs: 200, hz: 30, restMs: 100}),
      {
        name: 'alertdialog-slide-delete-to-cancel',
        clip,
        measure: async () => ({
          del: (await paintOf(del)) ?? 'none',
          cancel: (await paintOf(cancel)) ?? 'none',
        }),
        columns: 4,
        cellScale: 0.6,
      },
    );
    await board.write(testInfo);
    // The trace is the assertion; the sheet is the evidence.
    const frames = board.frames.map(
      f => `${String(f.data.del)}/${String(f.data.cancel)}`,
    );
    expect(frames[0]).toBe('none/none'); // before the touch
    expect(frames[1]).toBe('on/none'); // touch-down on Delete
    expect(frames).toContain('none/on'); // over Cancel
    expect(frames.at(-1)).toBe('none/fading'); // the lift runs Cancel
    expect(frames.indexOf('none/on')).toBeGreaterThan(1);
    expect((await readLog(page)).clicks).toEqual(['Cancel']);
  },
);

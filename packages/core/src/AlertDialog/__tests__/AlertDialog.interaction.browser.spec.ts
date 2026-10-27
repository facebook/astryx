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
 *   off both; only the actions are tracked, so a touch that lands on the
 *   message runs nothing; a tap and a mouse click run their action once; a
 *   mouse is tracked too, so its slide from Delete to Cancel runs Cancel; a
 *   press on the actions selects none of their labels while the title and
 *   the message stay selectable; the tracking is the same under a finger in
 *   Chrome's engine;
 *   a storyboard of the slide from Delete to Cancel.
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
async function openAlert(
  page: Page,
  story = 'core-alertdialog--delete',
): Promise<OpenAlert> {
  await openStory(page, storybook(), story);
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

test("under a finger in Chrome's engine the slide from Delete to Cancel runs Cancel too", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', "Chrome's engine");
  // One touch model on every touch device: a finger in Chrome (a coarse
  // pointer, no -webkit-touch-callout) tracks the same way.
  const {driver, dialog, centers} = await openAlert(page);
  expect(
    await page.evaluate(() => ({
      coarse: matchMedia('(pointer: coarse)').matches,
      ios: CSS.supports('(-webkit-touch-callout: none)'),
    })),
  ).toEqual({coarse: true, ios: false});
  await driver.play(slide(centers.del, centers.cancel));
  await expect(dialog).toBeHidden();
  expect((await readLog(page)).clicks).toEqual(['Cancel']);
});

test('the touched action is highlighted in the frame of the touch, and the highlight follows the finger', async ({
  page,
}) => {
  const {driver, dialog, cancel, del, centers} = await openAlert(page);
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
  await expect(dialog).toBeHidden();
  const {paints, clicks, touchFrames} = await readLog(page);
  // The first write is Delete's, in the animation frame of the touchstart.
  expect(touchFrames).toHaveLength(1);
  expect(paints[0]).toBe(`Delete=on@${touchFrames[0]}`);
  // Delete is cut (no fade) when the finger leaves it; Cancel lights when it
  // enters; the lift fades Cancel, and the alert closing (here at once, with
  // no exit) ends that fade with the tracking.
  const sequence = paints.map(entry => entry.split('@')[0]);
  expect(sequence).toEqual([
    'Delete=on',
    'Delete=-',
    'Cancel=on',
    'Cancel=fading',
    'Cancel=-',
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

test('a press on the actions starts no text selection, by style, while the title and the message stay selectable (spec:AST-094 FR41)', async ({
  page,
}) => {
  const {driver, dialog, del, centers, bottom} = await openAlert(page);
  const userSelect = async (locator: Locator) =>
    locator.evaluate(element => {
      const style = getComputedStyle(element);
      return (
        style.getPropertyValue('user-select') ||
        style.getPropertyValue('-webkit-user-select')
      );
    });
  // The actions' row, the group: its labels are never selected by a press
  // that slides across them, whatever the pointer.
  expect(await userSelect(del.locator('..'))).toBe('none');
  // The title and the message are outside the group: selectable.
  expect(await userSelect(dialog.getByRole('heading'))).not.toBe('none');
  const message = dialog.getByText('This action cannot be undone', {
    exact: false,
  });
  expect(await userSelect(message)).not.toBe('none');
  // A held finger on the actions changes nothing there.
  await driver.play(slide(centers.del, {x: centers.del.x, y: bottom + 60}), {
    onEvent: async (step, index) => {
      if (index !== 0) {
        return;
      }
      expect(step.type).toBe('touchStart');
      expect(await userSelect(message)).not.toBe('none');
    },
  });
  await expect(dialog).toBeVisible();
});

test("no pan can take the group's press: the actions allow only pinch-zoom, and the rest of the alert keeps its pan", async ({
  page,
}) => {
  // Chrome on Android cancels a pointer it pans (pointercancel), which ends
  // the long press that tracks the group: where the group owns a press, the
  // browser may pinch-zoom but not pan. Only the actions are the group.
  const {dialog, cancel} = await openAlert(page);
  const touchAction = async (locator: Locator) =>
    locator.evaluate(element => getComputedStyle(element).touchAction);
  // The actions' row, the group's element.
  expect(await touchAction(cancel.locator('..'))).toBe('pinch-zoom');
  expect(await touchAction(dialog)).toBe('auto');
  const message = dialog.getByText('This action cannot be undone', {
    exact: false,
  });
  expect(await touchAction(message.locator('..'))).toBe('auto');
});

test('only the actions are tracked: a touch that lands on the message and slides onto Cancel runs nothing', async ({
  page,
}) => {
  const {driver, dialog, centers} = await openAlert(page);
  await driver.play(slide(centers.message, centers.cancel));
  await page.waitForTimeout(300);
  await expect(dialog).toBeVisible();
  expect((await readLog(page)).clicks).toEqual([]);
});

test('a tap runs its action exactly once', async ({page}) => {
  const {driver, dialog, centers} = await openAlert(page);
  await driver.play(tap(centers.cancel, {holdMs: 80}));
  await expect(dialog).toBeHidden();
  // Let any click the browser might still synthesize arrive.
  await page.waitForTimeout(400);
  expect((await readLog(page)).clicks).toEqual(['Cancel']);
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a press on Delete slid to Cancel runs Cancel once, and a click on Delete runs Delete once (family:action-groups FR5)', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-alertdialog--delete');
    // A fine pointer in this context, before anything is checked.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const open = async () => {
      await page.getByRole('button', {name: 'Delete item'}).click();
      const dialog = page.getByRole('alertdialog', {name: 'Delete item?'});
      await expect(dialog).toBeVisible();
      return dialog;
    };
    const clicks: string[] = [];
    await page.exposeFunction('__alertClick', (label: string) => {
      clicks.push(label);
    });
    await page.evaluate(() => {
      document.addEventListener(
        'click',
        event => {
          const action = (event.target as Element).closest(
            '[data-astryx-press-group-item]',
          );
          if (action != null) {
            (
              window as unknown as {__alertClick: (label: string) => void}
            ).__alertClick(action.textContent ?? '');
          }
        },
        true,
      );
    });
    let dialog = await open();
    const del = await centerOf(dialog.getByRole('button', {name: 'Delete'}));
    const cancel = await centerOf(dialog.getByRole('button', {name: 'Cancel'}));
    await page.mouse.move(del.x, del.y);
    await page.mouse.down();
    await page.mouse.move(cancel.x, cancel.y, {steps: 8});
    await page.mouse.up();
    await expect(dialog).toBeHidden();
    expect(clicks).toEqual(['Cancel']);
    // A plain click: the group's click runs it, and the browser's own click
    // for the same press is swallowed.
    clicks.length = 0;
    dialog = await open();
    await dialog.getByRole('button', {name: 'Delete'}).click();
    await page.waitForTimeout(300);
    expect(clicks).toEqual(['Delete']);
  });

  test('the dialog keeps its base styles: its text stays selectable', async ({
    page,
  }) => {
    // Only the actions' row, the group, takes no text selection: with a
    // mouse the dialog's title and message stay selectable.
    await openStory(page, storybook(), 'core-alertdialog--delete');
    // A fine pointer in this context, before anything is checked.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page.getByRole('button', {name: 'Delete item'}).click();
    const dialog = page.getByRole('alertdialog', {name: 'Delete item?'});
    await expect(dialog).toBeVisible();
    const styles = await dialog.evaluate(element => {
      const title = element.querySelector('h2') as HTMLElement;
      return {
        dialog: getComputedStyle(element).userSelect,
        title: getComputedStyle(title).userSelect,
      };
    });
    expect(styles.dialog).not.toBe('none');
    expect(styles.title).not.toBe('none');
  });
});

test('on a touch screen a mouse click runs its action once', async ({page}) => {
  const {dialog, centers} = await openAlert(page);
  // A mouse on a touch screen: the primary pointer is coarse, and the group
  // tracks every pointer, so the click runs Cancel through the group, once.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);
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
    // closed, so Cancel's paint can be read after the lift.
    const cancel = page.locator('[data-astryx-press-group-item]', {
      hasText: 'Cancel',
    });
    const del = page.locator('[data-astryx-press-group-item]', {
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
    // The lift runs Cancel. Under a finger the alert then leaves with a
    // fade, and Cancel's release fade plays through it: 100 ms after the
    // lift it is still fading, and it ends before the alert is hidden.
    expect(frames.at(-1)).toBe('none/fading');
    expect(frames.indexOf('none/on')).toBeGreaterThan(1);
    await expect(dialog).toBeHidden();
    const {clicks, paints} = await readLog(page);
    expect(clicks).toEqual(['Cancel']);
    expect(paints.map(entry => entry.split('@')[0]).slice(-2)).toEqual([
      'Cancel=fading',
      'Cancel=-',
    ]);
  },
);

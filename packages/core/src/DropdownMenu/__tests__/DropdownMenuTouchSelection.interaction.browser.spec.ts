// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuTouchSelection.interaction.browser.spec.ts
 * @input The built Default and With Sections DropdownMenu stories, real touch
 *   input (Chromium CDP / WebKit's input command), the interaction harness,
 *   and UIKit's content-touch delay from the constants table
 * @output Interaction proofs for a finger that lands in an open DropdownMenu,
 *   tracked as UIMenu's list tracks it (iOS 26.2): a resting finger lights
 *   its row only after the content-touch delay and its lift picks the row,
 *   once; a tap picks at the lift; in a menu that fits a quick drag scrubs
 *   and picks the row it lifts on; in a menu that scrolls a quick drag
 *   scrolls it and picks nothing; a storyboard of the resting press
 * @position Evidence for useMenuPress's 'uikit' touch tracking
 *   (menuSelectionRecognizer.ts and the shared action-group tracker); the
 *   recognizer is unit-tested in menuSelectionRecognizer.test.ts
 */

import {expect, test, type Page} from '@playwright/test';
import {
  drag,
  installLongTaskLog,
  openStory,
  Storyboard,
  tap,
  touchDriver,
  waitForRest,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {UIKIT_GESTURES} from '../../motion/uikit/gestures';

const storybook = withStorybook(test);
const ONSET_MS = UIKIT_GESTURES.press.contentTouchDelay.value;

interface Point {
  x: number;
  y: number;
}

/**
 * Page-side log on the page's clock: when the finger landed (its touchstart's
 * timestamp), when it lifted (the first of its pointerup and touchend), the
 * rows that took focus (the highlight is focus) and when, and the rows the
 * story logged as picked.
 */
async function installSelectionLog(page: Page) {
  await page.evaluate(() => {
    const log = {
      down: [] as number[],
      up: [] as number[],
      focus: [] as {row: string; at: number}[],
      picked: [] as string[],
    };
    (window as unknown as {__selectionLog: typeof log}).__selectionLog = log;
    document.addEventListener(
      'touchstart',
      event => log.down.push(event.timeStamp),
      true,
    );
    // Chromium reports a finger's pointerup before its touchend; the lift is
    // whichever comes first.
    const lift = (event: Event) => {
      if (log.up.length === log.down.length - 1) {
        log.up.push(event.timeStamp);
      }
    };
    document.addEventListener(
      'pointerup',
      event => {
        if (event.pointerType === 'touch') {
          lift(event);
        }
      },
      true,
    );
    document.addEventListener('touchend', lift, true);
    document.addEventListener(
      'focusin',
      event => {
        const row = (event.target as Element).closest('[role^="menuitem"]');
        if (row != null) {
          log.focus.push({
            row: row.textContent?.trim() ?? '',
            at: performance.now(),
          });
        }
      },
      true,
    );
    // The story reports a pick by logging "<label> clicked"; the spec
    // reads those lines through this page-side capture.
    // eslint-disable-next-line no-console -- see above
    const original = console.log.bind(console);
    // eslint-disable-next-line no-console -- see above
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].endsWith(' clicked')) {
        log.picked.push(args[0].replace(' clicked', ''));
      }
      original(...args);
    };
  });
}

const readLog = async (page: Page) =>
  page.evaluate(
    () =>
      (
        window as unknown as {
          __selectionLog: {
            down: number[];
            up: number[];
            focus: {row: string; at: number}[];
            picked: string[];
          };
        }
      ).__selectionLog,
  );

async function rowCenter(page: Page, name: string): Promise<Point> {
  const box = await page.getByRole('menuitem', {name}).boundingBox();
  if (box == null) {
    throw new Error(`no row ${name}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** Open the story's menu with a tap on its trigger and let it settle. */
async function openMenu(
  page: Page,
  story: string,
): Promise<{driver: TouchDriver}> {
  await installLongTaskLog(page);
  await openStory(page, storybook(), story);
  await installSelectionLog(page);
  const driver = await touchDriver(page);
  const trigger = page.locator('#storybook-root [aria-haspopup="menu"]');
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await waitForRest(page.locator('[popover]:has([role="menu"])').first());
  // The tap's own focus lands in the menu; only the press below counts.
  await page.evaluate(() => {
    const log = (
      window as unknown as {
        __selectionLog: {
          down: number[];
          up: number[];
          focus: unknown[];
          picked: string[];
        };
      }
    ).__selectionLog;
    log.down.length = 0;
    log.up.length = 0;
    log.focus.length = 0;
    log.picked.length = 0;
  });
  return {driver};
}

test('a resting finger lights its row after UIKit\u2019s content-touch delay, and the lift picks it once', async ({
  page,
}) => {
  const {driver} = await openMenu(page, 'core-dropdownmenu--default');
  const row = await rowCenter(page, 'Duplicate');
  await driver.play(tap(row, {holdMs: 320}));
  await expect
    .poll(async () => (await readLog(page)).picked)
    .toEqual(['Duplicate']);
  const log = await readLog(page);
  const lit = log.focus.find(entry => entry.row.startsWith('Duplicate'));
  expect(lit).toBeDefined();
  const delay = (lit?.at ?? 0) - log.down[0];
  // Not on the touch: after the list's content-touch delay (a timer, then
  // the focus in the same task), well before the lift.
  expect(delay).toBeGreaterThanOrEqual(ONSET_MS - 2);
  expect(delay).toBeLessThan(ONSET_MS + 80);
  expect(lit?.at ?? 0).toBeLessThan(log.up[0]);
  await page.waitForTimeout(300);
  expect((await readLog(page)).picked).toEqual(['Duplicate']);
});

test('a tap picks the row at the lift', async ({page}) => {
  const {driver} = await openMenu(page, 'core-dropdownmenu--default');
  const row = await rowCenter(page, 'Duplicate');
  await driver.play(tap(row, {holdMs: 60}));
  await expect
    .poll(async () => (await readLog(page)).picked)
    .toEqual(['Duplicate']);
  const log = await readLog(page);
  // Nothing lit before the lift: the tap was shorter than the delay.
  expect(log.focus.filter(entry => entry.at < log.up[0])).toEqual([]);
});

test('in a menu that fits, a quick drag scrubs and picks the row it lifts on', async ({
  page,
}) => {
  const {driver} = await openMenu(page, 'core-dropdownmenu--default');
  const from = await rowCenter(page, 'Edit');
  const to = await rowCenter(page, 'Duplicate');
  await driver.play(drag(from, to, {durationMs: 80, restMs: 60}));
  await expect
    .poll(async () => (await readLog(page)).picked)
    .toEqual(['Duplicate']);
  const log = await readLog(page);
  // The press began at once, from the row the finger landed on.
  expect(log.focus[0]?.row.startsWith('Edit')).toBe(true);
  expect(log.focus[0].at - log.down[0]).toBeLessThan(ONSET_MS);
});

test('in a menu that scrolls, a quick drag scrolls it and picks nothing', async ({
  page,
}) => {
  // Playwright's WebKit does not start native pans from scripted touches.
  test.skip(
    !(await touchDriver(page)).drivesNativeGestures,
    'needs native pans from scripted touches',
  );
  // A short viewport caps the menu below its content so it overflows.
  await page.setViewportSize({width: 800, height: 220});
  const {driver} = await openMenu(page, 'core-dropdownmenu--with-sections');
  const menu = page.getByRole('menu');
  await expect
    .poll(async () =>
      menu.evaluate(el => el.scrollHeight > el.clientHeight + 1),
    )
    .toBe(true);
  const first = await rowCenter(page, 'New File');
  const before = await menu.evaluate(el => el.scrollTop);
  await driver.play(
    drag(first, {x: first.x, y: first.y - 80}, {durationMs: 100}),
  );
  await page.waitForTimeout(400);
  expect(await menu.evaluate(el => el.scrollTop)).toBeGreaterThan(before);
  const log = await readLog(page);
  expect(log.picked).toEqual([]);
  expect(log.focus).toEqual([]);
  await expect(menu).toBeVisible();
});

test(
  'storyboard: a resting finger on a row',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver} = await openMenu(page, 'core-dropdownmenu--default');
    const row = await rowCenter(page, 'Duplicate');
    const popover = page.locator('[popover]:has([role="menu"])').first();
    const box = await popover.boundingBox();
    if (box == null) {
      throw new Error('no menu');
    }
    const board = new Storyboard(page, {
      name: 'dropdownmenu-touch-selection-rest',
      clip: {
        x: Math.max(0, box.x - 8),
        y: Math.max(0, box.y - 8),
        width: box.width + 16,
        height: box.height + 16,
      },
      columns: 5,
      cellScale: 0.6,
    });
    // Read in one page task: what is lit, and how long since the finger
    // landed on the page's clock (a photo takes time, so the script's own
    // timeline runs behind the page's).
    const measure = async () =>
      page.evaluate(() => {
        const active = document.activeElement;
        const down = (
          window as unknown as {__selectionLog: {down: number[]}}
        ).__selectionLog.down.at(-1);
        return {
          lit:
            active?.getAttribute('role') === 'menuitem'
              ? (active.textContent ?? '').trim()
              : '',
          sinceDown: down == null ? null : performance.now() - down,
        };
      });
    await board.capture('before the touch', 0, await measure());
    // A finger resting on the row (sub-pixel samples keep it reporting),
    // photographed before and after the content-touch delay, then lifted.
    const at = (t: number, dy: number) => ({
      t,
      fingers: [{id: 0, x: row.x, y: row.y + dy}],
    });
    await driver.play(
      [
        at(0, 0),
        at(60, 0.5),
        at(120, 0),
        at(ONSET_MS + 50, 0.5),
        at(ONSET_MS + 150, 0),
        {t: ONSET_MS + 200, fingers: []},
      ],
      {
        onEvent: async step => {
          await board.capture(
            `${step.type} t=${Math.round(step.t)}`,
            step.t,
            await measure(),
          );
        },
      },
    );
    await board.write(testInfo);
    const frames = board.frames.map(frame => ({
      sinceDown: frame.data.sinceDown as number | null,
      lit: frame.data.lit as string,
    }));
    // On the page's clock: not lit before the delay; lit after it, until the
    // lift picks the row.
    expect(
      frames.filter(
        frame =>
          frame.sinceDown != null &&
          frame.sinceDown < ONSET_MS - 20 &&
          frame.lit !== '',
      ),
    ).toEqual([]);
    expect(
      frames.some(
        frame =>
          frame.sinceDown != null &&
          frame.sinceDown > ONSET_MS + 20 &&
          frame.lit.startsWith('Duplicate'),
      ),
    ).toBe(true);
    await expect
      .poll(async () => (await readLog(page)).picked)
      .toEqual(['Duplicate']);
  },
);

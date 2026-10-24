// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.layout.interaction.browser.spec.ts
 * @input The built AlertDialog stories on the phone profile (a compact
 *   viewport) with real fonts, story args for the labels, and the harness
 * @output Layout proofs for the alert's actions under a finger on a compact
 *   screen (a coarse pointer, in Chromium and WebKit alike: one touch model
 *   on every touch device), which follow UIKit's measured rule (iOS 26.2):
 *   two actions share a row, Cancel leading and the
 *   two halves equal, when each label fits its half on one line; one label
 *   too long for its half stacks them, the action above Cancel, whatever the
 *   other label's length; DOM order is the visual order; right to left
 *   mirrors the row; a viewport that stops being compact keeps the wide row,
 *   and the decision follows the viewport back; a finger in Chrome's engine
 *   gets the same row. A mouse keeps today's
 *   layout: stacked at 640px and below, the action above Cancel, a trailing
 *   row above.
 * @position Layout lane of AlertDialog, beside the touch-tracking and motion
 *   specs. Run with `pnpm test:interaction AlertDialog`.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  frames,
  openStory,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

interface ActionBox {
  label: string;
  x: number;
  y: number;
  width: number;
}

/** The alert's actions in DOM order, with their boxes. */
async function actions(page: Page): Promise<ActionBox[]> {
  await frames(page, 2);
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-astryx-alert-action]')].map(
      element => {
        const box = element.getBoundingClientRect();
        return {
          label: element.textContent?.trim() ?? '',
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
        };
      },
    ),
  );
}

const open = async (
  page: Page,
  labels: {cancelLabel?: string; actionLabel: string},
) =>
  openStory(page, storybook(), 'core-alertdialog--desktop-fine-pointer', {
    ...labels,
  });

test.describe('under a finger on a compact screen', () => {
  test('two short actions share the row, Cancel leading, in equal halves and DOM order', async ({
    page,
  }) => {
    await open(page, {actionLabel: 'Delete'});
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual(['Cancel', 'Delete']);
    expect(first.y).toBe(second.y);
    expect(first.x).toBeLessThan(second.x);
    expect(Math.abs(first.width - second.width)).toBeLessThanOrEqual(1);
  });

  test('two medium labels that each fit their half still share the row', async ({
    page,
  }) => {
    await open(page, {cancelLabel: 'Keep it', actionLabel: 'Delete all'});
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual(['Keep it', 'Delete all']);
    expect(first.y).toBe(second.y);
  });

  test('one label too long for its half stacks them, whatever the other one', async ({
    page,
  }) => {
    // The two labels' sum fits the row; the long one alone does not fit its half.
    await open(page, {
      cancelLabel: 'No',
      actionLabel: 'Delete everything forever',
    });
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual([
      'Delete everything forever',
      'No',
    ]);
    expect(first.y).toBeLessThan(second.y);
    expect(first.x).toBe(second.x);
    expect(first.width).toBe(second.width);
  });

  test('right to left mirrors the row: Cancel on the right', async ({page}) => {
    await open(page, {actionLabel: 'Delete'});
    // The story's provider sets the direction on its own root.
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
      for (const element of document.querySelectorAll('[dir]')) {
        element.setAttribute('dir', 'rtl');
      }
    });
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual(['Cancel', 'Delete']);
    expect(first.y).toBe(second.y);
    expect(first.x).toBeGreaterThan(second.x);
  });

  test('a viewport that stops being compact keeps the wide row, and the decision follows it back', async ({
    page,
  }) => {
    await open(page, {
      cancelLabel: 'No',
      actionLabel: 'Delete everything forever',
    });
    expect((await actions(page))[0].label).toBe('Delete everything forever');
    await page.setViewportSize({width: 900, height: 714});
    const wide = await actions(page);
    expect(wide.map(action => action.label)).toEqual([
      'No',
      'Delete everything forever',
    ]);
    expect(wide[0].y).toBe(wide[1].y);
    await page.setViewportSize({width: 402, height: 714});
    const compact = await actions(page);
    expect(compact.map(action => action.label)).toEqual([
      'Delete everything forever',
      'No',
    ]);
    expect(compact[0].y).toBeLessThan(compact[1].y);
  });
});

test.describe('the first open, under a finger', () => {
  test('paints the row from its first frame: the layout is settled before the opening frame paints', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-alertdialog--delete');
    // A resize observer made after the alert's runs after it in the same
    // rendering update, after layout and before paint: what it reads is what
    // the opening frame paints.
    await page.evaluate(() => {
      const log: {open: boolean; rows: number[]}[] = [];
      (window as unknown as {__firstFrame: typeof log}).__firstFrame = log;
      const dialog = document.querySelector('dialog') as HTMLDialogElement;
      const observer = new ResizeObserver(() => {
        if (!dialog.open || log.length > 0) {
          return;
        }
        log.push({
          open: dialog.open,
          rows: [...dialog.querySelectorAll('[data-astryx-alert-action]')].map(
            action => Math.round(action.getBoundingClientRect().top),
          ),
        });
      });
      observer.observe(dialog);
    });
    const opener = page.getByRole('button', {name: 'Delete item'});
    const box = await opener.boundingBox();
    if (box == null) {
      throw new Error('no opener');
    }
    const driver = await touchDriver(page);
    await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    await expect(page.getByRole('alertdialog')).toBeVisible();
    const [first] = await page.evaluate(
      () =>
        (
          window as unknown as {
            __firstFrame: {open: boolean; rows: number[]}[];
          }
        ).__firstFrame,
    );
    expect(first?.rows.length).toBe(2);
    expect(first.rows[0]).toBe(first.rows[1]);
  });
});

test.describe("under a finger in Chrome's engine", () => {
  test.beforeEach(({browserName}) => {
    test.skip(browserName !== 'chromium', "Chrome's engine");
  });

  test('a finger gets the same row: two short actions share it, Cancel leading', async ({
    page,
  }) => {
    await open(page, {actionLabel: 'Delete'});
    expect(
      await page.evaluate(() => ({
        coarse: matchMedia('(pointer: coarse)').matches,
        ios: CSS.supports('(-webkit-touch-callout: none)'),
      })),
    ).toEqual({coarse: true, ios: false});
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual(['Cancel', 'Delete']);
    expect(first.y).toBe(second.y);
    expect(first.x).toBeLessThan(second.x);
    expect(first.width).toBe(second.width);
  });
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  // A fine pointer in each test's context, before anything is checked.
  const expectFinePointer = async (page: Page) =>
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);

  test("keeps today's stack at 640px and below, even when both labels fit", async ({
    page,
  }) => {
    await page.setViewportSize({width: 402, height: 714});
    await open(page, {actionLabel: 'Delete'});
    await expectFinePointer(page);
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual(['Delete', 'Cancel']);
    expect(first.y).toBeLessThan(second.y);
    expect(first.x).toBe(second.x);
    expect(first.width).toBe(second.width);
  });

  test("keeps today's trailing row above 640px", async ({page}) => {
    await page.setViewportSize({width: 700, height: 714});
    await open(page, {actionLabel: 'Delete'});
    await expectFinePointer(page);
    const [first, second] = await actions(page);
    expect([first.label, second.label]).toEqual(['Cancel', 'Delete']);
    expect(first.y).toBe(second.y);
    expect(first.x).toBeLessThan(second.x);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.layout.interaction.browser.spec.ts
 * @input The built AlertDialog stories on the phone profile (a compact
 *   viewport) with real fonts, story args for the labels, and the harness
 * @output Layout proofs for the alert's compact actions, which follow UIKit's
 *   measured rule (iOS 26.2): two actions share a row, Cancel leading and the
 *   two halves equal, when each label fits its half on one line; one label
 *   too long for its half stacks them, the action above Cancel, whatever the
 *   other label's length; DOM order is the visual order; right to left
 *   mirrors the row; a viewport that stops being compact keeps the wide row,
 *   and the decision follows the viewport back
 * @position Layout lane of AlertDialog, beside the touch-tracking and motion
 *   specs. Run with `pnpm test:interaction AlertDialog`.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  frames,
  openStory,
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

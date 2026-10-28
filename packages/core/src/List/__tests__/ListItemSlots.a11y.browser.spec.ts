// Copyright (c) Meta Platforms, Inc. and affiliates.
// @pr-a11y scope ^packages/core/src/List/ ^packages/core/src/Item/ ^packages/core/src/motion/ ^apps/storybook/stories/List

/**
 * @file ListItemSlots.a11y.browser.spec.ts
 * @input The built List "Animated Edit Modes" story (a List with an
 *   `animatedLayout` handle whose rows put a Checkbox in `startContent` to
 *   select, and a remove button that swaps for a Delete button in
 *   `endContent` to delete), in real Chromium at desktop and phone widths
 * @output Browser evidence for `component:List` FR12's slot changes: a
 *   control that appears enters while the label glides along the row; a
 *   replaced control swaps in place, the old one an inert copy; a leaving
 *   control is inert and out of the accessibility tree as its exit starts
 *   and hands its focus to the row without scrolling; a control re-rendering
 *   at the same size plays nothing; a leaving slot that sets the row's
 *   height hides at once; Reduce Motion with a mouse changes at once
 * @position Interaction evidence for List/listItemSlotMotion.tsx
 *
 * SYNC: When modified, update the Verification rows of List.spec.md.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

async function mount(page: Page, width = 1280, args = '') {
  await page.setViewportSize({width, height: 720});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-list--animated-edit-modes&viewMode=story${args}`,
  );
  await expect(page.getByRole('button', {name: 'Select'})).toBeVisible();
}

/**
 * Clicks a button and reads, in the same frame, every running animation's
 * target (its slot, `content` for a row's main content, or the row) and its
 * first keyframe.
 */
async function clickAndRead(
  page: Page,
  name: string,
): Promise<{target: string; first: Keyframe}[]> {
  await page.getByRole('button', {name, exact: true}).click();
  return page.evaluate(() =>
    document.getAnimations().flatMap(animation => {
      // The motion's own animations, not a hover or press transition.
      if (animation instanceof CSSTransition) {
        return [];
      }
      const effect = animation.effect as KeyframeEffect | null;
      const element = effect?.target;
      if (element == null || element.closest('li') == null) {
        return [];
      }
      const slot = element
        .closest('[data-astryx-item-slot]')
        ?.getAttribute('data-astryx-item-slot');
      const isInert = element.closest('[inert]') != null;
      const target = isInert
        ? 'copy'
        : (slot ?? (element.closest('li') === element ? 'row' : 'content'));
      return [{target, first: effect?.getKeyframes()[0] ?? {}}];
    }),
  );
}

const xOf = (first: Keyframe) =>
  Number.parseFloat(String(first.translate ?? '0').split(' ')[0] ?? '0');

for (const width of [1280, 390]) {
  test(`at ${width} px, a Checkbox that appears enters while the label glides along the row`, async ({
    page,
  }) => {
    await mount(page, width);
    const played = await clickAndRead(page, 'Select');
    expect(played.some(entry => entry.target === 'start')).toBe(true);
    // The row's main content moved along the row by the checkbox's width
    // and glides from where it was.
    const glides = played.filter(
      entry => entry.target === 'content' && xOf(entry.first) < -8,
    );
    expect(glides.length).toBeGreaterThan(0);
    await expect(
      page.getByRole('checkbox', {name: 'Select Inbox'}),
    ).toBeVisible();
  });
}

test('a remove button replaced by Delete swaps in place, and its focus goes to the row without scrolling', async ({
  page,
}) => {
  await mount(page);
  await page.getByRole('button', {name: 'Edit'}).click();
  await page.waitForTimeout(800);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const played = await clickAndRead(page, 'Remove Sent');
  // The old button leaves as one inert copy while Delete fades in.
  expect(
    played.some(
      entry => entry.target === 'end' && Number(entry.first.opacity) === 0,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () =>
        [...document.querySelectorAll('li [inert]')].filter(
          element =>
            element.querySelector('[aria-label="Remove Sent"]') != null,
        ).length,
    ),
  ).toBe(1);
  // Focus left with the remove button: it is on Sent's row now, unscrolled.
  expect(
    await page.evaluate(
      () => document.activeElement?.closest('li')?.textContent ?? '',
    ),
  ).toContain('Sent');
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe(
    'BODY',
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  await expect(page.getByRole('button', {name: 'Delete'})).toBeVisible();
});

test('a leaving control plays out where it was, inert and out of the accessibility tree as its exit starts', async ({
  page,
}) => {
  await mount(page);
  // Rows taller than their controls, so no slot sets its row's height.
  await page.addStyleTag({content: '#storybook-root li { min-height: 72px; }'});
  await page.getByRole('button', {name: 'Edit'}).click();
  await page.waitForTimeout(800);
  const before = await page.evaluate(() =>
    [...document.querySelectorAll('li [data-astryx-item-slot="end"]')].map(
      element => Math.round(element.getBoundingClientRect().left),
    ),
  );
  const played = await clickAndRead(page, 'Done');
  // The leaving controls fade out as inert copies.
  expect(played.some(entry => entry.target === 'copy')).toBe(true);
  const leaving = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        'li [data-astryx-item-slot="end"]:not(:empty)',
      ),
    ].map(element => ({
      left: Math.round(element.getBoundingClientRect().left),
      isInert: (element as HTMLElement).inert,
      isHidden: element.getAttribute('aria-hidden') === 'true',
    })),
  );
  expect(leaving.length).toBe(before.length);
  expect(leaving.every(entry => entry.isInert && entry.isHidden)).toBe(true);
  // Each stays where it was, in view.
  expect(leaving.map(entry => entry.left)).toEqual(before);
  await expect(page.getByRole('button', {name: /^Remove /})).toHaveCount(0);
  // Gone once the exit ends.
  await expect(
    page.locator('li [data-astryx-item-slot="end"]:not(:empty)'),
  ).toHaveCount(0, {timeout: 3000});
});

test("an end slot that sets its row's height goes at once, the last row's too", async ({
  page,
}) => {
  await mount(page);
  await page.getByRole('button', {name: 'Edit'}).click();
  await page.waitForTimeout(800);
  // The remove buttons are taller than the labels: each sets its row's
  // height, the last row's (nothing after it) included. The story writes
  // the slot as `mode === 'delete' && control`, so it leaves as `false`.
  const played = await clickAndRead(page, 'Done');
  expect(played).toHaveLength(0);
  await expect(
    page.locator('li [data-astryx-item-slot="end"]:not(:empty)'),
  ).toHaveCount(0);
});

test('a Checkbox toggled from the keyboard keeps its focus', async ({page}) => {
  await mount(page);
  await page.getByRole('button', {name: 'Select'}).click();
  await page.waitForTimeout(800);
  const box = page.getByRole('checkbox', {name: 'Select Drafts'});
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
  // Still on the checkbox: a second Space unchecks it, not the row.
  expect(
    await box.evaluate(element => element === document.activeElement),
  ).toBe(true);
  await page.keyboard.press('Space');
  await expect(box).not.toBeChecked();
});

test('a Checkbox toggling at the same size plays nothing', async ({page}) => {
  await mount(page);
  await page.getByRole('button', {name: 'Select'}).click();
  await page.waitForTimeout(800);
  await page.getByRole('checkbox', {name: 'Select Drafts'}).click();
  const running = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(animation => !(animation instanceof CSSTransition))
        .filter(
          animation =>
            (
              (animation.effect as KeyframeEffect | null)?.target as
                Element | undefined
            )?.closest('li') != null,
        ).length,
  );
  expect(running).toBe(0);
});

for (const align of ['center', 'start']) {
  test(`a leaving start slot that sets the row's height hides at once (align ${align})`, async ({
    page,
  }) => {
    await mount(page, 1280, `&args=align:${align}`);
    await page.addStyleTag({
      content: '[data-astryx-item-slot="start"] { min-height: 96px; }',
    });
    await page.getByRole('button', {name: 'Select'}).click();
    await page.waitForTimeout(800);
    const played = await clickAndRead(page, 'Done');
    // Nothing plays: the slot goes, and the label and the rows after the row
    // take their places at once.
    expect(played).toHaveLength(0);
    await expect(
      page.locator('li [data-astryx-item-slot="start"]:not(:empty)'),
    ).toHaveCount(0);
  });
}

test('under Reduce Motion with a mouse the slots change at once', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await mount(page);
  const played = await clickAndRead(page, 'Select');
  expect(played).toHaveLength(0);
  await expect(
    page.getByRole('checkbox', {name: 'Select Inbox'}),
  ).toBeVisible();
});

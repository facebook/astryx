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

async function mount(page: Page, width = 1280) {
  await page.setViewportSize({width, height: 720});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-list--animated-edit-modes&viewMode=story`,
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
      const element = effect?.target as Element | null | undefined;
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

test('a leaving control is inert and out of the accessibility tree as its exit starts', async ({
  page,
}) => {
  await mount(page);
  await page.getByRole('button', {name: 'Edit'}).click();
  await page.waitForTimeout(800);
  const played = await clickAndRead(page, 'Done');
  // The leaving control conceals in place (an exit, not a removal).
  expect(
    played.some(
      entry => entry.target === 'copy' && entry.first.clipPath != null,
    ),
  ).toBe(true);
  const leaving = await page.evaluate(() =>
    [...document.querySelectorAll('li [data-astryx-item-slot="end"]')].map(
      element => ({
        isInert: (element as HTMLElement).inert,
        isHidden: element.getAttribute('aria-hidden') === 'true',
      }),
    ),
  );
  expect(leaving.length).toBeGreaterThan(0);
  expect(leaving.every(entry => entry.isInert && entry.isHidden)).toBe(true);
  await expect(page.getByRole('button', {name: /^Remove /})).toHaveCount(0);
  // Gone once the exit ends.
  await expect(page.locator('li [data-astryx-item-slot="end"]')).toHaveCount(
    0,
    {timeout: 3000},
  );
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

test("a leaving slot that sets the row's height hides at once", async ({
  page,
}) => {
  await mount(page);
  await page.addStyleTag({
    content: '[data-astryx-item-slot="start"] { min-height: 96px; }',
  });
  await page.getByRole('button', {name: 'Select'}).click();
  await page.waitForTimeout(800);
  const played = await clickAndRead(page, 'Done');
  // Nothing plays: the slot goes, and the label and the rows after the row
  // take their places at once.
  expect(played).toHaveLength(0);
  await expect(page.locator('li [data-astryx-item-slot="start"]')).toHaveCount(
    0,
  );
});

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

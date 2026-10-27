// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListEditingSelect.interaction.browser.spec.ts
 * @input Playwright, the built Storybook's List editing-selection story, real
 *   touch input (the interaction harness) and the list table's values
 *   (motion/uikit/list.ts)
 * @output Interaction and animation proofs for edit mode's selection
 *   control under a finger: it centres UIKit's distance past the row's
 *   resting text start, on the row's height; entering slides it in from
 *   UIKit's travel and fades it in on the table spring, sampled frame by
 *   frame; leaving slides it out and fades it, then it leaves; tapping a row
 *   toggles its mark; right to left it comes from the right; under reduced
 *   motion it cross-fades, opacity only, within 200 ms
 *   (`design:reduced-motion`); a mouse shows and hides it at once
 * @position Interaction evidence for List's `editingControl` and
 *   List/useListEditingMotion.ts, under a finger (./touchStory.ts), with a
 *   mouse case
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  holdAnimations,
  releaseAnimations,
  seekAnimations,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {solveSpring, toSpring} from '../../motion/spring';
import {list} from '../../motion/uikit/list';
import {expectReducedMotionCrossFade} from './reducedMotion';
import {openStory} from './touchStory';

const storybook = withStorybook(test);

const STORY = 'core-list--editing-selection';
const TRAVEL = list.metrics.editingControlTravel;
const CENTER = list.metrics.editingControlCenter;
const INDENT = list.metrics.editingIndent;
const SPRING = toSpring(list.update.tableSpring);
const progress = (t: number) =>
  solveSpring(SPRING, {from: 0, to: 1}).value(t / 1000);

const row = (page: Page, label: string) =>
  page.locator('#storybook-root li').filter({hasText: label}).first();
const text = (page: Page, label: string) =>
  page.locator('#storybook-root li').getByText(label, {exact: true}).first();
const control = (page: Page, label: string) =>
  row(page, label).locator('[data-astryx-editing-control]');
/** The theme's checkbox indicator: the control itself, with no wrapper. */
const mark = (page: Page, label: string) =>
  row(page, label).locator(
    '[data-astryx-editing-control].astryx-checkbox-indicator',
  );

const rect = async (element: Locator) =>
  element.evaluate(el => {
    const box = el.getBoundingClientRect();
    return {
      left: box.left,
      right: box.right,
      centerX: box.left + box.width / 2,
      centerY: box.top + box.height / 2,
    };
  });
const opacity = async (element: Locator) =>
  element.evaluate(el => Number(getComputedStyle(el).opacity));

async function open(page: Page, globals?: string) {
  await openStory(page, storybook(), STORY, {globals});
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'edit mode moves under a finger only');
  await expect(row(page, 'Drafts')).toBeVisible();
}

async function toggle(page: Page) {
  await page.getByRole('button', {name: /^(Edit|Done)$/}).click();
}

/**
 * A theme's row padding, set where a theme sets it: the theme's cascade layer,
 * above every component class (`component:List` FR7).
 */
async function themeRowPadding(page: Page, padding: string): Promise<void> {
  await page.addInitScript(value => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = `@layer astryx-theme { .astryx-item { padding-inline: ${value}; --_item-inset-inline: ${value}; } }`;
      document.head.append(style);
    });
  }, padding);
}

/** Enters edit mode and lets it settle on its own clock. */
async function enter(page: Page) {
  await toggle(page);
  await expect(row(page, 'Sent').locator('[data-astryx-item-end]')).toHaveCount(
    0,
  );
  await page.waitForTimeout(300);
}

test('the control centres UIKit’s distance past the row’s resting text start, on the row’s height', async ({
  page,
}) => {
  await open(page);
  const resting = await rect(text(page, 'Sent'));
  await enter(page);
  const at = await rect(mark(page, 'Sent'));
  const box = await rect(row(page, 'Sent'));
  expect(Math.abs(at.centerX - (resting.left + CENTER))).toBeLessThan(0.75);
  expect(Math.abs(at.centerY - box.centerY)).toBeLessThan(1);
});

test('under a theme’s row padding, the control stays clear of the text: the text makes its room past the theme’s inset', async ({
  page,
}) => {
  await themeRowPadding(page, '24px');
  await open(page);
  const resting = await rect(text(page, 'Sent'));
  // The theme's inset applies at rest.
  expect(
    await row(page, 'Sent').evaluate(el =>
      Number.parseFloat(getComputedStyle(el).paddingInlineStart),
    ),
  ).toBe(24);
  await enter(page);
  const at = await rect(mark(page, 'Sent'));
  const label = await rect(text(page, 'Sent'));
  expect(Math.abs(at.centerX - (resting.left + CENTER))).toBeLessThan(0.75);
  expect(Math.abs(label.left - (resting.left + INDENT))).toBeLessThan(0.5);
  expect(at.right).toBeLessThan(label.left);
});

test('entering slides the control in from UIKit’s travel and fades it in on the table spring, frame by frame', async ({
  page,
}) => {
  await open(page);
  await enter(page);
  const rest = (await rect(control(page, 'Sent'))).left;
  await toggle(page);
  await page.waitForTimeout(700);
  await toggle(page);
  await holdAnimations(page);
  for (const t of [0, 67, 168, 266]) {
    await seekAnimations(page, t);
    const left = (await rect(control(page, 'Sent'))).left;
    const expected = rest - TRAVEL * (1 - progress(t));
    expect(Math.abs(left - expected), `x at t=${t}`).toBeLessThan(0.5);
    expect(
      Math.abs((await opacity(control(page, 'Sent'))) - progress(t)),
      `opacity at t=${t}`,
    ).toBeLessThan(0.02);
  }
  await releaseAnimations(page, {finish: true});
});

test('leaving slides the control out and fades it, then it leaves', async ({
  page,
}) => {
  await open(page);
  await enter(page);
  const rest = (await rect(control(page, 'Sent'))).left;
  await toggle(page);
  await holdAnimations(page);
  for (const t of [0, 67, 168]) {
    await seekAnimations(page, t);
    const left = (await rect(control(page, 'Sent'))).left;
    expect(
      Math.abs(left - (rest - TRAVEL * progress(t))),
      `t=${t}`,
    ).toBeLessThan(0.5);
  }
  await releaseAnimations(page);
  await expect(control(page, 'Sent')).toHaveCount(0);
});

test('tapping a row in edit mode toggles its mark', async ({page}) => {
  await open(page);
  await enter(page);
  expect(await mark(page, 'Drafts').getAttribute('data-checked')).toBeNull();
  await text(page, 'Drafts').click();
  await expect(mark(page, 'Drafts')).toHaveAttribute('data-checked', 'checked');
  // The mark is decorative: the row is the one control.
  expect(
    await control(page, 'Drafts').evaluate(
      el => el.closest('[aria-hidden="true"]') != null,
    ),
  ).toBe(true);
});

test('right to left, the control comes from the right', async ({page}) => {
  await open(page, 'direction:rtl');
  await enter(page);
  const rest = (await rect(control(page, 'Sent'))).left;
  await toggle(page);
  await page.waitForTimeout(700);
  await toggle(page);
  await holdAnimations(page);
  await seekAnimations(page, 0);
  expect(
    Math.abs((await rect(control(page, 'Sent'))).left - (rest + TRAVEL)),
  ).toBeLessThan(0.5);
  await releaseAnimations(page, {finish: true});
});

test('under reduced motion the control cross-fades: opacity only, within 200 ms', async ({
  page,
}) => {
  // design:reduced-motion DR1 and DR2, under a finger: nothing slides.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await open(page);
  await page.evaluate(async () => {
    [...document.querySelectorAll('button')]
      .find(button => button.textContent?.trim() === 'Edit')
      ?.click();
    for (
      let frame = 0;
      frame < 60 && document.getAnimations().length === 0;
      frame += 1
    ) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  });
  expectReducedMotionCrossFade(await holdAnimations(page));
  await releaseAnimations(page, {finish: true});
});

test('a mouse: the control comes and goes at once', async ({browser}) => {
  const context = await browser.newContext({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 900, height: 700},
  });
  const page = await context.newPage();
  try {
    await openStory(page, storybook(), STORY);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await toggle(page);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await expect(control(page, 'Sent')).toHaveCount(1);
    await toggle(page);
    await expect(control(page, 'Sent')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

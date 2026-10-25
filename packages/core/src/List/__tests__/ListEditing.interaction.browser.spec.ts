// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListEditing.interaction.browser.spec.ts
 * @input Playwright, the built Storybook's List editing story, real touch
 *   input (the interaction harness) and the table spring from the UIKit
 *   constants table (motion/uikit/list.ts)
 * @output Interaction and animation proofs for List's edit mode under a
 *   finger: entering moves each row's text by UIKit's edit-mode indent, the
 *   content sliding there from where it was on the table spring, sampled
 *   frame by frame, while the trailing content fades out in place and
 *   leaves; leaving runs it back; a toggle mid-transition continues from the
 *   frame on screen with no jump; right to left mirrors the slide; under
 *   reduced motion it cross-fades, opacity only, within 200 ms
 *   (`design:reduced-motion`); a mouse switches at once
 * @position Interaction evidence for List/useListEditingMotion.ts, under a
 *   finger (./touchStory.ts), with a mouse case
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

const STORY = 'core-list--editing';
const INDENT = list.metrics.editingIndent;
const SPRING = toSpring(list.update.tableSpring);
const progress = (t: number) =>
  solveSpring(SPRING, {from: 0, to: 1}).value(t / 1000);

const row = (page: Page, label: string) =>
  page.locator('#storybook-root li').filter({hasText: label}).first();
const text = (page: Page, label: string) =>
  page.locator('#storybook-root li').getByText(label, {exact: true}).first();
const chevron = (page: Page, label: string) =>
  row(page, label).locator('[data-astryx-item-end]');

const left = async (element: Locator) =>
  element.evaluate(el => el.getBoundingClientRect().left);
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

/** Activates the Edit / Done button. */
async function toggle(page: Page) {
  await page.getByRole('button', {name: /^(Edit|Done)$/}).click();
}

test('entering edit mode slides the text by the indent on the table spring, sampled frame by frame', async ({
  page,
}) => {
  await open(page);
  const label = text(page, 'Sent');
  const was = await left(label);
  const accessory = chevron(page, 'Sent');
  await expect(accessory).toHaveCount(1);
  const accessoryLeft = await left(accessory);
  await toggle(page);
  await holdAnimations(page);
  for (const t of [0, 34, 67, 100, 168, 266, 400]) {
    await seekAnimations(page, t);
    const expected = was + INDENT * progress(t);
    expect(Math.abs((await left(label)) - expected), `t=${t}`).toBeLessThan(
      0.5,
    );
    // The trailing content fades out in place: it never slides.
    expect(Math.abs((await left(accessory)) - accessoryLeft)).toBeLessThan(0.5);
  }
  await seekAnimations(page, 100);
  const midFade = await opacity(accessory);
  expect(midFade).toBeGreaterThan(0);
  expect(midFade).toBeLessThan(1);
  await releaseAnimations(page, {finish: true});
  await expect(accessory).toHaveCount(0);
  expect(Math.abs((await left(label)) - (was + INDENT))).toBeLessThan(0.5);
});

test('leaving edit mode runs it back: the text slides home and the trailing content fades in where it rests', async ({
  page,
}) => {
  await open(page);
  const label = text(page, 'Sent');
  const was = await left(label);
  await toggle(page);
  // Entered and at rest on its own clock (the motion's model and the screen
  // agree), the trailing content gone.
  await expect(chevron(page, 'Sent')).toHaveCount(0);
  await page.waitForTimeout(300);
  await toggle(page);
  await holdAnimations(page);
  for (const t of [0, 67, 168, 400]) {
    await seekAnimations(page, t);
    const expected = was + INDENT * (1 - progress(t));
    expect(Math.abs((await left(label)) - expected), `t=${t}`).toBeLessThan(
      0.5,
    );
  }
  await seekAnimations(page, 0);
  expect(await opacity(chevron(page, 'Sent'))).toBeLessThan(0.05);
  await releaseAnimations(page, {finish: true});
  expect(await opacity(chevron(page, 'Sent'))).toBe(1);
  expect(Math.abs((await left(label)) - was)).toBeLessThan(0.5);
});

test('a toggle mid-transition continues from the frame on screen, with no jump', async ({
  page,
}) => {
  await open(page);
  const label = text(page, 'Sent');
  const was = await left(label);
  await toggle(page);
  await page.waitForTimeout(100);
  const before = await left(label);
  await toggle(page);
  const after = await left(label);
  // One frame apart at most: the text keeps moving the way it was.
  expect(Math.abs(after - before)).toBeLessThan(INDENT * 0.25);
  expect(after).toBeGreaterThan(was);
  await expect
    .poll(async () => Math.abs((await left(label)) - was))
    .toBeLessThan(0.5);
});

test('right to left, the text slides to the left by the indent', async ({
  page,
}) => {
  await open(page, 'direction:rtl');
  const label = text(page, 'Sent');
  const box = await label.evaluate(el => el.getBoundingClientRect().right);
  await toggle(page);
  await holdAnimations(page);
  await seekAnimations(page, 0);
  // From where it was: the indent is undone on the first frame.
  const first = await label.evaluate(el => el.getBoundingClientRect().right);
  expect(Math.abs(first - box)).toBeLessThan(0.5);
  await releaseAnimations(page, {finish: true});
  const now = await label.evaluate(el => el.getBoundingClientRect().right);
  expect(Math.abs(now - (box - INDENT))).toBeLessThan(0.5);
});

test('under reduced motion entering and leaving cross-fade: opacity only, within 200 ms', async ({
  page,
}) => {
  // design:reduced-motion DR1 and DR2, under a finger: nothing slides.
  await page.emulateMedia({reducedMotion: 'reduce'});
  for (let pass = 0; pass < 2; pass += 1) {
    await open(page);
    if (pass === 1) {
      await toggle(page);
      await releaseAnimations(page, {finish: true});
    }
    await page.evaluate(async () => {
      [...document.querySelectorAll('button')]
        .find(button => /^(Edit|Done)$/.test(button.textContent?.trim() ?? ''))
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
  }
});

test('a mouse: edit mode switches at once', async ({browser}) => {
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
    const label = text(page, 'Sent');
    const was = await left(label);
    await toggle(page);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(Math.abs((await left(label)) - (was + INDENT))).toBeLessThan(0.5);
    await expect(chevron(page, 'Sent')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

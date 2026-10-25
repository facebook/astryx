// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListEditingDelete.interaction.browser.spec.ts
 * @input Playwright, the built Storybook's List editing-delete story, real
 *   touch input (the interaction harness) and the list table's values
 *   (motion/uikit/list.ts)
 * @output Interaction proofs for edit mode's delete control under a finger:
 *   it centres where every editing control centres, a disc of UIKit's size;
 *   a tap opens the row's trailing actions as a swipe does (the row's own
 *   swipe), and a second tap closes them; a row's action is never run by
 *   it; under reduced motion it cross-fades; a mouse shows none
 * @position Interaction evidence for List's `editingControl="delete"`, under
 *   a finger (./touchStory.ts), with a mouse case
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  holdAnimations,
  releaseAnimations,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {list} from '../../motion/uikit/list';
import {expectReducedMotionCrossFade} from './reducedMotion';
import {openStory} from './touchStory';

const storybook = withStorybook(test);

const STORY = 'core-list--editing-delete';
const CENTER = list.metrics.editingControlCenter;
const DIAMETER = list.metrics.deleteControlDiameter;

const row = (page: Page, label: string) =>
  page.locator('#storybook-root li').filter({hasText: label}).first();
const text = (page: Page, label: string) =>
  page.locator('#storybook-root li').getByText(label, {exact: true}).first();
const disc = (page: Page, label: string) =>
  row(page, label).locator('[data-astryx-delete-control]');

const rect = async (element: Locator) =>
  element.evaluate(el => {
    const box = el.getBoundingClientRect();
    return {
      left: box.left,
      width: box.width,
      centerX: box.left + box.width / 2,
      centerY: box.top + box.height / 2,
    };
  });

async function open(page: Page) {
  await openStory(page, storybook(), STORY);
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the delete control exists under a finger only');
  await expect(row(page, 'Drafts')).toBeVisible();
}

async function enter(page: Page) {
  await page.getByRole('button', {name: 'Edit'}).click();
  await expect(disc(page, 'Sent')).toBeVisible();
  await page.waitForTimeout(600);
}

async function tapOn(page: Page, element: Locator) {
  const box = await rect(element);
  const driver = await touchDriver(page);
  await driver.tap({x: box.centerX, y: box.centerY});
}

test('the delete control centres where every editing control centres, a disc of UIKit’s size', async ({
  page,
}) => {
  await open(page);
  const resting = await rect(text(page, 'Sent'));
  await enter(page);
  const at = await rect(disc(page, 'Sent'));
  expect(Math.abs(at.centerX - (resting.left + CENTER))).toBeLessThan(0.75);
  expect(Math.abs(at.width - DIAMETER)).toBeLessThan(0.5);
});

test('a tap opens the row’s trailing actions as a swipe does; a tap on the row closes them', async ({
  page,
}) => {
  await open(page);
  await enter(page);
  const before = (await rect(text(page, 'Sent'))).left;
  await tapOn(page, disc(page, 'Sent'));
  const deleteAction = row(page, 'Sent').getByRole('button', {
    name: 'Delete',
  });
  await expect(deleteAction).toBeVisible();
  // The whole row slides toward the inline start by the panel's width, the
  // control with it, as a swipe moves it.
  await expect
    .poll(async () => before - (await rect(text(page, 'Sent'))).left)
    .toBeGreaterThan(40);
  // Still in the list: tapping the control never ran the row's action.
  await expect(row(page, 'Sent')).toBeVisible();
  await tapOn(page, text(page, 'Sent'));
  await expect
    .poll(async () => Math.abs((await rect(text(page, 'Sent'))).left - before))
    .toBeLessThan(0.5);
});

test('Done closes an open row with edit mode, as UIKit ends editing', async ({
  page,
}) => {
  await open(page);
  const resting = (await rect(text(page, 'Sent'))).left;
  await enter(page);
  await tapOn(page, disc(page, 'Sent'));
  await expect(
    row(page, 'Sent').getByRole('button', {name: 'Delete'}),
  ).toBeVisible();
  await page.getByRole('button', {name: 'Done'}).click();
  await expect
    .poll(async () => Math.abs((await rect(text(page, 'Sent'))).left - resting))
    .toBeLessThan(0.5);
  await expect(disc(page, 'Sent')).toHaveCount(0);
});

test('under reduced motion the delete control cross-fades: opacity only, within 200 ms', async ({
  page,
}) => {
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
  // Edit mode's own animations: the swipe layer's parts write where they
  // stand as the rows re-render (instant sets, its own).
  const held = (await holdAnimations(page)).filter(
    animation => !(animation.target ?? '').includes('swipe-panel'),
  );
  expectReducedMotionCrossFade(held);
  await releaseAnimations(page, {finish: true});
});

test('a mouse: no delete control, the indent alone', async ({browser}) => {
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
    await page.getByRole('button', {name: 'Edit'}).click();
    // The indent is the row's own padding, in edit mode.
    await expect(row(page, 'Sent')).toHaveAttribute('data-astryx-editing', '');
    await expect(disc(page, 'Sent')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chromium.chromium.spec.ts
 * @input Uses @playwright/test and the public Chromium harness seam
 * @output Focused accessibility-tree mapping tests for computed node state
 * @position Harness regression coverage; proves browser AX properties are exposed without DOM substitution.
 */

import {expect, test} from '@playwright/test';
import {createChromiumHarness, holdMotionStill} from './chromium';

test('computed node exposes selected state for tabs', async ({page}) => {
  await page.setContent(`
    <div role="tablist" aria-label="Views">
      <button role="tab" aria-selected="true">Overview</button>
      <button role="tab" aria-selected="false">Activity</button>
    </div>
  `);
  const cdp = await page.context().newCDPSession(page);

  const selected = await createChromiumHarness({
    page,
    subject: page.getByRole('tab', {name: 'Overview'}),
    cdp,
  })
    .subject()
    .then(subject => subject.computed());
  const unselected = await createChromiumHarness({
    page,
    subject: page.getByRole('tab', {name: 'Activity'}),
    cdp,
  })
    .subject()
    .then(subject => subject.computed());

  expect(selected.selected).toBe(true);
  expect(unselected.selected).toBe(false);
});

test('contains compares semantic subjects rather than pointer targets', async ({
  page,
}) => {
  await page.setContent(`
    <div id="pointer-wrapper">
      <div id="semantic-subject"></div>
      <div id="semantic-candidate"></div>
    </div>
  `);
  const cdp = await page.context().newCDPSession(page);
  const harness = createChromiumHarness({
    page,
    subject: page.locator('#semantic-subject'),
    pointerTarget: page.locator('#pointer-wrapper'),
    cdp,
    related: {candidate: page.locator('#semantic-candidate')},
  });

  expect(
    await harness.contains(
      await harness.subject(),
      await harness.related('candidate'),
    ),
  ).toBe(false);
});

test('semantic containment follows aria-owns and excludes hidden descendants', async ({
  page,
}) => {
  await page.setContent(`
    <div id="tablist" role="tablist" aria-owns="owned-tab">
      <button id="hidden-tab" role="tab" aria-hidden="true">Hidden</button>
    </div>
    <button id="owned-tab" role="tab">Owned</button>
  `);
  const cdp = await page.context().newCDPSession(page);
  const harness = createChromiumHarness({
    page,
    subject: page.locator('#tablist'),
    cdp,
    related: {
      owned: page.locator('#owned-tab'),
      hidden: page.locator('#hidden-tab'),
    },
  });

  expect(
    await harness.containsSemantically(
      await harness.subject(),
      await harness.related('owned'),
    ),
  ).toBe(true);
  expect(
    await harness.containsSemantically(
      await harness.subject(),
      await harness.related('hidden'),
    ),
  ).toBe(false);
});

test('references compares resolved node identity when ids are duplicated', async ({
  page,
}) => {
  await page.setContent(`
    <button id="source" aria-controls="panel">Tab</button>
    <div id="panel">Wrong duplicate</div>
    <div id="panel" data-expected>Expected panel</div>
  `);
  const cdp = await page.context().newCDPSession(page);
  const harness = createChromiumHarness({
    page,
    subject: page.locator('#source'),
    cdp,
    related: {target: page.locator('[data-expected]')},
  });

  expect(
    await harness.references(
      await harness.subject(),
      'aria-controls',
      await harness.related('target'),
    ),
  ).toBe(false);
});

test('holding motion still prevents intermediate transition frames', async ({
  page,
}) => {
  await page.setContent(`
    <div id="panel" style="opacity:1; transition:opacity 10s">Panel</div>
  `);
  await holdMotionStill(page);
  const cdp = await page.context().newCDPSession(page);
  const harness = createChromiumHarness({
    page,
    subject: page.locator('#panel'),
    cdp,
  });

  await page.locator('#panel').evaluate(element => {
    element.style.opacity = '0';
  });

  expect(await (await harness.subject()).isVisible()).toBe(false);
});

test('subjects report rendered visibility', async ({page}) => {
  await page.setContent(`
    <div id="visible">Visible</div>
    <div id="hidden" style="display:none">Hidden</div>
    <div id="transparent" style="opacity:0">Transparent</div>
  `);
  const cdp = await page.context().newCDPSession(page);
  const harness = createChromiumHarness({
    page,
    subject: page.locator('#visible'),
    cdp,
    related: {
      hidden: page.locator('#hidden'),
      transparent: page.locator('#transparent'),
    },
  });

  expect(await (await harness.subject()).isVisible()).toBe(true);
  expect(await (await harness.related('hidden')).isVisible()).toBe(false);
  expect(await (await harness.related('transparent')).isVisible()).toBe(false);
});

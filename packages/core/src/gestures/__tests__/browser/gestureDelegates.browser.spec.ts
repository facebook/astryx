// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file gestureDelegates.browser.spec.ts
 * @input delegatesFixture.ts bundled with esbuild, a phone-sized touch screen
 *   and real engine touch input (drivers.ts)
 * @output Browser proof that app code relates to a component's recognizer by
 *   its published name: by default the innermost recognizer wins; declared,
 *   an app pan inside a sheet waits for the sheet's drag (and still gets the
 *   drags the sheet fails on), a sheet's drag waits for an app pan around it,
 *   and an app vetoes the sheet's drag
 * @position Browser tests of packages/core/src/gestures/gestureDelegates.ts
 *   (see playwright.config.ts beside this file)
 */

import {expect, test, type Page} from '@playwright/test';
import {bundleFixture, center, drag, openFixture, type Driver} from './drivers';

let bundle = '';

test.beforeAll(async () => {
  bundle = await bundleFixture('delegatesFixture.ts');
});

async function open(page: Page, engine: string): Promise<Driver> {
  return openFixture(page, engine, bundle);
}

/** One drag from the centre of `id` by (dx, dy); the transitions it logged. */
async function dragOn(
  page: Page,
  driver: Driver,
  id: string,
  dx: number,
  dy: number,
): Promise<string[]> {
  await page.evaluate(() => {
    window.__log.length = 0;
  });
  const start = await center(page, id);
  await driver.play(drag(start, {x: start.x + dx, y: start.y + dy}, 14));
  await page.waitForTimeout(80);
  return page.evaluate(() =>
    window.__log.filter(entry => !entry.endsWith(':possible')),
  );
}

const declare = async (page: Page, panel: 'A' | 'B' | 'C', on: boolean) =>
  page.evaluate(([p, value]) => window.__setDeclared(p, value), [
    panel,
    on,
  ] as const);

test('A: an app pan inside a sheet wins by default, and waits for the sheet’s drag when declared', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  const before = await dragOn(page, driver, 'canvasA', 0, 90);
  expect(before[0]).toBe('appA:began');
  expect(before).not.toContain('sheetA:began');

  await declare(page, 'A', true);
  const down = await dragOn(page, driver, 'canvasA', 0, 90);
  expect(down[0]).toBe('sheetA:began');
  expect(down).toContain('appA:failed');
  // Sideways the sheet's drag fails, and the app pan gets the drag.
  const sideways = await dragOn(page, driver, 'canvasA', 90, 0);
  expect(sideways).toContain('sheetA:failed');
  expect(sideways).toContain('appA:began');
});

test('B: a sheet inside an app pan wins by default, and its drag waits for the app’s pan when declared', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  const before = await dragOn(page, driver, 'sheetB', 0, 60);
  expect(before[0]).toBe('sheetB:began');
  expect(before).toContain('appB:failed');

  await declare(page, 'B', true);
  const after = await dragOn(page, driver, 'sheetB', 0, 60);
  expect(after[0]).toBe('appB:began');
  expect(after).toContain('sheetB:failed');
});

test('C: an app vetoes the sheet’s drag while it is editing', async ({
  page,
  browserName,
}) => {
  const driver = await open(page, browserName);
  await declare(page, 'C', true);
  const vetoed = await dragOn(page, driver, 'sheetC', 0, 90);
  expect(vetoed).toEqual(['sheetC:failed']);

  await declare(page, 'C', false);
  const allowed = await dragOn(page, driver, 'sheetC', 0, 90);
  expect(allowed[0]).toBe('sheetC:began');
});

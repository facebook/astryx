// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file mobile-navigation.spec.ts
 * @input A production docsite server and Chromium at mobile/desktop widths
 * @output First-paint and hydrated navigation regression coverage
 * @position Docsite browser tests; run with pnpm test:docsite-browser
 */

import {expect, test} from '@playwright/test';

for (const width of [320, 390, 767, 768, 1280]) {
  test(`components navigation is visible before hydration at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({width, height: 844});
    // Keep the real server HTML and CSS, but prevent hydration from repairing
    // missing navigation. A test that waits for the app to mount misses this bug.
    await page.route('**/_next/**/*.js*', route => route.abort());
    await page.goto('/components', {waitUntil: 'load'});

    const nav = page.getByRole('navigation', {name: 'Astryx navigation'});
    const toggle = nav.getByRole('button', {name: 'Open navigation'});
    const components = nav.getByRole('link', {name: 'Components', exact: true});
    if (width < 768) {
      await expect(toggle).toBeVisible();
      await expect(toggle).toBeInViewport();
      await expect(components).toBeHidden();
    } else {
      await expect(toggle).toBeHidden();
      await expect(components).toBeVisible();
      await expect(
        page.getByRole('textbox', {name: 'Search components'}),
      ).toBeVisible();
    }
  });
}

test('the hydrated docs hamburger owns one combined drawer across navigation and resize', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/components');

  const nav = page.getByRole('navigation', {name: 'Astryx navigation'});
  const toggle = nav.getByRole('button', {name: 'Open navigation'});
  await expect(nav).toHaveAttribute('data-mode', 'mobile-bar');
  await expect(
    nav.getByRole('button', {name: /Open (menu|navigation)/}),
  ).toHaveCount(1);
  await toggle.click();

  const drawer = page.getByRole('dialog');
  await expect(drawer).toHaveCount(1);
  await expect(
    drawer.getByRole('link', {name: 'Docs', exact: true}),
  ).toBeVisible();
  await expect(
    drawer.getByRole('textbox', {name: 'Search components'}),
  ).toBeVisible();
  await drawer.getByRole('link', {name: 'Docs', exact: true}).click();
  await expect(page).toHaveURL(/\/docs\/getting-started$/);
  await expect(drawer).toBeHidden();
  await expect(toggle).toBeVisible();

  await toggle.click();
  await drawer.getByRole('link', {name: 'Components', exact: true}).click();
  await expect(page).toHaveURL(/\/components$/);
  await page.reload();
  await expect(nav).toHaveAttribute('data-mode', 'mobile-bar');
  await expect(toggle).toBeVisible();

  await page.setViewportSize({width: 768, height: 844});
  await expect(toggle).toBeHidden();
  await expect(
    nav.getByRole('link', {name: 'Components', exact: true}),
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', {name: 'Search components'}),
  ).toBeVisible();
  await page.setViewportSize({width: 390, height: 844});
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  expect(errors).toEqual([]);
});

test('the standalone marketing menu still opens its own drawer', async ({
  page,
}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  const nav = page.getByRole('navigation', {name: 'Astryx navigation'});
  await nav.getByRole('button', {name: 'Open menu'}).click();
  const drawer = page.getByRole('dialog', {name: 'Astryx navigation'});
  await expect(drawer).toBeVisible();
  await drawer.getByRole('link', {name: 'Components', exact: true}).click();
  await expect(page).toHaveURL(/\/components$/);
  await expect(drawer).toBeHidden();
  await expect(
    page.getByRole('button', {name: 'Open navigation'}),
  ).toBeVisible();
});

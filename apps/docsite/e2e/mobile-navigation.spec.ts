// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file mobile-navigation.spec.ts
 * @input Production docsite HTML/CSS, with hydration held then released
 * @output Regression proof for initial navigation and its hydration handoff
 * @position Docsite browser tests; jsdom cannot measure the rendered icon
 */

import {expect, test} from '@playwright/test';

test('the mobile hamburger survives hydration without changing icon size or drawer ownership', async ({
  page,
}) => {
  await page.setViewportSize({width: 390, height: 844});
  let resumeHydration = () => {};
  const hydration = new Promise<void>(resolve => {
    resumeHydration = resolve;
  });
  await page.route('**/_next/**/*.js*', async route => {
    await hydration;
    await route.continue();
  });

  try {
    await page.goto('/components', {waitUntil: 'commit'});
    // First paint waits for the real render-blocking CSS, not for hydration.
    await page.waitForFunction(
      () => performance.getEntriesByName('first-contentful-paint').length > 0,
    );
    const nav = page.getByRole('navigation', {name: 'Astryx navigation'});
    const toggle = nav.getByRole('button', {name: 'Open navigation'});
    await expect(toggle).toHaveCount(1);
    await expect(toggle.locator('svg')).toBeVisible();
    const initialSize = await toggle.locator('svg').evaluate(svg => {
      const {width, height} = svg.getBoundingClientRect();
      return {width, height};
    });

    resumeHydration();
    // Wait for AppShell's automatic toggle on this same document.
    await expect(nav.getByTestId('mobile-nav-toggle')).toBeVisible();
    await expect(toggle).toHaveCount(1);
    await expect(toggle.locator('svg')).toBeVisible();
    const hydratedSize = await toggle.locator('svg').evaluate(svg => {
      const {width, height} = svg.getBoundingClientRect();
      return {width, height};
    });
    expect(initialSize).toEqual(hydratedSize);

    await toggle.click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toHaveCount(1);
    await expect(
      drawer.getByRole('link', {name: 'Docs', exact: true}),
    ).toBeVisible();
    await expect(
      drawer.getByRole('textbox', {name: 'Search components'}),
    ).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  } finally {
    resumeHydration();
  }
});

test('desktop navigation remains available at exactly 768px before hydration', async ({
  page,
}) => {
  await page.setViewportSize({width: 768, height: 844});
  await page.route('**/_next/**/*.js*', route => route.abort());
  await page.goto('/components', {waitUntil: 'load'});

  const nav = page.getByRole('navigation', {name: 'Astryx navigation'});
  await expect(nav.getByRole('button', {name: 'Open navigation'})).toBeHidden();
  await expect(
    nav.getByRole('link', {name: 'Components', exact: true}),
  ).toBeVisible();
  await expect(
    page.getByRole('textbox', {name: 'Search components'}),
  ).toBeVisible();
});

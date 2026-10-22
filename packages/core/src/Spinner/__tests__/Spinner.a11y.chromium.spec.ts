// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Spinner.a11y.chromium.spec.ts
 * @input The checked-in conditional Spinner story and Chromium
 * @output Browser evidence for shared-channel routing and the non-live named image
 * @position Spinner accessibility regression; does not prove screen-reader speech
 */

import {expect, test} from '@playwright/test';
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

test('a conditional Spinner uses the shared channel and keeps a named non-live ring', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-spinner--conditional-appearance&viewMode=story`,
  );
  const spinner = page.locator('.astryx-spinner');
  const channel = page.locator('[data-astryx-live-region="polite"]');
  await expect(spinner).toHaveCount(0);

  await page.getByRole('button', {name: 'Start loading', exact: true}).click();
  await expect(channel).toHaveCount(1);
  await expect(channel).toHaveText('Loading results');
  await expect(spinner.getByRole('img', {name: 'Loading results'})).toHaveCount(
    1,
  );
  await expect(
    spinner.getByText('Loading results', {exact: true}),
  ).toBeVisible();
  await expect(
    spinner.locator(
      '[role="status"], [role="alert"], [role="log"], [aria-live]',
    ),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', {name: 'Finish loading', exact: true}),
  ).toBeFocused();

  // The accessibility tree, unlike a jsdom name assertion, observes Chromium's
  // exposed role and name. Rich/visible labels stay outside the image subtree.
  await expect(spinner).toMatchAriaSnapshot(`
    - img "Loading results"
    - text: Loading results
  `);

  await page.getByRole('button', {name: 'Rerender', exact: true}).click();
  await expect(channel).toHaveCount(1);
  await page.getByRole('button', {name: 'Finish loading', exact: true}).click();
  await expect(spinner).toHaveCount(0);
  await expect(channel).toHaveText('');

  await page.getByRole('button', {name: 'Start loading', exact: true}).click();
  await expect(channel).toHaveText('Loading results');
  await expect(channel).toHaveCount(1);
});

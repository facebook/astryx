// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file EmptyStateAnnouncement.a11y.chromium.spec.ts
 * @input Uses the checked-in Selector empty-state stories in a built Storybook
 * @output Real-engine evidence that the live region carries the rendered
 *   empty-state words, and that the message itself is not a live region
 * @position Browser binding for `spec:AST-056` AR1. jsdom can prove the
 *   wiring; only a shipping engine can show the accessibility tree that
 *   results, which is what AST-020 reserves for this layer.
 *
 * `Listbox.a11y.states.ts` excludes "zero-result representation and
 * announcement timing" from the listbox pattern ledger, on the grounds that
 * it needs its own authority and evidence. AST-056 AR1 is that authority and
 * this file is that evidence; the ledger's own slice is untouched.
 */

import {expect, test} from '@playwright/test';
import {
  serveStorybook,
  DEFAULT_STORYBOOK_DIR,
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

const politeRegion = '[data-astryx-live-region="polite"]';

test('announces the words an element empty state renders', async ({page}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=a11y-selector-empty-state--element-empty-search-text&viewMode=story`,
    {waitUntil: 'load'},
  );
  await page.locator('[data-empty-scenario="element"]').waitFor();

  await page.getByRole('button', {name: 'Fruit'}).click();
  await page.getByRole('combobox').fill('zzzzz');

  // What the sighted user reads, and what the screen-reader user is told,
  // are the same sentence. The decorative arrow is in neither.
  await expect(page.locator(politeRegion)).toHaveText(
    'Nothing like that here. Add a fruit',
  );
});

test('leaves the rendered message out of the accessibility tree itself', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=a11y-selector-empty-state--element-empty-search-text&viewMode=story`,
    {waitUntil: 'load'},
  );
  await page.locator('[data-empty-scenario="element"]').waitFor();

  await page.getByRole('button', {name: 'Fruit'}).click();
  await page.getByRole('combobox').fill('zzzzz');

  const message = page.locator('.astryx-selector-empty-state');
  await expect(message).toBeVisible();
  // It stays presentational. Turning it into a live region would put a
  // non-option child inside role="listbox", which is the reason it was
  // marked this way in the first place.
  await expect(message).toHaveAttribute('role', 'presentation');
  await expect(message).not.toHaveAttribute('aria-live', /.*/);

  // And the listbox exposes no options to walk, rather than a fake one.
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(0);
});

test('stays silent while loading, then announces when the load lands empty', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=a11y-selector-empty-state--deferred-empty-result&viewMode=story`,
    {waitUntil: 'load'},
  );
  await page.locator('[data-empty-scenario="deferred"]').waitFor();

  await page.getByRole('button', {name: 'Fruit'}).click();
  await page.getByRole('combobox').fill('zzzzz');

  // The panel deliberately shows nothing while loading, so the one channel
  // the screen has gone quiet for stays quiet too.
  //
  // Asserted as "nothing has been announced" rather than "the region is
  // empty": `useAnnounce` creates its regions lazily on the first
  // announcement, so on a page that has not announced yet the element does
  // not exist at all. Both shapes are silence, and demanding the element
  // would fail on the quieter one.
  expect(
    await page.evaluate(
      selector => document.querySelector(selector)?.textContent ?? '',
      politeRegion,
    ),
  ).toBe('');

  // Land the results without touching anything outside the panel: an
  // outside click would light-dismiss it, and a closed panel announces
  // nothing because there is nothing on screen to announce.
  await page.evaluate(() =>
    (window as unknown as {__landResults?: () => void}).__landResults?.(),
  );
  // The outcome arrives after the keystroke, so only something watching the
  // rendered state can report it.
  await expect(page.locator(politeRegion)).toHaveText('Nothing like that here');
});

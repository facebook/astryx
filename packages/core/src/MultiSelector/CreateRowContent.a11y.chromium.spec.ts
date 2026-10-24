// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CreateRowContent.a11y.chromium.spec.ts
 * @input The `Core/MultiSelector` CreateRowContent story in a built
 *   Storybook (a create row whose `renderCreateOption` content is an
 *   `aria-hidden` swatch beside the row's label), real keyboard input, and
 *   Chromium's own accessibility tree read over the DevTools protocol.
 * @output Real-engine evidence for the create row's announcement channel
 *   (`spec:AST-009` FR4, FR19): the row is an `option` whose name Chromium
 *   computes from its content, and each query that matches nothing makes the
 *   polite live region show that name exactly once.
 * @position Run with `pnpm test:a11y-contract`; jsdom checks the region's final
 *   text but neither the browser's computed name nor how many updates a
 *   sequence of keystrokes produces.
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

/** Record every message the polite region shows, from now on. */
async function recordPoliteMessages(page: Page): Promise<void> {
  await page.evaluate(() => {
    const messages: string[] = [];
    let last = '';
    const read = () => {
      const text =
        document
          .querySelector('[data-astryx-live-region="polite"]')
          ?.textContent?.trim() ?? '';
      if (text !== last) {
        if (text !== '') {
          messages.push(text);
        }
        last = text;
      }
    };
    new MutationObserver(read).observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    (window as unknown as {politeMessages: string[]}).politeMessages = messages;
  });
}

async function politeMessages(page: Page): Promise<string[]> {
  return page.evaluate(() => [
    ...(window as unknown as {politeMessages: string[]}).politeMessages,
  ]);
}

/** The names Chromium's accessibility tree gives every `option`. */
async function optionNames(page: Page): Promise<string[]> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Accessibility.enable');
  const {nodes} = await cdp.send('Accessibility.getFullAXTree');
  await cdp.detach();
  return nodes
    .filter(node => node.role?.value === 'option' && !node.ignored)
    .map(node => String(node.name?.value ?? ''));
}

test('a create row with caller content is an option named by its content, and each query that matches nothing announces that name once', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--create-row-content&viewMode=story`,
  );
  const search = page.getByRole('combobox');
  await expect(search).toBeFocused();
  await recordPoliteMessages(page);

  // Nothing matches "X", "Xy" or "Xyz", so the create row is the whole
  // result after every keystroke.
  for (const query of ['X', 'Xy', 'Xyz']) {
    await search.press(query.slice(-1));
    await expect(page.getByRole('option')).toHaveText([`Create "${query}"`]);
    await expect
      .poll(async () => (await politeMessages(page)).at(-1))
      .toBe(`Create "${query}"`);
  }

  // The aria-hidden swatch is left out of the name Chromium computes, and the
  // region said exactly that name, once per keystroke.
  expect(await optionNames(page)).toEqual(['Create "Xyz"']);
  expect(await politeMessages(page)).toEqual([
    'Create "X"',
    'Create "Xy"',
    'Create "Xyz"',
  ]);
});

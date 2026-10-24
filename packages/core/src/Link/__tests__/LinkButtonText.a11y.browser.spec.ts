// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LinkButtonText.a11y.browser.spec.ts
 * @input The built Storybook's Core/Link "Button Fallback In Styled Text" story
 * @output Real-browser evidence that a Link without href renders its text like
 *   a Link with one
 * @position Link integration proof. A Link without href renders a <button>,
 *   and a browser's stylesheet sets letter-spacing, word-spacing,
 *   text-transform and text-shadow on a <button>; only a shipping engine
 *   computes what its text then inherits.
 */

import {expect, test} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const STORY = 'core-link--button-fallback-in-styled-text';
const TEXT_PROPERTIES = [
  'letterSpacing',
  'wordSpacing',
  'textTransform',
  'textShadow',
] as const;

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => storybook?.close());

test('a Link without href renders its text like a Link with one', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const anchor = page.locator('[data-styled-text-link="anchor"]');
  const button = page.locator('[data-styled-text-link="button"]');
  await expect(anchor).toHaveJSProperty('tagName', 'A');
  await expect(button).toHaveJSProperty('tagName', 'BUTTON');
  await page.evaluate(async () => document.fonts.ready);

  // The visible words are the Text span each link renders.
  const read = async (link: typeof anchor) =>
    link
      .locator('span')
      .first()
      .evaluate(
        (span, properties) => {
          const style = getComputedStyle(span);
          const text: Record<string, string> = {};
          for (const property of properties) {
            text[property] = style[property];
          }
          return {text, width: span.getBoundingClientRect().width};
        },
        [...TEXT_PROPERTIES],
      );
  const anchorWords = await read(anchor);
  const buttonWords = await read(button);

  // The story's styling reaches the anchor form.
  expect(anchorWords.text.textTransform).toBe('uppercase');
  expect(anchorWords.text.letterSpacing).not.toBe('normal');
  expect(buttonWords.text).toEqual(anchorWords.text);
  // The same words then take the same width.
  expect(Math.abs(buttonWords.width - anchorWords.width)).toBeLessThanOrEqual(
    0.5,
  );
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ResetPseudoElements.a11y.chromium.spec.ts
 * @input reset.css injected into a bare page in real Chromium
 * @output Browser evidence that the reset reaches ::before, ::after, ::placeholder and the search decoration
 * @position Reset integration proof; pseudo-elements are invalid inside :where(), so jsdom cannot show the drop
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {expect, test} from '@playwright/test';

const RESET_CSS = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../reset.css'),
  'utf8',
);

const PROBE_CSS = `
  #probe { display: inline-block; }
  #probe::before, #probe::after {
    content: '';
    display: block;
    width: 100px;
    padding: 10px;
    border-width: 5px;
  }
`;

test('::before and ::after take the box-model and border resets', async ({
  page,
}) => {
  await page.setContent(
    `<style>${RESET_CSS}${PROBE_CSS}</style><div id="probe"></div>`,
  );
  const result = await page.evaluate(() => {
    const el = document.getElementById('probe')!;
    const read = (pseudo: '::before' | '::after') => {
      const s = getComputedStyle(el, pseudo);
      return {boxSizing: s.boxSizing, borderTopStyle: s.borderTopStyle};
    };
    return {
      before: read('::before'),
      after: read('::after'),
      width: el.getBoundingClientRect().width,
    };
  });
  for (const pseudo of [result.before, result.after]) {
    expect(pseudo.boxSizing).toBe('border-box');
    expect(pseudo.borderTopStyle).toBe('solid');
  }
  // border-box keeps the 100px declared width; content-box would add padding.
  expect(result.width).toBe(100);
});

test('input and textarea placeholders take the reset color and opacity', async ({
  page,
}) => {
  await page.setContent(
    `<style>${RESET_CSS}</style><input id="i" placeholder="p"><textarea id="t" placeholder="p"></textarea>`,
  );
  for (const id of ['i', 't']) {
    const style = await page.evaluate(selector => {
      const s = getComputedStyle(
        document.querySelector(selector)!,
        '::placeholder',
      );
      return {color: s.color, opacity: s.opacity};
    }, `#${id}`);
    // var(--color-text-secondary) is unset here, so the #9ca3af fallback applies.
    expect(style).toEqual({color: 'rgb(156, 163, 175)', opacity: '1'});
  }
});

test('a focused type=search field renders no cancel button', async ({page}) => {
  // getComputedStyle reads `auto` for the cancel button either way, so compare
  // pixels against the same field with the button hidden by an explicit rule.
  const field = (id: string, extra: string) =>
    `<style>${RESET_CSS}${extra}</style><input id="${id}" type="search" value="query" style="width:200px;border:1px solid #000">`;
  const shoot = async (html: string, id: string) => {
    await page.setContent(html);
    await page.focus(`#${id}`);
    return page.locator(`#${id}`).screenshot();
  };
  const actual = await shoot(field('s', ''), 's');
  const hidden = await shoot(
    field(
      's',
      '#s::-webkit-search-cancel-button { -webkit-appearance: none; }',
    ),
    's',
  );
  expect(actual.equals(hidden)).toBe(true);
});

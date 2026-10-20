// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reset.letter-spacing.a11y.browser.spec.ts
 * @input packages/core/src/reset.css, alone on a blank page
 * @output Browser evidence that buttons, inputs and textareas inherit
 *   letter-spacing while a select keeps the browser's
 * @position reset.css integration proof. The browser's own stylesheet sets
 *   `letter-spacing: normal` on form controls, and only a shipping engine
 *   shows what they compute under the reset. A select is left out because
 *   Firefox does not widen it for letter-spacing, so a tracked label would
 *   be clipped.
 */

import * as fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {expect, test} from '@playwright/test';

const RESET_CSS = fs.readFileSync(
  fileURLToPath(new URL('./reset.css', import.meta.url)),
  'utf8',
);

async function letterSpacing(
  page: import('@playwright/test').Page,
  ids: string[],
): Promise<string[]> {
  return page.evaluate(
    elementIds =>
      elementIds.map(id => {
        const element = document.getElementById(id);
        if (!element) {
          throw new Error(`missing #${id}`);
        }
        return getComputedStyle(element).letterSpacing;
      }),
    ids,
  );
}

test.beforeEach(async ({page}) => {
  await page.setContent(`
    <div style="letter-spacing: 3px">
      <input id="input" value="text">
      <button id="button">Button</button>
      <textarea id="textarea">Text</textarea>
      <select id="select"><option id="option">All statuses</option></select>
      <select id="listbox" size="3">
        <optgroup id="optgroup" label="Group"><option>Option</option></optgroup>
      </select>
      <input id="tight" class="tight" value="own spacing">
    </div>
  `);
  await page.addStyleTag({content: RESET_CSS});
  await page.addStyleTag({content: '.tight { letter-spacing: -1px; }'});
});

test('buttons, inputs and textareas inherit their parent letter-spacing', async ({
  page,
}) => {
  expect(await letterSpacing(page, ['input', 'button', 'textarea'])).toEqual([
    '3px',
    '3px',
    '3px',
  ]);
});

test('a select and its options keep the browser letter-spacing', async ({
  page,
}) => {
  expect(
    await letterSpacing(page, ['select', 'option', 'listbox', 'optgroup']),
  ).toEqual(['normal', 'normal', 'normal', 'normal']);
});

test('a control that sets its own letter-spacing keeps it', async ({page}) => {
  await expect(page.locator('#tight')).toHaveCSS('letter-spacing', '-1px');
});

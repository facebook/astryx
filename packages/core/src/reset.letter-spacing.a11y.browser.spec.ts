// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reset.letter-spacing.a11y.browser.spec.ts
 * @input packages/core/src/reset.css, alone on a blank page
 * @output Browser evidence that form controls inherit letter-spacing
 * @position reset.css integration proof. The browser's own stylesheet sets
 *   `letter-spacing: normal` on form controls, and only a shipping engine
 *   shows what they compute under the reset.
 */

import * as fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {expect, test} from '@playwright/test';

const RESET_CSS = fs.readFileSync(
  fileURLToPath(new URL('./reset.css', import.meta.url)),
  'utf8',
);

const CONTROLS = ['input', 'button', 'select', 'optgroup', 'textarea'];

test.beforeEach(async ({page}) => {
  await page.setContent(`
    <div style="letter-spacing: 3px">
      <input id="input" value="text">
      <button id="button">Button</button>
      <select id="select" size="3">
        <optgroup id="optgroup" label="Group"><option>Option</option></optgroup>
      </select>
      <textarea id="textarea">Text</textarea>
      <input id="tight" class="tight" value="own spacing">
    </div>
  `);
  await page.addStyleTag({content: RESET_CSS});
  await page.addStyleTag({content: '.tight { letter-spacing: -1px; }'});
});

test('form controls inherit their parent letter-spacing', async ({page}) => {
  const spacing = await page.evaluate(
    ids =>
      ids.map(id => {
        const element = document.getElementById(id);
        if (!element) {
          throw new Error(`missing #${id}`);
        }
        return getComputedStyle(element).letterSpacing;
      }),
    CONTROLS,
  );
  expect(spacing).toEqual(CONTROLS.map(() => '3px'));
});

test('a control that sets its own letter-spacing keeps it', async ({page}) => {
  await expect(page.locator('#tight')).toHaveCSS('letter-spacing', '-1px');
});

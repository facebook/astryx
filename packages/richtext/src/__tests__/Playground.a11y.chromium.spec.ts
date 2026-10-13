// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground.a11y.chromium.spec.ts
 * @input The built Storybook's Lab/RichTextEditor "Playground" story.
 * @output Real-browser proof that the playground is ONE editor carrying every
 *   feature at once: the seeded document brings every block type, each
 *   readout reports that same editor, switching a feature on or off leaves a
 *   single live editor behind, and the toolbar's endContent slot reaches the
 *   editor through the composer context.
 *
 * The playground exists so features can be combined; a story that silently
 * lost its toolbar, its plugins, or its single-editor shape would still look
 * fine in a screenshot. This holds the shape.
 *
 * Run after building Storybook:
 *   pnpm storybook:build
 *   pnpm exec playwright test packages/richtext --project chromium
 */

import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const STORYBOOK_DIR = process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR;
const STORY = 'lab-richtexteditor--playground';

/** The one editable surface the whole page is about. */
const EDITOR = '[data-playground-editor] [role="textbox"]';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(STORYBOOK_DIR);
});

test.afterAll(async () => {
  await storybook?.close();
});

async function openStory(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('404')) {
      errors.push(message.text());
    }
  });
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story&globals=astryxTheme:neutral;colorMode:light;direction:ltr`,
    {waitUntil: 'load'},
  );
  await expect(page.locator(EDITOR)).toBeVisible();
  return errors;
}

const settings = (page: Page) => page.locator('[data-playground-settings]');

const toggle = (page: Page, label: string) =>
  settings(page).getByRole('switch', {name: label, exact: false}).first();

test('one editor holds the seeded document, with every block type in it', async ({
  page,
}) => {
  const errors = await openStory(page);
  // One editable surface on the page: the readouts beside it are read-only.
  await expect(
    page.locator('[role="textbox"][data-lexical-editor]'),
  ).toHaveCount(1);
  const editor = page.locator(EDITOR);
  await expect(editor.locator('h1')).toHaveCount(1);
  await expect(editor.locator('table')).toHaveCount(1);
  await expect(editor.locator('a')).not.toHaveCount(0);
  await expect(editor.locator('li')).not.toHaveCount(0);
  await expect(editor.locator('hr')).toHaveCount(1);
  // A task list draws real checkboxes, and a Markdown plugin node is adopted.
  await expect(
    page.locator('[data-playground-editor] input[type="checkbox"]'),
  ).not.toHaveCount(0);
  await expect(
    page.locator('[data-playground-editor] [data-markdown-extension]'),
  ).not.toHaveCount(0);
  expect(errors).toEqual([]);
});

test('every readout reports the editor beside it, and follows it as it is typed into', async ({
  page,
}) => {
  const errors = await openStory(page);
  const output = page.locator('[data-playground-output]');

  await page.getByRole('tab', {name: 'Markdown'}).click();
  await expect(output).toContainText('# Release notes');

  await page.getByRole('tab', {name: 'Node tree'}).click();
  await expect(output).toContainText('heading tag=h1');

  await page.getByRole('tab', {name: 'Editor state'}).click();
  await expect(output).toContainText('"root"');

  await page.getByRole('tab', {name: 'HTML'}).click();
  await expect(output).toContainText('<h1');

  await page.getByRole('tab', {name: 'RichTextView'}).click();
  await expect(output.locator('table')).toHaveCount(1);

  // Type into the one editor; the Markdown readout of that same editor moves.
  await page.getByRole('tab', {name: 'Markdown'}).click();
  await page.locator(EDITOR).click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type(' A sentence typed by the spec.');
  await expect(output).toContainText('A sentence typed by the spec.');
  expect(errors).toEqual([]);
});

test('switching a feature leaves one live editor behind', async ({page}) => {
  const errors = await openStory(page);
  for (const label of [
    'Toolbar',
    'Toolbar',
    'Autolink',
    'Autolink',
    'Markdown plugins',
    'Markdown plugins',
    'Restricted transformers',
    'Restricted transformers',
    'Character limit',
  ]) {
    await toggle(page, label).click();
    await expect(page.locator(EDITOR)).toBeVisible();
  }
  // The character counter belongs to the editor that is still mounted.
  await expect(page.locator('[data-playground-editor]')).toContainText('/500');

  // Read-only keeps the content reachable but stops the editing.
  await toggle(page, 'Read-only').click();
  await expect(page.locator(EDITOR)).toHaveAttribute(
    'contenteditable',
    'false',
  );
  await toggle(page, 'Read-only').click();
  await expect(page.locator(EDITOR)).toHaveAttribute('contenteditable', 'true');
  expect(errors).toEqual([]);
});

test("the toolbar's endContent slot reaches the editor", async ({page}) => {
  const errors = await openStory(page);
  const editor = page.locator(EDITOR);
  const tables = await editor.locator('table').count();
  await editor.click();
  await page.getByRole('button', {name: 'Table', exact: true}).click();
  await expect(editor.locator('table')).toHaveCount(tables + 1);
  expect(errors).toEqual([]);
});

// The repository's Storybook audit runs axe with these exemptions; a story
// renders inside the preview iframe, not as a whole page.
const AXE_DISABLED_RULES = [
  'html-has-lang',
  'document-title',
  'landmark-one-main',
  'page-has-heading-one',
  'region',
];

test('the story has no axe violations', async ({page}) => {
  const errors = await openStory(page);
  const results = await new AxeBuilder({page})
    .disableRules(AXE_DISABLED_RULES)
    .analyze();
  expect(
    results.violations.map(violation => [
      violation.id,
      violation.nodes.map(node => node.target.join(' ')),
    ]),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

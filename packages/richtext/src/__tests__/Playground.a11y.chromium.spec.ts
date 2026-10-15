// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground.a11y.chromium.spec.ts
 * @input The built Storybook's RichText/RichTextEditor "Playground" story.
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
const STORY = 'richtext-richtexteditor--playground';

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

  // A header ROW and no header column, in every table the editor holds. GFM
  // has no header column, so a table carrying one is dropped by the
  // playground's own Markdown readout and reads as a round-trip bug no real
  // document can produce — which is what Lexical's `includeHeaders: true`
  // would make here. Asserted across all tables rather than on the one just
  // inserted: the insert lands wherever the caret is, so position is not a
  // reliable handle on it. `:first-of-type`, not `:first-child` — Lexical's
  // table opens with a `<colgroup>` and puts the rows directly in `<table>`,
  // so no `tr` is ever a first child.
  await expect(editor.locator('table tr:first-of-type th')).not.toHaveCount(0);
  await expect(editor.locator('table tr:not(:first-of-type) th')).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});

test("the endContent controls disable with the editor, like the toolbar's own", async ({
  page,
}) => {
  const errors = await openStory(page);
  const editor = page.locator(EDITOR);
  const inserts = ['Table', 'Rule', 'Mention', 'Image'].map(name =>
    page.getByRole('button', {name, exact: true}),
  );
  const bold = page.getByRole('button', {name: 'Bold', exact: true});
  for (const state of ['Read-only', 'Disabled']) {
    await toggle(page, state).click();
    await expect(editor).toHaveAttribute('contenteditable', 'false');
    // The toolbar's own controls are the reference this matches.
    await expect(bold).toBeDisabled();
    for (const insert of inserts) {
      await expect(insert, `${state}: insert control`).toBeDisabled();
    }
    // A forced click still changes nothing in a non-editable editor.
    const before = await editor.innerHTML();
    for (const insert of inserts) {
      await insert.click({force: true});
    }
    expect(await editor.innerHTML(), `${state}: editor content`).toBe(before);
    await toggle(page, state).click();
    await expect(editor).toHaveAttribute('contenteditable', 'true');
    for (const insert of inserts) {
      await expect(insert, `${state} off: insert control`).toBeEnabled();
    }
  }
  expect(errors).toEqual([]);
});

test('the shortcut table lists Cmd/Ctrl+K only while the toolbar registers it', async ({
  page,
}) => {
  const errors = await openStory(page);
  const linkShortcut = settings(page).getByText('Insert or edit a link');
  await expect(linkShortcut).toBeVisible();

  // The toolbar registers that key, and only while its link button is on.
  await toggle(page, 'Link button').click();
  await expect(linkShortcut).toHaveCount(0);
  await toggle(page, 'Link button').click();
  await expect(linkShortcut).toBeVisible();

  await toggle(page, 'Toolbar').click();
  await expect(linkShortcut).toHaveCount(0);

  // The rows that core and the always-on plugins answer stay listed.
  await expect(settings(page).getByText('Bold', {exact: true})).toBeVisible();
  await expect(settings(page).getByText('Undo', {exact: true})).toBeVisible();
  expect(errors).toEqual([]);
});

/**
 * Every Markdown shortcut the settings panel may promise, and what typing it
 * must produce. The panel's description is read from the DOM and checked
 * against this table, so a shortcut added to that sentence has to be proven
 * here before the suite passes — the sentence is the part that goes stale
 * (it once promised `- [ ] `, which `- ` turns into a plain bullet first, and
 * `|`, which never converts while typing at all).
 */
const MARKDOWN_SHORTCUTS: ReadonlyArray<{
  token: string;
  type: string;
  produces: string;
}> = [
  {token: '# ', type: '# a heading', produces: 'h1'},
  {token: '- ', type: '- an item', produces: 'li'},
  {token: '> ', type: '> a quote', produces: 'blockquote'},
  {token: '```', type: '```ts\nconst a = 1;', produces: 'code'},
];

test('every Markdown shortcut the panel promises actually fires', async ({
  page,
}) => {
  const errors = await openStory(page);
  const description =
    (await settings(page)
      .getByText(/^Typing /)
      .textContent()) ?? '';

  // The sentence promises exactly the shortcuts this test proves.
  const promised = [...description.matchAll(/'([^']+)'/g)].map(
    match => match[1],
  );
  expect(promised).toEqual(MARKDOWN_SHORTCUTS.map(shortcut => shortcut.token));

  const editor = page.locator(EDITOR);
  for (const {type, produces} of MARKDOWN_SHORTCUTS) {
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    await editor.click();
    await page.keyboard.type(type);
    await expect(
      editor.locator(produces),
      `typing ${JSON.stringify(type)} should produce <${produces}>`,
    ).not.toHaveCount(0);
  }
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

/* ------------------------------------------------------------------ *
 * The image plugin
 * ------------------------------------------------------------------ */

/** The image the editor holds, as the plugin draws it. */
const IMAGE = '[data-playground-editor] [data-playground-image] img';

/** Inserts the dialog's default sample image into the one editor. */
async function insertSampleImage(page: Page): Promise<void> {
  await page.locator(EDITOR).click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.getByRole('button', {name: 'Image', exact: true}).click();
  // The dialog opens on its sample source, so this is one click away.
  await expect(page.getByRole('heading', {name: 'Insert image'})).toBeVisible();
  await page.getByRole('button', {name: 'Insert image', exact: true}).click();
  await expect(page.locator(IMAGE)).toHaveCount(1);
}

/** The image's rendered width, which is what a resize moves. */
async function imageWidth(page: Page): Promise<number> {
  const box = await page.locator(IMAGE).boundingBox();
  return box?.width ?? 0;
}

test('the image plugin inserts an image through the editor nodes prop', async ({
  page,
}) => {
  const errors = await openStory(page);
  await insertSampleImage(page);

  // The alt text the sample carries reaches the DOM, so the picture is not
  // silent to a screen reader.
  await expect(page.locator(IMAGE)).toHaveAttribute(
    'alt',
    /illustration of layered hills/,
  );
  // One editor still, with the image inside the editable surface.
  await expect(
    page.locator('[role="textbox"][data-lexical-editor]'),
  ).toHaveCount(1);
  await expect(page.locator('[data-playground-stats]')).toContainText(
    '1 image',
  );
  expect(errors).toEqual([]);
});

test('a selected image resizes by its handle and by its controls, and removes itself', async ({
  page,
}) => {
  const errors = await openStory(page);
  await insertSampleImage(page);
  const image = page.locator(IMAGE);
  // The width the image draws at before anything resizes it, which is what
  // "Reset size" must restore.
  const natural = await imageWidth(page);

  // Nothing is offered until the image is selected: the controls and the
  // resize handle belong to a selected image, like Lexical's own.
  await expect(page.locator('[data-playground-image-actions]')).toHaveCount(0);
  await image.click();
  await expect(page.locator('[data-playground-image-actions]')).toHaveCount(1);

  const started = await imageWidth(page);
  await page.getByRole('button', {name: 'Larger', exact: true}).click();
  await expect
    .poll(() => imageWidth(page), {message: 'Larger widens the image'})
    .toBeGreaterThan(started + 1);

  const widened = await imageWidth(page);
  await page.getByRole('button', {name: 'Smaller', exact: true}).click();
  await expect
    .poll(() => imageWidth(page), {message: 'Smaller narrows the image'})
    .toBeLessThan(widened - 1);

  // Dragging the handle resizes too, and commits the width to the node: the
  // editor state carries it after the pointer is lifted.
  const handle = page.locator('[data-playground-image-handle]');
  const box = await handle.boundingBox();
  const before = await imageWidth(page);
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 80, box!.y, {steps: 8});
  await page.mouse.up();
  await expect
    .poll(() => imageWidth(page), {message: 'the handle widens the image'})
    .toBeGreaterThan(before + 40);

  await page.getByRole('tab', {name: 'Editor state'}).click();
  await expect(page.locator('[data-playground-output]')).toContainText(
    /"width":\s*\d+/,
  );

  // Reset size puts the image back to the width it drew at when it arrived.
  await page.getByRole('button', {name: 'Reset size', exact: true}).click();
  await expect
    .poll(() => imageWidth(page), {message: 'Reset size restores the image'})
    .toBeCloseTo(natural, 0);

  await page.getByRole('button', {name: 'Remove image', exact: true}).click();
  await expect(page.locator(IMAGE)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Enter opens a selected image's controls, and Escape leaves them", async ({
  page,
}) => {
  const errors = await openStory(page);
  await insertSampleImage(page);
  await page.locator(IMAGE).click();

  // Tab indents inside the editor, so Enter is the keyboard route into the
  // controls of the selected image — without it they are mouse-only.
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', {name: 'Smaller', exact: true}),
  ).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator(EDITOR)).toBeFocused();
  expect(errors).toEqual([]);
});

test('an image reaches the state, the HTML and RichTextView, and says why it is not in the Markdown', async ({
  page,
}) => {
  const errors = await openStory(page);
  await insertSampleImage(page);
  const output = page.locator('[data-playground-output]');

  await page.getByRole('tab', {name: 'Editor state'}).click();
  await expect(output).toContainText('"playground-image"');

  await page.getByRole('tab', {name: 'Node tree'}).click();
  await expect(output).toContainText('playground-image alt=');

  await page.getByRole('tab', {name: 'HTML'}).click();
  await expect(output).toContainText('<img');

  await page.getByRole('tab', {name: 'RichTextView'}).click();
  await expect(output.locator('img')).toHaveCount(1);

  // The Markdown readout does NOT carry the image, because RichText's default
  // transformer array is internal and `transformers` replaces it whole. A
  // readout that silently dropped content would read as a bug, so the
  // playground says so where the content is missing.
  await page.getByRole('tab', {name: 'Markdown'}).click();
  await expect(output).not.toContainText('![');
  await expect(output).toContainText('missing from this Markdown');
  expect(errors).toEqual([]);
});

test('turning the image node off takes the document back through Markdown', async ({
  page,
}) => {
  const errors = await openStory(page);
  await insertSampleImage(page);
  await expect(page.locator(IMAGE)).toHaveCount(1);

  // `nodes` is read at construction, so the switch rebuilds the editor. State
  // holding an image cannot be parsed without the node registered, so the
  // document round-trips through Markdown — and the image does not survive.
  await toggle(page, 'Images').click();
  await expect(page.locator(EDITOR)).toBeVisible();
  await expect(page.locator(IMAGE)).toHaveCount(0);
  await expect(
    page.getByRole('button', {name: 'Image', exact: true}),
  ).toHaveCount(0);
  // The document itself is still here.
  await expect(page.locator(`${EDITOR} table`)).toHaveCount(1);

  await toggle(page, 'Images').click();
  await expect(
    page.getByRole('button', {name: 'Image', exact: true}),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

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

test('the story has no axe violations with a selected image in it', async ({
  page,
}) => {
  const errors = await openStory(page);
  await insertSampleImage(page);
  await page.locator(IMAGE).click();
  await expect(page.locator('[data-playground-image-actions]')).toHaveCount(1);
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

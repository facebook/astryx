// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MarkdownPlugins.a11y.chromium.spec.ts
 * @input The built Storybook's Lab/RichTextEditor "Markdown plugins" story.
 * @output Real-browser proof for spec:AST-064 FR7 and FR8: a plugin node
 *   renders the same DOM and accessibility in core Markdown, RichTextView, and
 *   RichTextEditor, and the editor moves over, selects, deletes, restores,
 *   copies, and pastes it as one unit.
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
const STORY = 'lab-richtexteditor--markdown-plugins';

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
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: storybook.origin,
  });
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story&globals=astryxTheme:neutral;colorMode:light;direction:ltr`,
    {waitUntil: 'load'},
  );
  await expect(
    page.locator('[data-plugin-surface="editor"] [data-mention="ada"]'),
  ).toBeVisible();
  return errors;
}

const surface = (page: Page, name: string) =>
  page.locator(`[data-plugin-surface="${name}"]`);

async function markdownOutput(page: Page): Promise<string> {
  await page.getByRole('button', {name: 'Show Markdown'}).click();
  return (await page.locator('[data-markdown-output]').textContent()) ?? '';
}

test('a plugin node renders the same DOM and accessibility in Markdown, the view, and the editor', async ({
  page,
}) => {
  const errors = await openStory(page);
  const html = async (name: string, selector: string) =>
    surface(page, name)
      .locator(selector)
      .first()
      .evaluate(element => element.outerHTML);
  for (const selector of [
    '[data-mention="ada"]',
    '[data-mention="grace"]',
    '[data-note]',
  ]) {
    const expected = await html('markdown', selector);
    expect(await html('view', selector), selector).toBe(expected);
    expect(await html('editor', selector), selector).toBe(expected);
  }
  for (const name of ['markdown', 'view', 'editor']) {
    // A node inside emphasis is drawn inside an emphasis element.
    await expect(
      surface(page, name).locator('em [data-mention="linus"]'),
    ).toHaveCount(1);
    await expect(
      surface(page, name).getByRole('link', {name: '@ada'}),
    ).toHaveAttribute('href', '#people/ada');
    await expect(
      surface(page, name).getByRole('note', {name: 'Note'}),
    ).toHaveText('Ship on Thursday');
  }
  // The node adds no tab stop of its own beyond the plugin's link.
  const decorators = surface(page, 'editor').locator(
    '[data-lexical-decorator="true"]',
  );
  for (const tabIndex of await decorators.evaluateAll(elements =>
    elements.map(element => element.getAttribute('tabindex')),
  )) {
    expect(tabIndex).toBeNull();
  }
  expect(errors).toEqual([]);
});

/**
 * Puts the caret `steps` arrow presses from the start of the editor's first
 * line, extending the selection when `extend` is set.
 */
async function caretAt(
  page: Page,
  steps: number,
  extend = false,
): Promise<void> {
  await surface(page, 'editor')
    .locator('[contenteditable="true"]')
    .getByText('Ping', {exact: false})
    .first()
    .click();
  await page.keyboard.press('Home');
  for (let index = 0; index < steps; index++) {
    await page.keyboard.press(extend ? 'Shift+ArrowRight' : 'ArrowRight');
  }
}

/**
 * Waits until the editor's own selection holds `text`. The editor formats and
 * copies its selection, which follows the browser's a moment after each key.
 */
async function expectEditorSelection(page: Page, text: string): Promise<void> {
  await expect
    .poll(() =>
      surface(page, 'editor')
        .locator('[contenteditable="true"]')
        .evaluate(root => {
          const editor = (
            root as HTMLElement & {
              __lexicalEditor?: {
                getEditorState(): {
                  read<T>(fn: () => T): T;
                  _selection: {getTextContent(): string} | null;
                };
              };
            }
          ).__lexicalEditor;
          const state = editor?.getEditorState();
          return state?.read(() => state._selection?.getTextContent());
        }),
    )
    .toBe(text);
}

test('the editor moves over, deletes, and restores a plugin node as one unit', async ({
  page,
}) => {
  const errors = await openStory(page);
  const mention = surface(page, 'editor').locator('[data-mention="ada"]');
  // "Ping " is five steps; one more crosses the whole node.
  await caretAt(page, 6);
  await page.keyboard.type('X');
  expect(await markdownOutput(page)).toContain('Ping @{ada}X about');
  await caretAt(page, 7);
  // Backspace removes the X, then the whole node in one press.
  await page.keyboard.press('Backspace');
  await expect(mention).toHaveCount(1);
  await page.keyboard.press('Backspace');
  await expect(mention).toHaveCount(0);
  expect(await markdownOutput(page)).toContain('Ping  about');
  await surface(page, 'editor').locator('[contenteditable="true"]').focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(mention).toHaveCount(1);
  expect(await markdownOutput(page)).toContain('Ping @{ada} about');
  expect(errors).toEqual([]);
});

test('italic toggled on a range takes the plugin node in it along', async ({
  page,
}) => {
  const errors = await openStory(page);
  const mention = surface(page, 'editor').locator('[data-mention="ada"]');
  const italic = surface(page, 'editor').getByRole('button', {name: 'Italic'});
  // Select "Ping " and the node, then make them italic.
  await caretAt(page, 6, true);
  await expectEditorSelection(page, 'Ping @{ada}');
  await italic.click();
  await expect(
    surface(page, 'editor').locator('em [data-mention="ada"]'),
  ).toHaveCount(1);
  expect(await markdownOutput(page)).toContain('*Ping @{ada}* about');
  // And back.
  await caretAt(page, 6, true);
  await expectEditorSelection(page, 'Ping @{ada}');
  await italic.click();
  await expect(
    surface(page, 'editor').locator('em [data-mention="ada"]'),
  ).toHaveCount(0);
  await expect(mention).toHaveCount(1);
  expect(await markdownOutput(page)).toContain('Ping @{ada} about');
  expect(errors).toEqual([]);
});

test('bold toggled with only a plugin node selected toggles that node', async ({
  page,
}) => {
  const errors = await openStory(page);
  const bold = surface(page, 'editor').getByRole('button', {name: 'Bold'});
  const strongMention = surface(page, 'editor').locator(
    'strong [data-mention="ada"]',
  );
  // From just after the node, one step back selects the node alone.
  await caretAt(page, 6);
  await page.keyboard.press('Shift+ArrowLeft');
  await expectEditorSelection(page, '@{ada}');
  await bold.click();
  await expect(strongMention).toHaveCount(1);
  expect(await markdownOutput(page)).toContain('Ping **@{ada}** about');
  await caretAt(page, 6);
  await page.keyboard.press('Shift+ArrowLeft');
  await expectEditorSelection(page, '@{ada}');
  await bold.click();
  await expect(strongMention).toHaveCount(0);
  expect(await markdownOutput(page)).toContain('Ping @{ada} about');
  expect(errors).toEqual([]);
});

test('the toolbar shows the format of a plugin node selected alone', async ({
  page,
}) => {
  const errors = await openStory(page);
  const bold = surface(page, 'editor').getByRole('button', {name: 'Bold'});
  // From just after the node, one step back selects the node alone.
  await caretAt(page, 6);
  await page.keyboard.press('Shift+ArrowLeft');
  await expectEditorSelection(page, '@{ada}');
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await bold.click();
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  // The text around the node is not bold, and the node still is.
  await caretAt(page, 2);
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await caretAt(page, 6);
  await page.keyboard.press('Shift+ArrowLeft');
  await expectEditorSelection(page, '@{ada}');
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

/** How many nodes the editor's selection holds as a node selection; 0 else. */
function editorNodeSelectionSize(page: Page): Promise<number> {
  return surface(page, 'editor')
    .locator('[contenteditable="true"]')
    .evaluate(root => {
      const editor = (
        root as HTMLElement & {
          __lexicalEditor?: {
            getEditorState(): {_selection: {_nodes?: Set<string>} | null};
          };
        }
      ).__lexicalEditor;
      return editor?.getEditorState()._selection?._nodes?.size ?? 0;
    });
}

test('a click selects a plugin node whole, with the focus ring, to format or delete it', async ({
  page,
}) => {
  const errors = await openStory(page);
  const mention = surface(page, 'editor')
    .locator('[contenteditable="true"] [data-markdown-extension]')
    .first();
  await expect(mention).toHaveCSS('outline-style', 'none');
  await mention.click();
  await expect.poll(() => editorNodeSelectionSize(page)).toBe(1);
  await expectEditorSelection(page, '@{ada}');
  await expect(mention).not.toHaveCSS('outline-style', 'none');
  await page.keyboard.press('ControlOrMeta+b');
  expect(await markdownOutput(page)).toContain('Ping **@{ada}** about');
  // A click in the text takes the selection, and the ring, off the node.
  await caretAt(page, 2);
  await expect.poll(() => editorNodeSelectionSize(page)).toBe(0);
  await expect(mention).toHaveCSS('outline-style', 'none');
  await mention.click();
  await expect.poll(() => editorNodeSelectionSize(page)).toBe(1);
  await page.keyboard.press('Backspace');
  expect(await markdownOutput(page)).toContain('Ping  about');
  expect(errors).toEqual([]);
});

test('the toolbar shows the format of a plugin node selected with a click', async ({
  page,
}) => {
  const errors = await openStory(page);
  const bold = surface(page, 'editor').getByRole('button', {name: 'Bold'});
  const mention = surface(page, 'editor')
    .locator('[contenteditable="true"] [data-markdown-extension]')
    .first();
  // Bold text, with the caret in it.
  await surface(page, 'editor')
    .locator('[contenteditable="true"]')
    .getByText('Ping', {exact: false})
    .first()
    .click();
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.type('Z');
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  // A click on the plain node shows the node's own format.
  await mention.click();
  await expect.poll(() => editorNodeSelectionSize(page)).toBe(1);
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  // Bold then makes the node bold, and shows it.
  await bold.click();
  await expect(
    surface(page, 'editor').locator('strong [data-mention="ada"]'),
  ).toHaveCount(1);
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('a copied plugin node pastes whole, drawn where the plugin is given and as source where it is not', async ({
  page,
}) => {
  const errors = await openStory(page);
  // Select "Ping " and the node, then copy them.
  await caretAt(page, 6, true);
  await expectEditorSelection(page, 'Ping @{ada}');
  await page.keyboard.press('ControlOrMeta+c');
  for (const [name, drawn] of [
    ['paste-with', true],
    ['paste-without', false],
  ] as const) {
    await surface(page, name).locator('[contenteditable="true"]').click();
    await page.keyboard.press('ControlOrMeta+v');
    if (drawn) {
      await expect(
        surface(page, name).locator('[data-mention="ada"]'),
      ).toHaveCount(1);
    } else {
      await expect(
        surface(page, name).locator('[data-lexical-decorator="true"]'),
      ).toHaveText('@{ada}');
    }
  }
  expect(await markdownOutput(page)).toContain('---\nPing @{ada}');
  expect(errors).toEqual([]);
});

// The repository's Storybook audit runs axe with these exemptions; the same
// note on three surfaces must not make three identical landmarks.
const AXE_DISABLED_RULES = [
  'html-has-lang',
  'document-title',
  'landmark-one-main',
  'page-has-heading-one',
  'region',
];

test('the story has no axe violations, landmarks included', async ({page}) => {
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

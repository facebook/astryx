// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MarkdownParitySandbox.a11y.chromium.spec.ts
 * @input The RichTextEditor "Markdown parity" stories in a built Storybook
 * @output Real-Chromium proof that the parity sandbox works, plus screenshots
 *   and a geometry manifest of today's Markdown/RichText differences under
 *   test-results/richtext-markdown-parity/
 * @position Evidence for a Storybook diagnostic, not a parity contract. It
 *   asserts that the sandbox renders one fixture on both surfaces, keeps the
 *   source across a read/edit/read switch, follows direction and phone widths,
 *   fills in its measurements, logs no console errors, and has no axe
 *   violations. Every Markdown/RichText difference is recorded; none is
 *   asserted.
 *
 * Build the Storybook first:
 *
 *   pnpm storybook:build
 *   pnpm exec playwright test MarkdownParitySandbox.a11y.chromium.spec.ts
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve('test-results/richtext-markdown-parity');

const STORY = {
  sideBySide: 'lab-richtexteditor--markdown-parity',
  toggle: 'lab-richtexteditor--markdown-parity-toggle',
  overlay: 'lab-richtexteditor--markdown-parity-overlay',
  longDocument: 'lab-richtexteditor--markdown-parity-long-document',
} as const;

/** The exemptions the repository's Storybook axe audit already makes. */
const AXE_DISABLED_RULES = [
  'html-has-lang',
  'document-title',
  'landmark-one-main',
  'page-has-heading-one',
  'region',
];

const DESKTOP = {width: 1440, height: 900} as const;
const PHONE = {width: 390, height: 844} as const;

type Viewport = typeof DESKTOP | typeof PHONE;

interface BlockGeometry {
  readonly key: string;
  readonly copy: number;
  readonly tag: string;
  readonly direction: string;
  readonly top: number;
  readonly height: number;
  readonly width: number;
}

interface SurfaceGeometry {
  readonly height: number;
  readonly width: number;
  readonly direction: string;
  readonly blocks: readonly BlockGeometry[];
}

const STORYBOOK_DIR = process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR;

let storybook: StaticServer;
let browserVersion = '';

test.beforeAll(async ({browser}) => {
  // Not wiped: a worker restarted after a failure must keep earlier frames.
  fs.mkdirSync(OUTPUT, {recursive: true});
  browserVersion = browser.version();
  storybook = await serveStorybook(STORYBOOK_DIR);
});

test.afterAll(async () => {
  const captures = fs
    .readdirSync(OUTPUT)
    .filter(name => name.endsWith('.json') && name !== 'manifest.json')
    .sort()
    .map(name => JSON.parse(fs.readFileSync(path.join(OUTPUT, name), 'utf8')));
  fs.writeFileSync(
    path.join(OUTPUT, 'manifest.json'),
    `${JSON.stringify(
      {
        version: 1,
        headSha: process.env.ASTRYX_HEAD_SHA ?? null,
        // CI stamps the commit a Storybook artifact was built from.
        storybookSha: storybookStamp(),
        browser: browserVersion,
        captures,
      },
      null,
      2,
    )}\n`,
  );
  await storybook?.close();
});

function storybookStamp(): string | null {
  const stamp = path.join(STORYBOOK_DIR, 'astryx-build-sha.txt');
  return fs.existsSync(stamp) ? fs.readFileSync(stamp, 'utf8').trim() : null;
}

/** Opens a story and returns the console errors it logs from then on. */
async function openStory(
  page: Page,
  story: string,
  viewport: Viewport,
  globals = 'colorMode:light;direction:ltr',
): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', message => {
    const source = message.location().url;
    // Chromium asks the static server for /favicon.ico on its own, and a built
    // Storybook ships none; that 404 is not something the page did.
    if (message.type() === 'error' && !source.endsWith('/favicon.ico')) {
      errors.push(`${message.text()} (${source})`);
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });
  await page.setViewportSize(viewport);
  await page.goto(
    `${storybook.origin}/iframe.html?id=${story}&viewMode=story&globals=astryxTheme:neutral;${globals}`,
    {waitUntil: 'load'},
  );
  await page.locator('[data-parity-sandbox]').waitFor();
  await holdMotionStill(page);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return errors;
}

/** The toggle story's one control: pressed means the edit surface is up. */
const editMode = (page: Page) => page.getByRole('button', {name: 'Edit mode'});

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

/** The fixture's block keys, in order, from the sandbox's measurement rows. */
async function fixtureKeys(page: Page): Promise<string[]> {
  const keys = await page
    .locator('[data-parity-row]')
    .evaluateAll(rows =>
      rows.map(row => row.getAttribute('data-parity-row') ?? ''),
    );
  return keys.filter(key => key !== 'surface');
}

/**
 * Waits until a surface has painted the last block of the last copy: only a
 * fully rendered document gets that far.
 */
async function waitForDocument(page: Page, surface: string): Promise<void> {
  const keys = await fixtureKeys(page);
  const copies = await page
    .locator('[data-parity-sandbox]')
    .getAttribute('data-parity-copies');
  await page
    .locator(
      `${surface} [data-parity-block="${keys.at(-1)}"][data-parity-copy="${copies}"]`,
    )
    .waitFor();
  await settle(page);
}

async function surfaceGeometry(
  page: Page,
  surface: string,
): Promise<SurfaceGeometry> {
  return page.locator(`${surface} > [data-parity-body]`).evaluate(body => {
    const origin = body.getBoundingClientRect();
    const blocks = Array.from(
      body.querySelectorAll<HTMLElement>('[data-parity-block]'),
      element => {
        const rect = element.getBoundingClientRect();
        return {
          key: element.dataset.parityBlock ?? '',
          copy: Number(element.dataset.parityCopy),
          tag: element.tagName.toLowerCase(),
          direction: getComputedStyle(element).direction,
          top: rect.top - origin.top,
          height: rect.height,
          width: rect.width,
        };
      },
    );
    return {
      height: origin.height,
      width: origin.width,
      direction: getComputedStyle(body).direction,
      blocks,
    };
  });
}

const pairedKeys = (geometry: SurfaceGeometry): string[] =>
  geometry.blocks.filter(block => block.copy === 1).map(block => block.key);

async function axeViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({page})
    .include('#storybook-root')
    .disableRules(AXE_DISABLED_RULES)
    .analyze();
  return results.violations.map(
    violation =>
      `${violation.id}: ${violation.nodes
        .map(node => node.target.join(' '))
        .join(', ')}`,
  );
}

/** Banks a screenshot with its receipt; receipts are merged in afterAll. */
async function capture(
  page: Page,
  name: string,
  details: Record<string, unknown>,
  {fullPage = true}: {fullPage?: boolean} = {},
): Promise<void> {
  const file = `${name}.png`;
  const png = await page.screenshot({path: path.join(OUTPUT, file), fullPage});
  fs.writeFileSync(
    path.join(OUTPUT, `${name}.json`),
    `${JSON.stringify(
      {
        file,
        sha256: crypto.createHash('sha256').update(png).digest('hex'),
        ...details,
      },
      null,
      2,
    )}\n`,
  );
}

const MARKDOWN = '[data-parity-surface="markdown"]';
const RICH_TEXT = '[data-parity-surface="richtext"]';
const TOGGLE = '[data-parity-surface="toggle"]';

test('side by side: one fixture renders on both surfaces', async ({page}) => {
  const errors = await openStory(page, STORY.sideBySide, DESKTOP);
  await waitForDocument(page, MARKDOWN);
  await waitForDocument(page, RICH_TEXT);
  const keys = await fixtureKeys(page);
  const markdown = await surfaceGeometry(page, MARKDOWN);
  const richText = await surfaceGeometry(page, RICH_TEXT);

  // Markdown is the reference renderer: every fixture block pairs, in order.
  expect(pairedKeys(markdown)).toEqual(keys);
  // The editor loaded the whole document: its first and last blocks pair.
  const richTextKeys = pairedKeys(richText);
  expect(richTextKeys[0]).toBe(keys[0]);
  expect(richTextKeys.at(-1)).toBe(keys.at(-1));
  // The edit surface is a real editor with an accessible name.
  await expect(page.getByRole('textbox', {name: 'Document'})).toHaveCount(1);
  // The diagnostic table measured both surfaces.
  const surfaceRow = page.locator('[data-parity-row="surface"]');
  await expect(surfaceRow).toHaveAttribute('data-parity-left', /\d/);
  await expect(surfaceRow).toHaveAttribute('data-parity-right', /\d/);

  expect(await axeViolations(page)).toEqual([]);
  await capture(page, 'side-by-side--1440--light-ltr', {
    story: STORY.sideBySide,
    viewport: DESKTOP,
    globals: 'neutral light ltr',
    unpairedInRichText: keys.filter(key => !richTextKeys.includes(key)),
    markdown,
    richText,
  });
  expect(errors).toEqual([]);
});

for (const viewport of [DESKTOP, PHONE]) {
  for (const colorMode of ['light', 'dark'] as const) {
    test(`toggle keeps the source across read, edit, read (${viewport.width}px, ${colorMode})`, async ({
      page,
    }) => {
      const errors = await openStory(
        page,
        STORY.toggle,
        viewport,
        `colorMode:${colorMode};direction:ltr`,
      );
      const read = `${TOGGLE}[data-parity-mode="read"]`;
      const edit = `${TOGGLE}[data-parity-mode="edit"]`;
      const name = `toggle--${viewport.width}--${colorMode}`;

      await waitForDocument(page, read);
      const readText = await page
        .locator(`${read} > [data-parity-body]`)
        .innerText();
      const readGeometry = await surfaceGeometry(page, read);
      await capture(page, `${name}--read`, {
        story: STORY.toggle,
        viewport,
        globals: `neutral ${colorMode} ltr`,
        mode: 'read',
        geometry: readGeometry,
      });

      await editMode(page).click();
      await waitForDocument(page, edit);
      await expect(editMode(page)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('textbox', {name: 'Document'})).toHaveCount(
        1,
      );
      await expect(page.locator('[data-parity-row="surface"]')).toHaveAttribute(
        'data-parity-right',
        /\d/,
      );
      const anchor = await page
        .locator('[data-parity-anchor]')
        .evaluate(element => ({...(element as HTMLElement).dataset}));
      expect(await axeViolations(page)).toEqual([]);
      await capture(page, `${name}--edit`, {
        story: STORY.toggle,
        viewport,
        globals: `neutral ${colorMode} ltr`,
        mode: 'edit',
        anchor,
        geometry: await surfaceGeometry(page, edit),
      });

      // Back to read with the keyboard: the control is reachable without a pointer.
      await editMode(page).focus();
      await page.keyboard.press('Enter');
      await waitForDocument(page, read);
      await expect(editMode(page)).toHaveAttribute('aria-pressed', 'false');
      // Read mode re-renders the source as authored: same text, same layout.
      expect(
        await page.locator(`${read} > [data-parity-body]`).innerText(),
      ).toBe(readText);
      expect((await surfaceGeometry(page, read)).height).toBe(
        readGeometry.height,
      );
      expect(errors).toEqual([]);
    });
  }
}

for (const [viewport, colorMode] of [
  [PHONE, 'dark'],
  [DESKTOP, 'light'],
] as const) {
  test(`right-to-left reaches both surfaces (${viewport.width}px, ${colorMode})`, async ({
    page,
  }) => {
    const errors = await openStory(
      page,
      STORY.sideBySide,
      viewport,
      `colorMode:${colorMode};direction:rtl`,
    );
    await waitForDocument(page, MARKDOWN);
    await waitForDocument(page, RICH_TEXT);
    const markdown = await surfaceGeometry(page, MARKDOWN);
    const richText = await surfaceGeometry(page, RICH_TEXT);
    expect(markdown.direction).toBe('rtl');
    expect(richText.direction).toBe('rtl');
    if (viewport === PHONE) {
      // At a phone width the surfaces stack instead of squeezing side by side.
      const markdownBox = await page.locator(MARKDOWN).boundingBox();
      const richTextBox = await page.locator(RICH_TEXT).boundingBox();
      expect(richTextBox?.y ?? 0).toBeGreaterThanOrEqual(
        (markdownBox?.y ?? 0) + (markdownBox?.height ?? 0),
      );
    }

    expect(await axeViolations(page)).toEqual([]);
    await capture(page, `side-by-side--${viewport.width}--${colorMode}-rtl`, {
      story: STORY.sideBySide,
      viewport,
      globals: `neutral ${colorMode} rtl`,
      pageOverflowX: await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
      leftToRightBlocks: {
        markdown: markdown.blocks
          .filter(block => block.direction === 'ltr')
          .map(block => block.key),
        richText: richText.blocks
          .filter(block => block.direction === 'ltr')
          .map(block => block.key),
      },
      markdown,
      richText,
    });
    expect(errors).toEqual([]);
  });
}

test('overlay: both layers start together and the drawn editor is inert', async ({
  page,
}) => {
  const errors = await openStory(page, STORY.overlay, DESKTOP);
  await waitForDocument(page, MARKDOWN);
  await waitForDocument(page, RICH_TEXT);
  const base = await page
    .locator(`${MARKDOWN} > [data-parity-body]`)
    .boundingBox();
  const layer = await page
    .locator(`${RICH_TEXT} > [data-parity-body]`)
    .boundingBox();
  expect(layer?.x).toBe(base?.x);
  expect(layer?.y).toBe(base?.y);
  await expect(page.locator(RICH_TEXT)).toHaveAttribute('inert', '');
  // An inert editor refuses focus, so neither keyboard nor pointer reach it.
  const focusable = await page
    .locator(`${RICH_TEXT} [contenteditable]`)
    .evaluate(editor => {
      (editor as HTMLElement).focus();
      return document.activeElement === editor;
    });
  expect(focusable).toBe(false);

  expect(await axeViolations(page)).toEqual([]);
  await capture(page, 'overlay--1440--light-ltr', {
    story: STORY.overlay,
    viewport: DESKTOP,
    globals: 'neutral light ltr',
  });
  expect(errors).toEqual([]);
});

test('long document: the block at the top of the view is followed across a switch', async ({
  page,
}) => {
  const errors = await openStory(page, STORY.longDocument, DESKTOP);
  await waitForDocument(page, `${TOGGLE}[data-parity-mode="read"]`);
  const keys = await fixtureKeys(page);
  await page.evaluate(() =>
    window.scrollTo(
      0,
      (document.documentElement.scrollHeight - window.innerHeight) / 2,
    ),
  );
  await settle(page);
  await capture(
    page,
    'long-document--1440--read-scrolled',
    {story: STORY.longDocument, viewport: DESKTOP, mode: 'read'},
    {fullPage: false},
  );

  await editMode(page).click();
  await waitForDocument(page, `${TOGGLE}[data-parity-mode="edit"]`);
  const readout = page.locator(
    '[data-parity-anchor]:not([data-parity-anchor=""])',
  );
  await readout.waitFor();
  const anchor = await readout.evaluate(element => ({
    ...(element as HTMLElement).dataset,
  }));
  expect(keys).toContain(anchor.parityAnchor);
  // Halfway down a twelve-copy document, the anchor is past the first copy.
  expect(Number(anchor.parityAnchorCopy)).toBeGreaterThan(1);
  await capture(
    page,
    'long-document--1440--edit-after-switch',
    {story: STORY.longDocument, viewport: DESKTOP, mode: 'edit', anchor},
    {fullPage: false},
  );
  expect(errors).toEqual([]);
});

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

type Viewport = {readonly width: number; readonly height: number};

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

// A table must stay inside its own wrapper in the editor and the view, however
// the host lays them out. Grid and flex items default to their content's
// min-content width, so a wrapper that reports its table's width widens the
// page; a shrink-to-fit host (a chat bubble, an inline-block) must still give
// a small table its natural width. The Markdown Serializers story renders the
// editor and the view; each case restyles the story's layout into one host.
// `surfaces` names which of the story's two surfaces stay in the host: a flex
// row holds one at a time, because the editor's toolbar has its own minimum
// width that has nothing to do with tables.
const TABLE_HOSTS = {
  grid: {
    layout: 'display:grid;gap:24px;max-width:720px',
    view: '',
    surfaces: 'both',
  },
  'flex row with the editor': {
    layout: 'display:flex;flex-direction:row;max-width:720px',
    view: '',
    surfaces: 'editor',
  },
  'flex row with the view': {
    layout: 'display:flex;flex-direction:row;max-width:720px',
    view: '',
    surfaces: 'view',
  },
  'fit-content bubble': {
    layout: 'display:block;max-width:720px',
    view: 'width:fit-content;max-width:100%',
    surfaces: 'both',
  },
  'inline-block': {
    layout: 'display:block;max-width:720px',
    view: 'display:inline-block;width:auto;max-width:100%;vertical-align:top',
    surfaces: 'both',
  },
} as const;

const tableSource = (columnCount: number) => {
  const columns = Array.from(
    {length: columnCount},
    (_, index) => `Column ${index + 1}`,
  );
  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    `| ${columns.map((_, index) => `value-${index + 1}`).join(' | ')} |`,
  ].join('\n');
};

// spec:AST-061 FR3: a rule at the start or end of a document adds no margin
// at that edge, like every other block, in the editor and the view.
test('a rule at either edge of the document adds no outer margin', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(
    `${storybook.origin}/iframe.html?id=lab-richtexteditor--markdown-serializers&viewMode=story&globals=astryxTheme:neutral;colorMode:light;direction:ltr`,
    {waitUntil: 'load'},
  );
  await page.locator('textarea').fill('---\n\nBetween the rules.\n\n---');
  await expect(page.locator('hr:visible')).toHaveCount(4);
  const margins = await page.evaluate(() =>
    [...document.querySelectorAll('[data-lexical-editor]')]
      .filter(root => root.querySelector('hr') != null)
      .map(root => {
        const rules = root.querySelectorAll('hr');
        const first = getComputedStyle(rules[0]);
        const last = getComputedStyle(rules[rules.length - 1]);
        return [
          first.marginTop,
          first.marginBottom,
          last.marginTop,
          last.marginBottom,
        ];
      }),
  );
  // Editor and view: no margin at the outer edges, the full 24px inside.
  expect(margins).toEqual([
    ['0px', '24px', '24px', '0px'],
    ['0px', '24px', '24px', '0px'],
  ]);
});

// spec:AST-061 FR8: a fenced code block has the same frame and header on
// both surfaces, so the code sits at the same place; the header is not part
// of the editable text.
/**
 * Whether core Markdown scrolls a fence's lines sideways. RichText wraps them
 * instead (a scrolling region inside the editable text cannot take focus), so
 * a fence whose lines do not fit is taller in RichText by its wrapped lines.
 */
async function markdownFenceScrolls(page: Page, key: string): Promise<boolean> {
  return page.evaluate(
    ({surface, block}) =>
      [
        ...document.querySelectorAll<HTMLElement>(
          `${surface} [data-parity-block="${block}"] *`,
        ),
      ].some(element => element.scrollWidth > element.clientWidth + 1),
    {surface: MARKDOWN, block: key},
  );
}

for (const viewport of [PHONE, DESKTOP, {width: 2200, height: 900}] as const) {
  test(`side by side: a fenced code block has core Markdown's frame and header (${viewport.width}px)`, async ({
    page,
  }) => {
    const errors = await openStory(page, STORY.sideBySide, viewport);
    await waitForDocument(page, MARKDOWN);
    await waitForDocument(page, RICH_TEXT);
    const markdown = await surfaceGeometry(page, MARKDOWN);
    const richText = await surfaceGeometry(page, RICH_TEXT);
    const code = (geometry: SurfaceGeometry) =>
      geometry.blocks.find(block => block.key === 'code-fence');
    if (!(await markdownFenceScrolls(page, 'code-fence'))) {
      expect(
        Math.abs((code(richText)?.height ?? 0) - (code(markdown)?.height ?? 0)),
      ).toBeLessThanOrEqual(2);
    }
    // Each frame is sized like core Markdown's: as wide as its longest line,
    // at least the 680px measure (or the whole width when narrower), and no
    // wider than the surface. Each surface is measured against its own width.
    const frames = await page.evaluate(
      ({markdownSurface, richTextSurface, keys}) =>
        keys.map(key => {
          const markdownBlock = document.querySelector<HTMLElement>(
            `${markdownSurface} [data-parity-block="${key}"]`,
          );
          const markdownFrame = [
            markdownBlock,
            ...(markdownBlock?.querySelectorAll<HTMLElement>('*') ?? []),
          ].find(element => {
            const style = element == null ? null : getComputedStyle(element);
            return (
              style != null &&
              style.borderTopStyle !== 'none' &&
              parseFloat(style.borderTopWidth) > 0
            );
          });
          const richTextFrame = document.querySelector<HTMLElement>(
            `${richTextSurface} [data-parity-block="${key}"]`,
          );
          const editable = richTextFrame?.parentElement;
          const editableStyle =
            editable == null ? null : getComputedStyle(editable);
          return {
            key,
            markdown: markdownFrame?.getBoundingClientRect().width ?? 0,
            markdownRoom: markdownBlock?.getBoundingClientRect().width ?? 0,
            richText: richTextFrame?.getBoundingClientRect().width ?? 0,
            richTextRoom:
              editable == null || editableStyle == null
                ? 0
                : editable.clientWidth -
                  parseFloat(editableStyle.paddingLeft) -
                  parseFloat(editableStyle.paddingRight),
          };
        }),
      {
        markdownSurface: MARKDOWN,
        richTextSurface: RICH_TEXT,
        keys: ['code-fence', 'code-plain', 'code-unknown', 'code-long'],
      },
    );
    for (const frame of frames) {
      if (frame.key === 'code-long') {
        // A long line widens the frame past the measure, up to the room.
        const markdownWide = Math.min(frame.markdownRoom, frame.markdown);
        expect(frame.markdown, frame.key).toBeGreaterThan(
          Math.min(680, frame.markdownRoom) - 1,
        );
        expect(frame.richText, frame.key).toBeLessThanOrEqual(
          frame.richTextRoom + 1,
        );
        if (frame.markdown < frame.markdownRoom - 1) {
          // Room to spare on both surfaces: the same width as core's frame.
          expect(
            Math.abs(frame.richText - markdownWide),
            frame.key,
          ).toBeLessThanOrEqual(2);
        } else {
          // Both fill their surface and wrap.
          expect(
            Math.abs(frame.richText - frame.richTextRoom),
            frame.key,
          ).toBeLessThanOrEqual(1);
        }
      } else {
        // A short block is the measure wide, or the whole width if narrower.
        expect(
          Math.abs(frame.markdown - Math.min(680, frame.markdownRoom)),
          `${frame.key} markdown`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(frame.richText - Math.min(680, frame.richTextRoom)),
          `${frame.key} rich text`,
        ).toBeLessThanOrEqual(1);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
    // One header per fenced block; the first is the `ts` block's.
    await expect(
      page.locator(`${RICH_TEXT} [data-richtext-code-header]`),
    ).toHaveCount(6);
    const header = page
      .locator(`${RICH_TEXT} [data-richtext-code-header]`)
      .first();
    await expect(header).toContainText('ts');
    await expect(header.getByRole('button', {name: 'Copy code'})).toBeVisible();
    expect(
      await header.evaluate(element => element.closest('[contenteditable]')),
    ).toBeNull();
    // The header spans the block, inside its border.
    const widths = await page.evaluate(selector => {
      const block = document.querySelector(`${selector} code[data-language]`);
      const head = document.querySelector(
        `${selector} [data-richtext-code-header]`,
      );
      return [
        (block as HTMLElement | null)?.clientWidth,
        head?.getBoundingClientRect().width,
      ];
    }, RICH_TEXT);
    expect(widths[1]).toBe(widths[0]);
    expect(errors).toEqual([]);
  });
}

// A long unbroken line wraps inside the code frame at phone width instead of
// widening the page, and the copy button copies the block from the keyboard,
// in the editor and the view.
test('code blocks wrap long lines at phone width and copy from the keyboard', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize(PHONE);
  await page.goto(
    `${storybook.origin}/iframe.html?id=lab-richtexteditor--markdown-serializers&viewMode=story&globals=astryxTheme:neutral;colorMode:light;direction:ltr`,
    {waitUntil: 'load'},
  );
  const token = 'x'.repeat(160);
  await page
    .locator('textarea')
    .fill(`\`\`\`ts\nconst id = "${token}";\n\`\`\``);
  await expect(page.locator('[data-richtext-code-header]')).toHaveCount(2);
  const layout = await page.evaluate(() => ({
    pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    blocks: [...document.querySelectorAll('[data-lexical-editor] code')].map(
      code => code.scrollWidth - code.clientWidth,
    ),
  }));
  expect(layout.pageOverflow).toBeLessThanOrEqual(0);
  expect(layout.blocks).toEqual([0, 0]);
  const copy = page
    .locator('[data-richtext-code-header]')
    .last()
    .getByRole('button', {name: 'Copy code'});
  await copy.focus();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `const id = "${token}";`,
  );
});

// spec:AST-061 FR8: a fence names a language exactly when core CodeBlock
// does — not with no info string, a blank one, or `plaintext` — and only a
// named block reserves the header row, so every fence is as tall as core
// Markdown's on both surfaces, in both color modes and directions.
for (const globals of [
  'colorMode:light;direction:ltr',
  'colorMode:dark;direction:rtl',
]) {
  test(`side by side: fences without a language have no label row (${globals})`, async ({
    page,
  }) => {
    const errors = await openStory(page, STORY.sideBySide, DESKTOP, globals);
    await waitForDocument(page, MARKDOWN);
    await waitForDocument(page, RICH_TEXT);
    const fences = {
      'code-fence': 'ts',
      'code-plain': '',
      'code-blank': '',
      'code-plaintext': '',
      'code-unknown': 'notalanguage',
      'code-long': 'sh',
    } as const;
    const markdown = await surfaceGeometry(page, MARKDOWN);
    const richText = await surfaceGeometry(page, RICH_TEXT);
    for (const key of Object.keys(fences)) {
      if (await markdownFenceScrolls(page, key)) {
        continue;
      }
      const height = (geometry: SurfaceGeometry) =>
        geometry.blocks.find(block => block.key === key)?.height ?? 0;
      expect(
        Math.abs(height(richText) - height(markdown)),
        `${key} height`,
      ).toBeLessThanOrEqual(2);
    }
    // The label core Markdown shows for each fence.
    const markdownLabels = await page.evaluate(
      ({selector, names}) =>
        Object.keys(names).map(key => {
          const block = document.querySelector(
            `${selector} [data-parity-block="${key}"]`,
          );
          const label = [...(block?.querySelectorAll('*') ?? [])].find(
            element =>
              element.childElementCount === 0 &&
              ['ts', 'notalanguage', 'plaintext', 'sh'].includes(
                element.textContent?.trim() ?? '',
              ),
          );
          return label?.textContent?.trim() ?? '';
        }),
      {selector: MARKDOWN, names: fences},
    );
    expect(markdownLabels).toEqual(Object.values(fences));
    // RichText draws one header per fence, in order, each with a copy button
    // and the same label.
    const headers = page.locator(`${RICH_TEXT} [data-richtext-code-header]`);
    await expect(headers).toHaveCount(6);
    const richTextLabels = await headers.evaluateAll(elements =>
      elements.map(element =>
        (element.textContent ?? '').replace('Copy code', '').trim(),
      ),
    );
    expect(richTextLabels).toEqual(Object.values(fences));
    for (const index of [0, 1, 2, 3, 4, 5]) {
      await expect(
        headers.nth(index).getByRole('button', {name: 'Copy code'}),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

for (const viewport of [PHONE, {width: 1280, height: 900}] as const) {
  for (const globals of [
    'colorMode:light;direction:ltr',
    'colorMode:dark;direction:rtl',
  ]) {
    test(`tables stay inside their wrappers in grid, flex, and shrink-to-fit hosts (${viewport.width}px, ${globals})`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(
        `${storybook.origin}/iframe.html?id=lab-richtexteditor--markdown-serializers&viewMode=story&globals=astryxTheme:neutral;${globals}`,
        {waitUntil: 'load'},
      );
      for (const columnCount of [2, 20]) {
        // Show every section so the story's textarea can take the table.
        await page.evaluate(() => {
          const layout = document.querySelector('[data-table-host-layout]');
          for (const section of Array.from(layout?.children ?? [])) {
            section.setAttribute('style', '');
          }
        });
        await page.locator('textarea').fill(tableSource(columnCount));
        await expect(page.locator('table:visible')).toHaveCount(2);
        for (const [host, styles] of Object.entries(TABLE_HOSTS)) {
          await page.evaluate(
            ({layout: layoutStyle, view: viewStyle, surfaces}) => {
              // The story lays its sections out in a grid; mark it once so later
              // cases find it after its style changes.
              let layout = document.querySelector<HTMLElement>(
                '[data-table-host-layout]',
              );
              if (layout == null) {
                layout =
                  document
                    .querySelector('textarea')
                    ?.closest<HTMLElement>('div[style*="grid"]') ?? null;
                layout?.setAttribute('data-table-host-layout', '');
              }
              if (layout == null) {
                throw new Error('Story layout not found');
              }
              layout.setAttribute('style', layoutStyle);
              // Only the surfaces this host holds stay in it.
              for (const section of Array.from(layout.children)) {
                const table = section.querySelector('table');
                const isView =
                  table?.closest('[contenteditable="false"]') != null;
                const keep =
                  table != null &&
                  (surfaces === 'both' || (surfaces === 'view') === isView);
                section.setAttribute('style', keep ? '' : 'display:none');
              }
              // The view itself is the shrink-to-fit box, as in a chat bubble.
              const viewRoot = document
                .querySelector('[contenteditable="false"] table')
                ?.closest('[contenteditable]')?.parentElement;
              viewRoot?.setAttribute('style', viewStyle);
            },
            styles,
          );
          await settle(page);
          const layout = await page.evaluate(() => ({
            pageOverflow:
              document.documentElement.scrollWidth - window.innerWidth,
            wrappers: [...document.querySelectorAll('table')]
              .filter(element => element.getBoundingClientRect().width > 0)
              .map(element => {
                const wrapper = element.parentElement as HTMLElement;
                // The table's own width: its max-content width, measured
                // with the inline width restored right after.
                const previousWidth = element.style.width;
                let intrinsic: number;
                try {
                  element.style.width = 'max-content';
                  intrinsic = element.getBoundingClientRect().width;
                } finally {
                  element.style.width = previousWidth;
                }
                // The widest the wrapper could be: the view's containing
                // block, less the space between the view's edge and the
                // wrapper.
                const view = element.closest('[contenteditable]')
                  ?.parentElement as HTMLElement | null;
                const host = view?.parentElement;
                const hostStyle = host == null ? null : getComputedStyle(host);
                const available =
                  host == null || hostStyle == null || view == null
                    ? 0
                    : host.clientWidth -
                      parseFloat(hostStyle.paddingLeft) -
                      parseFloat(hostStyle.paddingRight) -
                      (view.offsetWidth - wrapper.clientWidth);
                return {
                  inView: element.closest('[contenteditable="false"]') != null,
                  clientWidth: wrapper.clientWidth,
                  scrollWidth: wrapper.scrollWidth,
                  intrinsic,
                  available,
                  restored: element.style.width === previousWidth,
                };
              }),
          }));
          const label = `${columnCount} columns, ${host} host`;
          expect(layout.pageOverflow, label).toBeLessThanOrEqual(0);
          expect(layout.wrappers, label).toHaveLength(
            styles.surfaces === 'both' ? 2 : 1,
          );
          for (const wrapper of layout.wrappers) {
            expect(wrapper.clientWidth, label).toBeGreaterThan(0);
            expect(wrapper.clientWidth, label).toBeLessThanOrEqual(
              viewport.width,
            );
            if (columnCount === 20 && viewport.width === PHONE.width) {
              // A table wider than the phone scrolls inside its wrapper.
              expect(wrapper.scrollWidth, label).toBeGreaterThan(
                wrapper.clientWidth,
              );
            } else if (columnCount === 2) {
              // A small table fits without scrolling.
              expect(wrapper.scrollWidth, label).toBeLessThanOrEqual(
                wrapper.clientWidth + 1,
              );
            }
          }
          for (const wrapper of layout.wrappers) {
            // Measuring the table left its style as it was.
            expect(wrapper.restored, label).toBe(true);
          }
          if (styles.view !== '') {
            // A shrink-to-fit host gives the view's table its natural width,
            // up to the room it has: neither stretched nor collapsed. A small
            // table is narrower than the room, so stretching it fails here.
            const view = layout.wrappers.find(wrapper => wrapper.inView);
            if (columnCount === 2) {
              expect(view?.intrinsic ?? 0, label).toBeLessThan(
                (view?.available ?? 0) - 8,
              );
            }
            expect(
              Math.abs(
                (view?.clientWidth ?? 0) -
                  Math.min(view?.intrinsic ?? 0, view?.available ?? 0),
              ),
              label,
            ).toBeLessThanOrEqual(1);
          }
        }
      }
    });
  }
}

// spec:AST-061 FR2–FR4: the same blocks use the same type scale, spacing,
// and measure on both surfaces. Geometry still differs where structure does
// (lists, code, rules); these blocks already share their structure.
test('side by side: shared blocks match core Markdown typography, spacing, and measure', async ({
  page,
}) => {
  const errors = await openStory(page, STORY.sideBySide, DESKTOP);
  await waitForDocument(page, MARKDOWN);
  await waitForDocument(page, RICH_TEXT);
  const read = (surface: string) =>
    page.evaluate(selector => {
      const properties = [
        'fontFamily',
        'fontSize',
        'lineHeight',
        'fontWeight',
        'marginTop',
        'marginBottom',
        'maxWidth',
        'paddingLeft',
        'borderLeftWidth',
      ] as const;
      const styleOf = (element: Element | null | undefined) => {
        if (element == null) {
          return null;
        }
        const computed = getComputedStyle(element);
        return Object.fromEntries(
          properties.map(property => [property, computed[property]]),
        );
      };
      const block = (key: string, inner?: string) => {
        const element = document.querySelector(
          `${selector} [data-parity-block="${key}"]`,
        );
        if (inner == null || element?.matches(inner)) {
          return element;
        }
        return element?.querySelector(inner);
      };
      // RichText draws the inline-code chip on the text inside <code>.
      const code = block('paragraph-inline')?.querySelector('code');
      return {
        heading1: styleOf(block('heading-1', 'h1')),
        heading2: styleOf(block('heading-2', 'h2')),
        heading3: styleOf(block('heading-3', 'h3')),
        heading4: styleOf(block('heading-4', 'h4')),
        paragraph: styleOf(block('paragraph-escapes', 'p, div')),
        lastParagraph: styleOf(block('paragraph-final', 'p, div')),
        blockquote: styleOf(block('blockquote', 'blockquote')),
        strong: getComputedStyle(
          block('paragraph-inline')?.querySelector('strong') as Element,
        ).fontWeight,
        inlineCode: styleOf(code?.firstElementChild ?? code),
        // The distance from one list row to the next, and a row's padding.
        listRows: (() => {
          // The list's first two rows, both single lines on each surface.
          const rows = [
            ...(block('list-unordered', 'ul')?.querySelectorAll(
              ':scope > li',
            ) ?? []),
          ].slice(0, 2);
          return rows.length < 2
            ? null
            : {
                pitch:
                  rows[1].getBoundingClientRect().top -
                  rows[0].getBoundingClientRect().top,
                padding: getComputedStyle(rows[0]).paddingTop,
              };
        })(),
        rule: styleOf(block('thematic-break', 'hr')),
        // Each column's readable width floor, set on its header cell.
        tableFloors: [
          ...(block('table', 'table')?.querySelectorAll('th') ?? []),
        ].map(cell => getComputedStyle(cell).minWidth),
        // The text inside a header cell, where each surface draws it.
        tableHeader: (() => {
          const cell = block('table', 'table')?.querySelector('th');
          const text = cell?.querySelector('p') ?? cell;
          return text == null
            ? null
            : [getComputedStyle(text).fontWeight, getComputedStyle(text).color];
        })(),
      };
    }, surface);
  const markdown = await read(MARKDOWN);
  const richText = await read(RICH_TEXT);
  for (const key of [
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'paragraph',
    'lastParagraph',
  ] as const) {
    expect(richText[key], key).toEqual(markdown[key]);
  }
  for (const property of [
    'marginTop',
    'marginBottom',
    'maxWidth',
    'paddingLeft',
    'borderLeftWidth',
  ] as const) {
    expect(richText.blockquote?.[property], `blockquote ${property}`).toBe(
      markdown.blockquote?.[property],
    );
  }
  expect(richText.strong).toBe(markdown.strong);
  expect(richText.listRows, 'list rows').toEqual(markdown.listRows);
  for (const property of [
    'marginTop',
    'marginBottom',
    'borderLeftWidth',
  ] as const) {
    expect(richText.rule?.[property], `rule ${property}`).toBe(
      markdown.rule?.[property],
    );
  }
  expect(richText.tableFloors, 'table column floors').toEqual(
    markdown.tableFloors,
  );
  expect(richText.tableHeader, 'table header text').toEqual(
    markdown.tableHeader,
  );
  for (const property of ['fontSize', 'lineHeight', 'paddingLeft'] as const) {
    expect(richText.inlineCode?.[property], `inline code ${property}`).toBe(
      markdown.inlineCode?.[property],
    );
  }
  expect(errors).toEqual([]);
});

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

// spec:AST-061 FR6: every block takes the direction of the surface around
// it, whatever its first strong character, on both surfaces.
for (const direction of ['ltr', 'rtl'] as const) {
  test(`blocks take the provider direction (${direction})`, async ({page}) => {
    const errors = await openStory(
      page,
      STORY.sideBySide,
      DESKTOP,
      `colorMode:light;direction:${direction}`,
    );
    await waitForDocument(page, MARKDOWN);
    await waitForDocument(page, RICH_TEXT);
    for (const surface of [MARKDOWN, RICH_TEXT]) {
      const geometry = await surfaceGeometry(page, surface);
      const otherDirection = geometry.blocks
        .filter(block => block.direction !== direction)
        .map(block => block.key);
      expect(otherDirection, surface).toEqual([]);
      // Inside blocks too: table rows and cells, list items, and paragraphs.
      const nested = await page.evaluate(
        ({selector, expected}) =>
          [
            ...document.querySelectorAll(
              `${selector} [data-parity-body] :is(tr, th, td, li, p)`,
            ),
          ]
            .filter(element => getComputedStyle(element).direction !== expected)
            .map(element => element.tagName),
        {selector: surface, expected: direction},
      );
      expect(nested, `${surface} nested`).toEqual([]);
    }
    expect(errors).toEqual([]);
  });

  // Mixed English and Hebrew cells take the document's direction, so each
  // cell's text starts at the document's start edge, whatever its script.
  test(`table cells take the provider direction with mixed scripts (${direction})`, async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(
      `${storybook.origin}/iframe.html?id=lab-richtexteditor--markdown-serializers&viewMode=story&globals=astryxTheme:neutral;colorMode:light;direction:${direction}`,
      {waitUntil: 'load'},
    );
    await page
      .locator('textarea')
      .fill(
        '| Name | \u05e9\u05dd |\n| --- | :---: |\n| Ada | \u05e2\u05d3\u05d4 |\n| \u05e9\u05dc\u05d5\u05dd **bold** | Hello |',
      );
    await expect(page.locator('table:visible')).toHaveCount(2);
    const cells = await page.evaluate(() =>
      [...document.querySelectorAll('[data-lexical-editor] :is(th, td)')].map(
        cell => {
          const style = getComputedStyle(cell);
          const paragraph = cell.querySelector('p') ?? cell;
          const range = document.createRange();
          range.selectNodeContents(paragraph);
          const text = range.getBoundingClientRect();
          const box = cell.getBoundingClientRect();
          return {
            column: (cell as HTMLTableCellElement).cellIndex,
            direction: style.direction,
            paragraphDirection: getComputedStyle(paragraph).direction,
            startGap:
              style.direction === 'rtl'
                ? box.right - parseFloat(style.paddingRight) - text.right
                : text.left - box.left - parseFloat(style.paddingLeft),
          };
        },
      ),
    );
    // Editor and view, three rows of two cells each.
    expect(cells).toHaveLength(12);
    for (const cell of cells) {
      expect(cell.direction).toBe(direction);
      expect(cell.paragraphDirection).toBe(direction);
      if (cell.column === 0) {
        // The first column is start-aligned: its text touches the start edge.
        expect(Math.abs(cell.startGap)).toBeLessThanOrEqual(1);
      }
    }
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
    // The editor root, not a horizontal rule's contenteditable="false".
    .locator(`${RICH_TEXT} [data-lexical-editor]`)
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeBlockCopyClearance.a11y.chromium.spec.ts
 * @input Built CodeBlock story and real Chromium layout
 * @output Browser evidence that the floating Copy control never covers code
 * @position CodeBlock headerless state (Copy on the root, ORD2): the code body
 *   stays readable (Code Body, Copy Button design relationships)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
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

const STORY = 'core-codeblock--copy-clearance';

async function mount(
  page: Page,
  args: Record<string, unknown> = {},
  direction: 'ltr' | 'rtl' = 'ltr',
) {
  await page.setViewportSize({width: 600, height: 400});
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story&globals=direction:${direction}`,
  );
  await expect(copyButton(page)).toBeVisible();
  if (Object.keys(args).length > 0) {
    await page.evaluate(
      async ({storyId, updatedArgs}) =>
        new Promise<void>(resolve => {
          const channel = (
            window as unknown as {
              __STORYBOOK_ADDONS_CHANNEL__: {
                emit: (event: string, payload: unknown) => void;
                once: (event: string, handler: () => void) => void;
              };
            }
          ).__STORYBOOK_ADDONS_CHANNEL__;
          channel.once('storyRendered', () => resolve());
          channel.emit('updateStoryArgs', {storyId, updatedArgs});
          setTimeout(resolve, 1500);
        }),
      {storyId: STORY, updatedArgs: args},
    );
  }
}

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) {
    throw new Error('element not laid out');
  }
  return rect;
}

function copyButton(page: Page) {
  return page.getByRole('button', {name: 'Copy code'});
}

/**
 * The code viewport clips every line, so a line can reach the button only if
 * the viewport's box overlaps it. Returns the overlap width in pixels.
 */
async function overlap(page: Page, viewportName: string) {
  const button = await box(copyButton(page));
  const viewport = await box(page.getByRole('group', {name: viewportName}));
  const inline =
    Math.min(button.x + button.width, viewport.x + viewport.width) -
    Math.max(button.x, viewport.x);
  const block =
    Math.min(button.y + button.height, viewport.y + viewport.height) -
    Math.max(button.y, viewport.y);
  return inline > 0 && block > 0 ? inline : 0;
}

/** The first line's painted text must end before the button starts. */
async function firstLineReachesButton(page: Page) {
  return page.evaluate(() => {
    const find = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) {
        throw new Error(`missing ${selector}`);
      }
      return node;
    };
    const button = find('[aria-label="Copy code"]').getBoundingClientRect();
    const viewport = find('[role="group"]').getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(find('pre.astryx-code-block [data-line="1"]'));
    const rtl =
      getComputedStyle(find('pre.astryx-code-block')).direction === 'rtl';
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.bottom <= button.top || rect.top >= button.bottom) {
        continue;
      }
      // Visible part of the text: what the viewport does not clip.
      const left = Math.max(rect.left, viewport.left);
      const right = Math.min(rect.right, viewport.right);
      if (right <= left) {
        continue;
      }
      if (rtl ? left < button.right : right > button.left) {
        return true;
      }
    }
    return false;
  });
}

test('a long first line ends before the floating Copy button', async ({
  page,
}) => {
  await mount(page);
  expect(await overlap(page, 'Code')).toBe(0);
  expect(await firstLineReachesButton(page)).toBe(false);
});

test('scrolled to the end, the line still ends before Copy', async ({page}) => {
  await mount(page);
  const viewport = page.getByRole('group', {name: 'Code'});
  await viewport.evaluate(node => {
    node.scrollLeft = node.scrollWidth;
  });
  expect(await overlap(page, 'Code')).toBe(0);
  expect(await firstLineReachesButton(page)).toBe(false);
});

test('wrapped lines wrap before Copy', async ({page}) => {
  await mount(page, {isWrapped: true});
  expect(await overlap(page, 'Code')).toBe(0);
  expect(await firstLineReachesButton(page)).toBe(false);
});

test('in RTL the clearance mirrors to the inline end', async ({page}) => {
  await mount(page, {}, 'rtl');
  const button = await box(copyButton(page));
  const root = await box(page.locator('pre.astryx-code-block'));
  // Copy sits at the left (inline-end) edge in RTL.
  expect(button.x - root.x).toBeLessThan(root.width / 2);
  expect(await overlap(page, 'Code')).toBe(0);
  expect(await firstLineReachesButton(page)).toBe(false);
});

test('with a header, Copy sits in the header and the code keeps its full width', async ({
  page,
}) => {
  await mount(page, {title: 'run.sh'});
  const viewport = await box(page.getByRole('group', {name: 'Code'}));
  const root = await box(page.locator('pre.astryx-code-block'));
  // Only the root's own border separates the viewport from the root's edges.
  expect(Math.abs(root.width - viewport.width)).toBeLessThanOrEqual(2);
  expect(await overlap(page, 'Code')).toBe(0);
});

async function centres(page: Page) {
  return page.evaluate(() => {
    const find = (selector: string) => {
      const node = document.querySelector(selector);
      if (!node) {
        throw new Error(`missing ${selector}`);
      }
      return node.getBoundingClientRect();
    };
    const button = find('[aria-label="Copy code"]');
    const line = find('pre.astryx-code-block [data-line="1"]');
    const root = find('pre.astryx-code-block');
    return {
      button: button.top + button.height / 2,
      line: line.top + line.height / 2,
      above: button.top - root.top,
      below: root.bottom - button.bottom,
    };
  });
}

test('a one-line block is one row: Copy is centred with even space', async ({
  page,
}) => {
  await mount(page, {code: 'pnpm install'});
  const one = await centres(page);
  expect(Math.abs(one.button - one.line)).toBeLessThanOrEqual(1);
  expect(Math.abs(one.above - one.below)).toBeLessThanOrEqual(1);
  expect(await overlap(page, 'Code')).toBe(0);
});

test('a block that grows (streaming) keeps Copy on its first line', async ({
  page,
}) => {
  await mount(page, {code: 'pnpm install'});
  const before = await centres(page);
  await mount(page, {code: 'pnpm install\npnpm build\npnpm test'});
  const after = await centres(page);
  expect(Math.abs(after.button - before.button)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.button - after.line)).toBeLessThanOrEqual(1);
});

test('the small size centres Copy on its own first line', async ({page}) => {
  await mount(page, {code: 'pnpm install', size: 'sm'});
  const one = await centres(page);
  expect(Math.abs(one.button - one.line)).toBeLessThanOrEqual(1);
});

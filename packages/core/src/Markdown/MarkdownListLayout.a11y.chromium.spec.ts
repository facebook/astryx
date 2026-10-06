// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MarkdownListLayout.a11y.chromium.spec.ts
 * @input Uses the checked-in Markdown list-alignment story and a built Storybook
 * @output Real-Chromium geometry evidence for ordinary and task-list layout
 * @position Browser proof for Markdown's existing shared List content-width and
 *   alignment behavior. Generated classes can show that styles were requested,
 *   but only a browser can prove the resulting width and inline position.
 *
 * Build the Storybook first:
 *
 *   pnpm storybook:build
 *   pnpm exec playwright test MarkdownListLayout.a11y.chromium.spec.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const STORY_ID = 'core-markdown--list-content-alignment';
const OUTPUT = path.resolve('test-results/markdown-list-layout');
const CONTENT_WIDTH = 360;
const TOLERANCE = 0.5;

interface LayoutMetric {
  align: 'start' | 'center';
  kind: 'unordered' | 'ordered' | 'task';
  frameWidth: number;
  listWidth: number;
  offsetInlineStart: number;
  maxWidth: string;
}

let storybook: StaticServer;
let measurements: LayoutMetric[] = [];
let browserVersion = 'unknown';

function closeTo(actual: number, expected: number): boolean {
  return Math.abs(actual - expected) <= TOLERANCE;
}

test.beforeAll(async () => {
  fs.rmSync(OUTPUT, {recursive: true, force: true});
  fs.mkdirSync(OUTPUT, {recursive: true});
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  fs.writeFileSync(
    path.join(OUTPUT, 'manifest.json'),
    `${JSON.stringify(
      {version: 1, storyId: STORY_ID, browserVersion, measurements},
      null,
      2,
    )}\n`,
  );
  await storybook?.close();
});

test('task lists match ordinary-list content width and alignment geometry', async ({
  page,
}) => {
  browserVersion = page.context().browser()?.version() ?? 'unknown';
  await page.setViewportSize({width: 1000, height: 900});
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY_ID}&viewMode=story`,
    {waitUntil: 'load'},
  );
  await page.locator('[data-list-layout-case="task"]').last().waitFor();
  await page.evaluate(async () => document.fonts.ready);

  measurements = await page
    .locator('[data-list-layout-case]')
    .evaluateAll(elements =>
      elements.map(element => {
        const frame = element as HTMLElement;
        const group = frame.closest<HTMLElement>('[data-list-layout-group]');
        const list = frame.querySelector<HTMLElement>('.astryx-markdown-list');
        if (group == null || list == null) {
          throw new Error(
            'List layout fixture did not render its expected nodes',
          );
        }

        const frameRect = frame.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        return {
          align: group.dataset.listLayoutGroup as 'start' | 'center',
          kind: frame.dataset.listLayoutCase as
            'unordered' | 'ordered' | 'task',
          frameWidth: frameRect.width,
          listWidth: listRect.width,
          offsetInlineStart: listRect.x - frameRect.x,
          maxWidth: getComputedStyle(list).maxWidth,
        };
      }),
    );

  await page
    .locator('#storybook-root')
    .screenshot({path: path.join(OUTPUT, 'list-content-alignment.png')});

  expect(measurements).toHaveLength(6);
  for (const align of ['start', 'center'] as const) {
    const group = measurements.filter(metric => metric.align === align);
    expect(group).toHaveLength(3);

    const unordered = group.find(metric => metric.kind === 'unordered');
    const ordered = group.find(metric => metric.kind === 'ordered');
    const taskList = group.find(metric => metric.kind === 'task');

    for (const metric of group) {
      expect(metric.maxWidth).toBe(`${CONTENT_WIDTH}px`);
      expect(closeTo(metric.listWidth, CONTENT_WIDTH)).toBe(true);
      const expectedOffset =
        align === 'center' ? (metric.frameWidth - metric.listWidth) / 2 : 0;
      expect(closeTo(metric.offsetInlineStart, expectedOffset)).toBe(true);
    }

    if (unordered == null || ordered == null || taskList == null) {
      throw new Error(`${align} fixture omitted a list kind`);
    }

    for (const ordinary of [unordered, ordered]) {
      expect(closeTo(taskList.listWidth, ordinary.listWidth)).toBe(true);
      expect(
        closeTo(taskList.offsetInlineStart, ordinary.offsetInlineStart),
      ).toBe(true);
    }
  }
});

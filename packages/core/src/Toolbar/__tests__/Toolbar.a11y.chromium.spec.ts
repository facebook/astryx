// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Toolbar.a11y.chromium.spec.ts
 * @input Built toolbar stories and TOOLBAR_PATTERN in real Chromium
 * @output Browser evidence for every toolbar expectation across Toolbar's representative states
 * @position Chromium lane of the Toolbar binding
 */

import {
  expect,
  test,
  type CDPSession,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  TOOLBAR_PATTERN,
  blockingResults,
  checkAccessibilitySpec,
  formatFailures,
  neverExercised,
  summarize,
  type BindingResult,
} from '@astryxdesign/a11y-spec';
import {
  createChromiumHarness,
  holdMotionStill,
} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {
  TOOLBAR_BINDING_STATES,
  type ToolbarBindingState,
} from './Toolbar.a11y.states';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

function storyUrl(storyId: string): string {
  return `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story`;
}

async function mountState(
  page: Page,
  state: ToolbarBindingState,
): Promise<{subject: Locator; related: Record<string, Locator>}> {
  await page.goto(storyUrl(state.storyId), {waitUntil: 'load'});
  await holdMotionStill(page);
  const root = page.locator('#storybook-root');
  const subject = root.getByRole('toolbar', {name: state.label, exact: true});
  await expect(subject).toBeVisible();
  const related: Record<string, Locator> = {
    before: root.getByRole('button', {
      name: 'Before the toolbar',
      exact: true,
    }),
    after: root.getByRole('button', {name: 'After the toolbar', exact: true}),
  };
  for (const [relation, name] of Object.entries(state.controls)) {
    related[relation] = subject.getByRole('button', {name, exact: true});
  }
  return {subject, related};
}

async function runState(
  page: Page,
  cdp: CDPSession,
  state: ToolbarBindingState,
): Promise<BindingResult> {
  return checkAccessibilitySpec({
    spec: TOOLBAR_PATTERN,
    binding: 'Toolbar',
    state: state.id,
    facts: state.facts,
    mount: async () => {
      const {subject, related} = await mountState(page, state);
      return createChromiumHarness({page, cdp, subject, related});
    },
  });
}

test('every toolbar expectation is exercised by a Toolbar state', async ({
  page,
}) => {
  const cdp = await page.context().newCDPSession(page);
  const results: BindingResult[] = [];
  for (const state of TOOLBAR_BINDING_STATES) {
    results.push(await runState(page, cdp, state));
  }
  expect(neverExercised(results)).toEqual([]);
});

for (const state of TOOLBAR_BINDING_STATES) {
  test(`Toolbar [${state.id}] — ${state.summary}`, async ({page}) => {
    const cdp = await page.context().newCDPSession(page);
    const result = await runState(page, cdp, state);
    const report = summarize(TOOLBAR_PATTERN, [result]);
    // Required rows block (AST-020 FR9).
    expect(formatFailures(blockingResults([result]))).toBe('');
    expect(report.unrunLayers).toEqual([]);
    expect(report.counts.unexpectedPass).toBe(0);
  });
}

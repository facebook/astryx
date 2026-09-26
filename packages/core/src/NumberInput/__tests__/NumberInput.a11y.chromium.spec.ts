// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Real-browser and accessibility-tree binding evidence for NumberInput. */

import {expect, test, type CDPSession, type Page} from '@playwright/test';
import {
  SPINBUTTON_PATTERN,
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
  NUMBER_INPUT_A11Y_STATES,
  type NumberInputA11yRow,
} from './NumberInput.a11y.states';

const SUBJECT_SELECTOR = '[data-a11y-spinbutton-subject]';
let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => storybook?.close());

function storyUrl(id: string): string {
  return `${storybook.origin}/iframe.html?id=${id}&viewMode=story`;
}

async function mount(page: Page, state: NumberInputA11yRow): Promise<void> {
  await page.goto(storyUrl(state.storyId), {waitUntil: 'load'});
  await holdMotionStill(page);
  await page.locator(SUBJECT_SELECTOR).waitFor({state: 'attached'});
}

async function runState(
  page: Page,
  cdp: CDPSession,
  state: NumberInputA11yRow,
): Promise<BindingResult> {
  return checkAccessibilitySpec({
    spec: SPINBUTTON_PATTERN,
    binding: 'NumberInput',
    state: state.id,
    facts: state.facts,
    mount: async () => {
      await mount(page, state);
      return createChromiumHarness({
        page,
        cdp,
        subject: page.locator(SUBJECT_SELECTOR),
      });
    },
  });
}

test('every expectation is exercised by at least one NumberInput state', async ({
  page,
}) => {
  test.setTimeout(4 * 60 * 1000);
  const cdp = await page.context().newCDPSession(page);
  const results: BindingResult[] = [];
  for (const state of NUMBER_INPUT_A11Y_STATES) {
    results.push(await runState(page, cdp, state));
  }
  expect(neverExercised(results)).toEqual([]);
});

for (const state of NUMBER_INPUT_A11Y_STATES) {
  test(`NumberInput [${state.id}] — ${state.summary}`, async ({page}) => {
    const cdp = await page.context().newCDPSession(page);
    const result = await runState(page, cdp, state);
    const report = summarize(SPINBUTTON_PATTERN, [result]);
    expect(formatFailures(blockingResults([result]))).toBe('');
    expect(report.unrunLayers).toEqual([]);
  });
}

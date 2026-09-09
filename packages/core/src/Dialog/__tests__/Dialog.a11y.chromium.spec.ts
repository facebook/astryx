// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dialog.a11y.chromium.spec.ts
 * @input Uses the modal-dialog contract, Chromium harness, static Storybook,
 *   dedicated Dialog stories, state inventory, and exact known failures
 * @output Browser-owned Dialog binding evidence for top-layer, accessibility
 *   tree, focus, Tab containment, Escape, restoration, and background inertness
 * @position High-fidelity lane; jsdom binds only DOM semantics.
 */

import {
  expect,
  test,
  type CDPSession,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  MODAL_DIALOG_PATTERN,
  blockingResults,
  checkAccessibilitySpec,
  formatFailures,
  formatReport,
  neverExercised,
  summarize,
  unmatchedKnownFailures,
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
import {DIALOG_MODAL_KNOWN_FAILURES} from './Dialog.a11y.known-failures';
import {
  DIALOG_CONTRACT_BACKGROUND_LABEL,
  DIALOG_CONTRACT_CLOSE_LABEL,
  DIALOG_CONTRACT_OPEN_LABEL,
  DIALOG_MODAL_BINDING_STATES,
  type DialogModalBindingState,
} from './Dialog.a11y.states';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

async function mountState(
  page: Page,
  state: DialogModalBindingState,
): Promise<{
  readonly root: Locator;
  readonly subject: Locator;
}> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${state.storyId}&viewMode=story`,
    {waitUntil: 'load'},
  );
  await holdMotionStill(page);
  const root = page.locator('#storybook-root');
  const subject = root.locator('dialog');
  await root.getByRole('button', {name: DIALOG_CONTRACT_OPEN_LABEL}).click();
  await expect
    .poll(async () => subject.evaluate(element => element.matches(':modal')))
    .toBe(true);
  return {root, subject};
}

function initialTarget(
  root: Locator,
  subject: Locator,
  state: DialogModalBindingState,
): Locator {
  return state.initialTarget.kind === 'dialog'
    ? subject
    : root.getByRole('heading', {name: state.initialTarget.name});
}

async function runState(
  page: Page,
  cdp: CDPSession,
  state: DialogModalBindingState,
): Promise<BindingResult> {
  return checkAccessibilitySpec({
    spec: MODAL_DIALOG_PATTERN,
    binding: 'Dialog',
    state: state.id,
    facts: state.facts,
    knownFailures: DIALOG_MODAL_KNOWN_FAILURES,
    mount: async () => {
      const {root, subject} = await mountState(page, state);
      return createChromiumHarness({
        page,
        subject,
        visibleLabel:
          state.visibleTitle == null
            ? null
            : root.getByRole('heading', {name: state.visibleTitle}),
        cdp,
        related: {
          initial: initialTarget(root, subject, state),
          close: root.getByRole('button', {name: DIALOG_CONTRACT_CLOSE_LABEL}),
          invoker: root.getByRole('button', {
            name: DIALOG_CONTRACT_OPEN_LABEL,
          }),
          background: root.getByRole('button', {
            name: DIALOG_CONTRACT_BACKGROUND_LABEL,
          }),
        },
      });
    },
  });
}

test('every expectation is exercised and every known failure matches once', async ({
  page,
}) => {
  test.setTimeout(5 * 60 * 1000);
  const cdp = await page.context().newCDPSession(page);
  const results: BindingResult[] = [];
  for (const state of DIALOG_MODAL_BINDING_STATES) {
    results.push(await runState(page, cdp, state));
  }
  expect(neverExercised(results)).toEqual([]);
  expect(unmatchedKnownFailures(DIALOG_MODAL_KNOWN_FAILURES, results)).toEqual(
    [],
  );
});

for (const state of DIALOG_MODAL_BINDING_STATES) {
  test(`Dialog [${state.id}] — ${state.summary}`, async ({page}) => {
    const cdp = await page.context().newCDPSession(page);
    const result = await runState(page, cdp, state);
    const report = summarize(MODAL_DIALOG_PATTERN, [result]);
    // eslint-disable-next-line no-console -- the report is this run's artifact
    console.log(formatReport(report));

    expect(formatFailures(blockingResults([result]))).toBe('');
    expect(report.unrunLayers).toEqual([]);
    expect(report.counts.unexpectedPass).toBe(0);
  });
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.a11y.chromium.spec.ts
 * @input Uses @playwright/test, @astryxdesign/a11y-spec (the switch contract,
 *   the Chromium harness, the runner, the Storybook server) and the checked-in
 *   Switch stories
 * @output The Chromium lane of Switch's binding to the shared switch pattern:
 *   the computed accessibility tree, real focus, and real activation.
 * @position The lane that carries most of this contract. jsdom cannot compute a
 *   role or a name, cannot resolve a tab sequence, and cannot turn a key press
 *   into an activation, so those outcomes are proven here or not at all.
 *
 * Run it with:
 *   pnpm storybook:build && npx playwright install chromium
 *   pnpm test:a11y-contract
 *
 * SYNC: States live in ./Switch.a11y.states.ts, known failures in
 *   ./Switch.a11y.known-failures.ts, both shared with the jsdom lane.
 */

import {expect, test, type CDPSession, type Page} from '@playwright/test';
import {
  SWITCH_PATTERN,
  blockingResults,
  formatFailures,
  formatReport,
  runBinding,
  summarize,
  type BindingResult,
} from '@astryxdesign/a11y-spec';
import {createChromiumHarness} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {SWITCH_KNOWN_FAILURES} from './Switch.a11y.known-failures';
import {
  SWITCH_BINDING_STATES,
  type SwitchBindingState,
} from './Switch.a11y.states';

let storybook: StaticServer;

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  await storybook?.close();
});

async function runState(
  page: Page,
  cdp: CDPSession,
  state: SwitchBindingState,
): Promise<BindingResult> {
  const url = `${storybook.origin}/iframe.html?id=${state.storyId}&viewMode=story`;
  return runBinding({
    contract: SWITCH_PATTERN,
    binding: 'Switch',
    state: state.id,
    facts: state.facts,
    knownFailures: SWITCH_KNOWN_FAILURES,
    // Reload per expectation: each one starts from the state the story
    // renders, not from whatever the previous expectation toggled it to.
    mount: async () => {
      await page.goto(url, {waitUntil: 'load'});
      const root = page.locator('#storybook-root');
      const subject = root.getByRole('switch');
      await subject.waitFor({state: 'attached'});
      if (state.arrivesBy === 'controlled-update') {
        // Getting into this state is the owner's doing, not the user's: the
        // story's second control changes the value the switch is given. Doing
        // it here, in the mount, keeps every expectation about the switch.
        await root.getByRole('button', {name: 'Turn on remotely'}).click();
      }
      return createChromiumHarness({page, subject, cdp});
    },
  });
}

for (const state of SWITCH_BINDING_STATES) {
  test(`Switch [${state.id}] — ${state.summary}`, async ({page}) => {
    const cdp = await page.context().newCDPSession(page);
    const result = await runState(page, cdp, state);
    const report = summarize(SWITCH_PATTERN, [result]);
    // eslint-disable-next-line no-console -- the report is this run's artifact
    console.log(formatReport(report));

    expect(formatFailures(blockingResults([result]))).toBe('');
    // Every layer this contract assigns is observable here, so a state that
    // reports one as unrun means the harness lost a capability, not that the
    // outcome is covered.
    expect(report.unrunLayers).toEqual([]);
    expect(report.counts.unexpectedPass).toBe(0);
  });
}

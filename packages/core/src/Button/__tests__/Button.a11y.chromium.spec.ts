// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.a11y.chromium.spec.ts
 * @input Uses @playwright/test, @astryxdesign/a11y-spec (the button contract,
 *   the Chromium harness, the static Storybook server), and the checked-in
 *   ButtonA11y stories
 * @output The real-browser lane of every binding to the shared button pattern:
 *   computed role, name and description, native activation by pointer, Enter
 *   and Space, pointer cancellation, tab reachability, and inertness.
 * @position The half of the binding jsdom cannot honestly reach
 *   (`docs/specs/AST-013/spec.md`: a browser claim is made in a browser).
 *
 * Each state drives a checked-in story rather than a page this file builds, so
 * the reproduction path for any failure is a URL a person can open
 * (`docs/specs/AST-009/spec.md` FR30). Each story counts its own activations,
 * which is what the contract reads through the binding's `activations()` seam —
 * a button's action leaves no trace on the button itself.
 *
 * SYNC: States live in ./Button.a11y.states.ts, known failures in
 *   ./Button.a11y.known-failures.ts, both shared with the jsdom lane.
 */

import {expect, test, type CDPSession, type Page} from '@playwright/test';
import {
  BUTTON_PATTERN,
  blockingResults,
  formatFailures,
  formatReport,
  neverExercised,
  runBinding,
  spokenWords,
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
import {BUTTON_KNOWN_FAILURES} from './Button.a11y.known-failures';
import {
  BUTTON_BINDING_STATES,
  BUTTON_PATTERN_EXCLUSIONS,
  type ButtonBindingRow,
} from './Button.a11y.states';

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

/** Load the story this state names and wait for its control to exist. */
async function mountState(page: Page, state: ButtonBindingRow): Promise<void> {
  await page.goto(storyUrl(state.storyId), {waitUntil: 'load'});
  await holdMotionStill(page);
  await page
    .locator('#storybook-root')
    .getByRole('button')
    .first()
    .waitFor({state: 'attached'});
}

/**
 * How many times this story's own handler has run.
 *
 * The story publishes the count as an attribute, so this reads a fact the story
 * renders rather than instrumenting the page from the test — which means a
 * person opening the story sees the same number the contract does.
 */
async function activationsOn(page: Page): Promise<number> {
  const raw = await page
    .locator('[data-a11y-activations]')
    .first()
    .getAttribute('data-a11y-activations');
  return Number(raw ?? '0');
}

async function runState(
  page: Page,
  cdp: CDPSession,
  state: ButtonBindingRow,
): Promise<BindingResult> {
  return runBinding({
    contract: BUTTON_PATTERN,
    binding: state.binding,
    state: state.id,
    facts: state.facts,
    knownFailures: BUTTON_KNOWN_FAILURES,
    // Reload per expectation: each one starts from the state the story renders,
    // not from whatever the previous expectation left behind.
    mount: async () => {
      await mountState(page, state);
      return createChromiumHarness({
        page,
        subject: page.locator('#storybook-root').getByRole('button').first(),
        cdp,
      });
    },
    activations: async () => activationsOn(page),
  });
}

/**
 * Whether the page renders exactly the label the inventory claims, word for
 * word — a prefix test would accept "Save" for "Save changes" and let a
 * half-written entry sit here unnoticed.
 */
function namesTheSameLabel(rendered: string, claimed: string): boolean {
  const words = spokenWords(rendered);
  const expected = spokenWords(claimed);
  return (
    words.length === expected.length &&
    words.every((word, index) => word === expected[index])
  );
}

/**
 * The inventory AST-021 FR2 asks for, checked against the page rather than
 * trusted. Deliberately NOT part of the shared contract: a wrong entry here is a
 * stale inventory, and reporting it as a WCAG 2.5.3 failure would put a metadata
 * typo and a real accessibility defect in the same bucket.
 */
test('the state inventory describes the labels the page actually renders', async ({
  page,
}) => {
  test.setTimeout(3 * 60 * 1000);
  const cdp = await page.context().newCDPSession(page);
  const wrong: string[] = [];
  for (const state of BUTTON_BINDING_STATES) {
    await mountState(page, state);
    const harness = createChromiumHarness({
      page,
      subject: page.locator('#storybook-root').getByRole('button').first(),
      cdp,
    });
    const rendered = await (await harness.subject()).visibleLabelText();
    const matches =
      state.visibleLabel == null
        ? rendered == null
        : rendered != null && namesTheSameLabel(rendered, state.visibleLabel);
    if (!matches) {
      wrong.push(
        `${state.id}: inventory says ${JSON.stringify(state.visibleLabel)}, page renders ${JSON.stringify(rendered)}`,
      );
    }
  }
  expect(wrong).toEqual([]);
});

/**
 * The exclusions, checked in a real engine. An excluded part is only honestly
 * excluded while it really does present the other pattern's semantics — the day
 * one of these computes as a button, this contract owns it.
 */
test('every excluded part presents the semantics its exclusion claims', async ({
  page,
}) => {
  const cdp = await page.context().newCDPSession(page);
  const wrong: string[] = [];
  for (const exclusion of BUTTON_PATTERN_EXCLUSIONS) {
    await page.goto(storyUrl(exclusion.storyId), {waitUntil: 'load'});
    const subject = page
      .locator('#storybook-root')
      .getByRole(exclusion.presentsRole)
      .first();
    await subject.waitFor({state: 'attached'});
    const harness = createChromiumHarness({page, subject, cdp});
    const {role} = await (await harness.subject()).computed();
    if (role !== exclusion.presentsRole) {
      wrong.push(
        `${exclusion.id}: excluded as a ${exclusion.presentsRole}, but the browser computes "${role}"`,
      );
    }
  }
  expect(wrong).toEqual([]);
});

test('every expectation is exercised by at least one bound state', async ({
  page,
}) => {
  test.setTimeout(5 * 60 * 1000);
  const cdp = await page.context().newCDPSession(page);
  const results: BindingResult[] = [];
  for (const state of BUTTON_BINDING_STATES) {
    // One mount per STATE, not per expectation. The per-state tests above take
    // the expensive isolated path; this one only asks WHICH expectations ran,
    // never whether they passed, and that answer does not depend on starting
    // each expectation from a fresh page. Reloading 14 times per state instead
    // would turn a ten-second check into a ten-minute one for no extra truth.
    let mounted = false;
    results.push(
      await runBinding({
        contract: BUTTON_PATTERN,
        binding: state.binding,
        state: state.id,
        facts: state.facts,
        knownFailures: BUTTON_KNOWN_FAILURES,
        mount: async () => {
          if (!mounted) {
            await mountState(page, state);
            mounted = true;
          }
          return createChromiumHarness({
            page,
            subject: page
              .locator('#storybook-root')
              .getByRole('button')
              .first(),
            cdp,
          });
        },
        activations: async () => activationsOn(page),
      }),
    );
  }
  // An expectation that applies to nothing is not coverage, however green it
  // looks. This is the only place that can notice: the contract never sees the
  // states, so whether a condition matches a real one is a binding-side fact.
  expect(neverExercised(results)).toEqual([]);
});

for (const state of BUTTON_BINDING_STATES) {
  test(`${state.binding} [${state.id}] — ${state.summary}`, async ({page}) => {
    const cdp = await page.context().newCDPSession(page);
    const result = await runState(page, cdp, state);
    const report = summarize(BUTTON_PATTERN, [result]);
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

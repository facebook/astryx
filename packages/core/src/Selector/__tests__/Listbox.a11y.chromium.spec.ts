// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Listbox.a11y.chromium.spec.ts
 * @input Uses the Listbox contract, browser harness, state inventory, and checked-in stories
 * @output DOM/accessibility-tree evidence for each real Listbox binding part
 * @position Browser binding; keyboard policy, pixels, and real AT remain separate owners.
 */

import {expect, test} from '@playwright/test';
import {
  LISTBOX_PATTERN,
  checkAccessibilitySpec,
  blockingResults,
  formatFailures,
  formatReport,
  summarize,
  neverExercised,
  type BindingResult,
} from '@astryxdesign/a11y-spec';
import {
  createChromiumHarness,
  holdMotionStill,
} from '@astryxdesign/a11y-spec/chromium';
import {
  serveStorybook,
  DEFAULT_STORYBOOK_DIR,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {LISTBOX_SCENARIOS, listboxParts} from './Listbox.a11y.states';

let storybook: StaticServer;
test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

for (const scenario of LISTBOX_SCENARIOS) {
  test(`${scenario.component} — ${scenario.id}`, async ({page}) => {
    test.setTimeout(2 * 60 * 1000);
    const cdp = await page.context().newCDPSession(page);
    const results: BindingResult[] = [];
    const mount = async () => {
      await page.goto(
        `${storybook.origin}/iframe.html?id=a11y-listbox-pattern--${scenario.id}&viewMode=story&globals=direction:${scenario.direction ?? 'ltr'}`,
        {waitUntil: 'load'},
      );
      await holdMotionStill(page);
      await expect(
        page.locator(`[data-listbox-scenario="${scenario.id}"]`),
      ).toBeAttached();
      await page.getByRole('listbox').waitFor({state: 'visible'});
      if (scenario.query != null) {
        await page.getByRole('combobox').fill(scenario.query);
      }
      await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(
        scenario.expectedOptions.length,
      );
    };

    for (const part of listboxParts(scenario)) {
      results.push(
        await checkAccessibilitySpec({
          spec: LISTBOX_PATTERN,
          binding: `${scenario.component}.${part.role}`,
          state: part.state,
          facts: part.facts,
          mount: async () => {
            await mount();
            const listbox = page.getByRole('listbox');
            const subject =
              part.role === 'listbox'
                ? listbox
                : listbox.getByRole(part.role, {name: part.name, exact: true});
            return createChromiumHarness({
              page,
              cdp,
              subject,
              related: {
                listbox,
                ...Object.fromEntries(scenario.expectedOptions.map(option => [
                  `option:${option.value}`, listbox.getByRole('option', {name: option.name, exact: true}),
                ])),
                ...Object.fromEntries(scenario.groups.map(name => [
                  `group:${name}`, listbox.getByRole('group', {name, exact: true}),
                ])),
              },
            });
          },
        }),
      );
    }

    const report = summarize(LISTBOX_PATTERN, results);
    console.log(formatReport(report));
    expect(formatFailures(blockingResults(results))).toBe('');
    expect(report.counts.unrun).toBe(0);
    expect(report.counts.knownFailure).toBe(0);
    if (scenario.component === 'Selector' && scenario.groups.length > 0) {
      expect(neverExercised(results)).toEqual([]);
    }
  });
}

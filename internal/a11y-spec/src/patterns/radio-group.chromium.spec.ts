// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radio-group.chromium.spec.ts
 * @input Uses @playwright/test, the radio-group contract and fixtures, and the Chromium harness
 * @output Real-browser mutation proof for the radio-group contract
 * @position Contract self-test; proves the reusable expectation, not an Astryx component.
 */

import {expect, test} from '@playwright/test';
import {checkAccessibilitySpec} from '../check';
import {createChromiumHarness} from '../harness/chromium';
import {RADIO_GROUP_PATTERN} from './radio-group';
import {
  expectedRadioGroupMutationFailure,
  radioGroupFixture,
  RADIO_GROUP_SUBJECT_SELECTOR,
} from './radio-group.fixtures';

const EXPECTATION = 'radio-group.group.role-exposed';

test('the group-role expectation rejects the deliberate wrong-role fixture', async ({
  page,
}) => {
  const target = radioGroupFixture('violating-group-role');
  const cdp = await page.context().newCDPSession(page);
  const run = await checkAccessibilitySpec({
    spec: RADIO_GROUP_PATTERN,
    binding: 'fixture',
    state: target.id,
    facts: target.facts,
    only: [EXPECTATION],
    mount: async () => {
      await page.setContent(
        `<!doctype html><html lang="en"><body>${target.html}</body></html>`,
      );
      return createChromiumHarness({
        page,
        subject: page.locator(RADIO_GROUP_SUBJECT_SELECTOR),
        cdp,
      });
    },
  });
  const result = run.results.find(item => item.expectation === EXPECTATION);
  expect(result?.status).toBe('fail');
  expect(result?.detail).toBe(
    expectedRadioGroupMutationFailure(EXPECTATION, target.id),
  );
});

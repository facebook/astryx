// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file status-message.chromium.spec.ts
 * @input Uses plain-HTML status fixtures and the Chromium accessibility tree
 * @output Positive and negative proof for browser-owned status-message outcomes
 * @position Real-browser self-test of the contract, not a component binding
 */

import {expect, test, type CDPSession, type Page} from '@playwright/test';
import {checkAccessibilitySpec} from '../check';
import {createChromiumHarness} from '../harness/chromium';
import {STATUS_MESSAGE_PATTERN} from './status-message';
import {
  STATUS_MESSAGE_SUBJECT_SELECTOR,
  statusMessageFixture,
  type StatusMessageFixture,
} from './status-message.fixtures';

async function resultFor(
  page: Page,
  cdp: CDPSession,
  target: StatusMessageFixture,
) {
  const result = await checkAccessibilitySpec({
    spec: STATUS_MESSAGE_PATTERN,
    binding: 'fixture',
    state: target.id,
    facts: target.facts,
    mount: async () => {
      await page.setContent(target.html);
      return createChromiumHarness({
        page,
        cdp,
        subject: page.locator(STATUS_MESSAGE_SUBJECT_SELECTOR),
      });
    },
  });
  return result.results[0];
}

test('exposes a polite status channel', async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  expect(
    (
      await resultFor(
        page,
        cdp,
        statusMessageFixture('conforming-polite-channel'),
      )
    )?.status,
  ).toBe('pass');
});

test('rejects a status message with no programmatic live channel', async ({
  page,
}) => {
  const cdp = await page.context().newCDPSession(page);
  expect(
    (
      await resultFor(
        page,
        cdp,
        statusMessageFixture('violating-unexposed-channel'),
      )
    )?.status,
  ).toBe('fail');
});

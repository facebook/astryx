// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';
/* global module */

/**
 * @file Bounded readiness gate for one Storybook accessibility scan.
 * @input Repeated snapshots of URL, Storybook shell state, and root content.
 * @output Resolves only after the intended story has rendered; rejects redirects,
 *   Storybook errors, and timeouts.
 * @position Pure timing policy used by accessibility-audit.js and unit tests.
 */

const defaultSleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForStoryReadiness(
  readState,
  {
    timeoutMs = 5000,
    pollMs = 50,
    now = Date.now,
    sleep = defaultSleep,
  } = {},
) {
  const deadline = now() + timeoutMs;
  while (true) {
    const state = await readState();
    if (!state.urlMatches) {
      throw new Error(`story navigation ended at ${state.url}`);
    }
    if (state.errorVisible) {
      throw new Error('Storybook reported a story render error');
    }
    if (state.mainVisible && state.hasContent) {
      return;
    }
    if (now() >= deadline) {
      throw new Error('Storybook root did not render story content before timeout');
    }
    await sleep(pollMs);
  }
}

module.exports = {waitForStoryReadiness};

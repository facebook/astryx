// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {waitForStoryReadiness} = require('./a11y-story-readiness.js');

function sequencedReader(states) {
  let index = 0;
  return async () => states[Math.min(index++, states.length - 1)];
}

const waiting = {
  url: 'http://localhost:6007/iframe.html?id=core-button--default',
  urlMatches: true,
  errorVisible: false,
  mainVisible: true,
  hasContent: false,
};

const ready = {...waiting, hasContent: true};

describe('waitForStoryReadiness', () => {
  it('waits for delayed story content instead of sampling the root once', async () => {
    let time = 0;
    const readState = sequencedReader([waiting, waiting, ready]);
    await expect(
      waitForStoryReadiness(readState, {
        timeoutMs: 5,
        pollMs: 0,
        now: () => time++,
        sleep: async () => {},
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects a redirect away from the selected Storybook iframe', async () => {
    await expect(
      waitForStoryReadiness(
        async () => ({
          ...waiting,
          url: 'chrome-error://chromewebdata/',
          urlMatches: false,
        }),
      ),
    ).rejects.toThrow('story navigation ended at chrome-error://chromewebdata/');
  });

  it('rejects Storybook render errors before baseline reconciliation', async () => {
    await expect(
      waitForStoryReadiness(async () => ({...waiting, errorVisible: true})),
    ).rejects.toThrow('Storybook reported a story render error');
  });

  it('rejects a root that never renders within the bound', async () => {
    let time = 0;
    await expect(
      waitForStoryReadiness(async () => waiting, {
        timeoutMs: 2,
        pollMs: 0,
        now: () => time++,
        sleep: async () => {},
      }),
    ).rejects.toThrow('did not render story content before timeout');
  });
});

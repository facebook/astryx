// Copyright (c) Meta Platforms, Inc. and affiliates.

import {EventEmitter} from 'node:events';
import {describe, expect, it} from 'vitest';
import {
  isCleanRender,
  renderPage,
  renderUntilClean,
} from './cdn-page-render.mjs';

const URL = 'http://127.0.0.1:1/';
const CORE = 'https://esm.sh/@astryxdesign/core@0.7.4?external=react,react-dom';
const CSS =
  'https://cdn.jsdelivr.net/npm/@astryxdesign/core@0.7.4/dist/astryx.css';

/** A request as Playwright's page events carry it. */
function request(url, errorText = null) {
  return {
    url: () => url,
    failure: () => (errorText == null ? null : {errorText}),
  };
}

/** The error Playwright's `page.goto` throws when its wait never completes. */
function navigationTimeout() {
  const error = new Error('page.goto: Timeout 90000ms exceeded.');
  error.name = 'TimeoutError';
  return error;
}

/**
 * A browser `launch` whose pages run `onGoto(page, launchIndex)` while
 * navigating, then settle the navigation with `gotoErrors[launchIndex]` (none
 * resolves it) and answer the button query with `button`.
 */
function fakeLaunch({onGoto = () => {}, gotoErrors = [], button = 'Start'}) {
  let launches = 0;
  let closed = 0;
  const launch = async () => {
    const index = launches;
    launches += 1;
    const page = new EventEmitter();
    page.goto = async () => {
      onGoto(page, index);
      const error = gotoErrors[index];
      if (error != null) {
        throw error;
      }
    };
    page.getByRole = () => ({
      first: () => ({textContent: async () => button}),
    });
    return {
      newPage: async () => page,
      close: async () => {
        closed += 1;
      },
    };
  };
  return {launch, launches: () => launches, closed: () => closed};
}

describe('renderPage', () => {
  it('reports a page that goes idle and renders a button as clean', async () => {
    const {launch, closed} = fakeLaunch({
      onGoto: page => {
        const css = request(CSS);
        page.emit('request', css);
        page.emit('requestfinished', css);
      },
    });
    const result = await renderPage(URL, {launch});
    expect(result.button).toBe('Start');
    expect(isCleanRender(result)).toBe(true);
    expect(closed()).toBe(1);
  });

  it('reports a navigation that times out as an unclean render, naming the requests still in flight', async () => {
    const {launch, closed} = fakeLaunch({
      onGoto: page => {
        const css = request(CSS);
        const core = request(CORE);
        page.emit('request', css);
        page.emit('requestfinished', css);
        page.emit('request', core);
      },
      gotoErrors: [navigationTimeout()],
    });
    const result = await renderPage(URL, {launch});
    expect(result.timedOut).toBe(true);
    expect(result.pendingRequests).toEqual([CORE]);
    expect(isCleanRender(result)).toBe(false);
    expect(closed()).toBe(1);
  });

  it('counts a failed request as failed, not as still in flight', async () => {
    const {launch} = fakeLaunch({
      onGoto: page => {
        const core = request(CORE, 'net::ERR_BLOCKED_BY_ORB');
        page.emit('request', core);
        page.emit('requestfailed', core);
      },
      gotoErrors: [navigationTimeout()],
    });
    const result = await renderPage(URL, {launch});
    expect(result.failedRequests).toEqual([
      `${CORE} :: net::ERR_BLOCKED_BY_ORB`,
    ]);
    expect(result.pendingRequests).toEqual([]);
  });

  it('still throws a navigation error that is not a timeout: the local server failing is not a CDN blip', async () => {
    const refused = new Error('page.goto: net::ERR_CONNECTION_REFUSED');
    const {launch, closed} = fakeLaunch({gotoErrors: [refused]});
    await expect(renderPage(URL, {launch})).rejects.toBe(refused);
    expect(closed()).toBe(1);
  });
});

describe('renderUntilClean', () => {
  it('retries a navigation timeout once, then reports the requests still in flight', async () => {
    const {launch, launches} = fakeLaunch({
      onGoto: page => page.emit('request', request(CORE)),
      gotoErrors: [navigationTimeout(), navigationTimeout()],
    });
    const retries = [];
    const result = await renderUntilClean(() => renderPage(URL, {launch}), {
      attempts: 2,
      onRetry: attempt => retries.push(attempt),
    });
    expect(launches()).toBe(2);
    expect(retries).toEqual([1]);
    expect(result.timedOut).toBe(true);
    expect(result.pendingRequests).toEqual([CORE]);
  });

  it('stops at the first clean render after a timeout', async () => {
    const {launch, launches} = fakeLaunch({
      onGoto: (page, index) => {
        const core = request(CORE);
        page.emit('request', core);
        if (index > 0) {
          page.emit('requestfinished', core);
        }
      },
      gotoErrors: [navigationTimeout()],
    });
    const result = await renderUntilClean(() => renderPage(URL, {launch}), {
      attempts: 2,
    });
    expect(launches()).toBe(2);
    expect(isCleanRender(result)).toBe(true);
  });
});

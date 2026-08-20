// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scrollbarGutter.test.ts
 * @input Uses vitest and a stubbed viewport (jsdom does no layout)
 * @output Unit tests for holdScrollbarGutter
 * @position Testing; validates scrollbarGutter.ts implementation
 *
 * SYNC: When scrollbarGutter.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it} from 'vitest';
import {holdScrollbarGutter} from './scrollbarGutter';

/**
 * jsdom does no layout, so `documentElement.clientWidth` is 0 there. Stub the
 * pair the check reads: a 15px classic scrollbar is `innerWidth` 1024 against
 * a 1009px layout viewport.
 */
function stubViewport(innerWidth: number, clientWidth: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: innerWidth,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
}

const gutter = () => document.documentElement.style.scrollbarGutter;

describe('holdScrollbarGutter', () => {
  afterEach(() => {
    document.documentElement.style.cssText = '';
    // @ts-expect-error -- drop the stub so jsdom's own value comes back
    delete document.documentElement.clientWidth;
  });

  it('holds the gutter while a space-taking scrollbar is being hidden', () => {
    stubViewport(1024, 1009);

    const release = holdScrollbarGutter();

    expect(gutter()).toBe('stable');

    release();

    expect(gutter()).toBe('');
  });

  it('does nothing for an overlay scrollbar, which takes no space', () => {
    stubViewport(1024, 1024);

    const release = holdScrollbarGutter();

    expect(gutter()).toBe('');

    release();

    expect(gutter()).toBe('');
  });

  it('does nothing on a page too short to scroll', () => {
    // No scrollbar means nothing is hidden, so nothing shifts — and reserving
    // a gutter here would narrow the page instead of holding it still.
    stubViewport(1024, 1024);

    const release = holdScrollbarGutter();

    expect(gutter()).toBe('');

    release();
  });

  it('does nothing where there is no layout to measure', () => {
    stubViewport(1024, 0);

    const release = holdScrollbarGutter();

    expect(gutter()).toBe('');

    release();
  });

  it('holds once for nested overlays and gives it back on the last release', () => {
    stubViewport(1024, 1009);

    const first = holdScrollbarGutter();
    // The scrollbar is already hidden by the time a second overlay opens.
    stubViewport(1024, 1024);
    const second = holdScrollbarGutter();

    expect(gutter()).toBe('stable');

    first.call(null);

    expect(gutter()).toBe('stable');

    second();

    expect(gutter()).toBe('');
  });

  it('is unaffected by releasing out of order', () => {
    stubViewport(1024, 1009);

    const first = holdScrollbarGutter();
    const second = holdScrollbarGutter();

    second();

    expect(gutter()).toBe('stable');

    first();

    expect(gutter()).toBe('');
  });

  it('ignores a disposer called more than once', () => {
    stubViewport(1024, 1009);

    const first = holdScrollbarGutter();
    const second = holdScrollbarGutter();

    first();
    first();
    first();

    // The double-releases must not have dropped the count below the second
    // overlay's own hold.
    expect(gutter()).toBe('stable');

    second();

    expect(gutter()).toBe('');
  });

  it("restores the page's own scrollbar-gutter rather than clearing it", () => {
    stubViewport(1024, 1009);
    document.documentElement.style.scrollbarGutter = 'stable both-edges';

    const release = holdScrollbarGutter();

    expect(gutter()).toBe('stable');

    release();

    expect(gutter()).toBe('stable both-edges');
  });
});

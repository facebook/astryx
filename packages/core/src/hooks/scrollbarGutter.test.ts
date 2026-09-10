// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scrollbarGutter.test.ts
 * @input Uses vitest and a stubbed viewport + element box (jsdom does no layout)
 * @output Unit tests for holdScrollbarGutter
 * @position Testing; validates scrollbarGutter.ts implementation
 *
 * SYNC: When scrollbarGutter.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it} from 'vitest';
import {holdScrollbarGutter} from './scrollbarGutter';

/**
 * jsdom does no layout, so both halves of the measurement are stubbed: the
 * viewport (`innerWidth` vs `documentElement.clientWidth`) and the element's
 * own box, which `widths` reads from and a test flips to simulate the lock
 * widening it.
 */
function stub({
  innerWidth,
  clientWidth,
  widths,
}: {
  innerWidth: number;
  clientWidth: number;
  widths?: () => number;
}) {
  Object.defineProperty(window, 'innerWidth', {
    value: innerWidth,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
  if (widths) {
    document.body.getBoundingClientRect = () => ({width: widths()}) as DOMRect;
  }
}

const rootGutter = () => document.documentElement.style.scrollbarGutter;

describe('holdScrollbarGutter', () => {
  afterEach(() => {
    document.body.style.cssText = '';
    document.documentElement.style.cssText = '';
    // @ts-expect-error -- drop the stubs so jsdom's own values come back
    delete document.documentElement.clientWidth;
    // @ts-expect-error -- restore the prototype's implementation
    delete document.body.getBoundingClientRect;
  });

  it('holds the gutter open when a space-taking scrollbar is about to be hidden', () => {
    // A 1024px window over a 1009px layout viewport = a 15px classic scrollbar.
    stub({innerWidth: 1024, clientWidth: 1009});

    const hold = holdScrollbarGutter(document.body);

    expect(rootGutter()).toBe('stable');

    hold.settle();
    hold.release();

    expect(rootGutter()).toBe('');
  });

  it('leaves an overlay scrollbar alone — there is no gutter to hold', () => {
    stub({innerWidth: 1024, clientWidth: 1024});

    const hold = holdScrollbarGutter(document.body);
    hold.settle();

    expect(rootGutter()).toBe('');
    expect(document.body.style.paddingRight).toBe('');

    hold.release();
  });

  it('does not pad when holding the gutter kept the element still', () => {
    stub({innerWidth: 1024, clientWidth: 1009, widths: () => 1009});

    const hold = holdScrollbarGutter(document.body);
    hold.settle();

    expect(rootGutter()).toBe('stable');
    expect(document.body.style.paddingRight).toBe('');

    hold.release();
  });

  it('falls back to padding when the element grew anyway', () => {
    // What an engine without scrollbar-gutter support does: the gutter request
    // is ignored, the scrollbar goes away, and the element widens by 15px.
    let width = 1009;
    stub({innerWidth: 1024, clientWidth: 1009, widths: () => width});

    const hold = holdScrollbarGutter(document.body);
    width = 1024;
    hold.settle();

    expect(document.body.style.paddingRight).toBe('15px');

    hold.release();

    expect(document.body.style.paddingRight).toBe('');
  });

  it("adds to the page's own padding instead of replacing it", () => {
    let width = 1009;
    stub({innerWidth: 1024, clientWidth: 1009, widths: () => width});
    document.body.style.paddingRight = '24px';

    const hold = holdScrollbarGutter(document.body);
    width = 1024;
    hold.settle();

    expect(document.body.style.paddingRight).toBe('39px');

    hold.release();

    expect(document.body.style.paddingRight).toBe('24px');
  });

  it('restores the page\u2019s own scrollbar-gutter rather than clearing it', () => {
    stub({innerWidth: 1024, clientWidth: 1009});
    document.documentElement.style.scrollbarGutter = 'stable both-edges';

    const hold = holdScrollbarGutter(document.body);

    expect(rootGutter()).toBe('stable');

    hold.settle();
    hold.release();

    expect(rootGutter()).toBe('stable both-edges');
  });

  it('settles once, however many times it is called', () => {
    let width = 1009;
    stub({innerWidth: 1024, clientWidth: 1009, widths: () => width});

    const hold = holdScrollbarGutter(document.body);
    width = 1024;
    hold.settle();
    hold.settle();
    hold.settle();

    expect(document.body.style.paddingRight).toBe('15px');

    hold.release();
  });

  it('does nothing where there is no layout to measure', () => {
    stub({innerWidth: 1024, clientWidth: 0});

    const hold = holdScrollbarGutter(document.body);
    hold.settle();

    expect(rootGutter()).toBe('');
    expect(document.body.style.paddingRight).toBe('');

    hold.release();
  });
});

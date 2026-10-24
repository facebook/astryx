// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rootScrollStyles.test.ts
 * @input Uses vitest and the rootScrollStyles module
 * @output Unit tests for the root scroll-style claims (stacking, out-of-order
 *   release, the page's own value, per-property independence) and for the
 *   scroll-lock signal
 * @position Testing; validates rootScrollStyles.ts implementation
 *
 * SYNC: When rootScrollStyles.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it} from 'vitest';
import {
  claimRootScrollStyle,
  isScrollLockActive,
  reportScrollLock,
  subscribeScrollLock,
} from './rootScrollStyles';

const root = () => document.documentElement.style;

describe('claimRootScrollStyle', () => {
  afterEach(() => {
    document.documentElement.style.cssText = '';
  });

  it('sets the claimed styles and gives the page its own values back', () => {
    root().overflow = 'auto';

    const release = claimRootScrollStyle({
      overflow: 'hidden',
      overscrollBehaviorY: 'none',
    });
    expect(root().overflow).toBe('hidden');
    expect(root().overscrollBehaviorY).toBe('none');

    release();
    expect(root().overflow).toBe('auto');
    expect(root().overscrollBehaviorY).toBe('');
  });

  it('lets the latest claim win and restores the one beneath it', () => {
    const lock = claimRootScrollStyle({overflow: 'hidden'});
    const drawer = claimRootScrollStyle({overflow: 'clip'});
    expect(root().overflow).toBe('clip');

    drawer();
    expect(root().overflow).toBe('hidden');

    lock();
    expect(root().overflow).toBe('');
  });

  it('keeps the latest claim when an earlier one is released first', () => {
    root().overflow = 'auto';
    const lock = claimRootScrollStyle({overflow: 'hidden'});
    const drawer = claimRootScrollStyle({overflow: 'clip'});

    lock();
    expect(root().overflow).toBe('clip');

    drawer();
    expect(root().overflow).toBe('auto');
  });

  it('keeps each property to the claims that name it', () => {
    const lock = claimRootScrollStyle({overflow: 'hidden'});
    const refresh = claimRootScrollStyle({overscrollBehaviorY: 'none'});

    lock();
    expect(root().overflow).toBe('');
    expect(root().overscrollBehaviorY).toBe('none');

    refresh();
    expect(root().overscrollBehaviorY).toBe('');
  });

  it('does nothing on a second release', () => {
    const lock = claimRootScrollStyle({overflow: 'hidden'});
    const drawer = claimRootScrollStyle({overflow: 'clip'});

    lock();
    lock();
    expect(root().overflow).toBe('clip');

    drawer();
    expect(root().overflow).toBe('');
  });

  it('reads the page value when the first claim lands, not when the module loads', () => {
    root().overflow = 'scroll';

    const release = claimRootScrollStyle({overflow: 'clip'});
    expect(root().overflow).toBe('clip');

    release();
    expect(root().overflow).toBe('scroll');
  });
});

describe('scroll-lock signal', () => {
  it('reports only the changes between free and locked', () => {
    const states: boolean[] = [];
    const unsubscribe = subscribeScrollLock(isActive => states.push(isActive));

    reportScrollLock(1);
    reportScrollLock(1);
    expect(isScrollLockActive()).toBe(true);
    reportScrollLock(-1);
    expect(isScrollLockActive()).toBe(true);
    reportScrollLock(-1);

    expect(isScrollLockActive()).toBe(false);
    expect(states).toEqual([true, false]);
    unsubscribe();
  });

  it('stops calling a listener once it unsubscribes', () => {
    const states: boolean[] = [];
    const unsubscribe = subscribeScrollLock(isActive => states.push(isActive));
    unsubscribe();

    reportScrollLock(1);
    reportScrollLock(-1);

    expect(states).toEqual([]);
  });
});

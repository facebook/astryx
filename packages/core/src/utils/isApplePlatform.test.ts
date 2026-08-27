// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isApplePlatform.test.ts
 * @input Uses vitest, isApplePlatform
 * @output Unit tests for isApplePlatform
 * @position Testing; validates isApplePlatform.ts implementation
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {isApplePlatform} from './isApplePlatform';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isApplePlatform', () => {
  it('trusts a client-hints platform that names one', () => {
    vi.stubGlobal('navigator', {
      userAgentData: {platform: 'macOS'},
      platform: 'Win32',
    });
    expect(isApplePlatform()).toBe(true);

    vi.stubGlobal('navigator', {
      userAgentData: {platform: 'Windows'},
      platform: 'MacIntel',
    });
    expect(isApplePlatform()).toBe(false);
  });

  it.each([
    ['blank', ''],
    ['whitespace', '   '],
    ['the spec Unknown sentinel', 'Unknown'],
    ['unknown in any case', 'UNKNOWN'],
    ['a non-string', null],
  ])('falls through to navigator.platform on %s', (_label, platform) => {
    vi.stubGlobal('navigator', {
      userAgentData: {platform},
      platform: 'MacIntel',
    });
    expect(isApplePlatform()).toBe(true);

    vi.stubGlobal('navigator', {userAgentData: {platform}, platform: 'Win32'});
    expect(isApplePlatform()).toBe(false);
  });

  it('falls back to navigator.platform when client hints are absent', () => {
    vi.stubGlobal('navigator', {platform: 'iPhone'});
    expect(isApplePlatform()).toBe(true);

    vi.stubGlobal('navigator', {platform: 'Linux x86_64'});
    expect(isApplePlatform()).toBe(false);
  });

  it('answers false when there is no navigator at all', () => {
    vi.stubGlobal('navigator', undefined);
    expect(isApplePlatform()).toBe(false);
  });
});

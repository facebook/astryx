// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {isMatchableRange, satisfiesPublishedRange} from './version-range.mjs';

describe('hosted package version ranges', () => {
  it.each([
    '*',
    'x',
    '1.0.0',
    '^1.2',
    '^1.x',
    '~1.2.3',
    '>=1.0.0 <2.0.0',
    '1.x',
    '1.0.0 - 2.0.0',
    '^1.0.0 || ^2.0.0',
    '1.0.0-rc.1',
  ])('accepts the published-version range %s', range => {
    expect(isMatchableRange(range)).toBe(true);
  });

  it.each([
    '',
    'file:../ui',
    'link:../ui',
    'workspace:*',
    'npm:@acme/other@^1.0.0',
    'github:acme/ui#v1',
    'https://example.com/ui.tgz',
    'latest',
    '1.x.2',
    '01.2.3',
    '1.2.3+build..id',
  ])('rejects the non-version or malformed range %s', range => {
    expect(isMatchableRange(range)).toBe(false);
  });

  it.each([
    ['1.2.3', '1.2.3', true],
    ['1.5.0', '1.0.0 - 2.0.0', true],
    ['2.0.1', '1.0.0 - 2.0.0', false],
    ['0.10.9', '^0.10', true],
    ['0.11.0', '^0.10', false],
    ['0.9.0', '^0', true],
    ['1.0.0', '^0', false],
    ['0.0.9', '^0.0', true],
    ['0.1.0', '^0.0', false],
    ['1.9.0', '^1.x', true],
    ['2.0.0', '^1.x', false],
    ['2.4.0', '^1.0.0 || ^2.0.0', true],
    ['1.3.0-rc.1', '^1.2.0', false],
    ['1.2.3-rc.1', '1.2.3', false],
    ['1.2.3-rc.1', '*', false],
    ['1.2.3-rc.2', '>=1.2.3-rc.1 <1.2.3', true],
    ['1.2.3', '>=1.2.3-rc.1 <1.2.3', false],
    ['banana', '*', false],
    ['1.2.3+build..id', '*', false],
  ])('%s against %s is %s', (version, range, expected) => {
    expect(satisfiesPublishedRange(version, range)).toBe(expected);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {isValidSemver, semverCompare, semverGt, semverGte} from './semver.mjs';

describe('semverCompare', () => {
  it('orders patch versions numerically (not lexicographically)', () => {
    // The bug fix that motivated this util: '0.0.10' < '0.0.9' under
    // string comparison, but '0.0.10' > '0.0.9' under semver.
    expect(semverCompare('0.0.10', '0.0.9')).toBeGreaterThan(0);
    expect(semverCompare('0.0.9', '0.0.10')).toBeLessThan(0);
    expect(semverCompare('0.0.20', '0.0.5')).toBeGreaterThan(0);
  });

  it('returns 0 for equal versions', () => {
    expect(semverCompare('1.2.3', '1.2.3')).toBe(0);
  });

  it('orders by major, then minor, then patch', () => {
    expect(semverCompare('2.0.0', '1.99.99')).toBeGreaterThan(0);
    expect(semverCompare('1.2.0', '1.1.99')).toBeGreaterThan(0);
  });

  it('strips prerelease tags before comparing', () => {
    expect(semverCompare('0.0.5-beta.1', '0.0.5')).toBe(0);
  });

  it('treats missing components as zero', () => {
    expect(semverCompare('1.0', '1.0.0')).toBe(0);
  });
});

describe('semverGt / semverGte', () => {
  it('semverGte is true for equal versions', () => {
    expect(semverGte('0.0.5', '0.0.5')).toBe(true);
    expect(semverGt('0.0.5', '0.0.5')).toBe(false);
  });

  it('semverGte handles double-digit patches correctly', () => {
    // The original upgrade-gate bug: string compare said 0.0.9 >= 0.0.10.
    expect(semverGte('0.0.9', '0.0.10')).toBe(false);
    expect(semverGte('0.0.10', '0.0.9')).toBe(true);
  });
});

describe('isValidSemver', () => {
  it('accepts MAJOR.MINOR.PATCH', () => {
    expect(isValidSemver('0.0.5')).toBe(true);
    expect(isValidSemver('1.2.3')).toBe(true);
    expect(isValidSemver('10.20.30')).toBe(true);
  });

  it('accepts prerelease and build metadata', () => {
    expect(isValidSemver('1.0.0-beta.1')).toBe(true);
    expect(isValidSemver('1.0.0+build.5')).toBe(true);
  });

  it('rejects bogus values', () => {
    expect(isValidSemver('bogus')).toBe(false);
    expect(isValidSemver('1.0')).toBe(false);
    expect(isValidSemver('v1.0.0')).toBe(false);
    expect(isValidSemver('')).toBe(false);
    expect(isValidSemver(null)).toBe(false);
    expect(isValidSemver(undefined)).toBe(false);
    expect(isValidSemver(123)).toBe(false);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Tests for gap-report safety gates: dry-run-by-default in non-interactive
 * mode, --commit required to actually file, --no-report suppression in swizzle,
 * and ASTRYX_GAP_REPORT=off honored everywhere.
 *
 * Regression cases for issues #2370 and #2371: real gap-report issues filed
 * unintentionally in CI/non-TTY runs.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {shouldActuallyFile, formatPreview} from './gap-report.mjs';

describe('shouldActuallyFile', () => {
  it('returns false in non-TTY mode by default (dry-run by default in CI)', () => {
    expect(shouldActuallyFile({isTTY: false})).toBe(false);
  });

  it('returns false when --json is set, even with TTY', () => {
    expect(shouldActuallyFile({isTTY: true, json: true})).toBe(false);
  });

  it('returns false when --dry-run is explicitly set', () => {
    expect(shouldActuallyFile({isTTY: true, dryRun: true})).toBe(false);
  });

  it('returns true in TTY mode without dry-run/json (interactive prompts will gate)', () => {
    expect(shouldActuallyFile({isTTY: true})).toBe(true);
  });

  it('returns true with --commit even in non-TTY mode', () => {
    expect(shouldActuallyFile({isTTY: false, commit: true})).toBe(true);
  });

  it('--commit overrides --json being set', () => {
    expect(shouldActuallyFile({isTTY: false, commit: true, json: true})).toBe(
      true,
    );
  });

  it('--dry-run wins over --commit (safety)', () => {
    expect(
      shouldActuallyFile({isTTY: true, commit: true, dryRun: true}),
    ).toBe(false);
  });
});

describe('formatPreview', () => {
  it('renders a github-mode preview with title, body, and repo', () => {
    const out = formatPreview({
      mode: 'github',
      repo: 'facebookexperimental/xds',
      title: '[gap] Button: missing compact variant',
      body: '## User Intention\n\nNeed a compact variant',
    });
    expect(out).toContain('Would file GitHub issue on facebookexperimental/xds');
    expect(out).toContain('[gap] Button');
    expect(out).toContain('Need a compact variant');
    expect(out).toContain('Labels: gap-report');
  });

  it('renders disabled mode without filing instructions', () => {
    const out = formatPreview({mode: 'disabled'});
    expect(out).toContain('Gap reporting is disabled');
    expect(out).not.toContain('Would file');
  });

  it('renders custom-command mode', () => {
    const out = formatPreview({
      mode: 'custom',
      command: './scripts/report.sh',
      title: 't',
      body: 'b',
    });
    expect(out).toContain('Would invoke custom command: ./scripts/report.sh');
  });
});

describe('ASTRYX_GAP_REPORT=off env var', () => {
  let originalEnv;
  beforeEach(() => {
    originalEnv = process.env.ASTRYX_GAP_REPORT;
  });
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ASTRYX_GAP_REPORT;
    else process.env.ASTRYX_GAP_REPORT = originalEnv;
    vi.resetModules();
  });

  it('disables gap reporting when set to "off"', async () => {
    process.env.ASTRYX_GAP_REPORT = 'off';
    vi.resetModules();
    const {loadGapReportConfig, createGapReport} = await import(
      '../utils/github.mjs'
    );
    expect(loadGapReportConfig().enabled).toBe(false);

    // createGapReport must return null and never invoke gh.
    const result = createGapReport({
      component: 'Button',
      category: 'other',
      intention: 'test',
    });
    expect(result).toBeNull();
  });

  it('also accepts "false" and "0" as disable values', async () => {
    process.env.ASTRYX_GAP_REPORT = 'false';
    vi.resetModules();
    let mod = await import('../utils/github.mjs');
    expect(mod.loadGapReportConfig().enabled).toBe(false);

    process.env.ASTRYX_GAP_REPORT = '0';
    vi.resetModules();
    mod = await import('../utils/github.mjs');
    expect(mod.loadGapReportConfig().enabled).toBe(false);
  });
});

describe('buildGapReportPreview', () => {
  let originalEnv;
  beforeEach(() => {
    originalEnv = process.env.ASTRYX_GAP_REPORT;
    // Force github mode (default) for these tests.
    delete process.env.ASTRYX_GAP_REPORT;
  });
  afterEach(() => {
    if (originalEnv === undefined) delete process.env.ASTRYX_GAP_REPORT;
    else process.env.ASTRYX_GAP_REPORT = originalEnv;
  });

  it('renders title and body without invoking gh', async () => {
    vi.resetModules();
    const {buildGapReportPreview} = await import('../utils/github.mjs');
    const preview = buildGapReportPreview({
      component: 'Button',
      category: 'missing_variant',
      intention: 'Need compact variant for tables',
    });
    expect(preview.mode).toBe('github');
    expect(preview.enabled).toBe(true);
    expect(preview.title).toBe(
      '[gap] Button: Need compact variant for tables',
    );
    expect(preview.body).toContain('| **Component** | Button |');
    expect(preview.body).toContain('Need compact variant for tables');
    expect(preview.repo).toBe('facebookexperimental/xds');
  });

  it('reports disabled mode when env var is off', async () => {
    process.env.ASTRYX_GAP_REPORT = 'off';
    vi.resetModules();
    const {buildGapReportPreview} = await import('../utils/github.mjs');
    const preview = buildGapReportPreview({
      component: 'Button',
      category: 'other',
      intention: 'x',
    });
    expect(preview.mode).toBe('disabled');
    expect(preview.enabled).toBe(false);
  });
});

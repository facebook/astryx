// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {mergeAxeRuns, scanIteration, type RawAxeRun} from './axe-previews.js';
import {enumeratePreviews} from './utils.js';

const dirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-axe-'));
  dirs.push(d);
  return d;
}
afterAll(() => dirs.forEach(d => fs.rmSync(d, {recursive: true})));

function run(theme: string, overrides: Partial<RawAxeRun> = {}): RawAxeRun {
  return {theme, violations: [], passes: 20, incomplete: 0, ...overrides};
}

// ============================================================
// mergeAxeRuns — theme union logic (pure)
// ============================================================

describe('mergeAxeRuns', () => {
  it('merges the same rule across themes with max nodes and both themes recorded', () => {
    const merged = mergeAxeRuns('astryx', [
      run('light', {
        violations: [
          {id: 'color-contrast', impact: 'serious', help: 'contrast', nodes: 2},
        ],
      }),
      run('dark', {
        violations: [
          {id: 'color-contrast', impact: 'serious', help: 'contrast', nodes: 3},
        ],
      }),
    ]);
    expect(merged.violations).toHaveLength(1);
    expect(merged.violations[0].nodes).toBe(3);
    expect(merged.violations[0].themes).toEqual(['light', 'dark']);
  });

  it('keeps a theme-specific violation attributed to only that theme', () => {
    const merged = mergeAxeRuns('astryx', [
      run('light'),
      run('dark', {
        violations: [
          {id: 'color-contrast', impact: 'serious', help: 'contrast', nodes: 1},
        ],
      }),
    ]);
    expect(merged.violations[0].themes).toEqual(['dark']);
    expect(merged.themesScanned).toEqual(['light', 'dark']);
  });

  it('escalates impact to the highest seen across themes', () => {
    const merged = mergeAxeRuns('astryx', [
      run('light', {
        violations: [
          {id: 'link-name', impact: 'moderate', help: 'links', nodes: 1},
        ],
      }),
      run('dark', {
        violations: [
          {id: 'link-name', impact: 'serious', help: 'links', nodes: 1},
        ],
      }),
    ]);
    expect(merged.violations[0].impact).toBe('serious');
  });

  it('defaults a missing impact to moderate', () => {
    const merged = mergeAxeRuns('astryx', [
      run('light', {
        violations: [{id: 'region', impact: null, help: 'region', nodes: 1}],
      }),
    ]);
    expect(merged.violations[0].impact).toBe('moderate');
  });

  it('takes the strictest pass count and the loosest incomplete count', () => {
    const merged = mergeAxeRuns('astryx', [
      run('light', {passes: 24, incomplete: 0}),
      run('dark', {passes: 22, incomplete: 2}),
    ]);
    expect(merged.passes).toBe(22);
    expect(merged.incomplete).toBe(2);
  });

  it('returns an empty result for zero runs', () => {
    const merged = mergeAxeRuns('astryx', []);
    expect(merged).toEqual({
      target: 'astryx',
      themesScanned: [],
      violations: [],
      passes: 0,
      incomplete: 0,
    });
  });
});

// ============================================================
// enumeratePreviews — shared preview discovery (moved to utils)
// ============================================================

describe('enumeratePreviews', () => {
  it('lists previews from the manifest, skipping entries whose files are missing', () => {
    const iterDir = tmpDir();
    const previewsDir = path.join(iterDir, 'previews', 'tc-1');
    fs.mkdirSync(previewsDir, {recursive: true});
    fs.writeFileSync(path.join(previewsDir, 'astryx.html'), '<html></html>');
    fs.writeFileSync(
      path.join(iterDir, 'previews', 'manifest.json'),
      JSON.stringify({
        'tc-1': {astryx: 'previews/tc-1/astryx.html'},
        'tc-2': {astryx: 'previews/tc-2/astryx.html'}, // file missing
      }),
    );
    const previews = enumeratePreviews(iterDir);
    expect(previews).toHaveLength(1);
    expect(previews[0].promptId).toBe('tc-1');
    expect(previews[0].target).toBe('astryx');
    expect(fs.existsSync(previews[0].path)).toBe(true);
  });

  it('falls back to scanning for HTML files when no manifest exists', () => {
    const iterDir = tmpDir();
    const previewsDir = path.join(iterDir, 'previews', 'dd-2');
    fs.mkdirSync(previewsDir, {recursive: true});
    fs.writeFileSync(path.join(previewsDir, 'html.html'), '<html></html>');
    const previews = enumeratePreviews(iterDir);
    expect(previews).toHaveLength(1);
    expect(previews[0]).toMatchObject({promptId: 'dd-2', target: 'html'});
  });

  it('filters by the requested prompt ids', () => {
    const iterDir = tmpDir();
    for (const id of ['tc-1', 'tc-2']) {
      const d = path.join(iterDir, 'previews', id);
      fs.mkdirSync(d, {recursive: true});
      fs.writeFileSync(path.join(d, 'astryx.html'), '<html></html>');
    }
    fs.writeFileSync(
      path.join(iterDir, 'previews', 'manifest.json'),
      JSON.stringify({
        'tc-1': {astryx: 'previews/tc-1/astryx.html'},
        'tc-2': {astryx: 'previews/tc-2/astryx.html'},
      }),
    );
    const previews = enumeratePreviews(iterDir, ['tc-2']);
    expect(previews).toHaveLength(1);
    expect(previews[0].promptId).toBe('tc-2');
  });
});

// ============================================================
// scanIteration — end-to-end with a real browser (skipped when
// no local Chromium; CI installs it only in the screenshot job)
// ============================================================

async function chromiumAvailable(): Promise<boolean> {
  try {
    const {chromium} = await import('playwright');
    const p = chromium.executablePath();
    return !!p && fs.existsSync(p);
  } catch {
    return false;
  }
}

const hasChromium = await chromiumAvailable();

describe.skipIf(!hasChromium)('scanIteration (integration)', () => {
  it('scans a rendered preview with axe and writes the sidecar', async () => {
    const resultsDir = tmpDir();
    const iterDir = path.join(resultsDir, 'axetest1');
    const previewDir = path.join(iterDir, 'previews', 'tc-1');
    fs.mkdirSync(previewDir, {recursive: true});
    fs.writeFileSync(
      path.join(previewDir, 'html.html'),
      [
        '<!doctype html>',
        '<html lang="en"><head><title>Fixture</title></head><body>',
        '<main><h1>Fixture</h1>',
        '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />',
        '</main></body></html>',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(iterDir, 'previews', 'manifest.json'),
      JSON.stringify({'tc-1': {html: 'previews/tc-1/html.html'}}),
    );
    fs.writeFileSync(
      path.join(iterDir, 'manifest.json'),
      JSON.stringify({config: {target: 'html'}}),
    );

    const results = await scanIteration({resultsDir, iterationId: 'axetest1'});
    expect(results).not.toBeNull();
    const forPrompt = results?.['tc-1'];
    expect(forPrompt?.target).toBe('html');
    expect(forPrompt?.themesScanned).toEqual(['light', 'dark']);
    expect(forPrompt?.violations.map(v => v.id)).toContain('image-alt');
    const imageAlt = forPrompt?.violations.find(v => v.id === 'image-alt');
    expect(imageAlt?.themes).toEqual(['light', 'dark']);

    const sidecar = JSON.parse(
      fs.readFileSync(path.join(iterDir, 'axe-results.json'), 'utf-8'),
    );
    expect(sidecar['tc-1'].violations.length).toBeGreaterThan(0);
  }, 120_000);
});

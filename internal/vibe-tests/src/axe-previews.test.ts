// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  mergeAxeRuns,
  resolveEffectiveTheme,
  scanIteration,
  selectPreviewsForIteration,
  type RawAxeRun,
} from './axe-previews.js';
import {enumeratePreviews, hashContent, serveStatic} from './utils.js';

const dirs: string[] = [];
function tmpDir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-axe-'));
  dirs.push(d);
  return d;
}
afterAll(() => dirs.forEach(d => fs.rmSync(d, {recursive: true})));

function run(theme: string, overrides: Partial<RawAxeRun> = {}): RawAxeRun {
  return {
    theme,
    effectiveTheme: theme,
    violations: [],
    passes: 20,
    incomplete: 0,
    passedRules: [],
    incompleteRules: [],
    ...overrides,
  };
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

  it('unions the evaluated rule ids across themes', () => {
    const merged = mergeAxeRuns('astryx', [
      run('light', {
        passedRules: ['html-has-lang', 'image-alt'],
        incompleteRules: ['color-contrast'],
      }),
      run('dark', {
        passedRules: ['html-has-lang', 'label'],
        incompleteRules: [],
      }),
    ]);
    expect(merged.passedRules).toEqual(['html-has-lang', 'image-alt', 'label']);
    expect(merged.incompleteRules).toEqual(['color-contrast']);
  });

  it('attributes a scan to the theme that actually rendered', () => {
    // A page pinned to light ignores the dark request: its "dark" scan is a
    // second light scan and must not claim dark coverage
    const merged = mergeAxeRuns('astryx', [
      run('light', {
        violations: [
          {id: 'region', impact: 'moderate', help: 'region', nodes: 1},
        ],
      }),
      run('dark', {
        effectiveTheme: 'light',
        violations: [
          {id: 'region', impact: 'moderate', help: 'region', nodes: 1},
        ],
      }),
    ]);
    expect(merged.themesScanned).toEqual(['light']);
    expect(merged.effectiveThemes).toEqual({light: 'light', dark: 'light'});
    expect(merged.violations[0].themes).toEqual(['light']);
  });

  it('returns an empty result for zero runs', () => {
    const merged = mergeAxeRuns('astryx', []);
    expect(merged).toEqual({
      target: 'astryx',
      themesScanned: [],
      effectiveThemes: {},
      violations: [],
      passes: 0,
      incomplete: 0,
      passedRules: [],
      incompleteRules: [],
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

  it('returns an empty list when the previews directory does not exist', () => {
    expect(enumeratePreviews(tmpDir())).toEqual([]);
  });

  it('returns an empty list for a malformed manifest whose entries are not target maps', () => {
    const iterDir = tmpDir();
    fs.mkdirSync(path.join(iterDir, 'previews'), {recursive: true});
    fs.writeFileSync(
      path.join(iterDir, 'previews', 'manifest.json'),
      JSON.stringify({'tc-1': 'previews/tc-1/html.html'}),
    );
    expect(enumeratePreviews(iterDir)).toEqual([]);
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
// resolveEffectiveTheme — which scheme a scan actually rendered in
// ============================================================

describe('resolveEffectiveTheme', () => {
  it('reports the pinned scheme when the page ignores the request', () => {
    expect(resolveEffectiveTheme('dark', 'light')).toBe('light');
    expect(resolveEffectiveTheme('light', 'only dark')).toBe('dark');
  });

  it('follows the request when the page allows both schemes or declares none', () => {
    expect(resolveEffectiveTheme('dark', 'light dark')).toBe('dark');
    expect(resolveEffectiveTheme('dark', 'normal')).toBe('dark');
    expect(resolveEffectiveTheme('light', '')).toBe('light');
  });
});

// ============================================================
// serveStatic — shared preview server
// ============================================================

describe('serveStatic', () => {
  it('serves a file requested with a query string', async () => {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'page.html'), '<p>hi</p>');
    const server = await serveStatic(dir);
    try {
      const res = await fetch(`${server.url}/page.html?theme=dark`);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('<p>hi</p>');
    } finally {
      await server.close();
    }
  });
});

// ============================================================
// selectPreviewsForIteration — only this iteration's own renders
// ============================================================

describe('selectPreviewsForIteration', () => {
  const previews = [
    {promptId: 'tc-1', target: 'astryx', path: '/p/tc-1/astryx.html'},
    {promptId: 'tc-1', target: 'html', path: '/p/tc-1/html.html'},
    {promptId: 'tc-2', target: 'html', path: '/p/tc-2/html.html'},
  ];

  it('keeps only previews built from the iteration target', () => {
    expect(selectPreviewsForIteration(previews, 'html')).toEqual([
      previews[1],
      previews[2],
    ]);
  });

  it('never substitutes another target when the iteration target is missing', () => {
    // tc-2 has no astryx build (e.g. it failed to compile); its html render
    // is another iteration's code and must not be scored as astryx
    expect(selectPreviewsForIteration(previews, 'astryx')).toEqual([
      previews[0],
    ]);
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
    const code = 'export default () => <img src="/a.gif" />;';
    fs.mkdirSync(path.join(iterDir, 'results'));
    fs.writeFileSync(path.join(iterDir, 'results', 'tc-1.tsx'), code);

    const results = await scanIteration({resultsDir, iterationId: 'axetest1'});
    expect(results).not.toBeNull();
    const forPrompt = results?.['tc-1'];
    expect(forPrompt?.target).toBe('html');
    expect(forPrompt?.themesScanned).toEqual(['light', 'dark']);
    expect(forPrompt?.violations.map(v => v.id)).toContain('image-alt');
    const imageAlt = forPrompt?.violations.find(v => v.id === 'image-alt');
    expect(imageAlt?.themes).toEqual(['light', 'dark']);

    // The evaluated rule ids are what lets universal-eval waive a static
    // finding only on evidence
    expect(forPrompt?.passedRules).toContain('html-has-lang');
    expect(forPrompt?.passedRules).not.toContain('image-alt');
    // Stamped with the scanned code, so a later edit makes the entry stale
    expect(forPrompt?.sourceHash).toBe(hashContent(code));

    const sidecar = JSON.parse(
      fs.readFileSync(path.join(iterDir, 'axe-results.json'), 'utf-8'),
    );
    expect(sidecar['tc-1'].violations.length).toBeGreaterThan(0);
    expect(sidecar['tc-1'].passedRules).toContain('html-has-lang');
  }, 120_000);

  it('writes a sidecar per iteration from the shared previews directory', async () => {
    // build-previews --iterations iterA,iterB writes both iterations'
    // previews under iterA/previews; tc-2's astryx build is missing
    const resultsDir = tmpDir();
    const page = (title: string) =>
      `<!doctype html><html lang="en"><head><title>${title}</title></head>` +
      `<body><main><h1>${title}</h1></main></body></html>`;
    const previewsDir = path.join(resultsDir, 'iterA', 'previews');
    const files: Record<string, Record<string, string>> = {
      'tc-1': {astryx: 'tc-1/astryx.html', html: 'tc-1/html.html'},
      'tc-2': {html: 'tc-2/html.html'},
    };
    const manifest: Record<string, Record<string, string>> = {};
    for (const [promptId, targets] of Object.entries(files)) {
      manifest[promptId] = {};
      for (const [target, rel] of Object.entries(targets)) {
        fs.mkdirSync(path.join(previewsDir, promptId), {recursive: true});
        fs.writeFileSync(path.join(previewsDir, rel), page(rel));
        manifest[promptId][target] = `previews/${rel}`;
      }
    }
    fs.writeFileSync(
      path.join(previewsDir, 'manifest.json'),
      JSON.stringify(manifest),
    );
    for (const [id, target] of [
      ['iterA', 'astryx'],
      ['iterB', 'html'],
    ]) {
      fs.mkdirSync(path.join(resultsDir, id), {recursive: true});
      fs.writeFileSync(
        path.join(resultsDir, id, 'manifest.json'),
        JSON.stringify({config: {target}}),
      );
    }

    for (const iterationId of ['iterA', 'iterB']) {
      await scanIteration({
        resultsDir,
        iterationId,
        previewsFrom: 'iterA',
        themes: ['light'],
      });
    }

    const read = (id: string) =>
      JSON.parse(
        fs.readFileSync(path.join(resultsDir, id, 'axe-results.json'), 'utf-8'),
      );
    const iterA = read('iterA');
    expect(Object.keys(iterA)).toEqual(['tc-1']);
    expect(iterA['tc-1'].target).toBe('astryx');
    const iterB = read('iterB');
    expect(Object.keys(iterB).sort()).toEqual(['tc-1', 'tc-2']);
    expect(iterB['tc-1'].target).toBe('html');
    expect(iterB['tc-2'].target).toBe('html');
  }, 120_000);

  // Text that passes contrast in light (#000 on #fff) and fails in dark
  // (#555 on #444) — only a scan that really rendered dark can see it
  const DARK_ONLY_CONTRAST =
    '<p style="color: light-dark(#000, #555); background: light-dark(#fff, #444)">' +
    'Dark-only contrast failure</p>';

  async function scanFixture(head: string, body: string) {
    const resultsDir = tmpDir();
    const iterDir = path.join(resultsDir, 'themetest');
    fs.mkdirSync(path.join(iterDir, 'previews', 'tc-1'), {recursive: true});
    fs.writeFileSync(
      path.join(iterDir, 'previews', 'tc-1', 'html.html'),
      '<!doctype html><html lang="en"><head><title>Fixture</title>' +
        `${head}</head><body><main><h1>Fixture</h1>${body}</main></body></html>`,
    );
    fs.writeFileSync(
      path.join(iterDir, 'manifest.json'),
      JSON.stringify({config: {target: 'html'}}),
    );
    const results = await scanIteration({resultsDir, iterationId: 'themetest'});
    return results?.['tc-1'];
  }

  it('scans dark for real when the preview takes its mode from ?theme', async () => {
    // Mirrors the Astryx preview entry: mode comes from ?theme, default light
    const forPrompt = await scanFixture(
      '<script>document.documentElement.style.colorScheme = ' +
        "new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light';" +
        '</script>',
      DARK_ONLY_CONTRAST,
    );
    const contrast = forPrompt?.violations.find(v => v.id === 'color-contrast');
    expect(contrast?.themes).toEqual(['dark']);
    expect(forPrompt?.themesScanned).toEqual(['light', 'dark']);
    expect(forPrompt?.effectiveThemes).toEqual({light: 'light', dark: 'dark'});
  }, 120_000);

  it('does not claim a dark scan for a preview pinned to light', async () => {
    // A preview built with <Theme mode="light">: the theme root pins light
    // even though the page itself allows both schemes
    const forPrompt = await scanFixture(
      '<style>:root { color-scheme: light dark; }</style>',
      `<div data-astryx-theme style="color-scheme: light">${DARK_ONLY_CONTRAST}</div>`,
    );
    expect(forPrompt?.themesScanned).toEqual(['light']);
    expect(forPrompt?.effectiveThemes).toEqual({
      light: 'light',
      dark: 'light',
    });
    expect(forPrompt?.violations.map(v => v.id)).not.toContain(
      'color-contrast',
    );
  }, 120_000);
});

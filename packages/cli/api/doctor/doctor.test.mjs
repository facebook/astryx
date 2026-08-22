// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the `doctor` leaf (api/doctor/doctor.mjs). `doctor`
 * had no api-level tests; this locks the envelope shape and the summary
 * invariant (the counts must always add up to the number of checks).
 */

import {describe, it, expect, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  doctor,
  checkVersionAlignment,
  checkThemeBuilt,
  findBuiltThemes,
  isThemeBuildWired,
} from './doctor.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

/** Throwaway project dirs, cleaned up after each test. */
const tmpDirs = [];
function mkProject(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doctor-'));
  tmpDirs.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), {recursive: true});
    fs.writeFileSync(abs, content);
  }
  return dir;
}
afterEach(() => {
  while (tmpDirs.length) {
    fs.rmSync(tmpDirs.pop(), {recursive: true, force: true});
  }
});

describe('doctor leaf', () => {
  it('returns a `doctor` envelope with checks + summary', async () => {
    const r = await doctor({cwd});
    expect(r.type).toBe('doctor');
    expect(Array.isArray(r.data.checks)).toBe(true);
    expect(r.data.checks.length).toBeGreaterThan(0);
    expect(r.data.summary).toBeDefined();
  }, SLOW);

  it('every check has an id, label, and a valid status', async () => {
    const r = await doctor({cwd});
    for (const c of r.data.checks) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.label).toBe('string');
      expect(['pass', 'warn', 'fail', 'info']).toContain(c.status);
    }
  }, SLOW);

  it('summary counts sum to the number of checks (invariant)', async () => {
    const r = await doctor({cwd});
    const {pass, warn, fail, info} = r.data.summary;
    expect(pass + warn + fail + info).toBe(r.data.checks.length);
  }, SLOW);

  it('reports the core node-version and core-installed checks', async () => {
    const r = await doctor({cwd});
    const ids = r.data.checks.map(c => c.id);
    expect(ids).toContain('node-version');
    expect(ids).toContain('core-installed');
  }, SLOW);
});

describe('doctor leaf — degradation & error paths', () => {
  it('does not crash on multiple config files; reports a config FAIL', async () => {
    const dir = mkProject({
      'package.json': '{"name":"x"}',
      'astryx.config.mjs': 'export default {};',
      'astryx.config.js': 'export default {};',
    });
    const r = await doctor({cwd: dir});
    const config = r.data.checks.find(c => c.id === 'config');
    expect(config).toBeDefined();
    expect(config.status).toBe('fail');
    expect(config.message).toMatch(/multiple|exactly one/i);
  }, SLOW);

  it('reports a config FAIL (not a crash) when astryx.config.mjs throws on import', async () => {
    const dir = mkProject({
      'package.json': '{"name":"x"}',
      'astryx.config.mjs': 'throw new Error("boom");\nexport default {};',
    });
    const r = await doctor({cwd: dir});
    const config = r.data.checks.find(c => c.id === 'config');
    expect(config.status).toBe('fail');
    expect(config.message).toMatch(/failed to load/i);
  }, SLOW);

  it('flags a non-object config default export as FAIL', async () => {
    const dir = mkProject({
      'package.json': '{"name":"x"}',
      'astryx.config.mjs': 'export default 42;',
    });
    const r = await doctor({cwd: dir});
    const config = r.data.checks.find(c => c.id === 'config');
    expect(config.status).toBe('fail');
    expect(config.message).toMatch(/not an object/i);
  }, SLOW);

  it('degrades gracefully on invalid package.json', async () => {
    const dir = mkProject({'package.json': '{ not json }'});
    const r = await doctor({cwd: dir});
    const {pass, warn, fail, info} = r.data.summary;
    expect(pass + warn + fail + info).toBe(r.data.checks.length);
  }, SLOW);
});

describe('doctor — checkVersionAlignment', () => {
  it('skips (info) when the core version is not comparable semver', () => {
    const dir = mkProject({
      'node_modules/@astryxdesign/core/package.json': JSON.stringify({
        name: '@astryxdesign/core',
        version: 'workspace:*',
      }),
    });
    const c = checkVersionAlignment({
      cwd: dir,
      coreDir: path.join(dir, 'node_modules/@astryxdesign/core'),
      nodeVersion: '',
      configPath: null,
      configTheme: null,
    });
    expect(c.status).toBe('info');
    expect(c.fix ?? '').not.toMatch(/NaN|undefined/);
  });

  it('does not leak NaN/undefined for a comparable semver core version', () => {
    const dir = mkProject({
      'node_modules/@astryxdesign/core/package.json': JSON.stringify({
        name: '@astryxdesign/core',
        version: '0.0.1',
      }),
    });
    const c = checkVersionAlignment({
      cwd: dir,
      coreDir: path.join(dir, 'node_modules/@astryxdesign/core'),
      nodeVersion: '',
      configPath: null,
      configTheme: null,
    });
    expect(['pass', 'warn']).toContain(c.status);
    expect(c.message).not.toMatch(/NaN|undefined/);
    if (c.fix) expect(c.fix).not.toMatch(/NaN|undefined/);
  });
});

const THEME_SRC = [
  "import {defineTheme} from '@astryxdesign/core/theme';",
  "export const appTheme = defineTheme({name: 'app', tokens: {}});",
].join('\n');

/** The banner `astryx theme build` writes at the top of generated CSS. */
const banner = (source, out) =>
  [
    '/*',
    ' * @generated by `astryx theme build` — do not edit manually.',
    ` * Source: ${source}`,
    ` * Command: astryx theme build ${source}${out ? ` --out ${out}` : ''}`,
    ' * CLI: @astryxdesign/cli@0.3.0',
    ' * Core: @astryxdesign/core@0.3.0',
    ' */',
    '',
    '[data-astryx-theme="app"] { --color-accent: #ff3366; }',
  ].join('\n');

describe('findBuiltThemes', () => {
  it('recovers the source and --out from the generated banner', () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    const found = findBuiltThemes(dir);
    expect(found).toHaveLength(1);
    expect(found[0].source).toBe('src/themes/appTheme.ts');
    expect(found[0].out).toBe('src/themes/app.css');
    expect(found[0].dir).toBe(dir);
  });

  it('handles a banner with no --out', () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/appTheme.ts', null),
    });
    expect(findBuiltThemes(dir)[0].out).toBeNull();
  });

  it('captures the CLI and core versions the artifact was built with', () => {
    // These drive the staleness pre-filter: the versions are embedded in the
    // output, so a dependency bump alone makes an artifact stale even though
    // it is still the newer file on disk. mtime cannot see that.
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    const [found] = findBuiltThemes(dir);
    expect(found.cli).toBe('0.3.0');
    expect(found.core).toBe('0.3.0');
  });

  it('ignores hand-written CSS', () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/app.css': '.card { padding: 8px; }',
      'src/globals.css': '/* our styles */\n:root { --app-w: 100px; }',
    });
    expect(findBuiltThemes(dir)).toEqual([]);
  });

  it('ignores build output and dependency directories', () => {
    const dir = mkProject({
      'package.json': '{}',
      'dist/theme.css': banner('src/themes/appTheme.ts', 'dist/theme.css'),
      'node_modules/@astryxdesign/theme-x/theme.css': banner('src/x.ts', 'theme.css'),
    });
    expect(findBuiltThemes(dir)).toEqual([]);
  });

  it('resolves the package directory the build ran in, not the CSS directory', () => {
    // Banner paths are relative to the package root; resolving them against
    // the CSS file's own directory would report every artifact "missing".
    const dir = mkProject({
      'package.json': '{}',
      'apps/web/package.json': '{}',
      'apps/web/src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    expect(findBuiltThemes(dir)[0].dir).toBe(path.join(dir, 'apps/web'));
  });
});

describe('isThemeBuildWired', () => {
  it('detects a build reached indirectly through another script', () => {
    // docsite's shape: dev -> generate -> build:theme
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {
          'build:theme': 'astryx theme build src/themes/appTheme.ts',
          generate: 'pnpm build:theme && node scripts/gen.mjs',
          dev: 'pnpm generate && next dev',
        },
      }),
    });
    expect(isThemeBuildWired(dir)).toBe(true);
  });

  it('detects a direct predev hook', () => {
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {predev: 'astryx theme build src/themes/appTheme.ts', dev: 'vite'},
      }),
    });
    expect(isThemeBuildWired(dir)).toBe(true);
  });

  it('is false when the build exists but nothing runs it', () => {
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {'build:theme': 'astryx theme build src/themes/appTheme.ts', dev: 'vite'},
      }),
    });
    expect(isThemeBuildWired(dir)).toBe(false);
  });

  it('is false for a project with no scripts at all', () => {
    expect(isThemeBuildWired(mkProject({'package.json': '{}'}))).toBe(false);
  });
});

describe('checkThemeBuilt', () => {
  const ctx = dir => ({
    cwd: dir,
    nodeVersion: process.versions.node,
    coreDir: null,
    configPath: null,
    configTheme: null,
  });

  it('skips a project with no built theme output', async () => {
    // A source-only project uses runtime injection, which cannot go stale.
    const dir = mkProject({'package.json': '{}', 'src/themes/appTheme.ts': THEME_SRC});
    const c = await checkThemeBuilt(ctx(dir));
    expect(c.id).toBe('theme-built');
    expect(c.status).toBe('info');
    expect(c.message).toMatch(/no built theme output/i);
    expect(c.fix).toBeUndefined();
  });

  it('reports info, not warn, when core is missing — checkCoreInstalled owns that', async () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('info');
    expect(c.fix).toBeUndefined();
  }, SLOW);

  it('never throws when the recorded source no longer exists', async () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/deleted.ts', 'src/themes/app.css'),
    });
    const c = await checkThemeBuilt(ctx(dir));
    expect(['pass', 'warn', 'fail', 'info']).toContain(c.status);
  }, SLOW);

  it('does not evaluate the theme when nothing points at drift', async () => {
    // The pre-filter must clear an artifact that is newer than its source and
    // built by the running versions, WITHOUT importing the theme. If it
    // compiled here, this unresolvable import would surface as `warn`.
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/appTheme.ts': "import 'totally-missing-package';",
    });
    const cliVersion = JSON.parse(
      fs.readFileSync(path.join(REPO, 'packages/cli/package.json'), 'utf-8'),
    ).version;
    const css = path.join(dir, 'src/themes/app.css');
    fs.writeFileSync(
      css,
      banner('src/themes/appTheme.ts', 'src/themes/app.css')
        .replace(/CLI: @astryxdesign\/cli@\S+/, `CLI: @astryxdesign/cli@${cliVersion}`)
        .replace(/Core: @astryxdesign\/core@\S+/, 'Core: @astryxdesign/core@0.0.0'),
    );
    // Make the artifact newer than the source.
    const later = new Date(Date.now() + 10_000);
    fs.utimesSync(css, later, later);
    // coreDir null => the core version comparison is skipped, leaving mtime
    // as the only signal, and mtime says fresh.
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('pass');
  }, SLOW);
});

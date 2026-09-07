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
  checkPackageManager,
  checkThemeBuilt,
  findBuiltThemes,
  isThemeBuildWired,
} from './doctor.mjs';
import {themeInputsDigest} from '../../foundation/discovery/theme-inputs.mjs';

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

describe('checkPackageManager', () => {
  it('is informational when one lockfile answers', () => {
    const dir = mkProject({'pnpm-lock.yaml': ''});
    const c = checkPackageManager({cwd: dir});
    expect(c).toMatchObject({id: 'package-manager', status: 'info'});
    expect(c.message).toContain('pnpm');
  });

  it('fails when several lockfiles tie and nothing project-owned breaks it', () => {
    // Without this the CLI answers from array order, and every command it
    // prints — including the agent-docs invocation line — names a package
    // manager the project may not use at all. Silence is the bug; say it.
    const dir = mkProject({'pnpm-lock.yaml': '', 'yarn.lock': ''});
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('fail');
    expect(c.message).toContain('yarn');
    expect(c.message).toContain('pnpm');
    expect(c.fix).toContain('packageManager');
  });

  it('is informational when the declaration and the lockfile agree', () => {
    const dir = mkProject({
      'pnpm-lock.yaml': '',
      'package.json': JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    });
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('info');
    expect(c.message).toContain('pnpm');
    expect(c.fix).toBeUndefined();
  });

  it('warns when a lockfile contradicts the declared packageManager', () => {
    // The regression: a stray yarn.lock used to OUTRANK the declaration, and
    // doctor then reported the project as healthy while every command the CLI
    // printed named the wrong package manager. The declaration now decides, and
    // the contradiction is reported instead of hidden.
    const dir = mkProject({
      'yarn.lock': '',
      'package.json': JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    });
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('warn');
    expect(c.message).toContain('yarn.lock');
    expect(c.message).toContain('pnpm');
    expect(c.fix).toContain('yarn.lock');
  });

  it('still warns when the declaration resolved a multi-lockfile tie', () => {
    const dir = mkProject({
      'pnpm-lock.yaml': '',
      'yarn.lock': '',
      'package.json': JSON.stringify({packageManager: 'pnpm@11.10.0'}),
    });
    const c = checkPackageManager({cwd: dir});
    expect(c.status).toBe('warn');
    expect(c.message).toContain('yarn.lock');
  });
});

const THEME_SRC = [
  "import {defineTheme} from '@astryxdesign/core/theme';",
  "export const appTheme = defineTheme({name: 'app', tokens: {}});",
].join('\n');

/**
 * A theme whose imports all resolve inside the temp project.
 *
 * Freshness fixtures need this: the digest now accounts for EVERY specifier,
 * so a bare `@astryxdesign/core/theme` that does not resolve in a bare tmpdir
 * correctly makes the graph unverifiable — which is right, and would mask the
 * stale/fresh verdicts these tests are actually about. Bare-specifier handling
 * has its own coverage in foundation/discovery/theme-inputs.test.mjs.
 */
const LOCAL_THEME_SRC = [
  "import {accent} from './tokens';",
  "export const appTheme = {name: 'app', tokens: {accent}};",
].join('\n');
const LOCAL_TOKENS_SRC = 'export const accent = "#ff3366";';

/** The banner `astryx theme build` writes at the top of generated CSS. */
const banner = (source, out, inputs) =>
  [
    '/*',
    ' * @generated by `astryx theme build` — do not edit manually.',
    ` * Source: ${source}`,
    ` * Command: astryx theme build ${source}${out ? ` --out ${out}` : ''}`,
    ' * CLI: @astryxdesign/cli@0.3.0',
    ' * Core: @astryxdesign/core@0.3.0',
    ...(inputs ? [` * Inputs: sha256-${inputs} (1 file)`] : []),
    ' */',
    '',
    '[data-astryx-theme="app"] { --color-accent: #ff3366; }',
  ].join('\n');

/**
 * A banner whose CLI version matches the running one, so the version signal
 * says nothing and the input digest is what decides the verdict.
 */
const currentBanner = (source, out, inputs) => {
  const cliVersion = JSON.parse(
    fs.readFileSync(path.join(REPO, 'packages/cli/package.json'), 'utf-8'),
  ).version;
  return banner(source, out, inputs).replace(
    /CLI: @astryxdesign\/cli@\S+/,
    `CLI: @astryxdesign/cli@${cliVersion}`,
  );
};

describe('findBuiltThemes', () => {
  it('recovers the source and --out from the generated banner', () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    const found = findBuiltThemes(dir).themes;
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
    expect(findBuiltThemes(dir).themes[0].out).toBeNull();
  });

  it('captures the CLI and core versions the artifact was built with', () => {
    // These drive the staleness pre-filter: the versions are embedded in the
    // output, so a dependency bump alone makes an artifact stale even though
    // it is still the newer file on disk. mtime cannot see that.
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    const [found] = findBuiltThemes(dir).themes;
    expect(found.cli).toBe('0.3.0');
    expect(found.core).toBe('0.3.0');
  });

  it('ignores hand-written CSS', () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/app.css': '.card { padding: 8px; }',
      'src/globals.css': '/* our styles */\n:root { --app-w: 100px; }',
    });
    expect(findBuiltThemes(dir).themes).toEqual([]);
  });

  it('ignores dependencies, but NOT build output', () => {
    // dist/ is a documented --out target, so a generated theme there is real
    // output to check, not noise. node_modules is someone else's package.
    const dir = mkProject({
      'package.json': '{}',
      'dist/theme.css': banner('src/themes/appTheme.ts', 'dist/theme.css'),
      'node_modules/@astryxdesign/theme-x/theme.css': banner('src/x.ts', 'theme.css'),
    });
    const found = findBuiltThemes(dir).themes;
    expect(found).toHaveLength(1);
    expect(found[0].css).toContain('dist/theme.css');
  });

  it('resolves the package directory the build ran in, not the CSS directory', () => {
    // Banner paths are relative to the package root; resolving them against
    // the CSS file's own directory would report every artifact "missing".
    const dir = mkProject({
      'package.json': '{}',
      'apps/web/package.json': '{}',
      'apps/web/src/themes/app.css': banner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    expect(findBuiltThemes(dir).themes[0].dir).toBe(path.join(dir, 'apps/web'));
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

  it('fails closed when the artifact records no input digest', async () => {
    // Built by an older CLI: there is no evidence either way, and "no
    // evidence" must not render as a pass. Previously this reported info via
    // the mtime pre-filter, i.e. it claimed freshness it had not established.
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/appTheme.ts': LOCAL_THEME_SRC,
      'src/themes/tokens.ts': LOCAL_TOKENS_SRC,
      'src/themes/app.css': currentBanner('src/themes/appTheme.ts', 'src/themes/app.css'),
    });
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('warn');
    expect(c.message).toMatch(/no input digest/i);
    expect(c.fix).toMatch(/--check/);
  }, SLOW);

  it('never throws when the recorded source no longer exists', async () => {
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/app.css': banner('src/themes/deleted.ts', 'src/themes/app.css'),
    });
    const c = await checkThemeBuilt(ctx(dir));
    expect(['pass', 'warn', 'fail', 'info']).toContain(c.status);
  }, SLOW);

  it('passes only when the recorded digest still matches the inputs on disk', async () => {
    const dir = mkProject({'package.json': '{}', 'src/themes/appTheme.ts': LOCAL_THEME_SRC, 'src/themes/tokens.ts': LOCAL_TOKENS_SRC});
    const {digest} = themeInputsDigest(path.join(dir, 'src/themes/appTheme.ts'));
    fs.writeFileSync(
      path.join(dir, 'src/themes/app.css'),
      currentBanner('src/themes/appTheme.ts', 'src/themes/app.css', digest),
    );
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('pass');
  }, SLOW);

  it('catches a changed IMPORTED token, which the entry mtime cannot see', async () => {
    // The false negative this check existed to prevent, and did not. A theme
    // imports its tokens; editing a token leaves the entry untouched, so the
    // old entry-mtime pre-filter cleared the artifact and reported it fresh
    // while `theme build --check` exited 1.
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/tokens.ts': 'export const accent = "#ff3366";',
      'src/themes/appTheme.ts': [
        "import {accent} from './tokens';",
        "export const appTheme = {name: 'app', tokens: {accent}};",
      ].join('\n'),
    });
    const entry = path.join(dir, 'src/themes/appTheme.ts');
    const {digest, count} = themeInputsDigest(entry);
    expect(count).toBe(2); // the entry AND its token module
    const css = path.join(dir, 'src/themes/app.css');
    fs.writeFileSync(css, currentBanner('src/themes/appTheme.ts', 'src/themes/app.css', digest));
    expect((await checkThemeBuilt({...ctx(dir), coreDir: null})).status).toBe('pass');

    // Edit only the imported token, and leave the entry and the artifact alone.
    fs.writeFileSync(path.join(dir, 'src/themes/tokens.ts'), 'export const accent = "#00ff00";');
    const later = new Date(Date.now() + 10_000);
    fs.utimesSync(css, later, later); // artifact is still the newer file
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('fail');
    expect(c.message).toMatch(/source files changed/i);
  }, SLOW);

  it('evaluates nothing: a module that would throw on load still passes', async () => {
    // The default pass must not compile. Compiling means jiti executing the
    // theme and its import graph, with a filesystem cache — code execution and
    // a write from a read-only command. This entry resolves cleanly (so the
    // digest is complete) but throws the instant anything runs it, so a `pass`
    // here is proof that nothing ran it.
    const dir = mkProject({
      'package.json': '{}',
      'src/themes/tokens.ts': 'throw new Error("doctor must never execute this");',
      'src/themes/appTheme.ts': [
        "import {accent} from './tokens';",
        "export const appTheme = {name: 'app', tokens: {accent}};",
      ].join('\n'),
    });
    const {digest} = themeInputsDigest(path.join(dir, 'src/themes/appTheme.ts'));
    expect(digest).not.toBeNull();
    fs.writeFileSync(
      path.join(dir, 'src/themes/app.css'),
      currentBanner('src/themes/appTheme.ts', 'src/themes/app.css', digest),
    );
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('pass');
  }, SLOW);

  it('does not let a wired package clear an unwired sibling', async () => {
    // The monorepo bug: wiring was read from the FIRST stale finding and
    // applied to every other, so an app whose dev/build rebuilds the theme
    // reported `info` for the whole tree and hid a sibling that rebuilds
    // nothing — the one case that actually renders the wrong theme.
    const stale = 'deadbeefdeadbeef';
    const dir = mkProject({
      'package.json': '{"private": true}',
      'apps/wired/package.json': JSON.stringify({
        scripts: {predev: 'astryx theme build src/themes/appTheme.ts', dev: 'vite'},
      }),
      'apps/wired/src/themes/appTheme.ts': LOCAL_THEME_SRC,
      'apps/wired/src/themes/tokens.ts': LOCAL_TOKENS_SRC,
      'apps/wired/src/themes/app.css': currentBanner('src/themes/appTheme.ts', null, stale),
      'apps/unwired/package.json': JSON.stringify({scripts: {dev: 'vite'}}),
      'apps/unwired/src/themes/appTheme.ts': LOCAL_THEME_SRC,
      'apps/unwired/src/themes/tokens.ts': LOCAL_TOKENS_SRC,
      'apps/unwired/src/themes/app.css': currentBanner('src/themes/appTheme.ts', null, stale),
    });
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('fail');
    expect(c.message).toContain('unwired');
    expect(c.message).not.toContain('apps/wired/src/themes/app.css');
    // The wired one is still reported, as context rather than as a failure.
    expect(c.message).toMatch(/1 other stale artifact/);
  }, SLOW);

  it('warns instead of reassuring when the walk was truncated', async () => {
    // A 4001-directory project whose theme sits past the bound returned the
    // reassuring skip message while the remainder was never examined.
    const files = {'package.json': '{}'};
    for (let i = 0; i < 4200; i++) files[`src/d${i}/.keep`] = '';
    const dir = mkProject(files);
    const c = await checkThemeBuilt({...ctx(dir), coreDir: null});
    expect(c.status).toBe('warn');
    expect(c.message).toMatch(/stopped before walking all of it/);
  }, SLOW);

  it('still says INFO for a small project that genuinely has none', async () => {
    const dir = mkProject({'package.json': '{}', 'src/app.ts': 'export const a = 1;'});
    expect((await checkThemeBuilt({...ctx(dir), coreDir: null})).status).toBe('info');
  });
});

describe('isThemeBuildWired — matched per source, not per package', () => {
  // A predev that rebuilds ONE theme says nothing about a second theme in the
  // same package. Answering "wired" package-wide downgraded a genuinely stale
  // artifact to info because an unrelated sibling happened to be covered.
  // Built per test: the suite's afterEach removes tmp dirs, so a fixture made
  // once at describe time is gone by the time the second test runs.
  const twoThemes = () =>
    mkProject({
      'package.json': JSON.stringify({
        scripts: {predev: 'astryx theme build src/themes/one.ts', dev: 'vite'},
      }),
    });

  it('is true for the theme the script actually builds', () => {
    expect(isThemeBuildWired(twoThemes(), 'src/themes/one.ts')).toBe(true);
  });

  it('is FALSE for a sibling theme nothing rebuilds', () => {
    expect(isThemeBuildWired(twoThemes(), 'src/themes/two.ts')).toBe(false);
  });

  it('normalizes spelling of the SAME path', () => {
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {prebuild: 'astryx theme build ./src/themes/one.ts', build: 'vite build'},
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(true);
  });

  it('does NOT let a same-named theme in another directory count', () => {
    // src/brand/theme.ts and src/admin/theme.ts share a basename and are two
    // different themes. Matching on basename excused the stale one.
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {predev: 'astryx theme build src/brand/theme.ts', dev: 'vite'},
      }),
    });
    expect(isThemeBuildWired(dir, 'src/brand/theme.ts')).toBe(true);
    expect(isThemeBuildWired(dir, 'src/admin/theme.ts')).toBe(false);
  });

  it('treats an argument-less theme build as wiring NOTHING', () => {
    // `astryx theme build` with no file exits 1 with "missing required
    // argument 'files'". That script is broken, not universal, so it cannot
    // excuse a stale artifact.
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {predev: 'astryx theme build', dev: 'vite'},
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/anything.ts')).toBe(false);
  });

  it('does not accept a rebuild gated behind a shell condition', () => {
    // `false && pnpm build:theme` never runs, so the artifact is never
    // regenerated — treating it as wiring made stale output look self-healing.
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {predev: 'false && astryx theme build src/themes/one.ts', dev: 'vite'},
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(false);
  });

  it('does not accept a rebuild inside an if/then block', () => {
    // Whether that branch is taken cannot be established by reading.
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {
          predev: 'if [ -f x ]; then astryx theme build src/themes/one.ts; fi',
          dev: 'vite',
        },
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(false);
  });

  it('still accepts an ungated build that leads an && chain', () => {
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {predev: 'astryx theme build src/themes/one.ts && vite build', dev: 'vite'},
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(true);
  });

  it('does not follow a sibling script out from behind a gate', () => {
    // `false && pnpm build:theme` never runs. Following the reference and then
    // judging the sibling's own body reported wiring for a rebuild that never
    // happens — the gate has to travel with the reference.
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {
          predev: 'false && pnpm build:theme',
          'build:theme': 'astryx theme build src/themes/one.ts',
          dev: 'vite',
        },
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(false);
  });

  it('still follows an UNGATED sibling script', () => {
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {
          predev: 'pnpm build:theme',
          'build:theme': 'astryx theme build src/themes/one.ts',
          dev: 'vite',
        },
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(true);
  });

  it('carries the gate across two hops', () => {
    const dir = mkProject({
      'package.json': JSON.stringify({
        scripts: {
          predev: 'pnpm gen',
          gen: 'false && pnpm build:theme',
          'build:theme': 'astryx theme build src/themes/one.ts',
          dev: 'vite',
        },
      }),
    });
    expect(isThemeBuildWired(dir, 'src/themes/one.ts')).toBe(false);
  });
});

describe('findBuiltThemes — looks where the CLI writes', () => {
  it('finds a generated theme in dist/, which the CLI documents as an --out target', () => {
    // `theme build ./src/themes/ocean.ts --out ./dist/ocean.css` is the CLI's
    // own example. Skipping dist/ made a stale theme there report as "no built
    // theme output found" — the silent pass this check exists to remove.
    const dir = mkProject({
      'package.json': '{}',
      'dist/ocean.css': banner('src/themes/ocean.ts', 'dist/ocean.css'),
    });
    const found = findBuiltThemes(dir).themes;
    expect(found).toHaveLength(1);
    expect(found[0].source).toBe('src/themes/ocean.ts');
  });

  it('still ignores node_modules', () => {
    const dir = mkProject({
      'package.json': '{}',
      'node_modules/pkg/theme.css': banner('src/themes/x.ts', 'theme.css'),
    });
    expect(findBuiltThemes(dir).themes).toEqual([]);
  });
});

describe('findBuiltThemes — coverage is exhaustive, not capped at ten', () => {
  it('examines every theme, so an unwired stale eleventh is not invisible', () => {
    // The cap returned INFO on the first ten self-healing artifacts and never
    // looked at the eleventh. It also did not bind reliably: it was tested
    // between directories, so twelve themes in one folder all slipped through.
    const files = {'package.json': JSON.stringify({scripts: {predev: 'astryx theme build src/t0.ts', dev: 'vite'}})};
    for (let i = 0; i < 12; i++) files[`src/t${i}.css`] = banner(`src/t${i}.ts`, `src/t${i}.css`);
    const dir = mkProject(files);
    const {themes, truncated} = findBuiltThemes(dir);
    expect(themes).toHaveLength(12);
    expect(truncated).toBe(false);
  });

  it('finds a generated theme in .next, another documented output root', () => {
    const dir = mkProject({'package.json': '{}', '.next/ocean.css': banner('src/themes/ocean.ts', '.next/ocean.css')});
    expect(findBuiltThemes(dir).themes).toHaveLength(1);
  });
});

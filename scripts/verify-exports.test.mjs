// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file verify-exports.test.mjs
 * Unit tests for the packaging gate, plus the #5132 regression they were
 * written for: a canary package could ship a dist that no consumer could
 * import and this gate still passed, because `private: true` skipped the
 * package outright and `default`-condition targets were never probed.
 *
 * The rules are exercised against fixture package trees, not just the repo: a
 * gate that scans the wrong thing passes exactly like one that works. The last
 * block then runs them over the real workspace manifests, so the rules and the
 * data they are pointed at are both covered.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect, afterAll} from 'vitest';
import {
  isPublishedPackage,
  checkPackageExports,
  probeImportTargets,
  verifyExports,
} from './verify-exports.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Temp roots created by the fixture helper, removed after the run. */
const tempRoots = [];

afterAll(() => {
  for (const dir of tempRoots) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

/**
 * Write a `packages/` tree the gate can walk.
 *
 * `packages` maps a directory name to `{manifest, files}` — `manifest` is
 * written as its package.json, `files` as package-relative paths to contents.
 * Returns the root to hand to verifyExports().
 */
function fixtureRoot(packages) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-exports-'));
  tempRoots.push(root);
  for (const [dir, {manifest, files = {}}] of Object.entries(packages)) {
    const pkgDir = path.join(root, 'packages', dir);
    fs.mkdirSync(pkgDir, {recursive: true});
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify(manifest, null, 2),
    );
    for (const [file, contents] of Object.entries(files)) {
      const abs = path.join(pkgDir, file);
      fs.mkdirSync(path.dirname(abs), {recursive: true});
      fs.writeFileSync(abs, contents);
    }
  }
  return root;
}

/**
 * Write a single package directory and return its path, for the rules that take
 * a `pkgDir` directly. `files` maps package-relative paths to contents.
 */
function fixturePkg(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-exports-'));
  tempRoots.push(root);
  for (const [file, contents] of Object.entries(files)) {
    const abs = path.join(root, file);
    fs.mkdirSync(path.dirname(abs), {recursive: true});
    fs.writeFileSync(abs, contents);
  }
  return root;
}

/** A dist entry Node can load. */
const LOADABLE = 'export const value = 1;\n';

/**
 * A dist entry that exists but cannot be imported — the #4620/#5000 shape: a
 * relative specifier pointing at a file the build never emitted.
 */
const UNLOADABLE = "export * from './missing-chunk.js';\n";

/** The publish posture of the repo's canary packages (charts, lab, …). */
const canaryManifest = (name, extra = {}) => ({
  name,
  private: true,
  astryx: {canaryOnly: true},
  ...extra,
});

const labels = targets => targets.map(t => t.label);
const names = results => results.map(r => r.name);

describe('isPublishedPackage — which packages the gate covers', () => {
  it('covers a plain public package', () => {
    expect(isPublishedPackage({name: '@astryxdesign/core'})).toBe(true);
  });

  it('skips a genuinely private workspace-only package', () => {
    // Nothing is published, so there is no consumer to break.
    expect(
      isPublishedPackage({name: '@astryxdesign/storybook', private: true}),
    ).toBe(false);
  });

  it('covers a private package the release workflow publishes to @canary', () => {
    // `private: true` here is only npm's guard against a stable publish; the
    // canary job strips it and ships the package (#5132).
    expect(isPublishedPackage(canaryManifest('@astryxdesign/charts'))).toBe(
      true,
    );
  });

  it('ignores the package name and reads only the marker', () => {
    expect(
      isPublishedPackage({name: '@astryxdesign/charts', private: true}),
    ).toBe(false);
    expect(
      isPublishedPackage({
        name: '@scope/anything',
        private: true,
        astryx: {canaryOnly: true},
      }),
    ).toBe(true);
  });

  it('covers everything the canary publish loop publishes', () => {
    // release.yml decides publishability with `(!p.private ||
    // p.astryx?.canaryOnly)` — truthy, not `=== true`. A stricter test here
    // would skip a package the publisher ships, which is the hole this gate
    // exists to close. Keep the two predicates in step.
    const releaseYmlPublishes = pkg =>
      Boolean(!pkg.private || pkg.astryx?.canaryOnly);
    const manifests = [
      {private: true, astryx: {canaryOnly: true}},
      {private: true, astryx: {canaryOnly: 'soon'}},
      {private: true, astryx: {canaryOnly: 1}},
      {private: true, astryx: {canaryOnly: false}},
      {private: true, astryx: {}},
      {private: true},
      {},
    ];
    for (const pkg of manifests) {
      const shipped = releaseYmlPublishes(pkg);
      expect(isPublishedPackage(pkg), JSON.stringify(pkg)).toBe(shipped);
    }
  });
});

describe('checkPackageExports — which targets get probed', () => {
  /** A built package: ESM and CJS entries, declarations, a stylesheet, assets. */
  const built = () =>
    fixturePkg({
      'dist/index.js': LOADABLE,
      'dist/index.mjs': LOADABLE,
      'dist/index.cjs': 'module.exports = {};\n',
      'dist/index.d.ts': 'export declare const value: number;\n',
      'dist/index.css': '.a{color:red}\n',
      'dist/locales/en.json': '{}\n',
      'src/index.ts': 'export const value = 1;\n',
    });

  it("probes a `default` target that is the export's only runtime condition", () => {
    // The charts/lab/richtext/core shape: no `import` condition at all, so
    // `default` is what a consumer's `import` actually resolves to.
    const {errors, targets} = checkPackageExports(built(), '@fixture/pkg', {
      '.': {
        source: './src/index.ts',
        types: './dist/index.d.ts',
        default: './dist/index.js',
      },
    });
    expect(errors).toEqual([]);
    expect(labels(targets)).toEqual(['exports["."].default']);
  });

  it('does not probe a `default` that sits beside an `import` condition', () => {
    // Node takes the first matching condition, so `import` wins and this
    // `default` is the fallback for someone else — probing it would test a
    // surface no ESM consumer reaches.
    const {targets} = checkPackageExports(built(), '@fixture/pkg', {
      '.': {import: './dist/index.mjs', default: './dist/index.js'},
    });
    expect(labels(targets)).toEqual(['exports["."].import']);
  });

  it('does not probe a `default` nested under `require` — that target is CJS', () => {
    const {targets} = checkPackageExports(built(), '@fixture/pkg', {
      '.': {
        require: {types: './dist/index.d.ts', default: './dist/index.js'},
        import: './dist/index.mjs',
      },
    });
    expect(labels(targets)).toEqual(['exports["."].import']);
  });

  it('leaves non-runtime `default` targets alone — stylesheets and assets', () => {
    // charts/lab expose their CSS through `default`; Node cannot import it, so
    // the extension filter has to be what decides, not the condition name.
    const {errors, targets} = checkPackageExports(built(), '@fixture/pkg', {
      './styles.css': {default: './dist/index.css'},
      './locales/*.json': './dist/locales/*.json',
      './cjs': {default: './dist/index.cjs'},
    });
    expect(errors).toEqual([]);
    expect(targets).toEqual([]);
  });

  it('still skips `types` and `require` targets', () => {
    const {targets} = checkPackageExports(built(), '@fixture/pkg', {
      '.': {
        types: './dist/index.d.ts',
        require: './dist/index.js',
        import: './dist/index.mjs',
      },
    });
    expect(labels(targets)).toEqual(['exports["."].import']);
  });

  it('reports a missing target instead of probing it', () => {
    const {errors, targets} = checkPackageExports(built(), '@fixture/pkg', {
      '.': {default: './dist/never-built.js'},
    });
    expect(errors).toEqual([
      '  ✗ exports["."].default → ./dist/never-built.js (file not found)',
    ]);
    expect(targets).toEqual([]);
  });
});

describe('verifyExports — package selection over a real tree', () => {
  it('skips a genuinely private package, even with a broken entry', () => {
    const root = fixtureRoot({
      internal: {
        manifest: {
          name: '@fixture/internal',
          private: true,
          exports: {'.': {default: './dist/index.js'}},
        },
        files: {'dist/index.js': UNLOADABLE},
      },
    });
    const {results, targets} = verifyExports(root);
    expect(names(results)).toEqual([]);
    expect(targets).toEqual([]);
  });

  it('checks a canaryOnly package and collects its `default` entry', () => {
    const root = fixtureRoot({
      charts: {
        manifest: canaryManifest('@fixture/charts', {
          main: './dist/index.js',
          exports: {
            '.': {
              source: './src/index.ts',
              types: './dist/index.d.ts',
              default: './dist/index.js',
            },
            './charts.css': {default: './dist/charts.css'},
          },
        }),
        files: {
          'dist/index.js': LOADABLE,
          'dist/index.d.ts': 'export declare const value: number;\n',
          'dist/charts.css': '.a{color:red}\n',
        },
      },
    });
    const {results, targets} = verifyExports(root);
    expect(names(results)).toEqual(['@fixture/charts']);
    expect(results[0].errors).toEqual([]);
    // The stylesheet is reached through `default` too, and stays unprobed.
    expect(labels(targets)).toEqual(['exports["."].default']);
  });

  it('fails a canary package whose runtime entry cannot be imported', () => {
    // The regression: on the unfixed gate this tree passed clean.
    const root = fixtureRoot({
      charts: {
        manifest: canaryManifest('@fixture/charts', {
          exports: {
            '.': {types: './dist/index.d.ts', default: './dist/index.js'},
          },
        }),
        files: {
          'dist/index.js': UNLOADABLE,
          'dist/index.d.ts': 'export declare const value: number;\n',
        },
      },
    });
    const {results, targets} = verifyExports(root);
    // Every path exists, so the existence pass is clean — only loading it fails.
    expect(results[0].errors).toEqual([]);
    expect(targets).toHaveLength(1);

    const failures = probeImportTargets(targets);
    expect(failures).toHaveLength(1);
    expect(failures[0].code).toBe('ERR_MODULE_NOT_FOUND');
  });

  it('passes a canary package whose `default`-only entry loads', () => {
    const root = fixtureRoot({
      lab: {
        manifest: canaryManifest('@fixture/lab', {
          exports: {'.': {default: './dist/index.js'}},
        }),
        files: {'dist/index.js': LOADABLE},
      },
    });
    const {results, targets} = verifyExports(root);
    expect(results[0].errors).toEqual([]);
    expect(probeImportTargets(targets)).toEqual([]);
  });

  it('keeps reporting a canary package that points at a file it never built', () => {
    const root = fixtureRoot({
      charts: {
        manifest: canaryManifest('@fixture/charts', {
          main: './dist/index.js',
          exports: {'.': {default: './dist/index.js'}},
        }),
      },
    });
    const {results} = verifyExports(root);
    expect(results[0].errors).toEqual([
      '  ✗ main → ./dist/index.js (file not found)',
      '  ✗ exports["."].default → ./dist/index.js (file not found)',
    ]);
  });

  it('leaves import/require/source handling as it was', () => {
    const root = fixtureRoot({
      vega: {
        manifest: {
          name: '@fixture/vega',
          exports: {
            '.': {
              source: './src/index.ts',
              types: './dist/index.d.ts',
              import: './dist/index.mjs',
              require: './dist/index.js',
            },
          },
        },
        files: {
          'dist/index.mjs': LOADABLE,
          'dist/index.js': 'module.exports = {};\n',
          'dist/index.d.ts': 'export declare const value: number;\n',
        },
      },
    });
    const {results, targets} = verifyExports(root);
    // `source` points at a file that does not exist here and is still skipped;
    // `require` is still not probed.
    expect(results[0].errors).toEqual([]);
    expect(labels(targets)).toEqual(['exports["."].import']);
  });
});

describe('the real workspace manifests', () => {
  /** Every package.json directly under packages/. */
  const manifests = fs
    .readdirSync(path.join(ROOT, 'packages'), {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(ROOT, 'packages', entry.name, 'package.json'))
    .filter(file => fs.existsSync(file))
    .map(file => JSON.parse(fs.readFileSync(file, 'utf-8')));

  /**
   * Run a real export map through the rules without needing a built tree: every
   * string target is stubbed on disk first, so what is asserted is the rules'
   * verdict on shipped manifest data, not whether `pnpm build` has run. The
   * `node` project's globalSetup builds core, but nothing builds charts, lab or
   * richtext before `pnpm test`.
   */
  function targetsFor(pkg) {
    const stubs = {};
    const collect = value => {
      if (typeof value === 'string') {
        if (!value.includes('*')) stubs[value] = LOADABLE;
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(collect);
      }
    };
    collect(pkg.exports);
    return checkPackageExports(fixturePkg(stubs), pkg.name, pkg.exports)
      .targets;
  }

  it('covers every canaryOnly package in packages/', () => {
    const canaries = manifests.filter(pkg => pkg.astryx?.canaryOnly === true);

    // The packages #5132 was filed about — they must not be skipped.
    expect(canaries.length).toBeGreaterThan(0);
    for (const pkg of canaries) {
      expect(isPublishedPackage(pkg), pkg.name).toBe(true);
    }
  });

  it("probes the `default` entries that are core's real import surface", () => {
    const core = manifests.find(pkg => pkg.name === '@astryxdesign/core');
    const targets = targetsFor(core);
    // Core routes every subpath through `default`; before #5132 only the two
    // unconditional `.mjs` docs entries were probed.
    expect(targets.length).toBeGreaterThan(2);
    expect(
      targets.filter(t => t.label.endsWith('.default')).length,
    ).toBeGreaterThan(2);
    expect(targets.every(t => /\.(js|mjs)$/.test(t.value))).toBe(true);
  });

  it('probes a runtime entry for every canaryOnly package', () => {
    // charts/lab/richtext each expose `.` only through `default`. If the rule
    // stopped accepting it, their entry points would silently go unprobed
    // again — which is what #5132 reported.
    for (const pkg of manifests.filter(p => p.astryx?.canaryOnly === true)) {
      expect(targetsFor(pkg).length, pkg.name).toBeGreaterThan(0);
    }
  });

  it('never probes a stylesheet, declaration or asset', () => {
    for (const pkg of manifests.filter(p => p.exports)) {
      expect(
        targetsFor(pkg).filter(
          t => /\.(css|json)$/.test(t.value) || t.value.endsWith('.d.ts'),
        ),
        pkg.name,
      ).toEqual([]);
    }
  });
});

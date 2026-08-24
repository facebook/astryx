#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * verify-exports.mjs
 *
 * Verifies that all package.json export fields (main, module, types, exports)
 * resolve to files that actually exist on disk. Designed to run AFTER `pnpm build`
 * to catch cases where packages point to dist files that weren't produced.
 *
 * Existence is necessary but not sufficient: an entry file can exist and still be
 * unloadable, because nothing here opens it. That is how #4620 shipped — every
 * theme's `./built` entry existed while carrying an extensionless relative import
 * that Node cannot resolve. So explicit `import`-condition ESM targets and
 * unconditional ESM targets are also imported. This runs after the build, so a
 * forward reference to something a later pipeline stage produces is already
 * satisfied.
 *
 * Scope, deliberately: importing a module only exercises the specifiers that are
 * evaluated when it loads — its static import graph. A bad specifier inside a
 * `lazy(() => import('...'))` is never reached, so this would NOT have caught
 * #4569 (`await import('@astryxdesign/core/Text')` succeeds on the unfixed bytes
 * even though the Tooltip specifier inside it is broken). Catching that needs a
 * static scan; see scripts/check-fully-specified.mjs.
 *
 * Coverage follows what actually ships, not what `private` says: `canaryOnly`
 * packages are published to the `@canary` dist-tag, and their runtime entry is
 * reached through `default`. Skipping both is why #5000 shipped an unimportable
 * dist past this gate (#5132).
 *
 * Exit code 1 if any exports are broken.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

/** Fields in package.json that should point to real files */
const TOP_LEVEL_FIELDS = ['main', 'module', 'types'];

/**
 * Export map conditions that reference source files (not built output).
 * These are used by bundlers that compile from source — skip them.
 */
const SKIP_CONDITIONS = new Set(['source']);

/**
 * Find all package.json files in packages/ (including nested workspaces like packages/themes/*)
 */
function findPackageJsons(root) {
  const results = [];
  const packagesDir = join(root, 'packages');

  function walk(dir, depth = 0) {
    if (depth > 2) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'src') continue;
      const pkgJson = join(dir, entry.name, 'package.json');
      if (existsSync(pkgJson)) {
        results.push(pkgJson);
      }
      // Recurse for nested workspaces (e.g., packages/themes/*)
      walk(join(dir, entry.name), depth + 1);
    }
  }

  walk(packagesDir);
  return results;
}

/**
 * Check if a path resolves to an existing file, relative to the package directory.
 */
function checkFile(pkgDir, filePath) {
  const resolved = resolve(pkgDir, filePath);
  return existsSync(resolved);
}

/**
 * Node exports subpath wildcard (one `*` in both key and value). We list the
 * value's directory and require at least one file matches prefix+suffix.
 * Any match that resolves outside pkgDir (via `..`) is rejected.
 */
function checkWildcard(pkgDir, exportValue) {
  const i = exportValue.indexOf('*');
  const prefix = exportValue.slice(0, i);
  const suffix = exportValue.slice(i + 1);
  const scanDir = prefix.endsWith('/')
    ? resolve(pkgDir, prefix)
    : dirname(resolve(pkgDir, prefix));
  const nameStart = prefix.endsWith('/') ? '' : prefix.slice(prefix.lastIndexOf('/') + 1);

  let matches = 0;
  try {
    for (const entry of readdirSync(scanDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.startsWith(nameStart) || !entry.name.endsWith(suffix)) continue;
      if (entry.name.length <= nameStart.length + suffix.length) continue; // empty capture
      const abs = resolve(scanDir, entry.name);
      if (relative(pkgDir, abs).startsWith('..')) continue; // must stay inside pkg
      matches++;
    }
  } catch {
    return false;
  }
  return matches > 0;
}

/**
 * ESM targets worth actually importing. `.cjs` and `require`-condition targets
 * are skipped (loading CJS here would fire side effects under a different
 * module system), as are type declarations and assets, which Node cannot import
 * as modules anyway.
 *
 * `default` is probed when it is the export's real ESM entry. It is not always:
 * Node takes the first matching condition, so a `default` declared beside an
 * `import` is the fallback for some other consumer, and a `default` nested
 * under `require` is CJS. Everything else reaching `default` is what a
 * consumer's `import` resolves to — for core, charts, lab and richtext it is
 * the *only* runtime condition, so leaving it unprobed meant their entry points
 * were never loaded (#5132). Non-module targets stay out either way: the
 * extension filter, not the condition name, is what excludes a stylesheet or a
 * JSON asset.
 *
 * The `import`-sibling check is sibling-scoped, so a `default` alongside a
 * nested `node: {import: ...}` is still probed even though Node would resolve
 * the `node` branch first. That is intentional: such a `default` is what
 * non-Node consumers load, and only module-resolution failures are reported
 * (see RESOLUTION_CODES), so an environment-specific runtime error in one
 * cannot fail this gate. No workspace manifest uses that shape today.
 */
const IMPORTABLE = /\.(js|mjs)$/;
const NON_PROBED_CONDITIONS = new Set(['types', 'require']);

/**
 * Whether a target that exists on disk is one this gate should import.
 *
 * `conditions` is the chain of export conditions above it, outermost first;
 * `siblings` are the condition keys declared alongside it.
 */
function isProbeableTarget(value, conditions, siblings) {
  if (!IMPORTABLE.test(value)) return false;
  // A `require` or `types` anywhere above this target rules it out, not just
  // immediately above it — a `default` nested inside `require` is still CJS.
  if (conditions.some(condition => NON_PROBED_CONDITIONS.has(condition))) {
    return false;
  }
  if (conditions.at(-1) === 'default' && siblings.has('import')) return false;
  return true;
}

/**
 * Whether a package's published artifacts are in scope for this gate.
 *
 * `private: true` normally means workspace-only — nothing is published, so
 * there is no consumer for a broken export to reach. `astryx.canaryOnly`
 * packages are the exception: they carry `private: true` purely as npm's hard
 * guarantee against a stable publish, and the release workflow strips it in its
 * ephemeral checkout to publish them on the `@canary` dist-tag. Those do ship,
 * so they get the same checks.
 *
 * This is deliberately the same predicate the canary publish loop uses —
 * `(!p.private || p.astryx?.canaryOnly)` in .github/workflows/release.yml — and
 * it tests `canaryOnly` for truthiness for the same reason. A stricter test here
 * (`=== true`) would let a package the publisher ships go unverified, which is
 * the hole this gate exists to close. Whatever release.yml publishes, this
 * checks.
 */
export function isPublishedPackage(pkg) {
  return !pkg.private || Boolean(pkg.astryx?.canaryOnly);
}

/**
 * Walk one package's exports map. Reports targets that do not exist, and
 * collects the ESM targets worth importing.
 */
export function checkPackageExports(pkgDir, pkgName, exportsMap) {
  const errors = [];
  const targets = [];

  const labelFor = (exportKey, conditions) =>
    conditions.length > 0
      ? `exports["${exportKey}"].${conditions.join('.')}`
      : `exports["${exportKey}"]`;

  function walk(exportKey, value, conditions, siblings) {
    if (typeof value === 'string') {
      const isWildcard =
        exportKey.split('*').length === 2 && value.split('*').length === 2;
      const ok = isWildcard
        ? checkWildcard(pkgDir, value)
        : checkFile(pkgDir, value);
      if (!ok) {
        errors.push(
          `  ✗ ${labelFor(exportKey, conditions)} → ${value} (${isWildcard ? 'no files match pattern' : 'file not found'})`,
        );
        return;
      }
      if (isWildcard || !isProbeableTarget(value, conditions, siblings)) return;
      targets.push({
        pkgName,
        label: labelFor(exportKey, conditions),
        value,
        abs: resolve(pkgDir, value),
      });
      return;
    }

    if (typeof value === 'object' && value !== null) {
      const keys = new Set(Object.keys(value));
      for (const [condition, conditionValue] of Object.entries(value)) {
        if (SKIP_CONDITIONS.has(condition)) continue;
        walk(exportKey, conditionValue, [...conditions, condition], keys);
      }
    }
  }

  for (const [exportKey, value] of Object.entries(exportsMap)) {
    walk(exportKey, value, [], new Set());
  }

  return {errors, targets};
}

/**
 * Run the existence pass over every published package under `root`/packages.
 * Returns one result per checked package and the import targets collected from
 * all of them. Reports nothing — the caller prints.
 */
export function verifyExports(root) {
  const results = [];
  const targets = [];

  for (const pkgJsonPath of findPackageJsons(root)) {
    const pkgDir = dirname(pkgJsonPath);
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));

    if (!isPublishedPackage(pkg)) continue;

    const errors = [];

    // Check top-level fields (main, module, types)
    for (const field of TOP_LEVEL_FIELDS) {
      if (pkg[field] && !checkFile(pkgDir, pkg[field])) {
        errors.push(`  ✗ ${field} → ${pkg[field]} (file not found)`);
      }
    }

    // Check exports map
    if (pkg.exports && typeof pkg.exports === 'object') {
      const exports = checkPackageExports(pkgDir, pkg.name, pkg.exports);
      errors.push(...exports.errors);
      targets.push(...exports.targets);
    }

    results.push({name: pkg.name, path: pkgJsonPath, errors});
  }

  return {results, targets};
}

// Second pass: actually load each runtime ESM target. A target can exist and
// still be unresolvable — see #4620, where every theme's `./built` entry was
// present but imported an extensionless `./icons` that Node rejects.
//
// Each import runs in a child process. Importing a module evaluates it, and some
// export targets are executables — `@astryxdesign/cli` maps "." to its bin, so an
// in-process import runs the CLI and prints its help. A child keeps side effects,
// stdout and any process.exit() out of this run, and the timeout contains a hang.
const RESOLUTION_CODES = new Set([
  'ERR_MODULE_NOT_FOUND',
  'ERR_UNSUPPORTED_DIR_IMPORT',
  'ERR_UNKNOWN_FILE_EXTENSION',
  'ERR_REQUIRE_ESM',
  'SyntaxError',
]);

/** Sentinel exit code, distinct from anything an executable entry might use. */
const IMPORT_FAILED = 9;

/**
 * Import each target in a child process. Returns the ones that failed for a
 * module-resolution reason, as `{...target, code}`.
 */
export function probeImportTargets(targets) {
  const failures = [];

  for (const target of targets) {
    const probe =
      `import(${JSON.stringify(pathToFileURL(target.abs).href)})` +
      `.then(() => process.exit(0))` +
      `.catch(e => { process.stderr.write(String((e && e.code) || (e && e.name) || e)); process.exit(${IMPORT_FAILED}); })`;

    const run = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', probe],
      {
        encoding: 'utf-8',
        timeout: 20_000,
        stdio: ['ignore', 'ignore', 'pipe'],
      },
    );

    // Anything other than our sentinel is the module's own business: an
    // executable entry that printed help and exited 0, or one that failed for a
    // reason unrelated to packaging. Only resolution defects concern us here.
    if (run.status !== IMPORT_FAILED) continue;

    const code = (run.stderr || '').trim().split('\n')[0];
    if (!RESOLUTION_CODES.has(code)) continue;

    failures.push({...target, code});
  }

  return failures;
}

function main() {
  const {results, targets} = verifyExports(rootDir);
  let totalErrors = 0;

  for (const {name, path: pkgJsonPath, errors} of results) {
    if (errors.length > 0) {
      console.error(`\n❌ ${name} (${pkgJsonPath})`);
      for (const error of errors) {
        console.error(error);
      }
      totalErrors += errors.length;
    } else {
      console.log(`✓ ${name}`);
    }
  }

  console.log(`\n${results.length} packages checked.`);

  const importFailures = probeImportTargets(targets);

  if (importFailures.length > 0) {
    console.error('\n❌ Export targets that exist but cannot be imported:\n');
    for (const failure of importFailures) {
      console.error(
        `  ✗ ${failure.pkgName} ${failure.label} → ${failure.value}`,
      );
      console.error(`      ${failure.code}`);
    }
  } else if (targets.length > 0) {
    console.log(`${targets.length} ESM export target(s) imported cleanly.`);
  }

  const failures = totalErrors + importFailures.length;

  if (failures > 0) {
    if (totalErrors > 0) {
      console.error(
        `\n${totalErrors} broken export(s) found. Fix the paths above.`,
      );
    }
    if (importFailures.length > 0) {
      console.error(
        `\n${importFailures.length} export target(s) exist but fail to load. A consumer importing ` +
          `them from Node gets the same error.`,
      );
    }
    process.exit(1);
  } else {
    console.log(
      'All exports resolve to existing files; probed ESM targets load cleanly.',
    );
  }
}

// Run as a script, but stay importable for unit tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

"use strict";

const path = require("node:path");
const fs = require("node:fs");
const {createRequire} = require("node:module");

/**
 * @astryxdesign/build/next
 *
 * Next.js configuration helper for Astryx source builds.
 *
 * Usage in next.config.mjs:
 *   import {withAstryx} from '@astryxdesign/build/next';
 *   export default withAstryx({
 *     // your normal next config
 *   });
 */

const LEXICAL_ROOT = "lexical";
const LEXICAL_SCOPE = "@lexical";

/**
 * Build a `resolve.alias` map pinning `lexical` and every installed
 * `@lexical/*` package (including every export subpath) to its built **dist**
 * output, bypassing their `source` (raw `.ts`) export.
 *
 * Why: withAstryx sets a global `source` resolve condition so @astryxdesign
 * packages build straight from their TS `source` export with no prebuild step.
 * But `lexical` (and every `@lexical/*` package) ALSO ship a `source` export
 * pointing at raw `.ts` (e.g. `./src/index.ts`). Under the global `source`
 * condition those resolve to untranspiled TypeScript, which Next's Babel
 * cannot compile — it dies on `declare` class fields and fails the build.
 * Astryx source is transpiled via `transpilePackages`; lexical is not, so it
 * MUST come from its prebuilt dist.
 *
 * Strategy: for each package, enumerate its `exports` subpaths and resolve each
 * one with Node's own resolver (`require.resolve`). Node ignores the
 * webpack-only `source` convention, so every entry resolves to its built dist
 * file — respecting the package's exports-map renames (e.g. `@lexical/react`'s
 * `./ReactProviderExtension` → `dist/LexicalReactProviderExtension.mjs`). Each
 * becomes an exact-match (`<specifier>$`) webpack alias, which wins over
 * export-condition resolution regardless of which package issued the import.
 *
 * @param {string} fromDir directory to resolve lexical packages relative to
 * @returns {Record<string,string>} webpack resolve.alias entries
 */
function buildLexicalDistAliases(fromDir) {
  const alias = {};
  let req;
  try {
    req = createRequire(path.join(fromDir, "package.json"));
  } catch {
    return alias;
  }

  // Node's resolver honors standard conditions (import/require/default) and
  // never picks the webpack-only `source` convention, so this yields dist.
  const resolveDist = (specifier) => {
    try {
      return req.resolve(specifier);
    } catch {
      return null;
    }
  };

  /** Add exact-match aliases for a package's bare entry + all export subpaths. */
  const aliasPackage = (pkg, pkgDir) => {
    // Bare entry (e.g. `lexical`, `@lexical/list`).
    const bare = resolveDist(pkg);
    if (bare) {
      alias[`${pkg}$`] = bare;
    }
    // Every export subpath declared in the package's package.json.
    let manifest;
    try {
      manifest = JSON.parse(
        fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
      );
    } catch {
      return;
    }
    const exportsField = manifest && manifest.exports;
    if (!exportsField || typeof exportsField !== "object") {
      return;
    }
    for (const key of Object.keys(exportsField)) {
      // Skip the bare entry (handled above) and non-JS assets.
      if (key === "." || !key.startsWith("./")) {
        continue;
      }
      if (/\.(css|json|flow)$/.test(key)) {
        continue;
      }
      const specifier = `${pkg}/${key.slice(2)}`;
      const resolved = resolveDist(specifier);
      if (resolved) {
        alias[`${specifier}$`] = resolved;
      }
    }
  };

  // Locate the `node_modules` root via the resolved `lexical` core entry, then
  // discover every installed `@lexical/*` package under that root's scope dir.
  const lexEntry = resolveDist(LEXICAL_ROOT);
  if (!lexEntry) {
    // lexical not installed (it's an optional peer dep) — nothing to alias.
    return alias;
  }
  const marker = `${path.sep}node_modules${path.sep}`;
  const idx = lexEntry.indexOf(marker);
  if (idx === -1) {
    // Non-standard layout; still pin the bare `lexical` entry.
    alias[`${LEXICAL_ROOT}$`] = lexEntry;
    return alias;
  }
  const nmRoot = lexEntry.slice(0, idx + marker.length - 1);

  aliasPackage(LEXICAL_ROOT, path.join(nmRoot, LEXICAL_ROOT));

  const scopeDir = path.join(nmRoot, LEXICAL_SCOPE);
  try {
    if (fs.existsSync(scopeDir)) {
      for (const name of fs.readdirSync(scopeDir)) {
        aliasPackage(`${LEXICAL_SCOPE}/${name}`, path.join(scopeDir, name));
      }
    }
  } catch {
    // Ignore — the bare `lexical` aliases above still apply.
  }

  return alias;
}

/**
 * Wraps a Next.js config to enable Astryx source builds.
 * - Adds transpilePackages for @astryxdesign/* packages
 * - Sets conditionNames to resolve source exports
 * - Pins lexical/@lexical to built dist (they ship a raw-TS `source` export
 *   that Next's Babel can't compile)
 */
function withAstryx(nextConfig = {}) {
  const astryxPackages = [
    '@astryxdesign/core',
    '@astryxdesign/theme-neutral',
    '@astryxdesign/lab',
  ];

  const existingTranspile = nextConfig.transpilePackages || [];
  const merged = Array.from(new Set([...existingTranspile, ...astryxPackages]));

  const existingWebpack = nextConfig.webpack;

  return {
    ...nextConfig,
    transpilePackages: merged,
    webpack: (config, context) => {
      // Resolve @astryxdesign packages from their `source` export (raw TS) so
      // the sandbox/docsite build straight from src without a prebuild step.
      config.resolve = config.resolve || {};
      config.resolve.conditionNames = [
        'source',
        'import',
        'require',
        'default',
      ];

      // The global `source` condition above also affects `lexical`/`@lexical/*`
      // (imported by @astryxdesign/lab's RichTextEditor), which ship a `source`
      // export pointing at raw `.ts`. Next's Babel cannot compile that — it
      // hits `declare` class fields and fails the build. Unlike Astryx
      // packages, lexical is NOT transpiled, so it must come from its prebuilt
      // dist. Pin every lexical package to its dist output via resolve.alias,
      // which wins over export-condition resolution regardless of which package
      // issued the import. Resolved relative to the Next project dir
      // (`context.dir`), falling back to cwd.
      const fromDir = (context && context.dir) || process.cwd();
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        ...buildLexicalDistAliases(fromDir),
      };

      // Preserve the symlinked node_modules path so Next.js's
      // transpilePackages matcher recognizes @astryxdesign/* packages under
      // pnpm's symlinked layout. Without this, webpack dereferences
      // the symlink to packages/<name>/... which doesn't contain
      // "node_modules/@astryxdesign" and transpilation is silently skipped,
      // breaking subpath imports like '@astryxdesign/core/AlertDialog'.
      config.resolve.symlinks = false;

      // Call user's webpack config if provided
      if (existingWebpack) {
        return existingWebpack(config, context);
      }
      return config;
    },
  };
}

module.exports = {withAstryx, buildLexicalDistAliases};

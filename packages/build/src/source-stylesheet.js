// Copyright (c) Meta Platforms, Inc. and affiliates.

'use strict';

/**
 * @astryxdesign/build — source stylesheets (spec:AST-080 FR7): a source build
 * of every module of a package prints its prebuilt stylesheet's rules,
 * selectors and order, in one `@layer astryx-base`. `stylexOptions()` is how
 * the prebuilt stylesheets are compiled (scripts/build-css.mjs),
 * `packageModules()` the module set one covers, and `renderPackage()` prints
 * it. The bundler compiles the same modules with the same options
 * (turbopack-loader.js), so rendered class names match the rules.
 */

const fs = require('node:fs');
const path = require('node:path');
const {globSync} = require('fast-glob');

// Loaded on first use: next.js reads this file's package helpers on the
// webpack path too, which must not start requiring the compiler.
const babel = () => require('@babel/core');
const stylexBabelPlugin = () => require('@stylexjs/babel-plugin');

/** The packages withAstryx() builds from source, when installed with
 * `source` entries. Theme packages ship none and keep their stylesheet. */
const ASTRYX_PACKAGES = [
  '@astryxdesign/core',
  '@astryxdesign/theme-neutral',
  '@astryxdesign/lab',
];

const CORE = '@astryxdesign/core';
const STYLEX_MODULE = /\.stylex\.[cm]?[jt]sx?$/;

/**
 * Locate an installed package's directory by walking `node_modules` up from
 * `from`, the way Node resolves a bare specifier. Null when not installed.
 */
function findPackageDir(name, from) {
  let dir = path.resolve(from);
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

function readManifest(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * The installed packages a source build compiles, in `ASTRYX_PACKAGES`
 * order, each with its exact `source` entries (request → file). A package's
 * source directory is the one its root entry lives in.
 */
function sourcePackages(from) {
  const packages = [];
  for (const name of ASTRYX_PACKAGES) {
    const dir = findPackageDir(name, from);
    const exports = dir && readManifest(dir)?.exports;
    if (exports == null || typeof exports !== 'object') {
      continue;
    }
    const entries = new Map();
    for (const [key, value] of Object.entries(exports)) {
      if (typeof value?.source === 'string' && !key.includes('*')) {
        const request = key === '.' ? name : `${name}/${key.slice(2)}`;
        entries.set(request, path.resolve(dir, value.source));
      }
    }
    if (entries.has(name)) {
      packages.push({
        name,
        dir,
        srcDir: path.dirname(entries.get(name)),
        entries,
      });
    }
  }
  return packages;
}

/**
 * The StyleX options the prebuilt stylesheets are compiled with: the default
 * `x` class-name prefix, no development class names and StyleX's default
 * property validation. A package other than Core reads Core's variable modules
 * from Core's source, as the prebuilt build does, so each variable hashes to
 * the name Core declares. Plain JSON: Turbopack passes only serializable
 * loader options.
 */
function stylexOptions(pkg, packages) {
  const core = packages.find(candidate => candidate.name === CORE);
  return {
    dev: false,
    runtimeInjection: false,
    genConditionalClasses: true,
    treeshakeCompensation: true,
    aliases:
      pkg.name === CORE || core == null
        ? {}
        : {
            '@astryxdesign/core/*': [path.join(core.srcDir, '*')],
            '@astryxdesign/core': [core.srcDir],
          },
    unstable_moduleResolution: {type: 'commonJS', rootDir: pkg.dir},
  };
}

function staticStyleXImports(source) {
  const specifiers = [];
  const pattern =
    /\b(?:import|export)\s+([^'";]*?\sfrom\s*)?['"]([^'"]+\.stylex)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const clause = (match[1] ?? '').replace(/\s+from\s*$/, '').trim();
    const named = /^\{([^}]*)\}$/.exec(clause);
    const typeOnly =
      /^type(?:\s|\*|\{)/.test(clause) ||
      (named != null &&
        named[1]
          .split(',')
          .map(specifier => specifier.trim())
          .filter(Boolean)
          .every(specifier => /^type\b/.test(specifier)));
    if (!typeOnly) {
      specifiers.push(match[2]);
    }
  }
  return specifiers;
}

const SUFFIXES = ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx'];

/** The first file named by a base and a suffix, in order. */
function firstFile(bases, suffixes = SUFFIXES) {
  for (const file of bases.flatMap(base => suffixes.map(s => base + s))) {
    if (fs.statSync(file, {throwIfNoEntry: false})?.isFile()) return file;
  }
  return null;
}

function resolveStyleXImport(specifier, importer, aliases) {
  if (specifier.startsWith('.')) {
    return firstFile([path.resolve(path.dirname(importer), specifier)]);
  }
  for (const [pattern, targets] of Object.entries(aliases)) {
    const [prefix, suffix = ''] = pattern.split('*');
    if (specifier.startsWith(prefix) && specifier.endsWith(suffix)) {
      const matched = specifier.slice(
        prefix.length,
        specifier.length - suffix.length,
      );
      const found = targets
        .map(target => firstFile([target.replace('*', matched)]))
        .find(Boolean);
      if (found) return found;
    }
  }
  return null;
}

/**
 * The modules a package's prebuilt stylesheet is compiled from: every source
 * file except tests, plus the variable modules they import, minus those a
 * provider's stylesheet already emits. The parity test in
 * source-stylesheet.test.mjs fails if this drifts from scripts/build-css.mjs.
 */
function packageModules(pkg, packages, provided = new Set()) {
  const {aliases} = stylexOptions(pkg, packages);
  const queue = globSync('**/*.{ts,tsx}', {
    cwd: pkg.srcDir,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
  })
    .map(file => path.normalize(file))
    .filter(file => !STYLEX_MODULE.test(file));
  const modules = new Set();
  while (queue.length > 0) {
    const file = queue.shift();
    if (modules.has(file)) continue;
    modules.add(file);
    for (const specifier of staticStyleXImports(
      fs.readFileSync(file, 'utf8'),
    )) {
      const dependency = resolveStyleXImport(specifier, file, aliases);
      if (dependency == null) {
        throw new Error(
          `[@astryxdesign/build] Cannot resolve "${specifier}" from ${file}`,
        );
      }
      if (!provided.has(dependency)) queue.push(dependency);
    }
  }
  return modules;
}

const compiled = new Map();

function stamp(file) {
  const stat = fs.statSync(file);
  return `${stat.mtimeMs}:${stat.size}`;
}

/** One module's StyleX rules, cached on its modification stamp. */
async function compileRules(file, options) {
  const key = `${stamp(file)}:${JSON.stringify(options)}`;
  if (compiled.get(file)?.key === key) {
    return compiled.get(file).rules;
  }
  const code = fs.readFileSync(file, 'utf8');
  let rules = [];
  if (code.includes('@stylexjs/stylex')) {
    const result = await babel().transformAsync(code, {
      filename: file,
      babelrc: false,
      configFile: false,
      code: false,
      parserOpts: {plugins: ['typescript', 'jsx']},
      plugins: [[stylexBabelPlugin(), options]],
    });
    rules = result?.metadata?.stylex ?? [];
  }
  compiled.set(file, {key, rules});
  return rules;
}

/**
 * Print a package's rules as its prebuilt stylesheet prints them: StyleX's
 * output, inside one `@layer astryx-base`, or nothing when there is none.
 */
function renderPackage(rules) {
  const css = stylexBabelPlugin().processStylexRules(rules, false);
  if (!css.trim()) return '';
  return `@layer astryx-base {\n${css.replace(/^/gm, '  ')}\n}\n`;
}

/**
 * The stylesheet a source build emits: every rule of each source-built
 * package, one `@layer astryx-base` block per package in package order, as its
 * prebuilt stylesheet prints them. Another package's block leaves out the Core
 * variable modules Core's block carries, as prebuilt `lab.css` does (FR2).
 */
async function sourceStylesheet({cwd}) {
  const packages = sourcePackages(cwd);
  const blocks = [];
  let provided = new Set();
  for (const pkg of packages) {
    const modules = packageModules(pkg, packages, provided);
    if (pkg.name === CORE) {
      provided = new Set([...modules].filter(file => STYLEX_MODULE.test(file)));
    }
    const options = stylexOptions(pkg, packages);
    const rules = [];
    for (const file of modules) {
      rules.push(...(await compileRules(file, options)));
    }
    blocks.push(renderPackage(rules));
  }
  return {css: blocks.filter(Boolean).join('\n'), packages};
}

module.exports = {
  ASTRYX_PACKAGES,
  findPackageDir,
  sourcePackages,
  stylexOptions,
  packageModules,
  compileRules,
  renderPackage,
  sourceStylesheet,
};

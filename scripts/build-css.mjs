// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-css.mjs
 * Post-build script that extracts StyleX CSS from compiled source files
 * and outputs a combined stylesheet wrapped in @layer astryx-base.
 *
 * Usage:
 *   node scripts/build-css.mjs                 # core  → packages/core/dist/astryx.css
 *   node scripts/build-css.mjs --package lab   # lab   → packages/lab/dist/lab.css
 *
 * This script:
 * 1. Runs Babel with the StyleX plugin over the target package's source files
 * 2. Collects all StyleX rules
 * 3. Outputs a combined stylesheet with all rules in @layer astryx-base
 * 4. Writes `<stylesheet>.json` beside it: the stylesheet's digest and the
 *    rules each module renders with, by line
 *
 * Dist consumers import the full stylesheet, e.g.:
 *   import '@astryxdesign/core/astryx.css';
 *   import '@astryxdesign/lab/lab.css';
 * or, at build time, the subset for the modules their build ships, through
 * `subsetStylesheet` from `@astryxdesign/core/stylesheet`.
 *
 * SYNC: packages/core/src/stylesheet.ts (reads the `.json` index)
 */

import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {glob} from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Per-package build targets. Each entry defines where source lives, where the
// stylesheet is written, and any StyleX module-resolution aliases needed for
// cross-package theme-token imports (lab consumes @astryxdesign/core tokens).
const TARGETS = {
  core: {
    src: path.resolve(ROOT, 'packages/core/src'),
    dist: path.resolve(ROOT, 'packages/core/dist'),
    outFile: 'astryx.css',
    banner: 'Astryx Pre-compiled StyleX CSS — all components',
    aliases: {},
  },
  lab: {
    src: path.resolve(ROOT, 'packages/lab/src'),
    dist: path.resolve(ROOT, 'packages/lab/dist'),
    outFile: 'lab.css',
    banner: 'Astryx Lab Pre-compiled StyleX CSS — experimental components',
    // lab imports @astryxdesign/core/theme/tokens.stylex; point the resolver at
    // core's source so the cross-package token reference resolves.
    aliases: {
      '@astryxdesign/core/*': [path.join(ROOT, 'packages/core/src/*')],
      '@astryxdesign/core': [path.join(ROOT, 'packages/core/src')],
    },
    // astryx.css always loads with this stylesheet, so a Core variable group
    // it already declares is not repeated here.
    provider: 'core',
  },
  charts: {
    src: path.resolve(ROOT, 'packages/charts/src'),
    dist: path.resolve(ROOT, 'packages/charts/dist'),
    outFile: 'charts.css',
    banner:
      'Astryx Charts Pre-compiled StyleX CSS — data visualization components',
    // charts imports @astryxdesign/core/theme/tokens.stylex; point the resolver
    // at core's source so the cross-package token reference resolves.
    aliases: {
      '@astryxdesign/core/*': [path.join(ROOT, 'packages/core/src/*')],
      '@astryxdesign/core': [path.join(ROOT, 'packages/core/src')],
    },
    // astryx.css always loads with this stylesheet, so a Core variable group
    // it already declares is not repeated here.
    provider: 'core',
  },
  richtext: {
    src: path.resolve(ROOT, 'packages/richtext/src'),
    dist: path.resolve(ROOT, 'packages/richtext/dist'),
    outFile: 'richtext.css',
    banner:
      'Astryx Rich Text Pre-compiled StyleX CSS — Lexical editor and viewer',
    // richtext imports @astryxdesign/core/theme/tokens.stylex; point the
    // resolver at core's source so the cross-package token reference resolves.
    aliases: {
      '@astryxdesign/core/*': [path.join(ROOT, 'packages/core/src/*')],
      '@astryxdesign/core': [path.join(ROOT, 'packages/core/src')],
    },
    // astryx.css always loads with this stylesheet, so a Core variable group
    // it already declares is not repeated here.
    provider: 'core',
  },
};

function parseTarget() {
  const idx = process.argv.indexOf('--package');
  const name = idx !== -1 ? process.argv[idx + 1] : 'core';
  const target = TARGETS[name];
  if (!target) {
    console.error(
      `Unknown --package "${name}". Valid: ${Object.keys(TARGETS).join(', ')}`,
    );
    process.exit(1);
  }
  return {
    name,
    ...target,
    provider: target.provider ? TARGETS[target.provider] : undefined,
  };
}

function staticStyleXImports(source) {
  const specifiers = [];
  const pattern =
    /\b(?:import|export)\s+([^'";]*?\sfrom\s*)?['"]([^'"]+\.stylex)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const clause = (match[1] ?? '').replace(/\s+from\s*$/, '').trim();
    if (/^type(?:\s|\*|\{)/.test(clause)) {
      continue;
    }

    // TypeScript also permits `import {type Foo}` and
    // `export {type Foo}`. Keep a mixed list when any runtime binding remains,
    // but do not make an all-type list retain a variable module.
    const named = /^\{([^}]*)\}$/.exec(clause);
    if (
      named &&
      named[1]
        .split(',')
        .map(specifier => specifier.trim())
        .filter(Boolean)
        .every(specifier => /^type\b/.test(specifier))
    ) {
      continue;
    }

    specifiers.push(match[2]);
  }
  return specifiers;
}

async function firstExistingModule(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
  ];
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return candidate;
      }
    } catch {
      // Try the next supported source spelling.
    }
  }
  return null;
}

async function resolveStyleXImport(specifier, importer, aliases) {
  if (specifier.startsWith('.')) {
    return firstExistingModule(path.resolve(path.dirname(importer), specifier));
  }

  for (const [pattern, replacements] of Object.entries(aliases)) {
    const wildcard = pattern.indexOf('*');
    const prefix = wildcard === -1 ? pattern : pattern.slice(0, wildcard);
    const suffix = wildcard === -1 ? '' : pattern.slice(wildcard + 1);
    if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) {
      continue;
    }
    const matched = specifier.slice(
      prefix.length,
      suffix ? -suffix.length : undefined,
    );
    for (const replacement of replacements) {
      const candidate = replacement.replace('*', matched);
      const resolved = await firstExistingModule(candidate);
      if (resolved) {
        return resolved;
      }
    }
  }
  return null;
}

const STYLEX_MODULE = /\.stylex\.[cm]?[jt]sx?$/;

/**
 * Walks a package from its all-component entry set through static `.stylex`
 * imports. Non-StyleX source files are the entries; a variable module joins
 * only when a reachable file imports it, so a public defineVars module stays
 * absent from packages that never consume it. Modules in `provided` are left
 * to the stylesheet that already emits them.
 *
 * Each reachable file maps to its source and the `.stylex` modules it
 * imports, so the stylesheet index can credit a module with the definitions
 * it reads.
 */
async function reachableSourceFiles(target, provided = new Set()) {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: target.src,
    absolute: true,
    ignore: ['**/*.test.*', '**/*.d.ts', '**/node_modules/**'],
  });

  const queue = files.filter(file => !STYLEX_MODULE.test(file));
  const reachable = new Map();

  while (queue.length > 0) {
    const file = queue.shift();
    if (reachable.has(file)) {
      continue;
    }

    const code = await fs.readFile(file, 'utf8');
    const imports = [];
    reachable.set(file, {code, imports});
    for (const specifier of staticStyleXImports(code)) {
      const dependency = await resolveStyleXImport(
        specifier,
        file,
        target.aliases,
      );
      if (!dependency) {
        throw new Error(
          `Could not resolve StyleX dependency "${specifier}" from ${path.relative(ROOT, file)}`,
        );
      }
      if (!provided.has(dependency)) {
        imports.push(dependency);
        queue.push(dependency);
      }
    }
  }
  return reachable;
}

/**
 * The variable modules a provider package's own stylesheet emits. A satellite
 * package that imports one of them relies on that stylesheet instead of
 * declaring the same group a second time.
 */
async function providedStyleXModules(provider) {
  if (!provider) {
    return new Set();
  }
  const reachable = await reachableSourceFiles(provider);
  return new Set(
    [...reachable.keys()].filter(file => STYLEX_MODULE.test(file)),
  );
}

/**
 * Compiles every reachable file and keeps each one's StyleX rules. `rules`
 * is the whole package in walk order, which fixes the stylesheet's bytes;
 * `modules` maps each file to its own rules and the `.stylex` modules it
 * imports.
 */
export async function collectStyleXModules(target) {
  const provided = await providedStyleXModules(target.provider);
  const reachable = await reachableSourceFiles(target, provided);
  const rules = [];
  const modules = new Map();

  console.log(`Processing ${reachable.size} reachable source files...`);

  for (const [file, {code, imports}] of reachable) {
    const own = [];
    modules.set(file, {rules: own, imports});
    if (!code.includes('@stylexjs/stylex')) {
      continue;
    }

    try {
      const result = await transformAsync(code, {
        babelrc: false,
        filename: file,
        presets: [
          ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
          ['@babel/preset-react', {runtime: 'automatic'}],
        ],
        plugins: [
          [
            stylexBabelPlugin,
            {
              dev: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              aliases: target.aliases,
              unstable_moduleResolution: {
                type: 'commonJS',
                rootDir: ROOT,
              },
            },
          ],
        ],
      });

      if (result?.metadata?.stylex?.length) {
        own.push(...result.metadata.stylex);
        rules.push(...result.metadata.stylex);
      }
    } catch (err) {
      throw new Error(
        `Could not process ${path.relative(ROOT, file)}: ${err.message}`,
        {cause: err},
      );
    }
  }

  console.log(
    `Collected ${rules.length} StyleX rules from ${reachable.size} reachable files`,
  );
  return {rules, modules};
}

export async function collectStyleXCSS(target) {
  return (await collectStyleXModules(target)).rules;
}

/** The stylesheet text for a package's compiled rules. */
export function renderStylesheet(target, rules) {
  const css = stylexBabelPlugin.processStylexRules(rules, false);
  return `${stylesheetPrelude(target)}${css
    .split('\n')
    .map(line => '  ' + line)
    .join('\n')}\n}\n`;
}

function stylesheetPrelude(target) {
  return `/* ${target.banner} */\n/* Auto-generated. Do not edit manually. */\n\n@layer astryx-base {\n`;
}

// A selector no Astryx module can produce. One probe rule per priority level
// keeps a module's rules at the level positions they hold in the whole sheet.
const PROBE = '__astryx_stylesheet_index_probe';

/**
 * Maps every module to the stylesheet rules it renders with: its own rules
 * plus those of the `.stylex` modules it imports, transitively, so a module
 * keeps every variable group, keyframes and constant it reads. A module's
 * rules are compiled the way the whole sheet compiles them, with the same
 * constants and priority levels, so each one comes out as the exact line the
 * sheet holds. The index then names lines by number.
 *
 * Throws when a module's rule is not a line of the sheet, or a line of the
 * sheet belongs to no module: either would make a subset drop or misplace a
 * rule, so the build fails instead.
 */
export function indexStylesheet(target, stylesheet, modules) {
  const prelude = stylesheetPrelude(target);
  const start = prelude.split('\n').length - 1;
  const lines = stylesheet.split('\n');
  const end = lines.lastIndexOf('}');
  const sheetLines = lines.slice(start, end).map(line => line.slice(2));

  const lineNumbers = new Map();
  sheetLines.forEach((line, number) => {
    if (line.split('{').length !== line.split('}').length) {
      throw new Error(
        `${target.outFile} line ${start + number + 1} is not a whole rule, so the stylesheet cannot be indexed: ${line}`,
      );
    }
    lineNumbers.set(line, [...(lineNumbers.get(line) ?? []), number]);
  });

  const allRules = [...modules.values()].flatMap(module => module.rules);
  const isConstant = ([, rule]) =>
    rule?.constKey != null && rule?.constVal != null;
  const constants = allRules.filter(isConstant);
  const probes = [
    ...new Set(
      allRules
        .filter(rule => !isConstant(rule))
        .map(([, , priority]) => Math.floor(priority / 1000)),
    ),
  ].map(level => [
    `${PROBE}${level}`,
    {ltr: `.${PROBE}${level}{--${PROBE}:${level}}`, rtl: null},
    level * 1000,
  ]);

  const rulesOf = file => {
    const seen = new Set([file]);
    const queue = [file];
    const rules = [];
    while (queue.length > 0) {
      const module = modules.get(queue.shift());
      rules.push(...module.rules);
      for (const dependency of module.imports) {
        if (!seen.has(dependency)) {
          seen.add(dependency);
          queue.push(dependency);
        }
      }
    }
    return rules;
  };

  const index = {};
  const covered = new Set();
  for (const file of [...modules.keys()].sort()) {
    if (!file.startsWith(target.src + path.sep)) {
      continue;
    }
    const rules = rulesOf(file);
    if (rules.length === 0) {
      continue;
    }
    const css = stylexBabelPlugin.processStylexRules(
      [...constants, ...probes, ...rules],
      false,
    );
    const numbers = new Set();
    for (const line of css.split('\n')) {
      if (line.includes(PROBE)) {
        continue;
      }
      const found = lineNumbers.get(line);
      if (found == null) {
        throw new Error(
          `${path.relative(ROOT, file)} compiles a rule that ${target.outFile} does not hold: ${line}`,
        );
      }
      for (const number of found) {
        numbers.add(number);
        covered.add(number);
      }
    }
    if (numbers.size > 0) {
      const module = path
        .relative(target.src, file)
        .split(path.sep)
        .join('/')
        .replace(/\.tsx?$/, '.js');
      index[module] = [...numbers].sort((a, b) => a - b);
    }
  }

  if (covered.size !== sheetLines.length) {
    const orphan = sheetLines.find((_, number) => !covered.has(number));
    throw new Error(
      `${target.outFile} holds a rule no module renders with: ${orphan}`,
    );
  }

  return {
    stylesheet: target.outFile,
    sha256: createHash('sha256').update(stylesheet).digest('hex'),
    rules: {start, count: sheetLines.length},
    modules: index,
  };
}

async function main() {
  const target = parseTarget();
  const {rules, modules} = await collectStyleXModules(target);

  if (rules.length === 0) {
    console.error('No StyleX rules found!');
    process.exit(1);
  }

  await fs.mkdir(target.dist, {recursive: true});

  // Index before writing, so a stylesheet never ships without its index.
  const stylesheet = renderStylesheet(target, rules);
  const index = indexStylesheet(target, stylesheet, modules);
  const outPath = path.resolve(target.dist, target.outFile);
  await fs.writeFile(outPath, stylesheet, 'utf8');
  await fs.writeFile(`${outPath}.json`, `${JSON.stringify(index)}\n`, 'utf8');
  console.log(`${target.outFile}: ${(stylesheet.length / 1024).toFixed(1)} KB`);
  console.log(
    `${target.outFile}.json: ${Object.keys(index.modules).length} modules`,
  );
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

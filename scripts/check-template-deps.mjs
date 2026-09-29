#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Source check: every template's effective dependencies must be policy-clean.
 *
 * Templates are the first thing an agent copies, so a template that imports a
 * third-party library teaches the escape hatch to every agent that scaffolds
 * from it (#6717: dashboard-scorecard shipped `recharts`). This gate keeps
 * that from recurring:
 *
 * - Each template declares its runtime deps in `template.doc.mjs`
 *   (`dependencies`, on the `TemplateDoc` type). Where a declaration is
 *   present, the gate verifies it matches the imports actually in the
 *   template source, so the list cannot go stale.
 * - Every effective dependency must be a React platform peer, a stable
 *   (non-canary) `@astryxdesign/*` package, or on the documented allowlist
 *   below. Anything else fails the check.
 * - Templates that have not declared `dependencies` yet are checked against
 *   their derived imports (with a nudge to declare); nothing escapes the
 *   policy for lacking the field.
 *
 * Known pre-existing violations are grandfathered in GRANDFATHERED with the
 * issue tracking their cleanup — the gate blocks *new* violations.
 *
 * Usage: node scripts/check-template-deps.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const TEMPLATES_ROOT = path.join(REPO, 'packages/cli/assets/templates');

/** React platform peers — every template may assume these. */
const PLATFORM = new Set(['react', 'react-dom']);

/**
 * Documented allowlist: non-Astryx packages a template may use, with the
 * reason each one is not an escape hatch. Additions need a comment here.
 */
const ALLOWLIST = new Map([
  [
    '@stylexjs/stylex',
    'the styling runtime every Astryx template builds on',
  ],
  [
    '@heroicons/react',
    'icon glyphs rendered through Astryx\u2019s Icon component (documented pattern)',
  ],
  [
    'lucide-react',
    'icon glyphs rendered through Astryx\u2019s Icon component (documented pattern)',
  ],
]);

/**
 * Pre-existing violations, grandfathered pending cleanup. The gate fails on
 * any violation NOT listed here.
 * @type {Map<string, string>}
 */
const GRANDFATHERED = new Map([
  [
    'pages/dashboard',
    'recharts usage predates the policy; convert to dependency-free SVG (see #6717)',
  ],
  [
    'pages/dashboard-alert-rail',
    'recharts usage predates the policy; convert to dependency-free SVG (see #6717)',
  ],
  [
    'pages/dashboard-cohort-funnel',
    'recharts usage predates the policy; convert to dependency-free SVG (see #6717)',
  ],
  [
    'pages/dashboard-comparison',
    'recharts usage predates the policy; convert to dependency-free SVG (see #6717)',
  ],
  [
    'pages/dashboard-composition',
    'recharts usage predates the policy; convert to dependency-free SVG (see #6717)',
  ],
  [
    'pages/dashboard-progress',
    'recharts usage predates the policy; convert to dependency-free SVG (see #6717)',
  ],
]);

/**
 * `@scope/name/sub` -> `@scope/name`; `name/sub` -> `name`.
 * @param {string} specifier
 * @returns {string}
 */
export function packageRoot(specifier) {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.length >= 2 ? parts.slice(0, 2).join('/') : specifier;
  }
  return specifier.split('/')[0];
}

const IMPORT_RE =
  /^\s*import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)/gm;

/**
 * Strip block and line comments so doc examples (e.g. `npm install x` in a
 * comment) are never mistaken for imports. Approximate but safe for the
 * import lines this gate reads.
 * @param {string} text
 * @returns {string}
 */
export function stripComments(text) {
  // Template literals first: real imports never live inside one, but doc
  // strings (like a README code sample) do contain import-looking text.
  const noTemplates = text.replace(/`(?:[^`\\]|\\.)*`/g, '``');
  const noBlocks = noTemplates.replace(/\/\*[\s\S]*?\*\//g, '');
  return noBlocks
    .split('\n')
    .map(line => {
      let inStr = false;
      let quote = '';
      for (let i = 0; i < line.length - 1; i++) {
        const ch = line[i];
        if (inStr) {
          if (ch === quote) inStr = false;
        } else if (ch === '"' || ch === "'") {
          inStr = true;
          quote = ch;
        } else if (ch === '/' && line[i + 1] === '/') {
          return line.slice(0, i);
        }
      }
      return line;
    })
    .join('\n');
}

/**
 * Collect bare package imports from a template's source files.
 * @param {string} templateDir
 * @returns {string[]} sorted package roots
 */
export function importedPackages(templateDir) {
  const found = new Set();
  /** @param {string} dir */
  const walk = dir => {
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (
        entry.isFile() &&
        entry.name !== 'template.doc.mjs' &&
        /\.(mjs|[jt]sx?)$/.test(entry.name)
      ) {
        let text;
        try {
          text = stripComments(fs.readFileSync(abs, 'utf8'));
        } catch {
          continue;
        }
        IMPORT_RE.lastIndex = 0;
        let m;
        while ((m = IMPORT_RE.exec(text)) !== null) {
          const spec = m[1] ?? m[2] ?? m[3];
          if (!spec || spec.startsWith('.') || spec.startsWith('node:')) {
            continue;
          }
          found.add(packageRoot(spec));
        }
      }
    }
  };
  walk(templateDir);
  return [...found].sort();
}

/**
 * Read the declared `dependencies` from a template's doc module.
 * @param {string} templateDir
 * @returns {Promise<string[]|null>} null when the template declares none
 */
export async function declaredDependencies(templateDir) {
  const docPath = path.join(templateDir, 'template.doc.mjs');
  const mod = await import(pathToFileURL(docPath).href);
  const doc = mod.doc ?? mod.docs;
  const deps = doc?.dependencies;
  return Array.isArray(deps) ? [...deps].sort() : null;
}

/**
 * Map of `@astryxdesign/*` package name -> {canaryOnly}, read from the repo's
 * own packages (including the nested `packages/themes/*`). Stability is a
 * repo fact, not a guess.
 * @param {string} [repoRoot]
 * @returns {Map<string, {canaryOnly: boolean}>}
 */
export function stableAstryxPackages(repoRoot = REPO) {
  const map = new Map();
  const roots = [
    path.join(repoRoot, 'packages'),
    path.join(repoRoot, 'packages', 'themes'),
  ];
  for (const pkgsDir of roots) {
    let dirs;
    try {
      dirs = fs.readdirSync(pkgsDir);
    } catch {
      continue;
    }
    for (const dir of dirs) {
      let pkg;
      try {
        pkg = JSON.parse(
          fs.readFileSync(path.join(pkgsDir, dir, 'package.json'), 'utf8'),
        );
      } catch {
        continue;
      }
      if (
        typeof pkg.name === 'string' &&
        pkg.name.startsWith('@astryxdesign/')
      ) {
        map.set(pkg.name, {canaryOnly: pkg.astryx?.canaryOnly === true});
      }
    }
  }
  return map;
}

/**
 * Audit one template directory.
 * @param {string} templateDir
 * @param {string} key e.g. `pages/dashboard-scorecard`
 * @param {{stable?: Map<string, {canaryOnly: boolean}>}} [options]
 * @returns {Promise<{problems: string[], warnings: string[]}>}
 */
export async function auditTemplate(templateDir, key, options = {}) {
  const problems = [];
  const warnings = [];
  const stable = options.stable ?? stableAstryxPackages();
  const imported = importedPackages(templateDir);
  const declared = await declaredDependencies(templateDir);
  const effective = declared ?? imported;

  if (declared === null) {
    warnings.push(
      `${key}: template.doc.mjs does not declare \`dependencies\`; checked derived imports instead`,
    );
  } else {
    for (const dep of imported) {
      if (!declared.includes(dep)) {
        problems.push(`${key}: imports '${dep}' but does not declare it`);
      }
    }
    for (const dep of declared) {
      if (!imported.includes(dep)) {
        problems.push(
          `${key}: declares '${dep}' but never imports it (stale declaration)`,
        );
      }
    }
  }

  const grandfathered = GRANDFATHERED.get(key);
  for (const dep of effective) {
    if (PLATFORM.has(dep)) continue;
    if (ALLOWLIST.has(dep)) continue;
    if (dep.startsWith('@astryxdesign/')) {
      const meta = stable.get(dep);
      if (meta && !meta.canaryOnly) continue;
      const why = meta
        ? `'${dep}' is canary-only, not a stable package`
        : `'${dep}' is not a workspace @astryxdesign/* package`;
      if (grandfathered) {
        warnings.push(`${key}: grandfathered — ${why} (${grandfathered})`);
      } else {
        problems.push(`${key}: ${why}; templates must use stable Astryx packages`);
      }
      continue;
    }
    if (grandfathered) {
      warnings.push(
        `${key}: grandfathered — '${dep}' is not a stable Astryx package (${grandfathered})`,
      );
    } else {
      problems.push(
        `${key}: '${dep}' is not a stable @astryxdesign/* package and is not allowlisted; templates must not teach third-party escape hatches`,
      );
    }
  }

  return {problems, warnings};
}

/**
 * Find every template directory (contains a template.doc.mjs).
 * @returns {Array<{dir: string, key: string}>}
 */
export function findTemplates() {
  const out = [];
  for (const kind of ['pages', 'blocks']) {
    const kindDir = path.join(TEMPLATES_ROOT, kind);
    let names;
    try {
      names = fs.readdirSync(kindDir);
    } catch {
      continue;
    }
    for (const name of names.sort()) {
      const dir = path.join(kindDir, name);
      if (
        fs.statSync(dir).isDirectory() &&
        fs.existsSync(path.join(dir, 'template.doc.mjs'))
      ) {
        out.push({dir, key: `${kind}/${name}`});
      }
    }
  }
  return out;
}

async function main() {
  const templates = findTemplates();
  let failed = 0;
  for (const {dir, key} of templates) {
    const {problems, warnings} = await auditTemplate(dir, key);
    for (const w of warnings) console.warn(`warning: ${w}`);
    for (const p of problems) {
      console.error(`error: ${p}`);
      failed++;
    }
  }
  console.log(
    `check-template-deps: ${templates.length} templates, ${failed} problem(s)`,
  );
  if (failed > 0) process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await main();
}

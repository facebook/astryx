#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * XDS changeset authoring wrapper — `pnpm changeset:new`.
 *
 * Encapsulates the three things our release process needs but the bare
 * `changeset` CLI does not capture well (see [[Release Process]] wiki):
 *
 *   1. Repo-wide changes / per-package changelogs — auto-detects which
 *      publishable packages your working tree touched and pre-selects them,
 *      so you don't hand-enumerate the frontmatter. Only genuinely-affected
 *      packages get the changelog entry; the `fixed` lockstep co-bumps the
 *      rest so versions stay aligned without polluting their changelogs.
 *   2. semver vs v0 — forces `patch` while the repo is < 1.0. No way to
 *      accidentally author a `minor` that jumps 0.0.x -> 0.1.0.
 *   3. Contributor encapsulation — captures the human contributor(s) at
 *      authoring time (defaulting to your `gh` / git identity) and writes them
 *      into the changeset body, where the custom changelog module reads them.
 *
 * Output is a normal `.changeset/<id>.md` — fully compatible with the stock
 * `changeset version`. The only convention is the body format, validated by
 * scripts/check-changesets.mjs.
 *
 * Flags (all optional; missing values are prompted):
 *   --category <key>     breaking|component|feat|fix|perf|docs|chore
 *   --summary  <text>    one-line headline
 *   --contributor <h>    repeatable; defaults to detected identity
 *   --pr <number>        PR number (appended as (#n) if not already in summary)
 *   --packages <a,b>     override detected package list
 *   --yes                non-interactive; use flags/defaults, no prompts
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {
  CATEGORIES,
  CATEGORY_KEYS,
  normalizeCategory,
} = require('./changeset-entry-format.cjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- args ----------------------------------------------------------------
function parseArgs(argv) {
  const out = {contributor: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes' || a === '-y') out.yes = true;
    else if (a === '--category') out.category = argv[++i];
    else if (a === '--summary') out.summary = argv[++i];
    else if (a === '--pr') out.pr = argv[++i];
    else if (a === '--packages') out.packages = argv[++i];
    else if (a === '--contributor') out.contributor.push(argv[++i]);
  }
  return out;
}
const args = parseArgs(process.argv.slice(2));

// ---- shell helper --------------------------------------------------------
function sh(cmd) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function readConfig() {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, '.changeset/config.json'), 'utf8'),
  );
}

// ---- discover publishable packages --------------------------------------
function discoverPackages() {
  const ws = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  const globs = [...ws.matchAll(/^\s*-\s*["']?([^"'\n]+)["']?/gm)].map(m =>
    m[1].trim(),
  );
  const dirs = new Set();
  for (const g of globs) {
    const base = g.replace(/\/\*+$/, '');
    const abs = path.join(ROOT, base);
    if (!fs.existsSync(abs)) continue;
    if (g.endsWith('*')) {
      for (const d of fs.readdirSync(abs, {withFileTypes: true})) {
        if (d.isDirectory()) dirs.add(path.join(abs, d.name));
      }
    } else {
      dirs.add(abs);
    }
  }
  const pkgs = [];
  for (const dir of dirs) {
    const pj = path.join(dir, 'package.json');
    if (!fs.existsSync(pj)) continue;
    const p = JSON.parse(fs.readFileSync(pj, 'utf8'));
    if (!p.name) continue;
    pkgs.push({name: p.name, dir, private: !!p.private, version: p.version});
  }
  return pkgs;
}

function publishable(pkgs, config) {
  const ignore = new Set(config.ignore || []);
  return pkgs.filter(p => !p.private && !ignore.has(p.name));
}

// Map changed files -> owning packages (longest-prefix match).
function detectChangedPackages(pkgs) {
  const base = readConfig().baseBranch || 'main';
  let changed = sh(`git diff --name-only origin/${base}...HEAD`)
    .split('\n')
    .filter(Boolean);
  changed = changed.concat(
    sh('git diff --name-only HEAD').split('\n').filter(Boolean),
  );
  changed = changed.concat(
    sh('git diff --name-only --cached').split('\n').filter(Boolean),
  );
  changed = [...new Set(changed)];
  const rels = pkgs
    .map(p => ({...p, rel: path.relative(ROOT, p.dir)}))
    .sort((a, b) => b.rel.length - a.rel.length);
  const hit = new Set();
  for (const f of changed) {
    for (const p of rels) {
      if (f === p.rel || f.startsWith(p.rel + '/')) {
        hit.add(p.name);
        break;
      }
    }
  }
  return hit;
}

// ---- identity ------------------------------------------------------------
function detectContributor() {
  const ghLogin = sh('gh api user --jq .login');
  if (ghLogin) return ghLogin;
  const ghName = sh('git config user.name');
  if (ghName) return ghName.replace(/\s+/g, '');
  return '';
}

// ---- prompt --------------------------------------------------------------
function makeAsk() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ask = q => new Promise(res => rl.question(q, a => res(a.trim())));
  return {ask, close: () => rl.close()};
}

function isPre1(pkgs) {
  // patch-only enforced while every publishable package is < 1.0.0
  return pkgs.every(p => /^0\./.test(String(p.version || '0')));
}

async function main() {
  const config = readConfig();
  const all = discoverPackages();
  const pub = publishable(all, config);
  const pre1 = isPre1(pub);

  let selected;
  if (args.packages) {
    selected = args.packages
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  } else {
    const detected = detectChangedPackages(pub);
    selected = pub.map(p => p.name).filter(n => detected.has(n));
  }

  let {category, summary, pr} = args;
  let contributors = args.contributor.slice();

  if (!args.yes) {
    const {ask, close} = makeAsk();
    console.log(
      `\nPublishable packages (${pub.length}): ${pub.map(p => p.name).join(', ')}`,
    );
    if (selected.length) {
      console.log(`Detected changes in: ${selected.join(', ')}`);
    } else {
      console.log('No package changes detected from git diff.');
    }
    const pkgAns = await ask(
      `Packages for this changeset${selected.length ? ` [${selected.join(', ')}]` : ''} (comma-sep, or "all"): `,
    );
    if (pkgAns) {
      if (pkgAns.toLowerCase() === 'all') selected = pub.map(p => p.name);
      else
        selected = pkgAns
          .split(/[\s,]+/)
          .map(s => s.trim())
          .filter(Boolean);
    }

    if (!category) {
      console.log('\nCategory:');
      CATEGORIES.forEach((c, i) =>
        console.log(`  ${i + 1}. ${c.key.padEnd(10)} ${c.label}`),
      );
      const ans = await ask(
        'Pick a category [1-' + CATEGORIES.length + ' or name]: ',
      );
      const byNum = CATEGORIES[parseInt(ans, 10) - 1];
      category = byNum ? byNum.key : normalizeCategory(ans);
    }
    if (!summary) summary = await ask('One-line summary: ');
    if (!pr) pr = await ask('PR number (optional, just the digits): ');
    if (contributors.length === 0) {
      const def = detectContributor();
      const ans = await ask(`Contributor handle(s)${def ? ` [${def}]` : ''}: `);
      const raw = ans || def;
      contributors = raw
        .split(/[\s,]+/)
        .map(h => h.replace(/^@/, ''))
        .filter(Boolean);
    }
    close();
  } else {
    if (contributors.length === 0) {
      const def = detectContributor();
      if (def) contributors = [def];
    }
  }

  // ---- validate ----------------------------------------------------------
  const errs = [];
  const catKey = normalizeCategory(category);
  if (!catKey)
    errs.push(
      `category must be one of: ${CATEGORY_KEYS.join(', ')} (got ${JSON.stringify(category)})`,
    );
  if (!summary) errs.push('summary is required');
  if (selected.length === 0) errs.push('at least one package must be selected');
  if (contributors.length === 0)
    errs.push('at least one contributor is required');
  if (errs.length) {
    console.error(
      '\n✗ Cannot write changeset:\n' + errs.map(e => '  - ' + e).join('\n'),
    );
    process.exit(1);
  }

  // ---- compose body ------------------------------------------------------
  let headline = summary.trim();
  const prNum = String(pr || '').replace(/[^\d]/g, '');
  if (prNum && !/\(#\d+\)/.test(headline)) headline += ` (#${prNum})`;
  const body = `[${catKey}] ${headline}\n${contributors.map(c => '@' + c).join(' ')}`;

  // ---- bump (patch-only pre-1.0) ----------------------------------------
  const bump = 'patch'; // intentionally patch; minor/major gated by checker pre-1.0
  const frontmatter = selected.map(n => `'${n}': ${bump}`).join('\n');

  // ---- filename (human-id style without the dep) ------------------------
  const slug =
    headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'change';
  const rand = Math.random().toString(36).slice(2, 6);
  const file = path.join(ROOT, '.changeset', `${slug}-${rand}.md`);

  const contents = `---\n${frontmatter}\n---\n\n${body}\n`;
  fs.writeFileSync(file, contents, 'utf8');

  console.log(`\n✓ Wrote ${path.relative(ROOT, file)}\n`);
  console.log(contents);
  if (pre1) console.log('(pre-1.0: bump forced to patch)');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

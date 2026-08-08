#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file doc-drift — one deterministic gate for documentation staleness.
 *
 * Docs (`*.doc.mjs`) and hand-maintained registries are ARTIFACTS that must
 * stay consistent with their SOURCE OF TRUTH (the component `.tsx`, the token
 * defs). Nothing checks that today, so they drift silently — props get added
 * to a component but never to its doc, a required prop is documented as
 * optional, a theme registry lags core. Agents read the drifted artifact and
 * get the wrong contract.
 *
 * This script is the single drift gate. Each drift CLASS is a pluggable check
 * that compares an artifact against its source of truth DETERMINISTICALLY (no
 * AI): structure only — which props exist, whether they're required — not the
 * human-authored prose. AI/authors own the descriptions; this owns the skeleton
 * and blocks a merge (or an AI doc regen) that leaves them inconsistent.
 *
 * Usage:
 *   node scripts/doc-drift.mjs                # report all drift (human)
 *   node scripts/doc-drift.mjs --check        # exit 1 on any NON-baselined drift (CI)
 *   node scripts/doc-drift.mjs --json         # machine-readable report
 *   node scripts/doc-drift.mjs --update-baseline   # snapshot current drift as accepted
 *   node scripts/doc-drift.mjs --only=props   # run one check class
 *
 * Rollout: land with a baseline of today's known drift (CI green), then burn the
 * baseline down (AI-assisted doc regen) and it becomes fail-on-NEW-drift.
 *
 * @position scripts — CI drift gate; not shipped runtime.
 */

import ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.join(ROOT, 'packages/core/src');
const BASELINE_FILE = path.join(__dirname, 'doc-drift.baseline.json');

/**
 * Infrastructure props that a component's `{Name}Props` may (re)declare but that
 * docs intentionally omit from `props[]`: the forwarded `ref`, the shared style
 * hooks, link-polymorphism props, `data-*` telemetry, and the raw DOM event
 * handlers. These are part of the platform surface, not the component's authored
 * API, so their absence from a doc is not drift. A doc MAY still document one
 * (many document `as`/`href`) — that's fine; we just never REQUIRE it.
 */
const INFRA_PROPS = new Set([
  'ref',
  'className',
  'style',
  'xstyle',
  'id',
  'as',
  'href',
  'target',
  'rel',
  'download',
]);

/** True for `data-*` / `aria-*` attribute names and raw DOM `on*` handlers. */
function isInfraProp(name) {
  if (INFRA_PROPS.has(name)) return true;
  if (name.startsWith('data-') || name.startsWith('aria-')) return true;
  // Raw DOM event handlers (onClick/onKeyDown/onFocus/…) come from the shared
  // HTML surface. A component's OWN behavioral callbacks use domain names
  // (clickAction, onOpenChange, onValueChange) and are NOT filtered here.
  if (/^on(Click|KeyDown|KeyUp|KeyPress|Focus|Blur|Mouse[A-Z]|Pointer[A-Z]|Touch[A-Z]|Drag|Scroll|Wheel|Input|Paste|Copy|Cut|Context)/.test(name)) {
    return true;
  }
  return false;
}

// ─── args ────────────────────────────────────────────────────────────────
const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const JSON_OUT = args.has('--json');
const UPDATE_BASELINE = args.has('--update-baseline');
const only = [...args].find(a => a.startsWith('--only='))?.slice('--only='.length);

// ─── shared helpers ────────────────────────────────────────────────────────

/** Every `*.doc.mjs` under core src, recursively (incl. sub-component docs). */
function allDocFiles(dir = CORE_SRC, out = []) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) allDocFiles(p, out);
    else if (e.name.endsWith('.doc.mjs')) out.push(p);
  }
  return out;
}

/**
 * Resolve the props of a component's `{Name}Props` symbol from the shared
 * program, using the TS type checker so `interface extends`, `type` unions, and
 * `Omit`/`Pick` all resolve. Returns only COMPONENT-DECLARED props (those whose
 * declaration lives in core src and not in BaseProps.ts / React / the DOM lib) —
 * inherited HTML/aria/data-* attributes are intentionally excluded, since docs
 * don't (and shouldn't) enumerate them.
 *
 * @param {ts.Program} program
 * @param {ts.TypeChecker} checker
 * @param {string} symbolName  e.g. `ButtonProps`
 * @param {string} preferDir   doc's directory — disambiguates when the same
 *   symbol name is declared in more than one file (e.g. two `TableRowProps`);
 *   the declaration in or under the doc's own dir wins.
 * @returns {Map<string,{required:boolean, default:string|null}> | null}
 *   null when no matching source symbol is found (caller records as "unknown").
 */
function extractTsxProps(program, checker, symbolName, preferDir) {
  const matches = [];
  for (const sf of program.getSourceFiles()) {
    if (sf.fileName.includes('/node_modules/')) continue;
    ts.forEachChild(sf, function find(n) {
      if (
        (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) &&
        n.name.text === symbolName
      ) {
        matches.push(n);
      }
      ts.forEachChild(n, find);
    });
  }
  if (matches.length === 0) return null;
  // Disambiguate: prefer a declaration in the doc's own directory subtree.
  const target =
    matches.find(m => m.getSourceFile().fileName.startsWith(preferDir + path.sep)) ??
    matches[0];

  const type = checker.getTypeAtLocation(target);
  const props = new Map();
  for (const sym of type.getProperties()) {
    const decl = (sym.getDeclarations() ?? [])[0];
    const declFile = decl?.getSourceFile()?.fileName ?? '';
    // Inherited-from-base props: exclude. They're the shared HTML surface every
    // component gets via BaseProps and are not part of the component's own API.
    if (/\/BaseProps\.ts$|node_modules|lib\.dom|@types\/react/.test(declFile)) {
      continue;
    }
    const required = (sym.flags & ts.SymbolFlags.Optional) === 0;
    let def = null;
    for (const t of ts.getJSDocTags(decl) ?? []) {
      if (['default', 'defaultValue'].includes(t.tagName?.text)) {
        def = (t.comment ?? '').toString().trim() || null;
      }
    }
    props.set(sym.name, {required, default: def});
  }
  return props;
}

/**
 * Build ONE program over every non-test `.tsx` in core src and reuse its
 * checker for all symbol lookups. A program-per-file is correct but ~40× slower
 * (≈52s vs ≈2s across the ~225 component files) — far too slow for a CI gate.
 * @returns {{program: ts.Program, checker: ts.TypeChecker}}
 */
function buildCoreProgram() {
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.tsx') && !e.name.endsWith('.test.tsx')) files.push(p);
      else if (e.name === 'index.ts') files.push(p); // some Props live in index.ts
    }
  })(CORE_SRC);
  const program = ts.createProgram(files, {
    jsx: ts.JsxEmit.Preserve,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
  });
  return {program, checker: program.getTypeChecker()};
}

// ─── check: props drift ─────────────────────────────────────────────────────

/**
 * doc.mjs props[] vs the component's {Name}Props source of truth.
 * Flags: a component-declared prop missing from the doc; a doc prop that no
 * longer exists in source (phantom); a required/optional mismatch.
 * @returns {Array<{id:string, kind:string, detail:string}>}
 */
async function checkPropsDrift() {
  const findings = [];
  const {program, checker} = buildCoreProgram();
  for (const docFile of allDocFiles()) {
    let mod;
    try {
      mod = await import(pathToFileURL(docFile).href);
    } catch {
      continue;
    }
    const doc = mod.docs;
    if (!doc?.name) continue;
    // Hooks document params/returns, not props — out of scope for this class.
    if (doc.name.startsWith('use')) continue;
    if (!Array.isArray(doc.props) || doc.props.length === 0) continue;

    const symbolName = `${doc.name}Props`;
    const tsxProps = extractTsxProps(program, checker, symbolName, path.dirname(docFile));
    const rel = path.relative(ROOT, docFile);
    if (!tsxProps) {
      // No resolvable {Name}Props — can't check. Not drift; record as skipped.
      findings.push({
        id: `${doc.name}:no-source`,
        kind: 'unresolved',
        detail: `${rel}: no resolvable ${symbolName} interface/type in core source`,
      });
      continue;
    }

    const docProps = new Map(doc.props.map(p => [p.name, p]));

    for (const [name, t] of tsxProps) {
      if (isInfraProp(name)) continue;
      if (!docProps.has(name)) {
        findings.push({
          id: `${doc.name}.${name}:missing`,
          kind: 'missing-from-doc',
          detail: `${doc.name}: prop \`${name}\` exists in ${symbolName} but is not documented`,
        });
        continue;
      }
      const d = docProps.get(name);
      const docRequired = d.required === true;
      if (docRequired !== t.required) {
        findings.push({
          id: `${doc.name}.${name}:required`,
          kind: 'required-mismatch',
          detail: `${doc.name}: prop \`${name}\` is ${t.required ? 'required' : 'optional'} in source but documented as ${docRequired ? 'required' : 'optional'}`,
        });
      }
    }
    for (const name of docProps.keys()) {
      // A documented prop that is neither a component-declared source prop nor a
      // known infra prop is a phantom: renamed or removed in source but left in
      // the doc. (Infra props a doc chooses to document are legitimate.)
      if (!tsxProps.has(name) && !isInfraProp(name)) {
        findings.push({
          id: `${doc.name}.${name}:phantom`,
          kind: 'phantom-in-doc',
          detail: `${doc.name}: documented prop \`${name}\` is not a component-declared prop (renamed/removed in source?)`,
        });
      }
    }
  }
  return findings;
}

// ─── check registry (delegate to the existing #4553-style test invariants) ──
// Placeholder hook: theme-registry drift is already gated by
// build-theme.registry.test.mjs. When that graduates into this script, add it
// here as another check class so there's one drift command.

// ─── runner ──────────────────────────────────────────────────────────────

const CHECKS = {
  props: {label: 'doc.mjs props ↔ component source', run: checkPropsDrift},
};

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) return new Set();
  try {
    return new Set(JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')).ids ?? []);
  } catch {
    return new Set();
  }
}

async function main() {
  const selected = only ? {[only]: CHECKS[only]} : CHECKS;
  const all = [];
  for (const [key, check] of Object.entries(selected)) {
    if (!check) {
      console.error(`Unknown check: ${only}`);
      process.exit(2);
    }
    const findings = await check.run();
    all.push(...findings.map(f => ({...f, check: key})));
  }

  // Drift = the actionable classes. "unresolved" is informational (can't check).
  const drift = all.filter(f => f.kind !== 'unresolved');
  const unresolved = all.filter(f => f.kind === 'unresolved');

  if (UPDATE_BASELINE) {
    const ids = drift.map(f => f.id).sort();
    fs.writeFileSync(
      BASELINE_FILE,
      JSON.stringify({generated: new Date().toISOString().slice(0, 10), count: ids.length, ids}, null, 2) + '\n',
    );
    console.log(`Baseline updated: ${ids.length} known drift item(s) recorded.`);
    return;
  }

  const baseline = loadBaseline();
  const novel = drift.filter(f => !baseline.has(f.id));
  const fixed = [...baseline].filter(id => !drift.some(f => f.id === id));

  if (JSON_OUT) {
    console.log(JSON.stringify({drift, novel, unresolved, baselineCount: baseline.size}, null, 2));
  } else {
    const byKind = {};
    for (const f of drift) (byKind[f.kind] ??= []).push(f);
    for (const [kind, items] of Object.entries(byKind)) {
      console.log(`\n${kind} (${items.length}):`);
      for (const f of items) console.log(`  ${baseline.has(f.id) ? '·' : '✗'} ${f.detail}`);
    }
    console.log(`\nSummary: ${drift.length} drift, ${novel.length} NEW (not baselined), ${baseline.size} baselined, ${unresolved.length} unresolved.`);
    if (fixed.length) console.log(`  ${fixed.length} baselined item(s) now FIXED — run --update-baseline to shrink.`);
  }

  if (CHECK && novel.length > 0) {
    if (!JSON_OUT) {
      console.error(`\n❌ ${novel.length} new documentation drift item(s). Update the doc to match its source, then re-check.`);
    }
    process.exit(1);
  }
  if (!CHECK && !JSON_OUT) console.log('\n(run with --check in CI to fail on new drift)');
}

main().catch(e => {
  console.error(e);
  process.exit(2);
});

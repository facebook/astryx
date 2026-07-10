#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Source check: `theming.targets` in *.doc.mjs must stay in sync with the
 * `themeProps()` selector surface in component source.
 *
 * Each component documents a `theming.targets` array (ThemingTarget[] in
 * packages/core/src/docs-types.ts). Every target lists a stable `astryx-*`
 * class the component renders plus the props reflected onto it — `visualProps`
 * and `states`. Those are exactly the props passed as the second argument to
 * `themeProps('<name>', { … })` in the component's .tsx.
 *
 * Today that array is hand-authored and nothing keeps it in sync with the real
 * call sites, so it drifts silently and needs manual sweep PRs to repair. This
 * check parses both sides and fails on mismatch at PR time.
 *
 * Policy (subset, validation-only):
 *   - Every `themeProps('<name>', …)` call renders `astryx-<name>` — that class
 *     MUST be documented by a theming.target somewhere in the doc file(s).
 *   - Every key passed to `themeProps()` MUST appear in the documented
 *     `visualProps ∪ states` for that class. Docs MAY document MORE props than
 *     the call site passes (e.g. props forwarded to a child element), so the
 *     documented set is a superset, not an exact match.
 *
 * The `astryx-` prefix mirrors buildClassName/stableClassName.
 * SYNC: packages/core/src/naming.ts (namespace prefix source of truth)
 * SYNC: packages/core/src/utils/themeProps.ts (buildClassName)
 *
 * Usage: node scripts/check-theming-targets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_SRC = path.resolve(__dirname, '../packages/core/src');

// SYNC: packages/core/src/naming.ts — the `astryx` namespace prefix.
const NAMESPACE = 'astryx';

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

/** Recursively collect files under `dir` whose basename passes `predicate`. */
function walk(dir, predicate, out = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__snapshots__') {
        continue;
      }
      walk(full, predicate, out);
    } else if (predicate(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const isComponentSource = name =>
  name.endsWith('.tsx') &&
  !name.endsWith('.test.tsx') &&
  !name.endsWith('.stories.tsx');

const isDoc = name => name.endsWith('.doc.mjs');

// ---------------------------------------------------------------------------
// Source parsing — extract themeProps() call sites
//
// Zero-dependency scanner: find `themeProps(`, read the string-literal first
// arg, then (if present) the object-literal second arg and its top-level keys.
// Handles multi-line calls, nested objects/arrays, and string contents by
// tracking delimiter depth. Non-literal args are flagged dynamic and skipped
// rather than crashing.
// ---------------------------------------------------------------------------

function skipWs(src, i) {
  while (i < src.length && /\s/.test(src[i])) i++;
  return i;
}

/** Read a string literal starting at src[i] (a quote char). Returns
 *  {value, end} where end is the index just past the closing quote, or
 *  {value: null} if it's a template literal with interpolation. */
function readStringLiteral(src, i) {
  const quote = src[i];
  let value = '';
  let j = i + 1;
  while (j < src.length) {
    const ch = src[j];
    if (ch === '\\') {
      value += src[j + 1];
      j += 2;
      continue;
    }
    if (quote === '`' && ch === '$' && src[j + 1] === '{') {
      // interpolated template — not a static name
      return {value: null, end: j};
    }
    if (ch === quote) {
      return {value, end: j + 1};
    }
    value += ch;
    j++;
  }
  return {value: null, end: j};
}

/** Read a balanced `{...}` region starting at src[i] === '{'. Returns
 *  {text, end} where text includes the outer braces and end is just past the
 *  closing brace. Respects strings and nested (){}[] pairs. */
function readBalancedObject(src, i) {
  const pairs = {'{': '}', '(': ')', '[': ']'};
  const stack = [];
  let j = i;
  while (j < src.length) {
    const ch = src[j];
    if (ch === "'" || ch === '"' || ch === '`') {
      const {end} = readStringLiteral(src, j);
      j = end;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') {
      stack.push(pairs[ch]);
    } else if (ch === '}' || ch === ')' || ch === ']') {
      stack.pop();
      if (stack.length === 0) {
        return {text: src.slice(i, j + 1), end: j + 1};
      }
    }
    j++;
  }
  return {text: src.slice(i), end: j};
}

/** Split an object-literal body (without the outer braces) into top-level
 *  member segments, respecting nested delimiters and strings. */
function splitTopLevel(body) {
  const segments = [];
  let depth = 0;
  let start = 0;
  let j = 0;
  while (j < body.length) {
    const ch = body[j];
    if (ch === "'" || ch === '"' || ch === '`') {
      const {end} = readStringLiteral(body, j);
      j = end;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      segments.push(body.slice(start, j));
      start = j + 1;
    }
    j++;
  }
  segments.push(body.slice(start));
  return segments.map(s => s.trim()).filter(Boolean);
}

/** Extract the top-level prop keys from an object-literal text (incl. braces).
 *  Returns {keys: Set<string>, dynamic: boolean}. `dynamic` is true when a
 *  spread or computed key was encountered — those props can't be resolved
 *  statically and are omitted (safe under the subset policy). */
function extractKeys(objText) {
  const body = objText.slice(1, -1); // strip outer { }
  const keys = new Set();
  let dynamic = false;
  for (const seg of splitTopLevel(body)) {
    if (seg.startsWith('...')) {
      dynamic = true; // spread — can't resolve keys statically
      continue;
    }
    if (seg.startsWith('[')) {
      dynamic = true; // computed key
      continue;
    }
    let key = null;
    if (seg[0] === "'" || seg[0] === '"') {
      key = readStringLiteral(seg, 0).value;
    } else {
      // identifier up to ':' or end (shorthand)
      const m = /^([A-Za-z_$][\w$]*)/.exec(seg);
      if (m) key = m[1];
    }
    if (key) keys.add(key);
    else dynamic = true;
  }
  return {keys, dynamic};
}

/** Parse all themeProps() call sites in a source string. Returns
 *  [{name, className, keys: Set, dynamic: boolean}]. */
function parseThemeProps(source) {
  const results = [];
  const re = /\bthemeProps\s*\(/g;
  let m;
  while ((m = re.exec(source))) {
    let i = skipWs(source, m.index + m[0].length);
    const first = source[i];
    if (first !== "'" && first !== '"' && first !== '`') {
      continue; // non-literal name — skip
    }
    const {value: name, end} = readStringLiteral(source, i);
    if (name == null) continue;
    i = skipWs(source, end);
    if (source[i] === ')') {
      results.push({name, className: `${NAMESPACE}-${name}`, keys: new Set(), dynamic: false});
      continue;
    }
    if (source[i] !== ',') continue;
    i = skipWs(source, i + 1);
    if (source[i] === ')') {
      results.push({name, className: `${NAMESPACE}-${name}`, keys: new Set(), dynamic: false});
      continue;
    }
    if (source[i] !== '{') {
      // non-object second arg (variable/spread) — flag dynamic, no keys
      results.push({name, className: `${NAMESPACE}-${name}`, keys: new Set(), dynamic: true});
      continue;
    }
    const {text} = readBalancedObject(source, i);
    const {keys, dynamic} = extractKeys(text);
    results.push({name, className: `${NAMESPACE}-${name}`, keys, dynamic});
  }
  return results;
}

// ---------------------------------------------------------------------------
// Doc parsing — collect documented theming.targets, keyed by export
// ---------------------------------------------------------------------------

/** Import a *.doc.mjs and collect, per EXPORT that carries a theming.targets
 *  block (docs, docsZh, …), a Map of className -> Set of documented props
 *  (visualProps ∪ states). Keeping exports separate lets us both union them
 *  for the source diff and compare docs vs docsZh for language lockstep. */
async function collectDocTargetsByExport(docFile) {
  const mod = await import(pathToFileURL(docFile).href);
  const byExport = new Map(); // exportName -> Map<className, Set<prop>>
  for (const [name, value] of Object.entries(mod)) {
    const targets = value?.theming?.targets;
    if (!Array.isArray(targets)) continue;
    const byClass = new Map();
    for (const t of targets) {
      if (!t?.className) continue;
      const set = byClass.get(t.className) ?? new Set();
      for (const p of t.visualProps ?? []) set.add(p);
      for (const s of t.states ?? []) set.add(s);
      byClass.set(t.className, set);
    }
    byExport.set(name, byClass);
  }
  return byExport;
}

/** Compare a doc file's primary `docs` theming block against its translated
 *  `docsZh` block and push an error for every class or prop that appears in one
 *  but not the other. No-op unless both blocks exist. */
function lockstepErrors(docFileRel, enDocs, zhDocs, errors) {
  if (!enDocs || !zhDocs) return;
  const quote = keys => [...keys].map(k => `'${k}'`).join(', ');
  for (const className of enDocs.keys()) {
    if (!zhDocs.has(className)) {
      errors.push(
        `${docFileRel}: theming target "${className}" is documented in docs but ` +
          `missing from docsZh — keep both language blocks in lockstep.`,
      );
      continue;
    }
    const en = enDocs.get(className);
    const zh = zhDocs.get(className);
    const missingZh = [...en].filter(p => !zh.has(p));
    const missingEn = [...zh].filter(p => !en.has(p));
    if (missingZh.length) {
      errors.push(
        `${docFileRel}: "${className}" documents ${quote(missingZh)} in docs but ` +
          `not docsZh — keep both language blocks in lockstep.`,
      );
    }
    if (missingEn.length) {
      errors.push(
        `${docFileRel}: "${className}" documents ${quote(missingEn)} in docsZh but ` +
          `not docs — keep both language blocks in lockstep.`,
      );
    }
  }
  for (const className of zhDocs.keys()) {
    if (!enDocs.has(className)) {
      errors.push(
        `${docFileRel}: theming target "${className}" is documented in docsZh but ` +
          `missing from docs — keep both language blocks in lockstep.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** The top-level component folder a file belongs to, e.g.
 *  packages/core/src/Table/TableBody.tsx -> "Table". The spec scopes the diff
 *  "per component", and a component (Table, Chat, …) can span many source and
 *  doc files under one folder, so we group by that folder. */
function componentOf(file) {
  return path.relative(CORE_SRC, file).split(path.sep)[0];
}

async function main() {
  const errors = [];
  const warnings = [];

  // Group doc and source files by their component folder.
  const byComponent = new Map(); // component -> {docFiles: [], srcFiles: []}
  const bucket = name => {
    let b = byComponent.get(name);
    if (!b) byComponent.set(name, (b = {docFiles: [], srcFiles: []}));
    return b;
  };
  for (const docFile of walk(CORE_SRC, isDoc)) {
    bucket(componentOf(docFile)).docFiles.push(docFile);
  }
  for (const srcFile of walk(CORE_SRC, isComponentSource)) {
    bucket(componentOf(srcFile)).srcFiles.push(srcFile);
  }

  let callSites = 0;
  let dynamicCalls = 0;
  let documentedClasses = 0;

  // Diff each component in isolation: source themeProps() call sites vs the
  // theming.targets documented by that same component's *.doc.mjs file(s).
  for (const [, {docFiles, srcFiles}] of byComponent) {
    // 1. Documented targets for this component: className -> {props, files}
    const documented = new Map();
    for (const docFile of docFiles) {
      let byExport;
      try {
        byExport = await collectDocTargetsByExport(docFile);
      } catch (err) {
        errors.push(`Failed to import ${rel(docFile)}: ${err.message}`);
        continue;
      }
      // Union every export's targets — the source diff treats a class as
      // documented if any theming block in the file lists it.
      for (const byClass of byExport.values()) {
        for (const [className, props] of byClass) {
          const entry = documented.get(className) ?? {props: new Set(), files: new Set()};
          for (const p of props) entry.props.add(p);
          entry.files.add(rel(docFile));
          documented.set(className, entry);
        }
      }
      // Language lockstep: the translated docsZh theming block must mirror the
      // primary docs block, so a sweep that updates one can't silently skip the
      // other. Only compare when both blocks exist.
      lockstepErrors(rel(docFile), byExport.get('docs'), byExport.get('docsZh'), errors);
    }
    documentedClasses += documented.size;

    // 2. Source call sites, checked against this component's documented surface.
    for (const srcFile of srcFiles) {
      const source = fs.readFileSync(srcFile, 'utf8');
      if (!source.includes('themeProps')) continue;
      for (const call of parseThemeProps(source)) {
        callSites++;
        if (call.dynamic) dynamicCalls++;

        const doc = documented.get(call.className);
        if (!doc) {
          errors.push(
            `${rel(srcFile)}: themeProps('${call.name}') renders "${call.className}" ` +
              `but no theming.target documents it. Add ` +
              `{className: '${call.className}'${call.keys.size ? `, visualProps: [${[...call.keys].map(k => `'${k}'`).join(', ')}]` : ''}} ` +
              `to the component's *.doc.mjs theming.targets.`,
          );
          continue;
        }
        const missing = [...call.keys].filter(k => !doc.props.has(k));
        if (missing.length) {
          errors.push(
            `${rel(srcFile)}: themeProps('${call.name}', {…}) passes ` +
              `${missing.map(k => `'${k}'`).join(', ')} not documented on "${call.className}" ` +
              `(documented in ${[...doc.files].join(', ')}). ` +
              `Add ${missing.map(k => `'${k}'`).join(', ')} to visualProps or states.`,
          );
        }
      }
    }
  }

  // Report
  if (warnings.length) {
    for (const w of warnings) console.warn(`⚠ ${w}`);
  }
  if (errors.length) {
    console.error(
      `\n✗ theming.targets out of sync with themeProps() (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n`,
    );
    for (const e of errors) console.error(`  • ${e}`);
    console.error(
      `\nEach component's theming.targets must document every themeProps() ` +
        `selector surface. Fix the *.doc.mjs files above, then re-run:\n` +
        `  node scripts/check-theming-targets.mjs\n`,
    );
    process.exit(1);
  }

  console.log(
    `✓ theming.targets in sync with themeProps() ` +
      `(${callSites} call sites across ${documentedClasses} documented classes` +
      `${dynamicCalls ? `, ${dynamicCalls} with dynamic props partially checked` : ''}).`,
  );
}

function rel(p) {
  return path.relative(path.resolve(__dirname, '..'), p);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

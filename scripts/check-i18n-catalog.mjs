#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * CI gate for the i18n catalog — `node scripts/check-i18n-catalog.mjs`.
 *
 * `resolve.ts` falls through to rendering the raw key string when a key is
 * missing from every catalog, guarded only by a dev-time `warnOnce`. That is a
 * browser warning, not a gate, so a typo or a stale key ships. This asserts:
 *
 *   1. Source ⊆ catalog. Every `@astryx.*` key referenced in packages/core/src
 *      and packages/lab/src exists in en.json.
 *   2. Locale parity. Every shipped locale file has en.json's key set — extra
 *      keys fail (see LOCALE_MISSING_KEYS_ARE_FATAL for the missing direction).
 *   3. Every en.json entry carries a non-empty `description` — the only
 *      context a Crowdin translator gets.
 *   4. Every message parses as ICU, and every plural branch it declares is a
 *      category the locale can actually select.
 *
 * Deliberately NOT checked: catalog keys with no call site. A shipped key is
 * public surface (consumers override any key through `overrides`), so an
 * "unused" key is legitimate and pruning one is a breaking change. Do not add
 * that check. Placeholder parity between a translation and its en source is
 * also not checked yet — a separate comparison, worth its own change.
 *
 * Key references come from the TypeScript AST, reusing the call-site
 * definition in internal/eslint-plugin-astryx/i18n-key-format.js — a `t()` /
 * `translator()` / `translate()` call, or an `i18nKey:` property — so this
 * gate and that lint rule cannot disagree about what a key reference is. A
 * reference whose key is not statically knowable is reported as unverifiable
 * rather than passed or failed silently.
 *
 * Plural categories come from `Intl.PluralRules` at check time, never from a
 * table in this file: CLDR retires categories (Hebrew's `many` is gone from
 * current data), and a hardcoded set would then fail correct catalogs. It also
 * means the check inherits the ICU data of whatever Node runs it.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {parse, TYPE} from '@formatjs/icu-messageformat-parser';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIRS = ['packages/core/src', 'packages/lab/src'];
const LOCALES_DIR = 'packages/core/locales';

/**
 * Whether a locale missing a key that en.json has is an error.
 *
 * False, because a partial locale is the intended steady state, not a defect:
 * crowdin.yml sets `skip_untranslated_strings: true`, so Crowdin strips
 * untranslated keys out of every download, and `resolve.ts` falls back to en
 * for them without warning. Making this fatal would fail `main` today (fr-FR
 * carries 3 of 251 keys) and would red every translations PR. The other
 * direction — a key a locale has and en does not — is always an error: en is
 * the source of truth, so an extra key is stale and will never be read.
 */
const LOCALE_MISSING_KEYS_ARE_FATAL = false;

/** en.json is the source; pseudo.json is generated and gitignored. Same
 * exclusions the crowdin-download workflow applies to this directory. */
const NOT_A_SHIPPED_LOCALE = new Set(['en.json', 'pseudo.json']);

/** Translator call targets, per the i18n-key-format lint rule. */
const TRANSLATOR_CALL_NAMES = new Set(['t', 'translator', 'translate']);

const KEY_PREFIX = '@astryx.';

/** Mirrors scripts/check-use-client.mjs — source files only, no tests,
 * stories, docs, or perf fixtures (those legitimately name absent keys). */
function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (
      /\.[jt]sx?$/.test(entry.name) &&
      !entry.name.includes('.test.') &&
      !entry.name.includes('.stories.') &&
      !entry.name.includes('.doc.') &&
      !entry.name.includes('.perf.') &&
      !entry.name.endsWith('.d.ts')
    ) {
      results.push(full);
    }
  }
  return results;
}

function unwrap(node) {
  while (
    node &&
    (ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isTypeAssertionExpression(node) ||
      ts.isNonNullExpression(node))
  ) {
    node = node.expression;
  }
  return node;
}

function literalText(node) {
  const n = unwrap(node);
  if (n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))) {
    return n.text;
  }
  return null;
}

/**
 * Module-level `const NAME = '<key>'` and `const NAME = {a: '<key>'}`, so a
 * call site that reads one is still checkable. Every value of an object is
 * collected: `MAP[expr]` can select any of them.
 */
function collectConstants(sourceFile) {
  const consts = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      const init = unwrap(decl.initializer);
      const direct = literalText(init);
      if (direct !== null) {
        consts.set(decl.name.text, [direct]);
      } else if (ts.isObjectLiteralExpression(init)) {
        const values = [];
        for (const prop of init.properties) {
          if (!ts.isPropertyAssignment(prop)) continue;
          const value = literalText(prop.initializer);
          if (value !== null) values.push(value);
        }
        if (values.length > 0) consts.set(decl.name.text, values);
      }
    }
  }
  return consts;
}

/** Resolve an expression to the key strings it can evaluate to, or null when
 * it is not statically knowable. */
function resolveKeys(node, consts) {
  const n = unwrap(node);
  if (!n) return null;

  const direct = literalText(n);
  if (direct !== null) return [direct];

  if (ts.isConditionalExpression(n)) {
    const whenTrue = resolveKeys(n.whenTrue, consts);
    const whenFalse = resolveKeys(n.whenFalse, consts);
    return whenTrue && whenFalse ? [...whenTrue, ...whenFalse] : null;
  }
  if (ts.isIdentifier(n)) {
    return consts.get(n.text) ?? null;
  }
  // MAP[expr] — any value of MAP may be selected, so check them all.
  if (ts.isElementAccessExpression(n)) {
    const object = unwrap(n.expression);
    if (object && ts.isIdentifier(object))
      return consts.get(object.text) ?? null;
  }
  return null;
}

function isTranslatorCall(node) {
  const callee = node.expression;
  if (ts.isIdentifier(callee)) return TRANSLATOR_CALL_NAMES.has(callee.text);
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.name)) {
    return TRANSLATOR_CALL_NAMES.has(callee.name.text);
  }
  return false;
}

function propertyName(node) {
  if (ts.isIdentifier(node.name)) return node.name.text;
  if (ts.isStringLiteral(node.name)) return node.name.text;
  return null;
}

/**
 * Extract every astryx catalog-key reference from one source file.
 * Pure — takes the text, so it is unit-testable without the filesystem.
 *
 * @param {string} source     file contents
 * @param {string} fileName   display name (drives .tsx parsing)
 * @returns {{refs: {line: number, key: string}[],
 *            unresolved: {line: number, expr: string}[]}}
 */
function extractKeyRefs(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') || fileName.endsWith('.jsx')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS,
  );
  const consts = collectConstants(sourceFile);
  const refs = [];
  const unresolved = [];

  const lineOf = node =>
    sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line +
    1;

  const record = (expression, node) => {
    const keys = resolveKeys(expression, consts);
    if (keys === null) {
      unresolved.push({
        line: lineOf(node),
        expr: expression.getText(sourceFile).replace(/\s+/g, ' ').slice(0, 80),
      });
      return;
    }
    // Non-astryx namespaces belong to their owners, per the lint rule.
    for (const key of keys) {
      if (key.startsWith(KEY_PREFIX)) refs.push({line: lineOf(node), key});
    }
  };

  const visit = node => {
    if (ts.isCallExpression(node) && isTranslatorCall(node)) {
      const arg = node.arguments[0];
      if (arg) record(arg, arg);
    }
    if (ts.isPropertyAssignment(node) && propertyName(node) === 'i18nKey') {
      record(node.initializer, node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  return {refs, unresolved};
}

/**
 * Validate the shape of the source catalog: every entry needs a usable
 * `defaultMessage` and a non-empty `description`.
 *
 * @param {object} catalog  parsed en.json
 * @returns {string[]}      human-readable problems (empty = valid)
 */
function validateSourceCatalog(catalog) {
  const problems = [];
  for (const [key, entry] of Object.entries(catalog)) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      problems.push(`${key}: entry is not an object`);
      continue;
    }
    if (
      typeof entry.defaultMessage !== 'string' ||
      entry.defaultMessage === ''
    ) {
      problems.push(`${key}: missing or empty "defaultMessage"`);
    }
    if (
      typeof entry.description !== 'string' ||
      entry.description.trim() === ''
    ) {
      problems.push(`${key}: missing or empty "description"`);
    }
  }
  return problems;
}

/**
 * Compare one locale's key set against en's.
 *
 * @returns {{missing: string[], extra: string[]}}
 */
function compareLocale(enKeys, localeKeys) {
  const locale = new Set(localeKeys);
  return {
    missing: [...enKeys].filter(k => !locale.has(k)),
    extra: [...locale].filter(k => !enKeys.has(k)),
  };
}

/**
 * The plural categories a locale can actually select, cardinal and ordinal,
 * as `Intl` sees them — the same data `intl-messageformat` selects with at
 * runtime.
 *
 * Returns null when ICU has no data for the tag, which it answers by silently
 * resolving to the default locale: `he-IL` resolves to `he`, but `xx-YY`
 * resolves to `en-US` and would report every non-English category as dead.
 * Comparing the language subtag catches that; the caller skips the locale
 * rather than reporting against English rules.
 *
 * @param {string} tag  BCP-47 tag, from the locale filename
 * @returns {{cardinal: Set<string>, ordinal: Set<string>} | null}
 */
function pluralCategoriesFor(tag) {
  try {
    const cardinal = new Intl.PluralRules(tag);
    const ordinal = new Intl.PluralRules(tag, {type: 'ordinal'});
    const resolved = cardinal.resolvedOptions().locale;
    if (new Intl.Locale(tag).language !== new Intl.Locale(resolved).language) {
      return null;
    }
    return {
      cardinal: new Set(cardinal.resolvedOptions().pluralCategories),
      ordinal: new Set(ordinal.resolvedOptions().pluralCategories),
    };
  } catch {
    // Malformed tag — not a locale question, and the filename is ours to fix.
    return null;
  }
}

/** Every plural/selectordinal node in a parsed message, including those nested
 * inside another plural's branches, a `select`, or a rich-text tag. */
function forEachPluralNode(nodes, visit) {
  for (const node of nodes) {
    if (node.type === TYPE.plural) visit(node);
    if (node.options) {
      for (const option of Object.values(node.options)) {
        forEachPluralNode(option.value, visit);
      }
    }
    if (node.children) forEachPluralNode(node.children, visit);
  }
}

/**
 * Parse every message in one catalog and check its plural branches against the
 * locale's own categories.
 *
 * A branch outside the category set is unreachable: `intl-messageformat` asks
 * `Intl.PluralRules` which category a number is and falls back to `other` when
 * the message has no branch for it, so the dead branch's wording never renders
 * and the count silently reads as `other`. The parser itself rejects a plural
 * with no `other`, so that arrives here as a parse error.
 *
 * The parser is the reason this is not a regex: `{g, select, many {…}}` is not
 * a plural, `selectordinal` is scored against the ordinal categories (Hebrew
 * has one cardinal set and a single-category ordinal one), `=0` is an exact
 * match rather than a category, and quoted braces are not syntax at all.
 *
 * @param {object} catalog  parsed locale JSON
 * @param {string} tag      BCP-47 tag for that catalog
 * @returns {{parseErrors: string[], deadBranches: string[],
 *            unsupportedLocale: boolean}}
 */
function auditPluralCategories(catalog, tag) {
  const categories = pluralCategoriesFor(tag);
  if (categories === null) {
    return {parseErrors: [], deadBranches: [], unsupportedLocale: true};
  }

  const parseErrors = [];
  const deadBranches = [];

  for (const [key, entry] of Object.entries(catalog)) {
    const message =
      entry !== null && typeof entry === 'object'
        ? entry.defaultMessage
        : entry;
    // Entry shape is validateSourceCatalog's to report; skip, don't double-report.
    if (typeof message !== 'string') continue;

    let ast;
    try {
      ast = parse(message);
    } catch (error) {
      parseErrors.push(`${key}: ${String(error.message).split('\n')[0]}`);
      continue;
    }

    forEachPluralNode(ast, node => {
      const valid =
        node.pluralType === 'ordinal'
          ? categories.ordinal
          : categories.cardinal;
      for (const branch of Object.keys(node.options)) {
        // `=0` / `=1` match an exact value, not a category — always reachable.
        if (branch.startsWith('=')) continue;
        if (!valid.has(branch)) {
          deadBranches.push(
            `${key}: "${branch}" is not a ${node.pluralType} category of ${tag} ` +
              `(${[...valid].join(', ')})`,
          );
        }
      }
    });
  }

  return {parseErrors, deadBranches, unsupportedLocale: false};
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const errors = [];
  const notes = [];

  // 1. Source ⊆ catalog
  const catalog = readJson(path.join(ROOT, LOCALES_DIR, 'en.json'));
  const enKeys = new Set(Object.keys(catalog));
  const missingRefs = [];
  const unverifiable = [];
  let refCount = 0;
  const seen = new Set();

  for (const dir of SRC_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const rel = path.relative(ROOT, file);
      const {refs, unresolved} = extractKeyRefs(
        fs.readFileSync(file, 'utf8'),
        file,
      );
      refCount += refs.length;
      for (const {line, key} of refs) {
        seen.add(key);
        if (!enKeys.has(key)) missingRefs.push(`${rel}:${line}  ${key}`);
      }
      for (const {line, expr} of unresolved) {
        unverifiable.push(`${rel}:${line}  ${expr}`);
      }
    }
  }

  if (missingRefs.length > 0) {
    errors.push({
      title: `${missingRefs.length} key reference(s) not in en.json`,
      lines: missingRefs,
      hint: 'Add the key to packages/core/locales/en.json, or fix the typo at the call site.',
    });
  }

  // 2. Locale parity + 4. ICU plural categories
  const localeFiles = fs
    .readdirSync(path.join(ROOT, LOCALES_DIR))
    .filter(f => f.endsWith('.json') && !NOT_A_SHIPPED_LOCALE.has(f))
    .sort();

  const skippedLocales = [];

  for (const file of localeFiles) {
    const localeCatalog = readJson(path.join(ROOT, LOCALES_DIR, file));
    const {missing, extra} = compareLocale(enKeys, Object.keys(localeCatalog));
    if (extra.length > 0) {
      errors.push({
        title: `${file}: ${extra.length} key(s) not in en.json`,
        lines: extra,
        hint: 'en.json is the source of truth — these are stale and will never be read. Remove them, or restore the key in en.json.',
      });
    }
    if (missing.length > 0) {
      const summary = `${file}: ${missing.length}/${enKeys.size} key(s) untranslated (falls back to en)`;
      if (LOCALE_MISSING_KEYS_ARE_FATAL) {
        errors.push({title: summary, lines: missing, hint: ''});
      } else {
        notes.push(summary);
      }
    }

    const {parseErrors, deadBranches, unsupportedLocale} =
      auditPluralCategories(localeCatalog, path.basename(file, '.json'));
    if (unsupportedLocale) {
      skippedLocales.push(file);
    }
    if (parseErrors.length > 0) {
      errors.push({
        title: `${file}: ${parseErrors.length} message(s) are not valid ICU`,
        lines: parseErrors,
        hint: 'These throw when formatted. Fix the string in Crowdin so the next download carries the correction.',
      });
    }
    // A dead branch in a translation is Crowdin's content, and it degrades to
    // `other` rather than breaking — a note, on the same reasoning as
    // LOCALE_MISSING_KEYS_ARE_FATAL. In en.json it is an error; see below.
    for (const line of deadBranches) {
      notes.push(`${file}: unreachable plural branch — ${line}`);
    }
  }

  // 3. Translator context
  const catalogProblems = validateSourceCatalog(catalog);
  if (catalogProblems.length > 0) {
    errors.push({
      title: `${catalogProblems.length} en.json entry problem(s)`,
      lines: catalogProblems,
      hint: 'A description is the only context a Crowdin translator gets.',
    });
  }

  // 4. The source catalog's own ICU. Authored here, so both findings are fatal:
  // a dead branch in en.json is wording a reader will never see, and it is also
  // what every translation is modelled on.
  const en = auditPluralCategories(catalog, 'en');
  if (en.parseErrors.length > 0) {
    errors.push({
      title: `en.json: ${en.parseErrors.length} message(s) are not valid ICU`,
      lines: en.parseErrors,
      hint: 'These throw when formatted.',
    });
  }
  if (en.deadBranches.length > 0) {
    errors.push({
      title: `en.json: ${en.deadBranches.length} unreachable plural branch(es)`,
      lines: en.deadBranches,
      hint: 'Intl.PluralRules never selects this category for the locale, so the branch is dead and the count renders as `other`.',
    });
  }

  if (skippedLocales.length > 0) {
    notes.push(
      `plural categories unchecked for ${skippedLocales.join(', ')} — this Node's ICU has no data for the tag`,
    );
  }

  if (unverifiable.length > 0) {
    notes.push(
      `${unverifiable.length} key reference(s) unverifiable (key not statically knowable):\n` +
        unverifiable.map(l => `      ${l}`).join('\n'),
    );
  }

  if (errors.length > 0) {
    const count = errors.reduce((n, e) => n + e.lines.length, 0);
    console.error(`\n✗ check:i18n-catalog found ${count} problem(s):\n`);
    for (const {title, lines, hint} of errors) {
      console.error(`  ${title}:`);
      for (const line of lines) console.error(`    ${line}`);
      if (hint) console.error(`    → ${hint}`);
      console.error('');
    }
    process.exit(1);
  }

  console.log(
    `✓ check:i18n-catalog — ${seen.size} key(s) over ${refCount} reference(s) resolve; ` +
      `${enKeys.size} en entries described; ${localeFiles.length} locale(s) consistent; ` +
      `ICU plurals checked against CLDR ${process.versions.cldr}`,
  );
  for (const note of notes) console.log(`  · ${note}`);
}

// Run as a script, but stay importable for unit tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export {
  extractKeyRefs,
  validateSourceCatalog,
  compareLocale,
  auditPluralCategories,
};

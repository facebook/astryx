// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file typeDefinitions.mjs
 *
 * Build-time extraction of exported TypeScript type declarations.
 *
 * Component `.doc.mjs` prop tables document types as plain strings (e.g.
 * `SearchSource<T>`), which leaves readers no way to inspect what a
 * non-primitive type actually contains (issue #2682). This module scans a
 * package's `src/` for `export interface` / `export type` declarations and
 * extracts their source text, so the data generator can attach the resolved
 * shape of every referenced type to the component registry and the props
 * table can surface it.
 *
 * The parser is intentionally lexical (brace/angle matching that skips
 * strings and comments) rather than a full TypeScript AST: it runs against
 * both the live workspace and published-release snapshots without adding a
 * compiler dependency to the data pipeline, matching the regex-based
 * extraction style of scripts/generate-data.mjs.
 *
 * @input  TypeScript source files under a package's src/ directory
 * @output Map of exported type name → {name, definition, sourcePath}
 * @position Imported by scripts/generate-data.mjs and
 *   src/__tests__/type-definitions.test.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const EXPORTED_DECL_RE = /^export (?:declare )?(interface|type) ([A-Za-z_$][\w$]*)/gm;

/**
 * Advance past a string literal starting at `i` (the opening quote).
 * Returns the index just past the closing quote.
 */
function skipString(source, i) {
  const quote = source[i];
  i++;
  while (i < source.length) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source[i] === quote) {
      return i + 1;
    }
    i++;
  }
  return i;
}

/**
 * Advance past a `//` or `/*` comment starting at `i`.
 * Returns the index just past the comment, or `source.length` if unterminated.
 */
function skipComment(source, i) {
  if (source[i + 1] === '/') {
    const end = source.indexOf('\n', i + 2);
    return end === -1 ? source.length : end + 1;
  }
  const end = source.indexOf('*/', i + 2);
  return end === -1 ? source.length : end + 2;
}

/**
 * Find the end (exclusive) of an `interface` body: scans from `from` to the
 * body's opening `{` (skipping any braces inside generic parameter defaults),
 * then to its matching `}`. Strings and comments are skipped so JSDoc braces
 * inside the body don't unbalance the count. Returns null when unterminated.
 */
function findInterfaceEnd(source, from) {
  let angleDepth = 0;
  let braceDepth = 0;
  let inBody = false;
  let i = from;
  while (i < source.length) {
    const c = source[i];
    if (c === "'" || c === '"' || c === '`') {
      i = skipString(source, i);
      continue;
    }
    if (c === '/' && (source[i + 1] === '/' || source[i + 1] === '*')) {
      i = skipComment(source, i);
      continue;
    }
    if (!inBody) {
      if (c === '<') angleDepth++;
      else if (c === '>' && source[i - 1] !== '=') angleDepth--;
      else if (c === '{' && angleDepth === 0) inBody = true;
      if (inBody) braceDepth = 1;
    } else if (c === '{') {
      braceDepth++;
    } else if (c === '}') {
      braceDepth--;
      if (braceDepth === 0) {
        return i + 1;
      }
    }
    i++;
  }
  return null;
}

/**
 * Find the end (exclusive) of a `type` alias: the first `;` at bracket depth
 * zero. `=>` is treated as a unit so arrow return types don't unbalance the
 * angle-bracket count. Returns null when unterminated.
 */
function findTypeAliasEnd(source, from) {
  let depth = 0;
  let i = from;
  while (i < source.length) {
    const c = source[i];
    if (c === "'" || c === '"' || c === '`') {
      i = skipString(source, i);
      continue;
    }
    if (c === '/' && (source[i + 1] === '/' || source[i + 1] === '*')) {
      i = skipComment(source, i);
      continue;
    }
    if (c === '{' || c === '(' || c === '[' || c === '<') {
      depth++;
    } else if (c === '}' || c === ')' || c === ']') {
      depth--;
    } else if (c === '>' && source[i - 1] !== '=') {
      depth--;
    } else if (c === ';' && depth === 0) {
      return i + 1;
    }
    i++;
  }
  return null;
}

/**
 * Extract every exported `interface` / `type` declaration from a TypeScript
 * source string. The declaration text starts at `export` (leading JSDoc is
 * excluded — field-level comments inside interface bodies are kept, which is
 * where the useful documentation lives) and includes the full body.
 *
 * @param {string} source TypeScript source text
 * @returns {Array<{name: string, kind: 'interface' | 'type', definition: string}>}
 */
export function extractTypeDeclarations(source) {
  const declarations = [];
  EXPORTED_DECL_RE.lastIndex = 0;
  let m;
  while ((m = EXPORTED_DECL_RE.exec(source)) !== null) {
    const kind = m[1];
    const end =
      kind === 'interface'
        ? findInterfaceEnd(source, EXPORTED_DECL_RE.lastIndex)
        : findTypeAliasEnd(source, EXPORTED_DECL_RE.lastIndex);
    if (end == null) continue;
    declarations.push({
      name: m[2],
      kind,
      definition: source.slice(m.index, end).trim(),
    });
  }
  return declarations;
}

function findSourceFilesRecursive(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      results.push(...findSourceFilesRecursive(full));
    } else if (
      /\.tsx?$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts') &&
      !/\.test\.tsx?$/.test(entry.name)
    ) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Build an index of every exported type declaration in a package's src/
 * directory. Files are visited in sorted order and the first declaration of
 * a name wins, so the output is deterministic.
 *
 * @param {string} srcDir Absolute path to the package's src/ directory
 * @param {string} srcDirLabel Repo-relative label for srcDir, used as the
 *   sourcePath prefix (e.g. `packages/core/src`)
 * @returns {Map<string, {name: string, definition: string, sourcePath: string}>}
 */
export function buildTypeDefinitionIndex(srcDir, srcDirLabel) {
  const index = new Map();
  const files = findSourceFilesRecursive(srcDir).sort();
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf-8');
    for (const decl of extractTypeDeclarations(source)) {
      if (index.has(decl.name)) continue;
      // Aliases like `export type StyleXStyles = any;` are compat shims with
      // no shape to surface — inspecting them would only show `any`.
      if (/=\s*(?:any|unknown)\s*;$/.test(decl.definition)) continue;
      index.set(decl.name, {
        name: decl.name,
        definition: decl.definition,
        sourcePath: path.posix.join(
          srcDirLabel.split(path.sep).join('/'),
          path.relative(srcDir, file).split(path.sep).join('/'),
        ),
      });
    }
  }
  return index;
}

/**
 * Resolve the named types a documented prop type string references against
 * an index built by {@link buildTypeDefinitionIndex}. `*Props` interfaces
 * are excluded — component prop surfaces are documented by their own pages,
 * not inlined into another component's props table.
 *
 * @param {string} typeStr Documented prop type, e.g. `SearchSource<T>`
 * @param {Map<string, {name: string, definition: string, sourcePath: string}>} index
 * @returns {string[]} Referenced type names present in the index
 */
export function collectPropTypeRefs(typeStr, index) {
  const refs = [];
  for (const m of typeStr.matchAll(/\b[A-Z][\w$]*\b/g)) {
    const name = m[0];
    if (name.endsWith('Props')) continue;
    if (!index.has(name)) continue;
    if (!refs.includes(name)) refs.push(name);
  }
  return refs;
}

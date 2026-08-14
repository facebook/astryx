// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stylex-style-source.js
 * @description Reads the CSS property names behind a `stylex.create()` style
 * key, including when the style object lives in another module.
 *
 * Rules that reason about *what* a style does (rather than where it is used)
 * need the property names, and Astryx components routinely import their styles
 * from a shared module (`../utils` → `rtlStyles`, `./shared` → `styles`). ESLint
 * only ever hands a rule one file, so this module does the cross-file lookup
 * itself: a text scan for `const <name> = stylex.create({...})`, brace-balanced
 * so nested conditional values and dynamic (arrow-function) styles come out
 * right. Barrel re-exports (`export {rtlStyles} from './rtlStyles'`) are
 * followed.
 *
 * It is deliberately a scanner, not a parser: no second toolchain in the lint
 * path, and an unparseable file simply resolves to `null` (unknown), which
 * callers must handle.
 */

import {existsSync, readFileSync, statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
const MAX_REEXPORT_DEPTH = 4;

/** path → Map<exportName, Map<styleKey, string[]>> | null */
const moduleCache = new Map();

/**
 * Index of the character after the object literal that starts at `start`
 * (which must be the opening brace), skipping strings, template literals and
 * comments. Returns -1 when the braces never balance.
 */
function endOfObject(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (char === '/' && text[i + 1] === '/') {
      i = text.indexOf('\n', i);
      if (i === -1) return -1;
      continue;
    }
    if (char === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      if (i === -1) return -1;
      i++;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      const quote = char;
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++;
        i++;
      }
      continue;
    }
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return i + 1;
      }
    }
  }
  return -1;
}

/**
 * Top-level `key: value` pairs of the object literal `text` (braces included),
 * as `[keyText, valueText]`. Spread elements are skipped.
 */
function topLevelEntries(text) {
  const entries = [];
  let depth = 0;
  let keyStart = -1;
  let key = null;
  let valueStart = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '/' && text[i + 1] === '/') {
      i = text.indexOf('\n', i);
      if (i === -1) break;
      continue;
    }
    if (char === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      if (i === -1) break;
      i++;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      const quote = char;
      const start = i;
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++;
        i++;
      }
      if (depth === 1 && key === null && keyStart === -1) {
        keyStart = start;
      }
      continue;
    }

    if (char === '{' || char === '[' || char === '(') {
      depth++;
      if (depth === 1) {
        keyStart = -1;
        key = null;
      }
      continue;
    }
    if (char === '}' || char === ']' || char === ')') {
      if (depth === 1 && key !== null && valueStart !== -1) {
        entries.push([key, text.slice(valueStart, i).trim()]);
        key = null;
        valueStart = -1;
      }
      depth--;
      continue;
    }

    if (depth !== 1) {
      continue;
    }

    if (char === ':' && key === null && keyStart !== -1) {
      key = text
        .slice(keyStart, i)
        .trim()
        .replace(/^['"`]|['"`]$/g, '');
      valueStart = i + 1;
      keyStart = -1;
      continue;
    }
    if (char === ',' && key !== null) {
      entries.push([key, text.slice(valueStart, i).trim()]);
      key = null;
      valueStart = -1;
      keyStart = -1;
      continue;
    }
    if (key === null && keyStart === -1 && !/[\s,]/.test(char)) {
      keyStart = i;
    }
  }

  return entries;
}

/**
 * CSS property names a style-key object applies. Conditional groups keyed by a
 * pseudo-selector or at-rule (`:hover`, `@media …`) contribute the properties
 * nested inside them.
 */
function propertiesOf(objectText) {
  const properties = [];
  for (const [key, value] of topLevelEntries(objectText)) {
    if ((key.startsWith(':') || key.startsWith('@')) && value.startsWith('{')) {
      properties.push(...propertiesOf(value));
      continue;
    }
    properties.push(key);
  }
  return properties;
}

/** The object literal a style key maps to, unwrapping a dynamic style function. */
function styleObjectText(valueText) {
  if (valueText.startsWith('{')) {
    return valueText;
  }
  // Dynamic style: `(size) => ({...})`
  const arrow = valueText.indexOf('=>');
  if (arrow !== -1) {
    const body = valueText.slice(arrow + 2).trim();
    const inner = body.startsWith('(') ? body.slice(1).trim() : body;
    if (inner.startsWith('{')) {
      return inner;
    }
  }
  return null;
}

/**
 * Every `stylex.create()` binding in a source text.
 *
 * @param {string} text Module source.
 * @returns {Map<string, Map<string, string[]>>} binding name → style key → CSS
 *   property names.
 */
export function extractStylexStyleProperties(text) {
  const byBinding = new Map();
  const declaration = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*stylex\s*\.\s*create\s*\(/g;
  let match;

  while ((match = declaration.exec(text)) !== null) {
    const braceStart = text.indexOf('{', declaration.lastIndex - 1);
    if (braceStart === -1) continue;
    const braceEnd = endOfObject(text, braceStart);
    if (braceEnd === -1) continue;

    const byKey = new Map();
    for (const [key, value] of topLevelEntries(text.slice(braceStart, braceEnd))) {
      const objectText = styleObjectText(value);
      byKey.set(key, objectText == null ? [] : propertiesOf(objectText));
    }
    byBinding.set(match[1], byKey);
  }

  return byBinding;
}

function resolveModulePath(fromFile, source) {
  const base = resolve(dirname(fromFile), source);
  for (const candidate of [
    base,
    ...EXTENSIONS.map((extension) => base + extension),
    ...EXTENSIONS.map((extension) => resolve(base, `index${extension}`)),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function readModule(path) {
  if (moduleCache.has(path)) {
    return moduleCache.get(path);
  }
  let text = null;
  try {
    text = readFileSync(path, 'utf-8');
  } catch {
    moduleCache.set(path, null);
    return null;
  }
  const result = {text, bindings: extractStylexStyleProperties(text)};
  moduleCache.set(path, result);
  return result;
}

/** `export {a, b as c} from './x'` → the source for a given exported name. */
function findReExportSource(text, exportedName) {
  const reExport = /export\s*{([^}]*)}\s*from\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = reExport.exec(text)) !== null) {
    for (const clause of match[1].split(',')) {
      const [original, alias] = clause.split(/\s+as\s+/).map((s) => s.trim());
      const exposed = alias ?? original;
      if (exposed === exportedName) {
        return {source: match[2], name: original};
      }
    }
  }
  return null;
}

/**
 * CSS property names for `<exportName>.<styleKey>` in the module `source`
 * resolves to, relative to `fromFile`.
 *
 * @returns {string[] | null} `null` when the module, the binding, or the key
 *   cannot be resolved — the caller decides what an unknown style means.
 */
export function resolveImportedStyleProperties(
  fromFile,
  source,
  exportName,
  styleKey,
  depth = 0,
) {
  if (depth > MAX_REEXPORT_DEPTH || !source.startsWith('.') || !fromFile) {
    return null;
  }
  const path = resolveModulePath(fromFile, source);
  if (path == null) {
    return null;
  }
  const module = readModule(path);
  if (module == null) {
    return null;
  }

  const byKey = module.bindings.get(exportName);
  if (byKey != null) {
    return byKey.get(styleKey) ?? null;
  }

  const reExport = findReExportSource(module.text, exportName);
  if (reExport != null) {
    return resolveImportedStyleProperties(
      path,
      reExport.source,
      reExport.name,
      styleKey,
      depth + 1,
    );
  }
  return null;
}

/** Test seam: the module cache is process-wide and long-lived in an editor. */
export function clearStyleModuleCache() {
  moduleCache.clear();
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Which embedded files the page itself reaches, for `astryx
 * experimental render --reverse`. A received file is untrusted, so its list
 * of files is not: a file is written only when the embedded page reaches it
 * through its own imports (static, re-exports, `import()` and `require()` of
 * a string), followed module by module through the embedded tree. Relative
 * imports resolve inside the tree; an alias import resolves through the
 * receiving project's own `tsconfig.json` or `jsconfig.json` paths, never the
 * sender's.
 *
 * @position foundation/render — used by the render subject's adapter
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parse} from '@babel/parser';
import {PAGE_EXTENSIONS} from './embedded-files.mjs';

/** Extensions an extensionless import may stand for, in resolution order. */
const RESOLVE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];

/**
 * The string specifiers one module imports.
 * @param {string} source
 * @param {string} file for the parser's TypeScript/JSX choice
 * @returns {string[]}
 */
export function importSpecifiers(source, file) {
  /** @type {any} */
  let ast;
  try {
    ast = parse(source, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      errorRecovery: true,
      plugins: /\.(tsx?|mts|cts)$/.test(file) ? ['jsx', 'typescript'] : ['jsx'],
    });
  } catch {
    return [];
  }
  /** @type {string[]} */
  const out = [];
  /** @param {any} node */
  const visit = node => {
    if (!node || typeof node.type !== 'string') return;
    if (
      (node.type === 'ImportDeclaration' ||
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportAllDeclaration') &&
      node.source?.type === 'StringLiteral'
    ) {
      out.push(node.source.value);
    } else if (
      node.type === 'ImportExpression' &&
      node.source?.type === 'StringLiteral'
    ) {
      out.push(node.source.value);
    } else if (
      node.type === 'CallExpression' &&
      node.arguments?.[0]?.type === 'StringLiteral' &&
      (node.callee?.type === 'Import' ||
        (node.callee?.type === 'Identifier' && node.callee.name === 'require'))
    ) {
      out.push(node.arguments[0].value);
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end' || key === 'extra') continue;
      const value = node[key];
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object' && typeof value.type === 'string') visit(value);
    }
  };
  visit(ast.program);
  return out;
}

/**
 * Path aliases (`compilerOptions.paths`) of the project that holds `dir`, as
 * absolute prefixes: `"@/*": ["./src/*"]` becomes `["@/", "<root>/src/"]`.
 * @param {string} dir
 * @returns {[string, string][]}
 */
export function receivingAliases(dir) {
  let d = dir;
  while (!fs.existsSync(d) && path.dirname(d) !== d) d = path.dirname(d);
  for (;;) {
    for (const name of ['tsconfig.json', 'jsconfig.json']) {
      const file = path.join(d, name);
      if (!fs.existsSync(file)) continue;
      try {
        const text = fs
          .readFileSync(file, 'utf8')
          .replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (_, str) => str ?? '')
          .replace(/,(\s*[}\]])/g, '$1');
        const options = JSON.parse(text)?.compilerOptions ?? {};
        const base = path.resolve(d, typeof options.baseUrl === 'string' ? options.baseUrl : '.');
        /** @type {[string, string][]} */
        const out = [];
        for (const [key, targets] of Object.entries(options.paths ?? {})) {
          const target = Array.isArray(targets) ? targets[0] : undefined;
          if (typeof target !== 'string') continue;
          if (key.endsWith('/*') && target.endsWith('/*')) {
            out.push([key.slice(0, -1), `${path.resolve(base, target.slice(0, -2))}${path.sep}`]);
          } else if (!key.includes('*') && !target.includes('*')) {
            out.push([key, path.resolve(base, target)]);
          }
        }
        return out;
      } catch {
        return [];
      }
    }
    if (fs.existsSync(path.join(d, 'package.json'))) return [];
    const up = path.dirname(d);
    if (up === d) return [];
    d = up;
  }
}

/**
 * The embedded files the page reaches through its imports, page first.
 * @param {{path: string, base64: string}[]} files the embedded files, page first
 * @param {{root: string, aliases?: [string, string][]}} where `root`: where the
 *   tree's root lands on disk; `aliases`: the receiving project's path aliases
 * @returns {Set<string>} reachable tree paths
 */
export function reachableFiles(files, {root, aliases = []}) {
  const byPath = new Map(files.map(f => [f.path, f]));
  /** @type {Set<string>} */
  const reached = new Set();
  /** @param {string} candidate tree path, `/`-separated */
  const resolveIn = candidate => {
    if (byPath.has(candidate)) return candidate;
    for (const ext of RESOLVE_EXTENSIONS) if (byPath.has(candidate + ext)) return candidate + ext;
    for (const ext of RESOLVE_EXTENSIONS) if (byPath.has(`${candidate}/index${ext}`)) return `${candidate}/index${ext}`;
    return null;
  };
  /** @param {string} fromPath @param {string} spec */
  const resolveSpec = (fromPath, spec) => {
    const bare = spec.split('?')[0];
    if (bare.startsWith('./') || bare.startsWith('../')) {
      const joined = path.posix.normalize(path.posix.join(path.posix.dirname(fromPath), bare));
      return joined.startsWith('..') ? null : resolveIn(joined);
    }
    for (const [key, target] of aliases) {
      const hit = key.endsWith('/') ? bare.startsWith(key) : bare === key;
      if (!hit) continue;
      const abs = key.endsWith('/') ? target + bare.slice(key.length) : target;
      const rel = path.relative(root, abs).split(path.sep).join('/');
      if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
      return resolveIn(rel);
    }
    return null;
  };
  const queue = files.length > 0 ? [files[0].path] : [];
  while (queue.length > 0) {
    const current = /** @type {string} */ (queue.shift());
    if (reached.has(current)) continue;
    reached.add(current);
    const ext = path.posix.extname(current).toLowerCase();
    if (!PAGE_EXTENSIONS.includes(ext)) continue;
    const entry = byPath.get(current);
    if (!entry) continue;
    const source = Buffer.from(entry.base64, 'base64').toString('utf8');
    for (const spec of importSpecifiers(source, current)) {
      const target = resolveSpec(current, spec);
      if (target && !reached.has(target)) queue.push(target);
    }
  }
  return reached;
}

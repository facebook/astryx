#!/usr/bin/env node
// Lists the tests that read repository sources through the file system,
// directly or through a module they import: guards over every component's
// files see changes no import reaches, so a scoped pull request runs them all
// (spec:AST-030 FR13). Any spelling of a module that reads files counts:
// `fs`, `fs/promises`, `child_process` (`node:` or bare), and the libraries
// that read sources for the test (the TypeScript compiler and ts-morph,
// Babel, bundlers, ESLint and Prettier, globs, process runners), through `from`, `require`, `import()` or
// `vi.importActual`. So do `createRequire`, a computed `import()` and
// `import.meta.glob`: each loads what it computes or lists.
//
// Usage: node .github/scripts/fs-guard-tests.mjs  (newline-separated paths)

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const TEST_FILE = /\.test\.(?:tsx?|mjs|cjs|js)$/;
const FILE_MODULE = String.raw`(?:fs|fs\/promises|fs-extra|child_process|typescript|ts-morph|@babel\/core|esbuild|vite|rollup|eslint|prettier|glob|fast-glob|tinyglobby|globby|execa|cross-spawn)`;
const READS_FILES = new RegExp(
  [
    String.raw`\bnode:${FILE_MODULE}\b`,
    String.raw`\bfrom\s*['"]${FILE_MODULE}['"]`,
    // Any call naming the module: require, a createRequire require,
    // import(), vi.importActual.
    String.raw`\(\s*['"]${FILE_MODULE}['"]\s*[,)]`,
    String.raw`\bimport\.meta\.glob\b`,
    String.raw`\bcreateRequire\b`,
    String.raw`\bimport\(\s*[^'"\s)]`,
  ].join('|'),
);
const RELATIVE_SPECIFIER =
  /(?:\bfrom|\bimport|\brequire\s*\()\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g;
const EXTENSIONS = ['', '.ts', '.tsx', '.mjs', '.js', '.cjs', '.mts', '.cts'];

/** Resolves a relative specifier to a tracked file, or null. */
function resolve(from, specifier, tracked) {
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(from), specifier),
  );
  // TypeScript ESM imports name the emitted `.js`; the source is `.ts`.
  const stems = [base, base.replace(/\.(?:m|c)?js$/, '')];
  for (const stem of stems) {
    for (const extension of EXTENSIONS) {
      if (tracked.has(stem + extension)) return stem + extension;
    }
    for (const extension of EXTENSIONS.slice(1)) {
      if (tracked.has(`${stem}/index${extension}`))
        return `${stem}/index${extension}`;
    }
  }
  return null;
}

/**
 * @param {string[]} files tracked repository paths
 * @param {(file: string) => string} read the file's source
 * @returns {string[]} the tests whose import closure reads files
 */
export function fsGuardTests(files, read) {
  const tracked = new Set(files);
  const memo = new Map();
  const readsFiles = (file, visiting) => {
    if (memo.has(file)) return memo.get(file);
    if (visiting.has(file)) return false;
    visiting.add(file);
    let source = '';
    try {
      source = read(file);
    } catch {
      source = '';
    }
    let result = READS_FILES.test(source);
    if (!result) {
      for (const [, specifier] of source.matchAll(RELATIVE_SPECIFIER)) {
        const target = resolve(file, specifier, tracked);
        if (target != null && readsFiles(target, visiting)) {
          result = true;
          break;
        }
      }
    }
    visiting.delete(file);
    memo.set(file, result);
    return result;
  };
  return files.filter(
    file => TEST_FILE.test(file) && readsFiles(file, new Set()),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = execFileSync('git', ['ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .split('\0')
    .filter(Boolean);
  const guards = fsGuardTests(files, file => fs.readFileSync(file, 'utf8'));
  process.stdout.write(guards.length > 0 ? `${guards.join('\n')}\n` : '');
}

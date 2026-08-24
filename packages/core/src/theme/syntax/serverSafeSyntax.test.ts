// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the server-safety of the `./theme/syntax` subpath.
 * @input Reads the source files in this directory
 * @output One invariant per module: only the provider carries `'use client'`
 * @position Narrow sibling of src/serverSafeComponents.test.ts, which only
 *   walks `./src/<Name>/index.ts` subpaths and so never sees this directory.
 *
 * `./theme/syntax` is the only export subpath for the syntax module, and it
 * mixes a provider with presets, token defaults and pure functions. A
 * directive on the barrel makes React hand a server importer a client
 * reference for every one of those exports, so `dracula.tokens` reads back
 * `undefined` — a silent failure far from its cause.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

/**
 * The directives at the top of a module, in order. Comments and blank lines
 * may precede them; the prologue ends at the first statement that is not a
 * bare string literal, so a `'use strict';` cannot hide a later directive.
 */
function directives(file: string): string[] {
  const source = readFileSync(join(__dirname, file), 'utf-8');
  const found: string[] = [];
  let rest = source;
  for (;;) {
    const trimmed = rest.replace(/^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)+/, '');
    const directive = /^(['"])([^'"]*)\1\s*;?/.exec(trimmed);
    if (!directive) {
      return found;
    }
    found.push(directive[2]);
    rest = trimmed.slice(directive[0].length);
  }
}

/**
 * The modules in this directory that legitimately need a client boundary.
 * Everything else is data or pure functions and must stay directive-free —
 * derived from the directory, so a module added here is covered by default.
 */
const CLIENT_MODULES = ['SyntaxTheme.tsx'];

const serverSafeModules = readdirSync(__dirname)
  .filter(
    name =>
      /\.[jt]sx?$/.test(name) &&
      !/\.(test|stories|doc|perf)\./.test(name) &&
      !name.endsWith('.d.ts') &&
      !CLIENT_MODULES.includes(name),
  )
  .sort();

describe('./theme/syntax is importable from a server component', () => {
  it.each(serverSafeModules)('%s carries no "use client"', file => {
    expect(directives(file)).not.toContain('use client');
  });

  // Also the proof that the reader above is not blind, which would make every
  // assertion in this file pass vacuously.
  it.each(CLIENT_MODULES)('%s keeps the directive it needs', file => {
    expect(directives(file)).toContain('use client');
  });
});

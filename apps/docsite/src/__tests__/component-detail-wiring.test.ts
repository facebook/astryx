// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wiring tests for the component detail page.
 *
 * The `component-detail/` directory holds the internal building blocks of a
 * single page. Unlike `app/`, it contains no Next.js route entry points and no
 * script-consumed modules, so every module in it must be reachable from an
 * import — a renderer that nothing imports is dead code, and the data it was
 * written to display silently never reaches the page.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';
import {components} from '../generated/componentRegistry';

const SRC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DETAIL_DIR = path.join(SRC_DIR, 'components/component-detail');
const EXTENSIONS = ['.ts', '.tsx'];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Resolve a relative import specifier the way the bundler does, so a match is
 * an actual module reference rather than a name that happens to appear in the
 * source. Package specifiers are skipped — `@astryxdesign/core/Section` must
 * not count as an import of a local `Section.tsx`.
 */
function resolveRelative(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) {
    return null;
  }
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    ...EXTENSIONS.map(ext => base + ext),
    ...EXTENSIONS.map(ext => path.join(base, `index${ext}`)),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

const SPECIFIER_RE = /(?:from\s*|import\(\s*|require\(\s*)['"]([^'"]+)['"]/g;

function collectImportedFiles(files: string[]): Set<string> {
  const imported = new Set<string>();
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(SPECIFIER_RE)) {
      const resolved = resolveRelative(file, match[1]);
      if (resolved !== null) {
        imported.add(resolved);
      }
    }
  }
  return imported;
}

describe('component detail wiring', () => {
  it('imports every module in component-detail/ from somewhere', () => {
    const detailModules = walk(DETAIL_DIR).filter(
      file => !file.includes('.test.'),
    );
    // Guard against a vacuous pass if the directory is ever moved or renamed.
    expect(detailModules.length).toBeGreaterThan(5);

    const imported = collectImportedFiles(walk(SRC_DIR));
    const orphans = detailModules
      .filter(file => !imported.has(file))
      .map(file => path.relative(SRC_DIR, file))
      .sort();

    expect(orphans).toEqual([]);
  });

  it('carries anatomy data for components that author it', () => {
    const withAnatomy = Object.values(components)
      .flat()
      .filter(entry => (entry.usage?.anatomy?.length ?? 0) > 0);

    // The renderer is only worth wiring if the generated registry actually
    // carries the data; this fails if generate-data.mjs ever drops `anatomy`
    // from the `usage` block it passes through.
    expect(withAnatomy.length).toBeGreaterThan(0);

    for (const entry of withAnatomy) {
      for (const element of entry.usage!.anatomy!) {
        expect(typeof element.name).toBe('string');
        expect(element.name.length).toBeGreaterThan(0);
        expect(typeof element.description).toBe('string');
      }
    }
  });
});

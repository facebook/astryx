// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * @file Guards component icon slots against going undocumented.
 * @input `ComponentIconSlotMap` in globalIconRegistry.tsx plus every {Name}.doc.mjs.
 * @output Fails when a declared slot has no `theming.icons` entry documenting it.
 * @position Repo-wide doc-shape guard, sibling of docPropLiterals.test.ts.
 *
 * A component icon slot is a THEME API: `defineTheme({componentIcons})` names
 * it, built themes carry the string, and consumer code is written against it.
 * Two things follow, and this test enforces both.
 *
 * 1. **Undocumented is undiscoverable.** The docsite's icon-slots table renders
 *    exactly what components declare in `theming.icons`, so a slot missing
 *    there exists only in the type — invisible to anyone reading the docs, and
 *    to an agent reading them as training signal.
 *
 * 2. **`theme build` derives its known-slot set from these same docs.** The
 *    build warns on a slot key core does not expose (an otherwise silent
 *    no-op: resolution just falls back to the component default). That check
 *    reads `theming.icons`, so an undocumented-but-real slot would make the
 *    build warn about a mapping that actually works. This test is what keeps
 *    the two in agreement.
 *
 * Slot names are read from the TypeScript source rather than listed here, so
 * adding a slot to `ComponentIconSlotMap` fails this test until the owning
 * component documents it.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';

const SRC_DIR = __dirname;

type IconSlotDoc = {slot?: unknown; default?: unknown; description?: unknown};

type DocExport = {
  name?: string;
  theming?: {icons?: IconSlotDoc[]};
};

type DocModule = {docs?: DocExport; docsZh?: DocExport};

function findFiles(dir: string, suffix: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findFiles(full, suffix));
    } else if (entry.name.endsWith(suffix)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * The slot names core declares, read from the `ComponentIconSlotMap` interface.
 *
 * Parsed from source for the same reason the sibling doc guards parse types:
 * a hardcoded list here would be a second registry to keep in sync, and the
 * failure mode (a new slot silently exempt from the check) is exactly what the
 * test exists to prevent.
 */
function declaredSlots(): string[] {
  const source = readFileSync(
    join(SRC_DIR, 'Icon', 'globalIconRegistry.tsx'),
    'utf8',
  );
  const match = source.match(
    /export interface ComponentIconSlotMap\s*{([^}]*)}/,
  );
  if (!match) {
    throw new Error(
      'Could not find `export interface ComponentIconSlotMap` in ' +
        'Icon/globalIconRegistry.tsx. If it moved or was renamed, update this ' +
        'test — the guard is only meaningful while it reads the real thing.',
    );
  }
  return [...match[1].matchAll(/'([^']+)'\s*:/g)].map(m => m[1]);
}

/** Every slot documented by any component, mapped to the docs declaring it. */
function documentedSlots(): Map<string, string[]> {
  const found = new Map<string, string[]>();

  for (const file of findFiles(SRC_DIR, '.doc.mjs')) {
    let mod: DocModule;
    try {
      mod = require(file) as DocModule;
    } catch {
      continue;
    }

    for (const doc of [mod.docs, mod.docsZh]) {
      for (const icon of doc?.theming?.icons ?? []) {
        if (typeof icon?.slot !== 'string') {
          continue;
        }
        const where = relative(SRC_DIR, file);
        const list = found.get(icon.slot) ?? [];
        if (!list.includes(where)) {
          list.push(where);
        }
        found.set(icon.slot, list);
      }
    }
  }

  return found;
}

describe('component icon slots are documented', () => {
  it('finds the declared slots', () => {
    // Guards the parse itself: if the interface stops matching, every other
    // assertion here would vacuously pass.
    expect(declaredSlots().length).toBeGreaterThan(0);
  });

  it('documents every declared slot in some theming.icons', () => {
    const documented = documentedSlots();
    const missing = declaredSlots().filter(slot => !documented.has(slot));

    expect(
      missing,
      missing.length === 0
        ? ''
        : `Component icon slot(s) declared in ComponentIconSlotMap but not ` +
            `documented: ${missing.join(', ')}. Add a theming.icons entry ` +
            `({slot, default, description}) to the owning component's ` +
            `.doc.mjs — the docsite table and \`theme build\`'s unknown-slot ` +
            `warning both read that list.`,
    ).toEqual([]);
  });

  it('documents no slot that core does not declare', () => {
    const declared = new Set(declaredSlots());
    const stale = [...documentedSlots().entries()]
      .filter(([slot]) => !declared.has(slot))
      .map(([slot, files]) => `${slot} (${files.join(', ')})`);

    expect(
      stale,
      stale.length === 0
        ? ''
        : `Documented icon slot(s) with no ComponentIconSlotMap entry: ` +
            `${stale.join('; ')}. A slot documented but not declared can't be ` +
            `written in a theme without a type error, and would make ` +
            `\`theme build\` accept a key that resolves to nothing.`,
    ).toEqual([]);
  });

  it('gives each documented slot a default and a description', () => {
    const incomplete: string[] = [];

    for (const file of findFiles(SRC_DIR, '.doc.mjs')) {
      let mod: DocModule;
      try {
        mod = require(file) as DocModule;
      } catch {
        continue;
      }
      for (const doc of [mod.docs, mod.docsZh]) {
        for (const icon of doc?.theming?.icons ?? []) {
          if (typeof icon?.slot !== 'string') {
            continue;
          }
          if (typeof icon.default !== 'string' || icon.default.length === 0) {
            incomplete.push(
              `${icon.slot} in ${relative(SRC_DIR, file)}: default`,
            );
          }
          if (
            typeof icon.description !== 'string' ||
            icon.description.length === 0
          ) {
            incomplete.push(
              `${icon.slot} in ${relative(SRC_DIR, file)}: description`,
            );
          }
        }
      }
    }

    expect(incomplete).toEqual([]);
  });
});

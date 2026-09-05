// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Keeps the `astryx docs theme` Available Themes row for Neutral in
 * sync with the fonts the Neutral theme actually declares (#5991: the row
 * said "system fonts" while the theme declared unloaded Figtree).
 * @input assets/docs/theme.doc.mjs plus the Neutral theme source it
 *   describes (fs-read across the workspace, like react-version-sync).
 * @output Fails when the Neutral row stops naming a declared webfont or
 *   reverts to a system-fonts claim.
 * @position CLI-package docs guard beside readme-gen.test.mjs. Lives under
 *   test/, NOT assets/ — the package publishes "assets" wholesale to npm.
 *
 * Runs against the real packages/themes/neutral source, not mocks. Scoped
 * to Neutral: other rows carry live drift of the same class (the Matcha row
 * names Figtree while matchaTheme declares DM Sans + Playwrite US Trad), so
 * a table-wide sweep must fix those rows first.
 */

import {describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectUnloadedFonts} from '../api/theme/build/font-warning.mjs';
import {docs as themeDocs} from '../assets/docs/theme.doc.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

const source = fs.readFileSync(
  path.join(REPO_ROOT, 'packages/themes/neutral/src/neutralTheme.ts'),
  'utf-8',
);

// Every `family:` declaration in the theme source, filtered down to the
// families a clean machine does not have by the CLI's own font-warning
// logic (generics and system faces drop out; Figtree stays).
const families = [...source.matchAll(/family:\s*(['"])([^'"]+)\1/g)].map(
  m => m[2],
);
const webfonts = collectUnloadedFonts({
  tokens: Object.fromEntries(
    families.map((family, i) => [`--font-family-${i}`, family]),
  ),
});

function neutralRow() {
  const section = themeDocs.sections.find(s => s.title === 'Available Themes');
  const table = section?.content.find(block => block.type === 'table');
  const row = table?.rows.find(r => r[0] === 'Neutral');
  if (!row) {
    throw new Error(
      'theme.doc.mjs no longer has an Available Themes table row named ' +
        '"Neutral"; teach this test the new location of the theme list',
    );
  }
  return row;
}

describe('theme doc Neutral row matches the declared fonts (#5991)', () => {
  it('reads Figtree out of the neutral theme source', () => {
    expect(webfonts).toContain('Figtree');
  });

  it('names every unloaded webfont in the row description', () => {
    const description = neutralRow().at(-1);
    for (const family of webfonts) {
      expect(description).toContain(family);
    }
  });

  it('does not describe a webfont theme as system fonts', () => {
    expect(neutralRow().at(-1)).not.toMatch(/system[ -]fonts?/i);
  });
});

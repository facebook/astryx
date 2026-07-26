// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc-drift guard: every documented install line lists the peers a
 * consumer must install themselves.
 *
 * `@astryxdesign/core` declares `@stylexjs/stylex` as a peer dependency and
 * hundreds of files in its `dist/` import it at runtime. npm and yarn
 * auto-install peers, so the omission is invisible there — pnpm under a strict
 * `node_modules` does not, and every component throws on import (#4276).
 *
 * `react` / `react-dom` are peers too but are deliberately not asserted here:
 * a project adopting a React component library already has them. StyleX is the
 * peer nobody has by accident.
 *
 * This guard is conditional on core still declaring StyleX as a peer — if it
 * ever moves to `dependencies` the install lines no longer need to name it and
 * the assertion stands down on its own.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const CORE_PKG = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'packages/core/package.json'), 'utf-8'),
);

const STYLEX = '@stylexjs/stylex';

/**
 * Docs that tell a consumer what to install. The dated blog post under
 * apps/docsite is deliberately excluded — it is a record of what was true when
 * it was published, not live setup instructions.
 */
const INSTALL_DOCS = [
  'README.md',
  'packages/core/README.md',
  'packages/cli/docs/getting-started.doc.mjs',
  'apps/example-nextjs/README.md',
];

/** Lines that install @astryxdesign/core via a package manager. */
const INSTALL_LINE = /(npm install|pnpm add|yarn add)\b[^\n]*@astryxdesign\/core\b/;

describe('documented install lines', () => {
  const isPeer = Boolean(CORE_PKG.peerDependencies?.[STYLEX]);
  const isDep = Boolean(CORE_PKG.dependencies?.[STYLEX]);

  it('core still declares @stylexjs/stylex as a peer (guard precondition)', () => {
    // If this flips, StyleX became a real dependency and the assertions below
    // stand down — that is a deliberate, separate decision (see #3691).
    expect(isPeer || isDep).toBe(true);
  });

  for (const rel of INSTALL_DOCS) {
    it(`${rel} names ${STYLEX} on every core install line (#4276)`, () => {
      if (!isPeer) return; // StyleX is auto-installed; nothing to document.

      const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf-8');
      const lines = content.split('\n').filter(l => INSTALL_LINE.test(l));

      expect(lines.length).toBeGreaterThan(0);
      const missing = lines.filter(l => !l.includes(STYLEX));
      expect(missing).toEqual([]);
    });
  }
});

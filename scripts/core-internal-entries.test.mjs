// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file core-internal-entries.test.mjs
 * @input The repository's ESLint config
 * @output Pins who may import Core's internal entries
 *   (`@astryxdesign/core/internal/*`, architecture:react-component-runtime
 *   INV13): only Core and Lab
 * @position Node test over the lint config, so it needs no build
 */

import {createRequire} from 'node:module';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

const REPO = path.resolve(import.meta.dirname, '..');
const require = createRequire(path.join(REPO, 'package.json'));
const {ESLint, Linter} = require('eslint');
const tseslint = require('typescript-eslint');

const eslint = new ESLint({cwd: REPO});

/**
 * The `no-restricted-imports` messages the repository's config reports for
 * `source` at `file`: the rule's options as the config resolves them for that
 * path, run on the import alone, so no type information is needed.
 */
async function restrictedImports(file, source) {
  const config = await eslint.calculateConfigForFile(path.join(REPO, file));
  const rule = config.rules?.['no-restricted-imports'];
  if (rule == null || rule === 'off' || rule[0] === 'off' || rule[0] === 0) {
    return [];
  }
  const linter = new Linter({configType: 'flat'});
  return linter
    .verify(
      source,
      [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: {parser: tseslint.parser},
          rules: {'no-restricted-imports': rule},
        },
      ],
      {filename: path.join(REPO, file)},
    )
    .map(message => message.message);
}

describe('core internal entries in lint', () => {
  it('are refused outside Core and Lab', async () => {
    for (const entry of ['internal/touch', 'internal/reorder']) {
      expect(
        await restrictedImports(
          'apps/docsite/src/Example.tsx',
          `import {x} from '@astryxdesign/core/${entry}';\n`,
        ),
        entry,
      ).toHaveLength(1);
    }
  });

  it('are allowed in Core and Lab', async () => {
    for (const file of [
      'packages/lab/src/Example/Example.tsx',
      'packages/core/src/Example/Example.tsx',
    ]) {
      expect(
        await restrictedImports(
          file,
          "import {x} from '@astryxdesign/core/internal/touch';\n",
        ),
        file,
      ).toEqual([]);
    }
  });
});

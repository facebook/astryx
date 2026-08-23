// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Keeps the documented React version requirement in sync with the peer
 * dependency range declared by @astryxdesign/core (issue #4575: users must be
 * able to discover the React 19 requirement without reading package.json).
 *
 * Runs against the real packages/core package.json, not mocks.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {docs as gettingStarted} from '../../assets/docs/getting-started.doc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

// Every place that names the supported React version. The docsite hero
// (apps/docsite/src/app/(site)/page.tsx) is deliberately not asserted —
// landing-page copy is a design call — but it names the version today, so
// sweep it whenever these assertions send you updating the rest.
const SURFACES =
  'update every surface that names the supported React version: README.md ' +
  '(repo root), packages/core/README.md, ' +
  'packages/cli/assets/docs/getting-started.doc.mjs, and the docsite hero ' +
  'in apps/docsite/src/app/(site)/page.tsx';

describe('documented React version matches the core peer dependency', () => {
  const coreDir = findCoreDir();
  const pkg = JSON.parse(
    fs.readFileSync(path.join(coreDir, 'package.json'), 'utf-8'),
  );
  const reactRange = pkg.peerDependencies?.react;
  if (typeof reactRange !== 'string') {
    throw new Error(
      '@astryxdesign/core no longer declares a react peer dependency; ' +
        `${SURFACES}, then teach this test the new contract`,
    );
  }
  const match = /\d+/.exec(reactRange);
  if (!match) {
    throw new Error(
      `cannot read a major version from the react peer range "${reactRange}"; ` +
        `${SURFACES}, then teach this test the new contract`,
    );
  }
  const major = match[0];
  // "React 19" but not "React 190"; also matches "React 19+".
  const namesTheMajor = new RegExp(`React ${major}(?!\\d)`);

  it('core declares matching react and react-dom peer ranges', () => {
    expect(
      pkg.peerDependencies['react-dom'],
      `react and react-dom peer ranges diverged; if that is intentional, ${SURFACES}`,
    ).toBe(reactRange);
  });

  it(`root README names React ${major}`, () => {
    const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf-8');
    expect(readme, SURFACES).toMatch(namesTheMajor);
  });

  it(`@astryxdesign/core README names React ${major}`, () => {
    const readme = fs.readFileSync(path.join(coreDir, 'README.md'), 'utf-8');
    expect(readme, SURFACES).toMatch(namesTheMajor);
  });

  it(`getting-started guide names React ${major} in prose`, () => {
    const prose = gettingStarted.sections
      .flatMap(section => section.content)
      .filter(block => block.type === 'prose')
      .map(block => block.text)
      .join('\n');
    expect(prose, SURFACES).toMatch(namesTheMajor);
  });
});

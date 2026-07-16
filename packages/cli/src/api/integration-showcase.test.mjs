// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Showcase/block discovery for integration packages.
 *
 * Integration packages (astryx.integration manifest) contribute their
 * `type: 'block'` templates to showcase resolution via the same `templates`
 * root used for scaffolding — no separate package.json `astryx.blocks` field.
 * These tests verify findShowcase/findRelatedBlocks pick them up, including the
 * split-family case (one showcase serving several related components).
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {findShowcase, findRelatedBlocks} from './template.mjs';

const CLI_PKG = path.resolve(import.meta.dirname, '..', '..');

let tmpDir;

function writeBlock(templatesRoot, id, def, source) {
  const docPath = path.join(templatesRoot, `${id}.doc.mjs`);
  fs.mkdirSync(path.dirname(docPath), {recursive: true});
  fs.writeFileSync(
    docPath,
    `import {createBlockTemplate} from '${CLI_PKG}/src/template.mjs';\n` +
      `export default createBlockTemplate(${JSON.stringify(def)});\n`,
  );
  fs.writeFileSync(
    path.join(templatesRoot, `${id}.tsx`),
    source ?? `'use client';\nexport default function ${id.replace(/[^A-Za-z0-9]/g, '')}() { return null; }`,
  );
}

function createFixture() {
  // Consumer project that lists the integration.
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default { integrations: ['@acme/widgets'] };\n`,
  );

  // Installed integration package with a templates root of showcase blocks.
  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { templates: './blocks' };\n`,
  );
  const blocks = path.join(pkgDir, 'blocks');

  // Single-component showcase.
  writeBlock(blocks, 'Gauge/GaugeShowcase', {
    name: 'Gauge',
    description: 'A radial gauge.',
    isShowcase: true,
    aspectRatio: 16 / 9,
    componentsUsed: ['Gauge'],
  });

  // Split family: one showcase serving several related components (e.g. a
  // trigger and its popover) that a package ships as separate exports.
  writeBlock(blocks, 'Chip/ChipShowcase', {
    name: 'Chip',
    description: 'A chip with a popover.',
    isShowcase: true,
    aspectRatio: 4 / 3,
    componentsUsed: ['Chip', 'ChipPopover'],
  });

  // A non-showcase example block in the same family.
  writeBlock(blocks, 'Chip/ChipVariants', {
    name: 'Chip Variants',
    description: 'Chip variants.',
    componentsUsed: ['Chip'],
  });
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-int-showcase-'));
  createFixture();
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('findShowcase() with integration packages', () => {
  it('finds an integration showcase by componentsUsed', async () => {
    const result = await findShowcase('Gauge', tmpDir, {
      package: '@acme/widgets',
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe('Gauge');
    expect(result.filePath).toContain('GaugeShowcase.tsx');
  });

  it('resolves a split-family popover variant to the family showcase', async () => {
    const result = await findShowcase('ChipPopover', tmpDir, {
      package: '@acme/widgets',
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe('Chip');
  });

  it('resolves the split-family base variant to the same showcase', async () => {
    const result = await findShowcase('Chip', tmpDir, {
      package: '@acme/widgets',
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe('Chip');
  });

  it('returns null for a component with no showcase in the package', async () => {
    const result = await findShowcase('NonExistent', tmpDir, {
      package: '@acme/widgets',
    });
    expect(result).toBeNull();
  });
});

describe('findRelatedBlocks() with integration packages', () => {
  it('finds all blocks referencing an integration component', async () => {
    const result = await findRelatedBlocks('Chip', tmpDir);
    const names = result.map(b => b.dirName).sort();
    expect(names).toContain('Chip/ChipShowcase');
    expect(names).toContain('Chip/ChipVariants');
  });
});

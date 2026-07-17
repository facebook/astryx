// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The canonical `.template.{ts,mjs,js}` suffix is discovered identically
 * to the legacy `.doc.{ts,mjs,js}` suffix.
 *
 * Template-spec files are named for what they are: a scaffoldable TEMPLATE that
 * exports `createBlockTemplate`/`createPageTemplate`. The `.doc.*` suffix was
 * inherited from the component-doc convention and is still accepted during the
 * transition. These tests stand up integration templates and external blocks in
 * both families and assert byte-for-byte-equivalent discovery + scaffolding.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  template,
  findShowcase,
  findRelatedBlocks,
} from './template.mjs';

/** Absolute path to the CLI package so fixtures can import /src/template.mjs. */
const CLI_PKG = path.resolve(import.meta.dirname, '..', '..');

let tmpDir;
let originalCwd;

function makeConsumer() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-template-suffix-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(dir, 'astryx.config.mjs'),
    `export default { integrations: ['@acme/widgets'] };\n`,
  );
  return dir;
}

function installWidgets(consumerDir) {
  const pkgDir = path.join(consumerDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(path.join(pkgDir, 'templates'), {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '2.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { templates: './templates' };\n`,
  );
  return pkgDir;
}

/**
 * Write a template-spec file (default-export createPageTemplate/BlockTemplate)
 * plus its same-stem `.tsx` source under the templates root.
 * @param {string} pkgDir
 * @param {string} id
 * @param {{kind: 'page'|'block', suffix: string}} opts
 */
function writeTemplate(pkgDir, id, {kind, suffix}) {
  const docPath = path.join(pkgDir, 'templates', `${id}${suffix}`);
  fs.mkdirSync(path.dirname(docPath), {recursive: true});
  const create =
    kind === 'page' ? 'createPageTemplate' : 'createBlockTemplate';
  fs.writeFileSync(
    docPath,
    `import {${create}} from '${CLI_PKG}/src/template.mjs';\n` +
      `export default ${create}({name: '${id} name', description: '${id} desc'});\n`,
  );
  fs.writeFileSync(
    path.join(pkgDir, 'templates', `${id}.tsx`),
    `export default function ${id.replace(/[^a-zA-Z0-9]/g, '')}() { return null; }\n`,
  );
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = makeConsumer();
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration templates: .template.* discovered like legacy .doc.*', () => {
  for (const suffix of ['.template.ts', '.template.mjs', '.doc.mjs']) {
    it(`discovers + lists a page template authored as ${suffix}`, async () => {
      const pkgDir = installWidgets(tmpDir);
      writeTemplate(pkgDir, 'pricing', {kind: 'page', suffix});

      const result = await template(undefined, {list: true, cwd: tmpDir});
      const entry = result.data.find(t => t.id === 'pricing');
      expect(entry).toBeTruthy();
      expect(entry.type).toBe('page');
      expect(entry.package).toBe('@acme/widgets');
      expect(entry.name).toBe('pricing name');
      expect(entry.description).toBe('pricing desc');
    });

    it(`scaffolds a page template authored as ${suffix}`, async () => {
      const pkgDir = installWidgets(tmpDir);
      writeTemplate(pkgDir, 'pricing', {kind: 'page', suffix});

      const result = await template('pricing', {
        targetPath: './dest',
        cwd: tmpDir,
      });
      expect(result.type).toBe('template.copy');
      expect(result.data.fileName).toBe('page.tsx');
      expect(fs.existsSync(path.join(tmpDir, 'dest', 'page.tsx'))).toBe(true);
    });

    it(`scaffolds a nested block template authored as ${suffix}`, async () => {
      const pkgDir = installWidgets(tmpDir);
      writeTemplate(pkgDir, 'marketing/hero', {kind: 'block', suffix});

      const result = await template('marketing/hero', {
        targetPath: './dest',
        cwd: tmpDir,
      });
      expect(result.type).toBe('template.copy');
      expect(result.data.fileName).toBe('hero.tsx');
      expect(fs.existsSync(path.join(tmpDir, 'dest', 'hero.tsx'))).toBe(true);
    });
  }

  it('treats a .template.ts and a legacy .doc.mjs identically (same shape)', async () => {
    const pkgDir = installWidgets(tmpDir);
    writeTemplate(pkgDir, 'gauge', {kind: 'block', suffix: '.template.ts'});
    writeTemplate(pkgDir, 'chip', {kind: 'block', suffix: '.doc.mjs'});

    const result = await template(undefined, {list: true, cwd: tmpDir});
    const gauge = result.data.find(t => t.id === 'gauge');
    const chip = result.data.find(t => t.id === 'chip');

    // Both discovered, both blocks, both from the same package, both ready.
    for (const entry of [gauge, chip]) {
      expect(entry).toBeTruthy();
      expect(entry.type).toBe('block');
      expect(entry.package).toBe('@acme/widgets');
    }
    // Field-by-field parity apart from the (intentionally different) id/name.
    expect(gauge.type).toBe(chip.type);
    expect(gauge.package).toBe(chip.package);
  });
});

describe('external showcase blocks: .template.* discovered like legacy .doc.*', () => {
  /**
   * Create a consumer whose @test/ext package contributes two showcase blocks,
   * one authored as `Foo.template.ts` and one as legacy `Bar.doc.mjs`.
   */
  function makeShowcaseFixture() {
    // Symlink the real core package (needed by findCoreDir during discovery).
    const realCoreDir = path.resolve(
      import.meta.dirname,
      '..',
      '..',
      '..',
      'core',
    );
    const coreDir = path.join(tmpDir, 'packages', 'core');
    fs.mkdirSync(path.dirname(coreDir), {recursive: true});
    fs.symlinkSync(realCoreDir, coreDir);

    const extDir = path.join(tmpDir, 'node_modules', '@test', 'ext');
    const blocksDir = path.join(extDir, 'blocks', 'components');

    // Foo showcase — canonical .template.ts (default-export createBlockTemplate).
    const fooDir = path.join(blocksDir, 'Foo');
    fs.mkdirSync(fooDir, {recursive: true});
    fs.writeFileSync(
      path.join(fooDir, 'FooShowcase.template.ts'),
      `import {createBlockTemplate} from '${CLI_PKG}/src/template.mjs';\n` +
        `export default createBlockTemplate({\n` +
        `  name: 'Foo — Showcase',\n` +
        `  description: 'Foo showcase.',\n` +
        `  isShowcase: true,\n` +
        `  aspectRatio: 16 / 9,\n` +
        `  componentsUsed: ['Foo'],\n` +
        `});\n`,
    );
    fs.writeFileSync(
      path.join(fooDir, 'FooShowcase.tsx'),
      "'use client';\nexport default function FooShowcase() { return <div>Foo</div>; }",
    );

    // Bar showcase — legacy .doc.mjs (export const doc).
    const barDir = path.join(blocksDir, 'Bar');
    fs.mkdirSync(barDir, {recursive: true});
    fs.writeFileSync(
      path.join(barDir, 'BarShowcase.doc.mjs'),
      `export const doc = {\n` +
        `  type: 'block',\n` +
        `  name: 'Bar — Showcase',\n` +
        `  description: 'Bar showcase.',\n` +
        `  isReady: true,\n` +
        `  isShowcase: true,\n` +
        `  aspectRatio: 4 / 3,\n` +
        `  componentsUsed: ['Bar', 'Chip'],\n` +
        `};\n`,
    );
    fs.writeFileSync(
      path.join(barDir, 'BarShowcase.tsx'),
      "'use client';\nexport default function BarShowcase() { return <div>Bar</div>; }",
    );

    fs.writeFileSync(
      path.join(extDir, 'package.json'),
      JSON.stringify({
        name: '@test/ext',
        astryx: {docs: './src', category: 'Common', blocks: './blocks/components'},
      }),
    );
    fs.mkdirSync(path.join(extDir, 'src'), {recursive: true});
  }

  it('findShowcase resolves a .template.ts external block by directory name', async () => {
    makeShowcaseFixture();
    const result = await findShowcase('Foo', tmpDir);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Foo — Showcase');
    expect(result.filePath).toContain('FooShowcase.tsx');
  });

  it('findShowcase resolves a legacy .doc.mjs external block by componentsUsed', async () => {
    makeShowcaseFixture();
    const result = await findShowcase('Bar', tmpDir);
    expect(result).not.toBeNull();
    expect(result.name).toBe('Bar — Showcase');
  });

  it('findRelatedBlocks finds both suffix families', async () => {
    makeShowcaseFixture();
    const foo = await findRelatedBlocks('Foo', tmpDir);
    expect(foo.map(b => b.dirName)).toContain('FooShowcase');
    const chip = await findRelatedBlocks('Chip', tmpDir);
    expect(chip.map(b => b.dirName)).toContain('BarShowcase');
  });
});

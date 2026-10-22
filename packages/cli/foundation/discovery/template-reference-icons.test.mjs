// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The reference icon set (AST-084 FR19–FR21): reference imports lower
 * to the upstream imports the set re-exports, printed as the formatter
 * prints them; the CLI's reference data stays equal to the package's
 * generated module; and the Core swap leaves every other import alone.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parse} from '@babel/parser';
import {describe, expect, it} from 'vitest';
import {
  coreTemplateIcons,
  lowerReferenceIcons,
  printImport,
  referenceIconSet,
} from './template-reference-icons.mjs';
import {discoverCoreTemplates} from './template-adapter.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';

const PKG = '@astryxdesign/icons-heroicons';
const SET_DIR = path.join(CLI_ROOT, '..', 'icons-heroicons', 'icon-sets');

/** A small reference set, so these cases read on their own. */
const REFERENCE = {
  package: PKG,
  set: 'heroicons',
  exports: new Map([
    ['TrashIcon', {module: '@heroicons/react/24/outline', export: 'TrashIcon'}],
    [
      'TrashSolidIcon',
      {module: '@heroicons/react/24/solid', export: 'TrashIcon'},
    ],
    [
      'ArrowRightMiniIcon',
      {module: '@heroicons/react/20/solid', export: 'ArrowRightIcon'},
    ],
    ['XMarkIcon', {module: '@heroicons/react/24/outline', export: 'XMarkIcon'}],
    [
      'MagnifyingGlassIcon',
      {module: '@heroicons/react/24/outline', export: 'MagnifyingGlassIcon'},
    ],
  ]),
};

/** @param {string} source */
const imports = source =>
  parse(source, {sourceType: 'module', plugins: ['jsx', 'typescript']})
    .program.body.filter(node => node.type === 'ImportDeclaration')
    .map(node => source.slice(node.start, node.end));

describe('lowerReferenceIcons', () => {
  it('writes each reference import as its upstream import, keeping local names', () => {
    const source = [
      `import {TrashIcon, XMarkIcon} from '${PKG}';`,
      `import {TrashSolidIcon as TrashIcon2} from '${PKG}';`,
      `import {ArrowRightMiniIcon as ArrowRightIcon} from '${PKG}';`,
      'export const A = () => <TrashIcon2 />;',
      '',
    ].join('\n');
    expect(lowerReferenceIcons(source, REFERENCE)).toBe(
      [
        "import {TrashIcon, XMarkIcon} from '@heroicons/react/24/outline';",
        "import {TrashIcon as TrashIcon2} from '@heroicons/react/24/solid';",
        "import {ArrowRightIcon} from '@heroicons/react/20/solid';",
        'export const A = () => <TrashIcon2 />;',
        '',
      ].join('\n'),
    );
  });

  it('prints as the formatter does: one line when it fits or names one export, else one name per line', () => {
    expect(printImport(['A', 'B'], 'm')).toBe("import {A, B} from 'm';");
    const long = ['MagnifyingGlassIcon', 'XMarkIcon', 'TrashIcon', 'Other'];
    expect(printImport(long, '@heroicons/react/24/outline')).toBe(
      [
        'import {',
        '  MagnifyingGlassIcon,',
        '  XMarkIcon,',
        '  TrashIcon,',
        '  Other,',
        "} from '@heroicons/react/24/outline';",
      ].join('\n'),
    );
    const one = ['SomeVeryLongIconNameThatGoesOnAndOn as AnotherVeryLongName'];
    expect(printImport(one, '@heroicons/react/24/outline')).not.toContain('\n');
    // A multi-line reference import that fits on one line once lowered.
    const source = `import {\n  TrashIcon,\n  XMarkIcon,\n} from '${PKG}';\n`;
    expect(lowerReferenceIcons(source, REFERENCE)).toBe(
      "import {TrashIcon, XMarkIcon} from '@heroicons/react/24/outline';\n",
    );
  });

  it('splits a statement that mixes upstream modules, keeps a commented one in place, and leaves an unknown export alone', () => {
    expect(
      lowerReferenceIcons(
        `import {TrashIcon, TrashSolidIcon as Solid} from '${PKG}';\n`,
        REFERENCE,
      ),
    ).toBe(
      [
        "import {TrashIcon} from '@heroicons/react/24/outline';",
        "import {TrashIcon as Solid} from '@heroicons/react/24/solid';",
        '',
      ].join('\n'),
    );
    const commented = `import {\n  // the bin\n  TrashIcon,\n} from '${PKG}';\n`;
    expect(lowerReferenceIcons(commented, REFERENCE)).toBe(
      "import {\n  // the bin\n  TrashIcon,\n} from '@heroicons/react/24/outline';\n",
    );
    const unknown = `import {TrashIcon, RocketIcon} from '${PKG}';\n`;
    expect(lowerReferenceIcons(unknown, REFERENCE)).toBe(unknown);
    const other = "import {TrashIcon} from '@acme/icons';\n";
    expect(lowerReferenceIcons(other, REFERENCE)).toBe(other);
  });
});

describe('coreTemplateIcons', () => {
  it("swaps declared and reference icons for Core's, keeping names and every other import", () => {
    const source = [
      "import {Table} from '@astryxdesign/core/Table';",
      `import {XMarkIcon, TrashIcon, MagnifyingGlassIcon} from '${PKG}';`,
      "import {Grip, Other} from 'lucide-react';",
      'export const A = () => <Table a={XMarkIcon} b={TrashIcon} c={MagnifyingGlassIcon} d={Grip} e={Other} />;',
      '',
    ].join('\n');
    const {source: out, core} = coreTemplateIcons(
      source,
      {XMarkIcon: 'close', TrashIcon: 'delete', Grip: 'drag'},
      REFERENCE,
    );
    expect(core).toEqual([
      {
        source: {module: '@heroicons/react/24/outline', export: 'XMarkIcon'},
        definition: 'close',
        icon: 'close',
      },
      {
        source: {module: '@heroicons/react/24/outline', export: 'TrashIcon'},
        definition: 'delete',
        icon: null,
      },
      {
        source: {
          module: '@heroicons/react/24/outline',
          export: 'MagnifyingGlassIcon',
        },
        definition: null,
        icon: null,
      },
      {
        source: {module: 'lucide-react', export: 'Grip'},
        definition: 'drag',
        icon: null,
      },
    ]);
    expect(imports(out)).toEqual([
      "import {Table} from '@astryxdesign/core/Table';",
      "import {cloneElement, isValidElement} from 'react';",
      "import {useIcon, type IconName, type IconProps} from '@astryxdesign/core/Icon';",
      "import {Other} from 'lucide-react';",
    ]);
    expect(out).toContain("const XMarkIcon = coreIcon('close');");
    expect(out).toContain('const TrashIcon = PlaceholderIcon;');
    expect(out).toContain('const MagnifyingGlassIcon = PlaceholderIcon;');
    expect(out).toContain('const Grip = PlaceholderIcon;');
    expect(out).toContain(
      'export const A = () => <Table a={XMarkIcon} b={TrashIcon} c={MagnifyingGlassIcon} d={Grip} e={Other} />;',
    );
  });

  it('names its helpers around bindings the file already has', () => {
    const source = [
      "import {useIcon} from './hooks';",
      `import {XMarkIcon} from '${PKG}';`,
      'const PlaceholderIcon = 1;',
      'export const A = () => <XMarkIcon />;',
      '',
    ].join('\n');
    const {source: out} = coreTemplateIcons(
      source,
      {XMarkIcon: 'close'},
      REFERENCE,
    );
    expect(out).toContain("import {useIcon} from './hooks';");
    expect(out).toContain('useIcon as useIcon2');
    expect(out).toContain('const icon = useIcon2(name);');
    expect(() =>
      parse(out, {sourceType: 'module', plugins: ['jsx', 'typescript']}),
    ).not.toThrow();
  });

  it('with nothing to swap, only lowers the reference imports', () => {
    const source = "import {Table} from '@astryxdesign/core/Table';\n";
    expect(coreTemplateIcons(source, {}, REFERENCE)).toEqual({
      source,
      core: [],
    });
  });
});

describe('the reference data', () => {
  it("is the package's generated module, for exactly the exports bundled templates import", async () => {
    const generated = fs.readFileSync(
      path.join(SET_DIR, 'heroicons', 'heroicons.generated.js'),
      'utf-8',
    );
    /** @type {Map<string, {module: string, export: string}>} */
    const upstream = new Map();
    for (const match of generated.matchAll(
      /^export \{(\w+)(?: as (\w+))?\} from '([^']+)';$/gmu,
    )) {
      upstream.set(match[2] ?? match[1], {module: match[3], export: match[1]});
    }
    const used = new Set();
    for (const template of await discoverCoreTemplates()) {
      const source = fs.readFileSync(template.filePath, 'utf-8');
      if (!source.includes(PKG)) continue;
      const ast = parse(source, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      for (const node of ast.program.body) {
        if (node.type === 'ImportDeclaration' && node.source.value === PKG) {
          for (const specifier of node.specifiers) {
            used.add(specifier.imported.name);
          }
        }
      }
    }
    const reference = referenceIconSet();
    expect(reference.package).toBe(PKG);
    expect(reference.set).toBe('heroicons');
    // Regenerate assets/icons/reference-set.json from the package when this
    // fails: one entry per export a bundled template imports.
    expect(Object.fromEntries(reference.exports)).toEqual(
      Object.fromEntries(
        [...used].sort().map(name => [name, upstream.get(name)]),
      ),
    );
  }, 60_000);

  it('lowers every bundled template completely: nothing a project without the set prints imports it', async () => {
    for (const template of await discoverCoreTemplates()) {
      const lowered = lowerReferenceIcons(
        fs.readFileSync(template.filePath, 'utf-8'),
      );
      expect(lowered, template.dirName).not.toContain(`from '${PKG}'`);
    }
  }, 60_000);
});

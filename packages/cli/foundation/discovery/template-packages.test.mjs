// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  declaredPackages,
  importedPackages,
  packageOfSpecifier,
  templatePackageNeeds,
} from './template-packages.mjs';

/** @type {string | null} */
let tmpDir = null;

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, {recursive: true, force: true});
  tmpDir = null;
  delete process.env.npm_config_user_agent;
});

function makeTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-template-pkgs-'));
  return tmpDir;
}

/**
 * @param {string} dir
 * @param {object} pkg
 */
function writePackage(dir, pkg) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
}

/** A template shipped by a package that checked it against these ranges. */
function writeTemplatePackage(root, devDependencies) {
  const pkgDir = path.join(root, 'shipper');
  writePackage(pkgDir, {name: 'shipper', devDependencies});
  const file = path.join(pkgDir, 'templates', 'page.tsx');
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, '');
  return file;
}

describe('packageOfSpecifier', () => {
  it('names the package a bare specifier resolves from', () => {
    expect(packageOfSpecifier('recharts')).toBe('recharts');
    expect(packageOfSpecifier('@heroicons/react/24/outline')).toBe(
      '@heroicons/react',
    );
    expect(packageOfSpecifier('lodash/debounce')).toBe('lodash');
  });

  it('ignores paths, builtins, schemes, subpath imports, and path aliases', () => {
    for (const specifier of [
      './local',
      '../up',
      '/abs/file',
      'node:fs',
      'fs',
      'path/posix',
      'virtual:module',
      'https://esm.sh/react',
      '#internal',
      '@/lib/utils',
      '~/lib/utils',
    ]) {
      expect(packageOfSpecifier(specifier), specifier).toBeNull();
    }
  });
});

describe('importedPackages', () => {
  it('reads imports, type imports, side-effect imports, and re-exports', () => {
    const source = `
      import {useState} from 'react';
      import type {LucideIcon} from 'lucide-react';
      import 'some-polyfill';
      import {Card} from '@astryxdesign/core/Card';
      import {ArrowUpIcon} from '@heroicons/react/24/outline';
      import {StopIcon} from '@heroicons/react/24/solid';
      import helper from './helper';
      export {LineChart} from 'recharts';
      export * from 'charts-extra';
      export default function Page() { return <Card />; }
    `;
    expect(importedPackages(source)).toEqual([
      '@astryxdesign/core',
      '@heroicons/react',
      'charts-extra',
      'lucide-react',
      'react',
      'recharts',
      'some-polyfill',
    ]);
  });

  it('does not read import-like text in comments, strings, or JSX', () => {
    const source = `
      // import {x} from 'commented-out';
      /* export * from 'block-comment'; */
      const label = "Imported from 'csv-kit'";
      export default function Page() {
        return <p>Copied from "clipboard-kit"</p>;
      }
    `;
    expect(importedPackages(source)).toEqual([]);
  });

  it('names nothing for source that does not parse', () => {
    expect(importedPackages('import {')).toEqual([]);
  });
});

describe('declaredPackages', () => {
  it('unions every package.json from the start directory up, with their own names', () => {
    const root = makeTmpDir();
    writePackage(root, {
      name: 'workspace',
      devDependencies: {typescript: '^5'},
    });
    const app = path.join(root, 'apps', 'web');
    writePackage(app, {
      name: 'web',
      dependencies: {react: '^19'},
      peerDependencies: {'react-dom': '^19'},
      optionalDependencies: {fsevents: '^2'},
    });
    const src = path.join(app, 'src', 'pages');
    fs.mkdirSync(src, {recursive: true});

    const {declared, projectDir} = declaredPackages(src);
    expect(projectDir).toBe(app);
    for (const name of [
      'web',
      'workspace',
      'react',
      'react-dom',
      'fsevents',
      'typescript',
    ]) {
      expect(declared.has(name), name).toBe(true);
    }
  });

  it('has no project directory when no package.json is above it', () => {
    const root = makeTmpDir();
    // os.tmpdir() may itself sit under a package.json on some machines; only
    // assert what this function adds.
    const {declared} = declaredPackages(root);
    expect(declared.has('recharts')).toBe(false);
  });
});

describe('templatePackageNeeds', () => {
  const SOURCE = `
    import {Card} from '@astryxdesign/core/Card';
    import {ArrowUpIcon} from '@heroicons/react/24/outline';
    import {LineChart} from 'recharts';
    import {motion} from 'motion';
    import {useState} from 'react';
  `;

  it('names undeclared packages and installs each on the line its template was checked against', () => {
    const root = makeTmpDir();
    const templateFile = writeTemplatePackage(root, {
      '@heroicons/react': '^2.2.0',
      recharts: '~3.9.2',
      motion: 'catalog:',
    });
    const project = path.join(root, 'project');
    writePackage(project, {
      name: 'project',
      dependencies: {'@astryxdesign/core': '0.6.3', react: '^19.1.0'},
    });
    fs.writeFileSync(path.join(project, 'package-lock.json'), '{}');

    expect(
      templatePackageNeeds({
        source: SOURCE,
        templateFile,
        targetDir: path.join(project, 'src'),
        cwd: project,
      }),
    ).toEqual({
      missingPackages: ['@heroicons/react', 'motion', 'recharts'],
      installCommand: 'npm install @heroicons/react@2 motion recharts@3.9',
    });
  });

  it('pins a pre-1.0 range to its minor line and leaves unreadable ranges bare', () => {
    const root = makeTmpDir();
    const templateFile = writeTemplatePackage(root, {
      '@heroicons/react': '^0.19.1',
      recharts: '>=3 <5',
      motion: '12.4.0',
    });
    const project = path.join(root, 'project');
    writePackage(project, {
      name: 'project',
      dependencies: {'@astryxdesign/core': '*', react: '*'},
    });
    fs.writeFileSync(path.join(project, 'package-lock.json'), '{}');

    const {installCommand} = templatePackageNeeds({
      source: SOURCE,
      templateFile,
      targetDir: project,
      cwd: project,
    });
    expect(installCommand).toBe(
      'npm install @heroicons/react@0.19 motion@12.4 recharts',
    );
  });

  it("uses the project's package manager", () => {
    const root = makeTmpDir();
    const templateFile = writeTemplatePackage(root, {});
    const cases = [
      ['pnpm-lock.yaml', 'pnpm add'],
      ['yarn.lock', 'yarn add'],
      ['bun.lock', 'bun add'],
      ['package-lock.json', 'npm install'],
    ];
    for (const [lockfile, prefix] of cases) {
      const project = path.join(root, lockfile);
      writePackage(project, {
        name: 'p',
        dependencies: {'@astryxdesign/core': '*', react: '*'},
      });
      fs.writeFileSync(path.join(project, lockfile), '');
      const {installCommand} = templatePackageNeeds({
        source: SOURCE,
        templateFile,
        targetDir: project,
        cwd: project,
      });
      expect(installCommand).toBe(`${prefix} @heroicons/react motion recharts`);
    }
  });

  it('reports nothing when the project, or a workspace above it, declares every import', () => {
    const root = makeTmpDir();
    const templateFile = writeTemplatePackage(root, {});
    writePackage(root, {
      name: 'workspace',
      devDependencies: {
        '@heroicons/react': '^2',
        recharts: '^3',
        motion: '^12',
      },
    });
    const app = path.join(root, 'apps', 'web');
    writePackage(app, {
      name: 'web',
      dependencies: {'@astryxdesign/core': '*', react: '*'},
    });

    expect(
      templatePackageNeeds({
        source: SOURCE,
        templateFile,
        targetDir: app,
        cwd: root,
      }),
    ).toEqual({missingPackages: [], installCommand: null});
  });

  it('changes into the project first when its package.json is not in cwd', () => {
    const root = makeTmpDir();
    const templateFile = writeTemplatePackage(root, {});
    fs.writeFileSync(path.join(root, 'pnpm-lock.yaml'), '');
    const app = path.join(root, 'apps', 'my web');
    writePackage(app, {
      name: 'web',
      dependencies: {'@astryxdesign/core': '*', react: '*', motion: '*'},
    });

    const {installCommand} = templatePackageNeeds({
      source: SOURCE,
      templateFile,
      targetDir: path.join(app, 'src'),
      cwd: root,
    });
    // pnpm: the lockfile above decides the package manager, and the install
    // lands in the package that will import them.
    expect(installCommand).toBe(
      `cd ${JSON.stringify(path.join('apps', 'my web'))} && pnpm add @heroicons/react recharts`,
    );
  });
});

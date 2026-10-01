// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx template <name> <path>` names the packages the scaffolded file
 * imports that the project does not list, with the command that installs them —
 * in the `template.copy` data and in the text, which projects the same fields —
 * and `astryx build` marks the templates it recommends the same way.
 *
 * Each test stands up a consumer project under the OS temp dir, so no
 * package.json above it (such as this repository's) declares anything.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {template} from './template.mjs';
import {build} from '../build/build.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

/** This repository's Core, linked into a consumer that needs it installed. */
const CORE_DIR = fileURLToPath(new URL('../../../core', import.meta.url));

/** What a fresh Vite + Astryx project lists. */
const BASE_DEPENDENCIES = {
  '@astryxdesign/core': '0.6.3',
  '@astryxdesign/theme-neutral': '0.6.3',
  '@stylexjs/stylex': '^0.19.1',
  react: '^19.1.0',
  'react-dom': '^19.1.0',
};

/** @type {string} */
let project;

/** @param {Record<string, string>} [extra] */
function writeProject(extra = {}) {
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({
      name: 'consumer',
      private: true,
      dependencies: {...BASE_DEPENDENCIES, ...extra},
    }),
  );
}

beforeEach(() => {
  project = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-template-deps-'));
  writeProject();
  fs.writeFileSync(path.join(project, 'package-lock.json'), '{}');
});

afterEach(() => {
  fs.rmSync(project, {recursive: true, force: true});
});

describe('template copy names the packages a scaffold needs', () => {
  it('names the undeclared packages the written file imports, and the npm line that installs them', async () => {
    const result = await template('dashboard', {
      targetPath: 'src/pages/dashboard',
      cwd: project,
    });
    expect(result.type).toBe('template.copy');
    const data =
      /** @type {import('./template.type.mjs').TemplateCopyResponse['data']} */ (
        result.data
      );
    expect(data.missingPackages).toEqual(['@heroicons/react', 'recharts']);
    // Pinned to the major line the CLI checks its templates against.
    expect(data.installCommand).toMatch(
      /^npm install @heroicons\/react@\d+ recharts@\d+$/,
    );
    // The file is still written: it is the starter the caller asked for.
    const written = fs.readFileSync(
      path.join(project, 'src/pages/dashboard/page.tsx'),
      'utf-8',
    );
    for (const name of data.missingPackages)
      expect(written).toContain(`from '${name}`);
  });

  it('reports nothing when the project already lists every import (the unchanged path)', async () => {
    writeProject({'@heroicons/react': '^2.2.0', recharts: '^3.9.2'});
    const result = await template('dashboard', {
      targetPath: 'src/pages/dashboard',
      cwd: project,
    });
    expect(result.data).toEqual({
      template: 'dashboard',
      outputDir: 'src/pages/dashboard',
      fileName: 'page.tsx',
      filesCopied: 1,
      missingPackages: [],
      installCommand: null,
    });
  });

  it('reports nothing for a template that imports only Astryx', async () => {
    const result = await template('blank', {
      targetPath: 'src/app',
      cwd: project,
    });
    expect(result.data).toMatchObject({
      missingPackages: [],
      installCommand: null,
    });
  });

  it("installs with the project's package manager, from where the command runs", async () => {
    fs.rmSync(path.join(project, 'package-lock.json'));
    fs.writeFileSync(path.join(project, 'pnpm-lock.yaml'), '');
    const app = path.join(project, 'apps', 'web');
    fs.mkdirSync(app, {recursive: true});
    fs.writeFileSync(
      path.join(app, 'package.json'),
      JSON.stringify({name: 'web'}),
    );
    const result = await template('dashboard', {
      targetPath: 'apps/web/src',
      cwd: project,
    });
    expect(result.data).toMatchObject({
      missingPackages: ['@heroicons/react', 'recharts'],
    });
    expect(/** @type {any} */ (result.data).installCommand).toMatch(
      /^cd apps[/\\]web && pnpm add @heroicons\/react@\d+ recharts@\d+$/,
    );
  });
});

describe('template copy text projects the same fields as --json', () => {
  it('prints the warning with missingPackages and installCommand as the JSON carries them', async () => {
    const json = await runCli(
      ['--json', 'template', 'dashboard', 'one'],
      project,
    );
    expect(json.status).toBe(0);
    const {data} = JSON.parse(json.stdout);

    const human = await runCli(['template', 'dashboard', 'two'], project);
    expect(human.status).toBe(0);
    const lines = human.stdout.split('\n');
    expect(lines).toContain('Copied template to two/page.tsx');
    expect(human.stdout).toMatch(
      /^\[warn\] The template imports packages this project does not list\./m,
    );
    const field = name =>
      lines.find(line => line.startsWith(`${name}:`))?.replace(/^\w+:\s+/, '');
    expect(field('missingPackages')).toBe(data.missingPackages.join(', '));
    expect(field('installCommand')).toBe(data.installCommand);
  });

  it('prints only the copy line when nothing is missing', async () => {
    writeProject({'@heroicons/react': '^2.2.0', recharts: '^3.9.2'});
    const human = await runCli(['template', 'dashboard', 'dest'], project);
    expect(human.status).toBe(0);
    expect(human.stdout).toContain('Copied template to dest/page.tsx');
    expect(human.stdout).not.toMatch(/\[warn\]|missingPackages|installCommand/);
  });
});

describe('build marks the templates it recommends', () => {
  // Build searches Core's components, so the consumer has it installed.
  beforeEach(() => {
    const link = path.join(project, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(path.dirname(link), {recursive: true});
    fs.symlinkSync(CORE_DIR, link, 'dir');
  });

  it('gives the start and each alternative the fields scaffolding it would report', async () => {
    const kit = await build('analytics dashboard', {cwd: project});
    if (kit.type !== 'build.kit' || !kit.data.start)
      throw new Error('expected a start');
    const {start} = kit.data;
    expect(start.missingPackages.length).toBeGreaterThan(0);
    for (const entry of [start, ...start.alternatives]) {
      const copy = await template(entry.name, {
        type: 'page',
        targetPath: `out/${entry.name}`,
        cwd: project,
      });
      expect(copy.data).toMatchObject({
        missingPackages: entry.missingPackages,
        installCommand: entry.installCommand,
      });
    }
  }, 30_000);

  it('clears the mark once the project lists the packages', async () => {
    writeProject({
      '@heroicons/react': '^2.2.0',
      recharts: '^3.9.2',
      'lucide-react': '^1.18.0',
    });
    const kit = await build('analytics dashboard', {cwd: project});
    if (kit.type !== 'build.kit' || !kit.data.start)
      throw new Error('expected a start');
    expect(kit.data.start).toMatchObject({
      missingPackages: [],
      installCommand: null,
    });
  }, 30_000);
});

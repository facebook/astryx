// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Real package-boundary coverage for integration authoring. Authors a
 * provider through the CLI, packs it, installs the tarball into a separate
 * no-config consumer, then exercises the contributed docs and source theme.
 */

import {afterEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {runCli} from '../../../test-utils/run-cli.mjs';

let rootDir;

function parseEnvelope(stdout) {
  return JSON.parse(stdout.trim());
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function runNpm(args, cwd) {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf-8',
    timeout: 60_000,
    env: {
      ...process.env,
      npm_config_audit: 'false',
      npm_config_fund: 'false',
      npm_config_update_notifier: 'false',
      npm_config_cache: path.join(rootDir, '.npm-cache'),
    },
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `npm ${args[0]} failed: ${result.error?.message ?? result.stderr.trim()}`,
    );
  }
  return result.stdout;
}

afterEach(() => {
  if (rootDir) fs.rmSync(rootDir, {recursive: true, force: true});
  rootDir = undefined;
});

describe('integration authoring across a real npm package boundary', () => {
  it('authors, packs, installs, discovers, copies, and builds a theme with guides', async () => {
    rootDir = fs.mkdtempSync(
      path.join(process.cwd(), '.astryx-theme-provider-consumer-'),
    );
    const providerDir = path.join(rootDir, 'provider');
    const consumerDir = path.join(rootDir, 'consumer');
    const packDir = path.join(rootDir, 'packed');
    fs.mkdirSync(providerDir);
    fs.mkdirSync(consumerDir);
    fs.mkdirSync(packDir);

    writeJson(path.join(providerDir, 'package.json'), {
      name: '@acme/brand-integration',
      version: '1.0.0',
      type: 'module',
      files: ['README.md'],
    });
    fs.writeFileSync(
      path.join(providerDir, 'README.md'),
      '# Acme brand integration\n',
    );

    for (const [kind, name] of [
      ['theme', 'ocean'],
      ['doc', 'brand-theme'],
      ['doc', 'theme-migration'],
    ]) {
      const added = await runCli(
        ['integration', 'add', kind, name, '--json'],
        providerDir,
      );
      expect(added.status, added.stderr).toBe(0);
      expect(parseEnvelope(added.stdout)).toMatchObject({
        type: 'integration.add',
        data: {kind, name, written: true, dryRun: false},
      });
    }

    const themeDir = path.join(providerDir, 'themes', 'ocean');
    const paletteConfig = path.join(providerDir, 'palette.config.json');
    writeJson(paletteConfig, {
      modeStrategy: 'light-and-dark',
      stops: [20, 50, 80],
      families: [{id: 'blue', seed: '#0074e2'}],
    });
    const paletteOutput = path.join(
      'themes',
      'ocean',
      'tokens',
      'ocean.palette.ts',
    );
    const generatedPalette = await runCli(
      [
        'theme',
        'palette',
        'generate',
        'palette.config.json',
        '--out',
        paletteOutput,
        '--json',
      ],
      providerDir,
    );
    expect(generatedPalette.status, generatedPalette.stderr).toBe(0);
    expect(parseEnvelope(generatedPalette.stdout)).toMatchObject({
      type: 'theme.palette.generate',
      data: {
        output: paletteOutput,
        receipt: path.join(
          'themes',
          'ocean',
          'tokens',
          'ocean.palette.receipt.json',
        ),
        written: true,
      },
    });

    fs.writeFileSync(
      path.join(themeDir, 'oceanTheme.ts'),
      `import {defineTheme} from '@astryxdesign/core/theme';
import {palette} from './tokens/ocean.palette';

export const oceanTheme = defineTheme({
  name: 'ocean',
  tokens: {'--color-accent': palette.blue.light[50]},
});
`,
    );
    const catalogFile = path.join(providerDir, 'themes', 'manifest.json');
    const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
    catalog.themes[0].files.push(
      'tokens/ocean.palette.ts',
      'tokens/ocean.palette.receipt.json',
    );
    writeJson(catalogFile, catalog);

    const providerPackage = JSON.parse(
      fs.readFileSync(path.join(providerDir, 'package.json'), 'utf-8'),
    );
    expect(providerPackage.files).toEqual([
      'README.md',
      'themes',
      'astryx.integration.mjs',
      'docs',
    ]);

    const checked = await runCli(
      ['integration', 'pack', '--check', '--json'],
      providerDir,
    );
    expect(checked.status, checked.stderr).toBe(0);
    const checkReceipt = parseEnvelope(checked.stdout);
    expect(checkReceipt).toMatchObject({
      type: 'integration.pack-check',
      data: {
        name: '@acme/brand-integration',
        packable: true,
        contributions: {
          local: {
            themes: [{slug: 'ocean', exportName: 'oceanTheme'}],
            docs: ['brand-theme', 'theme-migration'],
          },
        },
      },
    });
    expect(checkReceipt.data.contributions.packed).toEqual(
      checkReceipt.data.contributions.local,
    );

    const packOutput = JSON.parse(
      runNpm(
        ['pack', '--json', '--silent', `--pack-destination=${packDir}`],
        providerDir,
      ),
    );
    const tarball = path.join(packDir, packOutput[0].filename);
    expect(fs.existsSync(tarball)).toBe(true);

    writeJson(path.join(consumerDir, 'package.json'), {
      name: 'theme-consumer',
      version: '1.0.0',
      private: true,
      type: 'module',
    });
    runNpm(
      [
        'install',
        '--ignore-scripts',
        '--offline',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        tarball,
      ],
      consumerDir,
    );

    const alternateProviderDir = path.join(rootDir, 'alternate-provider');
    fs.mkdirSync(alternateProviderDir);
    writeJson(path.join(alternateProviderDir, 'package.json'), {
      name: '@acme/alternate-brand',
      version: '1.0.0',
      type: 'module',
      files: [],
    });
    const alternateAdded = await runCli(
      ['integration', 'add', 'theme', 'ocean', '--json'],
      alternateProviderDir,
    );
    expect(alternateAdded.status, alternateAdded.stderr).toBe(0);
    const alternatePack = JSON.parse(
      runNpm(
        ['pack', '--json', '--silent', `--pack-destination=${packDir}`],
        alternateProviderDir,
      ),
    );
    runNpm(
      [
        'install',
        '--ignore-scripts',
        '--offline',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        path.join(packDir, alternatePack[0].filename),
      ],
      consumerDir,
    );

    const installedDir = path.join(
      consumerDir,
      'node_modules',
      '@acme',
      'brand-integration',
    );
    expect(fs.lstatSync(installedDir).isSymbolicLink()).toBe(false);
    const alternateInstalledDir = path.join(
      consumerDir,
      'node_modules',
      '@acme',
      'alternate-brand',
    );
    expect(fs.lstatSync(alternateInstalledDir).isSymbolicLink()).toBe(false);

    // The consumer installs both providers from tarballs. Link this checkout's
    // Core package as the consumer's normal app dependency so the copied source
    // can resolve the same peer it would get from `npm install @astryxdesign/core`.
    const coreScope = path.join(consumerDir, 'node_modules', '@astryxdesign');
    const coreLink = path.join(coreScope, 'core');
    fs.mkdirSync(coreScope, {recursive: true});
    fs.symlinkSync(
      path.join(process.cwd(), 'packages', 'core'),
      coreLink,
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    fs.rmSync(providerDir, {recursive: true, force: true});
    fs.rmSync(alternateProviderDir, {recursive: true, force: true});

    const consumerPackageFile = path.join(consumerDir, 'package.json');
    const consumerPackage = JSON.parse(
      fs.readFileSync(consumerPackageFile, 'utf-8'),
    );
    const providerSpec =
      consumerPackage.dependencies['@acme/brand-integration'];
    delete consumerPackage.dependencies['@acme/brand-integration'];
    writeJson(consumerPackageFile, consumerPackage);
    const undeclared = await runCli(
      ['theme', 'list', '--package', '@acme/brand-integration', '--json'],
      consumerDir,
    );
    expect(undeclared.status, undeclared.stderr).toBe(0);
    expect(parseEnvelope(undeclared.stdout).data).toEqual([]);

    consumerPackage.devDependencies = {
      '@acme/brand-integration': providerSpec,
    };
    writeJson(consumerPackageFile, consumerPackage);
    const devLinked = await runCli(
      ['theme', 'list', '--package', '@acme/brand-integration', '--json'],
      consumerDir,
    );
    expect(devLinked.status, devLinked.stderr).toBe(0);
    expect(parseEnvelope(devLinked.stdout).data).toContainEqual(
      expect.objectContaining({
        slug: 'ocean',
        package: '@acme/brand-integration',
      }),
    );

    delete consumerPackage.devDependencies;
    consumerPackage.optionalDependencies = {
      '@acme/brand-integration': providerSpec,
    };
    writeJson(consumerPackageFile, consumerPackage);
    const optionalLinked = await runCli(
      ['theme', 'list', '--package', '@acme/brand-integration', '--json'],
      consumerDir,
    );
    expect(optionalLinked.status, optionalLinked.stderr).toBe(0);
    expect(parseEnvelope(optionalLinked.stdout).data).toContainEqual(
      expect.objectContaining({
        slug: 'ocean',
        package: '@acme/brand-integration',
      }),
    );

    delete consumerPackage.optionalDependencies;
    consumerPackage.dependencies['@acme/brand-integration'] = providerSpec;
    writeJson(consumerPackageFile, consumerPackage);

    const listed = await runCli(['theme', 'list', '--json'], consumerDir);
    expect(listed.status, listed.stderr).toBe(0);
    expect(parseEnvelope(listed.stdout).data).toContainEqual(
      expect.objectContaining({
        slug: 'ocean',
        package: '@acme/brand-integration',
      }),
    );

    for (const topic of ['brand-theme', 'theme-migration']) {
      const guide = await runCli(['docs', topic, '--json'], consumerDir);
      expect(guide.status, guide.stderr).toBe(0);
      expect(parseEnvelope(guide.stdout).data).toMatchObject({name: topic});
    }

    const ambiguous = await runCli(
      ['theme', 'add', 'ocean', 'src/themes/ambiguous', '--json'],
      consumerDir,
    );
    expect(ambiguous.status).not.toBe(0);
    expect(parseEnvelope(ambiguous.stdout)).toMatchObject({
      code: 'ERR_AMBIGUOUS_THEME',
    });

    const target = path.join('src', 'themes', 'acme-ocean');
    const copied = await runCli(
      [
        'theme',
        'add',
        'ocean',
        target,
        '--package',
        '@acme/brand-integration',
        '--json',
      ],
      consumerDir,
    );
    expect(copied.status, copied.stderr).toBe(0);
    expect(parseEnvelope(copied.stdout)).toMatchObject({
      type: 'theme.add',
      data: {
        slug: 'ocean',
        package: '@acme/brand-integration',
        outputDir: target,
        files: [
          'oceanTheme.ts',
          'tokens/ocean.palette.ts',
          'tokens/ocean.palette.receipt.json',
        ],
      },
    });
    expect(
      fs.readFileSync(
        path.join(consumerDir, target, 'tokens', 'ocean.palette.ts'),
        'utf-8',
      ),
    ).toContain('export const palette');
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(
            consumerDir,
            target,
            'tokens',
            'ocean.palette.receipt.json',
          ),
          'utf-8',
        ),
      ).recipe,
    ).toBe('astryx-oklch-v1');

    const copiedEntry = path.join(target, 'oceanTheme.ts');
    const built = await runCli(
      ['theme', 'build', copiedEntry, '--json'],
      consumerDir,
    );
    expect(built.status, `${built.stdout}\n${built.stderr}`).toBe(0);
    const buildReceipt = parseEnvelope(built.stdout);
    expect(buildReceipt).toMatchObject({
      type: 'theme.build',
      data: {name: 'ocean'},
    });
    for (const output of Object.values(buildReceipt.data.outputs)) {
      expect(fs.existsSync(path.join(consumerDir, output))).toBe(true);
    }

    const duplicate = await runCli(
      [
        'theme',
        'add',
        'ocean',
        target,
        '--package',
        '@acme/brand-integration',
        '--json',
      ],
      consumerDir,
    );
    expect(duplicate.status).not.toBe(0);
    expect(parseEnvelope(duplicate.stdout)).toMatchObject({
      code: 'ERR_FILE_EXISTS',
    });
    const overwritten = await runCli(
      [
        'theme',
        'add',
        'ocean',
        target,
        '--package',
        '@acme/brand-integration',
        '--overwrite',
        '--json',
      ],
      consumerDir,
    );
    expect(overwritten.status, overwritten.stderr).toBe(0);
    expect(parseEnvelope(overwritten.stdout).type).toBe('theme.add');

    fs.rmSync(
      path.join(installedDir, 'themes', 'ocean', 'tokens', 'ocean.palette.ts'),
    );
    const corruptedInstall = await runCli(
      [
        'theme',
        'add',
        'ocean',
        'src/themes/corrupted',
        '--package',
        '@acme/brand-integration',
        '--json',
      ],
      consumerDir,
    );
    expect(corruptedInstall.status).not.toBe(0);
    expect(parseEnvelope(corruptedInstall.stdout)).toMatchObject({
      code: 'ERR_THEME_INVALID',
      error: expect.stringContaining('ocean.palette.ts'),
    });
  }, 120_000);
});

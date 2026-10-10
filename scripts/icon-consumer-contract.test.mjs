// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-consumer-contract.test.mjs
 * @input Approved Icon/theme exports and independent external-consumer fixtures
 * @output Source/emitted declaration checks and browser-free emitted default reads
 * @position Node contract test; never builds Core, emits files, or changes dependencies
 *
 * Run directly with --source-only while authoring. --emitted-only and the normal
 * Vitest lane require a fresh owner build. Consumer files exist only in memory,
 * inside Core's package scope so TypeScript uses its real public export map.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const core = path.join(root, 'packages/core');
const fixtureDir = path.join(root, 'scripts/fixtures/icon-capabilities');
const direct =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === filename;
const {describe, it} = direct
  ? await import('node:test')
  : await import('vitest');
const sourceOnly = direct && process.argv.includes('--source-only');
const emittedOnly = direct && process.argv.includes('--emitted-only');
assert.ok(
  !(sourceOnly && emittedOnly),
  'Choose one consumer lane, or neither for both.',
);

const fixtures = [
  'icon-legacy.fixture.tsx',
  'icon-application-exact.fixture.tsx',
  'icon-application-range.fixture.tsx',
  'icon-theme-local.fixture.tsx',
];

function checkConsumer(fixture, source) {
  const consumer = path.join(core, `__icon-consumer-${fixture}`);
  const text = readFileSync(path.join(fixtureDir, fixture), 'utf8');
  const options = {
    strict: true,
    skipLibCheck: false,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    types: ['react', 'node'],
    ...(source ? {customConditions: ['source']} : {}),
  };
  // A fresh host and program per fixture prevent augmentation/cache leakage.
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.readFile = file => (file === consumer ? text : readFile(file));
  host.fileExists = file => file === consumer || fileExists(file);
  host.getSourceFile = (
    file,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) =>
    file === consumer
      ? ts.createSourceFile(
          file,
          text,
          languageVersion,
          true,
          ts.ScriptKind.TSX,
        )
      : getSourceFile(
          file,
          languageVersion,
          onError,
          shouldCreateNewSourceFile,
        );

  for (const [specifier, entry] of [
    ['@astryxdesign/core/Icon', 'Icon/index'],
    ['@astryxdesign/core/theme', 'theme/index'],
  ]) {
    const resolved = ts.resolveModuleName(
      specifier,
      consumer,
      options,
      host,
    ).resolvedModule;
    assert.equal(
      resolved?.resolvedFileName,
      path.join(
        core,
        source ? 'src' : 'dist',
        `${entry}${source ? '.ts' : '.d.ts'}`,
      ),
      `${fixture} must resolve ${specifier} through the fresh package's ${source ? 'source' : 'declaration'} export`,
    );
  }

  const program = ts.createProgram([consumer], options, host);
  return ts.getPreEmitDiagnostics(program).map(diagnostic => {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    );
    const location =
      diagnostic.file && diagnostic.start !== undefined
        ? ` (${path.relative(root, diagnostic.file.fileName)}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1})`
        : '';
    return `TS${diagnostic.code}: ${message}${location}`;
  });
}

function checkEmittedRuntime() {
  return execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import assert from 'node:assert/strict';
    import React from 'react';
    import {
      defineAdaptiveIcon, defineIconCapabilities, getApplicationIconCapabilities,
      getIcon, getExtendedIcon, registerIcons,
    } from '@astryxdesign/core/Icon';
    import {defineTheme} from '@astryxdesign/core/theme';

    assert.equal(typeof window, 'undefined');
    assert.equal(typeof document, 'undefined');
    const baseline = getApplicationIconCapabilities();
    assert.deepEqual(baseline.appearances, []);
    assert.deepEqual(baseline.weights, {values: [], ranges: []});
    assert.deepEqual(Object.keys(baseline.sizes).sort(), ['lg', 'md', 'sm', 'xsm']);

    const authored = {
      sizes: {compact: {default: '14px'}},
      appearances: ['outline', 'filled'],
      weights: {values: [400, 600]},
    };
    const contract = defineIconCapabilities(authored);
    assert.notEqual(contract, authored);
    assert.ok(Object.isFrozen(contract));
    assert.ok(Object.isFrozen(contract.sizes.compact));
    assert.ok(Object.isFrozen(contract.appearances));
    assert.ok(Object.isFrozen(contract.weights.values));
    authored.sizes.compact.default = '18px';
    authored.appearances.push('duotone');
    authored.weights.values.push(500);
    assert.equal(contract.sizes.compact.default, '14px');
    assert.deepEqual(contract.appearances, ['outline', 'filled']);
    assert.deepEqual(contract.weights.values, [400, 600]);

    const defaultNode = React.createElement('svg', {'data-artwork': 'default'});
    const alternate = React.createElement('svg', {'data-artwork': 'alternate'});
    const tree = {
      default: {default: defaultNode, byWeight: {600: alternate}},
      bySize: {compact: {default: alternate}},
      byAppearance: {filled: {default: alternate}},
    };
    const source = defineAdaptiveIcon(contract, tree);
    assert.equal(source.capabilities, contract);
    assert.ok(Object.isFrozen(source));
    assert.ok(Object.isFrozen(source.tree));
    assert.ok(Object.isFrozen(source.tree.default));
    tree.default.default = alternate;
    assert.equal(source.tree.default.default, defaultNode);

    const theme = defineTheme({
      name: 'consumer-runtime-adaptive',
      iconCapabilities: {
        contract,
        sizeOverrides: {compact: '16px'},
        presentation: {
          default: {appearance: 'filled', weight: 600},
          bySize: {compact: {weight: 400}},
        },
      },
      icons: {search: source, 'consumer:mark': source, close: alternate},
    });
    // The theme read view retains supplied defaults; public reads apply theme defaults.
    assert.equal(theme.icons.search, defaultNode);
    assert.equal(theme.icons.close, alternate);
    assert.equal(getIcon('search', theme), alternate);
    assert.equal(getIcon('search', theme.name), alternate);
    assert.equal(getExtendedIcon('consumer:mark', defaultNode, theme), alternate);
    assert.equal(getExtendedIcon('consumer:missing', alternate, theme), alternate);
    assert.ok(React.isValidElement(theme.icons.search));
    assert.equal(theme.__iconSources.search, source);
    assert.notEqual(theme.icons.search, theme.__iconSources.search);
    assert.ok(Object.isFrozen(theme.__iconSources));
    assert.ok(Object.isFrozen(theme.__iconContracts));
    assert.equal(theme.__iconContracts.length, 1);
    assert.equal(theme.__iconContracts[0], contract);
    assert.equal(theme.iconCapabilities.contract, contract);
    assert.ok(Object.isFrozen(theme.iconCapabilities));
    assert.ok(Object.isFrozen(theme.iconCapabilities.presentation.bySize));

    const child = defineTheme({name: 'consumer-runtime-inherit', extends: theme});
    assert.equal(child.icons.search, defaultNode);
    assert.equal(child.__iconSources.search, source);
    assert.equal(child.__iconContracts[0], contract);
    const cleared = defineTheme({
      name: 'consumer-runtime-clear', extends: theme,
      iconCapabilities: {contract, sizeOverrides: {compact: null}, presentation: null},
    });
    assert.equal(cleared.iconCapabilities.presentation, null);
    assert.equal(cleared.iconCapabilities.sizeOverrides.compact, null);
    assert.equal(getIcon('search', cleared), defaultNode);

    const range = defineIconCapabilities({weights: {range: {min: 100, max: 700}}});
    function SuppliedArtwork({weight = 410}) {
      return React.createElement('svg', {'data-weight': weight});
    }
    const parameterized = defineAdaptiveIcon(range, {
      default: {render: SuppliedArtwork, weightRange: {min: 100, max: 700}},
    });
    const rangedTheme = defineTheme({
      name: 'consumer-runtime-range',
      iconCapabilities: {contract: range, presentation: {default: {weight: 425.5}}},
      icons: {search: parameterized},
    });
    const rangedDefault = rangedTheme.icons.search;
    assert.ok(React.isValidElement(rangedDefault));
    assert.equal(rangedDefault.type, SuppliedArtwork);
    assert.equal(rangedDefault.props.weight, undefined);
    assert.equal(SuppliedArtwork(rangedDefault.props).props['data-weight'], 410);
    const rangedRead = getIcon('search', rangedTheme);
    assert.ok(React.isValidElement(rangedRead));
    assert.equal(rangedRead.type, SuppliedArtwork);
    assert.equal(rangedRead.props.weight, 425.5);
    assert.equal(SuppliedArtwork(rangedRead.props).props['data-weight'], 425.5);
    assert.equal(rangedTheme.__iconContracts[0], range);
    assert.equal(rangedTheme.__iconSources.search.capabilities, range);

    const application = getApplicationIconCapabilities(...theme.__iconContracts, ...rangedTheme.__iconContracts);
    assert.equal(application.sizes.compact.default, '14px');
    assert.deepEqual(application.appearances, ['filled', 'outline']);
    assert.deepEqual(application.weights.values, [400, 600]);
    assert.deepEqual(application.weights.ranges, [{min: 100, max: 700}]);
    assert.ok(Object.isFrozen(application));
    assert.ok(Object.isFrozen(application.weights.ranges[0]));
    assert.deepEqual(getApplicationIconCapabilities(), baseline);

    const fixedIcons = {search: defaultNode, 'consumer:fixed': alternate};
    const fixed = defineTheme({name: 'consumer-runtime-fixed', icons: fixedIcons});
    assert.equal(fixed.icons, fixedIcons);
    assert.equal(defineTheme({name: 'consumer-runtime-fixed-child', extends: fixed}).icons, fixedIcons);
    registerIcons(fixedIcons);
    assert.equal(getIcon('consumer:fixed'), alternate);
    assert.equal(getIcon('search'), defaultNode);
    assert.deepEqual(getApplicationIconCapabilities(), baseline);
    process.stdout.write('core-a-consumer-runtime-ok');
  `,
    ],
    {
      cwd: core,
      encoding: 'utf8',
      env: {...process.env, NODE_ENV: 'production'},
      timeout: 30_000,
      maxBuffer: 4 * 1024 * 1024,
    },
  );
}

describe('Core A public Icon consumer contract', () => {
  for (const source of emittedOnly
    ? [false]
    : sourceOnly
      ? [true]
      : [true, false]) {
    const lane = source ? 'source' : 'emitted declaration';
    for (const fixture of fixtures) {
      it(`${fixture} resolves only ${lane} exports`, () => {
        assert.deepEqual(checkConsumer(fixture, source), []);
      });
    }
    it(`augmentation remains isolated after both application programs (${lane})`, () => {
      // Compile the unaugmented program again after exact and range programs.
      assert.deepEqual(checkConsumer('icon-legacy.fixture.tsx', source), []);
    });
  }
  if (!sourceOnly) {
    it('authors, normalizes, and reads emitted adaptive defaults without browser globals', () => {
      assert.equal(checkEmittedRuntime(), 'core-a-consumer-runtime-ok');
    });
  }
});

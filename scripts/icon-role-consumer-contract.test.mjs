// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-consumer-contract.test.mjs
 * @input Public Icon/theme exports and isolated role/state consumer fixtures
 * @output Independent source/emitted TypeScript contract checks without file emission
 * @position Consumer evidence only; never builds Core or proves component enrollment
 *
 * --source-only is safe during authoring. --emitted-only and the normal Vitest
 * lane require a fresh owner build. Every fixture gets its own virtual consumer,
 * compiler host and program: augmentation never leaks to a different consumer.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const core = path.join(root, 'packages/core');
const fixtureDir = path.join(root, 'scripts/fixtures/icon-roles');
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
  'icon-role-unaugmented.fixture.tsx',
  'icon-role-source-only.fixture.tsx',
  'icon-role-finite.fixture.tsx',
  'icon-role-broad-state.fixture.tsx',
];

function checkConsumer(fixture, source) {
  const consumer = path.join(core, `__icon-role-consumer-${fixture}`);
  const shared = readFileSync(
    path.join(fixtureDir, 'icon-role-public-contract.fixture.tsx'),
    'utf8',
  );
  const text = `${shared}\n${readFileSync(path.join(fixtureDir, fixture), 'utf8')}`;
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
      `${fixture} must resolve ${specifier} through the package's ${source ? 'source' : 'declaration'} export`,
    );
  }
  for (const internal of [
    'iconResolution',
    'componentIconRoles',
    'componentIconSlot',
    'ComponentIconContext',
    'IconDefaultSizeContext',
  ]) {
    assert.equal(
      ts.resolveModuleName(
        `@astryxdesign/core/Icon/${internal}`,
        consumer,
        options,
        host,
      ).resolvedModule,
      undefined,
      `${internal} must not become a public package subpath (${source ? 'source' : 'declaration'})`,
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

describe('public component Icon role/state consumer contract', () => {
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
    it(`unaugmented slots and states remain closed after augmented programs (${lane})`, () => {
      assert.deepEqual(
        checkConsumer('icon-role-unaugmented.fixture.tsx', source),
        [],
      );
    });
  }
});

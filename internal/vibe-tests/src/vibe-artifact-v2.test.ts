// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {afterAll, describe, expect, it, vi} from 'vitest';
import {materializeStaticArtifactFixtureV2} from './static-artifact-fixture';
import {
  EMPTY_TREE_SHA256_V2,
  VibeArtifactValidationError,
  parseVibeArtifactV2,
  sha256TreeV2,
} from './vibe-artifact-v2';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(HERE, '..', 'artifact-fixtures', 'v2');
const SCHEMA_ROOT = path.resolve(HERE, '..', 'schema');
const TEMPORARY_DIRECTORIES: string[] = [];

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, relativePath), 'utf8'));
}

function readSchema(filename: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(path.join(SCHEMA_ROOT, filename), 'utf8'),
  ) as Record<string, unknown>;
}

const schemaValidator = new Ajv2020({
  allErrors: true,
  strict: true,
  strictRequired: false,
});
addFormats(schemaValidator);
schemaValidator.addSchema(readSchema('execution-provenance-v1.schema.json'));
const validateArtifactSchema = schemaValidator.compile(
  readSchema('vibe-artifact-v2.schema.json'),
);

function validArtifactInput(): Record<string, unknown> {
  return structuredClone(readJson('static-valid/artifact.json')) as Record<
    string,
    unknown
  >;
}

function producer(input: Record<string, unknown>): Record<string, unknown> {
  return input.producer as Record<string, unknown>;
}

function view(input: Record<string, unknown>): Record<string, unknown> {
  return input.view as Record<string, unknown>;
}

function integrity(input: Record<string, unknown>): Record<string, unknown> {
  return input.integrity as Record<string, unknown>;
}

function temporaryDirectory(prefix = 'vibe-artifact-v2-'): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  TEMPORARY_DIRECTORIES.push(directory);
  return directory;
}

function copyValidFixture(): {bundle: string; parent: string} {
  const parent = temporaryDirectory();
  const bundle = path.join(parent, 'bundle');
  fs.cpSync(path.join(FIXTURES, 'static-valid', 'bundle'), bundle, {
    recursive: true,
  });
  return {bundle, parent};
}

afterAll(() => {
  for (const directory of TEMPORARY_DIRECTORIES) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('VibeArtifactV2', () => {
  it.each(['static-valid/artifact.json', 'static-broken-build/artifact.json'])(
    'validates %s against the checked JSON Schema',
    relativePath => {
      expect(validateArtifactSchema(readJson(relativePath))).toBe(true);
      expect(validateArtifactSchema.errors).toBeNull();
    },
  );

  it.each(['invalid/traversal.json', 'invalid/missing-digest.json'])(
    'rejects %s through the checked JSON Schema',
    relativePath => {
      expect(validateArtifactSchema(readJson(relativePath))).toBe(false);
      expect(validateArtifactSchema.errors).not.toBeNull();
    },
  );

  it('parses a complete static artifact with independent delivery identity', () => {
    const artifact = parseVibeArtifactV2(validArtifactInput());

    expect(artifact.view.kind).toBe('static');
    expect(artifact.producer.deliveryMode).toBe('static-html');
    expect(artifact.states?.map(state => state.name)).toEqual([
      'filtered',
      'details',
    ]);
  });

  it.each(['react-nobuild', 'vanilla-html'])(
    'allows %s to use the same static view recipe',
    deliveryMode => {
      const input = validArtifactInput();
      producer(input).deliveryMode = deliveryMode;

      const artifact = parseVibeArtifactV2(input);

      expect(artifact.producer.deliveryMode).toBe(deliveryMode);
      expect(artifact.view.kind).toBe('static');
    },
  );

  it.each([
    [
      'build',
      'react-build',
      {
        kind: 'build',
        cwd: 'site',
        argv: ['pnpm', 'build'],
        output: 'site/dist',
        entry: 'site/dist/index.html',
        install: {
          argv: ['pnpm', 'install', '--frozen-lockfile'],
          lockfile: 'site/pnpm-lock.yaml',
          frozen: true,
        },
      },
    ],
    [
      'serve',
      'preview-server',
      {
        kind: 'serve',
        cwd: 'site',
        argv: ['node', 'server.mjs'],
        readinessPath: '/ready',
      },
    ],
    [
      'url',
      'hosted-preview',
      {kind: 'url', url: 'https://example.com/vibe-fixture'},
    ],
  ])(
    'parses the %s view independently from %s',
    (kind, deliveryMode, recipe) => {
      const input = validArtifactInput();
      producer(input).deliveryMode = deliveryMode;
      input.view = recipe;

      const artifact = parseVibeArtifactV2(input);

      expect(artifact.view.kind).toBe(kind);
      expect(artifact.producer.deliveryMode).toBe(deliveryMode);
    },
  );

  it.each(['Static HTML', '-static', 'static_', 'A'.repeat(65)])(
    'rejects malformed delivery-mode identifier %j',
    deliveryMode => {
      const input = validArtifactInput();
      producer(input).deliveryMode = deliveryMode;

      expect(() => parseVibeArtifactV2(input)).toThrow(
        'must be a lowercase kebab-case identifier',
      );
    },
  );

  it('rejects traversal and missing digest fixtures before bundle access', () => {
    expect(() =>
      parseVibeArtifactV2(readJson('invalid/traversal.json')),
    ).toThrow('must be a canonical bundle-relative path without traversal');
    expect(() =>
      parseVibeArtifactV2(readJson('invalid/missing-digest.json')),
    ).toThrow('$.integrity.viewInput: must be an object');
  });

  it.each([
    [
      'absolute source root',
      (input: Record<string, unknown>) => {
        (input.source as Record<string, unknown>).root = '/site';
      },
      'must be relative to the bundle root',
    ],
    [
      'backslash entry',
      (input: Record<string, unknown>) => {
        view(input).entry = 'site\\index.html';
      },
      'must use POSIX separators',
    ],
    [
      'Windows-drive root',
      (input: Record<string, unknown>) => {
        (input.source as Record<string, unknown>).root = 'C:\\site';
      },
      'must be relative to the bundle root',
    ],
    [
      'entry outside static root',
      (input: Record<string, unknown>) => {
        view(input).entry = 'other/index.html';
      },
      'must be inside $.view.root',
    ],
  ])('rejects %s', (_label, mutate, message) => {
    const input = validArtifactInput();
    mutate(input);
    expect(() => parseVibeArtifactV2(input)).toThrow(message);
  });

  it.each([
    [
      'wrong algorithm',
      (input: Record<string, unknown>) => {
        (input.prompt as {digest: Record<string, unknown>}).digest.algorithm =
          'sha1';
      },
      'must be sha256',
    ],
    [
      'uppercase digest',
      (input: Record<string, unknown>) => {
        (integrity(input).sourceTree as Record<string, unknown>).value =
          'A'.repeat(64);
      },
      'must be a lowercase 64-character SHA-256 digest',
    ],
    [
      'short digest',
      (input: Record<string, unknown>) => {
        (integrity(input).viewInput as Record<string, unknown>).value =
          'a'.repeat(63);
      },
      'must be a lowercase 64-character SHA-256 digest',
    ],
  ])('rejects %s', (_label, mutate, message) => {
    const input = validArtifactInput();
    mutate(input);
    expect(() => parseVibeArtifactV2(input)).toThrow(message);
  });

  it.each([
    [
      'origin path',
      (input: Record<string, unknown>) => {
        (input.network as Record<string, unknown>).allowedOrigins = [
          'https://example.com/path',
        ];
      },
      'must be an exact HTTPS origin',
    ],
    [
      'origin credentials',
      (input: Record<string, unknown>) => {
        (input.network as Record<string, unknown>).allowedOrigins = [
          'https://user@example.com',
        ];
      },
      'must be an HTTPS URL without credentials',
    ],
    [
      'view URL credentials',
      (input: Record<string, unknown>) => {
        producer(input).deliveryMode = 'hosted-preview';
        input.view = {kind: 'url', url: 'https://user@example.com/page'};
      },
      'must be an HTTPS URL without credentials',
    ],
  ])('rejects %s', (_label, mutate, message) => {
    const input = validArtifactInput();
    mutate(input);
    expect(() => parseVibeArtifactV2(input)).toThrow(message);
  });

  it.each([
    ['env', 'sh', '-c', 'x'],
    ['/usr/bin/env', 'bash', '-c', 'x'],
    ['busybox', 'sh', '-c', 'x'],
    ['bash.exe', '-c', 'x'],
    ['node', '--eval', 'x'],
    ['node', '-p', 'x'],
    ['node', '--print', 'x'],
    ['python3.12', '-c', 'x'],
    ['python', '-Sc', 'x'],
    ['bun', '-e', 'x'],
    ['deno', 'eval', 'x'],
    ['npx', '-c', 'x'],
  ])('leaves evaluator command policy to PR 5 for argv %j', (...argv) => {
    const input = validArtifactInput();
    producer(input).deliveryMode = 'react-build';
    input.view = {
      kind: 'build',
      cwd: 'site',
      argv,
      output: 'site/dist',
      entry: 'site/dist/index.html',
    };

    expect(parseVibeArtifactV2(input).view).toMatchObject({argv});
  });

  it('bounds states and requires unique delivery-neutral names', () => {
    const tooMany = validArtifactInput();
    tooMany.states = Array.from({length: 5}, (_, index) => ({
      name: `state-${index}`,
      navigation: {kind: 'fragment', value: `#state-${index}`},
    }));
    expect(() => parseVibeArtifactV2(tooMany)).toThrow(
      'must contain at most four states',
    );

    const duplicate = validArtifactInput();
    duplicate.states = [
      {name: 'open', navigation: {kind: 'query', value: '?open=1'}},
      {name: 'open', navigation: {kind: 'fragment', value: '#open'}},
    ];
    expect(() => parseVibeArtifactV2(duplicate)).toThrow(
      '$.states[1].name: must be unique',
    );
  });

  it.each([
    ['?', 'contain a query'],
    ['#', 'contain a fragment'],
    ['?__vibe_theme=dark', 'evaluator-reserved __vibe_ keys'],
    ['?%5F%5Fvibe_theme=dark', 'evaluator-reserved __vibe_ keys'],
  ])('rejects reserved or empty state navigation %s', (value, message) => {
    const input = validArtifactInput();
    input.states = [
      {
        name: 'invalid',
        navigation: {kind: value.startsWith('?') ? 'query' : 'fragment', value},
      },
    ];

    expect(() => parseVibeArtifactV2(input)).toThrow(message);
  });

  it('rejects unversioned extensions instead of silently changing V2', () => {
    const input = validArtifactInput();
    input.scoredFiles = ['site/index.html'];

    expect(() => parseVibeArtifactV2(input)).toThrow(
      '$.scoredFiles: is not allowed',
    );
  });

  it('pins canonical tree hashing to UTF-8 byte order', () => {
    const parent = temporaryDirectory('vibe-tree-digest-');
    const bundle = path.join(parent, 'bundle');
    const tree = path.join(bundle, 'tree');
    fs.mkdirSync(tree, {recursive: true});
    for (const [filename, content] of Object.entries({
      'B.html': 'B\n',
      Z: 'Z\n',
      _x: '_\n',
      'a.html': 'a\n',
      'b.html': 'b\n',
      'é.html': 'é\n',
    })) {
      fs.writeFileSync(path.join(tree, filename), content);
    }

    expect(sha256TreeV2(bundle, 'tree')).toBe(
      'c1fb683c455b157f77e7e5b1e7307dec0885fe992b510ef3fa6f01e9be395b55',
    );
  });

  it('uses the standard empty-tree digest', () => {
    const parent = temporaryDirectory('vibe-empty-tree-');
    const bundle = path.join(parent, 'bundle');
    fs.mkdirSync(path.join(bundle, 'tree'), {recursive: true});

    expect(sha256TreeV2(bundle, 'tree')).toBe(EMPTY_TREE_SHA256_V2);
  });

  it('returns a producer-neutral receipt for a verified static bundle', () => {
    const artifact = parseVibeArtifactV2(validArtifactInput());
    const receipt = materializeStaticArtifactFixtureV2(
      path.join(FIXTURES, 'static-valid', 'bundle'),
      artifact,
    );

    expect(receipt).toMatchObject({
      schema: 'VibeMaterializationReceiptV2',
      schemaVersion: 2,
      artifactId: 'fixture-static-valid',
      status: 'materialized',
      primaryFailure: null,
      materializedView: {
        kind: 'static',
        digest: artifact.integrity.viewInput,
      },
      versions: artifact.versions,
    });
  });

  it('fails a broken-build static fixture as missing entry, not a scoreable page', () => {
    const artifact = parseVibeArtifactV2(
      readJson('static-broken-build/artifact.json'),
    );
    const receipt = materializeStaticArtifactFixtureV2(
      path.join(FIXTURES, 'static-broken-build', 'bundle'),
      artifact,
    );

    expect(receipt.status).toBe('materialization_failed');
    expect(receipt.materializedView).toBeNull();
    expect(receipt.primaryFailure?.code).toBe('missing_entry');
    expect(receipt.primaryFailure?.message).toContain('site/index.html');
  });

  it('fails closed when an immutable source byte changes', () => {
    const {bundle} = copyValidFixture();
    fs.appendFileSync(path.join(bundle, 'site', 'index.html'), '\nchanged\n');
    const artifact = parseVibeArtifactV2(validArtifactInput());

    const receipt = materializeStaticArtifactFixtureV2(bundle, artifact);

    expect(receipt.status).toBe('materialization_failed');
    expect(receipt.primaryFailure?.code).toBe('digest_mismatch');
  });

  it.skipIf(process.platform === 'win32')(
    'rejects a symlink that escapes the immutable bundle',
    () => {
      const {bundle, parent} = copyValidFixture();
      const outside = path.join(parent, 'outside.html');
      fs.writeFileSync(outside, 'outside');
      fs.symlinkSync(outside, path.join(bundle, 'site', 'escape.html'));
      const artifact = parseVibeArtifactV2(validArtifactInput());

      const receipt = materializeStaticArtifactFixtureV2(bundle, artifact);

      expect(receipt.status).toBe('materialization_failed');
      expect(receipt.primaryFailure?.code).toBe('unsafe_path');
      expect(receipt.primaryFailure?.message).toContain('escapes');
    },
  );

  it('reports unexpected materializer errors distinctly', () => {
    const artifact = parseVibeArtifactV2(validArtifactInput());
    const stat = vi.spyOn(fs, 'statSync').mockImplementationOnce(() => {
      throw new Error('unexpected fixture failure');
    });

    const receipt = materializeStaticArtifactFixtureV2(
      path.join(FIXTURES, 'static-valid', 'bundle'),
      artifact,
    );
    stat.mockRestore();

    expect(receipt.status).toBe('materialization_failed');
    expect(receipt.primaryFailure).toEqual({
      code: 'unexpected_error',
      message: 'unexpected fixture failure',
    });
  });

  it('uses a typed validation error with the failing field', () => {
    expect(() => parseVibeArtifactV2({schemaVersion: 2})).toThrow(
      VibeArtifactValidationError,
    );
  });
});

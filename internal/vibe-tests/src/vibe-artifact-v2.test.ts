// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterAll, describe, expect, it} from 'vitest';
import {materializeStaticArtifactFixtureV2} from './static-artifact-fixture';
import {
  VibeArtifactValidationError,
  parseVibeArtifactV2,
} from './vibe-artifact-v2';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(HERE, '..', 'artifact-fixtures', 'v2');
const TEMPORARY_DIRECTORIES: string[] = [];

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, relativePath), 'utf8'));
}

function validArtifactInput(): Record<string, unknown> {
  return structuredClone(readJson('static-valid/artifact.json')) as Record<
    string,
    unknown
  >;
}

function copyValidFixture(): {bundle: string; parent: string} {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-artifact-v2-'));
  TEMPORARY_DIRECTORIES.push(parent);
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
  it('keeps the checked JSON schema aligned with the V2 identity and view union', () => {
    const schema = readJson('../../schema/vibe-artifact-v2.schema.json') as {
      properties: {schema: {const: string}; schemaVersion: {const: number}};
      $defs: {view: {oneOf: unknown[]}};
      additionalProperties: boolean;
    };

    expect(schema.properties.schema.const).toBe('VibeArtifactV2');
    expect(schema.properties.schemaVersion.const).toBe(2);
    expect(schema.$defs.view.oneOf).toHaveLength(4);
    expect(schema.additionalProperties).toBe(false);
  });

  it('parses a complete static artifact with optional states', () => {
    const artifact = parseVibeArtifactV2(validArtifactInput());

    expect(artifact.view.kind).toBe('static');
    expect(artifact.states?.map(state => state.name)).toEqual([
      'filtered',
      'details',
    ]);
    expect(artifact.producer.deliveryMode).toBe(artifact.view.kind);
  });

  it.each([
    [
      'build',
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
      {
        kind: 'serve',
        cwd: 'site',
        argv: ['node', 'server.mjs'],
        readinessPath: '/ready',
      },
    ],
    ['url', {kind: 'url', url: 'https://example.com/vibe-fixture'}],
  ])('parses the %s view contract', (deliveryMode, view) => {
    const input = validArtifactInput();
    (input.producer as Record<string, unknown>).deliveryMode = deliveryMode;
    input.view = view;

    expect(parseVibeArtifactV2(input).view.kind).toBe(deliveryMode);
  });

  it('rejects traversal and missing digest fixtures before bundle access', () => {
    expect(() =>
      parseVibeArtifactV2(readJson('invalid/traversal.json')),
    ).toThrow('must be a canonical bundle-relative path without traversal');
    expect(() =>
      parseVibeArtifactV2(readJson('invalid/missing-digest.json')),
    ).toThrow('$.integrity.viewInput: must be an object');
  });

  it('rejects shell command strings disguised as argv', () => {
    const input = validArtifactInput();
    (input.producer as Record<string, unknown>).deliveryMode = 'build';
    input.view = {
      kind: 'build',
      cwd: 'site',
      argv: ['sh', '-c', 'pnpm build'],
      output: 'site/dist',
      entry: 'site/dist/index.html',
    };

    expect(() => parseVibeArtifactV2(input)).toThrow(
      'must not invoke a shell or command parser',
    );
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

  it('rejects unversioned extensions instead of silently changing V2', () => {
    const input = validArtifactInput();
    input.scoredFiles = ['site/index.html'];

    expect(() => parseVibeArtifactV2(input)).toThrow(
      '$.scoredFiles: is not allowed',
    );
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

  it('uses a typed validation error with the failing field', () => {
    expect(() => parseVibeArtifactV2({schemaVersion: 2})).toThrow(
      VibeArtifactValidationError,
    );
  });
});

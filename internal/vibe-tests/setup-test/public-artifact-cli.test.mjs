// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {assertPublicArtifactSafe} from '../src/public-artifact.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
const TSX = path.join(REPO_ROOT, 'node_modules', '.bin', 'tsx');
const SETUP_AGGREGATE = path.join(HERE, 'setup-aggregate.ts');
const UNIVERSAL_AGGREGATE = path.join(
  REPO_ROOT,
  'internal/vibe-tests/src/universal-aggregate.ts',
);
const UNIVERSAL_RESULTS = path.join(REPO_ROOT, 'internal/vibe-tests/results');
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

function run(script, args) {
  return spawnSync(TSX, [script, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
}

describe('public aggregate CLI output', () => {
  it('keeps setup aggregate stdout and stderr free of its absolute result path', () => {
    const directory = path.join(
      os.tmpdir(),
      `setup report ${process.pid}-${Date.now()}`,
    );
    fs.mkdirSync(directory, {recursive: true});
    temporaryDirectories.push(directory);
    const probe = {
      style: {color: 'rgb(0, 0, 0)'},
      geometry: {
        x: 0,
        y: 0,
        top: 0,
        right: 10,
        bottom: 10,
        left: 0,
        width: 10,
        height: 10,
      },
      text: 'Host',
      contrast: 21,
    };
    const scheme = {
      probes: {host: probe},
      variables: {},
      colorScheme: 'light dark',
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      taskResults: {},
      taskInteractions: {},
    };
    const baseline = {
      label: 'baseline',
      fixture: 'tailwind-v4-control',
      build: {ok: true, status: 0, ms: 1, stdout: '', stderr: ''},
      layerOrder: ['astryx-base', 'astryx-theme', 'utilities'],
      schemes: {light: scheme, dark: scheme},
    };
    const arm = {
      ...baseline,
      label: 'current',
      task: {
        id: 's0',
        kind: 'installation',
        contract: {
          allowedHostChanges: [],
          replacedHostProbes: [],
          allowedOverlayChanges: [],
          results: [{name: 'astryx-proof', exact: 1, visible: true}],
          interactions: [],
        },
      },
      executionStatus: 'succeeded',
      integrity: {
        diffSha256: 'a'.repeat(64),
        attestedDiffSha256: 'a'.repeat(64),
        diffMatchesAttestation: true,
        usesAstryx: true,
        changedFiles: ['src/App.tsx'],
        escapeHatches: [],
      },
    };
    fs.writeFileSync(
      path.join(directory, 'baseline__tailwind-v4-control.json'),
      JSON.stringify(baseline),
    );
    fs.writeFileSync(path.join(directory, 'current.json'), JSON.stringify(arm));
    fs.writeFileSync(
      path.join(directory, 'current.provenance.json'),
      JSON.stringify({
        schemaVersion: 1,
        task: {id: 's0', sha256: 'a'.repeat(64)},
        fixture: {id: 'tailwind-v4-control'},
        condition: 'current',
        rep: 1,
        executor: {harness: 'native', model: 'claude-family'},
        execution: {status: 'succeeded'},
        matrix: {stage: 'guidance', bundle: 'native-claude'},
      }),
    );

    const result = run(SETUP_AGGREGATE, [
      '--dir',
      directory,
      '--stage',
      'guidance',
    ]);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('s0');
    expect(result.stdout).toContain('NO');
    expect(result.stdout).not.toContain(directory);
    expect(result.stderr).not.toContain(directory);
    expect(() =>
      assertPublicArtifactSafe([result.stdout, result.stderr], {
        label: 'setup aggregate process output',
        privateValues: [directory],
      }),
    ).not.toThrow();
  });

  it('sanitizes universal JSON and human output from recursive private data', () => {
    fs.mkdirSync(UNIVERSAL_RESULTS, {recursive: true});
    const iterationDirectory = fs.mkdtempSync(
      path.join(UNIVERSAL_RESULTS, 'public-artifact-cli-'),
    );
    temporaryDirectories.push(iterationDirectory);
    const iteration = path.basename(iterationDirectory);
    const results = path.join(iterationDirectory, 'results');
    fs.mkdirSync(results);
    fs.writeFileSync(
      path.join(iterationDirectory, 'manifest.json'),
      JSON.stringify({
        config: {target: 'astryx'},
        prompts: [{id: 'p1', category: 'basic'}],
      }),
    );
    fs.writeFileSync(
      path.join(results, 'p1.tsx'),
      'export default function Example(){return <button>Save</button>}\n',
    );
    const privateRoot = '/home/example/private results';
    fs.writeFileSync(
      path.join(results, 'p1.json'),
      JSON.stringify({
        docsRead: [`${privateRoot}/guide.md`],
        completedAt: '2026-08-27T00:00:01.000Z',
      }),
    );
    fs.writeFileSync(
      path.join(results, 'p1.provenance.json'),
      JSON.stringify({
        schemaVersion: 1,
        task: {id: 'p1', sha256: 'a'.repeat(64)},
        fixture: {id: 'fixture'},
        executor: {harness: 'native', model: 'test'},
        execution: {durationMs: 1},
        usage: {
          inputTokens: 1,
          outputTokens: 1,
          source: `${privateRoot}/usage.json`,
          complete: true,
        },
      }),
    );

    const result = run(UNIVERSAL_AGGREGATE, ['--iteration', iteration]);
    expect(result.status, result.stderr).toBe(0);
    const aggregateFile = path.join(iterationDirectory, 'universal.json');
    const aggregateText = fs.readFileSync(aggregateFile, 'utf8');
    expect(result.stdout).toContain('Saved: universal.json');
    expect(result.stdout).not.toContain(iterationDirectory);
    expect(
      [aggregateText, result.stdout, result.stderr].join('\n'),
    ).not.toContain(privateRoot);
    expect(() =>
      assertPublicArtifactSafe(
        [JSON.parse(aggregateText), result.stdout, result.stderr],
        {
          label: 'universal aggregate process output',
          privateValues: [iterationDirectory, privateRoot, 'example'],
        },
      ),
    ).not.toThrow();
    expect(JSON.parse(aggregateText).execution.runs[0].usage.source).toBe(
      'runner-reported',
    );
  });
});

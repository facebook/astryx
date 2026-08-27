// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const SCRIPT = path.join(
  ROOT,
  '.github',
  'scripts',
  'visual-gate',
  'visual-acceptance.mjs',
);
const WORKFLOW = path.join(
  ROOT,
  '.github',
  'workflows',
  'visual-acceptance-promote.yml',
);
const HEAD = 'a'.repeat(40);
const MERGE = 'c'.repeat(40);
const KEY = 'core-button--default__neutral-light';
const RECORD_REL = '123/1/acceptance.json';
const SHOT = {
  storyId: 'core-button--default',
  title: 'Core/Button',
  name: 'Default',
  component: 'Button',
  theme: 'neutral',
  mode: 'light',
  reasons: ['component:Button'],
};

const roots = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

function png(red, green = 0, blue = 0) {
  const image = new PNG({width: 2, height: 2});
  for (let offset = 0; offset < image.data.length; offset += 4) {
    image.data[offset] = red;
    image.data[offset + 1] = green;
    image.data[offset + 2] = blue;
    image.data[offset + 3] = 255;
  }
  return PNG.sync.write(image);
}

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function runAcceptance(command, flags) {
  const args = [SCRIPT, command];
  for (const [name, value] of Object.entries(flags)) {
    args.push(`--${name}`, String(value));
  }
  return execFileSync(process.execPath, args, {encoding: 'utf8'});
}

function workflowStepScript(name) {
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');
  const start = workflow.indexOf(`      - name: ${name}\n`);
  expect(start).toBeGreaterThan(-1);
  const next = workflow.indexOf('\n      - name:', start + 1);
  const step = workflow.slice(start, next === -1 ? undefined : next);
  const runMarker = '        run: |\n';
  const runStart = step.indexOf(runMarker);
  expect(runStart).toBeGreaterThan(-1);
  return step
    .slice(runStart + runMarker.length)
    .split('\n')
    .map(line => (line.startsWith('          ') ? line.slice(10) : line))
    .join('\n');
}

function writeCommandShims(root) {
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  const gitShim = path.join(bin, 'git');
  fs.writeFileSync(
    gitShim,
    [
      '#!/bin/bash',
      'set -e',
      'REAL_GIT="$TEST_REAL_GIT"',
      'if [ "${1:-}" = "clone" ]; then',
      '  args=("$@")',
      '  for ((i = 0; i < ${#args[@]}; i += 1)); do',
      '    case "${args[$i]}" in',
      '      https://x-access-token:*) args[$i]="file://${TEST_REMOTE}" ;;',
      '    esac',
      '  done',
      '  exec "$REAL_GIT" "${args[@]}"',
      'fi',
      'if [ "${1:-}" = "-C" ] && [ "${3:-}" = "push" ] && [ "${TEST_INJECT_RACE:-0}" = "1" ] && [ ! -e "$TEST_RACE_MARKER" ]; then',
      '  CLEANUP="$TEST_ROOT/cleanup-clone"',
      '  "$REAL_GIT" clone -q --branch gh-pages "file://${TEST_REMOTE}" "$CLEANUP"',
      '  "$REAL_GIT" -C "$CLEANUP" config user.name Test',
      '  "$REAL_GIT" -C "$CLEANUP" config user.email test@example.com',
      '  rm -rf "$CLEANUP/pr/${PR_NUMBER}"',
      '  "$REAL_GIT" -C "$CLEANUP" add -A',
      '  "$REAL_GIT" -C "$CLEANUP" commit -qm "cleanup merged preview"',
      '  "$REAL_GIT" -C "$CLEANUP" push -q origin gh-pages',
      '  touch "$TEST_RACE_MARKER"',
      'fi',
      'exec "$REAL_GIT" "$@"',
      '',
    ].join('\n'),
  );
  fs.chmodSync(gitShim, 0o755);

  const ghShim = path.join(bin, 'gh');
  fs.writeFileSync(ghShim, '#!/bin/sh\nprintf "%b\\n" "$GH_LATEST"\n');
  fs.chmodSync(ghShim, 0o755);

  const sleepShim = path.join(bin, 'sleep');
  fs.writeFileSync(sleepShim, '#!/bin/sh\nexit 0\n');
  fs.chmodSync(sleepShim, 0o755);
  return bin;
}

function makeFixture(mutate) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'visual-promotion-workflow-'),
  );
  roots.push(root);
  const pages = path.join(root, 'pages');
  fs.mkdirSync(pages);
  git(pages, 'init', '-q', '-b', 'gh-pages');
  git(pages, 'config', 'user.name', 'Test');
  git(pages, 'config', 'user.email', 'test@example.com');

  const before = png(255);
  const after = png(0, 0, 255);
  const baselineShot = path.join(
    pages,
    'visual-gate',
    'baseline',
    'shots',
    `${KEY}.png`,
  );
  fs.mkdirSync(path.dirname(baselineShot), {recursive: true});
  fs.writeFileSync(baselineShot, before);
  writeJSON(path.join(pages, 'visual-gate', 'baseline', 'manifest.json'), {
    version: 1,
    platform: 'linux-arm64',
    browser: 'chromium-140.0',
    viewport: {width: 1280, height: 900},
    shots: {
      [KEY]: {...SHOT, key: KEY, sha256: digest(before), width: 2, height: 2},
    },
    decisions: [],
  });

  const evidence = path.join(pages, 'pr', '42', 'visual', HEAD, '123', '1');
  fs.mkdirSync(path.join(evidence, 'after'), {recursive: true});
  fs.writeFileSync(path.join(evidence, 'after', `${KEY}.png`), after);
  writeJSON(path.join(evidence, 'evidence.json'), {
    version: 1,
    repo: 'facebook/astryx',
    pr: 42,
    headSha: HEAD,
    testedSha: 'b'.repeat(40),
    baseSha: 'd'.repeat(40),
    run: {id: 123, attempt: 1},
    capture: {
      platform: 'linux-arm64',
      browser: 'chromium-140.0',
      viewport: {width: 1280, height: 900},
    },
    deltas: [
      {
        key: KEY,
        kind: 'changed',
        beforeSha256: digest(before),
        shot: SHOT,
      },
    ],
    verdict: {version: 1, status: 'changed'},
  });
  git(pages, 'add', '.');
  git(pages, 'commit', '-qm', 'fixture');

  runAcceptance('accept', {
    pages,
    pr: 42,
    head: HEAD,
    'run-id': 123,
    'run-attempt': 1,
    approver: 'maintainer',
    'approver-id': 99,
    permission: 'maintain',
    'effective-permission': 'maintain',
    'comment-id': 1234,
    reason: 'The new radius matches the approved component design.',
  });

  const acceptance = path.join(
    pages,
    'visual-gate',
    'acceptances',
    '42',
    HEAD,
    RECORD_REL,
  );
  const sandbox = path.join(root, 'sandbox');
  fs.mkdirSync(path.join(sandbox, '.github', 'scripts'), {recursive: true});
  fs.symlinkSync(
    path.join(ROOT, '.github', 'scripts', 'visual-gate'),
    path.join(sandbox, '.github', 'scripts', 'visual-gate'),
  );
  const plan = path.join(sandbox, 'accepted-plan.json');
  runAcceptance('plan', {acceptance, output: plan});

  const capture = path.join(sandbox, '.visual-merged');
  fs.mkdirSync(path.join(capture, 'shots'), {recursive: true});
  fs.writeFileSync(path.join(capture, 'shots', `${KEY}.png`), after);
  writeJSON(path.join(capture, 'manifest.json'), {
    version: 1,
    platform: 'linux-arm64',
    browser: 'chromium-140.0',
    viewport: {width: 1280, height: 900},
    capturedAt: '2026-08-27T08:00:00.000Z',
    context: {sha: MERGE},
    shots: {[KEY]: {...SHOT, sha256: digest(after), width: 2, height: 2}},
  });

  mutate?.({acceptance, baselineShot, pages});
  git(pages, 'add', '.');
  git(pages, 'commit', '-qm', 'record acceptance');

  const remote = path.join(root, 'remote.git');
  git(root, 'clone', '-q', '--bare', pages, remote);
  const bin = writeCommandShims(root);
  return {root, remote, sandbox, bin, after};
}

function runPromotion({fixture, latest = '123\\t1\\tcompleted', race = false}) {
  const marker = path.join(fixture.root, 'race-injected');
  const result = spawnSync(
    '/bin/bash',
    ['-c', workflowStepScript('Verify and promote the baseline')],
    {
      cwd: fixture.sandbox,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${fixture.bin}:${process.env.PATH}`,
        GH_TOKEN: 'test-token',
        GITHUB_REPOSITORY: 'facebook/astryx',
        PR_NUMBER: '42',
        HEAD_SHA: HEAD,
        MERGE_SHA: MERGE,
        RECORD_REL,
        RUNNER_TEMP: path.join(fixture.root, 'runner'),
        GH_LATEST: latest,
        TEST_INJECT_RACE: race ? '1' : '0',
        TEST_RACE_MARKER: marker,
        TEST_REAL_GIT: execFileSync('which', ['git'], {
          encoding: 'utf8',
        }).trim(),
        TEST_REMOTE: fixture.remote,
        TEST_ROOT: fixture.root,
      },
    },
  );
  return {...result, marker};
}

describe('visual acceptance promotion workflow', () => {
  it('retries from the immutable record after cleanup wins the first push race', () => {
    const fixture = makeFixture();
    const result = runPromotion({fixture, race: true});
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(fs.existsSync(result.marker)).toBe(true);

    const final = path.join(fixture.root, 'final');
    git(
      fixture.root,
      'clone',
      '-q',
      '--branch',
      'gh-pages',
      fixture.remote,
      final,
    );
    expect(fs.existsSync(path.join(final, 'pr', '42'))).toBe(false);
    expect(
      fs.readFileSync(
        path.join(final, 'visual-gate', 'baseline', 'shots', `${KEY}.png`),
      ),
    ).toEqual(fixture.after);
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
        'utf8',
      ),
    );
    expect(manifest.decisions.at(-1)).toMatchObject({
      pr: 42,
      headSha: HEAD,
      mergeSha: MERGE,
    });
  });

  it.each([
    {
      name: 'a stale current pointer',
      mutate: ({pages}) =>
        writeJSON(
          path.join(
            pages,
            'visual-gate',
            'acceptances',
            '42',
            HEAD,
            'current.json',
          ),
          {version: 1, run: 124, attempt: 1, record: '124/1/acceptance.json'},
        ),
      error: /newer visual acceptance superseded/,
    },
    {
      name: 'a superseded CI run',
      latest: '124\\t1\\tcompleted',
      error: /not from the latest completed CI attempt/,
    },
    {
      name: 'the wrong head identity',
      mutate: ({acceptance}) => {
        const record = JSON.parse(fs.readFileSync(acceptance, 'utf8'));
        record.headSha = 'e'.repeat(40);
        writeJSON(acceptance, record);
      },
      error: /record identity does not match this merged head/,
    },
    {
      name: 'a run identity that disagrees with the immutable path',
      mutate: ({acceptance}) => {
        const record = JSON.parse(fs.readFileSync(acceptance, 'utf8'));
        record.run.id = 124;
        writeJSON(acceptance, record);
      },
      latest: '124\\t1\\tcompleted',
      error: /record identity does not match this merged head/,
    },
    {
      name: 'tampered archived pixels',
      mutate: ({acceptance}) =>
        fs.writeFileSync(
          path.join(path.dirname(acceptance), 'after', `${KEY}.png`),
          png(0, 255, 0),
        ),
      error: /archived AFTER is missing or changed/,
    },
    {
      name: 'a changed baseline preimage',
      mutate: ({baselineShot}) =>
        fs.writeFileSync(baselineShot, png(0, 255, 0)),
      error: /baseline conflict/,
    },
  ])('fails closed for $name', ({mutate, latest, error}) => {
    const fixture = makeFixture(mutate);
    const result = runPromotion({fixture, latest});
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(error);
  });

  it('does not consult ephemeral PR evidence during promotion', () => {
    const script = workflowStepScript('Verify and promote the baseline');
    expect(script).toContain('current.json');
    expect(script).toContain('LATEST_STATUS');
    expect(script).toContain('visual-acceptance.mjs promote');
    expect(script).not.toContain('visual-acceptance.mjs state');
    expect(script).not.toContain('/pr/');
  });
});

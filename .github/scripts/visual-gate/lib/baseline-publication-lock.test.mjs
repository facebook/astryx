// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, describe, expect, it} from 'vitest';

import {
  isTerminalRun,
  orderedTickets,
  publicationBlockers,
} from './baseline-publication-lock.mjs';

const REPO = 'facebook/astryx';
const SCRIPT = fileURLToPath(
  new URL('./baseline-publication-lock.mjs', import.meta.url),
);
const roots = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

function ticket(runId, workflow) {
  return {
    name: String(runId),
    value: {version: 1, repository: REPO, runId, workflow},
  };
}

function harness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'baseline-lock-'));
  roots.push(root);
  const seed = path.join(root, 'seed');
  const remote = path.join(root, 'remote.git');
  const bin = path.join(root, 'bin');
  fs.mkdirSync(seed);
  fs.mkdirSync(bin);
  execFileSync('git', ['init', '-q', '-b', 'gh-pages'], {cwd: seed});
  execFileSync('git', ['config', 'user.name', 'Test'], {cwd: seed});
  execFileSync('git', ['config', 'user.email', 'test@example.com'], {
    cwd: seed,
  });
  fs.writeFileSync(path.join(seed, '.nojekyll'), '');
  execFileSync('git', ['add', '.'], {cwd: seed});
  execFileSync('git', ['commit', '-qm', 'seed'], {cwd: seed});
  execFileSync('git', ['clone', '-q', '--bare', seed, remote], {cwd: root});
  const gh = path.join(bin, 'gh');
  fs.writeFileSync(gh, '#!/bin/sh\nprintf \'{"status":"in_progress"}\\n\'\n');
  fs.chmodSync(gh, 0o755);

  const invoke = (command, runId, extra = {}) =>
    spawnSync(process.execPath, [SCRIPT, command], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        ASTRYX_BASELINE_QUEUE_URL: `file://${remote}`,
        GH_TOKEN: 'test-token',
        GITHUB_REPOSITORY: REPO,
        GITHUB_RUN_ID: String(runId),
        RUNNER_TEMP: root,
        ...extra,
      },
    });
  return {root, remote, gh, invoke};
}

describe('baseline publication lock', () => {
  it('orders normal, recovery, and manual requests in immutable run order', () => {
    expect(
      orderedTickets(
        [ticket(103, 'recovery'), ticket(99, 'manual'), ticket(101, 'normal')],
        REPO,
      ).map(value => value.runId),
    ).toEqual([99, 101, 103]);
  });

  it('keeps every older accepted publication ahead of a newer request', () => {
    expect(
      publicationBlockers(
        [ticket(200, 'normal'), ticket(201, 'recovery'), ticket(202, 'manual')],
        REPO,
        202,
      ).map(value => value.runId),
    ).toEqual([200, 201]);
  });

  it('never lets a newer recovery or manual request block older accepted work', () => {
    expect(
      publicationBlockers(
        [ticket(200, 'normal'), ticket(201, 'recovery'), ticket(202, 'manual')],
        REPO,
        200,
      ),
    ).toEqual([]);
  });

  it('prunes completed or missing abandoned runs, but never active ones', () => {
    expect(isTerminalRun('completed')).toBe(true);
    expect(isTerminalRun('missing')).toBe(true);
    for (const status of [
      'requested',
      'queued',
      'pending',
      'waiting',
      'in_progress',
    ]) {
      expect(isTerminalRun(status)).toBe(false);
    }
  });

  it('queues two real runs without cancelling or overtaking the older one', () => {
    const {root, remote, invoke} = harness();
    expect(invoke('enqueue', 200).status).toBe(0);
    expect(invoke('enqueue', 201).status).toBe(0);
    const blocked = invoke('wait', 201, {
      ASTRYX_BASELINE_LOCK_TIMEOUT_MS: '0',
    });
    expect(blocked.status).not.toBe(0);
    expect(blocked.stderr).toMatch(
      /timed out behind baseline publication run 200/,
    );
    expect(invoke('wait', 200).status).toBe(0);
    expect(invoke('release', 200).status).toBe(0);
    expect(invoke('wait', 201).status).toBe(0);
    expect(invoke('release', 201).status).toBe(0);

    const final = path.join(root, 'final');
    execFileSync('git', ['clone', '-q', '--branch', 'gh-pages', remote, final]);
    const queue = path.join(final, 'visual-gate', 'publication-queue');
    expect(fs.existsSync(queue) ? fs.readdirSync(queue) : []).toEqual([]);
  });

  it('keeps mutual exclusion when a lower-id run enqueues after the holder', () => {
    const {invoke} = harness();
    expect(invoke('enqueue', 201).status).toBe(0);
    expect(invoke('wait', 201).status).toBe(0);
    expect(invoke('enqueue', 200).status).toBe(0);
    const lateOlder = invoke('wait', 200, {
      ASTRYX_BASELINE_LOCK_TIMEOUT_MS: '0',
    });
    expect(lateOlder.status).not.toBe(0);
    expect(lateOlder.stderr).toMatch(
      /timed out behind baseline publication run 201/,
    );
    expect(invoke('release', 201).status).toBe(0);
    expect(invoke('wait', 200).status).toBe(0);
    expect(invoke('release', 200).status).toBe(0);
  });

  it('fails closed instead of deleting a corrupt active holder', () => {
    const {root, remote, invoke} = harness();
    expect(invoke('enqueue', 301).status).toBe(0);
    expect(invoke('wait', 301).status).toBe(0);

    const writer = path.join(root, 'holder-writer');
    execFileSync('git', [
      'clone',
      '-q',
      '--branch',
      'gh-pages',
      remote,
      writer,
    ]);
    execFileSync('git', ['config', 'user.name', 'Test'], {cwd: writer});
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: writer,
    });
    fs.writeFileSync(
      path.join(writer, 'visual-gate', 'publication-queue', 'holder.json'),
      `${JSON.stringify({
        version: 1,
        repository: REPO,
        runId: '301',
      })}\n`,
    );
    execFileSync('git', ['add', '.'], {cwd: writer});
    execFileSync('git', ['commit', '-qm', 'corrupt holder'], {cwd: writer});
    execFileSync('git', ['push', '-q', 'origin', 'gh-pages'], {cwd: writer});

    expect(invoke('enqueue', 300).status).toBe(0);
    const result = invoke('wait', 300, {
      ASTRYX_BASELINE_LOCK_TIMEOUT_MS: '0',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/publication holder has invalid identity/);
  });

  it('self-heals a missing-run ticket instead of bricking later publication', () => {
    const {gh, invoke} = harness();
    expect(invoke('enqueue', 200).status).toBe(0);
    expect(invoke('enqueue', 201).status).toBe(0);
    fs.writeFileSync(
      gh,
      "#!/bin/sh\necho 'gh: Not Found (HTTP 404)' >&2\nexit 1\n",
    );
    fs.chmodSync(gh, 0o755);
    expect(invoke('wait', 201).status).toBe(0);
    expect(invoke('release', 201).status).toBe(0);
  });

  it('removes a stray JSON file instead of treating it as a lock', () => {
    const {root, remote, invoke} = harness();
    const writer = path.join(root, 'stray-writer');
    execFileSync('git', [
      'clone',
      '-q',
      '--branch',
      'gh-pages',
      remote,
      writer,
    ]);
    execFileSync('git', ['config', 'user.name', 'Test'], {cwd: writer});
    execFileSync('git', ['config', 'user.email', 'test@example.com'], {
      cwd: writer,
    });
    const queue = path.join(writer, 'visual-gate', 'publication-queue');
    fs.mkdirSync(queue, {recursive: true});
    fs.writeFileSync(path.join(queue, 'stray.json'), '{}\n');
    execFileSync('git', ['add', '.'], {cwd: writer});
    execFileSync('git', ['commit', '-qm', 'stray'], {cwd: writer});
    execFileSync('git', ['push', '-q', 'origin', 'gh-pages'], {cwd: writer});

    expect(invoke('enqueue', 200).status).toBe(0);
    expect(invoke('wait', 200).status).toBe(0);
    expect(invoke('release', 200).status).toBe(0);
  });

  it('ignores stray names and fails closed for a missing or cross-repository ticket', () => {
    expect(() => publicationBlockers([], REPO, 200)).toThrow(
      /queue ticket for run 200 is missing/,
    );
    expect(
      orderedTickets([{name: '../200', value: {untrusted: true}}], REPO),
    ).toEqual([]);
    expect(() =>
      orderedTickets(
        [
          {
            name: '200',
            value: {version: 1, repository: 'fork/astryx', runId: 200},
          },
        ],
        REPO,
      ),
    ).toThrow(/invalid identity/);
  });
});

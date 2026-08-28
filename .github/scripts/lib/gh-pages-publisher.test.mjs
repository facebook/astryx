// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {afterEach, describe, expect, it} from 'vitest';

import {
  enqueuePublication,
  publishReleaseGateReport,
  publishStableSite,
  releasePublication,
  waitForPublicationTurn,
  withPublicationTurn,
} from './gh-pages-publisher.mjs';

const REPO = 'facebook/astryx';
const roots = [];

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], {encoding: 'utf8'}).trim();
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

function writeFile(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, value);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-pages-publisher-'));
  roots.push(root);
  const seed = path.join(root, 'seed');
  const remote = path.join(root, 'remote.git');
  const bin = path.join(root, 'bin');
  fs.mkdirSync(seed);
  fs.mkdirSync(bin);
  git(seed, 'init', '-q', '-b', 'gh-pages');
  git(seed, 'config', 'user.name', 'Test');
  git(seed, 'config', 'user.email', 'test@example.com');
  writeFile(path.join(seed, 'storybook', 'old.html'), 'old storybook');
  writeFile(path.join(seed, 'sandbox', 'old.html'), 'old sandbox');
  writeFile(path.join(seed, 'assets', 'old.css'), 'old asset');
  writeFile(path.join(seed, 'pr', '123', 'index.html'), 'preview');
  writeFile(path.join(seed, 'reports', 'vibe', 'index.html'), 'vibe');
  writeFile(
    path.join(seed, 'visual-gate', 'baseline', 'manifest.json'),
    '{}\n',
  );
  writeFile(path.join(seed, 'visual-gate', '55', 'old.html'), 'old report');
  writeFile(path.join(seed, 'index.html'), 'old landing');
  writeFile(path.join(seed, 'latest'), 'oldsha');
  writeFile(path.join(seed, '.nojekyll'), '');
  git(seed, 'add', '.');
  git(seed, 'commit', '-qm', 'seed');
  git(root, 'clone', '-q', '--bare', seed, remote);
  writeFile(
    path.join(bin, 'gh'),
    '#!/bin/sh\nprintf \'{"status":"in_progress"}\\n\'\n',
  );
  fs.chmodSync(path.join(bin, 'gh'), 0o755);
  return {root, remote, bin};
}

function cloneRemote(remote, root, name = 'final') {
  const checkout = path.join(root, name);
  git(root, 'clone', '-q', '--branch', 'gh-pages', remote, checkout);
  return checkout;
}

function context({root, remote, bin}, runId, scope) {
  return {
    repository: REPO,
    runId,
    scope,
    token: 'test-token',
    tempRoot: root,
    remoteURL: `file://${remote}`,
    envPath: `${bin}:${process.env.PATH}`,
  };
}

async function queuedPublish(fx, runId, scope, publish) {
  const previousPath = process.env.PATH;
  process.env.PATH = `${fx.bin}:${previousPath}`;
  try {
    return await withPublicationTurn({
      ...context(fx, runId, scope),
      publish,
    });
  } finally {
    process.env.PATH = previousPath;
  }
}

async function withoutGitIdentity(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'git-no-identity-'));
  const emptyGlobalConfig = path.join(root, 'config');
  fs.writeFileSync(emptyGlobalConfig, '');
  const keys = [
    'GIT_AUTHOR_NAME',
    'GIT_AUTHOR_EMAIL',
    'GIT_COMMITTER_NAME',
    'GIT_COMMITTER_EMAIL',
    'GIT_CONFIG_GLOBAL',
    'GIT_CONFIG_NOSYSTEM',
    'HOME',
  ];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  process.env.GIT_CONFIG_GLOBAL = emptyGlobalConfig;
  process.env.GIT_CONFIG_NOSYSTEM = '1';
  process.env.HOME = root;
  try {
    return await callback();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    fs.rmSync(root, {recursive: true, force: true});
  }
}

describe('gh-pages publisher', () => {
  it('queues whole-tree and scoped writers without Actions pending-run cancellation', async () => {
    const fx = fixture();
    const wholeTree = context(fx, 800, 'whole-tree');
    const scoped = context(fx, 801, 'visual-gate/reports');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(wholeTree);
      await enqueuePublication(scoped);
      await expect(
        waitForPublicationTurn({...scoped, timeoutMs: 0}),
      ).rejects.toThrow(/timed out behind gh-pages publication run 800/);
      await waitForPublicationTurn(wholeTree);
      await releasePublication(wholeTree);
      await waitForPublicationTurn(scoped);
      await releasePublication(scoped);
    } finally {
      process.env.PATH = previousPath;
    }

    const final = cloneRemote(fx.remote, fx.root);
    const queue = path.join(final, '.astryx-gh-pages', 'publication-queue');
    expect(fs.existsSync(queue) ? fs.readdirSync(queue).sort() : []).toEqual(
      [],
    );
  });

  it('publishes the stable site as an orphan while preserving unrelated scoped paths', async () => {
    const fx = fixture();
    const staged = path.join(fx.root, 'staged');
    writeFile(path.join(staged, 'storybook', 'index.html'), 'new storybook');
    writeFile(path.join(staged, 'sandbox', 'index.html'), 'new sandbox');
    writeFile(path.join(staged, 'assets', 'astryx.css'), 'new css');
    writeFile(path.join(staged, 'index.html'), 'new landing');
    writeFile(path.join(staged, 'latest'), 'abcdef1');
    const queueWriter = cloneRemote(fx.remote, fx.root, 'queue-writer');
    git(queueWriter, 'config', 'user.name', 'Test');
    git(queueWriter, 'config', 'user.email', 'test@example.com');
    writeFile(
      path.join(
        queueWriter,
        '.astryx-gh-pages',
        'publication-queue',
        '700.json',
      ),
      '{"version":1,"repository":"facebook/astryx","runId":700,"scope":"whole-tree"}\n',
    );
    git(queueWriter, 'add', '.');
    git(queueWriter, 'commit', '-qm', 'seed queue');
    git(queueWriter, 'push', '-q', 'origin', 'gh-pages');

    await withoutGitIdentity(() =>
      publishStableSite({
        ...context(fx, 900, 'whole-tree'),
        source: staged,
        sha: 'abcdef1234567890',
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(path.join(final, 'storybook', 'index.html'), 'utf8'),
    ).toBe('new storybook');
    expect(fs.existsSync(path.join(final, 'storybook', 'old.html'))).toBe(
      false,
    );
    expect(
      fs.readFileSync(path.join(final, 'pr', '123', 'index.html'), 'utf8'),
    ).toBe('preview');
    expect(
      fs.readFileSync(
        path.join(final, 'reports', 'vibe', 'index.html'),
        'utf8',
      ),
    ).toBe('vibe');
    expect(
      fs.readFileSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
        'utf8',
      ),
    ).toBe('{}\n');
    expect(
      fs.readFileSync(
        path.join(final, '.astryx-gh-pages', 'publication-queue', '700.json'),
        'utf8',
      ),
    ).toContain('whole-tree');
    expect(git(final, 'rev-list', '--count', 'HEAD')).toBe('1');
  });

  it('publishes release-gate reports without touching the stable site or baseline', async () => {
    const fx = fixture();
    const report = path.join(fx.root, 'report');
    writeFile(path.join(report, 'index.html'), 'new report');
    writeFile(
      path.join(report, 'release-gate.json'),
      '{"visual":{"status":"passed"}}\n',
    );

    await publishReleaseGateReport({
      ...context(fx, 901, 'visual-gate/reports'),
      source: report,
      runId: 901,
    });

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(
        path.join(final, 'visual-gate', '901', 'index.html'),
        'utf8',
      ),
    ).toBe('new report');
    expect(
      fs.readFileSync(
        path.join(final, 'visual-gate', 'latest', 'index.html'),
        'utf8',
      ),
    ).toBe('new report');
    expect(
      fs.readFileSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
        'utf8',
      ),
    ).toBe('{}\n');
    expect(
      fs.readFileSync(path.join(final, 'storybook', 'old.html'), 'utf8'),
    ).toBe('old storybook');
  });

  it('retries from the source checkout after deleting the rejected gh-pages checkout', async () => {
    const fx = fixture();
    const report = path.join(fx.root, 'report');
    writeFile(path.join(report, 'index.html'), 'retry report');
    let raced = false;

    await publishReleaseGateReport({
      ...context(fx, 902, 'visual-gate/reports'),
      source: report,
      runId: 902,
      beforePush: async ({attempt}) => {
        if (attempt !== 1 || raced) return;
        raced = true;
        const writer = cloneRemote(fx.remote, fx.root, 'race-writer');
        git(writer, 'config', 'user.name', 'Test');
        git(writer, 'config', 'user.email', 'test@example.com');
        writeFile(path.join(writer, 'visual-gate', 'race.txt'), 'race');
        git(writer, 'add', '.');
        git(writer, 'commit', '-qm', 'race');
        git(writer, 'push', '-q', 'origin', 'gh-pages');
      },
    });

    expect(raced).toBe(true);
    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(path.join(final, 'visual-gate', 'race.txt'), 'utf8'),
    ).toBe('race');
    expect(
      fs.readFileSync(
        path.join(final, 'visual-gate', '902', 'index.html'),
        'utf8',
      ),
    ).toBe('retry report');
  });

  it('prunes only old release-gate run directories', async () => {
    const fx = fixture();
    const seed = cloneRemote(fx.remote, fx.root, 'seed-more-runs');
    git(seed, 'config', 'user.name', 'Test');
    git(seed, 'config', 'user.email', 'test@example.com');
    for (let runId = 100; runId <= 125; runId += 1) {
      writeFile(
        path.join(seed, 'visual-gate', String(runId), 'index.html'),
        String(runId),
      );
    }
    writeFile(
      path.join(seed, '.astryx-gh-pages', 'publication-queue', '700.json'),
      '{"version":1,"repository":"facebook/astryx","runId":700,"scope":"whole-tree"}\n',
    );
    git(seed, 'add', '.');
    git(seed, 'commit', '-qm', 'seed runs');
    git(seed, 'push', '-q', 'origin', 'gh-pages');
    const report = path.join(fx.root, 'report-prune');
    writeFile(path.join(report, 'index.html'), 'new');

    await publishReleaseGateReport({
      ...context(fx, 126, 'visual-gate/reports'),
      source: report,
      runId: 126,
    });

    const final = cloneRemote(fx.remote, fx.root);
    expect(fs.existsSync(path.join(final, 'visual-gate', '100'))).toBe(false);
    expect(fs.existsSync(path.join(final, 'visual-gate', '107'))).toBe(true);
    expect(fs.existsSync(path.join(final, 'visual-gate', 'baseline'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(final, 'visual-gate', 'latest'))).toBe(true);
    expect(
      fs.existsSync(path.join(final, '.astryx-gh-pages', 'publication-queue')),
    ).toBe(true);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

import {
  cleanupPreviews,
  compactGhPages,
  enqueuePublication,
  publishAcceptedVisualBaseline,
  publishImmutablePath,
  publishPrPreview,
  publishReleaseGateReport,
  publishVibeReport,
  publishVibeScreenshots,
  publishVisualAcceptanceRecord,
  publishStableSite,
  releasePublication,
  waitForPublicationTurn,
  withPublicationTurn,
} from './gh-pages-publisher.mjs';

const REPO = 'facebook/astryx';
const roots = [];
const LEGACY_LOCK = fileURLToPath(
  new URL('../visual-gate/lib/baseline-publication-lock.mjs', import.meta.url),
);

const HEAD = 'a'.repeat(40);
const TESTED = 'b'.repeat(40);
const BASE = 'd'.repeat(40);
const MERGE = 'c'.repeat(40);
const KEY = 'core-button--default__neutral-light';

const SHARED_HOLDER = path.join(
  '.astryx-gh-pages',
  'publication-queue',
  'holder.json',
);
const LEGACY_HOLDER = path.join(
  'visual-gate',
  'publication-queue',
  'holder.json',
);

function holderCommit(checkout, holder) {
  return git(checkout, 'log', '-1', '--format=%H', '--', holder);
}

function holderAt(checkout, commit, holder) {
  const result = spawnSync(
    'git',
    ['-C', checkout, 'show', `${commit}:${holder}`],
    {
      encoding: 'utf8',
    },
  );
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout);
}

function holderStates(checkout, runId) {
  return git(checkout, 'rev-list', '--reverse', 'HEAD')
    .split('\n')
    .filter(Boolean)
    .map(commit => ({
      commit,
      shared: holderAt(checkout, commit, SHARED_HOLDER)?.runId === runId,
      legacy: holderAt(checkout, commit, LEGACY_HOLDER)?.runId === runId,
    }));
}

function expectNoPartialHolderState(checkout, runId) {
  expect(
    holderStates(checkout, runId).filter(
      state => state.shared !== state.legacy,
    ),
  ).toEqual([]);
}

const SHOT = {
  storyId: 'core-button--default',
  title: 'Core/Button',
  name: 'Default',
  component: 'Button',
  theme: 'neutral',
  mode: 'light',
  reasons: ['component:Button'],
};

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
  writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

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
  writeFile(
    path.join(seed, 'pr', '123', 'visual', 'evidence.json'),
    'same-PR visual evidence',
  );
  writeFile(path.join(seed, 'pr', '124', 'index.html'), 'closed preview');
  writeFile(
    path.join(seed, 'pr', '123', 'sandbox', 'template-assets', 'old.txt'),
    'old duplicate asset',
  );
  writeFile(path.join(seed, 'abcdef1', 'index.html'), 'legacy preview');
  writeFile(path.join(seed, 'reports', 'vibe', 'index.html'), 'vibe');
  const before = png(255);
  const after = png(0, 0, 255);
  writeFile(
    path.join(seed, 'visual-gate', 'baseline', 'shots', `${KEY}.png`),
    before,
  );
  writeJSON(path.join(seed, 'visual-gate', 'baseline', 'manifest.json'), {
    version: 1,
    platform: 'linux-arm64',
    browser: 'chromium-140.0',
    viewport: {width: 1280, height: 900},
    shots: {
      [KEY]: {...SHOT, key: KEY, sha256: digest(before), width: 2, height: 2},
    },
    decisions: [],
  });
  const evidence = path.join(seed, 'pr', '42', 'visual', HEAD, '123', '1');
  writeFile(path.join(evidence, 'after', `${KEY}.png`), after);
  writeJSON(path.join(evidence, 'evidence.json'), {
    version: 1,
    repo: REPO,
    pr: 42,
    headSha: HEAD,
    testedSha: TESTED,
    baseSha: BASE,
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
  writeFile(path.join(seed, 'visual-gate', '55', 'old.html'), 'old report');
  writeFile(path.join(seed, 'index.html'), 'old landing');
  writeFile(path.join(seed, 'latest'), 'oldsha');
  writeFile(path.join(seed, '.nojekyll'), '');
  git(seed, 'add', '.');
  git(seed, 'commit', '-qm', 'seed');
  git(root, 'clone', '-q', '--bare', seed, remote);
  writeFile(
    path.join(bin, 'gh'),
    `#!/bin/sh
printf '{"workflow_runs":[{"name":"CI","id":123,"run_attempt":1,"status":"completed","conclusion":"success"}],"name":"CI","id":123,"run_attempt":1,"status":"completed","conclusion":"success","head_sha":"${HEAD}"}\n'
`,
  );
  fs.chmodSync(path.join(bin, 'gh'), 0o755);
  return {root, remote, bin};
}

function writeLegacyTicket(remote, root, runId) {
  const writer = cloneRemote(remote, root, `legacy-${runId}`);
  git(writer, 'config', 'user.name', 'Test');
  git(writer, 'config', 'user.email', 'test@example.com');
  writeJSON(
    path.join(writer, 'visual-gate', 'publication-queue', `${runId}.json`),
    {
      version: 1,
      repository: REPO,
      runId,
    },
  );
  git(writer, 'add', '.');
  git(writer, 'commit', '-qm', `legacy ticket ${runId}`);
  git(writer, 'push', '-q', 'origin', 'gh-pages');
}

function runLegacyLock(fx, command, runId, extra = {}) {
  return spawnSync(process.execPath, [LEGACY_LOCK, command], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${fx.bin}:${process.env.PATH}`,
      ASTRYX_BASELINE_QUEUE_URL: `file://${fx.remote}`,
      GH_TOKEN: 'test-token',
      GITHUB_REPOSITORY: REPO,
      GITHUB_RUN_ID: String(runId),
      RUNNER_TEMP: fx.root,
      ...extra,
    },
  });
}

function writeSharedHolder(remote, root, runId, scope) {
  const writer = cloneRemote(remote, root, `shared-holder-${runId}`);
  git(writer, 'config', 'user.name', 'Test');
  git(writer, 'config', 'user.email', 'test@example.com');
  writeJSON(
    path.join(writer, '.astryx-gh-pages', 'publication-queue', `${runId}.json`),
    {
      version: 1,
      repository: REPO,
      runId,
      scope,
    },
  );
  writeJSON(
    path.join(writer, '.astryx-gh-pages', 'publication-queue', 'holder.json'),
    {
      version: 1,
      repository: REPO,
      runId,
      scope,
    },
  );
  git(writer, 'add', '.');
  git(writer, 'commit', '-qm', `shared holder ${runId}`);
  git(writer, 'push', '-q', 'origin', 'gh-pages');
}

function writeLegacyHolder(remote, root, runId, {withTicket = false} = {}) {
  const writer = cloneRemote(remote, root, `legacy-holder-${runId}`);
  git(writer, 'config', 'user.name', 'Test');
  git(writer, 'config', 'user.email', 'test@example.com');
  if (withTicket) {
    writeJSON(
      path.join(writer, 'visual-gate', 'publication-queue', `${runId}.json`),
      {
        version: 1,
        repository: REPO,
        runId,
      },
    );
  }
  writeJSON(path.join(writer, LEGACY_HOLDER), {
    version: 1,
    repository: REPO,
    runId,
  });
  git(writer, 'add', '.');
  git(writer, 'commit', '-qm', `legacy holder ${runId}`);
  git(writer, 'push', '-q', 'origin', 'gh-pages');
}

function writeCompetingSharedHolder(remote, root, runId, scope) {
  const writer = cloneRemote(remote, root, `competing-shared-${runId}`);
  git(writer, 'config', 'user.name', 'Test');
  git(writer, 'config', 'user.email', 'test@example.com');
  writeJSON(
    path.join(writer, '.astryx-gh-pages', 'publication-queue', `${runId}.json`),
    {
      version: 1,
      repository: REPO,
      runId,
      scope,
    },
  );
  writeJSON(path.join(writer, SHARED_HOLDER), {
    version: 1,
    repository: REPO,
    runId,
    scope,
  });
  git(writer, 'add', '.');
  git(writer, 'commit', '-qm', `competing shared holder ${runId}`);
  git(writer, 'push', '-q', 'origin', 'gh-pages');
}

function commitReportScreenshots({remote, root, reportId, files, isoDate}) {
  const writer = cloneRemote(
    remote,
    root,
    `report-shots-${reportId}-${Date.parse(isoDate)}`,
  );
  git(writer, 'config', 'user.name', 'Test');
  git(writer, 'config', 'user.email', 'test@example.com');
  for (const [name, bytes] of Object.entries(files)) {
    writeFile(
      path.join(writer, 'reports', reportId, 'screenshots', name),
      bytes,
    );
  }
  git(writer, 'add', '.');
  execFileSync(
    'git',
    ['-C', writer, 'commit', '-qm', `screenshots ${reportId}`],
    {
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: isoDate,
        GIT_COMMITTER_DATE: isoDate,
      },
    },
  );
  git(writer, 'push', '-q', 'origin', 'gh-pages');
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

function previewIdentity(overrides = {}) {
  return {
    pr: 123,
    head: HEAD,
    headRepo: 'cixzhang/astryx',
    headRepoId: '321',
    headRef: 'preview-fix',
    baseRepo: REPO,
    sourceRunId: 333,
    sourceRunAttempt: 1,
    sourceConclusion: 'success',
    ...overrides,
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

async function withFixturePath(fx, callback) {
  const previousPath = process.env.PATH;
  process.env.PATH = `${fx.bin}:${previousPath}`;
  try {
    return await callback();
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
      JSON.parse(
        fs.readFileSync(
          path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
          'utf8',
        ),
      ).version,
    ).toBe(1);
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
      JSON.parse(
        fs.readFileSync(
          path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
          'utf8',
        ),
      ).version,
    ).toBe(1);
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

  it('does not claim either holder while waiting for an older legacy baseline ticket', async () => {
    const fx = fixture();
    writeLegacyTicket(fx.remote, fx.root, 899);
    const turn = context(fx, 900, 'visual-gate/reports');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(turn);
      await expect(
        waitForPublicationTurn({...turn, timeoutMs: 0}),
      ).rejects.toThrow(/timed out behind gh-pages publication run 899/);
    } finally {
      process.env.PATH = previousPath;
    }

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(
        path.join(
          final,
          '.astryx-gh-pages',
          'publication-queue',
          'holder.json',
        ),
      ),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'publication-queue', 'holder.json'),
      ),
    ).toBe(false);
  });

  it('lets a late older legacy run finish while the newer shared holder waits', async () => {
    const fx = fixture();
    const turn = context(fx, 900, 'visual-gate/reports');
    await enqueuePublication(turn);
    writeLegacyTicket(fx.remote, fx.root, 899);

    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await expect(
        waitForPublicationTurn({...turn, timeoutMs: 0}),
      ).rejects.toThrow(/timed out behind gh-pages publication run 899/);
      expect(runLegacyLock(fx, 'wait', 899).status).toBe(0);
      expect(runLegacyLock(fx, 'release', 899).status).toBe(0);
      await waitForPublicationTurn(turn);
    } finally {
      process.env.PATH = previousPath;
    }

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      JSON.parse(fs.readFileSync(path.join(final, SHARED_HOLDER), 'utf8')),
    ).toMatchObject({runId: 900, scope: 'visual-gate/reports'});
    expect(
      JSON.parse(fs.readFileSync(path.join(final, LEGACY_HOLDER), 'utf8')),
    ).toMatchObject({runId: 900});
    expect(holderCommit(final, SHARED_HOLDER)).toBe(
      holderCommit(final, LEGACY_HOLDER),
    );
    expectNoPartialHolderState(final, 900);
  });

  it('bridges the legacy and shared queues for a new report writer', async () => {
    const fx = fixture();
    const turn = context(fx, 900, 'visual-gate/reports');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(turn);
      await waitForPublicationTurn(turn);
    } finally {
      process.env.PATH = previousPath;
    }

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(
            final,
            '.astryx-gh-pages',
            'publication-queue',
            'holder.json',
          ),
          'utf8',
        ),
      ),
    ).toMatchObject({runId: 900, scope: 'visual-gate/reports'});
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(final, 'visual-gate', 'publication-queue', 'holder.json'),
          'utf8',
        ),
      ),
    ).toMatchObject({runId: 900});
  });

  it('allows only one simultaneous current writer to claim both holders', async () => {
    const fx = fixture();
    const first = context(fx, 900, 'visual-gate/reports');
    const second = context(fx, 901, 'pr-visual/evidence');
    await enqueuePublication(first);
    await enqueuePublication(second);
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await Promise.all([
        waitForPublicationTurn(first),
        expect(
          waitForPublicationTurn({...second, timeoutMs: 0}),
        ).rejects.toThrow(/timed out behind gh-pages publication run 900/),
      ]);
    } finally {
      process.env.PATH = previousPath;
    }
    const final = cloneRemote(fx.remote, fx.root);
    expect(
      JSON.parse(fs.readFileSync(path.join(final, SHARED_HOLDER), 'utf8')),
    ).toMatchObject({runId: 900, scope: 'visual-gate/reports'});
    expect(
      JSON.parse(fs.readFileSync(path.join(final, LEGACY_HOLDER), 'utf8')),
    ).toMatchObject({runId: 900});
    expect(holderCommit(final, SHARED_HOLDER)).toBe(
      holderCommit(final, LEGACY_HOLDER),
    );
    expectNoPartialHolderState(final, 900);
  });

  it('retries an interrupted dual-holder claim without publishing a partial holder', async () => {
    const fx = fixture();
    const turn = context(fx, 900, 'visual-gate/reports');
    await enqueuePublication(turn);
    let raced = false;
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await waitForPublicationTurn({
        ...turn,
        beforeClaimPush: async ({attempt}) => {
          if (attempt !== 1 || raced) return;
          raced = true;
          const writer = cloneRemote(fx.remote, fx.root, 'dual-queue-race');
          git(writer, 'config', 'user.name', 'Test');
          git(writer, 'config', 'user.email', 'test@example.com');
          writeFile(path.join(writer, 'race.txt'), 'race');
          git(writer, 'add', '.');
          git(writer, 'commit', '-qm', 'race');
          git(writer, 'push', '-q', 'origin', 'gh-pages');
        },
      });
    } finally {
      process.env.PATH = previousPath;
    }
    expect(raced).toBe(true);
    const final = cloneRemote(fx.remote, fx.root);
    expect(fs.readFileSync(path.join(final, 'race.txt'), 'utf8')).toBe('race');
    expect(holderCommit(final, SHARED_HOLDER)).toBe(
      holderCommit(final, LEGACY_HOLDER),
    );
    expectNoPartialHolderState(final, 900);
  });

  it('prunes a completed legacy blocker and then acquires both holders', async () => {
    const fx = fixture();
    writeLegacyTicket(fx.remote, fx.root, 899);
    const turn = context(fx, 900, 'visual-gate/reports');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(turn);
      await waitForPublicationTurn(turn);
    } finally {
      process.env.PATH = previousPath;
    }
    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'publication-queue', '899.json'),
      ),
    ).toBe(false);
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(final, 'visual-gate', 'publication-queue', 'holder.json'),
          'utf8',
        ),
      ),
    ).toMatchObject({runId: 900});
  });

  it('releases both holders in one commit without an observable partial release', async () => {
    const fx = fixture();
    const turn = context(fx, 900, 'visual-gate/reports');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(turn);
      await waitForPublicationTurn(turn);
      await releasePublication(turn);
    } finally {
      process.env.PATH = previousPath;
    }
    const final = cloneRemote(fx.remote, fx.root);
    expect(fs.existsSync(path.join(final, SHARED_HOLDER))).toBe(false);
    expect(fs.existsSync(path.join(final, LEGACY_HOLDER))).toBe(false);
    expectNoPartialHolderState(final, 900);
  });

  it('prunes a terminal legacy holder without a ticket before claiming both holders', async () => {
    const fx = fixture();
    writeLegacyHolder(fx.remote, fx.root, 899);
    const turn = context(fx, 900, 'visual-gate/reports');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(turn);
      await waitForPublicationTurn(turn);
    } finally {
      process.env.PATH = previousPath;
    }
    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'publication-queue', '899.json'),
      ),
    ).toBe(false);
    expect(
      JSON.parse(fs.readFileSync(path.join(final, SHARED_HOLDER), 'utf8')),
    ).toMatchObject({runId: 900});
    expect(
      JSON.parse(fs.readFileSync(path.join(final, LEGACY_HOLDER), 'utf8')),
    ).toMatchObject({runId: 900});
    expectNoPartialHolderState(final, 900);
  });

  it('rechecks a fresh tip before claiming when a competing holder appears', async () => {
    const fx = fixture();
    const turn = context(fx, 900, 'visual-gate/reports');
    await enqueuePublication(turn);
    let raced = false;
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await expect(
        waitForPublicationTurn({
          ...turn,
          timeoutMs: 0,
          beforeClaimPush: async ({attempt}) => {
            if (attempt !== 1 || raced) return;
            raced = true;
            writeCompetingSharedHolder(fx.remote, fx.root, 899, 'whole-tree');
          },
        }),
      ).rejects.toThrow(/timed out behind gh-pages publication run 899/);
    } finally {
      process.env.PATH = previousPath;
    }
    expect(raced).toBe(true);
    const final = cloneRemote(fx.remote, fx.root);
    expect(
      JSON.parse(fs.readFileSync(path.join(final, SHARED_HOLDER), 'utf8')),
    ).toMatchObject({runId: 899, scope: 'whole-tree'});
    expect(fs.existsSync(path.join(final, LEGACY_HOLDER))).toBe(false);
  });

  it('publishes immutable visual evidence without overwriting different bytes', async () => {
    const fx = fixture();
    const source = path.join(fx.root, 'immutable-source');
    writeFile(path.join(source, 'index.html'), 'evidence');
    writeJSON(path.join(source, 'evidence.json'), {ok: true});

    await queuedPublish(fx, 910, 'pr-visual/evidence', () =>
      publishImmutablePath({
        ...context(fx, 910, 'pr-visual/evidence'),
        source,
        destination: 'pr/42/visual/head/run/1',
        message: 'Visual evidence: pr/42/visual/head/run/1',
      }),
    );
    await queuedPublish(fx, 911, 'pr-visual/evidence', () =>
      publishImmutablePath({
        ...context(fx, 911, 'pr-visual/evidence'),
        source,
        destination: 'pr/42/visual/head/run/1',
        message: 'Visual evidence: pr/42/visual/head/run/1',
      }),
    );
    writeFile(path.join(source, 'index.html'), 'changed evidence');
    await expect(
      queuedPublish(fx, 912, 'pr-visual/evidence', () =>
        publishImmutablePath({
          ...context(fx, 912, 'pr-visual/evidence'),
          source,
          destination: 'pr/42/visual/head/run/1',
          message: 'Visual evidence: pr/42/visual/head/run/1',
        }),
      ),
    ).rejects.toThrow(/immutable destination already exists/);
  });

  it('archives acceptance records through the shared queue', async () => {
    const fx = fixture();
    await queuedPublish(fx, 920, 'visual-gate/acceptances', () =>
      publishVisualAcceptanceRecord({
        ...context(fx, 920, 'visual-gate/acceptances'),
        pr: 42,
        head: HEAD,
        acceptedRunId: 123,
        acceptedRunAttempt: 1,
        approver: 'maintainer',
        approverId: 99,
        permission: 'maintain',
        effectivePermission: 'maintain',
        roleName: '',
        commentId: 1234,
        reason: 'The new radius matches the approved component design.',
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    const acceptance = JSON.parse(
      fs.readFileSync(
        path.join(
          final,
          'visual-gate',
          'acceptances',
          '42',
          HEAD,
          '123',
          '1',
          'acceptance.json',
        ),
        'utf8',
      ),
    );
    expect(acceptance.keys.map(entry => entry.key)).toEqual([KEY]);
    expect(
      fs.existsSync(
        path.join(
          final,
          'visual-gate',
          'acceptances',
          '42',
          HEAD,
          '123',
          '1',
          'after',
          `${KEY}.png`,
        ),
      ),
    ).toBe(true);
  });

  it('promotes accepted baseline pixels only while holding the shared turn', async () => {
    const fx = fixture();
    await queuedPublish(fx, 930, 'visual-gate/acceptances', () =>
      publishVisualAcceptanceRecord({
        ...context(fx, 930, 'visual-gate/acceptances'),
        pr: 42,
        head: HEAD,
        acceptedRunId: 123,
        acceptedRunAttempt: 1,
        approver: 'maintainer',
        approverId: 99,
        permission: 'maintain',
        effectivePermission: 'maintain',
        roleName: '',
        commentId: 1234,
        reason: 'The new radius matches the approved component design.',
      }),
    );
    const capture = path.join(fx.root, 'merged-capture');
    const after = png(0, 0, 255);
    writeFile(path.join(capture, 'shots', `${KEY}.png`), after);
    writeJSON(path.join(capture, 'manifest.json'), {
      version: 1,
      platform: 'linux-arm64',
      browser: 'chromium-140.0',
      viewport: {width: 1280, height: 900},
      context: {sha: MERGE},
      shots: {
        [KEY]: {...SHOT, key: KEY, sha256: digest(after), width: 2, height: 2},
      },
    });
    const turn = context(fx, 931, 'visual-gate/baseline');
    const previousPath = process.env.PATH;
    process.env.PATH = `${fx.bin}:${previousPath}`;
    try {
      await enqueuePublication(turn);
      await waitForPublicationTurn(turn);
      await publishAcceptedVisualBaseline({
        ...turn,
        pr: 42,
        head: HEAD,
        mergeSha: MERGE,
        expectedRecordRel: '123/1/acceptance.json',
        capture,
      });
      await releasePublication(turn);
    } finally {
      process.env.PATH = previousPath;
    }

    const final = cloneRemote(fx.remote, fx.root);
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
        'utf8',
      ),
    );
    expect(manifest.shots[KEY].sha256).toBe(digest(after));
    expect(manifest.decisions.at(-1)).toMatchObject({
      pr: 42,
      headSha: HEAD,
      mergeSha: MERGE,
    });
  });

  it('publishes PR previews without losing reports or visual state', async () => {
    const fx = fixture();
    const storybook = path.join(fx.root, 'preview-storybook');
    const sandbox = path.join(fx.root, 'preview-sandbox');
    writeFile(path.join(storybook, 'index.html'), 'new preview');
    writeFile(path.join(sandbox, 'index.html'), 'new sandbox');
    writeFile(
      path.join(sandbox, 'template-assets', 'ignored.txt'),
      'shared asset copy',
    );

    const result = await queuedPublish(fx, 940, 'pr-preview/123', () =>
      publishPrPreview({
        ...context(fx, 940, 'pr-preview/123'),
        ...previewIdentity(),
        storybook,
        sandbox,
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(path.join(final, 'pr', '123', 'index.html'), 'utf8'),
    ).toBe('new preview');
    expect(
      fs.readFileSync(
        path.join(final, 'pr', '123', 'sandbox', 'index.html'),
        'utf8',
      ),
    ).toBe('new sandbox');
    expect(
      fs.existsSync(
        path.join(final, 'pr', '123', 'sandbox', 'template-assets'),
      ),
    ).toBe(false);
    expect(
      fs.readFileSync(
        path.join(final, 'pr', '123', 'visual', 'evidence.json'),
        'utf8',
      ),
    ).toBe('same-PR visual evidence');
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(final, 'pr', '123', '.astryx-preview.json'),
        'utf8',
      ),
    );
    expect(manifest).toMatchObject({
      repository: REPO,
      pullRequest: {number: 123, headSha: HEAD},
      sourceRun: {id: 333, attempt: 1},
      targets: {
        storybook: {available: true, path: 'pr/123/'},
        sandbox: {available: true, path: 'pr/123/sandbox/'},
      },
    });
    expect(result).toMatchObject({
      status: 'published',
      pagesCommit: expect.stringMatching(/^[0-9a-f]{40}$/),
      targets: {
        storybook: {available: true},
        sandbox: {available: true},
      },
    });
    expect(
      fs.readFileSync(
        path.join(final, 'reports', 'vibe', 'index.html'),
        'utf8',
      ),
    ).toBe('vibe');
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(
          final,
          'pr',
          '42',
          'visual',
          HEAD,
          '123',
          '1',
          'evidence.json',
        ),
      ),
    ).toBe(true);
  });

  it('rejects Storybook artifacts that collide with trusted visual evidence', async () => {
    const fx = fixture();
    const storybook = path.join(fx.root, 'colliding-storybook');
    const sandbox = path.join(fx.root, 'colliding-sandbox');
    writeFile(path.join(storybook, 'index.html'), 'new preview');
    writeFile(
      path.join(storybook, 'visual', 'evidence.json'),
      'untrusted evidence',
    );
    writeFile(path.join(sandbox, 'index.html'), 'new sandbox');

    await expect(
      queuedPublish(fx, 944, 'pr-preview/123', () =>
        publishPrPreview({
          ...context(fx, 944, 'pr-preview/123'),
          ...previewIdentity(),
          storybook,
          sandbox,
        }),
      ),
    ).rejects.toThrow(/reserved path visual/);

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(
        path.join(final, 'pr', '123', 'visual', 'evidence.json'),
        'utf8',
      ),
    ).toBe('same-PR visual evidence');
  });

  it.each([
    ['no deployment', false, false],
    ['Storybook only', true, false],
    ['Sandbox only', false, true],
    ['both previews', true, true],
  ])(
    'publishes independent target state: %s',
    async (_label, hasStorybook, hasSandbox) => {
      const fx = fixture();
      const storybook = hasStorybook
        ? path.join(fx.root, 'matrix-storybook')
        : undefined;
      const sandbox = hasSandbox
        ? path.join(fx.root, 'matrix-sandbox')
        : undefined;
      if (storybook) writeFile(path.join(storybook, 'index.html'), 'storybook');
      if (sandbox) writeFile(path.join(sandbox, 'index.html'), 'sandbox');
      const resultFile = path.join(fx.root, 'preview-deployment.json');

      await queuedPublish(fx, 945, 'pr-preview/123', () =>
        publishPrPreview({
          ...context(fx, 945, 'pr-preview/123'),
          ...previewIdentity(),
          storybook,
          sandbox,
          resultFile,
        }),
      );

      const final = cloneRemote(fx.remote, fx.root);
      expect(fs.existsSync(path.join(final, 'pr', '123', 'index.html'))).toBe(
        hasStorybook,
      );
      expect(
        fs.existsSync(path.join(final, 'pr', '123', 'sandbox', 'index.html')),
      ).toBe(hasSandbox);
      expect(
        fs.readFileSync(
          path.join(final, 'pr', '123', 'visual', 'evidence.json'),
          'utf8',
        ),
      ).toBe('same-PR visual evidence');
      expect(fs.existsSync(path.join(final, 'pr', '124', 'index.html'))).toBe(
        true,
      );
      const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
      expect(result.targets.storybook.available).toBe(hasStorybook);
      expect(result.targets.sandbox.available).toBe(hasSandbox);
    },
  );

  it('refuses to mark a target available without its entry point', async () => {
    const fx = fixture();
    const storybook = path.join(fx.root, 'missing-index-storybook');
    writeFile(path.join(storybook, 'assets', 'bundle.js'), 'bundle');

    await expect(
      publishPrPreview({
        ...context(fx, 946, 'pr-preview/123'),
        ...previewIdentity(),
        storybook,
      }),
    ).rejects.toThrow('--storybook must contain index.html');
  });

  it('does not claim deployment when the gh-pages push fails', async () => {
    const fx = fixture();
    const storybook = path.join(fx.root, 'failed-storybook');
    writeFile(path.join(storybook, 'index.html'), 'new preview');
    const resultFile = path.join(fx.root, 'preview-deployment.json');

    await expect(
      queuedPublish(fx, 946, 'pr-preview/123', () =>
        publishPrPreview({
          ...context(fx, 946, 'pr-preview/123'),
          ...previewIdentity(),
          storybook,
          resultFile,
          beforePush: () => {
            throw new Error('simulated publisher failure');
          },
        }),
      ),
    ).rejects.toThrow('simulated publisher failure');

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(path.join(final, 'pr', '123', 'index.html'), 'utf8'),
    ).toBe('preview');
    expect(fs.existsSync(resultFile)).toBe(false);
  });

  it('cleans stale previews without deleting visual evidence or live previews', async () => {
    const fx = fixture();
    await queuedPublish(fx, 941, 'cleanup/previews', () =>
      cleanupPreviews({
        ...context(fx, 941, 'cleanup/previews'),
        openPRs: new Set(['123', '42']),
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(fs.existsSync(path.join(final, 'abcdef1'))).toBe(false);
    expect(fs.existsSync(path.join(final, 'pr', '124'))).toBe(false);
    expect(fs.existsSync(path.join(final, 'pr', '123', 'index.html'))).toBe(
      true,
    );
    expect(
      fs.existsSync(
        path.join(final, 'pr', '123', 'sandbox', 'template-assets'),
      ),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          final,
          'pr',
          '42',
          'visual',
          HEAD,
          '123',
          '1',
          'evidence.json',
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
      ),
    ).toBe(true);
  });

  it('publishes vibe screenshots without disturbing previews or baselines', async () => {
    const fx = fixture();
    const screenshots = path.join(fx.root, 'screenshots');
    const manifests = path.join(fx.root, 'manifests');
    writeFile(path.join(screenshots, 'iteration', 'one.png'), png(10));
    writeJSON(path.join(manifests, 'iteration', 'manifest.json'), {
      one: {ok: true},
    });

    await queuedPublish(fx, 942, 'reports/vibe-screenshots', () =>
      publishVibeScreenshots({
        ...context(fx, 942, 'reports/vibe-screenshots'),
        reportId: 'vibe',
        screenshots,
        manifests,
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(
        path.join(final, 'reports', 'vibe', 'screenshots', 'one.png'),
      ),
    ).toBe(true);
    expect(
      JSON.parse(
        fs.readFileSync(
          path.join(final, 'reports', 'vibe', 'screenshots', 'manifest.json'),
          'utf8',
        ),
      ).one.ok,
    ).toBe(true);
    expect(fs.existsSync(path.join(final, 'pr', '123', 'index.html'))).toBe(
      true,
    );
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
      ),
    ).toBe(true);
  });

  it('removes 58-day-old report screenshots while keeping the report page', async () => {
    const fx = fixture();
    commitReportScreenshots({
      remote: fx.remote,
      root: fx.root,
      reportId: 'vibe',
      isoDate: '2026-07-01T00:00:00Z',
      files: {
        'old.png': png(58),
        'manifest.json': Buffer.from('{\"old\":true}\n'),
      },
    });

    await queuedPublish(fx, 944, 'cleanup/previews', () =>
      cleanupPreviews({
        ...context(fx, 944, 'cleanup/previews'),
        openPRs: new Set(['123', '42']),
        now: Date.parse('2026-08-28T00:00:00Z'),
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(path.join(final, 'reports', 'vibe', 'index.html')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(final, 'reports', 'vibe', 'screenshots')),
    ).toBe(false);
  });

  it('compaction drops terminal legacy migration state and preserves active shared queue', async () => {
    const fx = fixture();
    const writer = cloneRemote(fx.remote, fx.root, 'compact-queue-state');
    git(writer, 'config', 'user.name', 'Test');
    git(writer, 'config', 'user.email', 'test@example.com');
    writeJSON(
      path.join(writer, 'visual-gate', 'publication-queue', '899.json'),
      {
        version: 1,
        repository: REPO,
        runId: 899,
      },
    );
    writeJSON(
      path.join(writer, 'visual-gate', 'publication-queue', 'holder.json'),
      {
        version: 1,
        repository: REPO,
        runId: 899,
      },
    );
    writeJSON(
      path.join(writer, '.astryx-gh-pages', 'publication-queue', '950.json'),
      {
        version: 1,
        repository: REPO,
        runId: 950,
        scope: 'pr-preview/950',
      },
    );
    git(writer, 'add', '.');
    git(writer, 'commit', '-qm', 'queue state');
    git(writer, 'push', '-q', 'origin', 'gh-pages');

    const turn = context(fx, 943, 'whole-tree');
    await withFixturePath(fx, async () => {
      await enqueuePublication(turn);
      await waitForPublicationTurn(turn);
      await compactGhPages({...turn, clearQueueForRun: true});
    });

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(path.join(final, 'visual-gate', 'publication-queue')),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(final, '.astryx-gh-pages', 'publication-queue', '950.json'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(final, '.astryx-gh-pages', 'publication-queue', '943.json'),
      ),
    ).toBe(false);
  });

  it('publishes a vibe report through the shared publisher while preserving screenshots', async () => {
    const fx = fixture();
    const writer = cloneRemote(fx.remote, fx.root, 'existing-report-shots');
    git(writer, 'config', 'user.name', 'Test');
    git(writer, 'config', 'user.email', 'test@example.com');
    writeFile(
      path.join(
        writer,
        'reports',
        'vibe-report',
        'screenshots',
        'existing.png',
      ),
      png(1),
    );
    writeFile(
      path.join(writer, 'reports', 'vibe-report', 'screenshots', 'same.png'),
      'old bytes',
    );
    git(writer, 'add', '.');
    git(writer, 'commit', '-qm', 'existing screenshots');
    git(writer, 'push', '-q', 'origin', 'gh-pages');
    const source = path.join(fx.root, 'vibe-report-source');
    writeFile(path.join(source, 'index.html'), 'new report');
    writeFile(path.join(source, 'previews', 'case.html'), 'preview');
    writeFile(path.join(source, 'screenshots', 'same.png'), 'new bytes');

    await queuedPublish(fx, 945, 'reports/vibe-report', () =>
      publishVibeReport({
        ...context(fx, 945, 'reports/vibe-report'),
        reportId: 'vibe-report',
        source,
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.readFileSync(
        path.join(final, 'reports', 'vibe-report', 'index.html'),
        'utf8',
      ),
    ).toBe('new report');
    expect(
      fs.existsSync(
        path.join(
          final,
          'reports',
          'vibe-report',
          'screenshots',
          'existing.png',
        ),
      ),
    ).toBe(true);
    expect(
      fs.readFileSync(
        path.join(final, 'reports', 'vibe-report', 'screenshots', 'same.png'),
        'utf8',
      ),
    ).toBe('new bytes');
    expect(fs.existsSync(path.join(final, 'reports', 'index.html'))).toBe(true);
  });

  it('keeps screenshot ages stable across repeated production compactions', async () => {
    const fx = fixture();
    commitReportScreenshots({
      remote: fx.remote,
      root: fx.root,
      reportId: 'old-report',
      isoDate: '2026-08-20T00:00:00Z',
      files: {'old.png': png(58)},
    });
    commitReportScreenshots({
      remote: fx.remote,
      root: fx.root,
      reportId: 'recent-report',
      isoDate: '2026-09-15T00:00:00Z',
      files: {'recent.png': png(8)},
    });

    for (const [index, isoDate] of [
      '2026-08-28T00:00:00Z',
      '2026-09-04T00:00:00Z',
      '2026-09-11T00:00:00Z',
      '2026-09-18T00:00:00Z',
    ].entries()) {
      const compactTurn = context(fx, 946 + index, 'whole-tree');
      await withFixturePath(fx, () =>
        withoutGitIdentity(async () => {
          await enqueuePublication(compactTurn);
          await waitForPublicationTurn(compactTurn);
          const previousNow = process.env.ASTRYX_GH_PAGES_NOW_MS;
          process.env.ASTRYX_GH_PAGES_NOW_MS = String(Date.parse(isoDate));
          try {
            await compactGhPages({...compactTurn, clearQueueForRun: true});
          } finally {
            if (previousNow === undefined) {
              delete process.env.ASTRYX_GH_PAGES_NOW_MS;
            } else {
              process.env.ASTRYX_GH_PAGES_NOW_MS = previousNow;
            }
          }
        }),
      );
      const afterCompact = cloneRemote(
        fx.remote,
        fx.root,
        `after-compact-${index}`,
      );
      expect(
        fs.existsSync(
          path.join(afterCompact, 'visual-gate', 'publication-queue'),
        ),
      ).toBe(false);
      expect(
        fs.existsSync(
          path.join(
            afterCompact,
            'reports',
            'old-report',
            'screenshots',
            'old.png',
          ),
        ),
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(
            afterCompact,
            'reports',
            'recent-report',
            'screenshots',
            'recent.png',
          ),
        ),
      ).toBe(true);
    }

    await queuedPublish(fx, 951, 'cleanup/previews', () =>
      cleanupPreviews({
        ...context(fx, 951, 'cleanup/previews'),
        openPRs: new Set(['123', '42']),
        now: Date.parse('2026-09-21T00:00:00Z'),
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(
      fs.existsSync(path.join(final, 'reports', 'old-report', 'screenshots')),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(
          final,
          'reports',
          'recent-report',
          'screenshots',
          'recent.png',
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(final, 'visual-gate', 'publication-queue')),
    ).toBe(false);
  });

  it('compacts the whole gh-pages tree without dropping scoped content', async () => {
    const fx = fixture();
    const turn = context(fx, 943, 'whole-tree');
    await withFixturePath(fx, () =>
      withoutGitIdentity(async () => {
        await enqueuePublication(turn);
        await waitForPublicationTurn(turn);
        await compactGhPages({...turn, clearQueueForRun: true});
      }),
    );

    const final = cloneRemote(fx.remote, fx.root);
    expect(git(final, 'rev-list', '--count', 'HEAD')).toBe('1');
    expect(fs.existsSync(path.join(final, 'pr', '123', 'index.html'))).toBe(
      true,
    );
    expect(
      fs.existsSync(
        path.join(
          final,
          'pr',
          '42',
          'visual',
          HEAD,
          '123',
          '1',
          'evidence.json',
        ),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(final, 'visual-gate', 'baseline', 'manifest.json'),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(final, 'reports', 'vibe', 'index.html')),
    ).toBe(true);
  });
});

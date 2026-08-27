// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {PNG} from 'pngjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'visual-acceptance.mjs',
);
const GATE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'gate.mjs',
);
const HEAD = 'a'.repeat(40);
const TESTED = 'b'.repeat(40);
const MERGE = 'c'.repeat(40);
const KEY = 'core-button--default__neutral-light';
const SHOT = {
  storyId: 'core-button--default',
  title: 'Core/Button',
  name: 'Default',
  component: 'Button',
  theme: 'neutral',
  mode: 'light',
  reasons: ['component:Button'],
};

let root;
let pages;

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

function run(command, flags = {}) {
  const args = [SCRIPT, command];
  for (const [name, value] of Object.entries(flags))
    args.push(`--${name}`, String(value));
  return execFileSync(process.execPath, args, {encoding: 'utf8'});
}

function fail(command, flags = {}) {
  const args = [SCRIPT, command];
  for (const [name, value] of Object.entries(flags))
    args.push(`--${name}`, String(value));
  const result = spawnSync(process.execPath, args, {encoding: 'utf8'});
  expect(result.status).not.toBe(0);
  return result.stderr;
}

function acceptanceFlags(overrides = {}) {
  return {
    pages,
    pr: 42,
    head: HEAD,
    'run-id': 123,
    'run-attempt': 1,
    approver: 'maintainer',
    'approver-id': 99,
    permission: 'maintain',
    'comment-id': 1234,
    reason: 'The new radius matches the approved component design.',
    ...overrides,
  };
}

function acceptanceFile(run = 123, attempt = 1) {
  return path.join(
    pages,
    'visual-gate',
    'acceptances',
    '42',
    HEAD,
    String(run),
    String(attempt),
    'acceptance.json',
  );
}

function writeBaseline(entries = {[KEY]: png(255)}) {
  const shots = {};
  for (const [key, bytes] of Object.entries(entries)) {
    const file = path.join(
      pages,
      'visual-gate',
      'baseline',
      'shots',
      `${key}.png`,
    );
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, bytes);
    shots[key] = {...SHOT, key, sha256: digest(bytes), width: 2, height: 2};
  }
  writeJSON(path.join(pages, 'visual-gate', 'baseline', 'manifest.json'), {
    version: 1,
    platform: 'linux-arm64',
    browser: 'chromium-140.0',
    viewport: {width: 1280, height: 900},
    shots,
    decisions: [],
  });
}

function writeEvidence({
  kind = 'changed',
  after = png(0, 0, 255),
  key = KEY,
  run = 123,
  attempt = 1,
  status = 'changed',
} = {}) {
  const dir = path.join(pages, 'pr', '42', 'visual', HEAD, String(run), String(attempt));
  fs.mkdirSync(path.join(dir, 'after'), {recursive: true});
  if (status === 'changed' && kind !== 'removed') {
    fs.writeFileSync(path.join(dir, 'after', `${key}.png`), after);
  }
  const deltas =
    status === 'changed'
      ? [
          {
            key,
            kind,
            beforeSha256:
              kind === 'added'
                ? null
                : digest(
                    fs.readFileSync(
                      path.join(
                        pages,
                        'visual-gate',
                        'baseline',
                        'shots',
                        `${key}.png`,
                      ),
                    ),
                  ),
            shot: kind === 'removed' ? null : SHOT,
          },
        ]
      : [];
  writeJSON(path.join(dir, 'evidence.json'), {
    version: 1,
    repo: 'facebook/astryx',
    pr: 42,
    headSha: HEAD,
    testedSha: TESTED,
    baseSha: 'd'.repeat(40),
    run: {id: run, attempt},
    capture:
      status === 'skipped'
        ? null
        : {
            platform: 'linux-arm64',
            browser: 'chromium-140.0',
            viewport: {width: 1280, height: 900},
          },
    deltas,
    verdict: {version: 1, status},
  });
  return dir;
}

function commitPages() {
  execFileSync('git', ['add', '.'], {cwd: pages});
  execFileSync('git', ['commit', '-qm', 'fixture'], {cwd: pages});
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-acceptance-'));
  pages = path.join(root, 'pages');
  fs.mkdirSync(pages);
  execFileSync('git', ['init', '-q', '-b', 'gh-pages'], {cwd: pages});
  execFileSync('git', ['config', 'user.name', 'Test'], {cwd: pages});
  execFileSync('git', ['config', 'user.email', 'test@example.com'], {
    cwd: pages,
  });
  writeBaseline();
  writeEvidence();
  commitPages();
});

afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

describe('visual acceptance', () => {
  it('archives the reviewed pixels and a complete decision record', () => {
    expect(run('accept', acceptanceFlags())).toContain(
      'Accepted 1 visual delta',
    );
    const record = JSON.parse(fs.readFileSync(acceptanceFile(), 'utf8'));
    expect(record).toMatchObject({
      version: 1,
      pr: 42,
      headSha: HEAD,
      testedSha: TESTED,
      run: {id: 123, attempt: 1},
      capture: {platform: 'linux-arm64', browser: 'chromium-140.0'},
      decision: {
        approver: 'maintainer',
        approverId: 99,
        permission: 'maintain',
        commentId: 1234,
      },
    });
    expect(record.keys[0]).toMatchObject({key: KEY, kind: 'changed'});
    expect(record.keys[0].beforeSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(record.keys[0].afterSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(
      fs.existsSync(
        path.join(path.dirname(acceptanceFile()), 'after', `${KEY}.png`),
      ),
    ).toBe(true);
  });

  it('requires an explanatory reason and maintainer permission', () => {
    expect(fail('accept', acceptanceFlags({reason: 'intentional...'}))).toMatch(
      /reason must explain/,
    );
    expect(fail('accept', acceptanceFlags({permission: 'write'}))).toMatch(
      /maintain\/admin/,
    );
  });

  it('binds acceptance to the exact reviewed run attempt', () => {
    writeEvidence({run: 123, attempt: 2, after: png(0, 255, 0)});
    run('accept', acceptanceFlags({'run-id': 123, 'run-attempt': 1}));
    const record = JSON.parse(fs.readFileSync(acceptanceFile(), 'utf8'));
    expect(record.run).toEqual({id: 123, attempt: 1});
    expect(record.keys[0].afterSha256).toBe(digest(png(0, 0, 255)));
  });

  it('reports whether the current visual bundle is clean, waiting, accepted, or failed', () => {
    const stateFlags = {pages, pr: 42, head: HEAD};
    expect(JSON.parse(run('state', stateFlags))).toMatchObject({
      state: 'pending',
      reason: 'decision',
    });
    run('accept', acceptanceFlags());
    expect(JSON.parse(run('state', stateFlags))).toMatchObject({
      state: 'success',
      reason: 'accepted',
    });

    writeEvidence({run: 124, attempt: 1, after: png(0, 0, 255)});
    expect(JSON.parse(run('state', stateFlags))).toMatchObject({
      state: 'pending',
      reason: 'decision',
    });
    writeEvidence({run: 124, attempt: 2, after: png(0, 255, 0)});
    expect(JSON.parse(run('state', stateFlags))).toMatchObject({
      state: 'pending',
      reason: 'decision',
    });
    writeEvidence({run: 125, status: 'skipped'});
    expect(JSON.parse(run('state', stateFlags))).toMatchObject({
      state: 'success',
      reason: 'deferred',
    });
  });

  it('returns success for a clean trusted capture without acceptance', () => {
    writeEvidence({run: 124, status: 'pass'});
    expect(JSON.parse(run('state', {pages, pr: 42, head: HEAD}))).toMatchObject({
      state: 'success',
      reason: 'clean',
    });
  });

  it('derives a trusted component plan from baseline themes and the Storybook index', () => {
    const storybook = path.join(root, 'storybook');
    fs.mkdirSync(storybook);
    writeJSON(path.join(storybook, 'index.json'), {
      entries: {
        button: {
          type: 'story',
          id: 'core-button--default',
          title: 'Core/Button',
          name: 'Default',
          tags: [],
        },
      },
    });
    const scope = path.join(root, 'scope.json');
    writeJSON(scope, {
      hasStableVisual: true,
      broadStableVisual: false,
      stableComponents: ['Button'],
      stableThemes: [],
    });
    const output = path.join(root, 'trusted-plan.json');
    run('trusted-plan', {
      scope,
      baseline: path.join(pages, 'visual-gate', 'baseline'),
      'storybook-dir': storybook,
      output,
    });
    expect(JSON.parse(fs.readFileSync(output, 'utf8')).map(shot => shot.key)).toEqual([
      'core-button--default__neutral-light',
      'core-button--default__neutral-dark',
    ]);
  });

  it('plans every baseline story for a newly promoted stable theme', () => {
    const storybook = path.join(root, 'storybook-new-theme');
    fs.mkdirSync(storybook);
    writeJSON(path.join(storybook, 'index.json'), {entries: {}});
    const scope = path.join(root, 'scope-new-theme.json');
    writeJSON(scope, {
      hasStableVisual: true,
      broadStableVisual: false,
      stableComponents: [],
      stableThemes: ['new-theme'],
    });
    const output = path.join(root, 'trusted-theme-plan.json');
    run('trusted-plan', {
      scope,
      baseline: path.join(pages, 'visual-gate', 'baseline'),
      'storybook-dir': storybook,
      output,
    });
    expect(JSON.parse(fs.readFileSync(output, 'utf8')).map(shot => shot.key)).toEqual([
      'core-button--default__new-theme-light',
      'core-button--default__new-theme-dark',
    ]);
  });

  it('uses the full baseline plan for broad stable infrastructure', () => {
    const scope = path.join(root, 'scope-broad.json');
    writeJSON(scope, {
      hasStableVisual: true,
      broadStableVisual: true,
      stableComponents: [],
      stableThemes: [],
    });
    const output = path.join(root, 'trusted-broad-plan.json');
    run('trusted-plan', {
      scope,
      baseline: path.join(pages, 'visual-gate', 'baseline'),
      'storybook-dir': root,
      output,
    });
    expect(JSON.parse(fs.readFileSync(output, 'utf8')).map(shot => shot.key)).toEqual([KEY]);
  });

  it('allows the trusted 520-shot broad plan through the capture CLI', () => {
    const plan = Array.from({length: 520}, (_, index) => ({
      key: `story-${index}__neutral-light`,
      storyId: `story-${index}`,
      title: `Core/C${index}`,
      name: 'Default',
      component: `C${index}`,
      theme: 'neutral',
      mode: 'light',
      reasons: ['trusted:broad'],
    }));
    const file = path.join(root, 'large-plan.json');
    writeJSON(file, plan);
    const printed = execFileSync(process.execPath, [GATE, 'plan', '--plan-file', file], {
      encoding: 'utf8',
    });
    expect(printed).toContain('520 shots');
  });

  it('keeps new component stories in a mixed broad plan', () => {
    const storybook = path.join(root, 'storybook-mixed');
    fs.mkdirSync(storybook);
    writeJSON(path.join(storybook, 'index.json'), {
      entries: {
        newStory: {
          type: 'story',
          id: 'core-new--default',
          title: 'Core/New',
          name: 'Default',
          tags: [],
        },
      },
    });
    const scope = path.join(root, 'scope-mixed.json');
    writeJSON(scope, {
      hasStableVisual: true,
      broadStableVisual: true,
      stableComponents: ['New'],
      stableThemes: [],
    });
    const output = path.join(root, 'trusted-mixed-plan.json');
    run('trusted-plan', {
      scope,
      baseline: path.join(pages, 'visual-gate', 'baseline'),
      'storybook-dir': storybook,
      output,
    });
    expect(JSON.parse(fs.readFileSync(output, 'utf8')).map(shot => shot.key)).toEqual([
      KEY,
      'core-new--default__neutral-light',
      'core-new--default__neutral-dark',
    ]);
  });

  it('accepts a trusted 520-delta broad bundle', () => {
    const runId = 130;
    const dir = path.join(pages, 'pr', '42', 'visual', HEAD, String(runId), '1');
    const deltas = [];
    fs.mkdirSync(path.join(dir, 'after'), {recursive: true});
    for (let index = 0; index < 520; index += 1) {
      const key = `story-${index}__neutral-light`;
      fs.writeFileSync(path.join(dir, 'after', `${key}.png`), png(index % 255));
      deltas.push({
        key,
        kind: 'added',
        beforeSha256: null,
        shot: {...SHOT, storyId: `story-${index}`},
      });
    }
    writeJSON(path.join(dir, 'evidence.json'), {
      version: 1,
      repo: 'facebook/astryx',
      pr: 42,
      headSha: HEAD,
      testedSha: TESTED,
      baseSha: 'd'.repeat(40),
      run: {id: runId, attempt: 1},
      capture: {
        platform: 'linux-arm64',
        browser: 'chromium-140.0',
        viewport: {width: 1280, height: 900},
      },
      deltas,
      verdict: {version: 1, status: 'changed'},
    });
    run('accept', acceptanceFlags({'run-id': runId}));
    const record = JSON.parse(fs.readFileSync(acceptanceFile(runId), 'utf8'));
    expect(record.keys).toHaveLength(520);
  });

  it('emits an exact recapture plan without allowing stored metadata to replace the key', () => {
    run('accept', acceptanceFlags());
    const record = JSON.parse(fs.readFileSync(acceptanceFile(), 'utf8'));
    record.keys[0].shot.key = '../wrong';
    writeJSON(acceptanceFile(), record);
    const output = path.join(root, 'plan.json');
    run('plan', {acceptance: acceptanceFile(), output});
    expect(JSON.parse(fs.readFileSync(output, 'utf8'))).toEqual([
      {...SHOT, key: KEY},
    ]);
  });

  it('feeds the accepted shots back into the capture CLI unchanged', () => {
    run('accept', acceptanceFlags());
    const output = path.join(root, 'plan.json');
    run('plan', {acceptance: acceptanceFile(), output});
    const printed = execFileSync(
      process.execPath,
      [GATE, 'plan', '--plan-file', output, '--json'],
      {
        encoding: 'utf8',
      },
    );
    expect(JSON.parse(printed)).toEqual([{...SHOT, key: KEY}]);
  });

  it('promotes only when merged pixels equal the reviewed after image', () => {
    run('accept', acceptanceFlags());
    const after = fs.readFileSync(
      path.join(path.dirname(acceptanceFile()), 'after', `${KEY}.png`),
    );
    const capture = path.join(root, 'capture');
    fs.mkdirSync(path.join(capture, 'shots'), {recursive: true});
    fs.writeFileSync(path.join(capture, 'shots', `${KEY}.png`), after);
    writeJSON(path.join(capture, 'manifest.json'), {
      version: 1,
      platform: 'linux-arm64',
      browser: 'chromium-140.0',
      viewport: {width: 1280, height: 900},
      capturedAt: '2026-08-26T22:00:00.000Z',
      context: {sha: MERGE},
      shots: {[KEY]: {...SHOT, sha256: digest(after), width: 2, height: 2}},
    });

    run('promote', {
      pages,
      acceptance: acceptanceFile(),
      capture,
      'merge-sha': MERGE,
    });
    run('promote', {
      pages,
      acceptance: acceptanceFile(),
      capture,
      'merge-sha': MERGE,
    });
    expect(
      fs.readFileSync(
        path.join(pages, 'visual-gate', 'baseline', 'shots', `${KEY}.png`),
      ),
    ).toEqual(after);
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(pages, 'visual-gate', 'baseline', 'manifest.json'),
        'utf8',
      ),
    );
    expect(manifest.context).toEqual({sha: MERGE});
    expect(manifest.decisions).toHaveLength(1);
    expect(manifest.decisions.at(-1)).toMatchObject({
      pr: 42,
      headSha: HEAD,
      mergeSha: MERGE,
    });
  });

  it('rejects changed post-merge pixels and a stale merge identity', () => {
    run('accept', acceptanceFlags());
    const capture = path.join(root, 'capture');
    fs.mkdirSync(path.join(capture, 'shots'), {recursive: true});
    fs.writeFileSync(path.join(capture, 'shots', `${KEY}.png`), png(0, 255, 0));
    writeJSON(path.join(capture, 'manifest.json'), {
      version: 1,
      platform: 'linux-arm64',
      browser: 'chromium-140.0',
      viewport: {width: 1280, height: 900},
      context: {sha: 'e'.repeat(40)},
      shots: {
        [KEY]: {...SHOT, sha256: digest(png(0, 255, 0)), width: 2, height: 2},
      },
    });
    expect(
      fail('promote', {
        pages,
        acceptance: acceptanceFile(),
        capture,
        'merge-sha': MERGE,
      }),
    ).toMatch(/capture was produced for/);
  });

  it('rejects a concurrent baseline change instead of overwriting it', () => {
    run('accept', acceptanceFlags());
    fs.writeFileSync(
      path.join(pages, 'visual-gate', 'baseline', 'shots', `${KEY}.png`),
      png(0, 255, 0),
    );
    expect(JSON.parse(run('state', {pages, pr: 42, head: HEAD}))).toMatchObject(
      {
        state: 'pending',
        reason: 'capture',
      },
    );
    const capture = path.join(root, 'capture');
    fs.mkdirSync(path.join(capture, 'shots'), {recursive: true});
    const accepted = fs.readFileSync(
      path.join(path.dirname(acceptanceFile()), 'after', `${KEY}.png`),
    );
    fs.writeFileSync(path.join(capture, 'shots', `${KEY}.png`), accepted);
    writeJSON(path.join(capture, 'manifest.json'), {
      version: 1,
      platform: 'linux-arm64',
      browser: 'chromium-140.0',
      viewport: {width: 1280, height: 900},
      context: {sha: MERGE},
      shots: {[KEY]: {...SHOT, sha256: digest(accepted), width: 2, height: 2}},
    });
    expect(
      fail('promote', {
        pages,
        acceptance: acceptanceFile(),
        capture,
        'merge-sha': MERGE,
      }),
    ).toMatch(/baseline conflict/);
  });

  it('records added and removed shots without inventing missing images', () => {
    const added = 'core-new--default__neutral-light';
    writeEvidence({kind: 'added', key: added, run: 124});
    run('accept', acceptanceFlags({'run-id': 124}));
    let record = JSON.parse(fs.readFileSync(acceptanceFile(124), 'utf8'));
    expect(record.keys[0]).toMatchObject({
      key: added,
      kind: 'added',
      beforeSha256: null,
    });

    fs.rmSync(path.join(pages, 'visual-gate', 'acceptances'), {
      recursive: true,
      force: true,
    });
    writeEvidence({kind: 'removed', run: 125});
    run('accept', acceptanceFlags({'comment-id': 1235, 'run-id': 125}));
    record = JSON.parse(fs.readFileSync(acceptanceFile(125), 'utf8'));
    expect(record.keys[0]).toMatchObject({
      key: KEY,
      kind: 'removed',
      afterSha256: null,
      shot: null,
    });
  });
});

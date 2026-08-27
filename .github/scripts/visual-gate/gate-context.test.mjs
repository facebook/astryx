// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'gate.mjs',
);
const IDENTITY_ENV = [
  'ASTRYX_VISUAL_SHA',
  'ASTRYX_VISUAL_RUN_ID',
  'ASTRYX_VISUAL_RUN_ATTEMPT',
  'GITHUB_SHA',
  'GITHUB_RUN_ID',
  'GITHUB_RUN_ATTEMPT',
];

let root;
let plan;
let output;

function captureContext(overrides = {}) {
  const env = {...process.env};
  for (const name of IDENTITY_ENV) delete env[name];
  Object.assign(env, overrides);

  execFileSync(
    process.execPath,
    [SCRIPT, 'check', '--plan-file', plan, '--max-shots', '0', '--out', output],
    {env, encoding: 'utf8'},
  );
  return JSON.parse(fs.readFileSync(path.join(output, 'verdict.json'), 'utf8'))
    .context;
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-gate-context-'));
  plan = path.join(root, 'plan.json');
  output = path.join(root, 'output');
  fs.writeFileSync(
    plan,
    JSON.stringify([
      {
        key: 'core-button--default__neutral-light',
        storyId: 'core-button--default',
        theme: 'neutral',
        mode: 'light',
        reasons: ['trusted:pr-scope'],
      },
    ]),
  );
});

afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

describe('visual gate capture identity', () => {
  it('records the GitHub run identity by default', () => {
    expect(
      captureContext({
        GITHUB_SHA: 'a'.repeat(40),
        GITHUB_RUN_ID: '123',
        GITHUB_RUN_ATTEMPT: '2',
      }),
    ).toMatchObject({
      sha: 'a'.repeat(40),
      runId: '123',
      runAttempt: '2',
    });
  });

  it('records an explicit trusted recapture identity ahead of workflow defaults', () => {
    expect(
      captureContext({
        GITHUB_SHA: 'a'.repeat(40),
        GITHUB_RUN_ID: '999',
        GITHUB_RUN_ATTEMPT: '4',
        ASTRYX_VISUAL_SHA: 'b'.repeat(40),
        ASTRYX_VISUAL_RUN_ID: '123',
        ASTRYX_VISUAL_RUN_ATTEMPT: '2',
      }),
    ).toMatchObject({
      sha: 'b'.repeat(40),
      runId: '123',
      runAttempt: '2',
    });
  });

  it('records missing identity as null', () => {
    expect(captureContext()).toMatchObject({
      sha: null,
      runId: null,
      runAttempt: null,
    });
  });

  it('preserves invalid explicit identity for downstream rejection', () => {
    expect(
      captureContext({
        GITHUB_SHA: 'a'.repeat(40),
        GITHUB_RUN_ID: '999',
        GITHUB_RUN_ATTEMPT: '4',
        ASTRYX_VISUAL_SHA: 'invalid',
        ASTRYX_VISUAL_RUN_ID: '',
        ASTRYX_VISUAL_RUN_ATTEMPT: 'invalid',
      }),
    ).toMatchObject({sha: 'invalid', runId: '', runAttempt: 'invalid'});
  });
});

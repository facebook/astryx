// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Execute the PR visual workflow's decision block against a stub gate.
 * @input The actual ci.yml step, analysis fixtures, and gate outcomes.
 * @output Mutation-sensitive routing, measurement, and provenance assertions.
 * @position Contract coverage for the shared Storybook PR visual owner (AST-030).
 */

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {URL} from 'node:url';
import {parseArgs} from 'node:util';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {parse} from 'yaml';

const job = parse(
  fs.readFileSync(new URL('../../workflows/ci.yml', import.meta.url), 'utf8'),
).jobs['pr-visual'];
const step = job.steps.find(candidate => candidate.id === 'visual');
const HEAD = 'a'.repeat(40);
const BASE = 'b'.repeat(40);
const MERGE = 'c'.repeat(40);
const EMPTY_ANALYSIS = {
  newComponents: [],
  modifiedComponents: [],
  componentStats: {},
  changedStableThemes: [],
  unresolvedComponentSources: [],
  forceFullComponentAudits: false,
  diffMode: 'three-dot',
};
const FOCUSED = {
  ...EMPTY_ANALYSIS,
  modifiedComponents: ['Button'],
  componentStats: {Button: {package: '@astryxdesign/core'}},
};

function outcome(status, exitCode = status === 'changed' ? 2 : 0) {
  return {
    exitCode,
    verdict: {
      version: 1,
      status,
      counts: {
        total: 1,
        unchanged: status === 'pass' ? 1 : 0,
        changed: status === 'changed' ? 1 : 0,
        added: 0,
        removed: 0,
        failed: status === 'failed' ? 1 : 0,
      },
      failures:
        status === 'failed' ? [{key: 'shot', error: 'capture failed'}] : [],
    },
  };
}

let root;
const writeJSON = (file, value) =>
  fs.writeFileSync(path.join(root, file), JSON.stringify(value));
const readJSON = file =>
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'pr-visual-workflow-'));
  fs.mkdirSync(path.join(root, '.github/scripts/visual-gate'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, '.github/scripts/visual-gate/gate.mjs'),
    String.raw`
import fs from 'node:fs';
import path from 'node:path';
const calls = fs.existsSync('calls.json')
  ? JSON.parse(fs.readFileSync('calls.json', 'utf8')) : [];
const args = process.argv.slice(2);
const context = {
  sha: process.env.GITHUB_SHA,
  headSha: process.env.ASTRYX_PR_HEAD_SHA,
  baseSha: process.env.ASTRYX_PR_BASE_SHA,
  runId: process.env.GITHUB_RUN_ID,
  runAttempt: process.env.GITHUB_RUN_ATTEMPT,
  ref: process.env.GITHUB_REF,
};
calls.push({args, context});
fs.writeFileSync('calls.json', JSON.stringify(calls));
const response = JSON.parse(fs.readFileSync('outcomes.json', 'utf8'))[calls.length - 1];
if (!response) throw new Error('Unexpected extra gate invocation');
const flag = name => args[args.indexOf(name) + 1];
const out = flag('--out');
fs.mkdirSync(out, {recursive: true});
if (response.verdict !== undefined) {
  const verdict = typeof response.verdict === 'string'
    ? response.verdict : JSON.stringify({...response.verdict, context});
  fs.writeFileSync(path.join(out, 'verdict.json'), verdict);
}
fs.writeFileSync(flag('--summary-output'), args[0] + ' summary\n');
process.exit(response.exitCode);
`,
  );
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

function run({
  analysis = FOCUSED,
  outcomes = [outcome('pass')],
  forceFull = 'false',
} = {}) {
  writeJSON('analysis.json', analysis);
  writeJSON('outcomes.json', outcomes);
  const expressions = {
    'github.event.pull_request.head.sha': HEAD,
    'github.event.pull_request.base.sha': BASE,
    'needs.check-components.outputs.force_full_component_audits': forceFull,
  };
  const env = Object.fromEntries(
    Object.entries(step.env).map(([key, value]) => [
      key,
      value.replace(/\$\{\{\s*(.*?)\s*\}\}/g, (_match, expression) => {
        if (!Object.hasOwn(expressions, expression)) {
          throw new Error(`Unresolved workflow expression: ${expression}`);
        }
        return expressions[expression];
      }),
    ]),
  );
  const result = spawnSync(
    'bash',
    ['--noprofile', '--norc', '-e', '-o', 'pipefail', '-c', step.run],
    {
      cwd: root,
      env: {
        ...process.env,
        GITHUB_SHA: MERGE,
        GITHUB_RUN_ID: '123',
        GITHUB_RUN_ATTEMPT: '2',
        GITHUB_REF: 'refs/pull/42/merge',
        GITHUB_OUTPUT: path.join(root, 'github-output'),
        GITHUB_STEP_SUMMARY: path.join(root, 'summary.md'),
        ...env,
      },
      encoding: 'utf8',
      timeout: 10_000,
    },
  );
  expect(result.error).toBeUndefined();
  return {
    ...result,
    calls: fs.existsSync(path.join(root, 'calls.json'))
      ? readJSON('calls.json')
      : [],
  };
}

function expectGate(call, command, scope = {}) {
  expect(call.args[0]).toBe(command);
  const {values} = parseArgs({
    args: call.args.slice(1),
    options: {
      'storybook-dir': {type: 'string'},
      baseline: {type: 'string'},
      out: {type: 'string'},
      'summary-output': {type: 'string'},
      tiers: {type: 'string'},
      components: {type: 'string'},
      themes: {type: 'string'},
      'no-scout': {type: 'boolean'},
    },
  });
  expect({...values}).toEqual({
    'storybook-dir': 'apps/storybook/dist',
    baseline: '.visual-baseline',
    out: '.visual-run',
    'summary-output': 'visual-summary.md',
    ...scope,
  });
}

const INVALID_OUTCOMES = [
  ['missing verdict', {exitCode: 0}],
  ['malformed JSON', {exitCode: 0, verdict: 'not JSON'}],
  [
    'multiple JSON values',
    {exitCode: 0, verdict: JSON.stringify(outcome('pass').verdict).repeat(2)},
  ],
  [
    'missing status',
    {exitCode: 0, verdict: {...outcome('pass').verdict, status: null}},
  ],
  ['incomplete verdict', {exitCode: 0, verdict: {version: 1, status: 'pass'}}],
  [
    'empty capture',
    {
      exitCode: 0,
      verdict: {...outcome('pass').verdict, counts: {total: 0, failed: 0}},
    },
  ],
  [
    'capture failure despite pass',
    {
      exitCode: 0,
      verdict: {
        ...outcome('pass').verdict,
        failures: [{error: 'browser crashed'}],
      },
    },
  ],
  ['failed verdict with exit 0', outcome('failed')],
  ['unknown status', outcome('crashed')],
  ['exit 1 despite pass', outcome('pass', 1)],
  ['exit 3 despite pass', outcome('pass', 3)],
  ['exit 137 despite pass', outcome('pass', 137)],
  ['exit 3 despite skipped', outcome('skipped', 3)],
];

describe('shared PR visual execution', () => {
  it.each([
    [
      'Chat directory',
      {
        ...EMPTY_ANALYSIS,
        unresolvedComponentSources: ['core/Chat'],
        forceFullComponentAudits: true,
      },
      'false',
    ],
    ['shared stable source', EMPTY_ANALYSIS, 'false'],
    [
      'broad analysis plus focused component',
      {...FOCUSED, forceFullComponentAudits: true},
      'false',
    ],
    [
      'unresolved source plus focused component',
      {...FOCUSED, unresolvedComponentSources: ['core/Chat']},
      'false',
    ],
    [
      'unresolved source plus theme',
      {
        ...EMPTY_ANALYSIS,
        unresolvedComponentSources: ['core/Chat'],
        changedStableThemes: ['neutral'],
      },
      'false',
    ],
    [
      'broad analysis plus component and theme',
      {
        ...FOCUSED,
        changedStableThemes: ['neutral'],
        forceFullComponentAudits: true,
      },
      'false',
    ],
  ])(
    'runs the unscoped canonical full plan for %s',
    (_name, analysis, forceFull) => {
      const result = run({analysis, forceFull});
      expect(result.status, result.stderr).toBe(0);
      expect(result.calls).toHaveLength(1);
      expectGate(result.calls[0], 'release');
    },
  );

  it.each([
    [
      'component',
      FOCUSED,
      {tiers: 'component', components: 'Button', 'no-scout': true},
    ],
    [
      'theme only',
      {...EMPTY_ANALYSIS, changedStableThemes: ['neutral', 'stone']},
      {tiers: 'theme-matrix', themes: 'neutral,stone'},
    ],
    [
      'component and theme',
      {...FOCUSED, changedStableThemes: ['stone']},
      {tiers: 'component,theme-matrix', components: 'Button', themes: 'stone'},
    ],
    [
      'new and modified Core only',
      {
        ...FOCUSED,
        newComponents: ['Card', 'Button', 'Experiment'],
        componentStats: {
          ...FOCUSED.componentStats,
          Card: {package: '@astryxdesign/core'},
          Experiment: {package: '@astryxdesign/lab'},
        },
      },
      {tiers: 'component', components: 'Button,Card', 'no-scout': true},
    ],
  ])('preserves focused %s execution', (_name, analysis, scope) => {
    // Theme changes also broaden component audits; that is not visual scope.
    const result = run({analysis, forceFull: 'true'});
    expect(result.status, result.stderr).toBe(0);
    expect(result.calls).toHaveLength(1);
    expectGate(result.calls[0], 'check', scope);
  });

  it('reports measured changes without failing the job or accepting a baseline', () => {
    const result = run({outcomes: [outcome('changed')]});
    expect(result.status, result.stderr).toBe(0);
    expect(result.calls).toHaveLength(1);
    expectGate(result.calls[0], 'check', {
      tiers: 'component',
      components: 'Button',
      'no-scout': true,
    });
    expect(readJSON('.visual-run/verdict.json').status).toBe('changed');
  });

  it.each(['pass', 'changed'])(
    'falls back once from focused skipped to full %s with the same provenance',
    status => {
      const result = run({outcomes: [outcome('skipped'), outcome(status)]});
      expect(result.status, result.stderr).toBe(0);
      expect(result.calls).toHaveLength(2);
      expectGate(result.calls[0], 'check', {
        tiers: 'component',
        components: 'Button',
        'no-scout': true,
      });
      expectGate(result.calls[1], 'release');
      for (const call of result.calls) {
        expect(call.context).toEqual({
          sha: MERGE,
          headSha: HEAD,
          baseSha: BASE,
          runId: '123',
          runAttempt: '2',
          ref: 'refs/pull/42/merge',
        });
      }
      expect(readJSON('.visual-run/verdict.json').status).toBe(status);
      expect(fs.readFileSync(path.join(root, 'summary.md'), 'utf8')).toBe(
        'check summary\nrelease summary\n',
      );
    },
  );

  it.each(INVALID_OUTCOMES)(
    'fails without retrying for %s',
    (_name, response) => {
      const result = run({outcomes: [response]});
      expect(result.status).not.toBe(0);
      expect(result.calls).toHaveLength(1);
    },
  );

  it.each([['skipped', outcome('skipped')], ...INVALID_OUTCOMES])(
    'fails when the second full plan is still unmeasured: %s',
    (_name, response) => {
      const result = run({outcomes: [outcome('skipped'), response]});
      expect(result.status).not.toBe(0);
      expect(result.calls).toHaveLength(2);
      expectGate(result.calls[1], 'release');
    },
  );

  it('never retries an initially full plan that is skipped', () => {
    const result = run({
      analysis: EMPTY_ANALYSIS,
      outcomes: [outcome('skipped')],
    });
    expect(result.status).not.toBe(0);
    expect(result.calls).toHaveLength(1);
    expectGate(result.calls[0], 'release');
  });

  it('cannot reuse a stale pass when the gate writes no verdict', () => {
    fs.mkdirSync(path.join(root, '.visual-run'));
    writeJSON('.visual-run/verdict.json', outcome('pass').verdict);
    const result = run({outcomes: [{exitCode: 0}]});
    expect(result.status).not.toBe(0);
    expect(fs.existsSync(path.join(root, '.visual-run/verdict.json'))).toBe(
      false,
    );
  });

  it('keeps failures blocking, report upload unconditional, and existing budgets intact', () => {
    expect(job['continue-on-error']).toBeUndefined();
    expect(step['continue-on-error']).toBeUndefined();
    expect(job.permissions).toEqual({contents: 'read'});
    const upload = job.steps.find(
      candidate => candidate.with?.name === 'visual-pr-report',
    );
    expect(upload.if).toBe('always()');
    expect(upload.uses).toMatch(/^actions\/upload-artifact@/);
    expect(upload.with.path.trim().split('\n')).toEqual([
      '.visual-run/verdict.json',
      '.visual-run/manifest.json',
      '.visual-run/shots/',
      '.visual-run/report/',
    ]);
    const config = JSON.parse(
      fs.readFileSync(
        new URL('./visual-gate.config.json', import.meta.url),
        'utf8',
      ),
    );
    expect(config).toMatchObject({
      prVisualShotLimit: 240,
      visualPlanSafetyLimit: 5000,
    });
  });
});

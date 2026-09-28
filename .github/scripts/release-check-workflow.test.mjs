// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Exact-main release dispatch contracts.
 * @input CI workflow and independent event, dependency, scope, and API fixtures
 * @output Fail-closed release routing and unchanged maintenance/PR assertions
 * @position Node contracts for AST-030 FR12 and DEC-5
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const workflow = yaml.parse(
  fs.readFileSync(new URL('../workflows/ci.yml', import.meta.url), 'utf8'),
);
const jobs = workflow.jobs;
const step = (job, name) => jobs[job].steps.find(item => item.name === name);
const releaseJobs = [
  'check-scope',
  'check-components',
  'build-storybook',
  'pr-visual',
  'pr-a11y',
  'pr-rtl-shard',
  'pr-rtl',
  'release-check',
];
const fullOutputs = {
  docsite_only: 'false',
  spec_only: 'false',
  tooling_only: 'false',
  has_components: 'true',
  has_rtl_components: 'true',
  has_rtl_harness: 'true',
  force_full_component_audits: 'true',
  has_stable_visual: 'true',
  broad_stable_visual: 'true',
};

function dependencies(job) {
  const names = job.needs == null ? [] : [job.needs].flat();
  return Object.fromEntries(
    names.map(name => [
      name,
      {
        result: name === 'maintenance-request' ? 'skipped' : 'success',
        outputs: {...fullOutputs},
      },
    ]),
  );
}

function runs(
  job,
  {
    event = 'workflow_dispatch',
    operation = 'release-check',
    needs = dependencies(job),
    cancelled = false,
  } = {},
) {
  const expression = (job.if ?? 'true')
    .replace(/^\$\{\{\s*|\s*\}\}$/g, '')
    .replace(/needs\.([a-z][a-z0-9-]*)/g, 'needs["$1"]');
  // GitHub injects success() unless the expression has a status function.
  if (
    !/\b(always|cancelled|success|failure)\(/.test(expression) &&
    (cancelled || Object.values(needs).some(item => item.result !== 'success'))
  )
    return false;
  return Function(
    'github',
    'inputs',
    'needs',
    'always',
    'cancelled',
    `return Boolean(${expression});`,
  )(
    {event_name: event},
    {operation},
    needs,
    () => true,
    () => cancelled,
  );
}

function shell(script, env = {}, prefix = '') {
  return spawnSync('bash', ['-eu', '-c', `${prefix}\n${script}`], {
    env: {...process.env, ...env},
    encoding: 'utf8',
  });
}

const sha = 'a'.repeat(40);
async function githubScript(
  script,
  {ref = 'refs/heads/main', mainSha = sha, needs, apiFails = false} = {},
) {
  const summary = {
    addHeading() {
      return this;
    },
    addRaw() {
      return this;
    },
    async write() {},
  };
  const execute = Object.getPrototypeOf(async function () {}).constructor(
    'context',
    'github',
    'core',
    'process',
    script,
  );
  return execute(
    {ref, sha, repo: {owner: 'example', repo: 'design-system'}},
    {
      rest: {
        git: {
          async getRef(request) {
            expect(request.ref).toBe('heads/main');
            if (apiFails) throw new Error('API unavailable');
            return {data: {object: {sha: mainSha}}};
          },
        },
      },
    },
    {summary},
    {env: {RELEASE_NEEDS: JSON.stringify(needs)}},
  );
}

function assertReleaseRouting(candidate) {
  for (const [name, job] of Object.entries(candidate.jobs)) {
    expect(runs(job), name).toBe(releaseJobs.includes(name));
  }
}

describe('explicit release routing', () => {
  it('uses only the existing workflow and canonical owners, never a push or schedule', () => {
    expect(workflow.on.workflow_dispatch.inputs.operation.options).toContain(
      'release-check',
    );
    expect(workflow.on).not.toHaveProperty('push');
    expect(workflow.on).not.toHaveProperty('schedule');
    expect(jobs['pr-visual'].name).toBe('Stable visual regression');
    assertReleaseRouting(workflow);
  });

  it.each(releaseJobs)('detects a mutation that skips %s', name => {
    const mutant = structuredClone(workflow);
    mutant.jobs[name].if = 'false';
    expect(() => assertReleaseRouting(mutant)).toThrow();
  });

  it.each(['capture', 'promote'])(
    'does not start release-only projection on %s',
    operation => {
      expect(runs(jobs['release-check'], {operation})).toBe(false);
    },
  );

  it.each(['failure', 'cancelled', 'skipped', ''])(
    'keeps the release join reachable after upstream %s',
    result => {
      const needs = dependencies(jobs['release-check']);
      for (const item of Object.values(needs)) item.result = result;
      expect(
        runs(jobs['release-check'], {needs, cancelled: result === 'cancelled'}),
      ).toBe(true);
    },
  );

  it.each(['pr-a11y', 'pr-visual', 'pr-rtl-shard'])(
    'blocks %s when its build fails',
    name => {
      const needs = dependencies(jobs[name]);
      needs['build-storybook'].result = 'failure';
      expect(runs(jobs[name], {needs})).toBe(false);
    },
  );

  it('keeps dispatch concurrency separate and non-cancelling', () => {
    expect(workflow.concurrency.group).toContain('|| github.run_id');
    expect(workflow.concurrency['cancel-in-progress']).toBe(
      "${{ github.event_name != 'workflow_dispatch' }}",
    );
  });

  it('preserves read-only release jobs and exact-event checkout', () => {
    expect(workflow.permissions).toEqual({});
    for (const name of releaseJobs) {
      expect(jobs[name].permissions ?? {}).not.toHaveProperty(
        'contents',
        'write',
      );
      expect(jobs[name].permissions ?? {}).not.toHaveProperty(
        'actions',
        'write',
      );
      for (const item of jobs[name].steps) {
        if (item.uses?.startsWith('actions/checkout@')) {
          // Omitted ref is the event SHA, not the mutable default branch.
          expect([
            undefined,
            '${{ github.sha }}',
            '${{ github.event.pull_request.head.sha || github.sha }}',
          ]).toContain(item.with?.ref);
          expect(item.with?.repository).toBeUndefined();
        }
      }
    }
  });
});

describe('exact current main request and completion', () => {
  const request = step('check-scope', 'Require exact current main for release')
    .with.script;
  const join = step(
    'release-check',
    'Require complete exact-main release checks',
  ).with.script;
  const complete = Object.fromEntries(
    jobs['release-check'].needs.map(name => [name, {result: 'success'}]),
  );

  it('checks main before checkout and accepts only complete exact-main evidence', async () => {
    expect(jobs['check-scope'].steps[0].with.script).toBe(request);
    await expect(githubScript(request)).resolves.toBeUndefined();
    await expect(
      githubScript(join, {needs: complete}),
    ).resolves.toBeUndefined();
    expect(jobs['release-check'].needs).toEqual([
      'check-scope',
      'check-components',
      'build-storybook',
      'pr-visual',
      'pr-a11y',
      'pr-rtl',
    ]);
  });

  it.each(['refs/heads/feature', 'refs/tags/main', ''])(
    'rejects ref %s at request and completion',
    async ref => {
      for (const script of [request, join]) {
        await expect(
          githubScript(script, {ref, needs: complete}),
        ).rejects.toThrow('dispatched from main');
      }
    },
  );

  it.each(['b'.repeat(40), undefined])(
    'rejects main drift or missing SHA %s',
    async mainSha => {
      for (const script of [request, join]) {
        await expect(
          githubScript(script, {mainSha: mainSha ?? '', needs: complete}),
        ).rejects.toThrow('Main changed');
      }
    },
  );

  it('fails closed when current main cannot be read', async () => {
    for (const script of [request, join]) {
      await expect(
        githubScript(script, {apiFails: true, needs: complete}),
      ).rejects.toThrow('API unavailable');
    }
  });

  it.each(['failure', 'cancelled', 'skipped', 'neutral', ''])(
    'rejects each required job with outcome %s',
    async result => {
      for (const name of Object.keys(complete)) {
        await expect(
          githubScript(join, {needs: {...complete, [name]: {result}}}),
        ).rejects.toThrow(name);
        const missing = {...complete};
        delete missing[name];
        await expect(githubScript(join, {needs: missing})).rejects.toThrow(
          name,
        );
      }
    },
  );
});

describe('full release scope without PR metadata or maintenance writes', () => {
  it('forces broad scope before any changed-file classification', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-release-scope-'));
    try {
      for (const [job, name, expected] of [
        [
          'check-scope',
          'Determine change scope',
          {docsite_only: 'false', spec_only: 'false', tooling_only: 'false'},
        ],
        [
          'check-components',
          'Check for component changes',
          Object.fromEntries(
            Object.entries(fullOutputs).filter(
              ([key]) => !key.endsWith('_only'),
            ),
          ),
        ],
      ]) {
        const output = path.join(dir, `${job}.txt`);
        const script = step(job, name).run.replaceAll(
          '${{ github.event_name }}',
          'workflow_dispatch',
        );
        const result = shell(
          script,
          {GITHUB_OUTPUT: output},
          'git() { echo "must not inspect changed files" >&2; return 99; }',
        );
        expect(result.status, result.stderr).toBe(0);
        expect(
          Object.fromEntries(
            fs
              .readFileSync(output, 'utf8')
              .trim()
              .split('\n')
              .map(line => line.split('=')),
          ),
        ).toEqual(expected);
      }
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });

  it('builds event-SHA Storybook and supplies explicit full audit analysis', () => {
    const identify = step(
      'build-storybook',
      'Identify full release audit scope',
    );
    expect(identify.run).toContain(
      'test "$(git rev-parse HEAD)" = "$GITHUB_SHA"',
    );
    expect(identify.run).toContain('{"forceFullComponentAudits":true}');
    for (const name of [
      'Upload Storybook artifact',
      'Upload built themes and core',
      'Upload analysis artifact',
    ]) {
      expect(
        runs(step('build-storybook', name), {
          needs: dependencies(jobs['build-storybook']),
        }),
        name,
      ).toBe(true);
    }
    for (const name of [
      'Compute PR preview path',
      'Analyze components',
      'Write PR comment metadata',
    ]) {
      expect(
        runs(step('build-storybook', name), {
          needs: dependencies(jobs['build-storybook']),
        }),
        name,
      ).toBe(false);
    }
  });

  it('runs the canonical accessibility command without a component filter for full scope', () => {
    const audit = step('pr-a11y', 'Run accessibility audit');
    const result = shell(
      audit.run.replaceAll('${{ github.event_name }}', 'workflow_dispatch'),
      {},
      `
      node() {
        if [ "$1" != '.github/scripts/accessibility-audit.js' ]; then return 99; fi
        printf '%s\\n' "$@"
      }
    `,
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain('--fail-on-new');
    expect(result.stdout).not.toContain('--components');
    expect(audit['continue-on-error']).toBeUndefined();
    expect(
      step('pr-a11y', 'Run accessibility spec-test contracts').env
        .ASTRYX_HEAD_SHA,
    ).toBe('${{ github.event.pull_request.head.sha || github.sha }}');
  });

  it.each([
    [['core/Button'], false],
    [['core/Button', 'lab/Chart'], true],
    [[], true],
  ])(
    'always supplies explicit PR owner filters %j (broad=%s)',
    (owners, broad) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-pr-a11y-'));
      try {
        fs.writeFileSync(
          path.join(dir, 'analysis.json'),
          JSON.stringify({
            diffMode: 'three-dot',
            newComponentOwners: owners,
            modifiedComponentOwners: [],
            unresolvedComponentSources: [],
            forceFullComponentAudits: broad,
          }),
        );
        const result = shell(
          step('pr-a11y', 'Run accessibility audit').run.replaceAll(
            '${{ github.event_name }}',
            'pull_request',
          ),
          {TEST_DIR: dir},
          `node() {
          if [ "$1" = '.github/scripts/a11y-pr-scope.mjs' ]; then
            command node "$1" "$TEST_DIR/analysis.json"
          else
            printf '[%s]\\n' "$@"
          fi
        }`,
        );
        expect(result.status, result.stderr).toBe(0);
        expect(result.stdout).toContain(
          `[--components]\n[${owners.join(',')}]`,
        );
        expect(result.stdout).toContain('[--fail-on-new]');
      } finally {
        fs.rmSync(dir, {recursive: true, force: true});
      }
    },
  );

  it('does not silently audit everything when PR scope resolution fails', () => {
    const result = shell(
      step('pr-a11y', 'Run accessibility audit').run.replaceAll(
        '${{ github.event_name }}',
        'pull_request',
      ),
      {},
      `node() {
        if [ "$1" = '.github/scripts/a11y-pr-scope.mjs' ]; then return 1; fi
        echo 'AUDIT MUST NOT RUN'
      }`,
    );
    expect(result.status).not.toBe(0);
    expect(result.stdout).not.toContain('AUDIT MUST NOT RUN');
  });

  it('keeps exhaustive a11y contracts, their artifacts, and Probe reach release-only', () => {
    for (const name of [
      'Run accessibility spec-test contracts',
      'Upload pressed-state pixel evidence',
      'Upload component-audit browser evidence',
      'Check Probe theme reach',
      'Upload Probe reach report',
    ]) {
      expect(runs(step('pr-a11y', name)), name).toBe(true);
      expect(
        runs(step('pr-a11y', name), {event: 'pull_request', operation: ''}),
        name,
      ).toBe(false);
      expect(runs(step('pr-a11y', name), {operation: 'capture'}), name).toBe(
        false,
      );
    }
    expect(step('pr-a11y', 'Run accessibility spec-test contracts').run).toBe(
      'pnpm test:a11y-contract',
    );
    expect(
      step('pr-a11y', 'Run accessibility spec-test contracts')[
        'continue-on-error'
      ],
    ).toBeUndefined();
    for (const name of [
      'Run modal close visibility guard',
      'Run theme var reachability guard',
      'Run story play guard',
    ]) {
      expect(
        runs(step('pr-a11y', name), {event: 'pull_request', operation: ''}),
        name,
      ).toBe(true);
      expect(runs(step('pr-a11y', name)), name).toBe(true);
      expect(step('pr-a11y', name)['continue-on-error']).toBeUndefined();
    }
  });

  it('keeps all canonical RTL packages and passes full scope to resolver and join', () => {
    expect(jobs['pr-rtl-shard'].strategy.matrix.package).toEqual([
      'core',
      'lab',
      'charts',
      'richtext',
      'vega',
    ]);
    expect(step('pr-rtl-shard', 'Resolve RTL shard scope').run).toContain(
      '--force-full "${{ needs.check-components.outputs.force_full_component_audits }}"',
    );
    expect(step('pr-rtl', 'Require every applicable RTL shard').run).toContain(
      '--force-full "${{ needs.check-components.outputs.force_full_component_audits }}"',
    );
    expect(step('pr-rtl-shard', 'Require completed RTL shard report').if).toBe(
      'always()',
    );
    expect(step('pr-rtl-shard', 'Run RTL audit')['continue-on-error']).toBe(
      true,
    );
  });

  it('does not run candidate capture, validation, or publication during release checks', () => {
    for (const name of [
      'Build canonical maintenance Storybook',
      'Capture canonical visual baseline',
      'Validate canonical baseline capture',
    ]) {
      expect(runs(step('pr-visual', name)), name).toBe(false);
    }
    expect(runs(jobs['maintenance-request'])).toBe(false);
    expect(runs(jobs['baseline-publication'])).toBe(false);
    expect(runs(step('pr-visual', 'Download Storybook artifact'))).toBe(true);
    const visual = step('pr-visual', 'Run full release visual check');
    expect(visual.run).toContain('gate.mjs release');
    expect(visual.run).not.toMatch(
      /--(?:sample|only|components|themes|max-shots|tiers|no-scout)\b/,
    );
    expect(visual['continue-on-error']).toBeUndefined();
    expect(
      step('pr-visual', 'Upload release visual verdict and report').with[
        'if-no-files-found'
      ],
    ).toBe('error');
  });

  it.each([
    [0, 'pass', 0],
    [2, 'changed', 0],
    [1, 'failed', 1],
    [0, 'skipped', 1],
    [0, 'unknown', 1],
    [0, '', 1],
  ])(
    'preserves canonical visual policy but rejects incomplete evidence (%s/%s)',
    (code, verdict, expected) => {
      const result = shell(
        step('pr-visual', 'Run full release visual check').run,
        {
          TEST_CODE: String(code),
          TEST_VERDICT: verdict,
          GITHUB_STEP_SUMMARY: '/dev/null',
        },
        `
        node() { return "$TEST_CODE"; }
        jq() { printf '%s' "$TEST_VERDICT"; }
        cat() { :; }
      `,
      );
      expect(result.status, result.stderr).toBe(expected);
    },
  );
});

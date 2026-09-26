// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Baseline maintenance workflow ownership contracts.
 * @input ci.yml and independent PR/dispatch states
 * @output Routing, trust-boundary, and publication ordering regression checks
 * @position Node contracts for the shared visual owner, not another CI lane
 */

import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const workflow = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);
const visual = workflow.jobs['pr-visual'];
const publication = workflow.jobs['baseline-publication'];
const step = (job, name) =>
  job.steps.find(candidate => candidate.name === name);
const index = (job, name) =>
  job.steps.findIndex(candidate => candidate.name === name);

// Only trusted workflow expressions are evaluated. The fixtures below provide
// outcomes independently, including skipped dependencies on maintenance dispatch.
function runs(
  job,
  {
    event = 'workflow_dispatch',
    operation = 'capture',
    needs = {},
    cancelled = false,
  } = {},
) {
  const expression = (job.if ?? 'true')
    .replace(/^\$\{\{\s*|\s*\}\}$/g, '')
    .replace(/needs\.([a-z][a-z0-9-]*)/g, 'needs["$1"]');
  if (!/\b(always|cancelled|success|failure)\(/.test(expression)) {
    if (
      cancelled ||
      Object.values(needs).some(value => value.result !== 'success')
    )
      return false;
  }
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

function dependencies(job, result = 'success') {
  const names = Array.isArray(job.needs)
    ? job.needs
    : job.needs
      ? [job.needs]
      : [];
  return Object.fromEntries(
    names.map(name => [
      name,
      {
        result,
        outputs: {has_stable_visual: 'true', has_components: 'true'},
      },
    ]),
  );
}

describe('CI baseline maintenance routing', () => {
  it('has explicit capture/promote dispatch without a new workflow or test owner', () => {
    expect(workflow.on.workflow_dispatch.inputs.operation.options).toEqual([
      'capture',
      'promote',
      'release-check',
    ]);
    expect(visual.name).toBe('Stable visual regression');
    expect(visual['runs-on']).toBe('2-core-ubuntu-arm');
    expect(publication['runs-on']).toBe('ubuntu-slim');
    expect(workflow.on).not.toHaveProperty('schedule');
  });

  it.each(['capture', 'promote'])(
    'does not run non-maintenance CI jobs for %s',
    operation => {
      for (const [name, job] of Object.entries(workflow.jobs)) {
        if (
          ['maintenance-request', 'pr-visual', 'baseline-publication'].includes(
            name,
          )
        )
          continue;
        expect(runs(job, {operation, needs: dependencies(job)}), name).toBe(
          false,
        );
      }
    },
  );

  it('runs capture despite skipped PR dependencies, only after the main guard succeeds', () => {
    const needs = dependencies(visual, 'skipped');
    needs['maintenance-request'].result = 'success';
    expect(runs(visual, {needs})).toBe(true);
    expect(runs(visual, {needs, operation: 'promote'})).toBe(false);
    needs['maintenance-request'].result = 'failure';
    expect(runs(visual, {needs})).toBe(false);
  });

  it('preserves focused PR routing when the maintenance guard is skipped', () => {
    const needs = dependencies(visual);
    needs['maintenance-request'].result = 'skipped';
    expect(runs(visual, {event: 'pull_request', needs})).toBe(true);
    needs['check-components'].outputs.has_stable_visual = 'false';
    expect(runs(visual, {event: 'pull_request', needs})).toBe(false);
    needs['check-components'].outputs.has_stable_visual = 'true';
    needs['build-storybook'].result = 'failure';
    expect(runs(visual, {event: 'pull_request', needs})).toBe(false);
    expect(runs(visual, {event: 'merge_group', needs})).toBe(false);
  });

  it('publishes only an explicit promote dispatch after the main guard', () => {
    expect(
      runs(publication, {
        operation: 'promote',
        needs: dependencies(publication),
      }),
    ).toBe(true);
    expect(
      runs(publication, {
        operation: 'capture',
        needs: dependencies(publication),
      }),
    ).toBe(false);
    expect(
      runs(publication, {
        operation: 'promote',
        needs: dependencies(publication, 'failure'),
      }),
    ).toBe(false);
    expect(
      runs(publication, {
        event: 'pull_request',
        operation: 'promote',
        needs: dependencies(publication),
      }),
    ).toBe(false);
  });

  it.each([
    ['refs/heads/main', 'capture', 0],
    ['refs/heads/main', 'promote', 0],
    ['refs/heads/feature', 'capture', 1],
    ['refs/tags/main', 'promote', 1],
    ['refs/heads/main', 'other', 1],
  ])(
    'guards maintenance ref %s and operation %s before checkout',
    (ref, operation, expected) => {
      const guard = workflow.jobs['maintenance-request'];
      expect(guard.steps).toHaveLength(1);
      const result = spawnSync('bash', ['-c', guard.steps[0].run], {
        env: {
          ...process.env,
          GITHUB_REF: ref,
          OPERATION: operation,
          RUN_ID: '101',
          RUN_ATTEMPT: '2',
          KEYS: 'all',
          REASON: 'Reviewed browser refresh',
        },
        encoding: 'utf8',
      });
      expect(result.status, result.stderr).toBe(expected);
    },
  );

  it('isolates dispatch concurrency from PRs and does not cancel queued maintenance', () => {
    expect(workflow.concurrency.group).toContain('|| github.run_id');
    expect(workflow.concurrency['cancel-in-progress']).toBe(
      "${{ github.event_name != 'workflow_dispatch' }}",
    );
  });
});

describe('canonical capture and publication separation', () => {
  it('builds full maintenance Storybook only inside the existing visual owner', () => {
    const build = step(visual, 'Build canonical maintenance Storybook');
    expect(build.if).toBe(
      "github.event_name == 'workflow_dispatch' && inputs.operation == 'capture'",
    );
    expect(build.run).toBe(
      'pnpm build && pnpm -F @astryxdesign/storybook build',
    );
    const capture = step(visual, 'Capture canonical visual baseline');
    expect(capture.if).toBe(
      "github.event_name == 'workflow_dispatch' && inputs.operation == 'capture'",
    );
    expect(capture.run).toContain('gate.mjs release');
    expect(capture.run).not.toMatch(
      /--(?:sample|only|components|themes|max-shots|tiers)\b/,
    );
    expect(visual.permissions).toEqual({contents: 'read'});
  });

  it('keeps browser-refresh capture reachable, but only uploads validated full captures', () => {
    expect(
      step(visual, 'Capture canonical visual baseline')['continue-on-error'],
    ).toBe(true);
    const validation = step(visual, 'Validate canonical baseline capture');
    expect(validation.if).toContain('always()');
    expect(validation.run).toContain('validateVisualMaintenanceCapture');
    expect(validation.env.CAPTURE_SHA).toBe('${{ github.sha }}');
    expect(validation.env.CAPTURE_RUN_ATTEMPT).toBe(
      '${{ github.run_attempt }}',
    );
    const artifact = step(visual, 'Upload canonical baseline candidate');
    expect(artifact.if).toContain(
      "steps.maintenance-validation.outcome == 'success'",
    );
    expect(artifact.with.name).toBe(
      'visual-baseline-capture-${{ github.run_id }}-${{ github.run_attempt }}',
    );
    expect(artifact.with.path).toContain('.visual-run/shots/');
    expect(artifact.with.path).toContain('.visual-run/manifest.json');
    expect(artifact.with.path).toContain('.visual-run/verdict.json');
  });

  it('uses exact validated artifact identity before any downloaded bytes or publication', () => {
    const resolve = step(publication, 'Resolve the reviewed canonical capture');
    const download = step(publication, 'Download the reviewed capture');
    expect(resolve.with.script).toContain('resolveVisualMaintenanceSource');
    expect(download.with['artifact-ids']).toBe(
      '${{ steps.source.outputs.artifact_id }}',
    );
    expect(download.with['run-id']).toBe('${{ steps.source.outputs.run_id }}');
    expect(download.with['merge-multiple']).toBe(true);
    const verify = step(publication, 'Verify downloaded capture identity');
    expect(verify.run).toContain('validateVisualMaintenanceCapture');
    expect(verify.env.CAPTURE_SHA).toBe('${{ steps.source.outputs.sha }}');
    expect(index(publication, resolve.name)).toBeLessThan(
      index(publication, download.name),
    );
    expect(index(publication, download.name)).toBeLessThan(
      index(publication, verify.name),
    );
    expect(index(publication, verify.name)).toBeLessThan(
      index(publication, 'Promote the explicitly reviewed baseline'),
    );
  });

  it('retains ordered manual publication with explicit keys, reason, actor, and prune', () => {
    const names = [
      'Queue baseline publication',
      'Wait for the baseline publication turn',
      'Promote the explicitly reviewed baseline',
      'Release the baseline publication turn',
    ];
    const positions = names.map(name => index(publication, name));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const [name, command] of [
      [names[0], 'enqueue'],
      [names[1], 'wait'],
      [names[3], 'release'],
    ]) {
      expect(step(publication, name).run).toContain(
        `gh-pages-publisher.mjs ${command} --scope visual-gate/baseline`,
      );
    }
    expect(step(publication, names[3]).if).toBe(
      "always() && steps.queue.outcome == 'success'",
    );
    const promote = step(publication, names[2]);
    expect(promote.run).toContain(
      'gh-pages-publisher.mjs visual-baseline-manual',
    );
    for (const [flag, variable] of [
      ['keys', 'KEYS'],
      ['reason', 'REASON'],
      ['actor', 'PROMOTER'],
      ['prune', 'PRUNE'],
    ]) {
      expect(promote.run).toContain(`--${flag} "$${variable}"`);
    }
    const commands = publication.steps
      .map(item => item.run ?? item.with?.script ?? '')
      .join('\n');
    expect(commands).not.toMatch(
      /playwright|gate\.mjs (?:release|capture|check)|createCommitStatus|createWorkflowDispatch/,
    );
  });

  it.each([
    ['focused component', 'Button', '', 'false', 'check', 'pass'],
    ['focused theme', '', 'stone', 'false', 'check', 'pass'],
    ['mixed broad and component', 'Button', '', 'true', 'release', 'pass'],
    ['broad without components', '', '', 'true', 'release', 'pass'],
    ['over-budget focused plan', 'Button', '', 'false', 'check', 'skipped'],
  ])(
    'keeps %s in the canonical visual job',
    (_label, components, themes, broad, command, status) => {
      const script = step(
        visual,
        'Run the visual gate for the touched components',
      ).run;
      const result = spawnSync(
        'bash',
        [
          '-c',
          `
      jq() {
        case "$2" in
          *changedStableThemes*) printf '%s' "$TEST_THEMES" ;;
          *newComponents*) printf '%s' "$TEST_COMPONENTS" ;;
          *) printf '%s' "$TEST_STATUS" ;;
        esac
      }
      node() {
        printf 'gate-command:%s\\n' "$2"
        if [ "$2" = 'release' ]; then TEST_STATUS=pass; fi
      }
      ${script}
    `,
        ],
        {
          env: {
            ...process.env,
            TEST_COMPONENTS: components,
            TEST_THEMES: themes,
            BROAD_STABLE_VISUAL: broad,
            TEST_STATUS: status,
            GITHUB_STEP_SUMMARY: '/dev/null',
          },
          encoding: 'utf8',
        },
      );
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain(`gate-command:${command}`);
      if (status === 'skipped') {
        expect(result.stdout).toContain('gate-command:release');
      }
      expect(visual['continue-on-error']).toBeUndefined();
    },
  );

  it.each([
    [1, 'failed', 1],
    [2, 'changed', 0],
    [0, 'skipped', 1],
  ])(
    'handles gate exit %s and final verdict %s without hiding incomplete evidence',
    (code, status, expected) => {
      const script = step(
        visual,
        'Run the visual gate for the touched components',
      ).run;
      const result = spawnSync(
        'bash',
        [
          '-c',
          `
      jq() {
        case "$2" in
          *changedStableThemes*) printf '' ;;
          *newComponents*) printf 'Button' ;;
          *) printf '%s' "$TEST_STATUS" ;;
        esac
      }
      node() { return "$TEST_CODE"; }
      ${script}
    `,
        ],
        {
          env: {
            ...process.env,
            TEST_CODE: String(code),
            TEST_STATUS: status,
            BROAD_STABLE_VISUAL: 'false',
            GITHUB_STEP_SUMMARY: '/dev/null',
          },
          encoding: 'utf8',
        },
      );
      expect(result.status, result.stderr).toBe(expected);
    },
  );

  it('retains non-regression Probe reach diagnostics in the existing accessibility owner', () => {
    const a11y = workflow.jobs['pr-a11y'];
    expect(step(a11y, 'Check Probe theme reach').run).toContain(
      'gate.mjs reach',
    );
    expect(step(a11y, 'Check Probe theme reach')['continue-on-error']).toBe(
      true,
    );
    expect(step(a11y, 'Upload Probe reach report').with.path).toBe(
      '.visual-reach/reach.json',
    );
  });
});

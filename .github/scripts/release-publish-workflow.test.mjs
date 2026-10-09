// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '../..');
const workflow = yaml.parse(
  fs.readFileSync(path.join(ROOT, '.github/workflows/release.yml'), 'utf8'),
);
const ci = yaml.parse(
  fs.readFileSync(path.join(ROOT, '.github/workflows/ci.yml'), 'utf8'),
);
const lint = yaml.parse(
  fs.readFileSync(path.join(ROOT, '.github/workflows/lint.yml'), 'utf8'),
);
const stable = workflow.jobs.publish;
const canary = workflow.jobs.canary;
const step = (job, name) =>
  job.steps.find(candidate => candidate.name === name);

describe('stable and canary publication authority', () => {
  it('keeps stable explicit and canary limited to main pushes', () => {
    expect(stable.if).toBe("github.event_name == 'workflow_dispatch'");
    expect(canary.if).toBe("github.event_name == 'push'");
    expect(workflow.on.push.branches).toEqual(['main']);
    for (const name of [
      'release-branch',
      'release-version',
      'release-tag',
      'expected-head',
      'plan-digest',
    ]) {
      expect(workflow.on.workflow_dispatch.inputs[name].required).toBe(true);
    }
  });

  it('binds stable publication to marker, tag, branch, head, version, and plan', () => {
    const gateInputs = ci.on.workflow_dispatch.inputs;
    expect(gateInputs['release-version']).toBeDefined();
    expect(gateInputs['plan-digest']).toBeDefined();
    const gate = step(
      ci.jobs['check-scope'],
      'Validate active release authority',
    ).run;
    expect(gate).toContain('--release-version "$RELEASE_VERSION"');
    expect(gate).toContain('--plan-digest "$PLAN_DIGEST"');

    const validation = step(
      stable,
      'Validate marked release branch, tag commit, and plan',
    ).run;
    for (const flag of [
      '--mode publish',
      '--release-branch "$RELEASE_BRANCH"',
      '--release-version "$RELEASE_VERSION"',
      '--release-tag "$RELEASE_TAG"',
      '--expected-head "$EXPECTED_HEAD"',
      '--plan-digest "$PLAN_DIGEST"',
      '--checkout-sha "$GITHUB_SHA"',
      '--remote-head "$REMOTE_HEAD"',
      '--ref-name "$GITHUB_REF_NAME"',
      '--active-branches "$ACTIVE_BRANCHES"',
    ]) {
      expect(validation).toContain(flag);
    }
    expect(validation).toContain('list-active');
    expect(validation).toContain('refs/heads/$RELEASE_BRANCH');
  });

  it('builds stable packages from the checked-out tag and never consumes canary artifacts', () => {
    expect(step(stable, 'Checkout immutable release tag').uses).toMatch(
      /^actions\/checkout@/u,
    );
    expect(step(stable, 'Build all packages').run).toBe('pnpm build');
    expect(
      stable.steps.some(candidate =>
        /download-artifact/u.test(candidate.uses ?? ''),
      ),
    ).toBe(false);
    const publish = step(stable, 'Publish changed packages').run;
    expect(publish).toContain('--tag latest');
    expect(publish).not.toContain('--tag canary');
  });

  it('keeps canary ephemeral and unable to mutate stable authority', () => {
    const publish = step(canary, 'Publish canary versions').run;
    expect(publish).toContain('BASE_VERSION=');
    expect(publish).toContain('--tag canary');
    expect(publish).not.toContain('--tag latest');
    const canaryText = JSON.stringify(canary);
    expect(canaryText).not.toContain('.release/');
    expect(canaryText).not.toContain('release-publish-receipt');
    expect(canaryText).not.toContain('active-release.mjs');
  });

  it('validates every main sync against trusted base policy and the immutable tag', () => {
    const sync = ci.jobs['release-sync'];
    expect(sync.if).toContain("github.base_ref == 'main'");
    const scope = step(
      sync,
      'Detect and require the release-sync branch contract',
    ).run;
    expect(scope).toContain('chore/sync-v*-to-main');
    expect(scope).toContain('stable package-version change on main');

    const lintScope = step(
      lint.jobs.lint,
      'Detect the release-sync branch contract',
    ).run;
    expect(lintScope).toContain('chore/sync-v*-to-main');
    expect(lintScope).toContain("grep -Eq '^[0-9]+\\.[0-9]+\\.[0-9]+$'");
    expect(step(lint.jobs.lint, 'Check Changeset coverage').if).toBe(
      "github.event_name == 'pull_request' && steps.release-sync-scope.outputs.required != 'true'",
    );

    const validation = step(
      sync,
      'Validate published bytes and consumed-only Changeset sync',
    ).run;
    expect(validation).toContain('validate-sync');
    expect(validation).toContain('--base origin/main');
    expect(validation).toContain('--release-ref "v$VERSION"');
    expect(validation).toContain('--active-branches "$ACTIVE_BRANCHES"');
    expect(
      step(sync, 'Fetch release authority and trusted validator').run,
    ).toContain('git show origin/main:scripts/release/active-release.mjs');
    const parity = step(
      sync,
      'Verify immutable tag package bytes match npm',
    ).run;
    expect(parity).toContain('git worktree add --detach');
    expect(parity).toContain('pnpm build');
    expect(parity).toContain('verify-published.mjs --version "$VERSION"');
  });
});

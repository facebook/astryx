// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Every workflow, job and CI script is declared in the CI registry
 * (spec:AST-030 FR14–FR15). The registry is the `ci-registry:v1` block in
 * docs/specs/AST-030/spec.md, so a CI change is a spec change.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const spec = read('docs/specs/AST-030/spec.md');
const block = spec.match(/<!-- ci-registry:v1 -->[^`]*```json\n([\s\S]*?)\n```/);
const registry = JSON.parse(block[1]);
const FREE = new Set(registry.freeRunners);

const workflows = Object.fromEntries(
  fs
    .readdirSync(path.join(root, '.github/workflows'))
    .filter(name => /\.ya?ml$/.test(name))
    .map(name => {
      const source = read(`.github/workflows/${name}`);
      return [name, {source, value: yaml.parse(source)}];
    }),
);
const on = value => {
  const triggers = value.on ?? value[true] ?? {};
  if (typeof triggers === 'string') return {[triggers]: {}};
  if (Array.isArray(triggers))
    return Object.fromEntries(triggers.map(e => [e, {}]));
  return Object.fromEntries(
    Object.entries(triggers).map(([e, c]) => [e, c ?? {}]),
  );
};
const TIER = {
  pull_request: 'pr',
  merge_group: 'merge-queue',
  push: 'main',
  schedule: 'schedule',
  workflow_dispatch: 'manual',
};
const derivedTiers = value =>
  new Set(Object.keys(on(value)).map(event => TIER[event] ?? 'event'));
const runners = job => {
  const runsOn = job['runs-on'];
  if (runsOn == null) return [];
  if (typeof runsOn !== 'string') return [].concat(runsOn);
  if (!runsOn.includes('${{')) return [runsOn];
  return [...runsOn.matchAll(/(?:&&|\|\|)\s*'([^']+)'/g)].map(m => m[1]);
};

const jobs = Object.entries(registry.workflows).flatMap(([name, entry]) =>
  Object.entries(entry.jobs).map(([id, declared]) => ({
    key: `${name}/${id}`,
    id,
    name,
    declared,
    job: workflows[name]?.value.jobs?.[id],
  })),
);
const waived = new Set(registry.migrations.map(m => `${m.job}#${m.rule}`));
// A rule that a listed migration still breaks is waived for that job; a
// migration whose job already follows the rule is stale and fails.
const rule = (name, key, holds) => {
  if (waived.has(`${key}#${name}`)) {
    expect(holds, `${key}: migration "${name}" is done; remove it`).toBe(false);
  } else {
    expect(holds, `${key} breaks "${name}"`).toBe(true);
  }
};

describe('CI registry (spec:AST-030 FR15)', () => {
  it('declares exactly the workflows and jobs that exist', () => {
    expect(Object.keys(registry.workflows).sort()).toEqual(
      Object.keys(workflows).sort(),
    );
    for (const [name, {value}] of Object.entries(workflows)) {
      expect(Object.keys(registry.workflows[name].jobs).sort(), name).toEqual(
        Object.keys(value.jobs ?? {}).sort(),
      );
    }
  });

  it.each(Object.keys(registry.workflows))(
    '%s declares the tiers its triggers give it',
    name => {
      const declared = new Set(registry.workflows[name].tiers);
      const expected = derivedTiers(workflows[name].value);
      if (declared.has('release')) expected.add('release').delete('manual');
      expect(declared).toEqual(expected);
      expect(registry.workflows[name].reason.length, name).toBeGreaterThan(10);
    },
  );

  it.each(Object.keys(registry.workflows))(
    '%s filters by positive paths only',
    name => {
      const pr = registry.workflows[name].tiers.includes('pr');
      const reportsRequired = Object.values(registry.requiredContexts).some(c =>
        c.startsWith(`${name}/`),
      );
      for (const [event, config] of Object.entries(on(workflows[name].value))) {
        expect(config['paths-ignore'], `${name} ${event}`).toBeUndefined();
        for (const glob of config.paths ?? [])
          expect(glob === '**' || glob.startsWith('!'), glob).toBe(false);
        if (reportsRequired)
          expect(
            config.paths,
            `${name} reports a required context`,
          ).toBeUndefined();
      }
      if (
        pr &&
        !reportsRequired &&
        !registry.workflows[name].pullRequestUpdates
      ) {
        expect(
          on(workflows[name].value).pull_request?.paths?.length,
          `${name} has no allowlist`,
        ).toBeGreaterThan(0);
      }
      if (on(workflows[name].value).pull_request_target) {
        expect(
          registry.workflows[name].pullRequestUpdates?.length ?? 0,
          name,
        ).toBeGreaterThan(10);
      }
    },
  );

  it.each(jobs.map(j => [j.key, j]))(
    '%s follows its kind',
    (key, {id, name, declared, job}) => {
      const steps = JSON.stringify(job.steps ?? []);
      const paths = on(workflows[name].value).pull_request?.paths;
      rule(
        'no-trigger-word',
        key,
        !/^(pr|main|nightly|weekly|daily)-/.test(id),
      );
      rule(
        'no-scope-job',
        key,
        declared.kind === 'runner-selection' ||
          !/(^|-)scope$|^check-components$/.test(id),
      );
      for (const label of runners(job)) {
        if (!FREE.has(label))
          rule('runner-reason', key, (declared.runnerReason ?? '').length > 10);
      }
      expect([
        'test',
        'build',
        'lint',
        'join',
        'release',
        'report',
        'runner-selection',
      ]).toContain(declared.kind);
      if (declared.kind !== 'test') return;
      rule('test-name', key, /^test-[a-z0-9]+(-[a-z0-9]+)*$/.test(id));
      rule(
        'e2e-suffix',
        key,
        /playwright|chromium/i.test(steps) === id.endsWith('-e2e'),
      );
      expect(
        declared.scope?.length,
        `${key} declares no scope`,
      ).toBeGreaterThan(0);
      for (const glob of declared.scope)
        expect(glob === '**' || glob.startsWith('!'), glob).toBe(false);
      if (paths)
        expect(declared.scope, `${key} scope is its workflow's paths`).toEqual(
          paths,
        );
      if (registry.workflows[name].tiers.includes('pr')) {
        rule(
          'scope-gated',
          key,
          Boolean(paths) || /test-scope\.mjs/.test(JSON.stringify(job)),
        );
      }
    },
  );

  it('keeps at most the one named runner-selection job', () => {
    const selectors = jobs
      .filter(j => j.declared.kind === 'runner-selection')
      .map(j => j.key);
    expect(selectors).toEqual(
      registry.runnerSelection ? [registry.runnerSelection] : [],
    );
  });

  it('reports every required context from a declared job', () => {
    for (const [context, key] of Object.entries(registry.requiredContexts)) {
      const job = jobs.find(j => j.key === key);
      expect(job?.job, `${context} → ${key}`).toBeDefined();
    }
  });

  it('declares every CI script once, and each where it is used', () => {
    const files = fs
      .readdirSync(path.join(root, '.github/scripts'), {recursive: true})
      .filter(
        f =>
          !/\.test\.[cm]?[jt]s$/.test(f) &&
          fs.statSync(path.join(root, '.github/scripts', f)).isFile(),
      );
    const used = Object.entries(registry.workflows).flatMap(([name, e]) =>
      (e.scripts ?? []).map(s => [name, s]),
    );
    const declared = [
      ...used.map(([, s]) => s),
      ...registry.sharedScripts,
      ...Object.keys(registry.localScripts),
    ];
    expect([...new Set(declared)].sort()).toEqual(files.sort());
    for (const [name, script] of used) {
      expect(
        workflows[name].source,
        `${name} does not run ${script}`,
      ).toContain(`.github/scripts/${script}`);
    }
    for (const reason of Object.values(registry.localScripts))
      expect(reason.length).toBeGreaterThan(10);
    // A shared module is loaded by a CI script, a package script or an action.
    const loaders = [
      read('package.json'),
      ...files.map(f => read(`.github/scripts/${f}`)),
    ].join('\n');
    for (const script of registry.sharedScripts) {
      expect(loaders, `${script} is loaded by nothing`).toContain(
        path.basename(script).replace(/\.[cm]?js$/, ''),
      );
    }
  });
});

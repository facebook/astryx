// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {afterEach, describe, expect, it} from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '../..');
const POLICY_FILES = [
  '.github/scripts/check-rtl-applicability-registries.mjs',
  'apps/storybook/rtl-audit/rtl-audit-coverage.mjs',
];
const temporaryDirectories = [];

function temp(name) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `astryx-${name}-`));
  temporaryDirectories.push(directory);
  return directory;
}

function write(relative, content, root) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, content);
}

function git(root, ...args) {
  return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

function initializeFixture() {
  const root = temp('rtl-policy');
  for (const file of POLICY_FILES) {
    write(file, fs.readFileSync(path.join(ROOT, file)), root);
  }
  write(
    'apps/storybook/rtl-audit/known-coverage-gaps.json',
    '["core/Removed"]\n',
    root,
  );
  write('apps/storybook/rtl-audit/verified-not-applicable.json', '[]\n', root);
  write(
    'packages/core/src/Removed/Removed.tsx',
    'export const Removed = null;\n',
    root,
  );
  git(root, 'init', '-q');
  git(root, 'config', 'user.email', 'test@example.com');
  git(root, 'config', 'user.name', 'Test');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'base');
  return {root, base: git(root, 'rev-parse', 'HEAD')};
}

function runValidator(root, script, base) {
  const output = path.join(root, 'github-output');
  const result = spawnSync(
    process.execPath,
    [script, '--base', base, '--github-output', output],
    {cwd: root, encoding: 'utf8'},
  );
  return {
    ...result,
    output: fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '',
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

describe('RTL applicability policy', () => {
  it('routes an unchanged-baseline component deletion through the full audit', () => {
    const {root, base} = initializeFixture();
    fs.rmSync(path.join(root, 'packages/core/src/Removed/Removed.tsx'));
    git(root, 'add', '-u');
    git(root, 'commit', '-qm', 'delete component');

    const result = runValidator(
      root,
      path.join(root, '.github/scripts/check-rtl-applicability-registries.mjs'),
      base,
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.output).toContain('full_audit=true\n');
    expect(result.output).toContain('audit_components=core/Removed\n');
  });

  it.each([
    ['chart component source', 'packages/charts/src/Chart.tsx'],
    ['Storybook story', 'apps/storybook/stories/Removed.stories.tsx'],
    ['curated target registry', 'apps/storybook/rtl-audit/targets.json'],
  ])('routes a changed %s through the full audit', (_label, file) => {
    const {root, base} = initializeFixture();
    write(file, '{}\n', root);
    git(root, 'add', '.');
    git(root, 'commit', '-qm', 'change applicability input');

    const result = runValidator(
      root,
      path.join(root, '.github/scripts/check-rtl-applicability-registries.mjs'),
      base,
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.output).toContain('full_audit=true\n');
  });

  it('keeps unrelated changes on the targeted path', () => {
    const {root, base} = initializeFixture();
    write('README.md', 'docs only\n', root);
    git(root, 'add', '.');
    git(root, 'commit', '-qm', 'docs');

    const result = runValidator(
      root,
      path.join(root, '.github/scripts/check-rtl-applicability-registries.mjs'),
      base,
    );

    expect(result.status, result.stderr).toBe(0);
    expect(result.output).toContain('full_audit=false\n');
  });

  it('rejects added debt with base-owned policy even if the PR helper is relaxed', () => {
    const {root, base} = initializeFixture();
    write(
      'apps/storybook/rtl-audit/known-coverage-gaps.json',
      '["core/Removed", "core/New"]\n',
      root,
    );
    write(
      'apps/storybook/rtl-audit/rtl-audit-coverage.mjs',
      [
        'export const validateKnownCoverageGaps = value => value;',
        'export const validateKnownCoverageGapTransition = () => ({removed: []});',
        'export const validateVerifiedNotApplicable = value => value;',
        'export const diffVerifiedNotApplicable = () => ({changed: [], removed: []});',
        '',
      ].join('\n'),
      root,
    );
    git(root, 'add', '.');
    git(root, 'commit', '-qm', 'attempt bypass');

    const trusted = temp('trusted-rtl-policy');
    for (const file of POLICY_FILES) {
      write(
        file,
        execFileSync('git', ['show', `${base}:${file}`], {cwd: root}),
        trusted,
      );
    }
    const result = runValidator(
      root,
      path.join(
        trusted,
        '.github/scripts/check-rtl-applicability-registries.mjs',
      ),
      base,
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'known coverage gaps baseline is removal-only; added: core/New',
    );
  });

  it('pins bootstrap policy and reuses that artifact in the blocking audit', () => {
    const workflow = fs.readFileSync(
      path.join(ROOT, '.github/workflows/ci.yml'),
      'utf8',
    );

    expect(workflow).toContain('git show "$BASE_SHA:$file"');
    expect(workflow).toContain('sha256sum --check --strict');
    expect(workflow).toContain('name: rtl-applicability-policy');
    expect(workflow).toContain('include-hidden-files: true');
    expect(workflow).toContain('Download trusted RTL applicability policy');
    expect(workflow).toContain(
      'cp .rtl-applicability-policy/apps/storybook/rtl-audit/rtl-audit.mjs',
    );
    expect(workflow).toContain(
      'cp .rtl-applicability-policy/apps/storybook/rtl-audit/rtl-audit-coverage.mjs',
    );
    expect(workflow).toContain('if [ "$FULL_AUDIT" = \'true\' ]; then');
    expect(workflow).toContain('ARGS+=(--check-known-gap-roster)');
  });
});

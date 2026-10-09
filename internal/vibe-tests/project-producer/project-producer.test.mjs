// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, expect, test} from 'vitest';
import {
  emitProjectArtifactV2,
  exportProjectGitBaselineV2,
  initializeProjectGitBaselineV2,
} from './artifact.ts';
import {
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
} from './constants.mjs';
import {createPrivateRunRoot, sanitizeChildEnv} from './process.mjs';
import {validateRunnerProfile} from './profile.mjs';
import {
  prepareProject,
  projectArtifactRecipe,
  staticHtmlStarter,
} from './projects.mjs';
import {
  parseVibeArtifactV2,
  sha256GitTreeBaselineV2,
  sha256TreeV2,
} from '../src/vibe-artifact-v2.ts';

const temporaryRoots = [];

async function temporaryRoot(prefix = 'project-producer-test-') {
  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map(root => fs.promises.rm(root, {recursive: true, force: true})),
  );
});

function successfulRunner(overrides = {}) {
  return {
    name: 'test-runner',
    harness: 'test-harness',
    model: 'test-model',
    status: 'succeeded',
    startedAt: '2026-10-09T12:00:00.000Z',
    finishedAt: '2026-10-09T12:00:01.000Z',
    durationMs: 1000,
    attempt: 1,
    exitCode: 0,
    signal: null,
    usage: {inputTokens: 12, outputTokens: 34},
    toolCalls: 2,
    cliLookups: 1,
    transcriptAudit: {
      passed: true,
      classification: 'strict-clean',
      strictFindings: [],
      adjustedFindings: [],
    },
    ...overrides,
  };
}

async function scaffoldStaticProject(root) {
  const projectDir = path.join(root, 'project');
  const baselineDir = path.join(root, 'baseline-export');
  const spec = getDeliverySpecs({
    staticConfig: {stylesheets: [], scripts: []},
  })['static-html'];
  await prepareProject(spec, projectDir);
  const baselineCommit = initializeProjectGitBaselineV2(projectDir);
  await exportProjectGitBaselineV2(projectDir, baselineCommit, baselineDir);
  return {projectDir, baselineDir, baselineCommit, spec};
}

test('generated prompts vary only by factual delivery details', () => {
  const prompt = {
    id: 'one',
    category: 'test',
    prompt: 'Build a settings card.',
  };
  const specs = getDeliverySpecs();
  const build = buildTaskPrompt(prompt, specs['react-build'], '<project>');
  const noBuild = buildTaskPrompt(prompt, specs['react-nobuild'], '<project>');
  expect(build).toContain(prompt.prompt);
  expect(noBuild).toContain(prompt.prompt);
  expect(build).toContain('src/App.tsx');
  expect(noBuild).toContain('index.html');
  expect(build).not.toContain('expectedComponents');
  expect(noBuild).not.toContain('expectedComponents');
});

test('stratified prompt selection is stable and covers categories first', () => {
  const testSet = {
    prompts: [
      {id: 'a1', category: 'a'},
      {id: 'a2', category: 'a'},
      {id: 'b1', category: 'b'},
      {id: 'c1', category: 'c'},
    ],
  };
  const first = selectPrompts(testSet, {sample: 3, seed: 'stable'});
  const second = selectPrompts(testSet, {sample: 3, seed: 'stable'});
  expect(first).toEqual(second);
  expect(new Set(first.map(prompt => prompt.category))).toEqual(
    new Set(['a', 'b', 'c']),
  );
});

test('runner profiles accept executor identity and reject evaluator ownership', () => {
  const profile = {
    schemaVersion: 1,
    sandbox: {root: '/sandbox', projectDir: '/sandbox/project'},
    launcher: {command: 'launcher', args: ['{runnerCommand}', '{runnerArgs}']},
    preflight: {command: 'check', args: []},
    runners: {
      agent: {
        harness: 'native',
        model: 'model-v1',
        command: 'agent',
        args: [],
        transcript: {format: 'jsonl', toolCalls: []},
        audit: {rules: []},
      },
    },
  };
  expect(validateRunnerProfile(profile)).toBe(profile);
  expect(() =>
    validateRunnerProfile({...profile, judge: {command: 'judge', args: []}}),
  ).toThrow('judging belongs to the shared evaluator');
});

test('runner profile inputs are removed from child environments', () => {
  expect(
    sanitizeChildEnv({
      PATH: '/bin',
      VIBE_RUNNER_PROFILE: '/private/profile.json',
      VIBE_RUNNER_PROFILE_JSON: '{"secret":true}',
    }),
  ).toEqual({PATH: '/bin'});
});

test('private producer roots use mode 0700', async () => {
  const privateRun = await createPrivateRunRoot('producer-test-');
  temporaryRoots.push(privateRun.root);
  expect((await fs.promises.stat(privateRun.root)).mode & 0o777).toBe(0o700);
});

test('static scaffolds work without an optional CLI package', async () => {
  const root = await temporaryRoot();
  const projectDir = path.join(root, 'project');
  const spec = getDeliverySpecs({
    staticConfig: {
      stylesheets: ['https://cdn.example.com/system.css'],
      scripts: ['https://cdn.example.com/system.js'],
    },
  })['static-html'];
  await prepareProject(spec, projectDir);
  expect(
    await fs.promises.readFile(path.join(projectDir, 'index.html'), 'utf8'),
  ).toContain('https://cdn.example.com/system.css');
  expect(fs.existsSync(path.join(projectDir, 'package.json'))).toBe(false);
  expect(projectArtifactRecipe(spec)).toEqual({
    view: {kind: 'static', root: 'source', entry: 'source/index.html'},
    network: {
      mode: 'record',
      allowedOrigins: ['https://cdn.example.com'],
    },
    entryHints: ['source/index.html'],
  });
  expect(staticHtmlStarter({stylesheets: [], scripts: []})).toContain(
    'Static HTML starter',
  );
});

test('git-tree digest is portable content SHA-256, not a Git object ID', async () => {
  const root = await temporaryRoot();
  const projectDir = path.join(root, 'project');
  const baselineDir = path.join(root, 'baseline');
  await fs.promises.mkdir(projectDir, {recursive: true});
  await fs.promises.writeFile(
    path.join(projectDir, '.gitignore'),
    'node_modules/\n',
  );
  await fs.promises.writeFile(path.join(projectDir, 'B.html'), 'upper\n');
  await fs.promises.writeFile(path.join(projectDir, 'a.html'), 'lower\n');
  await fs.promises.writeFile(path.join(projectDir, 'é.html'), 'accent\n');
  const commit = initializeProjectGitBaselineV2(projectDir);
  await fs.promises.writeFile(
    path.join(projectDir, 'untracked.txt'),
    'later\n',
  );
  await exportProjectGitBaselineV2(projectDir, commit, baselineDir);

  expect(fs.existsSync(path.join(baselineDir, 'untracked.txt'))).toBe(false);
  const digest = sha256GitTreeBaselineV2(root, 'baseline');
  expect(digest).toBe(
    '4bf575cc25f8cfaec9aa60c90ceeeed9e55efa67d85f7ca3977fa562c4d1e3af',
  );
  expect(digest).toBe(sha256TreeV2(root, 'baseline'));
  expect(digest).not.toBe(commit);

  await fs.promises.chmod(path.join(baselineDir, 'B.html'), 0o755);
  expect(sha256GitTreeBaselineV2(root, 'baseline')).toBe(digest);
});

test('git-tree export rejects tracked symlinks rather than changing semantics', async () => {
  const root = await temporaryRoot();
  const projectDir = path.join(root, 'project');
  await fs.promises.mkdir(projectDir, {recursive: true});
  await fs.promises.writeFile(path.join(projectDir, 'target.txt'), 'target\n');
  await fs.promises.symlink('target.txt', path.join(projectDir, 'link.txt'));
  const commit = initializeProjectGitBaselineV2(projectDir);
  await expect(
    exportProjectGitBaselineV2(projectDir, commit, path.join(root, 'baseline')),
  ).rejects.toThrow('symlinks and submodules are not portable');
});

test('project producer emits an immutable git-baselined artifact without scores', async () => {
  const root = await temporaryRoot();
  const {projectDir, baselineDir, baselineCommit, spec} =
    await scaffoldStaticProject(root);
  await fs.promises.writeFile(
    path.join(projectDir, 'TASK.md'),
    'private prompt',
  );
  await fs.promises.writeFile(
    path.join(projectDir, 'index.html'),
    '<!doctype html><title>Authored result</title>\n',
  );
  await fs.promises.writeFile(
    path.join(projectDir, 'added.css'),
    'body { color: CanvasText; }\n',
  );
  await fs.promises.mkdir(path.join(projectDir, 'dist'));
  await fs.promises.writeFile(
    path.join(projectDir, 'dist', 'runner-output.txt'),
    'raw runner output\n',
  );
  await fs.promises.rm(path.join(projectDir, 'AGENTS.md'));

  const bundleRoot = path.join(root, 'artifact');
  const recipe = projectArtifactRecipe(spec);
  const artifact = await emitProjectArtifactV2({
    bundleRoot,
    projectDir,
    baselineDir,
    baselineCommit,
    prompt: {id: 'prompt-1', text: 'Build an interface.'},
    deliveryMode: 'static-html',
    view: recipe.view,
    network: recipe.network,
    entryHints: recipe.entryHints,
    runner: successfulRunner(),
  });

  expect(parseVibeArtifactV2(artifact)).toEqual(artifact);
  expect(artifact.source.baseline.kind).toBe('git-tree');
  expect(artifact.source.baseline.digest.value).toBe(
    sha256GitTreeBaselineV2(bundleRoot, 'baseline'),
  );
  expect(artifact.integrity.sourceTree.value).toBe(
    sha256TreeV2(bundleRoot, 'source'),
  );
  expect(artifact.integrity.viewInput).toEqual(artifact.integrity.sourceTree);
  expect(fs.existsSync(path.join(bundleRoot, 'baseline', 'AGENTS.md'))).toBe(
    true,
  );
  expect(fs.existsSync(path.join(bundleRoot, 'source', 'AGENTS.md'))).toBe(
    false,
  );
  expect(fs.existsSync(path.join(bundleRoot, 'source', 'TASK.md'))).toBe(false);
  expect(fs.existsSync(path.join(bundleRoot, 'source', '.git'))).toBe(false);
  expect(fs.existsSync(path.join(bundleRoot, 'source', 'added.css'))).toBe(
    true,
  );
  expect(
    fs.existsSync(path.join(bundleRoot, 'source', 'dist', 'runner-output.txt')),
  ).toBe(true);

  const keys = new Set();
  const visit = value => {
    if (Array.isArray(value)) {
      value.forEach(visit);
    } else if (value && typeof value === 'object') {
      for (const [key, nested] of Object.entries(value)) {
        keys.add(key);
        visit(nested);
      }
    }
  };
  visit(artifact);
  expect(keys).not.toContain('evaluation');
  expect(keys).not.toContain('scores');
  expect(keys).not.toContain('aggregate');
  expect(keys).not.toContain('report');
  expect(keys).not.toContain('screenshot');

  const usage = JSON.parse(
    await fs.promises.readFile(
      path.join(bundleRoot, 'provenance', 'usage.json'),
      'utf8',
    ),
  );
  expect(usage).toMatchObject({
    runner: 'test-runner',
    status: 'succeeded',
    usage: {inputTokens: 12, outputTokens: 34},
  });
  expect(JSON.stringify(usage)).not.toContain(root);
  expect(JSON.stringify(artifact)).not.toContain('Build an interface.');
});

test('runner failure remains provenance and still emits authored bytes', async () => {
  const root = await temporaryRoot();
  const {projectDir, baselineDir, baselineCommit, spec} =
    await scaffoldStaticProject(root);
  await fs.promises.writeFile(
    path.join(projectDir, 'index.html'),
    '<!doctype html><title>Partial result</title>\n',
  );
  const recipe = projectArtifactRecipe(spec);
  const artifact = await emitProjectArtifactV2({
    bundleRoot: path.join(root, 'failed-artifact'),
    projectDir,
    baselineDir,
    baselineCommit,
    prompt: {id: 'prompt-failed', text: 'Build a partial interface.'},
    deliveryMode: 'static-html',
    view: recipe.view,
    network: recipe.network,
    entryHints: recipe.entryHints,
    runner: successfulRunner({
      status: 'failed',
      exitCode: 1,
      transcriptAudit: {
        passed: false,
        classification: 'strict-failure',
        strictFindings: [{label: 'required initialization missing'}],
        adjustedFindings: [],
      },
    }),
  });
  expect(artifact.provenance.execution.execution?.status).toBe('failed');
  expect(artifact.integrity.sourceTree.value).toMatch(/^[a-f0-9]{64}$/);
  const usage = await fs.promises.readFile(
    path.join(root, 'failed-artifact', 'provenance', 'usage.json'),
    'utf8',
  );
  expect(usage).not.toContain('required initialization missing');
  expect(JSON.parse(usage).transcriptAudit).toMatchObject({
    passed: false,
    strictFindingCount: 1,
    adjustedFindingCount: 0,
  });
});

test('dry run needs neither a runner profile nor an agent CLI', () => {
  const repoRoot = path.resolve(here(), '..', '..', '..');
  const tsx = path.resolve(here(), '..', 'node_modules', '.bin', 'tsx');
  const result = spawnSync(
    tsx,
    [path.join(here(), 'run.mjs'), '--dry-run', '--sample', '1'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: sanitizeChildEnv(process.env),
    },
  );
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('## ');
  expect(result.stdout).toContain('react-build');
  expect(result.stdout).toContain('react-nobuild');
  expect(result.stdout).not.toContain('expectedComponents');
});

function here() {
  return path.dirname(new URL(import.meta.url).pathname);
}

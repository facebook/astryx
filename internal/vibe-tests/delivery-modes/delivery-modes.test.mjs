// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, test} from 'vitest';
import {checkpointIsComplete} from './checkpoint.mjs';
import {
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
} from './constants.mjs';
import {
  captureAuthoredSources,
  evaluateRun,
  resolveJudgeAttempts,
  scanAuthoredSource,
  startStaticServer,
} from './evaluator.mjs';
import {
  auditTranscript,
  countAstryxInvocations,
  countCliLookups,
  countToolCalls,
  createPrivateRunRoot,
  extractToolCommands,
  parseUsage,
  runCommand,
  runProfilePreflight,
  sanitizeChildEnv,
} from './process.mjs';
import {renderCommand, validateRunnerProfile, wrapCommand} from './profile.mjs';
import {
  prepareProject,
  reactNoBuildStarter,
  staticHtmlStarter,
  validateStaticConfig,
} from './projects.mjs';
import {buildReports, summarize} from './report.mjs';
import {resolveConcurrency, runInPhases} from './scheduler.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const temporaryDirectories = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory =>
        fs.promises.rm(directory, {recursive: true, force: true}),
      ),
  );
});

test('generated prompts differ only by factual delivery details', () => {
  const specs = getDeliverySpecs();
  const prompt = {
    id: 'x-1',
    prompt: 'Build a settings card.',
    expectedComponents: ['Card', 'Switch'],
  };
  const generated = Object.values(specs).map(spec =>
    buildTaskPrompt(prompt, spec, '<project-dir>', {timeoutMinutes: 15}),
  );
  for (const task of generated) {
    assert.doesNotMatch(task, /expectedComponents|Switch/);
    assert.match(task, /Build a settings card\./);
    assert.match(task, /use only the documentation and tools installed there/);
    assert.match(task, /You have up to 15 minutes/);
  }
  const normalized = generated.map(task =>
    task.replace(/Delivery environment:\n[^\n]+/, 'Delivery environment:\n<x>'),
  );
  assert.equal(new Set(normalized).size, 2);
  assert.match(generated[0], /src\/App\.tsx/);
  assert.match(generated[1], /index\.html/);
});

test('stratified sampling is stable and covers categories first', () => {
  const testSet = {
    prompts: [
      {id: 'a1', category: 'a'},
      {id: 'a2', category: 'a'},
      {id: 'b1', category: 'b'},
      {id: 'c1', category: 'c'},
    ],
  };
  const first = selectPrompts(testSet, {sample: 3, seed: 'fixed'});
  const second = selectPrompts(testSet, {sample: 3, seed: 'fixed'});
  assert.deepEqual(first, second);
  assert.equal(new Set(first.map(prompt => prompt.category)).size, 3);
});

test('React no-build starter shares React across core and theme', () => {
  const starter = reactNoBuildStarter('0.6.5');
  assert.match(
    starter,
    /@astryxdesign\/core@0\.6\.5\?external=react,react-dom/,
  );
  assert.match(
    starter,
    /@astryxdesign\/theme-neutral@0\.6\.5\/built\?external=react,react-dom/,
  );
  assert.match(starter, /React\.useState/);
  assert.match(starter, /A\.Banner/);
  assert.match(starter, /A\.TextInput/);
});

test('static-html renders configured assets without product-specific pins', () => {
  const source = staticHtmlStarter({
    stylesheets: ['https://cdn.example.test/system.css'],
    scripts: ['https://cdn.example.test/system.js'],
    htmlAttributes: {'data-theme': 'neutral'},
    starterBody: '  <main class="system-card">Starter</main>',
  });
  assert.match(source, /cdn\.example\.test\/system\.css/);
  assert.match(source, /cdn\.example\.test\/system\.js/);
  assert.match(source, /data-theme="neutral"/);
  assert.match(source, /system-card/);
  assert.doesNotMatch(source, /astryx-vanilla|web-components/);
});

test('static-html project works without an optional CLI tarball', async () => {
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-static-'),
  );
  temporaryDirectories.push(root);
  await prepareProject(
    {
      name: 'static-html',
      staticConfig: {
        stylesheets: ['https://cdn.example.test/system.css'],
        scripts: [],
      },
    },
    root,
  );
  assert.equal(fs.existsSync(path.join(root, 'index.html')), true);
  assert.equal(fs.existsSync(path.join(root, 'AGENTS.md')), true);
  assert.equal(fs.existsSync(path.join(root, 'package.json')), false);
});

test('static-html config validates URL collections and optional values', () => {
  assert.doesNotThrow(() =>
    validateStaticConfig({
      stylesheets: [],
      scripts: [],
      cliTarballUrl: 'https://cdn.example.test/cli.tgz',
    }),
  );
  assert.throws(
    () => validateStaticConfig({stylesheets: 'not-an-array'}),
    /stylesheets must be an array/,
  );
});

const exampleTranscriptAdapter = {
  format: 'jsonl',
  toolCalls: [
    {
      matches: [{path: 'kind', equals: 'tool-call'}],
      commandPath: 'payload.command',
    },
  ],
  usage: {
    matches: [{path: 'kind', equals: 'usage'}],
    inputTokensPath: 'payload.inputTokens',
    outputTokensPath: 'payload.outputTokens',
  },
};

function exampleProfile() {
  return {
    schemaVersion: 1,
    sandbox: {root: '/isolated', projectDir: '/isolated/project'},
    launcher: {
      command: '/path/to/launcher',
      args: [
        '--root',
        '{privateRoot}',
        '--cwd',
        '{runnerCwd}',
        '--',
        '{runnerCommand}',
        '{runnerArgs}',
      ],
    },
    preflight: {
      command: '/bin/sh',
      args: ['-lc', 'true'],
      cwd: '{sandboxProject}',
    },
    evaluator: {
      command: '/path/to/node',
      args: [
        '/path/to/evaluator.mjs',
        '--worker',
        '{evaluationInput}',
        '{evaluationOutput}',
      ],
      cwd: '{sandboxProject}',
    },
    isolationProbe: {
      command: '/path/to/node',
      args: ['{probeFile}'],
      cwd: '{sandboxProject}',
    },
    runners: {
      sample: {
        command: '/path/to/runner',
        args: ['--workspace', '{sandboxProject}'],
        stdin: 'prompt',
        transcript: structuredClone(exampleTranscriptAdapter),
        audit: {rules: []},
      },
    },
    judge: {
      command: '/path/to/judge',
      args: ['--schema', '{schema}'],
      stdin: 'prompt',
      transcript: structuredClone(exampleTranscriptAdapter),
      audit: {rules: []},
    },
  };
}

async function writePassthroughLauncher(root) {
  const launcherPath = path.join(root, 'launcher.mjs');
  await fs.promises.writeFile(
    launcherPath,
    `import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
const [privateRoot, runnerCwd, command, ...args] = process.argv.slice(2);
const map = value => value.replaceAll('/isolated-run', privateRoot);
const mappedArgs = args.map(map);
for (const argument of mappedArgs) {
  if (argument.endsWith('.evaluation-input.json') && fs.existsSync(argument)) {
    fs.writeFileSync(
      argument,
      fs.readFileSync(argument, 'utf8').replaceAll('/isolated-run', privateRoot),
    );
  }
}
const child = spawnSync(map(command), mappedArgs, {
  cwd: map(runnerCwd),
  env: process.env,
  stdio: 'inherit',
});
if (child.error) throw child.error;
process.exit(child.status ?? 1);
`,
  );
  return launcherPath;
}

function usePassthroughLauncher(profile, launcherPath, env = {}) {
  profile.sandbox = {
    root: '/isolated-run',
    projectDir: '/isolated-run/project',
  };
  profile.launcher = {
    command: process.execPath,
    args: [
      launcherPath,
      '{privateRoot}',
      '{runnerCwd}',
      '{runnerCommand}',
      '{runnerArgs}',
    ],
    env,
  };
}

test('runner profile validates generic commands and audit classes', () => {
  assert.equal(validateRunnerProfile(exampleProfile()).schemaVersion, 1);
  const invalid = exampleProfile();
  invalid.runners.sample.audit.rules = [
    {
      label: 'bad class',
      source: 'stdout',
      kind: 'required',
      class: 'warning',
      pattern: 'ready',
    },
  ];
  assert.throws(() => validateRunnerProfile(invalid), /class is invalid/);
});

test('runner profile is removed from child environments', () => {
  assert.deepEqual(
    sanitizeChildEnv({
      PATH: '/bin',
      VIBE_RUNNER_PROFILE: '/private/profile.json',
      VIBE_RUNNER_PROFILE_JSON: '{"secret":true}',
    }),
    {PATH: '/bin'},
  );
  const invalid = exampleProfile();
  invalid.runners.sample.env = {
    VIBE_RUNNER_PROFILE: '/private/profile.json',
  };
  assert.throws(
    () => validateRunnerProfile(invalid),
    /cannot expose the runner profile/,
  );
});

test('child processes cannot inherit runner profile inputs', async () => {
  const result = await runCommand(
    process.execPath,
    [
      '-e',
      'process.stdout.write(JSON.stringify({file: process.env.VIBE_RUNNER_PROFILE ?? null, inline: process.env.VIBE_RUNNER_PROFILE_JSON ?? null, visible: process.env.VISIBLE_TEST_VALUE}))',
    ],
    {
      env: {
        VIBE_RUNNER_PROFILE: '/private/profile.json',
        VIBE_RUNNER_PROFILE_JSON: '{"secret":true}',
        VISIBLE_TEST_VALUE: 'visible',
      },
    },
  );
  assert.equal(result.code, 0);
  assert.deepEqual(JSON.parse(result.stdout), {
    file: null,
    inline: null,
    visible: 'visible',
  });
});

test('profile command rendering and launcher wrapping preserve argument boundaries', () => {
  const profile = exampleProfile();
  const values = {
    privateRoot: '/host/private',
    projectDir: '/host/private/project',
    sandboxRoot: '/isolated',
    sandboxProject: '/isolated/project',
    taskFile: '/isolated/project/TASK.md',
    prompt: 'do work',
    schema: '{}',
  };
  const runner = renderCommand(profile.runners.sample, values);
  const wrapped = wrapCommand(profile.launcher, runner, values);
  assert.deepEqual(wrapped.args, [
    '--root',
    '/host/private',
    '--cwd',
    '/isolated/project',
    '--',
    '/path/to/runner',
    '--workspace',
    '/isolated/project',
  ]);
  assert.equal(wrapped.input, 'do work');
});

test('transcript audit separates strict failures from adjusted findings', () => {
  const audit = auditTranscript(
    'ready\n',
    'compatibility warning\n',
    {
      rules: [
        {
          label: 'initialization receipt',
          source: 'stdout',
          kind: 'required',
          class: 'strict',
          pattern: 'ready',
        },
        {
          label: 'compatibility warning',
          source: 'stderr',
          kind: 'forbidden',
          class: 'adjusted',
          pattern: 'warning',
        },
      ],
    },
    exampleTranscriptAdapter,
  );
  assert.equal(audit.passed, true);
  assert.equal(audit.classification, 'adjusted');
  assert.equal(audit.adjustedFindings.length, 1);

  const failed = auditTranscript(
    '',
    '',
    {
      rules: [
        {
          label: 'initialization receipt',
          source: 'stdout',
          kind: 'required',
          class: 'strict',
          pattern: 'ready',
        },
      ],
    },
    exampleTranscriptAdapter,
  );
  assert.equal(failed.passed, false);
  assert.equal(failed.classification, 'strict-failure');
});

test('profile adapter controls generic JSONL tool and usage parsing', () => {
  const commands = [
    'npx astryx component Button',
    'pnpm exec astryx docs principles',
    './node_modules/.bin/astryx component Card',
  ];
  assert.equal(
    commands.reduce(
      (total, command) => total + countAstryxInvocations(command),
      0,
    ),
    3,
  );
  const transcript = [
    ...commands.map(command =>
      JSON.stringify({kind: 'tool-call', payload: {command}}),
    ),
    JSON.stringify({
      kind: 'usage',
      payload: {inputTokens: 10, outputTokens: 2},
    }),
    JSON.stringify({
      kind: 'usage',
      payload: {inputTokens: 20, outputTokens: 4},
    }),
  ].join('\n');
  assert.equal(countToolCalls(transcript, exampleTranscriptAdapter), 3);
  assert.deepEqual(
    extractToolCommands(transcript, exampleTranscriptAdapter),
    commands,
  );
  assert.equal(countCliLookups(transcript, exampleTranscriptAdapter), 3);
  assert.deepEqual(parseUsage(transcript, exampleTranscriptAdapter), {
    inputTokens: 20,
    outputTokens: 4,
  });
});

test('source scanner separates comments and theme definitions', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-source-'),
  );
  temporaryDirectories.push(directory);
  await fs.promises.writeFile(
    path.join(directory, 'index.html'),
    `<!-- #fff 12px --><style>:root { --surface: #fff; } .x { color: #123456; padding: 12px; }</style><div style="color: var(--surface)">x</div>`,
  );
  const baseline = await captureAuthoredSources(directory);
  await fs.promises.appendFile(
    path.join(directory, 'index.html'),
    '<div style="margin: 8px">new</div>',
  );
  const source = await scanAuthoredSource(directory, baseline);
  assert.equal(source.authoredFileCount, 1);
  assert.ok(source.hardCodedStyleCount > 0);
  assert.ok(source.themeDefinitionCount >= 0);
});

test('failed judge audits retry once and discard unsafe scores', () => {
  const failed = {
    promptFulfillment: 99,
    visualQuality: 99,
    success: true,
    contextAudit: {passed: false, strictFindings: [{label: 'unsafe'}]},
  };
  assert.equal(resolveJudgeAttempts([failed], false), null);
  const resolved = resolveJudgeAttempts([failed, failed], true);
  assert.equal(resolved.judgeUnavailable, true);
  assert.equal(resolved.promptFulfillment, null);
  assert.equal(resolved.visualQuality, null);
});

test('judge crashes retry once and report recovery', () => {
  const crashed = {
    failureKind: 'process',
    error: 'judge process exited unexpectedly',
  };
  const accepted = {
    promptFulfillment: 75,
    visualQuality: 80,
    success: true,
    notes: 'Complete.',
    failureReasons: [],
    contextAudit: {passed: true},
  };
  assert.equal(resolveJudgeAttempts([crashed], false), null);
  const resolved = resolveJudgeAttempts([crashed, accepted], false);
  assert.equal(resolved.judgeUnavailable, undefined);
  assert.equal(resolved.rejudged, true);
  assert.equal(resolved.attempts.length, 2);
  assert.equal(resolved.attempts[0].error, crashed.error);
});

test('private run roots use mode 0700', async () => {
  const privateRun = await createPrivateRunRoot('test-');
  temporaryDirectories.push(privateRun.root);
  const mode = (await fs.promises.stat(privateRun.root)).mode & 0o777;
  assert.equal(mode, 0o700);
  assert.equal(
    (await fs.promises.stat(privateRun.projectDir)).isDirectory(),
    true,
  );
});

test('runner phases finish before any cell is scored', async () => {
  const events = [];
  const {results} = await runInPhases([1, 2], 2, {
    prepare: async value => {
      await new Promise(resolve => setTimeout(resolve, value === 1 ? 30 : 5));
      events.push(`runner-${value}`);
      return value;
    },
    evaluate: async value => {
      assert.equal(
        events.filter(event => event.startsWith('runner-')).length,
        2,
      );
      events.push(`score-${value}`);
      return value * 10;
    },
  });
  assert.deepEqual(results, [10, 20]);
  assert.ok(events.indexOf('score-1') > events.indexOf('runner-1'));
  assert.ok(events.indexOf('score-2') > events.indexOf('runner-1'));
});

test('parallel concurrency requires a passing isolation probe', () => {
  assert.deepEqual(resolveConcurrency(4, {}), {
    requested: 4,
    effective: 1,
    fallbackReason: 'parallel PID and network isolation was not proven',
  });
  assert.deepEqual(resolveConcurrency(4, {parallelIsolation: {passed: true}}), {
    requested: 4,
    effective: 4,
    fallbackReason: null,
  });
});

test('evaluator static servers choose independent ephemeral ports', async () => {
  const roots = await Promise.all(
    ['a', 'b'].map(async name => {
      const root = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), `delivery-server-${name}-`),
      );
      temporaryDirectories.push(root);
      await fs.promises.writeFile(path.join(root, 'index.html'), name);
      return root;
    }),
  );
  const servers = await Promise.all(roots.map(root => startStaticServer(root)));
  try {
    assert.notEqual(new URL(servers[0].url).port, new URL(servers[1].url).port);
    assert.equal(await (await fetch(servers[0].url)).text(), 'a');
    assert.equal(await (await fetch(servers[1].url)).text(), 'b');
  } finally {
    await Promise.all(servers.map(server => server.stop()));
  }
});

test('react build and serving execute through the evaluator launcher', async () => {
  const launcherRoot = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-evaluator-launcher-'),
  );
  temporaryDirectories.push(launcherRoot);
  const launcherPath = await writePassthroughLauncher(launcherRoot);
  const privateRun = await createPrivateRunRoot('evaluator-test-');
  temporaryDirectories.push(privateRun.root);
  await fs.promises.writeFile(
    path.join(privateRun.projectDir, 'package.json'),
    `${JSON.stringify({
      type: 'module',
      scripts: {
        typecheck: 'node typecheck.mjs',
        build: 'node build.mjs',
      },
    })}\n`,
  );
  await fs.promises.writeFile(
    path.join(privateRun.projectDir, 'typecheck.mjs'),
    "if (process.env.EVALUATOR_SANDBOX_SENTINEL !== 'present') process.exit(2);\n",
  );
  await fs.promises.writeFile(
    path.join(privateRun.projectDir, 'build.mjs'),
    `import * as fs from 'node:fs';
if (process.env.EVALUATOR_SANDBOX_SENTINEL !== 'present') process.exit(2);
fs.mkdirSync('dist', {recursive: true});
fs.writeFileSync('dist/index.html', '<!doctype html><main><h1>Sandbox evaluator proof</h1><p>The isolated build completed successfully.</p><button>Done</button></main>');
`,
  );
  const baselineSources = await captureAuthoredSources(privateRun.projectDir);
  const profile = exampleProfile();
  usePassthroughLauncher(profile, launcherPath, {
    EVALUATOR_SANDBOX_SENTINEL: 'present',
  });
  profile.evaluator = {
    command: process.execPath,
    args: [
      path.join(here, 'evaluator.mjs'),
      '--worker',
      '{evaluationInput}',
      '{evaluationOutput}',
    ],
    cwd: '{sandboxProject}',
  };
  const evaluation = await evaluateRun({
    config: 'react-build',
    privateRun,
    prompt: {prompt: 'Render the proof page.'},
    screenshotPath: path.join(privateRun.root, 'screenshot.png'),
    baselineSources,
    skipJudge: true,
    profile,
  });
  assert.equal(evaluation.typecheck.passed, true);
  assert.equal(evaluation.build.passed, true);
  assert.equal(
    evaluation.render.passed,
    true,
    JSON.stringify(evaluation.render),
  );
  assert.equal(evaluation.judge.skipped, true);
});

test('isolation probe rejects a shared PID, network, and proc namespace', async () => {
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-launcher-'),
  );
  temporaryDirectories.push(root);
  const launcherPath = await writePassthroughLauncher(root);
  const profile = exampleProfile();
  usePassthroughLauncher(profile, launcherPath);
  profile.preflight = {
    command: process.execPath,
    args: ['-e', "require('node:fs').accessSync('input.txt')"],
    cwd: '{sandboxProject}',
  };
  profile.isolationProbe = {
    command: process.execPath,
    args: ['{probeFile}'],
    cwd: '{sandboxProject}',
  };
  const receipt = await runProfilePreflight(profile);
  assert.equal(receipt.parallelIsolation.passed, false);
  assert.equal(receipt.parallelIsolation.pidNamespacePrivate, false);
  assert.equal(receipt.parallelIsolation.networkNamespacePrivate, false);
  assert.equal(receipt.parallelIsolation.siblingProcUnreadable, false);
  assert.equal(receipt.parallelIsolation.portCollisionContained, false);
  assert.equal(receipt.parallelIsolation.processKillContained, false);
});

test('summary includes failure zeros in medians and sample counts', () => {
  const results = [
    makeResult({passed: true, value: 80}),
    makeResult({passed: false, value: 0}),
  ];
  const [summary] = summarize(results);
  assert.equal(summary.runs, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.medianVisualQuality, 40);
  assert.equal(summary.samples.visual, 2);
});

test('infrastructure failures are unscored and resumable', () => {
  const scored = makeResult({passed: true, value: 80});
  scored.finishedAt = '2026-10-06T00:00:00.000Z';
  scored.completed = true;
  const infrastructureFailure = {
    config: 'react-build',
    agent: 'sample',
    finishedAt: '2026-10-06T00:00:01.000Z',
    completed: false,
    infrastructureFailure: {
      phase: 'setup',
      retryable: true,
      message: 'package registry unavailable',
    },
  };
  const [summary] = summarize([scored, infrastructureFailure]);
  assert.equal(summary.attempts, 2);
  assert.equal(summary.runs, 1);
  assert.equal(summary.infrastructureFailures, 1);
  assert.equal(summary.passRate, 1);
  assert.equal(summary.medianVisualQuality, 80);
  assert.equal(checkpointIsComplete(scored), true);
  assert.equal(checkpointIsComplete(infrastructureFailure), false);
});

test('reports expose infrastructure and judge attempt failures', async () => {
  const outputDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-report-'),
  );
  temporaryDirectories.push(outputDir);
  const scored = makeResult({passed: true, value: 80});
  Object.assign(scored, {
    id: 'prompt-react-build-sample',
    promptId: 'prompt',
    outputDir,
    screenshotPath: null,
  });
  scored.evaluation.judge = {
    configBlind: true,
    promptFulfillment: null,
    visualQuality: null,
    success: null,
    judgeUnavailable: true,
    attempts: [
      {attempt: 1, failureKind: 'process', error: 'judge crashed'},
      {attempt: 2, failureKind: 'process', error: 'judge crashed again'},
    ],
  };
  const infrastructureFailure = {
    id: 'prompt-react-build-sample-infra',
    promptId: 'prompt',
    config: 'react-build',
    agent: 'sample',
    outputDir,
    screenshotPath: null,
    infrastructureFailure: {
      phase: 'setup',
      retryable: true,
      message: 'registry unavailable',
    },
  };
  const report = await buildReports({
    outputDir,
    iterationId: 'test',
    results: [scored, infrastructureFailure],
  });
  const markdown = await fs.promises.readFile(report.markdownPath, 'utf8');
  assert.equal(report.summary[0].judgeUnavailable, 1);
  assert.equal(report.summary[0].infrastructureFailures, 1);
  assert.match(markdown, /Infrastructure failures/);
  assert.match(markdown, /registry unavailable \(unscored; retryable\)/);
  assert.match(markdown, /Judge retries and failures/);
  assert.match(markdown, /attempt 1: process — judge crashed/);
});

test('--dry-run needs neither a runner profile nor an agent CLI', () => {
  const result = spawnSync(
    process.execPath,
    [path.join(here, 'run.mjs'), '--dry-run', '--sample', '1'],
    {
      cwd: path.resolve(here, '../../..'),
      env: {
        ...process.env,
        VIBE_RUNNER_PROFILE: '',
        VIBE_RUNNER_PROFILE_JSON: '',
      },
      encoding: 'utf8',
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /### react-build/);
  assert.match(result.stdout, /### react-nobuild/);
  assert.doesNotMatch(result.stdout, /static-html/);
});

function makeResult({passed, value}) {
  return {
    config: 'react-build',
    agent: 'sample',
    runner: {
      durationMs: value * 1000,
      timedOut: false,
      usage: {inputTokens: value, outputTokens: 0},
      cliLookups: value,
      transcriptAudit: {passed: true, adjustedFindings: []},
    },
    evaluation: {
      render: {passed, adoptionShare: value / 100},
      source: {
        hardCodedStyleCount: value,
        themeDefinitionCount: value,
      },
      accessibility: {violationCount: value},
      typecheck: {errorCount: value},
      judge: {
        promptFulfillment: value,
        visualQuality: value,
      },
    },
  };
}

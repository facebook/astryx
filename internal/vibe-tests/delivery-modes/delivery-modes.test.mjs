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
} from './evaluator.mjs';
import {
  auditTranscript,
  countAstryxInvocations,
  countCliLookups,
  countToolCalls,
  createPrivateRunRoot,
  extractToolCommands,
  parseUsage,
  probeBrowserHelper,
  runCommand,
  sanitizeChildEnv,
} from './process.mjs';
import {renderCommand, validateRunnerProfile, wrapCommand} from './profile.mjs';
import {
  compareCapabilities,
  parseCapabilityReceipt,
} from './runner-adapter.mjs';
import {
  prepareProject,
  reactNoBuildStarter,
  staticHtmlStarter,
  validateStaticConfig,
} from './projects.mjs';
import {buildReports, summarize, summarizeRunnerVersions} from './report.mjs';

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
    assert.match(task, /available on PATH as `screenshot`/);
    assert.match(
      task,
      /Invoke it as `screenshot <file-or-url> \[output\.png\]`/,
    );
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
    schemaVersion: 2,
    sandbox: {root: '/isolated', projectDir: '/isolated/project'},
    browserHelper: {
      name: 'screenshot',
      usage: 'screenshot <file-or-url> [output.png]',
      probeArgs: ['--help'],
    },
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
    runners: {
      sample: {
        command: '/path/to/runner',
        args: ['--workspace', '{sandboxProject}'],
        stdin: 'prompt',
        versionArgs: ['--version'],
        capabilities: {
          expected: {
            builtIns: [],
            skills: [],
            mcpServers: [],
            hooks: [],
            plugins: [],
          },
          probe: {
            command: '/path/to/capability-adapter',
            args: [],
          },
        },
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

test('runner profile validates commands, capabilities, transcripts, and audits', () => {
  const profile = exampleProfile();
  profile.runners.sample.transcript.toolCalls[0].recordsPath =
    'message.content';
  assert.equal(validateRunnerProfile(profile).schemaVersion, 2);
  const invalidPath = exampleProfile();
  invalidPath.runners.sample.transcript.toolCalls[0].recordsPath =
    'message.content[]';
  assert.throws(
    () => validateRunnerProfile(invalidPath),
    /recordsPath must be a dotted JSON field path/,
  );
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

  const mismatchedHelper = exampleProfile();
  mismatchedHelper.browserHelper.usage = 'other-helper screenshot.png';
  assert.throws(
    () => validateRunnerProfile(mismatchedHelper),
    /must start with browserHelper.name/,
  );

  const missingCapabilityList = exampleProfile();
  delete missingCapabilityList.runners.sample.capabilities.expected.hooks;
  assert.throws(
    () => validateRunnerProfile(missingCapabilityList),
    /expected.hooks must be an explicit array/,
  );

  const wildcardCapabilityList = exampleProfile();
  wildcardCapabilityList.runners.sample.capabilities.expected.skills = ['*'];
  assert.throws(
    () => validateRunnerProfile(wildcardCapabilityList),
    /expected.skills must be an explicit array/,
  );
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
  assert.equal(countToolCalls(transcript, {format: 'jsonl'}), null);
  assert.deepEqual(parseUsage(transcript, {format: 'jsonl'}), {
    inputTokens: null,
    outputTokens: null,
  });
});

test('capability audit fails closed on unexpected restricted context', () => {
  const expected = {
    builtIns: ['read', 'write'],
    skills: ['ui-authoring'],
    mcpServers: ['browser'],
    hooks: ['before-tool'],
    plugins: [],
  };
  const observed = overrides =>
    parseCapabilityReceipt(
      JSON.stringify({
        schemaVersion: 1,
        builtIns: ['read', 'shell', 'write'],
        skills: ['ui-authoring'],
        mcpServers: ['browser'],
        hooks: ['before-tool'],
        plugins: [],
        ...overrides,
      }),
    );

  const extraBuiltIn = compareCapabilities(expected, observed({}));
  assert.equal(extraBuiltIn.passed, true);
  assert.deepEqual(extraBuiltIn.additional.builtIns, ['shell']);

  const missingSkill = compareCapabilities(expected, observed({skills: []}));
  assert.equal(missingSkill.passed, false);
  assert.deepEqual(missingSkill.missing.skills, ['ui-authoring']);

  for (const [group, values] of [
    ['skills', ['ui-authoring', 'extra-skill']],
    ['mcpServers', ['browser', 'extra-server']],
    ['hooks', ['before-tool', 'after-tool']],
    ['plugins', ['extra-plugin']],
  ]) {
    const audit = compareCapabilities(expected, observed({[group]: values}));
    assert.equal(audit.passed, false, group);
    assert.deepEqual(audit.disallowedAdditional[group], [values.at(-1)]);
  }
});

test('profile adapter iterates arrays for tool counts and command audits', () => {
  const adapter = {
    format: 'jsonl',
    toolCalls: [
      {
        recordsPath: 'message.content',
        matches: [{path: 'kind', equals: 'tool-call'}],
        commandPath: 'input.command',
      },
    ],
  };
  const transcript = JSON.stringify({
    message: {
      content: [
        {
          kind: 'tool-call',
          input: {command: 'npx astryx component Button'},
        },
        {kind: 'text', text: 'Checking the docs.'},
        {
          kind: 'tool-call',
          input: {command: 'pnpm exec astryx docs principles'},
        },
      ],
    },
  });
  assert.equal(countToolCalls(transcript, adapter), 2);
  assert.deepEqual(extractToolCommands(transcript, adapter), [
    'npx astryx component Button',
    'pnpm exec astryx docs principles',
  ]);
  assert.equal(countCliLookups(transcript, adapter), 2);
  const audit = auditTranscript(
    transcript,
    '',
    {
      rules: [
        {
          label: 'no docs command',
          source: 'command',
          kind: 'forbidden',
          class: 'strict',
          pattern: '\\bdocs\\b',
        },
      ],
    },
    adapter,
  );
  assert.equal(audit.commandCount, 2);
  assert.equal(audit.passed, false);
  assert.deepEqual(
    audit.strictFindings.map(finding => finding.label),
    ['no docs command'],
  );
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

test('browser helper probe proves the advertised name is on launcher PATH', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-browser-helper-'),
  );
  temporaryDirectories.push(directory);
  const bin = path.join(directory, 'bin');
  await fs.promises.mkdir(bin);
  const helper = path.join(bin, 'screenshot');
  await fs.promises.writeFile(helper, '#!/bin/sh\nprintf available\n');
  await fs.promises.chmod(helper, 0o755);

  const profile = exampleProfile();
  profile.launcher = {
    command: '/usr/bin/env',
    args: ['{runnerCommand}', '{runnerArgs}'],
    env: {PATH: `${bin}:${process.env.PATH}`},
  };
  const receipt = await probeBrowserHelper(profile);
  assert.equal(receipt.passed, true);
  assert.equal(receipt.name, 'screenshot');
  assert.equal(receipt.usage, 'screenshot <file-or-url> [output.png]');
});

test('agent preview failures are scored instead of retryable infrastructure', async () => {
  const projectDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-preview-failure-'),
  );
  temporaryDirectories.push(projectDir);
  await fs.promises.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify({
      scripts: {
        typecheck: 'node -e "process.exit(0)"',
        build: 'node -e "process.exit(0)"',
        preview: 'node -e "process.exit(3)"',
      },
    }),
  );
  await fs.promises.writeFile(
    path.join(projectDir, 'index.html'),
    '<main>Agent-authored preview fixture</main>',
  );
  const evaluation = await evaluateRun({
    config: 'react-build',
    projectDir,
    prompt: {prompt: 'Render the fixture.'},
    screenshotPath: path.join(projectDir, 'evidence', 'screenshot.png'),
    baselineSources: {},
    skipJudge: true,
  });
  assert.equal(evaluation.build.passed, true);
  assert.equal(evaluation.render.passed, false);
  assert.equal(evaluation.render.adoptionShare, 0);
  assert.equal(evaluation.judge.visualQuality, 0);
  assert.match(evaluation.render.error, /Vite preview exited early/);
});

test('harness-owned browser launch failures remain retryable', async () => {
  const projectDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-browser-failure-'),
  );
  temporaryDirectories.push(projectDir);
  await fs.promises.writeFile(
    path.join(projectDir, 'index.html'),
    '<main>Static browser fixture with enough visible text</main>',
  );
  await assert.rejects(
    evaluateRun({
      config: 'static-html',
      projectDir,
      prompt: {prompt: 'Render the fixture.'},
      screenshotPath: path.join(projectDir, 'evidence', 'screenshot.png'),
      baselineSources: {},
      skipJudge: true,
      browserType: {
        launch: async () => {
          throw new Error('browser service unavailable');
        },
      },
    }),
    /browser service unavailable/,
  );
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

test('summary includes failure zeros in medians and sample counts', () => {
  const results = [
    makeResult({passed: true, value: 80}),
    makeResult({passed: false, value: 0}),
  ];
  const [summary] = summarize(results);
  assert.equal(summary.runs, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.medianVisualQuality, 40);
  assert.equal(summary.medianToolCalls, 40);
  assert.deepEqual(summary.runnerVersions, ['example-agent 1.0.0']);
  assert.equal(summary.mixedRunnerVersions, false);
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

test('capability failures are scored zero and reports list extras', async () => {
  const outputDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-report-capability-'),
  );
  temporaryDirectories.push(outputDir);
  const result = makeResult({passed: false, value: 0});
  Object.assign(result, {
    id: 'prompt-react-build-sample',
    promptId: 'prompt',
    outputDir,
    screenshotPath: null,
  });
  result.runner.capabilityAudit = {
    passed: false,
    missing: {
      builtIns: [],
      skills: [],
      mcpServers: [],
      hooks: [],
      plugins: [],
    },
    disallowedAdditional: {
      skills: ['extra-skill'],
      mcpServers: ['extra-server'],
      hooks: ['after-tool'],
      plugins: ['extra-plugin'],
    },
  };
  result.runner.transcriptAudit = {
    passed: true,
    classification: 'clean',
    adjustedFindings: [],
    findings: [],
  };

  const report = await buildReports({
    outputDir,
    iterationId: 'capability-failure',
    results: [result],
  });
  const markdown = await fs.promises.readFile(report.markdownPath, 'utf8');
  assert.equal(report.summary[0].runs, 1);
  assert.equal(report.summary[0].contextFailures, 1);
  assert.equal(report.summary[0].passRate, 0);
  assert.equal(report.summary[0].medianPromptFulfillment, 0);
  assert.equal(report.summary[0].medianVisualQuality, 0);
  assert.match(markdown, /Capability audit failures/);
  assert.match(markdown, /unexpected skills: `extra-skill`/);
  assert.match(markdown, /unexpected mcpServers: `extra-server`/);
  assert.match(markdown, /unexpected hooks: `after-tool`/);
  assert.match(markdown, /unexpected plugins: `extra-plugin`/);
});

test('reports unavailable runner metrics without guessing zeros', async () => {
  const outputDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-report-unavailable-'),
  );
  temporaryDirectories.push(outputDir);
  const result = makeResult({passed: true, value: 10});
  Object.assign(result, {
    id: 'prompt-react-build-sample',
    promptId: 'prompt',
    outputDir,
    screenshotPath: null,
  });
  result.runner.usage = {inputTokens: null, outputTokens: null};
  result.runner.toolCalls = null;
  result.runner.version = {status: 'unavailable'};
  const report = await buildReports({
    outputDir,
    iterationId: 'unavailable-metrics',
    results: [result],
  });
  const markdown = await fs.promises.readFile(report.markdownPath, 'utf8');
  assert.match(markdown, /\| unavailable \| unavailable \|/);
  assert.match(
    markdown,
    /## Runner version provenance\n\n- \*\*sample\*\* — unavailable/,
  );
});

test('report provenance detects version mixing across delivery configs', () => {
  const first = makeResult({passed: true, value: 10});
  const second = makeResult({passed: true, value: 20});
  second.config = 'react-nobuild';
  second.runner.version = {status: 'available', value: 'example-agent 2.0.0'};
  second.runner.versionChanged = true;
  const [receipt] = summarizeRunnerVersions([first, second]);
  assert.deepEqual(receipt.versions, [
    'example-agent 1.0.0',
    'example-agent 2.0.0',
  ]);
  assert.equal(receipt.mixed, true);
  assert.equal(receipt.changedRuns, 1);
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
      toolCalls: value,
      cliLookups: value,
      version: {status: 'available', value: 'example-agent 1.0.0'},
      versionChanged: false,
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

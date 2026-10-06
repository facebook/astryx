// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global process, structuredClone */

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
  MAX_DECLARED_STATES,
  selectPrompts,
  STATE_MANIFEST_FILE,
} from './constants.mjs';
import {
  assessDeclaredStateNavigation,
  buildBlindJudgePrompt,
  captureAuthoredSources,
  evaluateRun,
  readDeclaredStates,
  resolveDeclaredStateUrl,
  resolveJudgeAttempts,
  runBlindJudge,
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
  runCommand,
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
    assert.match(task, /vibe-states\.json/);
    assert.match(task, /up to 4 additional named states/);
    assert.match(task, /fresh browser context/);
  }
  const normalized = generated.map(task =>
    task.replace(/Delivery environment:\n[^\n]+/, 'Delivery environment:\n<x>'),
  );
  assert.equal(new Set(normalized).size, 2);
  assert.match(generated[0], /src\/App\.tsx/);
  assert.match(generated[1], /index\.html/);
});

test('hidden fixture state reaches the blind judge only when declared', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-states-'),
  );
  temporaryDirectories.push(directory);
  await fs.promises.writeFile(
    path.join(directory, 'index.html'),
    `<!doctype html><main><p>Default dashboard</p><p id="hidden" hidden>Upload complete</p></main><script>if (location.hash === '#state=success') document.querySelector('#hidden').hidden = false;</script>`,
  );

  const originalTask = {prompt: 'Build a status dashboard.'};
  assert.deepEqual(await readDeclaredStates(directory), []);
  const defaultPrompt = buildBlindJudgePrompt(originalTask, [
    {name: 'default', fileName: 'state-00.png'},
  ]);
  assert.doesNotMatch(defaultPrompt, /^- success: state-\d+\.png$/m);

  await fs.promises.writeFile(
    path.join(directory, STATE_MANIFEST_FILE),
    `${JSON.stringify({states: [{name: 'success', url: '#state=success'}]})}\n`,
  );
  const declared = await readDeclaredStates(directory);
  assert.deepEqual(declared, [{name: 'success', url: '#state=success'}]);
  const declaredPrompt = buildBlindJudgePrompt(originalTask, [
    {name: 'default', fileName: 'state-00.png'},
    {name: declared[0].name, fileName: 'state-01.png'},
  ]);
  assert.match(declaredPrompt, /^- success: state-01\.png$/m);
  assert.match(
    declaredPrompt,
    /State labels are navigation labels, not evidence/,
  );
  assert.match(
    declaredPrompt,
    /Inspect every supplied screenshot in the working directory/,
  );
  assert.doesNotMatch(declaredPrompt, /Use the /);
  assert.equal(
    resolveDeclaredStateUrl('http://127.0.0.1:3000/', declared[0].url),
    'http://127.0.0.1:3000/#state=success',
  );
});

test('reviewer redirect probe rejects location.replace and an extra state document', () => {
  const fixture = `<!doctype html><main>Default state</main><script>if (location.search === '?state=done') location.replace('/fake.html');</script>`;
  assert.match(fixture, /location\.replace\('\/fake\.html'\)/);
  const target = 'http://127.0.0.1:3000/?state=done';
  const fakePage = 'http://127.0.0.1:3000/fake.html';
  const assessment = assessDeclaredStateNavigation({
    baseUrl: 'http://127.0.0.1:3000/',
    finalUrl: fakePage,
    documentRequests: [target, fakePage],
    topLevelNavigations: [target, fakePage],
  });
  assert.equal(assessment.passed, false);
  assert.equal(assessment.documentRequestCount, 2);
  assert.equal(assessment.topLevelNavigationCount, 2);
  assert.match(assessment.error, /left the original document path/);
  assert.match(assessment.error, /top-level navigation/);
  assert.match(assessment.error, /additional HTML document/);

  const extraDocument = assessDeclaredStateNavigation({
    baseUrl: 'http://127.0.0.1:3000/',
    finalUrl: target,
    documentRequests: [target, fakePage],
    topLevelNavigations: [target],
  });
  assert.equal(extraDocument.passed, false);
  assert.match(extraDocument.error, /additional HTML document/);

  assert.deepEqual(
    assessDeclaredStateNavigation({
      baseUrl: 'http://127.0.0.1:3000/',
      finalUrl: target,
      documentRequests: [target],
      topLevelNavigations: [target],
    }),
    {
      passed: true,
      error: null,
      documentRequestCount: 1,
      topLevelNavigationCount: 1,
    },
  );
});

test('blind judge scores the hidden-state fixture only when its screenshot is declared', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-state-judge-'),
  );
  temporaryDirectories.push(directory);
  const judgeScript = path.join(directory, 'judge.mjs');
  await fs.promises.writeFile(
    judgeScript,
    `import * as fs from 'node:fs';
let prompt = '';
for await (const chunk of process.stdin) prompt += chunk;
const states = [...prompt.matchAll(/^- ([^:]+): state-\\d+\\.png$/gm)].map(match => match[1]);
const files = fs.readdirSync(process.argv[2]).filter(file => /^state-\\d+\\.png$/.test(file));
console.log(JSON.stringify({promptFulfillment: files.length > 1 ? 90 : 30, visualQuality: 80, success: files.length > 1, notes: 'fixture judge', failureReasons: [], stateEvidence: states.map(state => ({state, visibleEvidence: state === 'success' ? 'Upload complete is visible.' : 'Default upload form is visible.', concerns: []}))}));
`,
  );
  const defaultScreenshot = path.join(directory, 'default.png');
  const successScreenshot = path.join(directory, 'success.png');
  await fs.promises.writeFile(defaultScreenshot, 'default-image');
  await fs.promises.writeFile(successScreenshot, 'success-image');
  const profile = {
    sandbox: {root: '/unused', projectDir: '/unused/project'},
    launcher: {
      command: '/usr/bin/env',
      args: ['{runnerCommand}', '{runnerArgs}'],
    },
    judge: {
      command: process.execPath,
      args: [judgeScript, '{projectDir}'],
      stdin: 'prompt',
      transcript: structuredClone(exampleTranscriptAdapter),
      audit: {rules: []},
    },
  };
  const prompt = {prompt: 'Build an upload flow with a success state.'};
  const defaultOnly = await runBlindJudge({
    prompt,
    screenshots: [{name: 'default', screenshotPath: defaultScreenshot}],
    profile,
  });
  const withSuccess = await runBlindJudge({
    prompt,
    screenshots: [
      {name: 'default', screenshotPath: defaultScreenshot},
      {name: 'success', screenshotPath: successScreenshot},
    ],
    profile,
  });
  assert.equal(defaultOnly.promptFulfillment, 30, JSON.stringify(defaultOnly));
  assert.equal(defaultOnly.stateEvidence.length, 1);
  assert.equal(withSuccess.promptFulfillment, 90);
  assert.deepEqual(
    withSuccess.stateEvidence.map(evidence => evidence.state),
    ['default', 'success'],
  );
});

test('state declarations reject alternate pages, duplicates, and over-cap evidence', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-state-guard-'),
  );
  temporaryDirectories.push(directory);
  const manifestPath = path.join(directory, STATE_MANIFEST_FILE);

  await fs.promises.writeFile(
    manifestPath,
    JSON.stringify({states: [{name: 'loading', url: 'loading.html'}]}),
  );
  await assert.rejects(
    () => readDeclaredStates(directory),
    /start with \? or #/,
  );

  await fs.promises.writeFile(
    manifestPath,
    JSON.stringify({
      states: [
        {name: 'loading', url: '#loading'},
        {name: 'Loading', url: '#loading-again'},
      ],
    }),
  );
  await assert.rejects(() => readDeclaredStates(directory), /unique/);

  await fs.promises.writeFile(
    manifestPath,
    JSON.stringify({
      states: Array.from({length: MAX_DECLARED_STATES + 1}, (_, index) => ({
        name: `state-${index}`,
        url: `#state-${index}`,
      })),
    }),
  );
  await assert.rejects(
    () => readDeclaredStates(directory),
    new RegExp(`at most ${MAX_DECLARED_STATES}`),
  );
});

test('reports preserve screenshots and visible evidence for each state', async () => {
  const outputDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-state-report-'),
  );
  temporaryDirectories.push(outputDir);
  const defaultPath = path.join(outputDir, 'default.png');
  const successPath = path.join(outputDir, 'success.png');
  await fs.promises.writeFile(defaultPath, 'default-image');
  await fs.promises.writeFile(successPath, 'success-image');

  const result = makeResult({passed: true, value: 80});
  Object.assign(result, {
    id: 'x-react-build-sample',
    promptId: 'x',
    outputDir,
    screenshotPath: defaultPath,
    screenshots: [
      {name: 'default', path: defaultPath},
      {name: 'success', path: successPath},
    ],
  });
  result.evaluation.render.states = [
    {name: 'default', passed: true},
    {name: 'success', passed: true},
  ];
  result.evaluation.judge.stateEvidence = [
    {state: 'default', visibleEvidence: 'Upload is ready.', concerns: []},
    {
      state: 'success',
      visibleEvidence: 'Completion message is visible.',
      concerns: ['Low contrast'],
    },
  ];

  const report = await buildReports({
    outputDir,
    iterationId: 'state-evidence',
    results: [result],
  });
  const markdown = await fs.promises.readFile(report.markdownPath, 'utf8');
  const html = await fs.promises.readFile(report.htmlPath, 'utf8');
  assert.match(markdown, /success: \[screenshot\]/);
  assert.match(markdown, /Completion message is visible/);
  assert.match(html, /<h4>success<\/h4>/);
  assert.match(html, /Low contrast/);
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

test('runner profile validates generic commands and audit classes', () => {
  const profile = exampleProfile();
  profile.runners.sample.transcript.toolCalls[0].recordsPath =
    'message.content';
  assert.equal(validateRunnerProfile(profile).schemaVersion, 1);
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
    stateEvidence: [
      {state: 'default', visibleEvidence: 'Complete.', concerns: []},
    ],
    contextAudit: {passed: true},
  };
  assert.equal(resolveJudgeAttempts([crashed], false), null);
  const resolved = resolveJudgeAttempts([crashed, accepted], false);
  assert.equal(resolved.judgeUnavailable, undefined);
  assert.equal(resolved.rejudged, true);
  assert.equal(resolved.attempts.length, 2);
  assert.equal(resolved.attempts[0].error, crashed.error);
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

#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global console, process */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  AGENT_NAMES,
  CONFIG_NAMES,
  DEFAULT_REACT_VERSION,
  DEFAULT_VANILLA_CDN_REF,
  DEFAULT_VANILLA_TARBALL_URL,
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
  stableId,
} from './constants.mjs';
import {captureAuthoredSources, evaluateRun} from './evaluator.mjs';
import {
  SANDBOX_PROJECT,
  auditAgentContext,
  countCliLookups,
  countToolCalls,
  createPrivateRunRoot,
  parseUsage,
  runCommand,
  runIsolatedCommand,
} from './process.mjs';
import {prepareProject} from './projects.mjs';
import {buildReports} from './report.mjs';

const fsp = fs.promises;
const here = path.dirname(fileURLToPath(import.meta.url));
const vibeTestsRoot = path.resolve(here, '..');
const MUSE_MAX_MODEL_STEPS = 80;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const specs = getDeliverySpecs(options);
  validateSelections(options, specs);
  const testSet = JSON.parse(
    await fsp.readFile(
      path.join(vibeTestsRoot, 'test-sets', 'default.json'),
      'utf8',
    ),
  );
  const prompts = selectPrompts(testSet, {
    sample: options.sample,
    promptIds: options.prompts,
  });

  if (options.dryRun) {
    printDryRun(options, prompts, specs);
    return;
  }

  await assertIsolationAvailable();
  const iterationId =
    options.iteration ??
    new Date().toISOString().replaceAll(/[:.]/g, '-').replace('Z', '');
  const outputDir = path.resolve(
    options.outputDir ?? path.join('/tmp/astryx-delivery-modes', iterationId),
  );
  await fsp.mkdir(path.join(outputDir, 'screenshots'), {recursive: true});
  const manifest = {
    iterationId,
    createdAt: new Date().toISOString(),
    configs: options.configs,
    agents: options.agents,
    prompts: prompts.map(prompt => prompt.id),
    reactVersion: options.reactVersion,
    vanillaCdnRef: options.vanillaCdnRef,
    vanillaTarballUrl: options.vanillaTarballUrl,
    concurrency: options.concurrency,
    agentTimeoutMinutes: options.timeoutMinutes,
    runnerLimits: {
      claude: 'no model-step cap; wall-clock timeout only',
      muse: `${MUSE_MAX_MODEL_STEPS} model steps plus the same wall-clock timeout`,
    },
    isolation: {
      privateRootMode: '0700',
      mountNamespace: true,
      freshHomeTmpAndProject: true,
      sharedResultsAfterCompletionOnly: true,
      path: '/mnt/run/bin:/usr/bin:/bin (sandbox blocks sudo and meta)',
      hiddenHostPaths: ['/home', '/tmp', '/data', '/var/tmp', '/dev/shm'],
      browserTool: 'screenshot <file-or-url> [output.png]',
      startupProbe: await probeIsolation(),
    },
    runnerVersions: await runnerVersions(),
  };
  await fsp.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  if (options.configs.includes('react-nobuild')) {
    console.log('Verifying the React no-build starter with hooks and icons…');
    await verifyStarter(specs['react-nobuild'], outputDir);
  }

  const jobs = [];
  for (const prompt of prompts) {
    for (const config of options.configs) {
      for (const agent of options.agents) {
        jobs.push({prompt, config, agent});
      }
    }
  }
  console.log(
    `Running ${jobs.length} jobs (${options.concurrency} concurrent, ${options.timeoutMinutes} minute agent timeout)…`,
  );
  const results = [];
  let completed = 0;
  await runWithConcurrency(jobs, options.concurrency, async job => {
    const result = await runOne({
      ...job,
      spec: specs[job.config],
      outputDir,
      options,
    });
    results.push(result);
    completed += 1;
    console.log(
      `[${completed}/${jobs.length}] ${job.prompt.id} ${job.config} ${job.agent}: ${result.evaluation?.render?.passed ? 'rendered' : 'failed'}`,
    );
  });
  results.sort((a, b) => a.id.localeCompare(b.id));
  manifest.completedAt = new Date().toISOString();
  manifest.runnerVersions.claude =
    results.find(result => result.runner?.contextAudit?.runnerVersion)?.runner
      .contextAudit.runnerVersion ??
    results.find(
      result => result.evaluation?.judge?.contextAudit?.runnerVersion,
    )?.evaluation.judge.contextAudit.runnerVersion ??
    null;
  await fsp.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const report = await buildReports({outputDir, iterationId, results});
  console.log(`\nReport: ${report.htmlPath}`);
  console.log(`Markdown: ${report.markdownPath}`);
  console.log(`JSON: ${report.jsonPath}`);
  for (const row of report.summary) {
    console.log(
      `${row.config}/${row.agent}: ${row.passed}/${row.runs} render pass, median adoption ${formatPercent(row.medianAdoptionShare)}, visual ${formatNumber(row.medianVisualQuality)}`,
    );
  }
}

async function verifyStarter(spec, outputDir) {
  const privateRun = await createPrivateRunRoot('starter-');
  const privateScreenshot = path.join(privateRun.root, 'starter.png');
  try {
    await prepareProject(spec, privateRun.projectDir);
    const baselineSources = await captureAuthoredSources(privateRun.projectDir);
    const verification = await evaluateRun({
      config: 'react-nobuild',
      projectDir: privateRun.projectDir,
      prompt: {prompt: 'Render the supplied starter.'},
      screenshotPath: privateScreenshot,
      baselineSources,
      skipJudge: true,
      verifyStarterTyping: true,
    });
    if (!verification.render.passed) {
      throw new Error(
        `React no-build starter failed verification: ${JSON.stringify(verification.render)}`,
      );
    }
    await fsp.copyFile(
      privateScreenshot,
      path.join(outputDir, 'screenshots', 'react-nobuild-starter-0.6.5.png'),
    );
    await fsp.writeFile(
      path.join(outputDir, 'starter-verification.json'),
      `${JSON.stringify(verification, null, 2)}\n`,
    );
  } finally {
    await fsp.rm(privateRun.root, {recursive: true, force: true});
  }
}

async function runOne({prompt, config, agent, spec, outputDir, options}) {
  const id = `${prompt.id}-${config}-${agent}`;
  const sharedRunDir = path.join(outputDir, 'runs', id);
  const sharedScreenshot = path.join(outputDir, 'screenshots', `${id}.png`);
  const privateRun = await createPrivateRunRoot(`${id}-`);
  const privateScreenshot = path.join(privateRun.root, 'screenshot.png');
  const taskPrompt = buildTaskPrompt(prompt, spec, SANDBOX_PROJECT, {
    timeoutMinutes: options.timeoutMinutes,
  });
  const result = {
    id,
    promptId: prompt.id,
    prompt: prompt.prompt,
    config,
    agent,
    outputDir,
    projectDir: SANDBOX_PROJECT,
    screenshotPath: sharedScreenshot,
    taskPromptHash: stableId(taskPrompt),
    startedAt: new Date().toISOString(),
  };

  try {
    await prepareProject(spec, privateRun.projectDir);
    const baselineSources = await captureAuthoredSources(privateRun.projectDir);
    await fsp.writeFile(
      path.join(privateRun.projectDir, 'TASK.md'),
      `${taskPrompt}\n`,
    );
    result.runner = await runAgent({
      agent,
      privateRun,
      taskPrompt,
      timeoutMs: options.timeoutMinutes * 60 * 1000,
    });
    result.evaluation = await evaluateRun({
      config,
      projectDir: privateRun.projectDir,
      prompt,
      screenshotPath: privateScreenshot,
      baselineSources,
      skipJudge: options.skipJudge,
    });
    if (result.runner.timedOut) {
      result.evaluation.bestBeforeTimeout = {
        renderPassed: result.evaluation.render?.passed ?? false,
        adoptionShare: result.evaluation.render?.adoptionShare ?? 0,
        promptFulfillment: result.evaluation.judge?.promptFulfillment ?? null,
        visualQuality: result.evaluation.judge?.visualQuality ?? null,
        screenshotCaptured: fs.existsSync(privateScreenshot),
      };
    }
    if (!result.runner.success) {
      forceFailedScores(
        result.evaluation,
        result.runner.contextAudit?.passed === false
          ? `Forbidden runner context: ${result.runner.contextAudit.violations.join('; ')}`
          : 'Agent runner failed or timed out',
      );
    }
  } catch (error) {
    result.error =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    result.evaluation = failedRunEvaluation(result.error);
  }
  result.finishedAt = new Date().toISOString();

  // Nothing under outputDir is created for this run until the agent and
  // evaluator have both completed. The private mount root is never shared.
  await fsp.mkdir(sharedRunDir, {recursive: true});
  if (fs.existsSync(privateScreenshot)) {
    await fsp.copyFile(privateScreenshot, sharedScreenshot);
  } else {
    result.screenshotPath = null;
  }
  await copyProjectEvidence(
    privateRun.projectDir,
    path.join(sharedRunDir, 'project'),
  );
  for (const file of ['transcript.jsonl', 'transcript.jsonl.stderr.log']) {
    const source = path.join(privateRun.root, file);
    if (fs.existsSync(source)) {
      await fsp.copyFile(source, path.join(sharedRunDir, `${agent}.${file}`));
    }
  }
  await fsp.writeFile(
    path.join(sharedRunDir, 'run.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  await fsp.rm(privateRun.root, {recursive: true, force: true});
  return result;
}

async function runAgent({agent, privateRun, taskPrompt, timeoutMs}) {
  let command;
  let args;
  let input;
  if (agent === 'claude') {
    command = '/usr/local/bin/claude';
    args = [
      '--safe-mode',
      '--strict-mcp-config',
      '--mcp-config',
      '/mnt/run/empty-mcp.json',
      '--no-session-persistence',
      '--permission-mode',
      'bypassPermissions',
      '--dangerously-skip-permissions',
      '--disable-slash-commands',
      '--tools',
      'Bash,Read,Write,Edit',
      '-p',
      '--output-format',
      'stream-json',
      '--verbose',
    ];
    input = taskPrompt;
  } else if (agent === 'muse') {
    command = '/usr/local/bin/muse';
    args = [
      'exec',
      '--json',
      '--workspace',
      SANDBOX_PROJECT,
      '--prompt-file',
      `${SANDBOX_PROJECT}/TASK.md`,
      '--provider',
      'meta',
      '--preset',
      'native-basic',
      '--trust-workspace',
      '--parallel-tool-calls',
      '--no-foreign-personal-context',
      '--no-session-log',
      '--max-model-steps',
      String(MUSE_MAX_MODEL_STEPS),
      '--disable-web-tools',
      '--approval-mode',
      'never',
      '--disable-muse-llm-rules',
    ];
  } else {
    throw new Error(`Unsupported agent: ${agent}`);
  }

  const execution = await runIsolatedCommand(privateRun.root, command, args, {
    input,
    timeoutMs,
    transcriptPath: privateRun.transcriptPath,
  });
  const usage = parseUsage(execution.stdout);
  const combined = `${execution.stdout}\n${execution.stderr}`;
  const contextAudit = auditAgentContext(
    agent,
    execution.stdout,
    execution.stderr,
  );
  return {
    command: agent,
    code: execution.code,
    signal: execution.signal,
    success: execution.code === 0 && !execution.timedOut && contextAudit.passed,
    durationMs: execution.durationMs,
    timedOut: execution.timedOut,
    stalled: execution.timedOut,
    gaveUp:
      execution.code !== 0 ||
      /\b(?:unable to complete|cannot complete|giving up|could not complete)\b/i.test(
        combined,
      ),
    usage,
    toolCalls: countToolCalls(execution.stdout),
    cliLookups: countCliLookups(execution.stdout),
    contextAudit,
    limits:
      agent === 'muse'
        ? {maxModelSteps: MUSE_MAX_MODEL_STEPS}
        : {maxModelSteps: null},
    stderr: execution.stderr,
  };
}

function forceFailedScores(evaluation, reason) {
  evaluation.render.passed = false;
  evaluation.render.adoptedElementCount = 0;
  evaluation.render.adoptionShare = 0;
  evaluation.render.error ??= reason;
  evaluation.judge = {
    configBlind: true,
    promptFulfillment: 0,
    visualQuality: 0,
    success: false,
    notes: reason,
    failureReasons: [reason],
    automaticFailure: true,
  };
}

function failedRunEvaluation(reason) {
  return {
    build: {passed: false, code: null, timedOut: false, durationMs: 0},
    typecheck: null,
    render: {
      passed: false,
      nonBlank: false,
      adoptionShare: 0,
      adoptedElementCount: 0,
      eligibleElementCount: 0,
      visibleElementCount: 0,
      textLength: 0,
      error: reason,
    },
    source: {
      authoredFileCount: 0,
      inlineStyleAttributes: 0,
      customPropertyOnlyStyles: 0,
      themeDefinitionCount: 0,
      rawHexValues: 0,
      rawPixelValues: 0,
      hardCodedStyleCount: 0,
    },
    accessibility: {violationCount: null, violations: []},
    judge: {
      configBlind: true,
      promptFulfillment: 0,
      visualQuality: 0,
      success: false,
      notes: reason,
      failureReasons: [reason],
      automaticFailure: true,
    },
  };
}

async function assertIsolationAvailable() {
  const check = await runCommand('/usr/bin/sudo', ['-n', 'true'], {
    cwd: vibeTestsRoot,
    timeoutMs: 10_000,
  });
  if (check.code !== 0) {
    throw new Error(
      'This harness requires passwordless sudo for private mount namespaces.',
    );
  }
}

async function probeIsolation() {
  const left = await createPrivateRunRoot('probe-left-');
  const right = await createPrivateRunRoot('probe-right-');
  const nonce = `${process.pid}-${Date.now()}`;
  const varTmpSecret = `/var/tmp/astryx-vibe-${nonce}`;
  const sharedMemorySecret = `/dev/shm/astryx-vibe-${nonce}`;
  try {
    await fsp.writeFile(
      path.join(left.projectDir, 'allowed.html'),
      '<!doctype html><title>allowed</title><p>allowed</p>\n',
    );
    const siblingSecret = path.join(right.projectDir, 'secret.txt');
    await fsp.writeFile(siblingSecret, 'sibling secret\n');
    await fsp.writeFile(varTmpSecret, 'var tmp secret\n');
    await fsp.writeFile(sharedMemorySecret, 'shared memory secret\n');
    const dataUserPath = path.join('/data/users', os.userInfo().username);
    const execution = await runIsolatedCommand(
      left.root,
      '/bin/sh',
      [
        '-c',
        'set -eu; test "$(cat /mnt/run/project/allowed.html | grep -c allowed)" -ge 1; printf written > /mnt/run/project/written.txt; test ! -e "$1"; test ! -e "$2"; test ! -e "$3"; test ! -e "$4"; ! /usr/bin/sudo -n true >/dev/null 2>&1; ! /usr/bin/nsenter -t 1 -m true >/dev/null 2>&1; ! /usr/local/bin/meta --help >/dev/null 2>&1; ! command -v meta >/dev/null 2>&1; screenshot /mnt/run/project/allowed.html /mnt/run/project/browser-probe.png >/dev/null; test -s /mnt/run/project/browser-probe.png; printf "own-root=read-write\\nsibling=hidden\\nvar-tmp=private\\ndev-shm=private\\ndata=hidden\\nsudo=blocked\\nnsenter=blocked\\nmeta-absolute=blocked\\nbrowser=available\\n"',
        'probe',
        siblingSecret,
        varTmpSecret,
        sharedMemorySecret,
        dataUserPath,
      ],
      {timeoutMs: 60_000},
    );
    const ownWrite = await fsp.readFile(
      path.join(left.projectDir, 'written.txt'),
      'utf8',
    );
    if (execution.code !== 0 || ownWrite !== 'written') {
      throw new Error(
        `Mount-namespace isolation probe failed: ${execution.stderr || execution.stdout}`,
      );
    }
    return {
      passed: true,
      ownRootReadWrite: true,
      exactSiblingPathHidden: true,
      varTmpPrivate: true,
      devShmPrivate: true,
      dataHidden: true,
      sudoBlocked: true,
      nsenterBlocked: true,
      metaAbsolutePathBlocked: true,
      metaAbsentFromPath: true,
      identicalBrowserHelperAvailable: true,
      output: execution.stdout.trim().split('\n'),
    };
  } finally {
    await Promise.all(
      [left.root, right.root].map(root =>
        fsp.rm(root, {recursive: true, force: true}),
      ),
    );
    await Promise.all(
      [varTmpSecret, sharedMemorySecret].map(file =>
        fsp.rm(file, {force: true}),
      ),
    );
  }
}

async function runnerVersions() {
  const commands = {
    node: [process.execPath, ['--version']],
    npm: ['/usr/bin/npm', ['--version']],
    muse: ['/usr/local/bin/muse', ['--version']],
  };
  const entries = await Promise.all(
    Object.entries(commands).map(async ([name, [command, args]]) => {
      const result = await runCommand(command, args, {
        cwd: vibeTestsRoot,
        timeoutMs: 30_000,
      });
      return [name, (result.stdout || result.stderr).trim()];
    }),
  );
  return Object.fromEntries(entries);
}

async function copyProjectEvidence(source, destination) {
  await fsp.cp(source, destination, {
    recursive: true,
    filter: entry => {
      const relative = path.relative(source, entry);
      return !relative
        .split(path.sep)
        .some(part => ['node_modules', 'dist', '.cache'].includes(part));
    },
  });
}

async function runWithConcurrency(items, concurrency, worker) {
  let index = 0;
  const threads = Array.from(
    {length: Math.min(concurrency, items.length)},
    async () => {
      while (true) {
        const current = index;
        index += 1;
        if (current >= items.length) {
          return;
        }
        await worker(items[current]);
      }
    },
  );
  await Promise.all(threads);
}

function printDryRun(options, prompts, specs) {
  for (const prompt of prompts) {
    console.log(`## ${prompt.id}`);
    for (const config of options.configs) {
      console.log(`\n### ${config}\n`);
      console.log(
        buildTaskPrompt(prompt, specs[config], '<project-dir>', {
          timeoutMinutes: options.timeoutMinutes,
        }),
      );
    }
    console.log('');
  }
}

function parseArgs(args) {
  const options = {
    configs: [...CONFIG_NAMES],
    agents: [...AGENT_NAMES],
    sample: undefined,
    prompts: undefined,
    concurrency: 6,
    timeoutMinutes: 15,
    dryRun: false,
    skipJudge: false,
    reactVersion: DEFAULT_REACT_VERSION,
    vanillaCdnRef: DEFAULT_VANILLA_CDN_REF,
    vanillaTarballUrl: DEFAULT_VANILLA_TARBALL_URL,
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (argument === '--') {
      continue;
    }
    if (argument === '--configs') {
      options.configs = value.split(',').filter(Boolean);
      index += 1;
    } else if (argument === '--agents') {
      options.agents = value.split(',').filter(Boolean);
      index += 1;
    } else if (argument === '--sample') {
      options.sample = positiveInteger(value, '--sample');
      index += 1;
    } else if (argument === '--prompts') {
      options.prompts = value.split(',').filter(Boolean);
      index += 1;
    } else if (argument === '--concurrency') {
      options.concurrency = positiveInteger(value, '--concurrency');
      index += 1;
    } else if (argument === '--timeout-minutes') {
      options.timeoutMinutes = positiveInteger(value, '--timeout-minutes');
      index += 1;
    } else if (argument === '--iteration') {
      options.iteration = value;
      index += 1;
    } else if (argument === '--output-dir') {
      options.outputDir = value;
      index += 1;
    } else if (argument === '--react-version') {
      options.reactVersion = value;
      index += 1;
    } else if (argument === '--vanilla-cdn-ref') {
      options.vanillaCdnRef = value;
      index += 1;
    } else if (argument === '--vanilla-tarball-url') {
      options.vanillaTarballUrl = value;
      index += 1;
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--skip-judge') {
      options.skipJudge = true;
    } else if (argument === '--help' || argument === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function validateSelections(options, specs) {
  for (const config of options.configs) {
    if (!specs[config]) {
      throw new Error(`Unknown config: ${config}`);
    }
  }
  for (const agent of options.agents) {
    if (!AGENT_NAMES.includes(agent)) {
      throw new Error(`Unknown agent: ${agent}`);
    }
  }
}

function positiveInteger(value, flag) {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${flag} requires a positive integer`);
  }
  return number;
}

function printHelp() {
  console.log(`Usage: pnpm -F @astryxdesign/vibe-tests delivery:run [options]

Options:
  --configs <names>              react-build,react-nobuild,vanilla
  --agents <names>               claude,muse
  --sample <n>                   deterministic category-stratified sample
  --prompts <ids>                comma-separated prompt ids
  --dry-run                      print generated task prompts only
  --concurrency <n>              concurrent fresh agent processes (default 6)
  --timeout-minutes <n>          per-agent timeout (default 15)
  --output-dir <path>            run artifacts directory (default /tmp)
  --iteration <id>               stable report identifier
  --react-version <version>      npm/CDN Astryx version (default 0.6.5)
  --vanilla-cdn-ref <sha>        commit pin used by Vanilla Astryx docs
  --vanilla-tarball-url <url>    preview CLI tarball
  --skip-judge                   omit the blind Claude visual judge
`);
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';
}
function formatNumber(value) {
  return Number.isFinite(value) ? Math.round(value) : '—';
}

main().catch(error => {
  console.error(
    error instanceof Error ? (error.stack ?? error.message) : error,
  );
  process.exitCode = 1;
});

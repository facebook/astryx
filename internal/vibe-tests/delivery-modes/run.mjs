#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global console, process */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkpointIsComplete} from './checkpoint.mjs';
import {
  CONFIG_NAMES,
  DEFAULT_CONFIG_NAMES,
  DEFAULT_REACT_VERSION,
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
  stableId,
} from './constants.mjs';
import {captureAuthoredSources, evaluateRun} from './evaluator.mjs';
import {
  auditTranscript,
  countCliLookups,
  countToolCalls,
  createPrivateRunRoot,
  parseUsage,
  runCommand,
  runProfileCommand,
  runProfilePreflight,
} from './process.mjs';
import {loadRunnerProfile} from './profile.mjs';
import {prepareProject, validateStaticConfig} from './projects.mjs';
import {buildReports} from './report.mjs';

const fsp = fs.promises;
const here = path.dirname(fileURLToPath(import.meta.url));
const vibeTestsRoot = path.resolve(here, '..');

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const staticConfig = options.staticConfigPath
    ? await loadStaticConfig(options.staticConfigPath)
    : null;
  const specs = getDeliverySpecs({...options, staticConfig});
  validateConfigs(options.configs, specs);
  const testSet = JSON.parse(
    await fsp.readFile(
      path.join(vibeTestsRoot, 'test-sets', 'default.json'),
      'utf8',
    ),
  );
  const prompts = selectPrompts(testSet, {
    sample: options.sample,
    promptIds: options.prompts,
    seed: options.seed,
  });

  if (options.dryRun) {
    printDryRun(options, prompts, specs);
    return;
  }

  const profile = await loadRunnerProfile();
  const runners = options.runners ?? Object.keys(profile.runners);
  validateRunners(runners, profile);
  if (!options.skipJudge && !profile.judge) {
    throw new Error(
      'The runner profile requires a judge command unless --skip-judge is used.',
    );
  }
  const isolationReceipt = await runProfilePreflight(profile);
  const iterationId =
    options.iteration ??
    new Date().toISOString().replaceAll(/[:.]/g, '-').replace('Z', '');
  const outputDir = path.resolve(
    options.outputDir ?? path.join('/tmp/astryx-delivery-modes', iterationId),
  );
  await fsp.mkdir(path.join(outputDir, 'screenshots'), {recursive: true});
  const manifestPath = path.join(outputDir, 'manifest.json');
  let priorManifest = null;
  if (fs.existsSync(manifestPath)) {
    if (!options.resume) {
      throw new Error(
        `Output directory already has a manifest; pass --resume or choose another directory: ${outputDir}`,
      );
    }
    priorManifest = JSON.parse(await fsp.readFile(manifestPath, 'utf8'));
  }
  const manifest = {
    iterationId,
    createdAt: priorManifest?.createdAt ?? new Date().toISOString(),
    configs: options.configs,
    runners,
    prompts: prompts.map(prompt => prompt.id),
    seed: options.seed,
    reactVersion: options.reactVersion,
    staticConfigHash: staticConfig
      ? stableId(JSON.stringify(staticConfig))
      : null,
    concurrency: options.concurrency,
    agentTimeoutMinutes: options.timeoutMinutes,
    runnerProfileSchemaVersion: profile.schemaVersion,
    runnerLimits: Object.fromEntries(
      runners.map(name => [name, profile.runners[name].limits ?? {}]),
    ),
    transcriptAudit: Object.fromEntries(
      runners.map(name => [
        name,
        {
          strictRules: (profile.runners[name].audit?.rules ?? []).filter(
            rule => rule.class === 'strict',
          ).length,
          adjustedRules: (profile.runners[name].audit?.rules ?? []).filter(
            rule => rule.class === 'adjusted',
          ).length,
        },
      ]),
    ),
    transcriptAdapterHashes: Object.fromEntries(
      runners.map(name => [
        name,
        stableId(JSON.stringify(profile.runners[name].transcript)),
      ]),
    ),
    judgeAdapterHash: profile.judge
      ? stableId(
          JSON.stringify({
            transcript: profile.judge.transcript,
            resultPath: profile.judge.resultPath ?? null,
          }),
        )
      : null,
    isolation: isolationReceipt,
    runnerVersions: await runnerVersions(profile, runners),
  };
  if (priorManifest) {
    assertCompatibleManifest(priorManifest, manifest);
    manifest.resumedAt = new Date().toISOString();
  }
  await fsp.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  if (
    options.configs.includes('react-nobuild') &&
    !(
      options.resume &&
      fs.existsSync(path.join(outputDir, 'starter-verification.json'))
    )
  ) {
    console.log('Verifying the React no-build starter with hooks and icons…');
    await verifyStarter(specs['react-nobuild'], outputDir);
  }

  const jobs = [];
  for (const prompt of prompts) {
    for (const config of options.configs) {
      for (const agent of runners) {
        jobs.push({prompt, config, agent});
      }
    }
  }
  const results = options.resume
    ? await loadCheckpointResults({
        jobs,
        outputDir,
        specs,
        options,
        profile,
      })
    : [];
  const completedIds = new Set(results.map(result => result.id));
  const pendingJobs = jobs.filter(
    job => !completedIds.has(jobId(job.prompt.id, job.config, job.agent)),
  );
  const scheduledJobs = options.maxNewJobs
    ? pendingJobs.slice(0, options.maxNewJobs)
    : pendingJobs;
  console.log(
    `Running ${scheduledJobs.length} new of ${jobs.length} total jobs (${results.length} resumed, ${options.concurrency} concurrent, ${options.timeoutMinutes} minute timeout)…`,
  );
  let completed = results.length;
  await runWithConcurrency(scheduledJobs, options.concurrency, async job => {
    const result = await runOne({
      ...job,
      spec: specs[job.config],
      outputDir,
      options,
      profile,
    });
    results.push(result);
    completed += 1;
    console.log(
      `[${completed}/${jobs.length}] ${job.prompt.id} ${job.config} ${job.agent}: ${result.evaluation?.render?.passed ? 'rendered' : 'failed'}`,
    );
  });
  results.sort((a, b) => a.id.localeCompare(b.id));
  const completedJobs = results.filter(checkpointIsComplete).length;
  manifest.completedJobs = completedJobs;
  manifest.totalJobs = jobs.length;
  if (completedJobs === jobs.length) {
    manifest.completedAt = new Date().toISOString();
  }
  await fsp.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

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

async function loadStaticConfig(filePath) {
  const config = JSON.parse(await fsp.readFile(path.resolve(filePath), 'utf8'));
  validateStaticConfig(config);
  return config;
}

function assertCompatibleManifest(prior, current) {
  const keys = [
    'iterationId',
    'configs',
    'runners',
    'prompts',
    'seed',
    'reactVersion',
    'staticConfigHash',
    'concurrency',
    'agentTimeoutMinutes',
    'runnerProfileSchemaVersion',
    'runnerLimits',
    'transcriptAudit',
    'transcriptAdapterHashes',
    'judgeAdapterHash',
  ];
  for (const key of keys) {
    if (JSON.stringify(prior[key]) !== JSON.stringify(current[key])) {
      throw new Error(
        `Cannot resume: manifest field ${key} changed (${JSON.stringify(prior[key])} != ${JSON.stringify(current[key])})`,
      );
    }
  }
}

async function loadCheckpointResults({
  jobs,
  outputDir,
  specs,
  options,
  profile,
}) {
  const results = [];
  for (const job of jobs) {
    const id = jobId(job.prompt.id, job.config, job.agent);
    const checkpointPath = path.join(outputDir, 'runs', id, 'run.json');
    if (!fs.existsSync(checkpointPath)) {
      continue;
    }
    const result = JSON.parse(await fsp.readFile(checkpointPath, 'utf8'));
    const expectedTaskPrompt = buildTaskPrompt(
      job.prompt,
      specs[job.config],
      profile.sandbox.projectDir,
      {
        timeoutMinutes: options.timeoutMinutes,
        browserCommand: profile.browserCommand,
      },
    );
    if (
      result.id !== id ||
      result.promptId !== job.prompt.id ||
      result.config !== job.config ||
      result.agent !== job.agent ||
      result.taskPromptHash !== stableId(expectedTaskPrompt)
    ) {
      throw new Error(
        `Cannot resume from mismatched checkpoint: ${checkpointPath}`,
      );
    }
    if (!checkpointIsComplete(result)) {
      continue;
    }
    results.push(result);
  }
  return results;
}

function jobId(promptId, config, runner) {
  return `${promptId}-${config}-${runner}`;
}

function slugStateName(name) {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
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
    delete verification.stateCaptures;
    await fsp.copyFile(
      privateScreenshot,
      path.join(outputDir, 'screenshots', 'react-nobuild-starter.png'),
    );
    await fsp.writeFile(
      path.join(outputDir, 'starter-verification.json'),
      `${JSON.stringify(verification, null, 2)}\n`,
    );
  } finally {
    await fsp.rm(privateRun.root, {recursive: true, force: true});
  }
}

async function runOne({
  prompt,
  config,
  agent,
  spec,
  outputDir,
  options,
  profile,
}) {
  const id = jobId(prompt.id, config, agent);
  const sharedRunDir = path.join(outputDir, 'runs', id);
  const sharedScreenshot = path.join(outputDir, 'screenshots', `${id}.png`);
  const privateRun = await createPrivateRunRoot(`${id}-`);
  const privateScreenshot = path.join(privateRun.root, 'screenshot.png');
  const taskPrompt = buildTaskPrompt(prompt, spec, profile.sandbox.projectDir, {
    timeoutMinutes: options.timeoutMinutes,
    browserCommand: profile.browserCommand,
  });
  const result = {
    id,
    promptId: prompt.id,
    category: prompt.category,
    prompt: prompt.prompt,
    config,
    agent,
    outputDir,
    projectDir: profile.sandbox.projectDir,
    screenshotPath: sharedScreenshot,
    taskPromptHash: stableId(taskPrompt),
    startedAt: new Date().toISOString(),
  };
  let phase = 'setup';

  try {
    await prepareProject(spec, privateRun.projectDir);
    const baselineSources = await captureAuthoredSources(privateRun.projectDir);
    await fsp.writeFile(
      path.join(privateRun.projectDir, 'TASK.md'),
      `${taskPrompt}\n`,
    );

    phase = 'runner-launch';
    result.runner = await runAgent({
      name: agent,
      profile,
      privateRun,
      taskPrompt,
      timeoutMs: options.timeoutMinutes * 60 * 1000,
    });

    phase = 'evaluation';
    result.evaluation = await evaluateRun({
      config,
      projectDir: privateRun.projectDir,
      prompt,
      screenshotPath: privateScreenshot,
      baselineSources,
      skipJudge: options.skipJudge,
      judgeProfile: profile,
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
        result.runner.transcriptAudit?.passed === false
          ? `Strict transcript audit failed: ${result.runner.transcriptAudit.strictFindings.map(finding => finding.label).join('; ')}`
          : 'Agent runner failed or timed out',
      );
    }
    result.completed = true;
  } catch (error) {
    const message =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    result.infrastructureFailure = {
      phase,
      retryable: true,
      message,
    };
    result.completed = false;
  }
  result.finishedAt = new Date().toISOString();

  await fsp.rm(sharedRunDir, {recursive: true, force: true});
  await fsp.mkdir(sharedRunDir, {recursive: true});
  const screenshotsDir = path.join(outputDir, 'screenshots');
  for (const file of await fsp.readdir(screenshotsDir)) {
    if (file.startsWith(`${id}--`)) {
      await fsp.rm(path.join(screenshotsDir, file), {force: true});
    }
  }
  const capturedScreenshots =
    result.evaluation?.stateCaptures ??
    (fs.existsSync(privateScreenshot)
      ? [{name: 'default', screenshotPath: privateScreenshot}]
      : []);
  result.screenshots = [];
  for (const [index, capture] of capturedScreenshots.entries()) {
    if (!fs.existsSync(capture.screenshotPath)) {
      continue;
    }
    const sharedPath =
      capture.name === 'default'
        ? sharedScreenshot
        : path.join(
            screenshotsDir,
            `${id}--${index}-${slugStateName(capture.name)}.png`,
          );
    await fsp.copyFile(capture.screenshotPath, sharedPath);
    result.screenshots.push({name: capture.name, path: sharedPath});
  }
  result.screenshotPath =
    result.screenshots.find(screenshot => screenshot.name === 'default')
      ?.path ?? null;
  if (!result.screenshotPath) {
    await fsp.rm(sharedScreenshot, {force: true});
  }
  if (result.evaluation) {
    delete result.evaluation.stateCaptures;
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

async function runAgent({name, profile, privateRun, taskPrompt, timeoutMs}) {
  const entry = profile.runners[name];
  const execution = await runProfileCommand(
    profile,
    entry,
    privateRun,
    {prompt: taskPrompt},
    {timeoutMs, transcriptPath: privateRun.transcriptPath},
  );
  const usage = parseUsage(execution.stdout, entry.transcript);
  const combined = `${execution.stdout}\n${execution.stderr}`;
  const transcriptAudit = auditTranscript(
    execution.stdout,
    execution.stderr,
    entry.audit,
    entry.transcript,
  );
  return {
    command: name,
    code: execution.code,
    signal: execution.signal,
    success:
      execution.code === 0 && !execution.timedOut && transcriptAudit.passed,
    durationMs: execution.durationMs,
    timedOut: execution.timedOut,
    stalled: execution.timedOut,
    gaveUp:
      execution.code !== 0 ||
      /\b(?:unable to complete|cannot complete|giving up|could not complete)\b/i.test(
        combined,
      ),
    usage,
    toolCalls: countToolCalls(execution.stdout, entry.transcript),
    cliLookups: countCliLookups(execution.stdout, entry.transcript),
    transcriptAudit,
    limits: entry.limits ?? {},
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
    stateEvidence: [],
    automaticFailure: true,
  };
}

async function runnerVersions(profile, runners) {
  const entries = [];
  for (const name of runners) {
    const entry = profile.runners[name];
    if (!entry.versionArgs) {
      entries.push([name, null]);
      continue;
    }
    const result = await runCommand(entry.command, entry.versionArgs, {
      cwd: vibeTestsRoot,
      env: entry.env,
      timeoutMs: 30_000,
    });
    entries.push([name, (result.stdout || result.stderr).trim()]);
  }
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
          browserCommand: '<browser-helper> <file-or-url> [output.png]',
        }),
      );
    }
    console.log('');
  }
}

function parseArgs(args) {
  const options = {
    configs: [...DEFAULT_CONFIG_NAMES],
    runners: undefined,
    sample: undefined,
    prompts: undefined,
    seed: undefined,
    concurrency: 1,
    maxNewJobs: undefined,
    timeoutMinutes: 15,
    resume: false,
    dryRun: false,
    skipJudge: false,
    reactVersion: DEFAULT_REACT_VERSION,
    staticConfigPath: undefined,
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
    } else if (argument === '--runners') {
      options.runners = value.split(',').filter(Boolean);
      index += 1;
    } else if (argument === '--sample') {
      options.sample = positiveInteger(value, '--sample');
      index += 1;
    } else if (argument === '--prompts') {
      options.prompts = value.split(',').filter(Boolean);
      index += 1;
    } else if (argument === '--seed') {
      options.seed = value;
      index += 1;
    } else if (argument === '--concurrency') {
      options.concurrency = positiveInteger(value, '--concurrency');
      index += 1;
    } else if (argument === '--max-new-jobs') {
      options.maxNewJobs = positiveInteger(value, '--max-new-jobs');
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
    } else if (argument === '--static-config') {
      options.staticConfigPath = value;
      index += 1;
    } else if (argument === '--resume') {
      options.resume = true;
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

function validateConfigs(configs, specs) {
  for (const config of configs) {
    if (!CONFIG_NAMES.includes(config)) {
      throw new Error(`Unknown config: ${config}`);
    }
    if (!specs[config]) {
      throw new Error(
        `${config} requires --static-config with a JSON configuration file.`,
      );
    }
  }
}

function validateRunners(runners, profile) {
  for (const runner of runners) {
    if (!profile.runners[runner]) {
      throw new Error(`Runner is not defined in the profile: ${runner}`);
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
  --configs <names>              react-build,react-nobuild,static-html
  --runners <names>              profile runner names (default: all)
  --sample <n>                   category-stratified sample
  --seed <value>                 stable sample order; recorded in the manifest
  --prompts <ids>                comma-separated prompt ids
  --resume                       reuse matching completed cell checkpoints
  --dry-run                      print prompts; needs no runner profile or agent CLI
  --concurrency <n>              concurrent fresh runner processes (default 1)
  --max-new-jobs <n>             stop after this many new cells; resume later
  --timeout-minutes <n>          per-runner timeout (default 15)
  --output-dir <path>            run artifacts directory (default /tmp)
  --iteration <id>               stable report identifier
  --react-version <version>      npm/CDN Astryx version (default 0.6.5)
  --static-config <path>         JSON assets/config for static-html
  --skip-judge                   omit the blind visual judge

Set VIBE_RUNNER_PROFILE to an uncommitted JSON file, or set
VIBE_RUNNER_PROFILE_JSON to the same JSON inline, for non-dry runs.
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

#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global console, process */

/**
 * @file Delivery-mode project producer CLI for VibeArtifactV2.
 * @input Prompt/config/runner selections plus a local runner profile.
 * @output One immutable project artifact per attempted producer cell.
 * @position AST-067 PR 2. Evaluation, capture, metrics, judging, aggregation,
 *   and reporting are intentionally absent.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  emitProjectArtifactV2,
  exportProjectGitBaselineV2,
  initializeProjectGitBaselineV2,
} from './artifact.ts';
import {
  DEFAULT_CONFIG_NAMES,
  DEFAULT_REACT_VERSION,
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
} from './constants.mjs';
import {
  auditTranscript,
  countCliLookups,
  countToolCalls,
  createPrivateRunRoot,
  parseUsage,
  runProfileCommand,
  runProfilePreflight,
} from './process.mjs';
import {loadRunnerProfile} from './profile.mjs';
import {
  prepareProject,
  projectArtifactRecipe,
  validateStaticConfig,
} from './projects.mjs';

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
  const preflight = await runProfilePreflight(profile);
  const iterationId =
    options.iteration ??
    new Date().toISOString().replaceAll(/[:.]/g, '-').replace('Z', '');
  const outputDir = path.resolve(
    options.outputDir ??
      path.join('/tmp/astryx-project-artifacts', iterationId),
  );
  const manifestPath = path.join(outputDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    throw new Error(`Producer output already exists: ${outputDir}`);
  }
  await fsp.mkdir(path.join(outputDir, 'bundles'), {recursive: true});

  const jobs = [];
  for (const prompt of prompts) {
    for (const config of options.configs) {
      for (const runner of runners) {
        jobs.push({prompt, config, runner});
      }
    }
  }

  const manifest = {
    schema: 'ProjectArtifactManifestV1',
    schemaVersion: 1,
    iterationId,
    createdAt: new Date().toISOString(),
    configs: options.configs,
    runners,
    prompts: prompts.map(prompt => prompt.id),
    producerContract: 'project-producer-v1',
    isolation: {
      passed: preflight.passed,
      privateRootMode: preflight.privateRootMode,
    },
    artifacts: [],
  };

  console.log(
    `Producing ${jobs.length} artifact${jobs.length === 1 ? '' : 's'} (${options.concurrency} concurrent)…`,
  );
  let completed = 0;
  await runWithConcurrency(jobs, options.concurrency, async job => {
    const result = await produceOne({
      ...job,
      spec: specs[job.config],
      outputDir,
      options,
      profile,
    });
    manifest.artifacts.push(result);
    completed += 1;
    console.log(
      `[${completed}/${jobs.length}] ${job.prompt.id} ${job.config} ${job.runner}: ${result.status}`,
    );
  });
  manifest.artifacts.sort((left, right) => left.id.localeCompare(right.id));
  manifest.completedAt = new Date().toISOString();
  await fsp.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Manifest: ${manifestPath}`);
}

async function produceOne({
  prompt,
  config,
  runner,
  spec,
  outputDir,
  options,
  profile,
}) {
  const id = jobId(prompt.id, config, runner);
  const bundleRelative = `bundles/${id}`;
  const bundleRoot = path.join(outputDir, 'bundles', id);
  const privateRun = await createPrivateRunRoot(`${id}-`);
  const baselineDir = path.join(privateRun.root, 'baseline');
  let phase = 'scaffold';

  try {
    await prepareProject(spec, privateRun.projectDir);
    phase = 'baseline';
    const baselineCommit = initializeProjectGitBaselineV2(
      privateRun.projectDir,
    );
    await exportProjectGitBaselineV2(
      privateRun.projectDir,
      baselineCommit,
      baselineDir,
    );
    const taskPrompt = buildTaskPrompt(
      prompt,
      spec,
      profile.sandbox.projectDir,
      {
        timeoutMinutes: options.timeoutMinutes,
        browserCommand:
          profile.browserCommand ?? 'screenshot <file-or-url> [output.png]',
      },
    );
    await fsp.writeFile(
      path.join(privateRun.projectDir, 'TASK.md'),
      `${taskPrompt}\n`,
    );

    phase = 'runner';
    const runnerReceipt = await runAgent({
      name: runner,
      profile,
      privateRun,
      taskPrompt,
      timeoutMs: options.timeoutMinutes * 60 * 1000,
    });

    phase = 'artifact';
    const recipe = projectArtifactRecipe(spec);
    const artifact = await emitProjectArtifactV2({
      bundleRoot,
      projectDir: privateRun.projectDir,
      baselineDir,
      baselineCommit,
      prompt: {id: prompt.id, text: prompt.prompt},
      deliveryMode: config,
      view: recipe.view,
      network: recipe.network,
      entryHints: recipe.entryHints,
      runner: runnerReceipt,
    });
    return {
      id,
      promptId: prompt.id,
      config,
      runner,
      status: runnerReceipt.status,
      artifactId: artifact.artifactId,
      bundle: bundleRelative,
    };
  } catch (error) {
    return {
      id,
      promptId: prompt.id,
      config,
      runner,
      status: 'producer_failed',
      phase,
      error: redactError(error, [
        [privateRun.root, '<private-root>'],
        [profile.sandbox.root, '<sandbox-root>'],
        [outputDir, '<output-root>'],
      ]),
      artifactId: null,
      bundle: null,
    };
  } finally {
    await fsp.rm(privateRun.root, {recursive: true, force: true});
  }
}

async function runAgent({name, profile, privateRun, taskPrompt, timeoutMs}) {
  const entry = profile.runners[name];
  const startedAt = new Date().toISOString();
  const execution = await runProfileCommand(
    profile,
    entry,
    privateRun,
    {prompt: taskPrompt},
    {timeoutMs, transcriptPath: privateRun.transcriptPath},
  );
  const finishedAt = new Date().toISOString();
  const usage = parseUsage(execution.stdout, entry.transcript);
  const transcriptAudit = auditTranscript(
    execution.stdout,
    execution.stderr,
    entry.audit,
    entry.transcript,
  );
  const succeeded =
    execution.code === 0 && !execution.timedOut && transcriptAudit.passed;
  return {
    name,
    harness: entry.harness,
    model: entry.model,
    ...(entry.effort ? {effort: entry.effort} : {}),
    status: execution.timedOut
      ? 'timed_out'
      : succeeded
        ? 'succeeded'
        : 'failed',
    startedAt,
    finishedAt,
    durationMs: execution.durationMs,
    attempt: 1,
    exitCode: execution.code,
    signal: execution.signal,
    usage,
    toolCalls: countToolCalls(execution.stdout, entry.transcript),
    cliLookups: countCliLookups(execution.stdout, entry.transcript),
    transcriptAudit,
  };
}

async function loadStaticConfig(filePath) {
  const config = JSON.parse(await fsp.readFile(path.resolve(filePath), 'utf8'));
  validateStaticConfig(config);
  return config;
}

function jobId(promptId, config, runner) {
  return `${promptId}-${config}-${runner}`;
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

function redactError(error, replacements) {
  let message = error instanceof Error ? error.message : String(error);
  for (const [value, replacement] of replacements) {
    if (value) {
      message = message.replaceAll(value, replacement);
    }
  }
  return message;
}

function parseArgs(args) {
  const options = {
    configs: [...DEFAULT_CONFIG_NAMES],
    runners: null,
    prompts: null,
    sample: null,
    seed: null,
    concurrency: 1,
    timeoutMinutes: 15,
    reactVersion: DEFAULT_REACT_VERSION,
    iteration: null,
    outputDir: null,
    staticConfigPath: null,
    dryRun: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const next = () => {
      index += 1;
      if (index >= args.length) {
        throw new Error(`Missing value for ${argument}`);
      }
      return args[index];
    };
    if (argument === '--configs') {
      options.configs = csv(next());
    } else if (argument === '--runners') {
      options.runners = csv(next());
    } else if (argument === '--prompts') {
      options.prompts = csv(next());
    } else if (argument === '--sample') {
      options.sample = positiveInteger(next(), argument);
    } else if (argument === '--seed') {
      options.seed = next();
    } else if (argument === '--concurrency') {
      options.concurrency = positiveInteger(next(), argument);
    } else if (argument === '--timeout-minutes') {
      options.timeoutMinutes = positiveInteger(next(), argument);
    } else if (argument === '--react-version') {
      options.reactVersion = next();
    } else if (argument === '--iteration') {
      options.iteration = next();
    } else if (argument === '--output') {
      options.outputDir = next();
    } else if (argument === '--static-config') {
      options.staticConfigPath = next();
      if (!options.configs.includes('static-html')) {
        options.configs.push('static-html');
      }
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--help' || argument === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return options;
}

function csv(value) {
  const values = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (values.length === 0) {
    throw new Error('Expected at least one comma-separated value.');
  }
  return values;
}

function positiveInteger(value, flag) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

function validateConfigs(configs, specs) {
  for (const config of configs) {
    if (!specs[config]) {
      throw new Error(
        `Unknown or unconfigured delivery config: ${config}. ` +
          'Pass --static-config before selecting static-html.',
      );
    }
  }
}

function validateRunners(runners, profile) {
  for (const runner of runners) {
    if (!profile.runners[runner]) {
      throw new Error(`Runner profile does not define runner: ${runner}`);
    }
  }
}

function printHelp() {
  console.log(`Usage: pnpm -F @astryxdesign/vibe-tests project:produce [options]

Produces immutable VibeArtifactV2 bundles. It does not evaluate or score them.

Options:
  --configs <names>          Comma-separated delivery modes (default: react-build,react-nobuild)
  --static-config <file>     Add static-html using a public asset config
  --runners <names>          Comma-separated profile runners (default: all)
  --prompts <ids>            Comma-separated prompt IDs
  --sample <count>           Stratified prompt sample
  --seed <value>             Stable sampling seed
  --concurrency <count>      Concurrent producer cells (default: 1)
  --timeout-minutes <count>  Runner timeout (default: 15)
  --react-version <version>  Published Astryx package version
  --iteration <id>           Stable output iteration ID
  --output <directory>       Output root
  --dry-run                  Print task contracts without a runner profile
  --help                     Show this help
`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

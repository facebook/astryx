#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global console, process */

import * as fs from 'node:fs';
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
import {evaluateRun} from './evaluator.mjs';
import {
  countCliLookups,
  countToolCalls,
  parseUsage,
  runCommand,
} from './process.mjs';
import {prepareProject} from './projects.mjs';
import {buildReports} from './report.mjs';

const fsp = fs.promises;
const here = path.dirname(fileURLToPath(import.meta.url));
const vibeTestsRoot = path.resolve(here, '..');

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

  const iterationId =
    options.iteration ??
    new Date().toISOString().replaceAll(/[:.]/g, '-').replace('Z', '');
  const outputDir = path.resolve(
    options.outputDir ?? path.join('/tmp/astryx-delivery-modes', iterationId),
  );
  await fsp.mkdir(outputDir, {recursive: true});
  await fsp.mkdir(path.join(outputDir, 'screenshots'), {recursive: true});
  await fsp.mkdir(path.join(outputDir, 'judge'), {recursive: true});
  await fsp.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(
      {
        iterationId,
        createdAt: new Date().toISOString(),
        configs: options.configs,
        agents: options.agents,
        prompts: prompts.map(prompt => prompt.id),
        reactVersion: options.reactVersion,
        vanillaCdnRef: options.vanillaCdnRef,
        vanillaTarballUrl: options.vanillaTarballUrl,
      },
      null,
      2,
    )}\n`,
  );

  if (options.configs.includes('react-nobuild')) {
    console.log('Verifying the React no-build 0.6.5 starter…');
    const starterDir = path.join(outputDir, 'starter-verification');
    await prepareProject(specs['react-nobuild'], starterDir);
    const starterScreenshot = path.join(
      outputDir,
      'screenshots',
      'react-nobuild-starter-0.6.5.png',
    );
    const verification = await evaluateRun({
      config: 'react-nobuild',
      projectDir: starterDir,
      prompt: {prompt: 'Render the supplied starter.'},
      screenshotPath: starterScreenshot,
      judgeRoot: path.join(outputDir, 'judge'),
      skipJudge: true,
    });
    await fsp.writeFile(
      path.join(outputDir, 'starter-verification.json'),
      `${JSON.stringify(verification, null, 2)}\n`,
    );
    if (!verification.render.passed) {
      throw new Error(
        `React no-build starter failed verification: ${JSON.stringify(verification.render)}`,
      );
    }
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

async function runOne({prompt, config, agent, spec, outputDir, options}) {
  const id = `${prompt.id}-${config}-${agent}`;
  const runDir = path.join(outputDir, 'runs', id);
  const projectDir = path.join(runDir, 'project');
  const screenshotPath = path.join(outputDir, 'screenshots', `${id}.png`);
  const taskPrompt = buildTaskPrompt(prompt, spec, projectDir);
  const result = {
    id,
    promptId: prompt.id,
    prompt: prompt.prompt,
    config,
    agent,
    outputDir,
    projectDir,
    screenshotPath,
    taskPromptHash: stableId(
      taskPrompt.replaceAll(projectDir, '<project-dir>'),
    ),
    startedAt: new Date().toISOString(),
  };

  try {
    await fsp.mkdir(runDir, {recursive: true});
    await prepareProject(spec, projectDir);
    const promptFile = path.join(projectDir, 'TASK.md');
    await fsp.writeFile(promptFile, `${taskPrompt}\n`);
    result.runner = await runAgent({
      agent,
      projectDir,
      promptFile,
      taskPrompt,
      timeoutMs: options.timeoutMinutes * 60 * 1000,
      transcriptPath: path.join(runDir, `${agent}.transcript.jsonl`),
    });
    result.evaluation = await evaluateRun({
      config,
      projectDir,
      prompt,
      screenshotPath,
      judgeRoot: path.join(outputDir, 'judge'),
      skipJudge: options.skipJudge,
    });
  } catch (error) {
    result.error =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    result.evaluation ??= {
      render: {passed: false, nonBlank: false, error: result.error},
    };
  }
  result.finishedAt = new Date().toISOString();
  await fsp.mkdir(runDir, {recursive: true});
  await fsp.writeFile(
    path.join(runDir, 'run.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  return result;
}

async function runAgent({
  agent,
  projectDir,
  promptFile,
  taskPrompt,
  timeoutMs,
  transcriptPath,
}) {
  let command;
  let args;
  let input;
  if (agent === 'claude') {
    command = 'claude';
    args = [
      '--no-session-persistence',
      '--permission-mode',
      'bypassPermissions',
      '--dangerously-skip-permissions',
      '--disable-slash-commands',
      '--setting-sources',
      'project',
      '-p',
      '--output-format',
      'stream-json',
      '--verbose',
    ];
    input = taskPrompt;
  } else if (agent === 'muse') {
    command = 'muse';
    args = [
      'exec',
      '--json',
      '--workspace',
      projectDir,
      '--prompt-file',
      promptFile,
      '--trust-workspace',
      '--yolo',
      '--parallel-tool-calls',
      '--no-foreign-personal-context',
      '--no-session-log',
      '--max-model-steps',
      '80',
    ];
  } else {
    throw new Error(`Unsupported agent: ${agent}`);
  }

  const execution = await runCommand(command, args, {
    cwd: projectDir,
    input,
    timeoutMs,
    transcriptPath,
  });
  const usage = parseUsage(execution.stdout);
  const combined = `${execution.stdout}\n${execution.stderr}`;
  return {
    command: agent,
    code: execution.code,
    signal: execution.signal,
    success: execution.code === 0 && !execution.timedOut,
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
    cliLookups: countCliLookups(combined),
    stderr: execution.stderr,
  };
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
      console.log(buildTaskPrompt(prompt, specs[config], '<project-dir>'));
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

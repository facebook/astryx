#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const PAGES_BRANCH = 'gh-pages';
const QUEUE_REL = path.join('.astryx-gh-pages', 'publication-queue');
const HOLDER_NAME = 'holder.json';
const RUN_ID = /^[1-9][0-9]*$/;
const SCOPE = /^[a-z0-9][a-z0-9._/-]*$/;
const BOT_NAME = 'github-actions[bot]';
const BOT_EMAIL = 'github-actions[bot]@users.noreply.github.com';
const DEFAULT_WAIT_MS = 75 * 60 * 1000;

function refuse(message) {
  throw new Error(`gh-pages publisher refused: ${message}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    ...options,
  });
  if (result.status !== 0) {
    refuse(
      `${command} ${args[0] ?? ''} failed: ${
        result.stderr?.trim() ||
        result.stdout?.trim() ||
        `exit ${result.status}`
      }`,
    );
  }
  return result.stdout.trim();
}

function tryRun(command, args, options = {}) {
  return spawnSync(command, args, {encoding: 'utf8', ...options});
}

function git(cwd, ...args) {
  return run('git', ['-C', cwd, ...args]);
}

function configureGitIdentity(cwd) {
  git(cwd, 'config', 'user.name', BOT_NAME);
  git(cwd, 'config', 'user.email', BOT_EMAIL);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateIdentity(repository, runId, scope) {
  if (typeof repository !== 'string' || !/^[^/]+\/[^/]+$/.test(repository)) {
    refuse('repository identity is invalid');
  }
  if (!Number.isSafeInteger(runId) || runId <= 0) {
    refuse('current run id is invalid');
  }
  if (typeof scope !== 'string' || !SCOPE.test(scope) || scope.includes('..')) {
    refuse('publication scope is invalid');
  }
}

function ticketValue(repository, runId, scope) {
  return {version: 1, repository, runId, scope};
}

function validTicket(value, repository, runId, scope = value?.scope) {
  return (
    Number.isSafeInteger(runId) &&
    runId > 0 &&
    value?.version === 1 &&
    value.repository === repository &&
    value.runId === runId &&
    value.scope === scope &&
    typeof scope === 'string' &&
    SCOPE.test(scope) &&
    !scope.includes('..')
  );
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function orderedTickets(entries, repository) {
  if (!Array.isArray(entries)) refuse('queue entries are invalid');
  const tickets = [];
  const seen = new Set();
  for (const entry of entries) {
    if (!RUN_ID.test(entry?.name ?? '')) continue;
    const runId = Number(entry.name);
    if (!validTicket(entry.value, repository, runId)) {
      refuse(`queue ticket ${entry.name} has invalid identity`);
    }
    if (seen.has(runId)) refuse('queue repeats a run id');
    seen.add(runId);
    tickets.push(entry.value);
  }
  return tickets.sort((a, b) => a.runId - b.runId);
}

export function publicationBlockers(entries, repository, currentRunId, scope) {
  validateIdentity(repository, currentRunId, scope);
  const tickets = orderedTickets(entries, repository);
  if (
    !tickets.some(
      ticket => ticket.runId === currentRunId && ticket.scope === scope,
    )
  ) {
    refuse(`queue ticket for run ${currentRunId} is missing`);
  }
  return tickets.filter(ticket => ticket.runId < currentRunId);
}

export function isTerminalRun(status) {
  return status === 'completed' || status === 'missing';
}

function queueState(checkout, repository) {
  const root = path.join(checkout, QUEUE_REL);
  if (!fs.existsSync(root)) return {entries: [], invalid: [], holder: null};
  const entries = [];
  const invalid = [];
  let holder = null;
  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const value = readJSON(path.join(root, entry.name));
    if (entry.name === HOLDER_NAME) {
      if (!validTicket(value, repository, value?.runId)) {
        refuse('publication holder has invalid identity');
      }
      holder = value;
      continue;
    }
    const name = entry.name.slice(0, -'.json'.length);
    if (!RUN_ID.test(name)) {
      invalid.push(entry.name);
      continue;
    }
    const runId = Number(name);
    if (!validTicket(value, repository, runId)) {
      invalid.push(entry.name);
      continue;
    }
    entries.push({name, value});
  }
  return {entries, invalid, holder};
}

function remoteURL({repository, token, remoteURL}) {
  return (
    remoteURL ??
    process.env.ASTRYX_GH_PAGES_REMOTE_URL ??
    `https://x-access-token:${token}@github.com/${repository}.git`
  );
}

function checkoutPages({
  repository,
  token,
  tempRoot,
  sparsePaths = [],
  noCheckout = false,
  prefix = 'gh-pages-',
  remoteURL: configuredRemoteURL,
}) {
  const checkout = fs.mkdtempSync(path.join(tempRoot, prefix));
  const args = [
    'clone',
    '--quiet',
    '--depth=1',
    '--filter=blob:none',
    '--single-branch',
    '--branch',
    PAGES_BRANCH,
  ];
  if (noCheckout) {
    args.push('--no-checkout');
  } else if (sparsePaths.length > 0) {
    args.push('--sparse');
  }
  args.push(
    remoteURL({repository, token, remoteURL: configuredRemoteURL}),
    checkout,
  );
  run('git', args);
  if (noCheckout) {
    git(checkout, 'sparse-checkout', 'init', '--cone');
    git(checkout, 'sparse-checkout', 'set', ...sparsePaths);
    git(checkout, 'checkout', PAGES_BRANCH);
  } else if (sparsePaths.length > 0) {
    git(checkout, 'sparse-checkout', 'set', ...sparsePaths);
  }
  return checkout;
}

async function mutateQueue({
  repository,
  runId,
  scope,
  token,
  tempRoot,
  remoteURL,
  mutate,
}) {
  validateIdentity(repository, runId, scope);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [QUEUE_REL],
      prefix: 'gh-pages-queue-',
    });
    try {
      const mutation = mutate(checkout);
      if (!mutation.changed) return mutation.value;
      configureGitIdentity(checkout);
      git(checkout, 'add', '-A', QUEUE_REL);
      git(checkout, 'commit', '-qm', 'ci: update gh-pages publication queue');
      const pushed = tryRun('git', [
        '-C',
        checkout,
        'push',
        'origin',
        PAGES_BRANCH,
      ]);
      if (pushed.status === 0) return mutation.value;
      if (permissionDenied(pushed)) {
        refuse('push to gh-pages denied while updating the publication queue');
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    await sleep(attempt * 1000);
  }
  refuse('could not update the publication queue after 10 attempts');
}

export async function enqueuePublication(options) {
  const {repository, runId, scope} = options;
  await mutateQueue({
    ...options,
    mutate(checkout) {
      const file = path.join(checkout, QUEUE_REL, `${runId}.json`);
      if (fs.existsSync(file)) {
        if (!validTicket(readJSON(file), repository, runId, scope)) {
          refuse('existing queue ticket has invalid identity');
        }
        return {changed: false};
      }
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(
        file,
        `${JSON.stringify(ticketValue(repository, runId, scope), null, 2)}\n`,
      );
      return {changed: true};
    },
  });
  process.stdout.write(
    `Queued gh-pages publication run ${runId} (${scope}).\n`,
  );
}

export async function releasePublication(options) {
  const {repository, runId, scope} = options;
  await mutateQueue({
    ...options,
    mutate(checkout) {
      const root = path.join(checkout, QUEUE_REL);
      const ticket = path.join(root, `${runId}.json`);
      const holder = path.join(root, HOLDER_NAME);
      let changed = false;
      if (fs.existsSync(ticket)) {
        fs.rmSync(ticket);
        changed = true;
      }
      const held = readJSON(holder);
      if (held?.runId === runId && held?.scope === scope) {
        fs.rmSync(holder);
        changed = true;
      }
      return {changed};
    },
  });
  process.stdout.write(
    `Released gh-pages publication run ${runId} (${scope}).\n`,
  );
}

async function removeInvalid({
  repository,
  runId,
  scope,
  names,
  token,
  tempRoot,
  remoteURL,
}) {
  await mutateQueue({
    repository,
    runId,
    scope,
    token,
    tempRoot,
    remoteURL,
    mutate(checkout) {
      let changed = false;
      for (const name of names) {
        const file = path.join(checkout, QUEUE_REL, name);
        if (fs.existsSync(file)) {
          fs.rmSync(file);
          changed = true;
        }
      }
      return {changed};
    },
  });
}

async function claimPublication(options) {
  const {repository, runId, scope} = options;
  return mutateQueue({
    ...options,
    mutate(checkout) {
      const state = queueState(checkout, repository);
      if (state.invalid.length > 0) return {changed: false, value: false};
      if (state.holder) {
        return {
          changed: false,
          value: state.holder.runId === runId && state.holder.scope === scope,
        };
      }
      const tickets = orderedTickets(state.entries, repository);
      if (tickets[0]?.runId !== runId || tickets[0]?.scope !== scope) {
        return {changed: false, value: false};
      }
      fs.writeFileSync(
        path.join(checkout, QUEUE_REL, HOLDER_NAME),
        `${JSON.stringify(ticketValue(repository, runId, scope), null, 2)}\n`,
      );
      return {changed: true, value: true};
    },
  });
}

function runStatus(repository, runId) {
  const result = tryRun('gh', [
    'api',
    `repos/${repository}/actions/runs/${runId}`,
  ]);
  if (result.status === 0) {
    try {
      return JSON.parse(result.stdout).status;
    } catch (error) {
      refuse(`cannot parse queued run ${runId}: ${error.message}`);
    }
  }
  if (/HTTP 404|Not Found/i.test(result.stderr ?? '')) return 'missing';
  refuse(
    `cannot resolve queued run ${runId}: ${
      result.stderr?.trim() || result.stdout?.trim() || `exit ${result.status}`
    }`,
  );
}

export async function waitForPublicationTurn({
  repository,
  runId,
  scope,
  token,
  tempRoot,
  remoteURL,
  timeoutMs = DEFAULT_WAIT_MS,
}) {
  validateIdentity(repository, runId, scope);
  const started = Date.now();
  const checkTimeout = blocker => {
    if (Date.now() - started >= timeoutMs) {
      refuse(
        `timed out behind gh-pages publication run ${blocker ?? 'unknown'}`,
      );
    }
  };
  while (true) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [QUEUE_REL],
      prefix: 'gh-pages-queue-',
    });
    let state;
    try {
      state = queueState(checkout, repository);
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    if (state.invalid.length > 0) {
      checkTimeout(state.holder?.runId);
      await removeInvalid({
        repository,
        runId,
        scope,
        names: state.invalid,
        token,
        tempRoot,
        remoteURL,
      });
      continue;
    }
    if (state.holder?.runId === runId && state.holder?.scope === scope) {
      process.stdout.write(
        `gh-pages publication turn acquired by run ${runId}.\n`,
      );
      return;
    }
    if (state.holder) {
      if (isTerminalRun(runStatus(repository, state.holder.runId))) {
        checkTimeout(state.holder.runId);
        await releasePublication({
          repository,
          runId: state.holder.runId,
          scope: state.holder.scope,
          token,
          tempRoot,
          remoteURL,
        });
        continue;
      }
    } else {
      const blockers = publicationBlockers(
        state.entries,
        repository,
        runId,
        scope,
      );
      let pruned = false;
      for (const blocker of blockers) {
        if (isTerminalRun(runStatus(repository, blocker.runId))) {
          checkTimeout(blocker.runId);
          await releasePublication({
            repository,
            runId: blocker.runId,
            scope: blocker.scope,
            token,
            tempRoot,
            remoteURL,
          });
          pruned = true;
        }
      }
      if (pruned) continue;
      if (
        blockers.length === 0 &&
        (await claimPublication({
          repository,
          runId,
          scope,
          token,
          tempRoot,
          remoteURL,
        }))
      ) {
        process.stdout.write(
          `gh-pages publication turn acquired by run ${runId}.\n`,
        );
        return;
      }
    }
    const blocker =
      state.holder?.runId ??
      orderedTickets(state.entries, repository)[0]?.runId;
    checkTimeout(blocker);
    process.stdout.write(`Waiting for gh-pages publication run ${blocker}.\n`);
    await sleep(30000);
  }
}

function copyContents(source, destination) {
  fs.mkdirSync(destination, {recursive: true});
  for (const entry of fs.readdirSync(source, {withFileTypes: true})) {
    fs.cpSync(
      path.join(source, entry.name),
      path.join(destination, entry.name),
      {
        recursive: true,
        force: true,
      },
    );
  }
}

function permissionDenied(result) {
  const text = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
  return /denied|403|permission|not authorized/i.test(text);
}

function pushOrRetry(result) {
  if (result.status === 0) return true;
  if (permissionDenied(result)) {
    refuse('push to gh-pages denied');
  }
  return false;
}

function commitIfNeeded(checkout, message, addArgs) {
  configureGitIdentity(checkout);
  git(checkout, 'add', ...addArgs);
  const diff = tryRun('git', ['-C', checkout, 'diff', '--cached', '--quiet']);
  if (diff.status === 0) return null;
  git(checkout, 'commit', '-qm', message);
  return git(checkout, 'rev-parse', 'HEAD');
}

export async function publishReleaseGateReport({
  repository,
  token,
  tempRoot,
  remoteURL,
  source,
  runId,
  maxAttempts = 5,
  beforePush,
}) {
  const sourceDir = path.resolve(source);
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [path.join('visual-gate')],
      prefix: 'gh-pages-release-gate-',
    });
    try {
      const runDir = path.join(checkout, 'visual-gate', String(runId));
      const latestDir = path.join(checkout, 'visual-gate', 'latest');
      fs.rmSync(runDir, {recursive: true, force: true});
      fs.rmSync(latestDir, {recursive: true, force: true});
      copyContents(sourceDir, runDir);
      copyContents(sourceDir, latestDir);
      pruneReleaseGateRuns(path.join(checkout, 'visual-gate'));
      const commit = commitIfNeeded(checkout, `release gate: ${runId}`, [
        '-A',
        'visual-gate',
      ]);
      if (commit === null) {
        process.stdout.write('Nothing to publish.\n');
        return {published: false};
      }
      await beforePush?.({attempt, checkout, commit});
      const pushed = tryRun('git', [
        '-C',
        checkout,
        'push',
        'origin',
        PAGES_BRANCH,
      ]);
      if (pushOrRetry(pushed)) {
        process.stdout.write(
          `Published https://facebook.github.io/astryx/visual-gate/${runId}/\n`,
        );
        return {published: true, commit};
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    process.stdout.write(
      `Push rejected; retrying release-gate publish (${attempt}/${maxAttempts}).\n`,
    );
    await sleep(attempt * 2000);
  }
  refuse(
    `could not publish the release-gate report after ${maxAttempts} attempts`,
  );
}

function pruneReleaseGateRuns(visualGateRoot) {
  if (!fs.existsSync(visualGateRoot)) return;
  const runs = fs
    .readdirSync(visualGateRoot, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && RUN_ID.test(entry.name))
    .map(entry => Number(entry.name))
    .sort((a, b) => a - b);
  for (const runId of runs.slice(0, Math.max(0, runs.length - 20))) {
    fs.rmSync(path.join(visualGateRoot, String(runId)), {
      recursive: true,
      force: true,
    });
  }
}

export async function publishStableSite({
  repository,
  token,
  tempRoot,
  remoteURL,
  source,
  sha,
  maxAttempts = 5,
  beforePush,
}) {
  const sourceDir = path.resolve(source);
  const shortSha = sha.slice(0, 7);
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      noCheckout: true,
      sparsePaths: ['storybook', 'sandbox', 'assets'],
      prefix: 'gh-pages-stable-',
    });
    try {
      const oldHead = git(checkout, 'rev-parse', 'HEAD');
      for (const rel of [
        'storybook',
        'sandbox',
        'assets',
        'index.html',
        'latest',
      ]) {
        fs.rmSync(path.join(checkout, rel), {recursive: true, force: true});
      }
      copyContents(sourceDir, checkout);
      fs.closeSync(fs.openSync(path.join(checkout, '.nojekyll'), 'a'));
      git(checkout, 'add', '-A');
      const diff = tryRun('git', [
        '-C',
        checkout,
        'diff',
        '--cached',
        '--quiet',
      ]);
      if (diff.status === 0) {
        process.stdout.write('Nothing to publish.\n');
        return {published: false};
      }
      configureGitIdentity(checkout);
      const tree = git(checkout, 'write-tree');
      const commit = run('git', [
        '-C',
        checkout,
        'commit-tree',
        tree,
        '-m',
        `Deploy ${shortSha} to GitHub Pages`,
      ]);
      await beforePush?.({attempt, checkout, commit, oldHead});
      const pushed = tryRun('git', [
        '-C',
        checkout,
        'push',
        'origin',
        `--force-with-lease=refs/heads/${PAGES_BRANCH}:${oldHead}`,
        `${commit}:refs/heads/${PAGES_BRANCH}`,
      ]);
      if (pushOrRetry(pushed)) {
        process.stdout.write(
          `Published stable site ${shortSha} (${commit.slice(0, 7)}).\n`,
        );
        return {published: true, commit};
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    process.stdout.write(
      `Push rejected; retrying stable-site publish (${attempt}/${maxAttempts}).\n`,
    );
    await sleep(attempt * 2000);
  }
  refuse(`could not publish the stable site after ${maxAttempts} attempts`);
}

export async function withPublicationTurn({
  repository,
  runId,
  scope,
  token,
  tempRoot,
  remoteURL,
  publish,
}) {
  validateIdentity(repository, runId, scope);
  await enqueuePublication({
    repository,
    runId,
    scope,
    token,
    tempRoot,
    remoteURL,
  });
  await waitForPublicationTurn({
    repository,
    runId,
    scope,
    token,
    tempRoot,
    remoteURL,
  });
  try {
    return await publish();
  } finally {
    await releasePublication({
      repository,
      runId,
      scope,
      token,
      tempRoot,
      remoteURL,
    });
  }
}

function flag(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) refuse(`${name} requires a value`);
  return value;
}

function cliContext(args) {
  const repository = process.env.GITHUB_REPOSITORY ?? '';
  const runId = Number(process.env.GITHUB_RUN_ID);
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? '';
  const tempRoot = process.env.RUNNER_TEMP || os.tmpdir();
  const maxAttempts = Number(flag(args, '--max-attempts', '5'));
  if (!token) refuse('GitHub token is missing');
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts <= 0) {
    refuse('--max-attempts is invalid');
  }
  return {repository, runId, token, tempRoot, maxAttempts};
}

export async function main(argv = process.argv.slice(2)) {
  const command = argv[0];
  const context = cliContext(argv);
  if (command === 'stable-site') {
    const source = flag(argv, '--source');
    const sha = flag(argv, '--sha', process.env.GITHUB_SHA ?? '');
    if (!source) refuse('--source is required');
    if (!/^[0-9a-f]{7,40}$/i.test(sha)) refuse('--sha is invalid');
    await withPublicationTurn({
      ...context,
      scope: 'whole-tree',
      publish: () => publishStableSite({...context, source, sha}),
    });
  } else if (command === 'release-gate') {
    const source = flag(argv, '--source');
    if (!source) refuse('--source is required');
    await withPublicationTurn({
      ...context,
      scope: 'visual-gate/reports',
      publish: () => publishReleaseGateReport({...context, source}),
    });
  } else {
    refuse(
      'usage: gh-pages-publisher.mjs <stable-site|release-gate> --source <dir>',
    );
  }
}

if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url))
) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

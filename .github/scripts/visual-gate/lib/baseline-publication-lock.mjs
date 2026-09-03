#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

// Durable FIFO publication lock shared by automatic acceptance promotion and
// manual baseline promotion. GitHub Actions concurrency is not used here:
// even with cancel-in-progress:false it keeps only one pending run and cancels
// an older pending publisher when a third arrives.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const QUEUE_REL = path.join('visual-gate', 'publication-queue');
const HOLDER_NAME = 'holder.json';
const RUN_ID = /^[1-9][0-9]*$/;

function refuse(message) {
  throw new Error(`baseline publication lock refused: ${message}`);
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

function git(cwd, ...args) {
  return run('git', ['-C', cwd, ...args]);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateIdentity(repository, runId) {
  if (typeof repository !== 'string' || !/^[^/]+\/[^/]+$/.test(repository)) {
    refuse('repository identity is invalid');
  }
  if (!Number.isSafeInteger(runId) || runId <= 0) {
    refuse('current run id is invalid');
  }
}

function validTicket(value, repository, runId) {
  return (
    Number.isSafeInteger(runId) &&
    runId > 0 &&
    value?.version === 1 &&
    value.repository === repository &&
    value.runId === runId
  );
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

export function publicationBlockers(entries, repository, currentRunId) {
  validateIdentity(repository, currentRunId);
  const tickets = orderedTickets(entries, repository);
  if (!tickets.some(ticket => ticket.runId === currentRunId)) {
    refuse(`queue ticket for run ${currentRunId} is missing`);
  }
  return tickets.filter(ticket => ticket.runId < currentRunId);
}

export function isTerminalRun(status) {
  return status === 'completed' || status === 'missing';
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
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

function checkoutPages({repository, token, tempRoot}) {
  const checkout = fs.mkdtempSync(path.join(tempRoot, 'baseline-queue-'));
  const url =
    process.env.ASTRYX_BASELINE_QUEUE_URL ??
    `https://x-access-token:${token}@github.com/${repository}.git`;
  run('git', [
    'clone',
    '--quiet',
    '--depth=1',
    '--filter=blob:none',
    '--sparse',
    '--single-branch',
    '--branch',
    'gh-pages',
    url,
    checkout,
  ]);
  git(checkout, 'sparse-checkout', 'set', QUEUE_REL);
  return checkout;
}

async function mutateQueue({repository, token, tempRoot, mutate}) {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const checkout = checkoutPages({repository, token, tempRoot});
    try {
      const mutation = mutate(checkout);
      if (!mutation.changed) return mutation.value;
      git(checkout, 'config', 'user.name', 'github-actions[bot]');
      git(
        checkout,
        'config',
        'user.email',
        'github-actions[bot]@users.noreply.github.com',
      );
      git(checkout, 'add', '-A', QUEUE_REL);
      git(
        checkout,
        'commit',
        '-qm',
        'visual baseline: update publication queue',
      );
      const pushed = spawnSync(
        'git',
        ['-C', checkout, 'push', 'origin', 'gh-pages'],
        {
          encoding: 'utf8',
        },
      );
      if (pushed.status === 0) return mutation.value;
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    await sleep(attempt * 1000);
  }
  refuse('could not update the publication queue after 10 attempts');
}

function ticketValue(repository, runId) {
  return {version: 1, repository, runId};
}

async function enqueue({repository, runId, token, tempRoot}) {
  await mutateQueue({
    repository,
    token,
    tempRoot,
    mutate(checkout) {
      const file = path.join(checkout, QUEUE_REL, `${runId}.json`);
      if (fs.existsSync(file)) {
        if (!validTicket(readJSON(file), repository, runId)) {
          refuse('existing queue ticket has invalid identity');
        }
        return {changed: false};
      }
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(
        file,
        `${JSON.stringify(ticketValue(repository, runId), null, 2)}\n`,
      );
      return {changed: true};
    },
  });
  process.stdout.write(`Queued baseline publication run ${runId}.\n`);
}

async function release({repository, runId, token, tempRoot}) {
  await mutateQueue({
    repository,
    token,
    tempRoot,
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
      if (held?.runId === runId) {
        fs.rmSync(holder);
        changed = true;
      }
      return {changed};
    },
  });
  process.stdout.write(`Released baseline publication run ${runId}.\n`);
}

async function removeInvalid({repository, names, token, tempRoot}) {
  await mutateQueue({
    repository,
    token,
    tempRoot,
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

async function claim({repository, runId, token, tempRoot}) {
  return mutateQueue({
    repository,
    token,
    tempRoot,
    mutate(checkout) {
      const state = queueState(checkout, repository);
      if (state.invalid.length > 0) return {changed: false, value: false};
      if (state.holder) {
        return {changed: false, value: state.holder.runId === runId};
      }
      const tickets = orderedTickets(state.entries, repository);
      if (tickets[0]?.runId !== runId) return {changed: false, value: false};
      const holder = path.join(checkout, QUEUE_REL, HOLDER_NAME);
      fs.writeFileSync(
        holder,
        `${JSON.stringify(ticketValue(repository, runId), null, 2)}\n`,
      );
      return {changed: true, value: true};
    },
  });
}

function runStatus(repository, runId) {
  const result = spawnSync(
    'gh',
    ['api', `repos/${repository}/actions/runs/${runId}`],
    {encoding: 'utf8'},
  );
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

async function waitForTurn({
  repository,
  runId,
  token,
  tempRoot,
  timeoutMs = 75 * 60 * 1000,
}) {
  const started = Date.now();
  const checkTimeout = blocker => {
    if (Date.now() - started >= timeoutMs) {
      refuse(
        `timed out behind baseline publication run ${blocker ?? 'unknown'}`,
      );
    }
  };
  while (true) {
    const checkout = checkoutPages({repository, token, tempRoot});
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
        names: state.invalid,
        token,
        tempRoot,
      });
      continue;
    }
    if (state.holder?.runId === runId) {
      process.stdout.write(
        `Baseline publication turn acquired by run ${runId}.\n`,
      );
      return;
    }
    if (state.holder) {
      if (isTerminalRun(runStatus(repository, state.holder.runId))) {
        checkTimeout(state.holder.runId);
        await release({
          repository,
          runId: state.holder.runId,
          token,
          tempRoot,
        });
        continue;
      }
    } else {
      const blockers = publicationBlockers(state.entries, repository, runId);
      let pruned = false;
      for (const blocker of blockers) {
        if (isTerminalRun(runStatus(repository, blocker.runId))) {
          checkTimeout(blocker.runId);
          await release({
            repository,
            runId: blocker.runId,
            token,
            tempRoot,
          });
          pruned = true;
        }
      }
      if (pruned) continue;
      if (
        blockers.length === 0 &&
        (await claim({repository, runId, token, tempRoot}))
      ) {
        process.stdout.write(
          `Baseline publication turn acquired by run ${runId}.\n`,
        );
        return;
      }
    }
    const blocker =
      state.holder?.runId ??
      orderedTickets(state.entries, repository)[0]?.runId;
    checkTimeout(blocker);
    process.stdout.write(`Waiting for baseline publication run ${blocker}.\n`);
    await sleep(30000);
  }
}

if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url))
) {
  const command = process.argv[2];
  const repository = process.env.GITHUB_REPOSITORY ?? '';
  const runId = Number(process.env.GITHUB_RUN_ID);
  const token = process.env.GH_TOKEN ?? '';
  const tempRoot = process.env.RUNNER_TEMP || os.tmpdir();
  try {
    validateIdentity(repository, runId);
    if (!token) refuse('GitHub token is missing');
    if (command === 'enqueue') {
      await enqueue({repository, runId, token, tempRoot});
    } else if (command === 'wait') {
      const configuredTimeout = process.env.ASTRYX_BASELINE_LOCK_TIMEOUT_MS;
      const timeoutMs =
        configuredTimeout === undefined ? undefined : Number(configuredTimeout);
      if (
        timeoutMs !== undefined &&
        (!Number.isFinite(timeoutMs) || timeoutMs < 0)
      ) {
        refuse('lock timeout is invalid');
      }
      await waitForTurn({repository, runId, token, tempRoot, timeoutMs});
    } else if (command === 'release') {
      await release({repository, runId, token, tempRoot});
    } else {
      refuse('usage: baseline-publication-lock.mjs <enqueue|wait|release>');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

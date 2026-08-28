#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const PAGES_BRANCH = 'gh-pages';
const QUEUE_REL = path.join('.astryx-gh-pages', 'publication-queue');
const LEGACY_BASELINE_QUEUE_REL = path.join('visual-gate', 'publication-queue');
const BASELINE_SCOPE = 'visual-gate/baseline';
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

function baselineScope(scope) {
  return scope === BASELINE_SCOPE;
}

function legacyTicketValue(repository, runId) {
  return {version: 1, repository, runId};
}

function validLegacyTicket(value, repository, runId) {
  return (
    Number.isSafeInteger(runId) &&
    runId > 0 &&
    value?.version === 1 &&
    value.repository === repository &&
    value.runId === runId
  );
}

function legacyQueueState(checkout, repository) {
  const root = path.join(checkout, LEGACY_BASELINE_QUEUE_REL);
  if (!fs.existsSync(root)) return {entries: [], invalid: [], holder: null};
  const entries = [];
  const invalid = [];
  let holder = null;
  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const value = readJSON(path.join(root, entry.name));
    if (entry.name === HOLDER_NAME) {
      if (!validLegacyTicket(value, repository, value?.runId)) {
        refuse('legacy publication holder has invalid identity');
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
    if (!validLegacyTicket(value, repository, runId)) {
      invalid.push(entry.name);
      continue;
    }
    entries.push({name, value});
  }
  return {entries, invalid, holder};
}

function orderedLegacyTickets(entries, repository) {
  const tickets = [];
  const seen = new Set();
  for (const entry of entries) {
    if (!RUN_ID.test(entry?.name ?? '')) continue;
    const runId = Number(entry.name);
    if (!validLegacyTicket(entry.value, repository, runId)) {
      refuse(`legacy queue ticket ${entry.name} has invalid identity`);
    }
    if (seen.has(runId)) refuse('legacy queue repeats a run id');
    seen.add(runId);
    tickets.push(entry.value);
  }
  return tickets.sort((a, b) => a.runId - b.runId);
}

function legacyPublicationBlockers(entries, repository, currentRunId) {
  validateIdentity(repository, currentRunId, BASELINE_SCOPE);
  const tickets = orderedLegacyTickets(entries, repository);
  if (!tickets.some(ticket => ticket.runId === currentRunId)) {
    refuse(`legacy queue ticket for run ${currentRunId} is missing`);
  }
  return tickets.filter(ticket => ticket.runId < currentRunId);
}

async function mutateLegacyBaselineQueue({
  repository,
  runId,
  token,
  tempRoot,
  remoteURL,
  mutate,
}) {
  validateIdentity(repository, runId, BASELINE_SCOPE);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [LEGACY_BASELINE_QUEUE_REL],
      prefix: 'gh-pages-legacy-queue-',
    });
    try {
      const mutation = mutate(checkout);
      if (!mutation.changed) return mutation.value;
      configureGitIdentity(checkout);
      git(checkout, 'add', '-A', LEGACY_BASELINE_QUEUE_REL);
      git(
        checkout,
        'commit',
        '-qm',
        'visual baseline: update publication queue',
      );
      const pushed = tryRun('git', [
        '-C',
        checkout,
        'push',
        'origin',
        PAGES_BRANCH,
      ]);
      if (pushed.status === 0) return mutation.value;
      if (permissionDenied(pushed)) {
        refuse(
          'push to gh-pages denied while updating the legacy publication queue',
        );
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    await sleep(attempt * 1000);
  }
  refuse('could not update the legacy publication queue after 10 attempts');
}

async function enqueueLegacyBaseline(options) {
  const {repository, runId} = options;
  await mutateLegacyBaselineQueue({
    ...options,
    mutate(checkout) {
      const file = path.join(
        checkout,
        LEGACY_BASELINE_QUEUE_REL,
        `${runId}.json`,
      );
      if (fs.existsSync(file)) {
        if (!validLegacyTicket(readJSON(file), repository, runId)) {
          refuse('existing legacy queue ticket has invalid identity');
        }
        return {changed: false};
      }
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(
        file,
        `${JSON.stringify(legacyTicketValue(repository, runId), null, 2)}\n`,
      );
      return {changed: true};
    },
  });
}

async function releaseLegacyBaseline(options) {
  const {runId} = options;
  await mutateLegacyBaselineQueue({
    ...options,
    mutate(checkout) {
      const root = path.join(checkout, LEGACY_BASELINE_QUEUE_REL);
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
}

async function removeInvalidLegacyBaseline({
  repository,
  runId,
  names,
  token,
  tempRoot,
  remoteURL,
}) {
  await mutateLegacyBaselineQueue({
    repository,
    runId,
    token,
    tempRoot,
    remoteURL,
    mutate(checkout) {
      let changed = false;
      for (const name of names) {
        const file = path.join(checkout, LEGACY_BASELINE_QUEUE_REL, name);
        if (fs.existsSync(file)) {
          fs.rmSync(file);
          changed = true;
        }
      }
      return {changed};
    },
  });
}

async function claimLegacyBaseline(options) {
  const {repository, runId} = options;
  return mutateLegacyBaselineQueue({
    ...options,
    mutate(checkout) {
      const state = legacyQueueState(checkout, repository);
      if (state.invalid.length > 0) return {changed: false, value: false};
      if (state.holder)
        return {changed: false, value: state.holder.runId === runId};
      const tickets = orderedLegacyTickets(state.entries, repository);
      if (tickets[0]?.runId !== runId) return {changed: false, value: false};
      fs.writeFileSync(
        path.join(checkout, LEGACY_BASELINE_QUEUE_REL, HOLDER_NAME),
        `${JSON.stringify(legacyTicketValue(repository, runId), null, 2)}\n`,
      );
      return {changed: true, value: true};
    },
  });
}

async function waitForLegacyBaselineTurn({
  repository,
  runId,
  token,
  tempRoot,
  remoteURL,
  timeoutMs = DEFAULT_WAIT_MS,
  beforeClaimPush,
}) {
  validateIdentity(repository, runId, BASELINE_SCOPE);
  const started = Date.now();
  const checkTimeout = blocker => {
    if (Date.now() - started >= timeoutMs) {
      refuse(
        `timed out behind legacy baseline publication run ${blocker ?? 'unknown'}`,
      );
    }
  };
  while (true) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [LEGACY_BASELINE_QUEUE_REL],
      prefix: 'gh-pages-legacy-queue-',
    });
    let state;
    try {
      state = legacyQueueState(checkout, repository);
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    if (state.invalid.length > 0) {
      checkTimeout(state.holder?.runId);
      await removeInvalidLegacyBaseline({
        repository,
        runId,
        names: state.invalid,
        token,
        tempRoot,
        remoteURL,
      });
      continue;
    }
    if (state.holder?.runId === runId) return;
    if (state.holder) {
      if (isTerminalRun(runStatus(repository, state.holder.runId))) {
        checkTimeout(state.holder.runId);
        await releaseLegacyBaseline({
          repository,
          runId: state.holder.runId,
          token,
          tempRoot,
          remoteURL,
        });
        continue;
      }
    } else {
      const blockers = legacyPublicationBlockers(
        state.entries,
        repository,
        runId,
      );
      let pruned = false;
      for (const blocker of blockers) {
        if (isTerminalRun(runStatus(repository, blocker.runId))) {
          checkTimeout(blocker.runId);
          await releaseLegacyBaseline({
            repository,
            runId: blocker.runId,
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
        (await claimLegacyBaseline({
          repository,
          runId,
          token,
          tempRoot,
          remoteURL,
        }))
      ) {
        return;
      }
    }
    const blocker =
      state.holder?.runId ??
      orderedLegacyTickets(state.entries, repository)[0]?.runId;
    checkTimeout(blocker);
    process.stdout.write(
      `Waiting for legacy baseline publication run ${blocker}.\n`,
    );
    await sleep(30000);
  }
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

async function mutateDualQueue({
  repository,
  runId,
  scope,
  token,
  tempRoot,
  remoteURL,
  message = 'ci: update gh-pages publication queues',
  mutate,
  beforePush,
}) {
  validateIdentity(repository, runId, scope);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [QUEUE_REL, LEGACY_BASELINE_QUEUE_REL],
      prefix: 'gh-pages-dual-queue-',
    });
    try {
      const mutation = mutate(checkout);
      if (!mutation.changed) return mutation.value;
      configureGitIdentity(checkout);
      git(checkout, 'add', '-A', QUEUE_REL, LEGACY_BASELINE_QUEUE_REL);
      git(checkout, 'commit', '-qm', message);
      await beforePush?.({attempt, checkout});
      const pushed = tryRun('git', [
        '-C',
        checkout,
        'push',
        'origin',
        PAGES_BRANCH,
      ]);
      if (pushed.status === 0) return mutation.value;
      if (permissionDenied(pushed)) {
        refuse('push to gh-pages denied while updating publication queues');
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    await sleep(attempt * 1000);
  }
  refuse('could not update the publication queues after 10 attempts');
}

function ensureSharedTicket(checkout, repository, runId, scope) {
  const file = path.join(checkout, QUEUE_REL, `${runId}.json`);
  if (fs.existsSync(file)) {
    if (!validTicket(readJSON(file), repository, runId, scope)) {
      refuse('existing queue ticket has invalid identity');
    }
    return false;
  }
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(
    file,
    `${JSON.stringify(ticketValue(repository, runId, scope), null, 2)}\n`,
  );
  return true;
}

function ensureLegacyTicket(checkout, repository, runId) {
  const file = path.join(checkout, LEGACY_BASELINE_QUEUE_REL, `${runId}.json`);
  if (fs.existsSync(file)) {
    if (!validLegacyTicket(readJSON(file), repository, runId)) {
      refuse('existing legacy queue ticket has invalid identity');
    }
    return false;
  }
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(
    file,
    `${JSON.stringify(legacyTicketValue(repository, runId), null, 2)}\n`,
  );
  return true;
}

function dualQueueState(checkout, repository) {
  return {
    shared: queueState(checkout, repository),
    legacy: legacyQueueState(checkout, repository),
  };
}

function currentSharedTicket(entries, repository, runId, scope) {
  return orderedTickets(entries, repository).some(
    ticket => ticket.runId === runId && ticket.scope === scope,
  );
}

function currentLegacyTicket(entries, repository, runId) {
  return orderedLegacyTickets(entries, repository).some(
    ticket => ticket.runId === runId,
  );
}

export async function enqueuePublication(options) {
  const {repository, runId, scope} = options;
  await mutateDualQueue({
    ...options,
    message: 'ci: update gh-pages publication queues',
    mutate(checkout) {
      const sharedChanged = ensureSharedTicket(
        checkout,
        repository,
        runId,
        scope,
      );
      const legacyChanged = ensureLegacyTicket(checkout, repository, runId);
      return {changed: sharedChanged || legacyChanged};
    },
  });
  process.stdout.write(
    `Queued gh-pages publication run ${runId} (${scope}).\n`,
  );
}

export async function releasePublication(options) {
  const {runId, scope} = options;
  await mutateDualQueue({
    ...options,
    message: 'ci: release gh-pages publication turn',
    mutate(checkout) {
      const sharedRoot = path.join(checkout, QUEUE_REL);
      const sharedTicket = path.join(sharedRoot, `${runId}.json`);
      const sharedHolder = path.join(sharedRoot, HOLDER_NAME);
      const legacyRoot = path.join(checkout, LEGACY_BASELINE_QUEUE_REL);
      const legacyTicket = path.join(legacyRoot, `${runId}.json`);
      const legacyHolder = path.join(legacyRoot, HOLDER_NAME);
      let changed = false;
      if (fs.existsSync(legacyTicket)) {
        fs.rmSync(legacyTicket);
        changed = true;
      }
      const legacyHeld = readJSON(legacyHolder);
      if (legacyHeld?.runId === runId) {
        fs.rmSync(legacyHolder);
        changed = true;
      }
      if (fs.existsSync(sharedTicket)) {
        fs.rmSync(sharedTicket);
        changed = true;
      }
      const sharedHeld = readJSON(sharedHolder);
      if (sharedHeld?.runId === runId && sharedHeld?.scope === scope) {
        fs.rmSync(sharedHolder);
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
  beforeClaimPush,
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
      sparsePaths: [QUEUE_REL, LEGACY_BASELINE_QUEUE_REL],
      prefix: 'gh-pages-dual-queue-',
    });
    let state;
    try {
      state = dualQueueState(checkout, repository);
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }

    if (state.shared.invalid.length > 0) {
      checkTimeout(state.shared.holder?.runId);
      await removeInvalid({
        repository,
        runId,
        scope,
        names: state.shared.invalid,
        token,
        tempRoot,
        remoteURL,
      });
      continue;
    }
    if (state.legacy.invalid.length > 0) {
      checkTimeout(state.legacy.holder?.runId);
      await removeInvalidLegacyBaseline({
        repository,
        runId,
        names: state.legacy.invalid,
        token,
        tempRoot,
        remoteURL,
      });
      continue;
    }

    const sharedHeldByCurrent =
      state.shared.holder?.runId === runId &&
      state.shared.holder?.scope === scope;
    const legacyHeldByCurrent = state.legacy.holder?.runId === runId;
    if (sharedHeldByCurrent && legacyHeldByCurrent) {
      process.stdout.write(
        `gh-pages publication turn acquired by run ${runId}.\n`,
      );
      return;
    }

    if (state.shared.holder && !sharedHeldByCurrent) {
      if (isTerminalRun(runStatus(repository, state.shared.holder.runId))) {
        checkTimeout(state.shared.holder.runId);
        await releasePublication({
          repository,
          runId: state.shared.holder.runId,
          scope: state.shared.holder.scope,
          token,
          tempRoot,
          remoteURL,
        });
        continue;
      }
      const blocker = state.shared.holder.runId;
      checkTimeout(blocker);
      process.stdout.write(
        `Waiting for gh-pages publication run ${blocker}.\n`,
      );
      await sleep(30000);
      continue;
    }

    if (state.legacy.holder && !legacyHeldByCurrent) {
      if (isTerminalRun(runStatus(repository, state.legacy.holder.runId))) {
        checkTimeout(state.legacy.holder.runId);
        await releaseLegacyBaseline({
          repository,
          runId: state.legacy.holder.runId,
          token,
          tempRoot,
          remoteURL,
        });
        continue;
      }
      const blocker = state.legacy.holder.runId;
      checkTimeout(blocker);
      process.stdout.write(
        `Waiting for legacy baseline publication run ${blocker}.\n`,
      );
      await sleep(30000);
      continue;
    }

    const sharedHasTicket = currentSharedTicket(
      state.shared.entries,
      repository,
      runId,
      scope,
    );
    const legacyHasTicket = currentLegacyTicket(
      state.legacy.entries,
      repository,
      runId,
    );
    if (!sharedHasTicket || !legacyHasTicket) {
      refuse(`queue ticket for run ${runId} is missing`);
    }

    const sharedBlockers = publicationBlockers(
      state.shared.entries,
      repository,
      runId,
      scope,
    );
    const legacyBlockers = legacyPublicationBlockers(
      state.legacy.entries,
      repository,
      runId,
    );
    let pruned = false;
    for (const blocker of sharedBlockers) {
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
    for (const blocker of legacyBlockers) {
      if (isTerminalRun(runStatus(repository, blocker.runId))) {
        checkTimeout(blocker.runId);
        await releaseLegacyBaseline({
          repository,
          runId: blocker.runId,
          token,
          tempRoot,
          remoteURL,
        });
        pruned = true;
      }
    }
    if (pruned) continue;

    if (sharedBlockers.length === 0 && legacyBlockers.length === 0) {
      const claimed = await mutateDualQueue({
        repository,
        runId,
        scope,
        token,
        tempRoot,
        remoteURL,
        message: 'ci: claim gh-pages publication turn',
        beforePush: beforeClaimPush,
        mutate(claimCheckout) {
          const claimState = dualQueueState(claimCheckout, repository);
          const sharedClear =
            !claimState.shared.holder &&
            publicationBlockers(
              claimState.shared.entries,
              repository,
              runId,
              scope,
            ).length === 0;
          const legacyClear =
            !claimState.legacy.holder &&
            legacyPublicationBlockers(
              claimState.legacy.entries,
              repository,
              runId,
            ).length === 0;
          if (!sharedClear || !legacyClear)
            return {changed: false, value: false};
          fs.writeFileSync(
            path.join(claimCheckout, QUEUE_REL, HOLDER_NAME),
            `${JSON.stringify(ticketValue(repository, runId, scope), null, 2)}\n`,
          );
          fs.writeFileSync(
            path.join(claimCheckout, LEGACY_BASELINE_QUEUE_REL, HOLDER_NAME),
            `${JSON.stringify(legacyTicketValue(repository, runId), null, 2)}\n`,
          );
          return {changed: true, value: true};
        },
      });
      if (claimed) {
        process.stdout.write(
          `gh-pages publication turn acquired by run ${runId}.\n`,
        );
        return;
      }
      continue;
    }

    const blocker =
      sharedBlockers[0]?.runId ?? legacyBlockers[0]?.runId ?? 'unknown';
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

function output(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function safeRelativePath(value, name) {
  const normalized = path.posix.normalize(
    String(value ?? '').replace(/\\/g, '/'),
  );
  if (
    !normalized ||
    normalized === '.' ||
    normalized.startsWith('../') ||
    normalized.includes('/../') ||
    path.isAbsolute(normalized)
  ) {
    refuse(`${name} is invalid`);
  }
  return normalized;
}

function fileList(root) {
  const files = [];
  function visit(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const rel = path.posix.join(prefix, entry.name);
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(file, rel);
      } else if (entry.isFile()) {
        files.push(rel);
      }
    }
  }
  visit(root);
  return files.sort();
}

function sameDirectoryContents(first, second) {
  if (!fs.existsSync(first) || !fs.existsSync(second)) return false;
  const firstFiles = fileList(first);
  const secondFiles = fileList(second);
  if (firstFiles.length !== secondFiles.length) return false;
  for (let index = 0; index < firstFiles.length; index += 1) {
    if (firstFiles[index] !== secondFiles[index]) return false;
    if (
      !fs
        .readFileSync(path.join(first, firstFiles[index]))
        .equals(fs.readFileSync(path.join(second, secondFiles[index])))
    ) {
      return false;
    }
  }
  return true;
}

function scriptPath(...parts) {
  return path.join(process.cwd(), '.github', 'scripts', ...parts);
}

function runNodeScript(parts, args) {
  const out = run(process.execPath, [scriptPath(...parts), ...args]);
  if (out) process.stdout.write(`${out}\n`);
  return out;
}

function assertHoldingPublicationTurn({
  repository,
  runId,
  scope,
  token,
  tempRoot,
  remoteURL,
}) {
  validateIdentity(repository, runId, scope);
  const checkout = checkoutPages({
    repository,
    token,
    tempRoot,
    remoteURL,
    sparsePaths: [QUEUE_REL],
    prefix: 'gh-pages-queue-check-',
  });
  try {
    const holder = queueState(checkout, repository).holder;
    if (holder?.runId !== runId || holder?.scope !== scope) {
      refuse(`publication turn for ${scope} is not held by run ${runId}`);
    }
  } finally {
    fs.rmSync(checkout, {recursive: true, force: true});
  }
}

export async function publishImmutablePath({
  repository,
  token,
  tempRoot,
  remoteURL,
  source,
  destination,
  message,
  maxAttempts = 5,
  beforePush,
}) {
  const sourceDir = path.resolve(source);
  const destinationRel = safeRelativePath(destination, '--destination');
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    refuse('--source must be a directory');
  }
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [destinationRel],
      prefix: 'gh-pages-immutable-',
    });
    try {
      const destinationDir = path.join(checkout, destinationRel);
      if (fs.existsSync(destinationDir)) {
        if (sameDirectoryContents(sourceDir, destinationDir)) {
          process.stdout.write('Immutable path already published.\n');
          output('published', 'true');
          return {published: true, alreadyPublished: true};
        }
        refuse('immutable destination already exists with different bytes');
      }
      copyContents(sourceDir, destinationDir);
      const commit = commitIfNeeded(
        checkout,
        message ?? `publish ${destinationRel}`,
        [destinationRel],
      );
      if (commit === null) {
        output('published', 'true');
        return {published: true};
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
        output('published', 'true');
        return {published: true, commit};
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    process.stdout.write(
      `Push rejected; retrying immutable publish (${attempt}/${maxAttempts}).\n`,
    );
    await sleep(attempt * 2000);
  }
  refuse(`could not publish ${destinationRel} after ${maxAttempts} attempts`);
}

export async function publishVisualAcceptanceRecord({
  repository,
  token,
  tempRoot,
  remoteURL,
  pr,
  head,
  acceptedRunId,
  acceptedRunAttempt,
  approver,
  approverId,
  permission,
  effectivePermission,
  roleName,
  commentId,
  reason,
  maxAttempts = 5,
  beforePush,
}) {
  const destinationRel = safeRelativePath(
    `visual-gate/acceptances/${pr}/${head}`,
    'acceptance destination',
  );
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [
        'visual-gate/baseline',
        `pr/${pr}/visual/${head}/${acceptedRunId}/${acceptedRunAttempt}`,
        destinationRel,
      ],
      prefix: 'gh-pages-acceptance-',
    });
    try {
      runNodeScript(
        ['visual-gate', 'visual-acceptance.mjs'],
        [
          'accept',
          '--pages',
          checkout,
          '--pr',
          String(pr),
          '--head',
          String(head),
          '--run-id',
          String(acceptedRunId),
          '--run-attempt',
          String(acceptedRunAttempt),
          '--approver',
          String(approver),
          '--approver-id',
          String(approverId),
          '--permission',
          String(permission),
          '--effective-permission',
          String(effectivePermission),
          '--role-name',
          String(roleName ?? ''),
          '--comment-id',
          String(commentId),
          '--reason',
          String(reason),
        ],
      );
      const commit = commitIfNeeded(
        checkout,
        `visual acceptance: PR #${pr} at ${head}`,
        [destinationRel],
      );
      if (commit === null) {
        process.stdout.write(
          'The current visual bundle was already accepted.\n',
        );
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
      if (pushOrRetry(pushed)) return {published: true, commit};
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    process.stdout.write(
      `Push rejected; retrying acceptance publish (${attempt}/${maxAttempts}).\n`,
    );
    await sleep(attempt * 2000);
  }
  refuse(`could not archive visual acceptance after ${maxAttempts} attempts`);
}

export async function publishAcceptedVisualBaseline({
  repository,
  runId,
  token,
  tempRoot,
  remoteURL,
  pr,
  head,
  mergeSha,
  expectedRecordRel,
  capture,
  maxAttempts = 5,
  beforePush,
}) {
  const scope = 'visual-gate/baseline';
  assertHoldingPublicationTurn({
    repository,
    runId,
    scope,
    token,
    tempRoot,
    remoteURL,
  });
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: [
        'visual-gate/baseline',
        `visual-gate/acceptances/${pr}/${head}`,
      ],
      prefix: 'gh-pages-baseline-',
    });
    try {
      const resolved = JSON.parse(
        runNodeScript(
          ['visual-gate', 'lib', 'promotion-identity.mjs'],
          [
            'resolve-acceptance',
            '--pages',
            checkout,
            '--pr',
            String(pr),
            '--head',
            String(head),
            '--missing-ok',
            'false',
            '--expected-record-rel',
            String(expectedRecordRel),
          ],
        ),
      );
      if (resolved.ok !== true) {
        output('failure_description', resolved.description);
        refuse(
          resolved.message ??
            resolved.description ??
            'acceptance validation failed',
        );
      }
      if (resolved.deferred === true) {
        output('deferred', 'true');
        output('deferred_description', resolved.deferredDescription);
        return {deferred: true};
      }
      runNodeScript(
        ['visual-gate', 'visual-acceptance.mjs'],
        [
          'promote',
          '--pages',
          checkout,
          '--acceptance',
          resolved.recordPath,
          '--capture',
          path.resolve(capture),
          '--merge-sha',
          String(mergeSha),
        ],
      );
      const commit = commitIfNeeded(
        checkout,
        `visual baseline: accepted PR #${pr}`,
        ['-A', 'visual-gate/baseline'],
      );
      if (commit === null) {
        process.stdout.write(
          'Baseline already contains the accepted pixels.\n',
        );
        output('publication_confirmed', 'true');
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
        output('publication_confirmed', 'true');
        return {published: true, commit};
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    process.stdout.write(
      `Push rejected; retrying accepted baseline publish (${attempt}/${maxAttempts}).\n`,
    );
    await sleep(attempt * 2000);
  }
  output(
    'failure_description',
    'Merged pixels did not promote to the visual baseline.',
  );
  refuse(
    `could not promote the accepted baseline after ${maxAttempts} attempts`,
  );
}

export async function publishManualVisualBaseline({
  repository,
  runId,
  token,
  tempRoot,
  remoteURL,
  capture,
  keys,
  reason,
  actor,
  prune = false,
  maxAttempts = 5,
  beforePush,
}) {
  const scope = 'visual-gate/baseline';
  assertHoldingPublicationTurn({
    repository,
    runId,
    scope,
    token,
    tempRoot,
    remoteURL,
  });
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const checkout = checkoutPages({
      repository,
      token,
      tempRoot,
      remoteURL,
      sparsePaths: ['visual-gate/baseline'],
      prefix: 'gh-pages-manual-baseline-',
    });
    try {
      const args = [
        'accept',
        '--baseline',
        path.join(checkout, 'visual-gate', 'baseline'),
        '--out',
        path.resolve(capture),
        '--keys',
        String(keys),
        '--reason',
        String(reason),
        '--actor',
        String(actor),
      ];
      if (prune) args.push('--prune');
      runNodeScript(['visual-gate', 'gate.mjs'], args);
      const commit = commitIfNeeded(
        checkout,
        `visual baseline: ${keys} (run ${runId})`,
        ['-A', 'visual-gate/baseline'],
      );
      if (commit === null) {
        process.stdout.write('Baseline unchanged.\n');
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
        process.stdout.write('Baseline updated.\n');
        return {published: true, commit};
      }
    } finally {
      fs.rmSync(checkout, {recursive: true, force: true});
    }
    process.stdout.write(
      `Push rejected; retrying manual baseline publish (${attempt}/${maxAttempts}).\n`,
    );
    await sleep(attempt * 2000);
  }
  refuse(`could not push the updated baseline after ${maxAttempts} attempts`);
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
  if (command === 'enqueue' || command === 'wait' || command === 'release') {
    const scope = flag(argv, '--scope');
    if (!scope) refuse('--scope is required');
    if (command === 'enqueue') {
      await enqueuePublication({...context, scope});
    } else if (command === 'wait') {
      await waitForPublicationTurn({...context, scope});
    } else {
      await releasePublication({...context, scope});
    }
  } else if (command === 'stable-site') {
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
  } else if (command === 'immutable-path') {
    const source = flag(argv, '--source');
    const destination = flag(argv, '--destination');
    const scope = flag(argv, '--scope');
    if (!source) refuse('--source is required');
    if (!destination) refuse('--destination is required');
    if (!scope) refuse('--scope is required');
    await withPublicationTurn({
      ...context,
      scope,
      publish: () =>
        publishImmutablePath({
          ...context,
          source,
          destination,
          message: flag(argv, '--message'),
        }),
    });
  } else if (command === 'visual-acceptance-record') {
    await withPublicationTurn({
      ...context,
      scope: 'visual-gate/acceptances',
      publish: () =>
        publishVisualAcceptanceRecord({
          ...context,
          pr: flag(argv, '--pr'),
          head: flag(argv, '--head'),
          acceptedRunId: flag(argv, '--accepted-run-id'),
          acceptedRunAttempt: flag(argv, '--accepted-run-attempt'),
          approver: flag(argv, '--approver'),
          approverId: flag(argv, '--approver-id'),
          permission: flag(argv, '--permission'),
          effectivePermission: flag(argv, '--effective-permission'),
          roleName: flag(argv, '--role-name', ''),
          commentId: flag(argv, '--comment-id'),
          reason: flag(argv, '--reason'),
        }),
    });
  } else if (command === 'visual-baseline-accepted') {
    await publishAcceptedVisualBaseline({
      ...context,
      pr: flag(argv, '--pr'),
      head: flag(argv, '--head'),
      mergeSha: flag(argv, '--merge-sha'),
      expectedRecordRel: flag(argv, '--expected-record-rel'),
      capture: flag(argv, '--capture'),
    });
  } else if (command === 'visual-baseline-manual') {
    await publishManualVisualBaseline({
      ...context,
      capture: flag(argv, '--capture'),
      keys: flag(argv, '--keys'),
      reason: flag(argv, '--reason'),
      actor: flag(argv, '--actor'),
      prune: flag(argv, '--prune', 'false') === 'true',
    });
  } else {
    refuse(
      'usage: gh-pages-publisher.mjs <enqueue|wait|release|stable-site|release-gate|immutable-path|visual-acceptance-record|visual-baseline-accepted|visual-baseline-manual>',
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

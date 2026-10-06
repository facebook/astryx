// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global clearTimeout, process, setTimeout */

import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderCommand, wrapCommand} from './profile.mjs';

const DEFAULT_CAPTURE_LIMIT = 20 * 1024 * 1024;
const PRIVATE_PROFILE_ENV_PREFIX = 'VIBE_RUNNER_PROFILE';

export function sanitizeChildEnv(env = process.env) {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([name]) => !name.startsWith(PRIVATE_PROFILE_ENV_PREFIX),
    ),
  );
}

export async function runCommand(command, args, options = {}) {
  const {
    cwd,
    env,
    input,
    timeoutMs = 15 * 60 * 1000,
    transcriptPath,
    captureLimit = DEFAULT_CAPTURE_LIMIT,
    onStdout,
  } = options;
  if (transcriptPath) {
    await fs.promises.mkdir(path.dirname(transcriptPath), {recursive: true});
  }

  return await new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const child = spawn(command, args, {
      cwd,
      env: sanitizeChildEnv({...process.env, ...env}),
      detached: process.platform !== 'win32',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const append = (current, chunk) =>
      current.length >= captureLimit
        ? current
        : (current + chunk.toString()).slice(0, captureLimit);
    child.stdout.on('data', chunk => {
      stdout = append(stdout, chunk);
      onStdout?.(chunk.toString());
    });
    child.stderr.on('data', chunk => {
      stderr = append(stderr, chunk);
    });
    child.on('error', reject);

    const timer = setTimeout(() => {
      timedOut = true;
      terminate(child);
    }, timeoutMs);

    child.on('close', async (code, signal) => {
      clearTimeout(timer);
      if (transcriptPath) {
        await fs.promises.writeFile(transcriptPath, stdout);
        await fs.promises.writeFile(`${transcriptPath}.stderr.log`, stderr);
      }
      resolve({
        command,
        args,
        code,
        signal,
        stdout,
        stderr,
        timedOut,
        durationMs: Date.now() - startedAt,
      });
    });
    child.stdin.end(input ?? undefined);
  });
}

export async function createPrivateRunRoot(prefix = 'run-') {
  const base = path.join(os.homedir(), '.astryx-vibe-private');
  await fs.promises.mkdir(base, {recursive: true, mode: 0o700});
  await fs.promises.chmod(base, 0o700);
  const root = await fs.promises.mkdtemp(path.join(base, prefix));
  await fs.promises.chmod(root, 0o700);
  for (const directory of ['project', 'home', 'tmp']) {
    await fs.promises.mkdir(path.join(root, directory), {
      recursive: true,
      mode: 0o700,
    });
  }
  return {
    root,
    projectDir: path.join(root, 'project'),
    transcriptPath: path.join(root, 'transcript.jsonl'),
  };
}

export async function runProfileCommand(
  profile,
  entry,
  privateRun,
  values = {},
  options = {},
) {
  const placeholders = {
    privateRoot: privateRun.root,
    projectDir: privateRun.projectDir,
    sandboxRoot: profile.sandbox.root,
    sandboxProject: profile.sandbox.projectDir,
    taskFile: `${profile.sandbox.projectDir}/TASK.md`,
    prompt: values.prompt ?? '',
    schema: values.schema ?? '',
    ...values,
  };
  const rendered = renderCommand(entry, placeholders);
  const wrapped = wrapCommand(profile.launcher, rendered, placeholders);
  return await runCommand(wrapped.command, wrapped.args, {
    cwd: wrapped.cwd ?? privateRun.root,
    env: wrapped.env,
    input: wrapped.input,
    ...options,
  });
}

export async function runProfilePreflight(profile) {
  const privateRun = await createPrivateRunRoot('preflight-');
  try {
    await fs.promises.writeFile(
      path.join(privateRun.projectDir, 'input.txt'),
      'private\n',
    );
    const result = await runProfileCommand(
      profile,
      profile.preflight,
      privateRun,
      {},
      {timeoutMs: 60_000},
    );
    const mode = (await fs.promises.stat(privateRun.root)).mode & 0o777;
    if (result.code !== 0 || result.timedOut || mode !== 0o700) {
      throw new Error(
        `Sandbox preflight failed: ${result.stderr || result.stdout || `exit ${result.code}`}`,
      );
    }
    return {
      passed: true,
      privateRootMode: mode.toString(8).padStart(4, '0'),
      output: result.stdout.trim(),
      parallelIsolation: await probeParallelIsolation(profile),
    };
  } finally {
    await fs.promises.rm(privateRun.root, {recursive: true, force: true});
  }
}

async function probeParallelIsolation(profile) {
  if (!profile.isolationProbe) {
    return {
      passed: false,
      available: false,
      reason: 'the runner profile does not define an isolationProbe command',
    };
  }

  const victim = await createPrivateRunRoot('probe-victim-');
  const attacker = await createPrivateRunRoot('probe-attacker-');
  const token = `vibe-probe-${randomUUID().slice(0, 8)}`;
  const probeDirectory = path.dirname(fileURLToPath(import.meta.url));
  const probeSources = ['isolation-probe.mjs', 'isolation-probe-core.mjs'];
  let victimSettled = false;

  try {
    for (const privateRun of [victim, attacker]) {
      await Promise.all(
        probeSources.map(fileName =>
          fs.promises.copyFile(
            path.join(probeDirectory, fileName),
            path.join(privateRun.projectDir, fileName),
          ),
        ),
      );
    }
    await writeProbeInput(victim, {mode: 'victim', token});

    let victimOutput = '';
    let resolveReady;
    const readyPromise = new Promise(resolve => {
      resolveReady = resolve;
    });
    const victimPromise = runProfileCommand(
      profile,
      profile.isolationProbe,
      victim,
      {probeFile: `${profile.sandbox.projectDir}/isolation-probe.mjs`},
      {
        timeoutMs: 15_000,
        onStdout: chunk => {
          victimOutput += chunk;
          const ready = findProbeRecord(victimOutput, 'isolation-probe-ready');
          if (ready) {
            resolveReady(ready);
          }
        },
      },
    ).finally(() => {
      victimSettled = true;
    });
    const ready = await Promise.race([
      readyPromise,
      victimPromise.then(result => {
        throw new Error(
          `Isolation probe victim exited before ready: ${result.stderr || result.stdout || `exit ${result.code}`}`,
        );
      }),
      rejectAfter(5_000, 'Isolation probe victim did not become ready.'),
    ]);

    await writeProbeInput(attacker, {
      mode: 'attacker',
      token,
      target: ready,
    });
    const attackResult = await runProfileCommand(
      profile,
      profile.isolationProbe,
      attacker,
      {probeFile: `${profile.sandbox.projectDir}/isolation-probe.mjs`},
      {timeoutMs: 10_000},
    );
    const attack = findProbeRecord(
      attackResult.stdout,
      'isolation-probe-attack',
    );
    if (attackResult.code !== 0 || !attack) {
      throw new Error(
        `Isolation probe attacker failed: ${attackResult.stderr || attackResult.stdout || `exit ${attackResult.code}`}`,
      );
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const processKillContained = attack.pkillAvailable && !victimSettled;
    await fs.promises.writeFile(
      path.join(victim.projectDir, '.isolation-probe-stop'),
      'stop\n',
    );
    await victimPromise;

    const pidNamespacePrivate = ready.pidNamespace !== attack.pidNamespace;
    const networkNamespacePrivate =
      ready.networkNamespace !== attack.networkNamespace;
    const siblingProcUnreadable =
      !attack.siblingCmdlineVisible && !attack.siblingRootReadable;
    const portCollisionContained = attack.samePortAvailable;
    const passed =
      pidNamespacePrivate &&
      networkNamespacePrivate &&
      siblingProcUnreadable &&
      processKillContained &&
      portCollisionContained;
    const missing = [
      [pidNamespacePrivate, 'private PID namespaces'],
      [networkNamespacePrivate, 'private network namespaces'],
      [siblingProcUnreadable, 'unreadable sibling /proc roots'],
      [processKillContained, 'contained process-group kills'],
      [portCollisionContained, 'independent loopback ports'],
    ]
      .filter(([ok]) => !ok)
      .map(([, label]) => label);
    return {
      passed,
      available: true,
      pidNamespacePrivate,
      networkNamespacePrivate,
      siblingProcUnreadable,
      siblingCmdlineVisible: attack.siblingCmdlineVisible,
      siblingRootReadable: attack.siblingRootReadable,
      visibleProcessCount: attack.visibleProcessCount,
      processKillContained,
      portCollisionContained,
      reason: passed ? null : `missing ${missing.join(', ')}`,
    };
  } catch (error) {
    return {
      passed: false,
      available: true,
      reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await Promise.all(
      [victim.root, attacker.root].map(root =>
        fs.promises.rm(root, {recursive: true, force: true}),
      ),
    );
  }
}

async function writeProbeInput(privateRun, value) {
  await fs.promises.writeFile(
    path.join(privateRun.projectDir, '.isolation-probe-input.json'),
    `${JSON.stringify(value)}\n`,
  );
}

function findProbeRecord(output, type) {
  for (const line of output.split('\n')) {
    try {
      const value = JSON.parse(line);
      if (value.type === type) {
        return value;
      }
    } catch {
      // Probe launchers may emit diagnostics around the JSON receipt.
    }
  }
  return null;
}

function rejectAfter(milliseconds, message) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), milliseconds),
  );
}

function terminate(child) {
  try {
    if (process.platform !== 'win32' && child.pid) {
      process.kill(-child.pid, 'SIGTERM');
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // Best-effort process-group termination.
  }
  setTimeout(() => {
    try {
      if (process.platform !== 'win32' && child.pid) {
        process.kill(-child.pid, 'SIGKILL');
      } else {
        child.kill('SIGKILL');
      }
    } catch {
      // The process may already have exited.
    }
  }, 3000).unref();
}

export function parseTranscript(text, adapter) {
  if (adapter?.format !== 'jsonl') {
    throw new Error('Transcript adapter format must be jsonl.');
  }
  const records = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) {
      continue;
    }
    try {
      const record = JSON.parse(line);
      if (record && typeof record === 'object' && !Array.isArray(record)) {
        records.push(record);
      }
    } catch {
      // Non-JSON diagnostics are allowed beside JSONL records.
    }
  }
  return records;
}

export function parseUsage(text, adapter) {
  if (!adapter?.usage) {
    return {inputTokens: null, outputTokens: null};
  }
  const values = parseTranscript(text, adapter)
    .filter(record => matchesRecord(record, adapter.usage.matches))
    .map(record => ({
      inputTokens: readNumber(record, adapter.usage.inputTokensPath),
      outputTokens: readNumber(record, adapter.usage.outputTokensPath),
    }))
    .filter(value => value.inputTokens != null || value.outputTokens != null)
    .map(value => ({
      inputTokens: value.inputTokens ?? 0,
      outputTokens: value.outputTokens ?? 0,
    }));
  if (values.length === 0) {
    return {inputTokens: null, outputTokens: null};
  }
  return values.reduce((best, current) =>
    current.inputTokens + current.outputTokens >
    best.inputTokens + best.outputTokens
      ? current
      : best,
  );
}

export function countToolCalls(text, adapter) {
  const records = parseTranscript(text, adapter);
  return records.reduce(
    (total, record) =>
      total +
      (adapter.toolCalls ?? []).reduce(
        (ruleTotal, rule) =>
          ruleTotal +
          expandRuleRecords(record, rule).filter(candidate =>
            matchesRecord(candidate, rule.matches),
          ).length,
        0,
      ),
    0,
  );
}

export function countCliLookups(text, adapter) {
  return extractToolCommands(text, adapter).reduce(
    (total, command) => total + countAstryxInvocations(command),
    0,
  );
}

export function countAstryxInvocations(command) {
  const pattern =
    /(?:\bnpx\s+(?:--yes\s+)?(?:astryx|@astryxdesign\/cli(?:@[^\s;&|()]+)?)(?=\s|$)|\b(?:npm|pnpm)\s+exec\s+(?:--\s+)?astryx(?=\s|$)|(?:^|[\s(;$])(?:[^\s;&|()]*\/)?node_modules\/\.bin\/astryx(?=\s|$)|\bnode\s+[^\s;&|()]*astryx\.mjs(?=\s|$)|(?:^|[\s(;$])astryx(?=\s|$))/gi;
  return (command.match(pattern) ?? []).length;
}

export function auditTranscript(stdout, stderr, audit = {}, adapter) {
  const commands = extractToolCommands(stdout, adapter);
  const findings = [];
  for (const rule of audit.rules ?? []) {
    const pattern = new RegExp(rule.pattern, rule.flags ?? '');
    const candidates =
      rule.source === 'stdout'
        ? [stdout]
        : rule.source === 'stderr'
          ? [stderr]
          : rule.source === 'combined'
            ? [`${stdout}\n${stderr}`]
            : commands;
    const matched = candidates.some(value => {
      pattern.lastIndex = 0;
      return pattern.test(value);
    });
    const violated = rule.kind === 'required' ? !matched : matched;
    if (violated) {
      findings.push({
        label: rule.label,
        class: rule.class,
        source: rule.source,
        kind: rule.kind,
      });
    }
  }
  const strictFindings = findings.filter(finding => finding.class === 'strict');
  const adjustedFindings = findings.filter(
    finding => finding.class === 'adjusted',
  );
  return {
    passed: strictFindings.length === 0,
    classification:
      strictFindings.length > 0
        ? 'strict-failure'
        : adjustedFindings.length > 0
          ? 'adjusted'
          : 'strict-clean',
    strictFindings,
    adjustedFindings,
    findings,
    commandCount: commands.length,
  };
}

export function extractToolCommands(text, adapter) {
  const commands = [];
  for (const record of parseTranscript(text, adapter)) {
    for (const rule of adapter.toolCalls ?? []) {
      for (const candidate of expandRuleRecords(record, rule)) {
        if (!matchesRecord(candidate, rule.matches)) {
          continue;
        }
        const command = readPath(candidate, rule.commandPath);
        if (typeof command === 'string') {
          commands.push(command);
        }
      }
    }
  }
  return commands;
}

function expandRuleRecords(record, rule) {
  if (!rule.recordsPath) {
    return [record];
  }
  const candidates = readPath(record, rule.recordsPath);
  return Array.isArray(candidates) ? candidates : [];
}

function matchesRecord(record, matches = []) {
  return matches.every(match => {
    const value = readPath(record, match.path);
    if ('equals' in match) {
      return value === match.equals;
    }
    if ('startsWith' in match) {
      return typeof value === 'string' && value.startsWith(match.startsWith);
    }
    return match.exists ? value !== undefined : value === undefined;
  });
}

function readPath(value, dottedPath) {
  if (!dottedPath) {
    return undefined;
  }
  return dottedPath
    .split('.')
    .reduce(
      (current, part) =>
        current && typeof current === 'object' ? current[part] : undefined,
      value,
    );
}

function readNumber(value, dottedPath) {
  const candidate = readPath(value, dottedPath);
  return typeof candidate === 'number' && Number.isFinite(candidate)
    ? candidate
    : null;
}

// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global clearTimeout, process, setTimeout */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
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
    };
  } finally {
    await fs.promises.rm(privateRun.root, {recursive: true, force: true});
  }
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
      (adapter.toolCalls ?? []).filter(rule =>
        matchesRecord(record, rule.matches),
      ).length,
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
      if (!matchesRecord(record, rule.matches)) {
        continue;
      }
      const command = readPath(record, rule.commandPath);
      if (typeof command === 'string') {
        commands.push(command);
      }
    }
  }
  return commands;
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

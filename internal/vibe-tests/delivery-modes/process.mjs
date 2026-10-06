// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global clearTimeout, process, setTimeout */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {renderCommand, wrapCommand} from './profile.mjs';

const DEFAULT_CAPTURE_LIMIT = 20 * 1024 * 1024;

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
      env: {...process.env, ...env},
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

export function parseUsage(text) {
  const values = [];
  const visit = value => {
    if (!value || typeof value !== 'object') {
      return;
    }
    if (
      typeof value.input_tokens === 'number' ||
      typeof value.output_tokens === 'number'
    ) {
      values.push({
        inputTokens: value.input_tokens ?? 0,
        outputTokens: value.output_tokens ?? 0,
      });
    }
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) {
        child.forEach(visit);
      } else {
        visit(child);
      }
    }
  };
  for (const line of text.split('\n')) {
    try {
      visit(JSON.parse(line));
    } catch {
      // Transcripts can contain non-JSON diagnostics.
    }
  }
  try {
    visit(JSON.parse(text));
  } catch {
    // A JSONL transcript is not one JSON document.
  }
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

export function countToolCalls(text) {
  let count = 0;
  for (const record of parseJsonLines(text)) {
    if (
      record.payload_type === 'task.lifecycle.proposed' &&
      record.payload?.event?.task_kind?.startsWith('tool.')
    ) {
      count += 1;
    }
    if (record.type === 'assistant' && Array.isArray(record.message?.content)) {
      count += record.message.content.filter(
        block => block.type === 'tool_use',
      ).length;
    }
  }
  return count;
}

export function countCliLookups(text) {
  return extractToolCommands(text).reduce(
    (total, command) => total + countAstryxInvocations(command),
    0,
  );
}

export function countAstryxInvocations(command) {
  const pattern =
    /(?:\bnpx\s+(?:--yes\s+)?(?:astryx|@astryxdesign\/cli(?:@[^\s;&|()]+)?)(?=\s|$)|\b(?:npm|pnpm)\s+exec\s+(?:--\s+)?astryx(?=\s|$)|(?:^|[\s(;$])(?:[^\s;&|()]*\/)?node_modules\/\.bin\/astryx(?=\s|$)|\bnode\s+[^\s;&|()]*astryx\.mjs(?=\s|$)|(?:^|[\s(;$])astryx(?=\s|$))/gi;
  return (command.match(pattern) ?? []).length;
}

export function auditTranscript(stdout, stderr, audit = {}) {
  const commands = extractToolCommands(stdout);
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

export function extractToolCommands(text) {
  const commands = [];
  for (const value of parseJsonLines(text)) {
    if (
      value.payload_type === 'task.lifecycle.output' &&
      value.payload?.event?.final_result &&
      typeof value.payload.event.chunk === 'string'
    ) {
      try {
        const chunk = JSON.parse(value.payload.event.chunk);
        if (typeof chunk.command === 'string') {
          commands.push(chunk.command);
        }
      } catch {
        // Some tools stream plain text instead of a JSON command receipt.
      }
    }
    if (value.type === 'assistant' && Array.isArray(value.message?.content)) {
      for (const block of value.message.content) {
        if (
          block.type === 'tool_use' &&
          typeof block.input?.command === 'string'
        ) {
          commands.push(block.input.command);
        }
      }
    }
  }
  return commands;
}

function parseJsonLines(text) {
  const records = [];
  for (const line of text.split('\n')) {
    try {
      records.push(JSON.parse(line));
    } catch {
      // Ignore non-JSON transcript lines.
    }
  }
  return records;
}

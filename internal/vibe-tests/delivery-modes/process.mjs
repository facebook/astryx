// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global clearTimeout, process, setTimeout */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
  await fs.promises.mkdir(path.dirname(transcriptPath ?? path.join(cwd, 'x')), {
    recursive: true,
  });

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

    const append = (current, chunk) => {
      if (current.length >= captureLimit) {
        return current;
      }
      return (current + chunk.toString()).slice(0, captureLimit);
    };
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
      const durationMs = Date.now() - startedAt;
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
        durationMs,
      });
    });

    if (input != null) {
      child.stdin.end(input);
    } else {
      child.stdin.end();
    }
  });
}

function terminate(child) {
  try {
    if (process.platform !== 'win32' && child.pid) {
      process.kill(-child.pid, 'SIGTERM');
    } else {
      child.kill('SIGTERM');
    }
  } catch {
    // Best-effort termination or JSON parsing.
  }
  setTimeout(() => {
    try {
      if (process.platform !== 'win32' && child.pid) {
        process.kill(-child.pid, 'SIGKILL');
      } else {
        child.kill('SIGKILL');
      }
    } catch {
      // Best-effort termination or JSON parsing.
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
      // Best-effort termination or JSON parsing.
    }
  }
  try {
    visit(JSON.parse(text));
  } catch {
    // Best-effort termination or JSON parsing.
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
  for (const line of text.split('\n')) {
    try {
      const value = JSON.parse(line);
      if (
        value.payload_type === 'task.lifecycle.proposed' &&
        value.payload?.event?.task_kind?.startsWith('tool.')
      ) {
        count += 1;
      }
      if (value.type === 'assistant' && Array.isArray(value.message?.content)) {
        count += value.message.content.filter(
          block => block.type === 'tool_use',
        ).length;
      }
    } catch {
      // A transcript can contain non-JSON diagnostic lines.
    }
  }
  return count;
}

export function countCliLookups(text) {
  let count = 0;
  for (const command of extractToolCommands(text)) {
    count += (
      command.match(
        /(?:^|[;&|]\s*|\b)npx\s+(?:--yes\s+)?astryx\s+(?:help|docs|component|template|search|build)\b/gi,
      ) ?? []
    ).length;
  }
  return count;
}

function extractToolCommands(text) {
  const commands = [];
  for (const line of text.split('\n')) {
    try {
      const value = JSON.parse(line);
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
    } catch {
      // A transcript can contain non-JSON diagnostic lines.
    }
  }
  return commands;
}

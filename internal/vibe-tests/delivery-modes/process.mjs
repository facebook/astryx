// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global clearTimeout, process, setTimeout */

import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const DEFAULT_CAPTURE_LIMIT = 20 * 1024 * 1024;
export const SANDBOX_ROOT = '/mnt/run';
export const SANDBOX_PROJECT = `${SANDBOX_ROOT}/project`;

const MOUNT_NAMESPACE_SCRIPT = `set -eu
uid="$1"
gid="$2"
private_root="$3"
shift 3
mount --make-rprivate /
mount -t tmpfs tmpfs /mnt
mkdir -p ${SANDBOX_ROOT}
mount --bind "$private_root" ${SANDBOX_ROOT}
mount -t tmpfs tmpfs /tmp
mount -t tmpfs tmpfs /home
cd ${SANDBOX_PROJECT}
exec setpriv --reuid="$uid" --regid="$gid" --clear-groups -- env \
  HOME=${SANDBOX_ROOT}/home \
  CLAUDE_CONFIG_DIR=${SANDBOX_ROOT}/home/.claude \
  XDG_CONFIG_HOME=${SANDBOX_ROOT}/home/.config \
  XDG_RUNTIME_DIR=/run/user/$uid \
  DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus \
  TMPDIR=${SANDBOX_ROOT}/tmp \
  PATH=${SANDBOX_ROOT}/bin:/usr/bin:/bin \
  MUSE_EXPERIMENTAL_PLUGINS=0 \
  LANG=C.UTF-8 \
  "$@"`;

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

export async function createPrivateRunRoot(prefix = 'run-') {
  const base = path.join(os.homedir(), '.astryx-vibe-private');
  await fs.promises.mkdir(base, {recursive: true, mode: 0o700});
  await fs.promises.chmod(base, 0o700);
  const root = await fs.promises.mkdtemp(path.join(base, prefix));
  await fs.promises.chmod(root, 0o700);
  for (const directory of [
    'project',
    'home/.claude',
    'home/.config',
    'tmp',
    'bin',
  ]) {
    await fs.promises.mkdir(path.join(root, directory), {
      recursive: true,
      mode: 0o700,
    });
  }
  await symlinkExecutable(process.execPath, path.join(root, 'bin', 'node'));
  const gitPath = fs.existsSync('/usr/bin/git')
    ? '/usr/bin/git'
    : '/usr/local/bin/git';
  await symlinkExecutable(gitPath, path.join(root, 'bin', 'git'));
  await fs.promises.writeFile(
    path.join(root, 'empty-mcp.json'),
    '{"mcpServers":{}}\n',
  );
  return {
    root,
    projectDir: path.join(root, 'project'),
    sandboxProjectDir: SANDBOX_PROJECT,
    transcriptPath: path.join(root, 'transcript.jsonl'),
  };
}

export async function runIsolatedCommand(
  privateRoot,
  command,
  args,
  options = {},
) {
  if (process.platform !== 'linux') {
    throw new Error('Private mount-namespace runs require Linux');
  }
  const uid = process.getuid?.();
  const gid = process.getgid?.();
  if (!Number.isInteger(uid) || !Number.isInteger(gid)) {
    throw new Error('Could not determine the current uid/gid');
  }
  return await runCommand(
    '/usr/bin/sudo',
    [
      '-n',
      'unshare',
      '--mount',
      '/bin/sh',
      '-c',
      MOUNT_NAMESPACE_SCRIPT,
      'sandbox',
      String(uid),
      String(gid),
      privateRoot,
      command,
      ...args,
    ],
    {
      ...options,
      cwd: privateRoot,
    },
  );
}

async function symlinkExecutable(target, linkPath) {
  try {
    await fs.promises.symlink(target, linkPath);
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      throw error;
    }
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
      // A transcript can contain non-JSON diagnostics.
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
  const patterns = [
    /(?:^|[;&|]\s*)npx\s+(?:--yes\s+)?(?:astryx|@astryxdesign\/cli(?:@[^\s;&|]+)?)(?=\s|$)/gi,
    /(?:^|[;&|]\s*)(?:npm|pnpm)\s+exec\s+(?:--\s+)?astryx(?=\s|$)/gi,
    /(?:^|[;&|]\s*)(?:[^\s;&|]*\/)?node_modules\/\.bin\/astryx(?=\s|$)/gi,
    /(?:^|[;&|]\s*)node\s+[^\s;&|]*astryx\.mjs(?=\s|$)/gi,
    /(?:^|[;&|]\s*)astryx(?=\s|$)/gi,
  ];
  return patterns.reduce(
    (total, pattern) => total + (command.match(pattern) ?? []).length,
    0,
  );
}

export function auditAgentContext(agent, stdout, stderr) {
  const records = [];
  for (const line of stdout.split('\n')) {
    try {
      records.push(JSON.parse(line));
    } catch {
      // Ignore non-JSON output.
    }
  }

  if (agent === 'claude') {
    const init = records.find(
      value => value.type === 'system' && value.subtype === 'init',
    );
    const hooks = records.filter(
      value => value.type === 'system' && value.subtype?.startsWith('hook_'),
    );
    const externalPlugins = (init?.plugins ?? []).filter(
      plugin => plugin.source !== 'cc-plugin-agents-md@builtin',
    );
    const violations = [];
    if (!init) {
      violations.push('missing Claude init event');
    }
    if ((init?.mcp_servers ?? []).length > 0) {
      violations.push('Claude loaded MCP servers');
    }
    if (externalPlugins.length > 0) {
      violations.push('Claude loaded external plugins');
    }
    if (hooks.length > 0) {
      violations.push('Claude ran hooks');
    }
    return {
      passed: violations.length === 0,
      violations,
      plugins: init?.plugins ?? [],
      mcpServers: init?.mcp_servers ?? [],
      hookEvents: hooks.length,
      tools: init?.tools ?? [],
      cwd: init?.cwd ?? null,
      runnerVersion: init?.claude_code_version ?? null,
      launcherPluginInstallAttempts: (stderr.match(/^Installing /gm) ?? [])
        .length,
      launcherPluginInstallBlocked:
        (stderr.match(/^Installing /gm) ?? []).length > 0 &&
        externalPlugins.length === 0,
      pathPolicy: 'private bin + /usr/bin + /bin; meta is absent',
    };
  }

  const reminderKinds = records
    .filter(
      value =>
        value.payload_type === 'task.lifecycle.proposed' &&
        value.payload?.event?.task_kind?.startsWith('reminder.agent.'),
    )
    .map(value => value.payload.event.task_kind);
  const mcpEvents = records.filter(value =>
    String(value.payload_type ?? '')
      .toLowerCase()
      .includes('mcp'),
  ).length;
  const pluginGateOff = stderr.includes('muse: gate plugins: off');
  const pluginInstallAttempt = stderr.includes('Installing ');
  const violations = [];
  if (!pluginGateOff) {
    violations.push('Muse plugin gate was not off');
  }
  if (pluginInstallAttempt) {
    violations.push('Muse attempted to install external plugins');
  }
  if (mcpEvents > 0) {
    violations.push('Muse emitted MCP events');
  }
  return {
    passed: violations.length === 0,
    violations,
    plugins: [],
    mcpServers: [],
    hookEvents: 0,
    builtInReminderEvents: reminderKinds.length,
    builtInReminderKinds: [...new Set(reminderKinds)].sort(),
    externalSkillContentLoaded: false,
    knownAsymmetry:
      'Muse emits built-in skill and final-verification reminder lifecycle events; external rules, foreign context, plugins, MCP, and external skill content are disabled identically for every config.',
    pathPolicy: 'private bin + /usr/bin + /bin; meta is absent',
  };
}

export function extractToolCommands(text) {
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
      // A transcript can contain non-JSON diagnostics.
    }
  }
  return commands;
}

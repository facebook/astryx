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
browser_cache="$4"
username="$5"
shift 5
command="$1"
shift
mount --make-rprivate /
mount -t tmpfs tmpfs /mnt
mkdir -p ${SANDBOX_ROOT} ${SANDBOX_ROOT}/browser-cache
mount --bind "$private_root" ${SANDBOX_ROOT}
mount --bind "$browser_cache" ${SANDBOX_ROOT}/browser-cache
mount -o remount,bind,ro ${SANDBOX_ROOT}/browser-cache
mkdir -p /mnt/host-claude-code /mnt/host-muse-code
mount --bind /usr/local/bin/claude_code /mnt/host-claude-code
mount --bind /usr/local/bin/muse_code /mnt/host-muse-code
touch /mnt/host-servicerouter
mount --bind /usr/local/bin/servicerouter /mnt/host-servicerouter
mount -t tmpfs tmpfs /tmp
mount -t tmpfs tmpfs /home
mount -t tmpfs tmpfs /data
mount -t tmpfs tmpfs /var/tmp
mount -t tmpfs tmpfs /dev/shm
mount -t tmpfs -o noexec,nosuid,nodev tmpfs /usr/local/bin
mkdir -p /usr/local/bin/claude_code /usr/local/bin/muse_code
mount --bind /mnt/host-claude-code /usr/local/bin/claude_code
mount -o remount,bind,ro /usr/local/bin/claude_code
mount --bind /mnt/host-muse-code /usr/local/bin/muse_code
mount -o remount,bind,ro /usr/local/bin/muse_code
touch /usr/local/bin/servicerouter
mount --bind /mnt/host-servicerouter /usr/local/bin/servicerouter
mount -o remount,bind,ro /usr/local/bin/servicerouter
mount --rbind /var/facebook /var/facebook
mount --make-rprivate /var/facebook
mount -o remount,bind,rw,noexec,nosuid,nodev /var/facebook
mount -t tmpfs -o noexec,nosuid,nodev tmpfs /opt/facebook
umount /mnt/host-claude-code
umount /mnt/host-muse-code
umount /mnt/host-servicerouter
rmdir /mnt/host-claude-code /mnt/host-muse-code
rm /mnt/host-servicerouter
for forbidden in \
  /usr/bin/sudo \
  /usr/bin/nsenter \
  /usr/bin/hg \
  /usr/bin/arc \
  /usr/bin/dotslash \
  /usr/local/jellyfish/jf \
  /usr/local/fbcode/platform010/bin/fbpython \
  /usr/local/fbcode/bin/fbpython
do
  if [ -e "$forbidden" ]; then
    mount --bind /bin/false "$forbidden"
  fi
done
mount -o remount,bind,ro,noexec,nosuid,nodev /usr/local/bin
mount -o remount,bind,rw,noexec,nosuid,nodev /var/facebook
mount -o remount,bind,ro,noexec,nosuid,nodev /opt/facebook
cd ${SANDBOX_PROJECT}
exec setpriv --reuid="$uid" --regid="$gid" --clear-groups -- env \
  HOME=${SANDBOX_ROOT}/home \
  CLAUDE_CONFIG_DIR=${SANDBOX_ROOT}/home/.claude \
  XDG_CONFIG_HOME=${SANDBOX_ROOT}/home/.config \
  XDG_RUNTIME_DIR=/run/user/$uid \
  DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus \
  TMPDIR=${SANDBOX_ROOT}/tmp \
  PATH=${SANDBOX_ROOT}/bin:/usr/bin:/bin \
  PLAYWRIGHT_BROWSERS_PATH=${SANDBOX_ROOT}/browser-cache \
  MUSE_EXPERIMENTAL_PLUGINS=0 \
  MCP_TIMEOUT=60000 \
  LANG=C.UTF-8 \
  "$command" "$@"`;

const SCREENSHOT_HELPER = `#!/bin/sh
set -eu
if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: screenshot <file-or-url> [output.png]" >&2
  exit 2
fi
target="$1"
output="\${2:-screenshot.png}"
case "$target" in
  http://*|https://*|file://*) ;;
  *) target="file://$(realpath "$target")" ;;
esac
chrome="$(find /mnt/run/browser-cache -type f -path '*/chrome-linux*/chrome' | sort | tail -n 1)"
if [ -z "$chrome" ]; then
  echo "screenshot: no Chromium executable found" >&2
  exit 1
fi
"$chrome" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --window-size=1440,900 --screenshot="$output" "$target" >/dev/null 2>&1
printf '%s\n' "$output"
`;

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
    'browser-cache',
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
  const screenshotPath = path.join(root, 'bin', 'screenshot');
  await fs.promises.writeFile(screenshotPath, SCREENSHOT_HELPER, {mode: 0o700});
  await fs.promises.chmod(screenshotPath, 0o700);
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
  const browserCache = path.join(os.homedir(), '.cache', 'ms-playwright');
  if (!fs.existsSync(browserCache)) {
    throw new Error(`Playwright browser cache is missing: ${browserCache}`);
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
      browserCache,
      os.userInfo().username,
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
  const pattern =
    /(?:\bnpx\s+(?:--yes\s+)?(?:astryx|@astryxdesign\/cli(?:@[^\s;&|()]+)?)(?=\s|$)|\b(?:npm|pnpm)\s+exec\s+(?:--\s+)?astryx(?=\s|$)|(?:^|[\s(;$])(?:[^\s;&|()]*\/)?node_modules\/\.bin\/astryx(?=\s|$)|\bnode\s+[^\s;&|()]*astryx\.mjs(?=\s|$)|(?:^|[\s(;$])astryx(?=\s|$))/gi;
  return (command.match(pattern) ?? []).length;
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
      pathPolicy:
        'private bin + /usr/bin + /bin; internal executable roots and sensitive host paths are sandbox-blocked',
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
    pathPolicy:
      'private bin + /usr/bin + /bin; internal executable roots and sensitive host paths are sandbox-blocked',
  };
}

export function auditTranscriptCommands(text) {
  const sensitivePaths = [
    ['/proc', /\/proc(?=\/|$|[\s"'`;&|),\]}])/],
    ['/usr/local/bin', /\/usr\/local\/bin(?=\/|$|[\s"'`;&|),\]}])/],
    ['/var/facebook', /\/var\/facebook(?=\/|$|[\s"'`;&|),\]}])/],
    ['/data', /\/data(?=\/|$|[\s"'`;&|),\]}])/],
  ];
  const flaggedCommands = [];
  for (const command of extractToolCommands(text)) {
    const touchedPaths = sensitivePaths
      .filter(([, pattern]) => pattern.test(command))
      .map(([label]) => label);
    if (touchedPaths.length > 0) {
      flaggedCommands.push({
        command: command.slice(0, 1000),
        touchedPaths,
      });
    }
  }
  return {
    passed: flaggedCommands.length === 0,
    flaggedCommandCount: flaggedCommands.length,
    touchedPaths: [
      ...new Set(flaggedCommands.flatMap(entry => entry.touchedPaths)),
    ].sort(),
    flaggedCommands,
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

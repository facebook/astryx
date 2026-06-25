// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Interactivity contract for the CLI.
 *
 * A single source of truth for "can this process prompt the user?". Several
 * commands launch @clack/prompts wizards; in a non-interactive context (CI,
 * piped stdin/stdout, no TTY) those prompts block forever. Historically each
 * command answered this question differently — some checked `stdout.isTTY`,
 * one checked `stdin.isTTY`, one added `!process.env.CI`, and some had no
 * guard at all. This module centralizes the check so every command behaves
 * identically.
 *
 * Two entry points, for two situations:
 *
 *   - `requireInteractive()` — for commands whose prompt IS the work
 *     (e.g. `astryx init`, `astryx theme`). With no TTY there is nothing to do, so
 *     fail fast (exit 1) with actionable, non-interactive guidance.
 *
 *   - `isInteractive()` — for commands with an OPTIONAL secondary prompt
 *     (e.g. swizzle's post-copy "report a gap?"). The primary work already
 *     succeeded; callers use this to skip the prompt gracefully.
 */

/**
 * True when the process can safely run an interactive prompt.
 *
 * Requires BOTH stdin and stdout to be TTYs (clack reads stdin and renders to
 * stdout) and that we are not in a CI environment. A CI runner may allocate a
 * pseudo-TTY, so `process.env.CI` is an explicit override: never prompt in CI.
 *
 * @param {object} [env] - Override hook for tests.
 * @param {boolean} [env.stdinTTY=process.stdin.isTTY]
 * @param {boolean} [env.stdoutTTY=process.stdout.isTTY]
 * @param {boolean} [env.ci=Boolean(process.env.CI)]
 * @returns {boolean}
 */
export function isInteractive({
  stdinTTY = Boolean(process.stdin && process.stdin.isTTY),
  stdoutTTY = Boolean(process.stdout && process.stdout.isTTY),
  ci = Boolean(process.env.CI),
} = {}) {
  if (ci) return false;
  return stdinTTY && stdoutTTY;
}

/**
 * Guard for commands whose primary action is an interactive wizard. When the
 * process is non-interactive, prints an actionable error and exits 1 instead
 * of hanging on a prompt that will never receive input.
 *
 * @param {object} options
 * @param {string} options.command - Command name for the message, e.g. 'init'.
 * @param {string} options.hint - Concrete non-interactive invocation, e.g.
 *   '`pnpm astryx init --all` or `--features agents,theme,template`'.
 * @param {boolean} [options.json=false] - When true, the command does not
 *   support --json; we still exit 1 but skip the human-formatted guidance.
 * @param {object} [env] - Forwarded to isInteractive (test hook).
 * @returns {void} Returns when interactive; otherwise calls process.exit(1).
 */
export function requireInteractive({command, hint, json = false} = {}, env) {
  if (isInteractive(env)) return;
  const name = command ? `xds ${command}` : 'this command';
  console.error(
    `Error: \`${name}\` with no flags is interactive and requires a TTY.`,
  );
  if (hint) {
    console.error(`Run non-interactively with: ${hint}`);
  }
  if (!json) {
    console.error(
      'Detected a non-interactive environment (no TTY, piped I/O, or CI=1).',
    );
  }
  process.exit(1);
}

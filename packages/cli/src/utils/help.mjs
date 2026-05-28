// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Help-text helpers
 *
 * Subcommands hide global flags by default. We re-surface them in
 * each subcommand's `--help` so agents and humans can discover
 * `--json`, `--lang`, `--detail`, `--zh`, `--dense` without bouncing
 * up to `xds --help`.
 *
 * Also supports a small `Examples:` block per command.
 */

const GLOBAL_FLAGS_BLOCK = `
Global Options (inherited from \`xds\`):
  --json              Output as typed JSON (envelope: { type, data })
  --detail <level>    Output detail level: brief, compact, full (default: full)
  --lang <locale>     Output language/format: en, zh, dense
  --zh                Shortcut for --lang zh (legacy)
  --dense             Shortcut for --lang dense (legacy)
`.trimEnd();

/**
 * Attach an Examples block + the global-flags reference to a subcommand.
 *
 * @param {import('commander').Command} cmd
 * @param {string[]} [examples] - one example per line, including the leading `xds ...`.
 */
export function addCommonHelp(cmd, examples = []) {
  cmd.addHelpText('after', () => {
    const parts = [];
    if (examples.length > 0) {
      parts.push('\nExamples:');
      for (const ex of examples) parts.push(`  ${ex}`);
    }
    parts.push('');
    parts.push(GLOBAL_FLAGS_BLOCK);
    return parts.join('\n');
  });
}

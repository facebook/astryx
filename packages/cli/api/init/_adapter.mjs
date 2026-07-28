// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init shared adapter — the plain logger contract shared by init's leaves.
 *
 * Both the `init.run` (run/run.mjs) and `init.remove` (remove/remove.mjs) leaves
 * emit human progress through the SAME injectable logger and default to the SAME
 * silent no-op for programmatic callers. That contract is the only thing the two
 * leaves share — the agent-docs engine itself lives in lib/agent-docs — so it
 * lives here rather than being duplicated per-leaf or forcing a cross-leaf
 * import. The dispatcher/barrel (init.mjs) re-exports `noopInitLogger` so the
 * CLI + tests keep importing it by name.
 *
 * The logger is a PLAIN log/error pair, NOT the clack-style term-log used by
 * upgrade/theme: init's output has always been flat humanLog lines, so a
 * byte-identical CLI needs a plain passthrough, not intro/step/success framing.
 */

/**
 * Plain injectable logger for init's flat output.
 * @typedef {object} InitLogger
 * @property {(m?: string) => void} log   stdout line (the CLI maps this to humanLog)
 * @property {(m?: string) => void} error stderr line (the CLI maps this to console.error)
 */

/** Silent logger — the default for programmatic callers. @type {InitLogger} */
export const noopInitLogger = {log() {}, error() {}};

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The recorded event shape, and the environment snapshot attached to it.
 *
 * One invocation produces exactly one event. That keeps the log trivially
 * queryable — `SELECT command, outcome, count(*) FROM events GROUP BY 1, 2`
 * works with no joins — and keeps the write path to a single append.
 *
 * The shape is versioned by {@link SCHEMA_VERSION}. Treat it as an append-only
 * contract: add fields freely, never repurpose or remove one, and bump the
 * version when an existing field changes meaning, so a consumer reading a
 * mixed-version table can branch on it.
 *
 * @input  command identity, argv/options, an outcome, and process context
 * @output a flat, JSON-serializable record ready for a sink
 * @position packages/cli/foundation/debug — event shape
 */

import * as crypto from 'node:crypto';
import {isCliOneOff, detectPackageManager} from '../env/package-manager.mjs';

/**
 * Version of the recorded event shape. Bump on any breaking field change,
 * widening {@link DebugSchemaVersion} in the published type at the same time.
 * @type {import('../../authoring/debug/type').DebugSchemaVersion}
 */
export const SCHEMA_VERSION = 1;

/**
 * The recorded shape is PUBLISHED — a project sets `debug` in `astryx.config`
 * to a function, and that function receives these. So the definition lives in
 * `authoring/debug/type.ts` alongside the other public contracts, and this
 * module re-uses it rather than keeping a second copy that could drift. A
 * sealed zod schema in `authoring/debug/parse.mjs` is drift-locked to it.
 *
 * @typedef {import('../../authoring/debug/type').DebugEvent} DebugEvent
 * @typedef {import('../../authoring/debug/type').DebugOutcome} Outcome
 * @typedef {import('../../authoring/debug/type').DebugEventError} DebugEventError
 */

/**
 * An event still being filled in. Timing is only knowable once the run ends
 * and the environment probe is deferred until there is a handler to deliver
 * to, so those fields are absent or null until {@link finish} seals the
 * record — every PERSISTED event has them.
 *
 * @typedef {Omit<DebugEvent, 'endedAt' | 'durationMs' | 'env'> &
 *   {endedAt?: string, durationMs?: number,
 *    env: DebugEvent['env'] | null}} InFlightEvent
 */

/**
 * CI providers worth naming, matched by a single env var each. Order matters
 * only for the name we report; `ci` is true if any of them (or the generic
 * `CI` flag) is present.
 */
const CI_PROVIDERS = [
  ['GITHUB_ACTIONS', 'github-actions'],
  ['GITLAB_CI', 'gitlab-ci'],
  ['CIRCLECI', 'circleci'],
  ['BUILDKITE', 'buildkite'],
  ['TRAVIS', 'travis'],
  ['JENKINS_URL', 'jenkins'],
  ['TEAMCITY_VERSION', 'teamcity'],
  ['TF_BUILD', 'azure-pipelines'],
  ['BITBUCKET_BUILD_NUMBER', 'bitbucket'],
  ['CODEBUILD_BUILD_ID', 'aws-codebuild'],
  ['DRONE', 'drone'],
  ['VERCEL', 'vercel'],
  ['NETLIFY', 'netlify'],
];

/**
 * Coding agents and editors worth distinguishing. This CLI is explicitly built
 * to be driven by agents, so "which agent invoked this" is the single most
 * useful dimension in the log — it separates human ergonomics problems from
 * agent-prompt problems.
 */
const AGENT_SIGNALS = [
  ['CURSOR_TRACE_ID', 'cursor'],
  ['CURSOR_AGENT', 'cursor'],
  ['CLAUDECODE', 'claude-code'],
  ['CLAUDE_CODE', 'claude-code'],
  ['AIDER_MODEL', 'aider'],
  ['GITHUB_COPILOT_AGENT', 'copilot'],
  ['REPLIT_USER', 'replit'],
  ['CODESPACES', 'codespaces'],
];

/** @returns {{ci: boolean, ciName: string | null}} */
function detectCi() {
  for (const [key, name] of CI_PROVIDERS) {
    if (process.env[key]) return {ci: true, ciName: name};
  }
  const generic =
    process.env.CI != null &&
    process.env.CI !== '' &&
    process.env.CI !== '0' &&
    process.env.CI !== 'false';
  return {ci: generic, ciName: generic ? 'unknown' : null};
}

/** @returns {string | null} */
function detectAgent() {
  for (const [key, name] of AGENT_SIGNALS) {
    if (process.env[key]) return name;
  }
  const termProgram = process.env.TERM_PROGRAM;
  if (termProgram === 'vscode') return 'vscode';
  return null;
}

/**
 * Snapshot the machine and runtime. Everything here is either a coarse
 * bucket or a value the user could read off their own `astryx doctor`
 * output — no hostname, no username, no network identity.
 *
 * @param {{cliVersion?: string}} [options]
 * @returns {import('../../authoring/debug/type').DebugEventEnv}
 */
export function captureEnv({cliVersion} = {}) {
  const {ci, ciName} = detectCi();
  return {
    cliVersion: cliVersion ?? null,
    nodeVersion: process.versions.node,
    platform: process.platform,
    arch: process.arch,
    ci,
    ciName,
    agent: detectAgent(),
    oneOff: safe(() => isCliOneOff(), false),
    packageManager: safe(() => detectPackageManager(), null),
    tty: Boolean(process.stdout.isTTY),
    locale: safe(
      () => Intl.DateTimeFormat().resolvedOptions().locale,
      null,
    ),
    timezone: safe(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      null,
    ),
  };
}

/**
 * Snapshot the project the command ran against. Names of a user's private
 * packages are identifying, so this records only shape: whether a project is
 * present, whether it is configured, and how many integrations it loads.
 *
 * @param {{hasConfig?: boolean, initialized?: boolean, integrationCount?: number, inProject?: boolean}} [facts]
 * @returns {import('../../authoring/debug/type').DebugEventProject}
 */
export function captureProject(facts = {}) {
  return {
    inProject: facts.inProject ?? null,
    hasConfig: facts.hasConfig ?? null,
    initialized: facts.initialized ?? null,
    integrationCount: facts.integrationCount ?? null,
  };
}

/**
 * A blank event, ready to accumulate into.
 *
 * Deliberately cheap: allocation only. `env` is left null and filled in by
 * {@link finish} once there is a handler to deliver to — probing it here would
 * charge every run for something most runs never use. It is not a small
 * charge: the first `Intl.DateTimeFormat().resolvedOptions()` initialises ICU,
 * and with `detectPackageManager` and `isCliOneOff` alongside it the probe
 * dominated `begin()` and put ~9% on the CLI's startup for everyone.
 *
 * @param {object} [init]
 * @param {string} [init.command]
 * @param {string[]} [init.argv]
 * @returns {InFlightEvent}
 */
export function createEvent({command = '', argv = []} = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    command,
    commandPath: command ? command.split(' ') : [],
    argv,
    args: {},
    options: {},
    optionSources: {},
    globalOptions: {},
    outcome: 'incomplete',
    exitCode: null,
    signal: null,
    error: null,
    output: {
      jsonMode: false,
      envelopeTypes: [],
      handled: false,
      helpDisplayed: false,
      stdout: '',
      stderr: '',
      stdoutBytes: 0,
      stderrBytes: 0,
      truncated: false,
    },
    env: null,
    project: captureProject(),
    redacted: true,
  };
}

/**
 * Normalize a thrown value into the event's error shape.
 * @param {unknown} err
 * @returns {DebugEventError | null}
 */
export function toEventError(err) {
  if (err == null) return null;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      code:
        typeof (/** @type {any} */ (err).code) === 'string'
          ? /** @type {any} */ (err).code
          : null,
      stack: err.stack ?? null,
    };
  }
  return {
    name: typeof err,
    message: typeof err === 'string' ? err : safeStringify(err),
    code: null,
    stack: null,
  };
}

/**
 * Run `fn`, returning `fallback` if it throws. Environment probes touch the
 * filesystem and Intl, both of which can fail in a locked-down sandbox.
 * @template T
 * @param {() => T} fn
 * @param {T} fallback
 * @returns {T}
 */
function safe(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** @param {unknown} value @returns {string} */
function safeStringify(value) {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

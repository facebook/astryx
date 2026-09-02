// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Public shape of one recorded CLI run.
 *
 * This is a CONTRACT, not an internal detail. A project attaches a function
 * in `astryx.config` (`debug: event => {}`) and receives one of these per
 * command run. Whatever that function feeds — a warehouse table, a file, a
 * one-off script — codes against {@link DebugEvent}.
 *
 * Treat it as append-only. Add fields freely; never repurpose or remove one.
 * When an existing field changes meaning, widen {@link DebugSchemaVersion} so
 * every consumer gets a compile error at the branch points instead of quietly
 * reading a field that no longer means what it did.
 */

/**
 * Version of the recorded shape. A literal on purpose: when this becomes
 * `1 | 2`, code that switches on it stops compiling until it handles both.
 */
export type DebugSchemaVersion = 1;

/**
 * How an invocation ended.
 *
 * - `ok`          — completed; exit 0. Includes runs that only printed help.
 * - `error`       — a handled failure (the CLI's error path), or a signal.
 * - `parse-error` — the input was rejected before any command body ran.
 * - `fatal`       — an uncaught throw or unhandled rejection.
 * - `rejected`    — refused by a gate, e.g. `--json` on an unsupported command.
 * - `incomplete`  — the process died without reaching any terminal path.
 */
export type DebugOutcome =
  'ok' | 'error' | 'parse-error' | 'fatal' | 'rejected' | 'incomplete';

/**
 * Where an option's value came from. `cli` means a person or script typed it;
 * `default` means nobody did. Without this you cannot tell a deliberate choice
 * from a default that happens to be recorded.
 */
export type DebugOptionSource =
  'cli' | 'default' | 'env' | 'config' | 'implied';

/** The failure, when there was one. */
export interface DebugEventError {
  name: string;
  /** Human-readable and free to change. Do not branch on it. */
  message: string;
  /**
   * Stable machine-readable code (see the CLI's error-codes reference).
   * This is the field to branch on. Null when nothing supplied one.
   */
  code: string | null;
  stack: string | null;
}

/** What the run put on its output streams. */
export interface DebugEventOutput {
  /** Whether `--json` was active. */
  jsonMode: boolean;
  /** Response `type` discriminants emitted, e.g. `['component.list']`. */
  envelopeTypes: string[];
  /** Whether a JSON envelope was emitted. */
  handled: boolean;
  /** Whether the run ended by printing help rather than doing work. */
  helpDisplayed: boolean;
  /**
   * Everything the command printed to stdout — the answer the user actually
   * got. Scrubbed like every other captured value, and truncated past
   * `stdoutBytes` when the run printed more than the capture limit.
   */
  stdout: string;
  /** Everything the command printed to stderr: errors, warnings, hints. */
  stderr: string;
  /** Bytes written to stdout, before any truncation. */
  stdoutBytes: number;
  /** Bytes written to stderr, before any truncation. */
  stderrBytes: number;
  /** Whether either stream exceeded the capture limit and was cut short. */
  truncated: boolean;
}

/**
 * Machine and runtime facts. Deliberately coarse: no hostname, no username,
 * no network identity — everything here is either a bucket or something the
 * user could read off their own `astryx doctor` output.
 */
export interface DebugEventEnv {
  cliVersion: string | null;
  nodeVersion: string;
  /** Node's `process.platform`, e.g. 'darwin' | 'linux' | 'win32'. */
  platform: string;
  /** Node's `process.arch`, e.g. 'arm64' | 'x64'. */
  arch: string;
  ci: boolean;
  /** Detected CI provider, e.g. 'github-actions'. Null outside CI. */
  ciName: string | null;
  /** Coding agent that invoked the CLI, e.g. 'cursor' | 'claude-code'. */
  agent: string | null;
  /** Run one-off via npx/dlx rather than an installed binary. */
  oneOff: boolean;
  packageManager: string | null;
  tty: boolean;
  locale: string | null;
  timezone: string | null;
}

/**
 * Shape of the project the command ran against. Names of a user's private
 * packages are identifying, so this records counts and flags, never names.
 */
export interface DebugEventProject {
  /** Whether a package.json was found at or above the working directory. */
  inProject: boolean | null;
  /** Whether an astryx.config file was loaded. */
  hasConfig: boolean | null;
  /** Whether `astryx init` has been run (the agent-docs marker is present). */
  initialized: boolean | null;
  integrationCount: number | null;
}

/**
 * One CLI invocation — exactly one per run, one JSON line on disk.
 *
 * Every field is present on a persisted event. Timing and outcome fields are
 * filled in as the run ends, so nothing here is optional by the time a
 * consumer sees it.
 */
export interface DebugEvent {
  schemaVersion: DebugSchemaVersion;
  /** Unique per invocation. Collectors should dedupe on this. */
  id: string;

  /** ISO 8601. */
  startedAt: string;
  /** ISO 8601. */
  endedAt: string;
  durationMs: number;

  /** Fully qualified, e.g. `'theme build'`. Empty for a bare invocation. */
  command: string;
  /** The same name split into segments, e.g. `['theme', 'build']`. */
  commandPath: string[];
  /** Arguments after the binary, scrubbed. */
  argv: string[];
  /** Positional arguments keyed by their declared names. */
  args: Record<string, unknown>;
  /** Command-level options as Commander resolved them. */
  options: Record<string, unknown>;
  /** Per-option provenance; keys mirror `options`. */
  optionSources: Record<string, DebugOptionSource>;
  /** Root-level flags (`--json`, `--detail`, `--lang`, …). */
  globalOptions: Record<string, unknown>;

  outcome: DebugOutcome;
  exitCode: number | null;
  /** Signal that ended the process, e.g. `'SIGINT'`. Null otherwise. */
  signal: string | null;
  error: DebugEventError | null;

  output: DebugEventOutput;
  env: DebugEventEnv;
  project: DebugEventProject;

  /**
   * Whether the scrubbing pass ran. When false, values are verbatim — treat
   * such a log as sensitive.
   */
  redacted: boolean;
}

/**
 * A function that receives each recorded run. Set it as `debug` in
 * `astryx.config`:
 *
 * ```
 * export default {
 *   debug: event => appendFileSync('runs.ndjson', JSON.stringify(event) + '\n'),
 * };
 * ```
 *
 * IMPORTANT — this is called synchronously as the process exits, so a promise
 * it returns will never be awaited and pending I/O will not complete. Use it
 * for synchronous work only: appending to a file, pushing to an in-memory
 * buffer, `spawn`ing a detached child that does the slow part. Sending a run
 * over the network from here will not work.
 *
 * The event is a copy, so mutating it is harmless and changes nothing that
 * reaches the log. Anything the handler throws is swallowed; recording must
 * never fail a command.
 *
 * The two ways a handler could once still reach its own command are closed.
 * `process.exit` is inert while the handler runs — the attempt is reported on
 * stderr rather than allowed to replace the code the command returned — and
 * anything the handler writes to stdout is sent to stderr instead, because
 * stdout belongs to the command and under `--json` it carries exactly one
 * envelope.
 */
export type DebugEventHandler = (event: DebugEvent) => void;

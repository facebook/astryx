// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared types for the Astryx CLI JSON API.
 *
 * `CLIError` and `CLIUnsupportedError` are the two error shapes. Success
 * responses are the structural `{ type, data, meta? }` envelope (`CLIResponse`)
 * — there is NO central union of every response. Each command's precise
 * response type is the source of truth at its own function; import the
 * per-command type, or use `ReturnType<typeof fn>`, when you need it.
 */

import type {ErrorCode} from './error-codes';

/**
 * A "did you mean…" suggestion attached to an error. `reason` is optional:
 * some call sites emit bare `{name}` (e.g. a list of candidate component names)
 * with no per-item explanation.
 */
export interface Suggestion {
  name: string;
  reason?: string;
}

/**
 * Structured error. Check `'error' in result` to discriminate.
 *
 * Branch on `code` (a stable machine-readable identifier), never on the
 * human-readable `error` string, which changes freely.
 */
export interface CLIError {
  error: string;
  code: ErrorCode;
  suggestions?: Suggestion[];
}

/** Returned by the fallback hook for commands without --json support. */
export interface CLIUnsupportedError {
  error: `JSON output is not supported for the '${string}' command`;
  code: ErrorCode;
}

/**
 * A success response envelope: a `type` discriminator, its `data` payload, and
 * an optional `meta` sidecar (emitted as a sibling of `data`, never merged in).
 *
 * Structural by design — there is no central union of every response `type`.
 * A specific command narrows `data` via its own return type.
 */
export interface CLIResponse {
  type: string;
  data: unknown;
  meta?: Record<string, unknown>;
}

/** Wrap any response type to include possible error shapes. */
export type CLIResult<T> = T | CLIError | CLIUnsupportedError;

/**
 * Output a JSON response envelope. Structural serializer — the correctness of
 * the `type` discriminator is guaranteed at each API function's return type,
 * not by a central map here.
 */
export function jsonOut(response: CLIResponse): void;

/**
 * Output a structured JSON error and exit.
 */
export function jsonError(
  message: string,
  suggestions?: Suggestion[],
  code?: ErrorCode,
): never;

/** Parse raw CLI output (string or object) into a typed result. */
export function parseResponse(
  raw: unknown,
): CLIResponse | CLIError | CLIUnsupportedError;

/** Type guard: returns true if result is an error. */
export function isError(
  result: unknown,
): result is CLIError | CLIUnsupportedError;

/**
 * Assert a specific response type. Throws on error or type mismatch. Narrows
 * the returned `type` to the expected literal; `data` stays `unknown` — import
 * the per-command response type when you need a precise payload.
 */
export function assertResponse<T extends string>(
  raw: unknown,
  type: T,
): CLIResponse & {type: T};

declare global {
  namespace NodeJS {
    interface Process {
      __xdsJsonHandled?: boolean;
    }
  }
}

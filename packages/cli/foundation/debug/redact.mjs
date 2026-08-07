// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Scrubbing pass applied to every recorded value before it is written.
 *
 * Recorded events capture real argv, real option values, and real error
 * messages, so they can carry things a usage record has no business keeping:
 * absolute paths that contain a person's name, an email in a git remote, an
 * API key someone passed as a flag value. This module removes the obvious
 * classes of that before an event reaches the project's handler — which may
 * well forward it somewhere less private than this machine.
 *
 * Scrubbing is deliberately conservative about SHAPE: a redacted value keeps
 * its type and rough length so aggregate queries ("how many people pass
 * --out?") still work on scrubbed data. It replaces content, not structure.
 *
 * @input  arbitrary argv/option/error values
 * @output the same shape with sensitive content replaced by stable markers
 * @position packages/cli/foundation/debug — scrubbing
 */

import * as os from 'node:os';
import * as path from 'node:path';

/** Replacement for a value removed wholesale. */
export const REDACTED = '[redacted]';

/**
 * Longest string kept verbatim in a recorded value.
 *
 * A size guard rather than a privacy one. One long argument lands in `argv`,
 * `args`, the error message, AND the stack — roughly quadrupling — so a
 * pathological value would otherwise dominate the whole event. Clamping per
 * value keeps the record, and the fact that the value was huge.
 */
export const MAX_VALUE_CHARS = 2048;

/**
 * Option/field names whose VALUE is always removed, matched case-insensitively
 * as a substring. Deliberately broad — a false positive costs one unusable
 * field in a usage log; a false negative writes a live credential to disk.
 */
const SENSITIVE_KEY_PARTS = [
  'auth',
  'credential',
  'cookie',
  'jwt',
  'passwd',
  'password',
  'private',
  'secret',
  'session',
  'signature',
  'token',
];

/** `--flag=value` / `KEY=value` where the key half looks sensitive. */
const ASSIGNMENT_RE = /^(--?[\w-]*(?:auth|credential|cookie|jwt|passwd|password|private|secret|session|signature|token)[\w-]*|[\w.]*(?:AUTH|CREDENTIAL|COOKIE|JWT|PASSWD|PASSWORD|PRIVATE|SECRET|SESSION|SIGNATURE|TOKEN)[\w.]*)=(.*)$/i;

/** Well-known credential formats worth catching wherever they appear. */
const CREDENTIAL_PATTERNS = [
  // GitHub personal access / OAuth / app tokens.
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  // Slack tokens.
  /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g,
  // AWS access key ids.
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  // Generic "Bearer <token>".
  /\bBearer\s+[A-Za-z0-9._~+/-]{16,}=*/gi,
  // JSON Web Tokens.
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
  // OpenAI-style keys.
  /\bsk-[A-Za-z0-9]{20,}\b/g,
];

/** Credentials embedded in a URL's userinfo component. */
const URL_USERINFO_RE = /(\b[a-z][a-z0-9+.-]*:\/\/)[^/\s:@]+(?::[^/\s@]*)?@/gi;

/** Email addresses. */
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/**
 * Does this key name mean "the value is a secret"?
 * @param {string | undefined} key
 * @returns {boolean}
 */
export function isSensitiveKey(key) {
  if (!key) return false;
  const lower = String(key).toLowerCase();
  return SENSITIVE_KEY_PARTS.some(part => lower.includes(part));
}

/**
 * Rewrite absolute paths so they carry structure but not identity: the home
 * directory becomes `~`, and a path inside the current project becomes a
 * project-relative one. A path outside both keeps only its last two segments,
 * which is enough to tell `/…/themes/ocean.ts` from `/…/src/App.tsx` without
 * revealing where on the machine it lives.
 *
 * @param {string} value
 * @param {{home: string, cwd: string}} ctx
 * @returns {string}
 */
function scrubPaths(value, ctx) {
  let out = value;

  if (ctx.cwd && out.includes(ctx.cwd)) {
    out = out.split(ctx.cwd).join('.');
  }
  if (ctx.home && out.includes(ctx.home)) {
    out = out.split(ctx.home).join('~');
  }

  // Any absolute path still standing is outside both anchors — keep the tail
  // so the shape of the operation survives, drop the machine-specific prefix.
  out = out.replace(/(^|\s)(\/[^\s:;,"']{2,})/g, (match, lead, abs) => {
    const parts = String(abs).split('/').filter(Boolean);
    if (parts.length <= 2) return match;
    return `${lead}${path.posix.join('/…', ...parts.slice(-2))}`;
  });

  return out;
}

/**
 * Apply every content rule to a single string.
 * @param {string} value
 * @param {{home: string, cwd: string}} ctx
 * @returns {string}
 */
function scrubString(value, ctx) {
  let out = value;

  for (const pattern of CREDENTIAL_PATTERNS) {
    out = out.replace(pattern, REDACTED);
  }
  out = out.replace(URL_USERINFO_RE, (_m, scheme) => `${scheme}${REDACTED}@`);
  out = out.replace(EMAIL_RE, REDACTED);

  // `--token=abc` / `GITHUB_TOKEN=abc` survive the patterns above when the
  // value is an unrecognized format, so drop the right-hand side by key name.
  const assignment = out.match(ASSIGNMENT_RE);
  if (assignment) {
    out = `${assignment[1]}=${REDACTED}`;
  }

  return scrubPaths(out, ctx);
}

/**
 * Clamp one string to {@link MAX_VALUE_CHARS}, noting what was dropped so the
 * record still shows that the original was oversized.
 * @param {string} value
 * @param {number} max
 * @returns {string}
 */
function clamp(value, max) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…[+${value.length - max} chars]`;
}

/**
 * A sanitizing function bound to one machine + project.
 * @typedef {(value: unknown, key?: string) => unknown} Redactor
 */

/**
 * Build a {@link Redactor}.
 *
 * @param {object} [options]
 * @param {boolean} [options.enabled] - Test seam: false skips the content
 *   rules while still applying the depth and length limits.
 * @param {string} [options.home] - overridable for tests.
 * @param {string} [options.cwd] - overridable for tests.
 * @param {number} [options.maxLength] - Per-value character cap.
 * @returns {Redactor}
 */
export function createRedactor({
  enabled = true,
  home,
  cwd,
  maxLength = MAX_VALUE_CHARS,
} = {}) {
  /** @type {{home: string, cwd: string}} */
  const ctx = {
    home: home ?? safeHomedir(),
    cwd: cwd ?? safeCwd(),
  };

  /**
   * @param {unknown} value
   * @param {string} [key]
   * @param {number} [depth]
   * @returns {unknown}
   */
  const redact = (value, key, depth = 0) => {
    // Bail out well before a pathological object can stall a command.
    if (depth > 6) return REDACTED;
    if (value == null) return value;
    if (enabled && isSensitiveKey(key)) return REDACTED;

    if (typeof value === 'string') {
      return clamp(enabled ? scrubString(value, ctx) : value, maxLength);
    }
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.map(v => redact(v, key, depth + 1));

    if (typeof value === 'object') {
      /** @type {Record<string, unknown>} */
      const out = {};
      for (const [k, v] of Object.entries(/** @type {object} */ (value))) {
        // `out[k] = …` would invoke the prototype setter for `__proto__`,
        // silently reparenting `out` and dropping the field. defineProperty
        // writes it as an ordinary own property, so a hostile key is recorded
        // as data instead of changing the shape of the record.
        Object.defineProperty(out, k, {
          value: redact(v, k, depth + 1),
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
      return out;
    }

    // Functions, symbols, bigints — record the type, never the value.
    return `[${typeof value}]`;
  };

  return (value, key) => redact(value, key, 0);
}

/** @returns {string} */
function safeHomedir() {
  try {
    return os.homedir() || '';
  } catch {
    return '';
  }
}

/** @returns {string} */
function safeCwd() {
  try {
    return process.cwd();
  } catch {
    return '';
  }
}

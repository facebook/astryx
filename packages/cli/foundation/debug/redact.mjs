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
 * as a substring of the name with `-` and `_` stripped, so `apiKey`,
 * `api-key` and `API_KEY` are one entry. Deliberately broad — a false positive
 * costs one unusable field in a usage log; a false negative writes a live
 * credential to disk.
 *
 * Substring matching is why `key` and `pat` are not in here: they would take
 * `--keyboard`, `--sortkey` and, worse, `--path` with them. Those live in
 * {@link SENSITIVE_KEY_EXACT} instead.
 */
const SENSITIVE_KEY_PARTS = [
  'accesskey',
  'apikey',
  'auth',
  'bearer',
  'credential',
  'cookie',
  'jwt',
  'passphrase',
  'passwd',
  'password',
  'private',
  'secret',
  'session',
  'signature',
  'token',
];

/**
 * Names that are sensitive on their own but are substrings of ordinary words,
 * so they are matched WHOLE (again after stripping `-`/`_`).
 *
 * These apply only where a name was GIVEN to us — an object field, a declared
 * option, a `--flag` — never to a bare `word=value` found in text. See
 * {@link isSensitiveKey}'s `flagged` parameter for why.
 */
const SENSITIVE_KEY_EXACT = new Set([
  'creds',
  'key',
  'pat',
  'pw',
  'pwd',
  'sig',
]);

/** Flags whose NEXT argv element is the value, e.g. `--token hunter2`. */
const SENSITIVE_FLAG_RE = /^--?([\w-]{1,64})$/;

/**
 * `--flag=value` / `KEY=value`, ANY key. Whether the key is sensitive is
 * decided per match by {@link isSensitiveKey}, not encoded in the pattern —
 * one keyword list, and `--api-key`, `--api_key` and `--apiKey` are all the
 * same entry instead of three alternations to keep in step.
 *
 * Global and unanchored, because the same text arrives twice: once as its own
 * argv element, and again quoted inside an error message, a stack frame and
 * the captured stderr — `error: unknown option '--token=…'`. An anchored rule
 * scrubs the first and leaves the other three, which is the same secret,
 * written to the same record.
 *
 * The key half is BOUNDED. An unbounded `[\w-]*` before a keyword makes an
 * unanchored scan quadratic, and this runs over captured output that can be
 * tens of kilobytes — 500KB of word characters followed by `token=` took over
 * seven minutes. 128 is past any real flag or environment variable name, and
 * a bound is what keeps the scan linear; the cost of a longer one is only the
 * work done per candidate.
 *
 * The value half takes an optional matching quote, so `--token="s"` and the
 * JSON spelling `"token":"s"` lose their value like the bare form. Without it
 * the value stops AT the opening quote and the secret survives with quotes
 * around it, which is the shape a config blob or a quoted shell argument
 * arrives in.
 */
const ASSIGNMENT_RE =
  /(--?[\w-]{1,128}|"[\w.-]{1,128}"|[\w.]{1,128})(\s*[=:]\s*)("[^"]*"|'[^']*'|[^\s'"`,}\]]*)/g;

/** Well-known credential formats worth catching wherever they appear. */
const CREDENTIAL_PATTERNS = [
  // GitHub personal access / OAuth / app tokens.
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  // GitLab personal access tokens.
  /\bglpat-[A-Za-z0-9_-]{16,}/g,
  // Slack tokens.
  /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/g,
  // AWS access key ids.
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
  // Generic "Bearer <token>".
  /\bBearer\s+[A-Za-z0-9._~+/-]{16,}=*/gi,
  // JSON Web Tokens.
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
  // Anthropic / OpenAI-style keys. The dashed form first: the plain `sk-`
  // rule stops at the first `-` and would leave the rest of the key standing.
  /\bsk-(?:ant|proj|live|test)-[A-Za-z0-9_-]{16,}/g,
  /\bsk-[A-Za-z0-9]{20,}\b/g,
  // Stripe secret / restricted keys.
  /\b[sr]k_(?:live|test)_[A-Za-z0-9]{10,}\b/g,
  // Google API keys.
  /\bAIza[A-Za-z0-9_-]{35}\b/g,
  // npm automation tokens.
  /\bnpm_[A-Za-z0-9]{30,}\b/g,
  // Hugging Face.
  /\bhf_[A-Za-z0-9]{30,}\b/g,
  // SendGrid.
  /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g,
  // Twilio account / api sids.
  /\b(?:AC|SK)[0-9a-f]{32}\b/g,
  // A PEM private key, however it was line-wrapped.
  /-----BEGIN[A-Z ]*PRIVATE KEY-----[\s\S]*?-----END[A-Z ]*PRIVATE KEY-----/g,
];

/**
 * Shortest string worth measuring for randomness, and the alphabet a candidate
 * may be built from.
 *
 * `/` is deliberately absent even though base64 uses it: paths are the biggest
 * source of long high-entropy-looking runs, and stopping a candidate at a
 * slash keeps every path segment far below the length floor. A `.` disqualifies
 * a candidate for the same reason — dates, versions and filenames all carry
 * one, and the formats that legitimately contain dots (JWT, SendGrid) have
 * their own rule above.
 */
const ENTROPY_MIN_CHARS = 24;
const HIGH_ENTROPY_CANDIDATE_RE = new RegExp(
  `[A-Za-z0-9+=_-]{${ENTROPY_MIN_CHARS},512}`,
  'g',
);

/**
 * Shannon entropy in bits per character.
 * @param {string} value
 * @returns {number}
 */
function entropyBits(value) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const ch of value) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let bits = 0;
  for (const n of counts.values()) {
    const p = n / value.length;
    bits -= p * Math.log2(p);
  }
  return bits;
}

/**
 * Is this standalone word a credential nobody gave us a name for?
 *
 * The documented hole in the first version of this module: a secret passed as
 * a bare argument — `astryx docs <token>` — has no key to match, no flag in
 * front of it, and no recognizable prefix, so every rule above misses it and
 * it lands in `args`, the error message and the captured stderr at once.
 * Randomness is the only signal left.
 *
 * The threshold scales with length because Shannon entropy is bounded by
 * log2(length) for a short sample: a 24-character random token cannot score
 * above 4.58 however random it is. Capping the reference at 32 stops the bar
 * rising past what a real token reaches.
 *
 * That single measurement is the whole rule, deliberately. Character-class
 * gates are the obvious way to protect commit shas and CamelCase identifiers,
 * and every one that was tried here turned out to be either dead — the
 * threshold already excluded the thing it was aimed at, by 0.2 bits or more —
 * or actively harmful: "must contain a digit" throws away a letters-only
 * passphrase, and "three of four character classes" throws away a
 * lowercase-alphanumeric token, both of which are exactly what this is for.
 * What keeps ordinary strings safe is the margin, so the margin is what the
 * tests pin: a table of shas, uuids, component names, branch names, class
 * names and versions that must survive verbatim.
 *
 * @param {string} word
 * @returns {boolean}
 */
function looksLikeSecret(word) {
  // The length floor lives in HIGH_ENTROPY_CANDIDATE_RE, which is what
  // produces every word this ever sees.
  return entropyBits(word) >= 0.9 * Math.log2(Math.min(word.length, 32));
}

/** Credentials embedded in a URL's userinfo component. */
const URL_USERINFO_RE = /(\b[a-z][a-z0-9+.-]*:\/\/)[^/\s:@]+(?::[^/\s@]*)?@/gi;

/** Email addresses. */
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/**
 * Does this key name mean "the value is a secret"?
 *
 * @param {string | undefined} key
 * @param {boolean} [named] - Was this name GIVEN to us — an object field, a
 *   declared option, an explicit `--flag` — rather than guessed from text?
 *   The short whole-word names only apply when it was.
 *
 *   `key` is the one that forces the distinction. As a declared option name it
 *   plausibly holds a credential, but as a bare `key=` in captured output it is
 *   overwhelmingly ordinary: every React example the CLI prints contains
 *   `<Avatar key={user.id}>`, and `astryx --help` documents its own output
 *   format as aligned `key: value` lines. Applying the whole-word set to text
 *   redacted both — the feature eating the answers it exists to record. `pwd`
 *   is the same story with shell output.
 * @returns {boolean}
 */
export function isSensitiveKey(key, named = true) {
  if (!key) return false;
  const lower = String(key).toLowerCase().replace(/[-_]/g, '');
  if (named && SENSITIVE_KEY_EXACT.has(lower)) return true;
  return SENSITIVE_KEY_PARTS.some(part => lower.includes(part));
}

/**
 * Scrub an argv array, where a flag and its value are two separate elements.
 *
 * `redact` walks a plain array element by element with no key context, so
 * `['--token', 'hunter2']` reaches it as two ordinary strings and the second
 * one matches nothing. `--flag value` is the ordinary CLI spelling, and it
 * would be perverse for `options` to redact what `argv` prints in full.
 *
 * @param {string[]} argv
 * @param {Redactor} redact
 * @returns {unknown[]}
 */
export function redactArgv(argv, redact) {
  if (!Array.isArray(argv)) return /** @type {any} */ (redact(argv));
  let sensitiveNext = false;
  return argv.map(element => {
    const wasFlagged = sensitiveNext;
    const flag =
      typeof element === 'string' ? element.match(SENSITIVE_FLAG_RE) : null;
    sensitiveNext = Boolean(flag && isSensitiveKey(flag[1]));
    // A flag's own name is never the secret; the element AFTER it is.
    return wasFlagged ? REDACTED : redact(element);
  });
}

/**
 * Rewrite absolute paths so they carry structure but not identity: the home
 * directory becomes `~`, and a path inside the current project becomes a
 * project-relative one. A path outside both keeps only its last two segments,
 * which is enough to tell `/…/themes/ocean.ts` from `/…/src/App.tsx` without
 * revealing where on the machine it lives.
 *
 * @param {string} value
 * @param {{home: string, cwd: string, user: RegExp | null}} ctx
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
  //
  // The lead alternation matters as much as the path itself: the paths that
  // carry a username are the ones in a stack frame, and those arrive wrapped —
  // `at cliError (file:///Users/someone/…/redact.mjs:12:5)`. Anchoring on
  // whitespace alone leaves every one of them intact. A bare `:` leads too,
  // for the second and later entries of a `PATH`-style list, but not when it
  // starts a `://` scheme — that would chew the tail off every URL.
  out = out.replace(
    /(^|[\s"'`([{<=,;]|:(?!\/\/)|file:\/\/)(\/[^\s:;,"'`)\]}>]{2,})/g,
    (match, lead, abs) => {
      const parts = String(abs).split('/').filter(Boolean);
      if (parts.length <= 2) return match;
      return `${lead}${path.posix.join('/…', ...parts.slice(-2))}`;
    },
  );

  // The same rule for a Windows path. The posix rule cannot see one — no
  // leading `/`, backslash separators — so on Windows every absolute path in
  // a stack trace or an error message survived whole.
  out = out.replace(
    /(^|[\s"'`([{<=,;])([A-Za-z]:\\|\\\\)([^\s"'`)\]}>]{2,})/g,
    (match, lead, root, rest) => {
      const parts = String(rest).split('\\').filter(Boolean);
      if (parts.length <= 2) return match;
      return `${lead}${root}…\\${parts.slice(-2).join('\\')}`;
    },
  );

  // Whatever is left, the username can still be sitting in the middle of it:
  // `/mnt/corp/alice/notes.txt` collapses to `/…/alice/notes.txt`, which keeps
  // exactly the segment worth losing. Home-relative rewriting only catches the
  // paths that start at home.
  if (ctx.user) {
    out = out.replace(ctx.user, REDACTED);
  }

  return out;
}

/**
 * Apply every content rule to a single string.
 * @param {string} value
 * @param {{home: string, cwd: string, user: RegExp | null}} ctx
 * @returns {string}
 */
function scrubString(value, ctx) {
  let out = value;

  for (const pattern of CREDENTIAL_PATTERNS) {
    out = out.replace(pattern, REDACTED);
  }
  out = out.replace(URL_USERINFO_RE, (_m, scheme) => `${scheme}${REDACTED}@`);
  out = out.replace(EMAIL_RE, REDACTED);

  // `--token=abc` / `GITHUB_TOKEN=abc` / `"token": "abc"` survive the patterns
  // above when the value is an unrecognized format, so drop the right-hand
  // side by key name. The separator test is the cheap way out: a string with
  // neither skips the scan entirely.
  if (out.includes('=') || out.includes(':')) {
    out = out.replace(ASSIGNMENT_RE, (whole, key, sep, value) => {
      const raw = String(key);
      const flagged = raw.startsWith('-');
      const name = raw.replace(/^--?/, '').replace(/^"|"$/g, '');
      // A `--flag=` is a name someone chose for an option; a bare `word=` is
      // whatever the text happened to contain. Only the first earns the short
      // whole-word names.
      if (!isSensitiveKey(name, flagged)) return whole;
      // Keep the value's quoting so the surrounding shape — a JSON blob, a
      // quoted shell argument — still parses as what it was.
      const q = /^["']/.test(value) ? value[0] : '';
      return `${key}${sep}${q}${REDACTED}${q}`;
    });
  }

  out = scrubPaths(out, ctx);

  // Last, because everything above gives a secret a name, a prefix or a
  // position to be recognized by, and this is what is left when it has none:
  // a bare argument that is simply too random to be anything else. Running it
  // after path scrubbing matters — an absolute path is already collapsed to
  // `/…/two/segments` by then, so it cannot look like one long random run.
  if (out.length >= ENTROPY_MIN_CHARS) {
    out = out.replace(HIGH_ENTROPY_CANDIDATE_RE, word =>
      looksLikeSecret(word) ? REDACTED : word,
    );
  }

  return out;
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
 * @param {string} [options.user] - overridable for tests.
 * @param {number} [options.maxLength] - Per-value character cap.
 * @returns {Redactor}
 */
export function createRedactor({
  enabled = true,
  home,
  cwd,
  user,
  maxLength = MAX_VALUE_CHARS,
} = {}) {
  /** @type {{home: string, cwd: string, user: RegExp | null}} */
  const ctx = {
    home: home ?? safeHomedir(),
    cwd: cwd ?? safeCwd(),
    user: usernamePattern(user ?? safeUsername()),
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

/** @returns {string} */
function safeUsername() {
  try {
    return os.userInfo().username || '';
  } catch {
    return '';
  }
}

/**
 * A whole-word matcher for the machine's username, or null when there is
 * nothing safe to match.
 *
 * Short names are skipped: a two-character username matches inside half the
 * words in a help screen, and mangling ordinary output to hide something
 * already visible in the home path is a bad trade. Names that ARE ordinary
 * words are skipped for the same reason.
 *
 * @param {string} name
 * @returns {RegExp | null}
 */
function usernamePattern(name) {
  const value = String(name ?? '');
  if (value.length < 3 || COMMON_WORD_USERNAMES.has(value.toLowerCase())) {
    return null;
  }
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![A-Za-z0-9_-])${escaped}(?![A-Za-z0-9_-])`, 'gi');
}

/**
 * Usernames that are also ordinary words. Replacing these would corrupt help
 * text and error messages far more than it protects.
 */
const COMMON_WORD_USERNAMES = new Set([
  'admin',
  'build',
  'core',
  'dev',
  'docs',
  'node',
  'root',
  'test',
  'user',
  'www',
]);

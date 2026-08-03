// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The CLI's human-output formatters.
 *
 * The mental model: `--json` is the source of truth, and the plain-text output
 * is just a human-readable projection of that same JSON. So the core renderers
 * take JSON-native values (objects, arrays of objects, string arrays) directly
 * and turn them into readable text — a command shouldn't have to hand-map every
 * field. `record(obj)` / `records(arr)` are the workhorses; you mostly just pick
 * which fields to show and in what order.
 *
 * Constraints (deliberately narrow):
 *   - Plain ASCII only. No color, no TTY detection, no width wrapping. Output is
 *     byte-for-byte deterministic whether printed or piped to an agent.
 *   - Renderers return an opaque {@link Block}; `emit` accepts ONLY Blocks, so a
 *     stray string can't leak onto stdout (the compiler rejects `emit('x')`).
 *     `emit` is the one stdout sink; errors/warnings go to stderr via
 *     cli-error.mjs, never here.
 *   - Field names in the text mirror the JSON keys 1:1, so every field is
 *     greppable (`grep '^description:'`) and the two views stay in sync.
 */

import {humanLog} from '../../../foundation/response/json.mjs';

/**
 * Shared ASCII vocabulary — used here and by stderr diagnostics (cli-error.mjs)
 * so the whole CLI speaks one plain-text dialect. ASCII on purpose: renders
 * identically in every terminal, pager, and captured log.
 */
export const ARROW = '->';
export const BULLET = '-';
export const ERR = '!!';
export const WARN = '!';

/**
 * An opaque, renderer-produced block of output. Nominal via a private field:
 * nothing outside this file can construct one, so `emit` can trust that whatever
 * it receives came from a renderer (a plain string is not assignable to Block).
 */
export class Block {
  /** @type {string} */
  #text;
  /** @param {string} text */
  constructor(text) {
    this.#text = text;
  }
  /** @returns {string} */
  toString() {
    return this.#text;
  }
}

/**
 * Anything `emit` accepts: a Block, or a falsy value so callers can inline
 * conditionals (`cond && section(...)`). Falsy entries are dropped; a raw string
 * is intentionally NOT assignable.
 * @typedef {Block | false | null | undefined} Emittable
 */

/**
 * Options shared by {@link record} and {@link records}.
 * @typedef {object} RecordOptions
 * @property {string[]} [fields] - Keys to show, in order. Missing/empty keys are
 *   skipped. Defaults to the object's own keys.
 * @property {string[]} [omit] - Keys to exclude (when `fields` is not given).
 * @property {Record<string, string>} [labels] - Rename a key for display.
 * @property {Record<string, (value: any) => string>} [format] - Transform a
 *   value before rendering (e.g. prefix a command with the package manager).
 */

/** @param {unknown} v @returns {boolean} */
function isEmpty(v) {
  return (
    v === null ||
    v === undefined ||
    v === '' ||
    (Array.isArray(v) && v.length === 0)
  );
}

/** @param {unknown} v @returns {string} */
function renderValue(v) {
  if (Array.isArray(v)) return v.map(x => String(x)).join(', ');
  return String(v);
}

/**
 * Normalize common non-ASCII typography to ASCII so human output stays plain and
 * consistent no matter what the source data contains (em/en dashes -> "-", curly
 * quotes -> straight, ellipsis -> "...", non-breaking space -> space). The
 * the verbatim renderer (code) deliberately skips this. `--json` is
 * unaffected — it always carries the original data.
 * @param {string} s
 * @returns {string}
 */
function toAscii(s) {
  return String(s)
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ');
}

/**
 * A group label, optionally with an explanatory subtitle rendered on the line(s)
 * directly beneath the heading (no blank line between). Whatever list/records
 * follow are separate blocks, so emit's blank line separates them from the
 * header + subtitle.
 * @param {string} heading
 * @param {string} [subtitle]
 * @returns {Block}
 */
export function section(heading, subtitle) {
  return new Block(toAscii(subtitle ? `${heading}\n${subtitle}` : String(heading)));
}

/**
 * A prose block, printed as-is (no wrapping). Multi-line strings kept verbatim.
 * @param {string} content
 * @returns {Block}
 */
export function text(content) {
  return new Block(toAscii(String(content)));
}

/**
 * A bulleted list of primitives (e.g. a string array). Each item is a string or
 * an array of lines (first line is the head, the rest hang-indent). For arrays
 * of OBJECTS use {@link records} instead.
 * @param {Array<string | string[]>} items
 * @returns {Block}
 */
export function list(items) {
  const hang = ' '.repeat(BULLET.length + 1);
  const rendered = items.map(item => {
    const lines = Array.isArray(item) ? item : String(item).split('\n');
    const [head = '', ...rest] = lines;
    return [`${BULLET} ${head}`, ...rest.map(l => `${hang}${l}`)].join('\n');
  });
  const multiline = rendered.some(r => r.includes('\n'));
  return new Block(toAscii(rendered.join(multiline ? '\n\n' : '\n')));
}

/**
 * Render a JSON object as aligned `key: value` lines — the readable projection
 * of that object. Values: strings as-is, arrays comma-joined, other primitives
 * String()'d; empty/missing fields are skipped. Field names mirror the JSON keys
 * so the output is greppable and maps 1:1 to `--json`.
 * @param {any} obj
 * @param {RecordOptions} [options]
 * @returns {Block}
 */
export function record(obj, options = {}) {
  const src = /** @type {Record<string, unknown>} */ (obj);
  const keys = (options.fields ?? Object.keys(src)).filter(
    k => !options.omit?.includes(k) && !isEmpty(src[k]),
  );
  /** @param {string} k */
  const label = k => options.labels?.[k] ?? k;
  const keyWidth = keys.reduce((max, k) => Math.max(max, label(k).length), 0);
  const lines = keys.map(k => {
    const fmt = options.format?.[k];
    const value = fmt ? fmt(src[k]) : renderValue(src[k]);
    return `${`${label(k)}:`.padEnd(keyWidth + 2)}${value}`;
  });
  return new Block(toAscii(lines.join('\n')));
}

/**
 * Render an array of JSON objects as {@link record}s, one per object, separated
 * by a blank line. The single easiest way to turn `data.results` (or any object
 * array) into readable text.
 * @param {any[]} items
 * @param {RecordOptions} [options]
 * @returns {Block}
 */
export function records(items, options = {}) {
  const blocks = items.map(o => record(o, options).toString()).filter(Boolean);
  return new Block(blocks.join('\n\n'));
}

/**
 * A verbatim block — source dumps, layout skeletons, or a markdown doc. Output
 * is byte-for-byte (NOT ASCII-normalized), so it survives piping
 * (`astryx template X > file.tsx`) and preserves doc/source content exactly.
 * @param {string} source
 * @param {{lang?: string}} [_options] - Reserved (intent label); output verbatim.
 * @returns {Block}
 */
export function code(source, _options = {}) {
  return new Block(String(source));
}

/**
 * @param {Emittable} b
 * @returns {b is Block}
 */
function isBlock(b) {
  return b instanceof Block;
}

/**
 * The one sanctioned way to write human output to stdout. Joins blocks with a
 * single blank line and hands the result to `humanLog`, which is a no-op in
 * `--json` mode (stdout carries only the envelope there). Accepts only Blocks
 * (plus falsy placeholders); a bare string will not type-check.
 * @param {Emittable[]} blocks
 * @returns {void}
 */
export function emit(...blocks) {
  const body = blocks
    .filter(isBlock)
    .map(b => b.toString())
    .filter(s => s.length > 0)
    .join('\n\n');
  humanLog(body);
}

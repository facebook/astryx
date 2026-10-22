// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Which files and folders an operation read, so a long-running caller
 * can tell whether its inputs changed since.
 *
 * @input An operation run inside `recordReads(seen, fn)`.
 * @output `seen` gets every file whose content the operation read through fs
 *   and every folder it listed or probed, each with its state when first
 *   read; `unchangedSince(seen)` says whether all are still in that state.
 * @position Used by search's adapter to reuse a gathered catalog only while
 *   it is exact. Outside `recordReads` nothing is recorded and every fs call
 *   behaves as before.
 */

import {AsyncLocalStorage} from 'node:async_hooks';
import {createRequire, syncBuiltinESMExports} from 'node:module';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * The paths the running operation touched: every file it read and every
 * folder it listed or probed.
 * @type {AsyncLocalStorage<Map<string, string>>}
 */
const reads = new AsyncLocalStorage();

/** node:fs's module object, whose functions every import of it shares. */
const fs = createRequire(import.meta.url)('node:fs');

/** The fs reads whose path argument is recorded. */
const RECORDED = [
  'readFileSync',
  'readdirSync',
  'statSync',
  'lstatSync',
  'existsSync',
  'realpathSync',
  'accessSync',
  'openSync',
];

/** The reads that see a file's content, so the file itself is checked. */
const CONTENT_READS = new Set(['readFileSync', 'openSync']);

let recording = false;

/** fs.statSync as loaded, before installRecorder wraps it. */
const statSyncRaw = fs.statSync;

/**
 * Wrap fs's read calls once so that, inside `reads.run`, each path they are
 * given is added to that run's set. Outside a run they behave exactly as
 * before.
 */
function installRecorder() {
  if (recording) return;
  recording = true;
  for (const name of RECORDED) {
    const original = fs[name];
    if (typeof original !== 'function') continue;
    /**
     * @this {unknown}
     * @param {...any} args
     */
    const wrapped = function (...args) {
      const seen = reads.getStore();
      const target = args[0];
      if (seen && (typeof target === 'string' || target instanceof URL)) {
        const file =
          typeof target === 'string'
            ? path.resolve(target)
            : fileURLToPath(target);
        // A file read is checked itself; a probe or listing is checked by its
        // folder, whose time changes when an entry is added, removed or
        // renamed.
        const checked =
          CONTENT_READS.has(name) || name === 'readdirSync'
            ? file
            : path.dirname(file);
        // Its state is taken when it is first read, before the read, so a
        // change made while the operation runs shows as a change afterwards.
        if (!seen.has(checked)) seen.set(checked, stateOf(checked));
      }
      return original.apply(this, args);
    };
    Object.assign(wrapped, original);
    fs[name] = wrapped;
  }
  // ESM imports of node:fs see the wrapped functions too.
  syncBuiltinESMExports();
}

/**
 * One path's state: its change time and size, or that it is absent.
 * @param {string} file
 * @returns {string}
 */
function stateOf(file) {
  try {
    const stat = statSyncRaw(file);
    return `${stat.mtimeMs}\0${stat.size}`;
  } catch {
    return '-';
  }
}

/**
 * Whether every recorded path is still in the state it had when it was read.
 * @param {Map<string, string>} recorded - From recordReads.
 * @returns {boolean}
 */
export function unchangedSince(recorded) {
  for (const [file, state] of recorded) {
    if (stateOf(file) !== state) return false;
  }
  return true;
}

/**
 * Run `fn`, adding to `seen` each path it reads, with that path's state when
 * it was first read (see the file header).
 * @template T
 * @param {Map<string, string>} seen
 * @param {() => T} fn
 * @returns {T}
 */
export function recordReads(seen, fn) {
  installRecorder();
  return reads.run(seen, fn);
}

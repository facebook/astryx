// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pluggable config/discovery cache for the Project API.
 *
 * The Project class memoizes resolved discovery (components, templates,
 * codemods, config) behind a small key/value cache so the same work is never
 * repeated within a single Project instance. The cache interface is
 * intentionally tiny — `get(key)` / `set(key, value)` — so a future
 * file-backed, cross-process cache can drop in with NO API change.
 *
 * Cache keys are derived from a CONTENT HASH of the project's config file
 * (see {@link configContentHash}) combined with the cwd and the
 * discovery-kind (+ args). The in-memory implementation never busts on a
 * content change, but the hash is computed regardless so a hash-busting,
 * file-backed cache works against the exact same key path.
 *
 * @typedef {Object} ConfigCache
 * @property {(key: string) => unknown} get
 * @property {(key: string, value: unknown) => void} set
 */

import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

/**
 * Stable sentinel hash used when there is no config file (or it can't be
 * read). Keeps key derivation total — every cwd still produces a key.
 */
export const NO_CONFIG_HASH = 'no-config';

/**
 * Compute a stable content hash for a config file. Reads the file bytes and
 * returns their sha256 hex digest; a missing/unreadable file yields
 * {@link NO_CONFIG_HASH}. The hash is the bust signal a future file-backed
 * cache would key on.
 *
 * @param {string | null | undefined} configPath absolute config path, or null
 * @returns {string}
 */
export function configContentHash(configPath) {
  if (!configPath) return NO_CONFIG_HASH;
  try {
    const bytes = fs.readFileSync(configPath);
    return crypto.createHash('sha256').update(bytes).digest('hex');
  } catch {
    return NO_CONFIG_HASH;
  }
}

/**
 * Build a cache key from a config content hash, a cwd, and a discovery kind
 * (already including any args, e.g. `codemods:0.1.0..0.2.0`). The shape is
 * stable so the same inputs always map to the same key.
 *
 * @param {string} hash config content hash
 * @param {string} cwd
 * @param {string} kind discovery kind (+args)
 * @returns {string}
 */
export function cacheKey(hash, cwd, kind) {
  return `${hash}\u0000${cwd}\u0000${kind}`;
}

/**
 * Default in-memory cache. Per-instance by default (the Project creates one in
 * {@link Project.load} when none is supplied), so it behaves like simple
 * memoization. A shared instance can be passed to reuse results across
 * Projects. Never busts — a content change produces a different KEY (via the
 * hash), not an eviction, which is exactly the behavior a future file-backed
 * cache also relies on.
 *
 * @implements {ConfigCache}
 */
export class InMemoryConfigCache {
  /** @type {Map<string, unknown>} */
  #m = new Map();

  /** @param {string} key */
  get(key) {
    return this.#m.get(key);
  }

  /**
   * @param {string} key
   * @param {unknown} value
   */
  set(key, value) {
    this.#m.set(key, value);
  }
}

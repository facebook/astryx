// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file getKey.ts
 * @input Receives an optional id key and required fallback key
 * @output Exports getKey for stable React list keys
 * @position Shared utility; consumed by components that render keyed lists
 */

export type Key = string | number;
export type KeyFallback = Key | (() => Key);

export function getKey(
  idKey: Key | null | undefined,
  fallback: KeyFallback,
): string {
  if (idKey != null) {
    return `id:${idKey}`;
  }

  const fallbackKey = typeof fallback === 'function' ? fallback() : fallback;
  return `fallback:${fallbackKey}`;
}

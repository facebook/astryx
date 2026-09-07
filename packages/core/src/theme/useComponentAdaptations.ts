// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useComponentAdaptations.ts
 * @input One component's authored adaptation policy plus the nearest Theme's
 *   effective width points
 * @output Package-internal React resolver publishing the current policy value
 * @position spec:AST-031 FR3/FR4/IR2. Not exported from the package entry
 *   point: components own their public policy props, this hook resolves them.
 *
 * Contract:
 * - `default` is server truth. `getServerSnapshot` returns the no-match
 *   sentinel, so `matchMedia` is read during neither server rendering nor the
 *   hydration render; the browser's real match arrives on the post-hydration
 *   store read. A policy with no rules resolves to `default` and subscribes to
 *   nothing.
 * - Rule order is precedence: the LAST matching rule wins, regardless of how
 *   specific any condition looks.
 * - Subscription identity is keyed by the COMPILED QUERY STRINGS, not by the
 *   caller's object identity, because the documented usage is an inline
 *   `adaptations={{...}}` literal that is a new object on every render. A
 *   module-level registry shares one connection — one `MediaQueryList` per
 *   distinct query, one listener registration — across every component using
 *   the same queries, and closes it when the last subscriber leaves. Only
 *   `subscribe` ever registers: a render that never commits, a server render
 *   included, leaves the registry untouched.
 *
 * No CSS is emitted and no context is added: the resolver reads the Theme
 * metadata that already exists (spec:AST-031 IR4).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/componentAdaptations.ts (policy shape + compiler)
 * - /packages/core/src/theme/effectiveBreakpoints.ts (width point resolution)
 * - /packages/core/src/theme/useComponentAdaptations.test.tsx
 */

import {useMemo, useSyncExternalStore} from 'react';
import {
  compileComponentAdaptations,
  type ComponentAdaptations,
} from './componentAdaptations';
import {useEffectiveWidthBreakpoints} from './effectiveBreakpoints';

/** No rule matched — the server snapshot and the no-match sentinel. */
const NO_MATCH = -1;

/** Queries never contain NUL, so it cannot collide with query text. */
const QUERY_SEPARATOR = '\u0000';

// =============================================================================
// Shared media-query connections
// =============================================================================

/**
 * What one render hands to `useSyncExternalStore`.
 *
 * A handle is cheap and carries no browser state: it is a stable pair of
 * `subscribe`/`getSnapshot` identities bound to one query key. All browser
 * state lives on the CONNECTION, which is created and registered only when a
 * subscriber actually commits.
 */
interface AdaptationQueryStore {
  /** Joined compiled queries; the registry key. */
  readonly key: string;
  readonly subscribe: (onStoreChange: () => void) => () => void;
  /** Index of the last matching query, or -1. */
  readonly getSnapshot: () => number;
}

/**
 * The live, shared browser state for one query key.
 *
 * Exactly one connection exists per key while anything is subscribed, so N
 * components with identical policies share one set of `MediaQueryList`s and one
 * `change` registration per query.
 */
interface AdaptationQueryConnection {
  readonly key: string;
  readonly queries: ReadonlyArray<string>;
  /**
   * The handle later renders for this key resolve to, so `subscribe` and
   * `getSnapshot` identities stay stable across renders and React does not
   * resubscribe.
   */
  handle: AdaptationQueryStore;
  /** One list per query; empty until `matchMedia` is reachable. */
  lists: MediaQueryList[];
  /**
   * Whether `notify` is attached to `lists`. Tracked explicitly rather than
   * inferred from the listener count: the first subscriber can arrive before
   * `matchMedia` exists (a late polyfill, a jsdom suite installing it after
   * mount), and a later subscriber must then create the lists AND attach —
   * which a "first subscriber attaches" rule silently skips.
   */
  attached: boolean;
  readonly listeners: Set<() => void>;
  readonly notify: () => void;
}

const storeRegistry = new Map<string, AdaptationQueryConnection>();

function canMatchMedia(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  );
}

function lastMatchingIndex(lists: ReadonlyArray<MediaQueryList>): number {
  // Author order is precedence: keep scanning so the LAST match wins.
  let matched = NO_MATCH;
  for (let index = 0; index < lists.length; index++) {
    if (lists[index].matches) {
      matched = index;
    }
  }
  return matched;
}

/**
 * Bring a connection as live as the environment allows, idempotently.
 *
 * Creates the lists once `matchMedia` is reachable and attaches the shared
 * listener once, so a connection opened in a matchMedia-less environment
 * becomes live as soon as anything touches it afterwards.
 */
function activate(connection: AdaptationQueryConnection): MediaQueryList[] {
  if (connection.lists.length === 0 && canMatchMedia()) {
    connection.lists = connection.queries.map(query =>
      window.matchMedia(query),
    );
  }
  if (!connection.attached && connection.lists.length > 0) {
    for (const list of connection.lists) {
      list.addEventListener('change', connection.notify);
    }
    connection.attached = true;
  }
  return connection.lists;
}

function openConnection(
  key: string,
  queries: ReadonlyArray<string>,
  handle: AdaptationQueryStore,
): AdaptationQueryConnection {
  const existing = storeRegistry.get(key);
  if (existing) {
    return existing;
  }

  const listeners = new Set<() => void>();
  const connection: AdaptationQueryConnection = {
    key,
    queries,
    handle,
    lists: [],
    attached: false,
    listeners,
    notify: () => {
      // Copy first: a listener may unsubscribe while being notified.
      for (const listener of [...listeners]) {
        listener();
      }
    },
  };
  storeRegistry.set(key, connection);
  return connection;
}

function closeConnection(connection: AdaptationQueryConnection): void {
  if (connection.attached) {
    for (const list of connection.lists) {
      list.removeEventListener('change', connection.notify);
    }
    connection.attached = false;
  }
  connection.lists = [];
  // Drop the shared entry only while it is still this connection, so a
  // teardown cannot delete a connection someone else already opened.
  if (storeRegistry.get(connection.key) === connection) {
    storeRegistry.delete(connection.key);
  }
}

function createAdaptationQueryStore(
  key: string,
  queries: ReadonlyArray<string>,
): AdaptationQueryStore {
  // Snapshot lists for a handle that has no connection yet — a client render
  // before commit. They carry no listeners and are never registered, so an
  // abandoned render leaves nothing behind.
  let probeLists: MediaQueryList[] | null = null;

  const store: AdaptationQueryStore = {
    key,
    subscribe(onStoreChange) {
      const connection = openConnection(key, queries, store);
      // Re-registration is the point: StrictMode's subscribe → unsubscribe →
      // subscribe closes the connection and this opens a fresh one under the
      // same key, so an identical policy mounting afterwards still shares.
      activate(connection);
      connection.listeners.add(onStoreChange);

      return () => {
        connection.listeners.delete(onStoreChange);
        if (connection.listeners.size === 0) {
          closeConnection(connection);
        }
      };
    },
    getSnapshot() {
      const connection = storeRegistry.get(key);
      if (connection) {
        return lastMatchingIndex(activate(connection));
      }
      if (!canMatchMedia()) {
        return NO_MATCH;
      }
      probeLists ??= queries.map(query => window.matchMedia(query));
      return lastMatchingIndex(probeLists);
    },
  };

  return store;
}

/**
 * The store handle for one compiled query set.
 *
 * Called during render and READ-ONLY with respect to the registry: a render
 * that never commits — a server render, an abandoned concurrent render — must
 * not leave a connection behind, so only `subscribe` ever registers one. Once a
 * connection exists, every later render for the same key resolves to the handle
 * it was opened with, which is what keeps `useSyncExternalStore` from
 * resubscribing when the caller passes a fresh inline policy literal.
 */
function getAdaptationQueryStore(
  queries: ReadonlyArray<string>,
): AdaptationQueryStore {
  const key = queries.join(QUERY_SEPARATOR);
  return (
    storeRegistry.get(key)?.handle ?? createAdaptationQueryStore(key, queries)
  );
}

/** A component without an adaptations policy, or with no rules, subscribes to nothing. */
const EMPTY_STORE: AdaptationQueryStore = {
  key: '',
  subscribe: () => () => {},
  getSnapshot: () => NO_MATCH,
};

function getServerSnapshot(): number {
  return NO_MATCH;
}

/**
 * Live shared-connection count. Test-only; a leaked listener, or a render that
 * wrongly registered without committing, shows up here.
 * @internal
 */
export function getAdaptationStoreCount(): number {
  return storeRegistry.size;
}

/**
 * Close and drop every shared connection so a suite's stubbed `matchMedia`
 * cannot be reached through a connection another test opened. Test-only.
 * @internal
 */
export function resetAdaptationStores(): void {
  for (const connection of [...storeRegistry.values()]) {
    closeConnection(connection);
  }
  storeRegistry.clear();
}

// =============================================================================
// Hook
// =============================================================================

/** Options naming the caller for diagnostics and its admitted value domain. */
export interface UseComponentAdaptationsOptions<T extends string> {
  /**
   * Diagnostic root for validation failures, naming the component and prop —
   * e.g. `<Selector adaptations>`. Rule paths extend it.
   */
  readonly path: string;
  /** The component's closed value domain, rejected against at runtime. */
  readonly values?: ReadonlyArray<T>;
}

/** The resolved policy value and which rule produced it. */
export interface ComponentAdaptationMatch<T> {
  /** Last matching rule's value; `default` on the server and with no match. */
  readonly value: T;
  /** Index of the matching rule, or -1 on the server and with no match. */
  readonly matchedRuleIndex: number;
}

export function useComponentAdaptations<T extends string>(
  adaptations: ComponentAdaptations<T>,
  options: UseComponentAdaptationsOptions<T>,
): ComponentAdaptationMatch<T>;
export function useComponentAdaptations<T extends string>(
  adaptations: ComponentAdaptations<T> | undefined,
  options: UseComponentAdaptationsOptions<T>,
): ComponentAdaptationMatch<T | undefined>;
/**
 * Resolve one component adaptation policy against the current environment.
 *
 * Returns `default` during server rendering and hydration, then the value of
 * the last rule whose condition matches. Conditions resolve against the nearest
 * Theme's effective width points, so a nested Theme can select a different
 * value at the same viewport width.
 *
 * Invalid policies throw with a path-specific message (`<Selector
 * adaptations>.rules[0].when.contrast is not supported.`) rather than silently
 * never matching. Only `undefined` means "no policy"; any other non-object
 * value is rejected.
 *
 * @internal
 */
export function useComponentAdaptations<T extends string>(
  adaptations: ComponentAdaptations<T> | undefined,
  options: UseComponentAdaptationsOptions<T>,
): ComponentAdaptationMatch<T | undefined> {
  const points = useEffectiveWidthBreakpoints();

  // Compiling every render is what keys the subscription on query TEXT: the
  // work is a few string concatenations, and it validates untyped callers on
  // the render that introduces them.
  //
  // The guard tests `!== undefined`, not truthiness: `undefined` is the only
  // value that means "this component has no policy" (an absent prop, or an
  // explicitly spread `undefined`). Every other falsy value — null, false, 0,
  // '', NaN — is an untyped caller's mistake and must reach the compiler's
  // `assertRecord`, which names the prop, rather than silently publishing
  // `undefined` as though no policy had been passed.
  const compiled =
    adaptations !== undefined
      ? compileComponentAdaptations(
          adaptations,
          points,
          options.path,
          options.values,
        )
      : undefined;

  const store =
    compiled !== undefined && compiled.queries.length > 0
      ? getAdaptationQueryStore(compiled.queries)
      : // No policy, or a policy with no rules: nothing can change the answer,
        // so there is nothing to subscribe to and no registry entry to keep.
        EMPTY_STORE;
  const snapshotIndex = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getServerSnapshot,
  );

  const matchedRuleIndex =
    compiled !== undefined &&
    snapshotIndex >= 0 &&
    snapshotIndex < compiled.values.length
      ? snapshotIndex
      : NO_MATCH;
  const value =
    compiled !== undefined
      ? matchedRuleIndex === NO_MATCH
        ? compiled.default
        : compiled.values[matchedRuleIndex]
      : undefined;

  return useMemo(() => ({value, matchedRuleIndex}), [value, matchedRuleIndex]);
}

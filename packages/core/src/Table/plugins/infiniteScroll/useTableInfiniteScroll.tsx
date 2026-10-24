// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableInfiniteScroll.tsx
 * @input Controlled loading, parent render context, Button and IntersectionObserver
 * @output Stable generic TablePlugin and immutable effective-loading render state
 * @position Infinite-scroll module; caller owns rows, transport and errors
 *
 * SYNC: useTableInfiniteScroll.test.tsx, index.ts, ../../useTableInfiniteScroll.doc.mjs
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '../../../Button';
import {useTranslator} from '../../../i18n';
import {spacingVars} from '../../../theme/tokens.stylex';
import {focusForLastInput} from '../../../utils/focusReturn';
import {devWarn} from '../../../utils/devWarning';
import {useInteractionModalityTracking} from '../../../utils/interactionModality';
import type {TablePlugin, TableRenderContext} from '../../types';

export interface UseTableInfiniteScrollConfig {
  /** Whether another batch can be loaded. */
  hasMore: boolean;
  /** Caller-controlled loading; the request latch also contributes busy state. */
  isLoading: boolean;
  /** Complete the batch work before fulfilling. Rows and errors stay caller-owned. */
  onLoadMore: () => Promise<void>;
}

type Request = {
  generation: number;
  settledAt: number | null;
  isSuccessful: boolean;
};
type LoadingSnapshot = Readonly<{isLoading: boolean}>;
type SurfaceSnapshot = Readonly<{
  hasMore: boolean;
  isLoading: boolean;
  version: number;
}>;

function isAdmitted(
  context: TableRenderContext | undefined,
): context is TableRenderContext {
  return (
    context?.mode === 'data' &&
    context.rowModel === 'flat' &&
    context.canLoad === true
  );
}

/** Hook-owned request/store lifetime, independent of the replaceable Table child. */
function createRuntime(
  initial: UseTableInfiniteScrollConfig,
  wake: () => void,
) {
  let snapshot: LoadingSnapshot = Object.freeze({
    isLoading: initial.hasMore && initial.isLoading,
  });
  const serverSnapshot = snapshot;
  let surface: SurfaceSnapshot = Object.freeze({
    hasMore: initial.hasMore,
    isLoading: snapshot.isLoading,
    version: 0,
  });
  const listeners = new Set<() => void>();
  const diagnostics = new Set<string>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const runtime = {
    config: initial,
    context: undefined as TableRenderContext | undefined,
    stopObservation: undefined as (() => void) | undefined,
    request: null as Request | null,
    isActive: true,
    isAutoPaused: false,
    generation: 0,
    commitCount: 0,
    version: 0,
    renderState: {
      subscribe,
      getSnapshot: () => snapshot,
      getServerSnapshot: () => serverSnapshot,
    },
    subscribe,
    getSurface: () => surface,
    diagnose(message: string) {
      if (process.env.NODE_ENV !== 'production' && !diagnostics.has(message)) {
        diagnostics.add(message);
        devWarn('useTableInfiniteScroll', message);
      }
    },
    commit(config: UseTableInfiniteScrollConfig) {
      runtime.config = config;
      runtime.commitCount++;
      const request = runtime.request;
      // Settlement schedules a hook commit. A pre-call false value is never completion.
      if (
        request?.settledAt != null &&
        runtime.commitCount > request.settledAt &&
        !config.isLoading
      ) {
        runtime.request = null;
        if (request.isSuccessful) {
          runtime.isAutoPaused = false;
        }
        runtime.version++;
      }
      const isLoading =
        config.hasMore && (config.isLoading || runtime.request !== null);
      if (snapshot.isLoading !== isLoading) {
        snapshot = Object.freeze({isLoading});
      }
      if (
        surface.hasMore !== config.hasMore ||
        surface.isLoading !== isLoading ||
        surface.version !== runtime.version
      ) {
        surface = Object.freeze({
          hasMore: config.hasMore,
          isLoading,
          version: runtime.version,
        });
        // The hook's commit effect is the only broadcast writer. Render never notifies.
        for (const listener of listeners) {
          listener();
        }
      }
    },
    invoke(isAutomatic: boolean) {
      const {config} = runtime;
      if (
        !runtime.isActive ||
        !isAdmitted(runtime.context) ||
        !config.hasMore ||
        config.isLoading ||
        runtime.request ||
        (isAutomatic && runtime.isAutoPaused)
      ) {
        return;
      }
      const request: Request = {
        generation: runtime.generation,
        settledAt: null,
        isSuccessful: false,
      };
      runtime.request = request;
      runtime.version++;
      // Release loading resources at latch acquisition, even when immediate
      // fulfillment coalesces away a rendered busy phase. Preserve visibility
      // until native reacquisition supplies the post-batch geometry.
      runtime.stopObservation?.();
      wake();
      const settle = (isSuccessful: boolean) => {
        if (
          !runtime.isActive ||
          runtime.generation !== request.generation ||
          runtime.request !== request
        ) {
          return;
        }
        request.isSuccessful = isSuccessful;
        request.settledAt = runtime.commitCount;
        if (!isSuccessful) {
          runtime.isAutoPaused = true;
        }
        runtime.version++;
        wake();
      };
      try {
        const result = config.onLoadMore();
        if (result == null || typeof result.then !== 'function') {
          runtime.request = null;
          runtime.isAutoPaused = true;
          runtime.version++;
          runtime.diagnose(
            'onLoadMore must return a Promise<void>; automatic loading is paused.',
          );
          wake();
          return;
        }
        Promise.resolve(result).then(
          () => settle(true),
          () => settle(false),
        );
      } catch {
        settle(false);
      }
    },
  };
  return runtime;
}
type Runtime = ReturnType<typeof createRuntime>;

const styles = stylex.create({
  surface: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBlock: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-2'],
  },
  sentinel: {height: 1, width: '100%', flexShrink: 0},
});

/** A single surface owns its observer, rearm task and focus-handoff resource. */
function InfiniteScrollSurface({
  runtime,
  context,
}: {
  runtime: Runtime;
  context: TableRenderContext;
}) {
  const view = useSyncExternalStore(
    runtime.subscribe,
    runtime.getSurface,
    runtime.getSurface,
  );
  const t = useTranslator();
  useInteractionModalityTracking();
  const button = useRef<HTMLButtonElement | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const resources = useRef({
    observer: null as IntersectionObserver | null,
    root: null as HTMLDivElement | null,
    node: null as HTMLDivElement | null,
    isVisible: false,
    task: null as ReturnType<typeof setTimeout> | null,
    releaseFocus: null as (() => void) | null,
    context: undefined as TableRenderContext | undefined,
    viewport: null as HTMLDivElement | null,
  });
  const disconnect = useCallback(() => {
    const state = resources.current;
    state.observer?.disconnect();
    state.observer = null;
    if (state.task !== null) {
      clearTimeout(state.task);
    }
    state.task = null;
  }, []);
  const setButton = useCallback(
    (node: HTMLButtonElement | null) => {
      const previous = button.current;
      if (
        node === null &&
        previous &&
        !runtime.config.hasMore &&
        previous.ownerDocument.activeElement === previous
      ) {
        // A parent's ref may detach during this same mutation phase before
        // reattachment. Retain only its last committed, still-connected destination.
        const destination =
          runtime.context?.viewport.current ?? resources.current.viewport;
        if (destination?.isConnected) {
          const needsTabIndex = !destination.hasAttribute('tabindex');
          if (needsTabIndex) {
            resources.current.releaseFocus?.();
            destination.setAttribute('tabindex', '-1');
            const release = () => {
              destination.removeEventListener('blur', release);
              if (destination.getAttribute('tabindex') === '-1') {
                destination.removeAttribute('tabindex');
              }
              resources.current.releaseFocus = null;
            };
            resources.current.releaseFocus = release;
            destination.addEventListener('blur', release, {once: true});
          }
          focusForLastInput(destination, {preventScroll: true});
        }
      }
      button.current = node;
    },
    [runtime],
  );
  const setSentinel = useCallback(
    (node: HTMLDivElement | null) => {
      if (sentinel.current !== node) {
        disconnect();
        resources.current.isVisible = false;
      }
      sentinel.current = node;
    },
    [disconnect],
  );

  useEffect(() => {
    // All parent refs have attached before acquiring native observation.
    // Synchronize committed parent semantic context, not DOM-inferred mode.
    runtime.context = context;
    runtime.stopObservation = disconnect;
    const state = resources.current;
    state.context = context;
    state.viewport = context.viewport.current;
    const root = context.blockViewport?.current ?? null;
    const node = sentinel.current;
    if (state.root !== root || state.node !== node) {
      disconnect();
      state.isVisible = false;
      state.root = root;
      state.node = node;
    }
    const canObserve =
      isAdmitted(context) &&
      view.hasMore &&
      !view.isLoading &&
      !runtime.isAutoPaused;
    if (!canObserve || !node) {
      disconnect();
      if (!view.hasMore) {
        state.isVisible = false;
      }
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      disconnect();
      runtime.diagnose(
        'IntersectionObserver is unavailable; use the manual Load more command.',
      );
      return;
    }
    if (state.observer) {
      return;
    }
    const isRearming = state.isVisible;
    const observer = new IntersectionObserver(
      entries => {
        if (
          state.observer !== observer ||
          state.node !== node ||
          (runtime.context?.blockViewport?.current ?? null) !== root ||
          !runtime.isActive
        ) {
          return;
        }
        for (const entry of entries) {
          if (entry.target !== node) {
            continue;
          }
          state.isVisible = entry.isIntersecting;
          if (!state.isVisible) {
            if (state.task !== null) {
              clearTimeout(state.task);
            }
            state.task = null;
          } else if (isRearming) {
            // Reacquisition's native entry refreshes visibility after appended rows.
            // Never load from stale pre-append geometry or a recursive microtask.
            if (state.task === null) {
              state.task = setTimeout(() => {
                state.task = null;
                if (
                  state.observer === observer &&
                  state.node === node &&
                  state.isVisible
                ) {
                  runtime.invoke(true);
                }
              }, 0);
            }
          } else {
            runtime.invoke(true);
          }
        }
      },
      {root, rootMargin: '0px', threshold: 0},
    );
    state.observer = observer;
    observer.observe(node);
  });
  useLayoutEffect(
    () => () => {
      disconnect();
      resources.current.releaseFocus?.();
      if (runtime.context === resources.current.context) {
        runtime.context = undefined;
      }
      if (runtime.stopObservation === disconnect) {
        runtime.stopObservation = undefined;
      }
    },
    [disconnect, runtime],
  );

  if (!view.hasMore || !isAdmitted(context)) {
    return null;
  }
  return (
    <div {...stylex.props(styles.surface)}>
      <div
        ref={setSentinel}
        {...stylex.props(styles.sentinel)}
        aria-hidden="true"
      />
      <Button
        ref={setButton}
        label={t('@astryx.table.loadMore')}
        isLoading={view.isLoading}
        onClick={() => runtime.invoke(false)}
      />
    </div>
  );
}

/**
 * Load successive batches without owning rows, pagination or a request client.
 *
 * @example
 * ```
 * const plugin = useTableInfiniteScroll<Item>({
 *   hasMore,
 *   isLoading,
 *   onLoadMore: async () => {
 *     const batch = await fetchNextBatch();
 *     setRows(rows => [...rows, ...batch.rows]);
 *     setHasMore(batch.hasMore);
 *   },
 * });
 * <Table data={rows} idKey="id" plugins={{infiniteScroll: plugin}} />
 * ```
 * Reset by remounting the component owning both this hook and its Table.
 */
export function useTableInfiniteScroll<T extends Record<string, unknown>>(
  config: UseTableInfiniteScrollConfig,
): TablePlugin<T> {
  const [, wake] = useReducer((version: number) => version + 1, 0);
  const [runtime] = useState(() => createRuntime(config, wake));
  const [plugin] = useState<TablePlugin<T>>(() => ({
    rowModel: 'flat',
    renderState: runtime.renderState,
    transformScrollWrapper(props, context) {
      // Parent owns admission diagnostics and suppresses conflicting empty state.
      if (!isAdmitted(context)) {
        return props;
      }
      return {
        ...props,
        afterTable: (
          <>
            {props.afterTable}
            <InfiniteScrollSurface runtime={runtime} context={context} />
          </>
        ),
      };
    },
  }));
  useLayoutEffect(() => {
    runtime.isActive = true;
    return () => {
      runtime.isActive = false;
      runtime.generation++;
      runtime.request = null;
      runtime.version++;
    };
  }, [runtime]);
  useLayoutEffect(() => {
    // Publish current controlled state only after commit, including settle-only commits.
    runtime.commit(config);
  });
  return plugin;
}

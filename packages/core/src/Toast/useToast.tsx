// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, use, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {ToastContext, type ToastContextValue} from './ToastContext';
import {ToastViewport} from './ToastViewport';
import type {
  ToastOptions,
  ToastDismissFn,
  ShowToastFn,
  ToastEntry,
} from './types';

// Fallback singleton
let fallbackContext: ToastContextValue | null = null;
let fallbackRoot: ReturnType<typeof createRoot> | null = null;
let fallbackWarned = false;

function getFallbackContext(): ToastContextValue {
  if (fallbackContext) {
    return fallbackContext;
  }

  if (typeof document === 'undefined') {
    throw new Error(
      'useToast: Cannot create fallback viewport during SSR. ' +
        'Wrap your app with <LayerProvider> or <AppShell>.',
    );
  }

  if (!fallbackWarned) {
    fallbackWarned = true;
    console.warn(
      'useToast: No LayerProvider found. Using fallback viewport. ' +
        'Wrap your app with <LayerProvider> or <AppShell> for full control.',
    );
  }

  const container = document.createElement('div');
  container.setAttribute('data-astryx-toast-fallback', '');
  document.body.appendChild(container);

  let resolveCtx: ((ctx: ToastContextValue) => void) | undefined;
  const ctxReady = new Promise<ToastContextValue>(r => {
    resolveCtx = r;
  });

  const FallbackCapture = () => {
    const ctx = use(ToastContext);
    const doneRef = useRef(false);
    useEffect(() => {
      if (ctx && !doneRef.current) {
        doneRef.current = true;
        fallbackContext = ctx;
        resolveCtx?.(ctx);
      }
    }, [ctx]);
    return null;
  };

  fallbackRoot = createRoot(container);
  fallbackRoot.render(
    <ToastViewport>
      <FallbackCapture />
    </ToastViewport>,
  );

  // Proxy that queues calls until real context is captured
  const pending: ToastEntry[] = [];
  const proxy: ToastContextValue = {
    addToast: entry => {
      if (fallbackContext && fallbackContext !== proxy) {
        fallbackContext.addToast(entry);
      } else {
        pending.push(entry);
        void ctxReady.then(ctx => {
          for (const e of pending) {
            ctx.addToast(e);
          }
          pending.length = 0;
        });
      }
    },
    removeToast: (id, reason) => {
      if (fallbackContext && fallbackContext !== proxy) {
        fallbackContext.removeToast(id, reason);
      }
    },
    findByUniqueID: uid => {
      if (fallbackContext && fallbackContext !== proxy) {
        return fallbackContext.findByUniqueID(uid);
      }
      return undefined;
    },
  };

  fallbackContext = proxy;
  return proxy;
}

let toastIdCounter = 0;
function generateToastId(): string {
  return `astryx-toast-${++toastIdCounter}`;
}

/**
 * Hook to show toast notifications.
 *
 * Returns an imperative function that shows a toast and returns a dismiss function.
 * Works with or without a provider — falls back to a self-mounting viewport.
 *
 * @example
 * ```
 * function SaveButton() {
 *   const toast = useToast();
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       toast({ body: 'Saved successfully' });
 *     } catch {
 *       toast({ body: 'Failed to save', type: 'error' });
 *     }
 *   };
 *   return <Button label="Save" onClick={handleSave} />;
 * }
 * ```
 */
export function useToast(): ShowToastFn {
  const contextFromProvider = use(ToastContext);

  const showToast = useCallback(
    (options: ToastOptions): ToastDismissFn => {
      const ctx = contextFromProvider ?? getFallbackContext();
      const id = generateToastId();
      const entry: ToastEntry = {id, options, createdAt: Date.now()};
      ctx.addToast(entry);
      return () => ctx.removeToast(id, 'manual');
    },
    [contextFromProvider],
  );

  return showToast;
}

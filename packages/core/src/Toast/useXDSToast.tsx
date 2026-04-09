'use client';

import {useCallback, useContext, useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {XDSToastContext, type XDSToastContextValue} from './XDSToastContext';
import {XDSToastViewport} from './XDSToastViewport';
import type {
  XDSToastOptions,
  XDSToastDismissFn,
  XDSShowToastFn,
  XDSToastEntry,
} from './types';

// Fallback singleton
let fallbackContext: XDSToastContextValue | null = null;
let fallbackRoot: ReturnType<typeof createRoot> | null = null;
let fallbackWarned = false;

function getFallbackContext(): XDSToastContextValue {
  if (fallbackContext) return fallbackContext;

  if (typeof document === 'undefined') {
    throw new Error(
      'useXDSToast: Cannot create fallback viewport during SSR. ' +
        'Wrap your app with <XDSLayerProvider> or <XDSAppShell>.',
    );
  }

  if (!fallbackWarned) {
    fallbackWarned = true;
    console.warn(
      'useXDSToast: No XDSLayerProvider found. Using fallback viewport. ' +
        'Wrap your app with <XDSLayerProvider> or <XDSAppShell> for full control.',
    );
  }

  const container = document.createElement('div');
  container.setAttribute('data-xds-toast-fallback', '');
  document.body.appendChild(container);

  let resolveCtx: (ctx: XDSToastContextValue) => void;
  const ctxReady = new Promise<XDSToastContextValue>(r => {
    resolveCtx = r;
  });

  const FallbackCapture = () => {
    const ctx = useContext(XDSToastContext);
    const doneRef = useRef(false);
    useEffect(() => {
      if (ctx && !doneRef.current) {
        doneRef.current = true;
        fallbackContext = ctx;
        resolveCtx!(ctx);
      }
    }, [ctx]);
    return null;
  };

  fallbackRoot = createRoot(container);
  fallbackRoot.render(
    <XDSToastViewport>
      <FallbackCapture />
    </XDSToastViewport>,
  );

  // Proxy that queues calls until real context is captured
  const pending: XDSToastEntry[] = [];
  const proxy: XDSToastContextValue = {
    addToast: entry => {
      if (fallbackContext && fallbackContext !== proxy) {
        fallbackContext.addToast(entry);
      } else {
        pending.push(entry);
        ctxReady.then(ctx => {
          for (const e of pending) ctx.addToast(e);
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
  return `xds-toast-${++toastIdCounter}`;
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
 *   const toast = useXDSToast();
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       toast({ body: 'Saved successfully' });
 *     } catch {
 *       toast({ body: 'Failed to save', type: 'error' });
 *     }
 *   };
 *   return <XDSButton label="Save" onClick={handleSave} />;
 * }
 * ```
 */
export function useXDSToast(): XDSShowToastFn {
  const contextFromProvider = useContext(XDSToastContext);

  const showToast = useCallback(
    (options: XDSToastOptions): XDSToastDismissFn => {
      const ctx = contextFromProvider ?? getFallbackContext();
      const id = generateToastId();
      const entry: XDSToastEntry = {id, options, createdAt: Date.now()};
      ctx.addToast(entry);
      return () => ctx.removeToast(id, 'manual');
    },
    [contextFromProvider],
  );

  return showToast;
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, use, useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {ToastContext, type ToastContextValue} from './ToastContext';
import {ToastViewport} from './ToastViewport';
import {ThemeContext, type ThemeContextValue} from '../theme';
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

// Reads the root Theme's mode off <html> (synced there since #1587).
// Absent means mode="system", where useTheme's OS fallback is already correct.
function readRootThemeMode(): 'light' | 'dark' | null {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : null;
}

// The fallback tree is disconnected from the app, so ThemeContext can't
// reach it and useTheme() would resolve mode from OS preference. Re-provides
// the mode read off <html>, kept live via MutationObserver.
function FallbackThemeProvider({children}: {children: ReactNode}) {
  const [mode, setMode] = useState(readRootThemeMode);

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(readRootThemeMode()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  // Always render the same Provider (only its value toggles) — omitting it
  // conditionally would change the tree shape on mode changes and remount
  // ToastViewport, dropping visible toasts. theme is null because only mode
  // is reflected to the DOM; the theme object exists solely in React
  // context. useTheme resolves a null theme to default tokens, same as the
  // no-provider path today.
  const value = useMemo<ThemeContextValue | null>(
    () => (mode == null ? null : {mode, theme: null}),
    [mode],
  );
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

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
    <FallbackThemeProvider>
      <ToastViewport>
        <FallbackCapture />
      </ToastViewport>
    </FallbackThemeProvider>,
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

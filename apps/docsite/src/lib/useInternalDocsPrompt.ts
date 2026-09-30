// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input An anonymous iframe's load and exact-origin reachability message
 * @output A fail-closed, once-per-page-load prompt state and session dismissal
 * @position Client-only detection shared across root-layout remounts
 */

import {useSyncExternalStore} from 'react';

export const PUBLIC_DOCS_ORIGIN = 'https://astryx.atmeta.com';
export const INTERNAL_DOCS_ORIGIN = 'https://astryx.internalmeta.com';
export const ACCESS_CHECK_MESSAGE_TYPE = 'astryx:access-check:v1';
export const DISMISSAL_KEY = 'astryx:internal-prompt:dismissed';

const listeners = new Set<() => void>();
let attempted = false;
let visible = false;
let cancelCheck: (() => void) | undefined;

function publishVisibility(next: boolean) {
  visible = next;
  for (const listener of listeners) {
    listener();
  }
}

function startCheck() {
  attempted = true;
  try {
    if (window.sessionStorage.getItem(DISMISSAL_KEY) === 'true') {
      return;
    }
  } catch {
    // Storage may be disabled. In-memory dismissal still works for this load.
  }

  // Only the canonical deployment is allowlisted by the companion endpoint.
  if (window.location.origin !== PUBLIC_DOCS_ORIGIN) {
    return;
  }

  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.title = 'Astryx documentation reachability check';
  frame.referrerPolicy = 'no-referrer';
  frame.src = `${INTERNAL_DOCS_ORIGIN}/embed/access-check?parent_origin=${encodeURIComponent(PUBLIC_DOCS_ORIGIN)}`;

  let loaded = false;
  let received = false;
  const finish = (reachable: boolean) => {
    window.clearTimeout(timeout);
    window.removeEventListener('message', onMessage);
    frame.removeEventListener('load', onLoad);
    frame.remove();
    cancelCheck = undefined;
    publishVisibility(reachable);
  };
  const onLoad = () => {
    loaded = true;
    if (received) {
      finish(true);
    }
  };
  const onMessage = (event: MessageEvent) => {
    if (
      event.origin !== INTERNAL_DOCS_ORIGIN ||
      event.source !== frame.contentWindow ||
      event.data?.type !== ACCESS_CHECK_MESSAGE_TYPE ||
      event.data?.reachable !== true
    ) {
      return;
    }
    received = true;
    if (loaded) {
      finish(true);
    }
  };
  const timeout = window.setTimeout(() => finish(false), 4000);
  cancelCheck = () => finish(false);
  window.addEventListener('message', onMessage);
  frame.addEventListener('load', onLoad);
  document.body.append(frame);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // StrictMode's setup/cleanup/setup finishes before this microtask. It must
  // neither start two probes nor cancel the only probe during effect replay.
  queueMicrotask(() => {
    if (!attempted && listeners.size > 0) {
      startCheck();
    }
  });
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      cancelCheck?.();
    }
  };
}

function dismiss() {
  try {
    window.sessionStorage.setItem(DISMISSAL_KEY, 'true');
  } catch {
    // Do not prevent dismissal when the browser refuses persistence.
  }
  publishVisibility(false);
}

const getSnapshot = () => visible;
const getServerSnapshot = () => false;

export function useInternalDocsPrompt() {
  const isVisible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return {isVisible, dismiss};
}

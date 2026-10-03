// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input An anonymous iframe's load and exact-origin reachability message
 * @output A fail-closed, once-per-page-load reachability result
 * @position Client-only detection shared across root-layout remounts
 */

import {useSyncExternalStore} from 'react';

export const ALLOWED_PARENT_ORIGINS: readonly string[] = [
  'https://astryx.atmeta.com',
  'https://astryx-git-feat-docs-internal-network-prompt-fbopensource.vercel.app',
  'https://astryx-canary.vercel.app',
];
export const INTERNAL_DOCS_ORIGIN = 'https://astryx.internalmeta.com';
export const ACCESS_CHECK_MESSAGE_TYPE = 'astryx:access-check:v1';

const listeners = new Set<() => void>();
let attempted = false;
let reachable = false;
let cancelCheck: (() => void) | undefined;

function publishReachability(next: boolean) {
  reachable = next;
  for (const listener of listeners) {
    listener();
  }
}

function startCheck() {
  attempted = true;

  // Mirror the companion endpoint's exact deployment allowlist. Never probe
  // arbitrary preview/hash domains or send a different origin on their behalf.
  const parentOrigin = window.location.origin;
  if (!ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) {
    return;
  }

  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.title = 'Astryx documentation reachability check';
  frame.referrerPolicy = 'no-referrer';
  frame.src = `${INTERNAL_DOCS_ORIGIN}/embed/access-check?parent_origin=${encodeURIComponent(parentOrigin)}`;

  let loaded = false;
  let received = false;
  const finish = (reachable: boolean) => {
    window.clearTimeout(timeout);
    window.removeEventListener('message', onMessage);
    frame.removeEventListener('load', onLoad);
    frame.remove();
    cancelCheck = undefined;
    publishReachability(reachable);
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

const getSnapshot = () => reachable;
const getServerSnapshot = () => false;

export function useInternalDocsPrompt() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

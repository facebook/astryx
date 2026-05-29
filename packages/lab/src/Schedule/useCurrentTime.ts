// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useCurrentTime.ts
 * @input Browser clock
 * @output A shared ticking Instant value for schedule current-time affordances
 * @position Internal hook consumed by schedule views
 */

import {useSyncExternalStore} from 'react';
import type {Instant} from './types';

const UPDATE_INTERVAL_MS = 60 * 1000;
const listeners = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | null = null;
let currentTime = Date.now() as Instant;

function getSnapshot(): Instant {
  return currentTime;
}

// SSR returns 0 because current time only drives client-side affordances
// (now-indicator line, past-event dimming) that are acceptable to hydrate.
function getServerSnapshot(): Instant {
  return 0 as Instant;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (interval == null) {
    interval = setInterval(() => {
      currentTime = Date.now() as Instant;
      listeners.forEach(activeListener => activeListener());
    }, UPDATE_INTERVAL_MS);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval != null) {
      clearInterval(interval);
      interval = null;
    }
  };
}

export function useCurrentTime(): Instant {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

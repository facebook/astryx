'use client';

/**
 * @file useIsomorphicLayoutEffect.ts
 * @input React useLayoutEffect, useEffect
 * @output Exports useIsomorphicLayoutEffect
 * @position Internal utility; used by components that need useLayoutEffect
 *   but must avoid the SSR warning React emits when useLayoutEffect runs
 *   on the server (where there is no DOM to synchronously measure).
 *
 * On the client this is useLayoutEffect; on the server it falls back to
 * useEffect (which is a no-op during SSR anyway). The runtime behavior is
 * identical — neither hook fires during server rendering — but React only
 * warns about useLayoutEffect.
 */

import {useEffect, useLayoutEffect} from 'react';

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * @file InteractionContext.ts
 * @output Shared gesture dispatch for chart interactions
 * @position Provided by XDSChart; interaction components register handlers
 *
 * Solves the overlapping-rect problem: one EventLayer rect dispatches
 * gestures to all registered handlers based on gesture type.
 */

import {createContext, useContext, useCallback, useRef} from 'react';
import type {GestureHandlers} from './EventLayer';

export interface InteractionRegistry {
  /** Register a set of gesture handlers. Returns unregister function. */
  register: (id: string, handlers: Partial<GestureHandlers>) => () => void;
  /** Get merged handlers for the EventLayer */
  getHandlers: () => GestureHandlers;
}

/**
 * Create an interaction registry. Called once in XDSChart.
 */
export function useInteractionRegistry(): InteractionRegistry {
  const handlersMap = useRef(new Map<string, Partial<GestureHandlers>>());

  const register = useCallback(
    (id: string, handlers: Partial<GestureHandlers>) => {
      handlersMap.current.set(id, handlers);
      return () => {
        handlersMap.current.delete(id);
      };
    },
    [],
  );

  const getHandlers = useCallback((): GestureHandlers => {
    const all = [...handlersMap.current.values()];

    // Merge: each gesture type calls all registered handlers
    const merge = <K extends keyof GestureHandlers>(key: K) => {
      const fns = all
        .map(h => h[key])
        .filter((f): f is NonNullable<GestureHandlers[K]> => f != null);
      if (fns.length === 0) return undefined;
      return ((...args: unknown[]) => {
        for (const fn of fns) (fn as (...a: unknown[]) => void)(...args);
      }) as GestureHandlers[K];
    };

    return {
      onHover: merge('onHover'),
      onHoverEnd: merge('onHoverEnd'),
      onDragStart: merge('onDragStart'),
      onDragMove: merge('onDragMove'),
      onDragEnd: merge('onDragEnd'),
      onWheel: merge('onWheel'),
      onPinchStart: merge('onPinchStart'),
      onPinchMove: merge('onPinchMove'),
      onPinchEnd: merge('onPinchEnd'),
      onClick: merge('onClick'),
    };
  }, []);

  return {register, getHandlers};
}

const InteractionCtx = createContext<InteractionRegistry | null>(null);

export const InteractionProvider = InteractionCtx.Provider;

export function useInteraction(): InteractionRegistry {
  const ctx = useContext(InteractionCtx);
  if (!ctx) {
    throw new Error('Interaction components must be inside <XDSChart>');
  }
  return ctx;
}

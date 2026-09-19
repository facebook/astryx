// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InteractiveRoleContext.test.tsx
 * @input Uses vitest, @testing-library/react, InteractiveRoleContext + useInteractiveRole
 * @output Characterization tests for the interactive-role override context
 * @position Testing; validates the role-override contract and its consumption
 *   by useInteractiveRole
 *
 * SYNC: When InteractiveRoleContext.ts changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {createElement, type ReactNode} from 'react';
import {
  InteractiveRoleContext,
  useInteractiveRoleContext,
} from './InteractiveRoleContext';
import {
  useInteractiveRole,
  type InteractiveRole,
} from '../hooks/useInteractiveRole';

/** Wrap children in an InteractiveRoleContext provider set to `role`. */
function withRole(role: InteractiveRole | null) {
  return function Wrapper({children}: {children: ReactNode}) {
    return (
      <InteractiveRoleContext value={role}>{children}</InteractiveRoleContext>
    );
  };
}

describe('InteractiveRoleContext', () => {
  describe('context primitive', () => {
    it('defaults to null when read with no provider', () => {
      const {result} = renderHook(() => useInteractiveRoleContext());
      expect(result.current).toBeNull();
    });

    it('exposes a displayName for devtools', () => {
      expect(InteractiveRoleContext.displayName).toBe('InteractiveRoleContext');
    });

    it('returns the provided role override', () => {
      const {result} = renderHook(() => useInteractiveRoleContext(), {
        wrapper: withRole('button'),
      });
      expect(result.current).toBe('button');
    });

    it('returns null when a provider explicitly supplies null', () => {
      const {result} = renderHook(() => useInteractiveRoleContext(), {
        wrapper: withRole(null),
      });
      expect(result.current).toBeNull();
    });

    it.each(['link', 'button', 'inert'] as const)(
      'passes through the "%s" override verbatim',
      role => {
        const {result} = renderHook(() => useInteractiveRoleContext(), {
          wrapper: withRole(role),
        });
        expect(result.current).toBe(role);
      },
    );

    it('resolves to the nearest provider when nested', () => {
      function Nested({children}: {children: ReactNode}) {
        return (
          <InteractiveRoleContext value="link">
            <InteractiveRoleContext value="button">
              {children}
            </InteractiveRoleContext>
          </InteractiveRoleContext>
        );
      }
      const {result} = renderHook(() => useInteractiveRoleContext(), {
        wrapper: Nested,
      });
      expect(result.current).toBe('button');
    });

    it('supports the createElement (no-JSX) provider form', () => {
      const {result} = renderHook(() => useInteractiveRoleContext(), {
        wrapper: ({children}: {children: ReactNode}) =>
          createElement(InteractiveRoleContext, {value: 'button'}, children),
      });
      expect(result.current).toBe('button');
    });
  });

  // useInteractiveRole is the real consumer of this context; these tests pin
  // down how the context signal participates in the role-resolution priority.
  describe('consumption via useInteractiveRole', () => {
    it('href alone resolves to "link"', () => {
      const {result} = renderHook(() =>
        useInteractiveRole({href: '/somewhere'}),
      );
      expect(result.current).toBe('link');
    });

    it('onClick alone resolves to "button"', () => {
      const {result} = renderHook(() =>
        useInteractiveRole({onClick: () => {}}),
      );
      expect(result.current).toBe('button');
    });

    it('nothing interactive resolves to "inert"', () => {
      const {result} = renderHook(() => useInteractiveRole({}));
      expect(result.current).toBe('inert');
    });

    it('context override is used when neither href nor onClick is set', () => {
      const {result} = renderHook(() => useInteractiveRole({}), {
        wrapper: withRole('button'),
      });
      expect(result.current).toBe('button');
    });

    it('href wins over a context override (navigation has top priority)', () => {
      const {result} = renderHook(() => useInteractiveRole({href: '/x'}), {
        wrapper: withRole('button'),
      });
      expect(result.current).toBe('link');
    });

    it('onClick wins over a context override', () => {
      const {result} = renderHook(
        () => useInteractiveRole({onClick: () => {}}),
        {wrapper: withRole('link')},
      );
      expect(result.current).toBe('button');
    });

    // NOTE — documents current behavior. The `isDisabled` JSDoc says a disabled
    // href "falls back to button", but the implementation only *skips* the link
    // branch when disabled — it does not force a button. With no onClick and no
    // context override, a disabled href therefore resolves to "inert", not
    // "button". (The doc-promised "button" fallback only holds when an onClick
    // or a context override is also present — see the two tests below.)
    it('a disabled href with nothing else resolves to "inert" (not "button" as the JSDoc implies)', () => {
      const {result} = renderHook(() =>
        useInteractiveRole({href: '/x', isDisabled: true}),
      );
      expect(result.current).toBe('inert');
    });

    it('a disabled href with an onClick resolves to "button" via the onClick branch', () => {
      const {result} = renderHook(() =>
        useInteractiveRole({href: '/x', isDisabled: true, onClick: () => {}}),
      );
      expect(result.current).toBe('button');
    });

    it('a disabled href with a context override falls through to that override', () => {
      const {result} = renderHook(
        () => useInteractiveRole({href: '/x', isDisabled: true}),
        {wrapper: withRole('button')},
      );
      expect(result.current).toBe('button');
    });

    it('an "inert" context override is honored when nothing else is interactive', () => {
      const {result} = renderHook(() => useInteractiveRole({}), {
        wrapper: withRole('inert'),
      });
      expect(result.current).toBe('inert');
    });

    it('a null onClick is treated as absent (falls through to inert)', () => {
      const {result} = renderHook(() => useInteractiveRole({onClick: null}));
      expect(result.current).toBe('inert');
    });

    it('a null onClick still yields to a context override', () => {
      const {result} = renderHook(() => useInteractiveRole({onClick: null}), {
        wrapper: withRole('button'),
      });
      expect(result.current).toBe('button');
    });
  });
});

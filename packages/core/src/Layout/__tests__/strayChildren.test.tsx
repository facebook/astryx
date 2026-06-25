// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file strayChildren.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Verifies Layout never silently blanks when given `children` instead
 *   of the canonical `content`/slot props, and warns about the misuse.
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import type {ReactNode} from 'react';
import {Layout, type LayoutProps} from '../Layout';
import {LayoutContent} from '../LayoutContent';

// Layout intentionally omits `children` from its public props (it is
// slot-driven), so TS rejects `<Layout>…</Layout>`. These tests exercise the
// runtime safety net for code that nests children anyway — the type error is
// bypassed here on purpose to simulate an un-typechecked build.
function withChildren(children: ReactNode): LayoutProps {
  return {children} as unknown as LayoutProps;
}

describe('Layout stray children safety net', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stray children in the content slot instead of blanking', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Layout {...withChildren(<span data-testid="stray">Body</span>)} />);
    expect(screen.getByTestId('stray')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('renders a nested LayoutContent child (the common mistake)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Layout
        {...withChildren(
          <LayoutContent>
            <span data-testid="nested">Hello</span>
          </LayoutContent>,
        )}
      />,
    );
    expect(screen.getByTestId('nested')).toBeInTheDocument();
  });

  it('prefers the content slot over children when both are provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Layout
        content={<span data-testid="slot">Slot</span>}
        {...withChildren(<span data-testid="stray">Stray</span>)}
      />,
    );
    expect(screen.getByTestId('slot')).toBeInTheDocument();
    expect(screen.queryByTestId('stray')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn for the canonical slot API', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Layout content={<LayoutContent>OK</LayoutContent>} />);
    expect(warn).not.toHaveBeenCalled();
  });
});

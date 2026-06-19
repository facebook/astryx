// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useLinkComponent.test.tsx
 * @input Uses vitest, @testing-library/react, useLinkComponent, LinkProvider
 * @output Unit tests for useLinkComponent hook and LinkProvider
 * @position Testing; validates polymorphic link resolution and `to` prop injection
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {useLinkComponent} from './useLinkComponent';
import {LinkProvider} from './LinkProvider';
import type {LinkComponentType} from './types';

// Helper component that renders the resolved link component
function TestConsumer({as}: {as?: LinkComponentType}) {
  const LinkComponent = useLinkComponent(as);
  return (
    <LinkComponent href="/test" data-testid="resolved-link">
      Link
    </LinkComponent>
  );
}

function CustomLink({
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<'a'>) {
  return (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  );
}

function AnotherLink({
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<'a'>) {
  return (
    <a ref={ref} data-another-link {...props}>
      {children}
    </a>
  );
}

/**
 * A mock "to"-based router link that reads `to` instead of `href`.
 * Simulates React Router / TanStack Router behavior.
 */
function ToBasedRouterLink({
  to,
  children,
  ref,
  ...props
}: {
  to?: string;
  href?: string;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLAnchorElement>;
  [key: string]: unknown;
}) {
  return (
    <a ref={ref} href={to} data-router-link data-to={to} {...props}>
      {children}
    </a>
  );
}

// =============================================================================
// useLinkComponent
// =============================================================================

describe('useLinkComponent', () => {
  it('returns native <a> by default (no provider, no as)', () => {
    render(<TestConsumer />);
    const link = screen.getByTestId('resolved-link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).not.toHaveAttribute('data-custom-link');
  });

  it('returns as prop when provided', () => {
    render(<TestConsumer as={CustomLink} />);
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('returns provider component when wrapped in LinkProvider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <TestConsumer />
      </LinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides provider', () => {
    render(
      <LinkProvider component={AnotherLink}>
        <TestConsumer as={CustomLink} />
      </LinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

// =============================================================================
// `to` prop injection
// =============================================================================

describe('useLinkComponent — to prop', () => {
  it('passes `to` equal to `href` for custom components via provider', () => {
    const spy = vi.fn(
      ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      }) => (
        <a
          data-testid="spy-link"
          data-to={props.to as string}
          href={props.href as string}>
          {children}
        </a>
      ),
    );
    function SpyLink(props: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) {
      return spy(props);
    }

    render(
      <LinkProvider component={SpyLink}>
        <TestConsumer />
      </LinkProvider>,
    );

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({href: '/test', to: '/test'}),
    );
  });

  it('passes `to` equal to `href` for custom components via `as` prop', () => {
    const spy = vi.fn(
      ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        [key: string]: unknown;
      }) => (
        <a data-testid="spy-link" href={props.href as string}>
          {children}
        </a>
      ),
    );
    function SpyLink(props: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) {
      return spy(props);
    }

    render(<TestConsumer as={SpyLink} />);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({href: '/test', to: '/test'}),
    );
  });

  it('does NOT pass `to` for native <a> (no provider, no as)', () => {
    render(<TestConsumer />);
    const link = screen.getByTestId('resolved-link');
    // Native <a> doesn't use `to`, and we don't wrap it
    expect(link).toHaveAttribute('href', '/test');
    expect(link).not.toHaveAttribute('to');
  });

  it('works with to-based router links (e.g. React Router)', () => {
    render(
      <LinkProvider component={ToBasedRouterLink}>
        <TestConsumer />
      </LinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/test');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('to-based router works with as prop override', () => {
    render(<TestConsumer as={ToBasedRouterLink} />);
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/test');
  });
});

// =============================================================================
// LinkProvider
// =============================================================================

describe('LinkProvider', () => {
  it('children can access the link component via the hook', () => {
    render(
      <LinkProvider component={CustomLink}>
        <TestConsumer />
      </LinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('nested providers — inner overrides outer', () => {
    render(
      <LinkProvider component={AnotherLink}>
        <LinkProvider component={CustomLink}>
          <TestConsumer />
        </LinkProvider>
      </LinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

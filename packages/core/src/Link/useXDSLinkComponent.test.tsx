/**
 * @file useXDSLinkComponent.test.tsx
 * @input Uses vitest, @testing-library/react, useXDSLinkComponent, XDSLinkProvider
 * @output Unit tests for useXDSLinkComponent hook and XDSLinkProvider
 * @position Testing; validates polymorphic link resolution
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import {useXDSLinkComponent} from './useXDSLinkComponent';
import {XDSLinkProvider} from './XDSLinkProvider';
import type {XDSLinkComponentType} from './types';

// Helper component that renders the resolved link component
function TestConsumer({as}: {as?: XDSLinkComponentType}) {
  const LinkComponent = useXDSLinkComponent(as);
  return (
    <LinkComponent href="/test" data-testid="resolved-link">
      Link
    </LinkComponent>
  );
}

const CustomLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  ({children, ...props}, ref) => (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  ),
);
CustomLink.displayName = 'CustomLink';

const AnotherLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<'a'>
>(({children, ...props}, ref) => (
  <a ref={ref} data-another-link {...props}>
    {children}
  </a>
));
AnotherLink.displayName = 'AnotherLink';

// =============================================================================
// useXDSLinkComponent
// =============================================================================

describe('useXDSLinkComponent', () => {
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

  it('returns provider component when wrapped in XDSLinkProvider', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <TestConsumer />
      </XDSLinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides provider', () => {
    render(
      <XDSLinkProvider component={AnotherLink}>
        <TestConsumer as={CustomLink} />
      </XDSLinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

// =============================================================================
// XDSLinkProvider
// =============================================================================

describe('XDSLinkProvider', () => {
  it('children can access the link component via the hook', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <TestConsumer />
      </XDSLinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('nested providers — inner overrides outer', () => {
    render(
      <XDSLinkProvider component={AnotherLink}>
        <XDSLinkProvider component={CustomLink}>
          <TestConsumer />
        </XDSLinkProvider>
      </XDSLinkProvider>,
    );
    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

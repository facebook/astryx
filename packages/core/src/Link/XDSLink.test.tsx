/**
 * @file XDSLink.test.tsx
 * @input Uses vitest, @testing-library/react, XDSLink component
 * @output Unit tests for XDSLink component behavior
 * @position Testing; validates XDSLink.tsx implementation
 *
 * SYNC: When XDSLink.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import {XDSLink} from './XDSLink';
import {XDSLinkProvider} from './XDSLinkProvider';

const CustomLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  ({children, ...props}, ref) => (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  ),
);
CustomLink.displayName = 'CustomLink';

describe('XDSLink', () => {
  it('renders children as link text', () => {
    render(
      <XDSLink label="Click me" href="/test">
        Click me
      </XDSLink>,
    );
    expect(screen.getByRole('link', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(
      <XDSLink label="Link" href="/destination">
        Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/destination');
  });

  it('renders with aria-label from label prop', () => {
    render(
      <XDSLink label="Accessible label" href="/test">
        Visible text
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Accessible label',
    );
  });

  it('renders with different color values', () => {
    const {rerender} = render(
      <XDSLink label="Active" href="/test" color="active">
        Active
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <XDSLink label="Secondary" href="/test" color="secondary">
        Secondary
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <XDSLink label="Inherit" href="/test" color="inherit">
        Inherit
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies hasUnderline style when true', () => {
    render(
      <XDSLink label="Underlined" href="/test" hasUnderline>
        Underlined Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies isDisabled state correctly', () => {
    render(
      <XDSLink label="Disabled Link" href="/test" isDisabled>
        Disabled Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '-1');
  });

  it('renders external link with icon and target="_blank"', () => {
    render(
      <XDSLink label="External" href="https://example.com" isExternalLink>
        External Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    // Check for the icon (SVG element)
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('renders external link with existing rel merged', () => {
    render(
      <XDSLink
        label="External"
        href="https://example.com"
        isExternalLink
        rel="sponsored">
        External Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('renders with custom target without isExternalLink', () => {
    render(
      <XDSLink label="Target" href="/test" target="_parent">
        Parent Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_parent');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(e => e.preventDefault());
    render(
      <XDSLink label="Click me" href="/test" onClick={handleClick}>
        Click me
      </XDSLink>,
    );

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSLink label="Test" href="/test" ref={ref}>
        Test
      </XDSLink>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders standalone link', () => {
    render(
      <XDSLink label="Standalone Link" href="/standalone" isStandalone>
        Standalone Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders link with tooltip', () => {
    render(
      <XDSLink label="Settings" href="/settings" tooltip="Configure settings">
        Settings
      </XDSLink>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toBeInTheDocument();
  });

  it('renders custom component when as is provided', () => {
    render(
      <XDSLink label="Custom" href="/custom" as={CustomLink}>
        Custom Link
      </XDSLink>,
    );
    const link = screen.getByRole('link', {name: 'Custom'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/custom');
  });

  it('renders custom component from XDSLinkProvider', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSLink label="Provider" href="/provider">
          Provider Link
        </XDSLink>
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Provider'});
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides XDSLinkProvider', () => {
    const AnotherLink = forwardRef<
      HTMLAnchorElement,
      ComponentPropsWithoutRef<'a'>
    >(({children, ...props}, ref) => (
      <a ref={ref} data-another-link {...props}>
        {children}
      </a>
    ));
    render(
      <XDSLinkProvider component={AnotherLink}>
        <XDSLink label="Override" href="/override" as={CustomLink}>
          Override Link
        </XDSLink>
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Override'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

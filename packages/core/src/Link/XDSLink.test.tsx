// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {XDSLink} from './XDSLink';
import {XDSLinkProvider} from './XDSLinkProvider';

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

describe('XDSLink', () => {
  it('renders children as link text', () => {
    render(<XDSLink href="/test">Click me</XDSLink>);
    expect(screen.getByRole('link', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(<XDSLink href="/destination">Link</XDSLink>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/destination');
  });

  it('renders as a button when href is undefined', () => {
    render(<XDSLink>Action</XDSLink>);
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('renders as a button when href is explicitly undefined', () => {
    render(<XDSLink href={undefined}>Action</XDSLink>);
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('button fallback fires onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSLink onClick={handleClick}>Click me</XDSLink>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('button fallback supports isDisabled', () => {
    render(<XDSLink isDisabled>Disabled Action</XDSLink>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('button fallback has type="button"', () => {
    render(<XDSLink>Action</XDSLink>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('button fallback supports aria-label via label prop', () => {
    render(
      <XDSLink label="Close dialog">
        <span aria-hidden="true">✕</span>
      </XDSLink>,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Close dialog',
    );
  });

  it('does not render aria-label when label is omitted', () => {
    render(<XDSLink href="/test">Visible text</XDSLink>);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-label');
  });

  it('renders aria-label when label prop is provided', () => {
    render(
      <XDSLink label="Accessible label" href="/test">
        <span aria-hidden="true">🏠</span>
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Accessible label',
    );
  });

  it('renders with different color values', () => {
    const {rerender} = render(
      <XDSLink href="/test" color="active">
        Active
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <XDSLink href="/test" color="secondary">
        Secondary
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <XDSLink href="/test" color="inherit">
        Inherit
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies hasUnderline style when true', () => {
    render(
      <XDSLink href="/test" hasUnderline>
        Underlined Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies isDisabled state correctly', () => {
    render(
      <XDSLink href="/test" isDisabled>
        Disabled Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '-1');
  });

  it('renders external link with icon and target="_blank"', () => {
    render(
      <XDSLink href="https://example.com" isExternalLink>
        External Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('renders external link with existing rel merged', () => {
    render(
      <XDSLink href="https://example.com" isExternalLink rel="sponsored">
        External Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('renders with custom target without isExternalLink', () => {
    render(
      <XDSLink href="/test" target="_parent">
        Parent Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_parent');
  });

  it('adds safe rel tokens for explicit target="_blank"', () => {
    render(
      <XDSLink href="/test" target="_blank">
        Blank Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel tokens for explicit target="_blank"', () => {
    render(
      <XDSLink href="/test" target="_blank" rel="sponsored noopener">
        Blank Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
    });
    render(
      <XDSLink href="/test" onClick={handleClick}>
        Click me
      </XDSLink>,
    );

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSLink href="/test" ref={ref}>
        Test
      </XDSLink>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders standalone link', () => {
    render(
      <XDSLink href="/standalone" isStandalone>
        Standalone Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders link with tooltip', () => {
    render(
      <XDSLink href="/settings" tooltip="Configure settings">
        Settings
      </XDSLink>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toBeInTheDocument();
  });

  it('renders custom component when as is provided', () => {
    render(
      <XDSLink href="/custom" as={CustomLink}>
        Custom Link
      </XDSLink>,
    );
    const link = screen.getByRole('link', {name: 'Custom Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/custom');
  });

  it('renders custom component from XDSLinkProvider', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSLink href="/provider">Provider Link</XDSLink>
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Provider Link'});
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides XDSLinkProvider', () => {
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
    render(
      <XDSLinkProvider component={AnotherLink}>
        <XDSLink href="/override" as={CustomLink}>
          Override Link
        </XDSLink>
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Override Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });

  it('renders xds-* class names for theme targeting', () => {
    render(
      <XDSLink href="/test" color="secondary">
        Themed Link
      </XDSLink>,
    );
    const link = screen.getByRole('link', {name: 'Themed Link'});
    expect(link.className).toContain('xds-link');
    expect(link.className).toContain('secondary');
  });
});

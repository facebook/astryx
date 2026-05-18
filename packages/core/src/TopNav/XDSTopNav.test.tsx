// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSTopNav.test.tsx
 * @input Uses vitest, @testing-library/react, TopNav components
 * @output Unit tests for XDSTopNav component suite
 * @position Testing; validates TopNav implementations
 *
 * SYNC: When TopNav components change, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {forwardRef, type ComponentPropsWithoutRef} from 'react';
import {XDSTopNav} from './XDSTopNav';
import {XDSTopNavHeading} from './XDSTopNavHeading';
import {XDSNavIcon} from '../NavIcon';
import {XDSTopNavItem} from './XDSTopNavItem';
import {XDSLinkProvider} from '../Link/XDSLinkProvider';

const CustomLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  ({children, ...props}, ref) => (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  ),
);
CustomLink.displayName = 'CustomLink';

describe('XDSTopNav', () => {
  it('renders with navigation role', () => {
    render(<XDSTopNav label="Main navigation" />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders aria-label from label prop', () => {
    render(<XDSTopNav label="Primary navigation" />);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Primary navigation',
    );
  });

  it('renders heading slot content', () => {
    render(
      <XDSTopNav heading={<span data-testid="title-content">Logo</span>} />,
    );
    expect(screen.getByTestId('title-content')).toBeInTheDocument();
  });

  it('renders startContent slot', () => {
    render(
      <XDSTopNav
        startContent={<span data-testid="start-content">Nav Items</span>}
      />,
    );
    expect(screen.getByTestId('start-content')).toBeInTheDocument();
  });

  it('renders endContent slot', () => {
    render(
      <XDSTopNav endContent={<span data-testid="end-content">Actions</span>} />,
    );
    expect(screen.getByTestId('end-content')).toBeInTheDocument();
  });

  it('renders centerContent slot', () => {
    render(
      <XDSTopNav
        centerContent={<span data-testid="center-content">Center</span>}
      />,
    );
    expect(screen.getByTestId('center-content')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <XDSTopNav
        heading={<span data-testid="title">Title</span>}
        startContent={<span data-testid="start">Start</span>}
        centerContent={<span data-testid="center">Center</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders without centerContent (backward compatible)', () => {
    render(
      <XDSTopNav
        heading={<span data-testid="title">Title</span>}
        startContent={<span data-testid="start">Start</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders centerContent without endContent', () => {
    render(
      <XDSTopNav
        heading={<span data-testid="title">Title</span>}
        centerContent={<span data-testid="center">Center</span>}
      />,
    );
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();

    const nav = screen.getByRole('navigation');
    // 3 child divs: left section, center section, right section (even without endContent)
    expect(nav.children).toHaveLength(3);
  });

  it('renders centerContent without startContent', () => {
    render(
      <XDSTopNav
        centerContent={<span data-testid="center">Center</span>}
        endContent={<span data-testid="end">End</span>}
      />,
    );
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();

    const nav = screen.getByRole('navigation');
    // 3 child divs: left section, center section, right section
    expect(nav.children).toHaveLength(3);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSTopNav ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('does not create a stacking context on nav element', () => {
    render(
      <XDSTopNav
        label="Main navigation"
        startContent={<span>Start</span>}
        endContent={<span>End</span>}
      />,
    );
    const nav = screen.getByRole('navigation');
    // Nav itself should NOT have position: relative — the wrapper provides
    // positioning context for the mega menu panel.
    expect(nav).not.toHaveStyle({position: 'relative'});
  });
});

describe('XDSTopNavHeading', () => {
  it('renders heading text', () => {
    render(<XDSTopNavHeading heading="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders logo element', () => {
    render(<XDSTopNavHeading logo={<span data-testid="logo">Logo</span>} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders both logo and heading', () => {
    render(
      <XDSTopNavHeading
        heading="Dashboard"
        logo={<span data-testid="logo">Logo</span>}
      />,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders as anchor when href is provided', () => {
    render(<XDSTopNavHeading heading="Home" href="/" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders as div when no href', () => {
    render(<XDSTopNavHeading heading="Home" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSTopNavHeading heading="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('XDSNavIcon', () => {
  it('renders icon content', () => {
    render(<XDSNavIcon icon={<span data-testid="icon">Icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSNavIcon icon={<span>Icon</span>} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});

describe('XDSTopNavItem', () => {
  it('renders label as visible text', () => {
    render(<XDSTopNavItem label="Home" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders as anchor element', () => {
    render(<XDSTopNavItem label="Home" href="/" />);
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders children instead of label when provided', () => {
    render(
      <XDSTopNavItem label="Accessible name">Custom content</XDSTopNavItem>,
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('applies aria-current when isSelected', () => {
    render(<XDSTopNavItem label="Home" href="#" isSelected />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('does not have aria-current when not selected', () => {
    render(<XDSTopNavItem label="Home" href="#" />);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
  });

  it('applies aria-disabled when isDisabled', () => {
    render(<XDSTopNavItem label="Home" href="#" isDisabled />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets tabIndex to -1 when disabled', () => {
    render(<XDSTopNavItem label="Home" href="#" isDisabled />);
    expect(screen.getByRole('link')).toHaveAttribute('tabIndex', '-1');
  });

  it('renders icon with label', () => {
    render(
      <XDSTopNavItem
        label="Settings"
        icon={<span data-testid="icon">Icon</span>}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides label and sets aria-label when isIconOnly', () => {
    render(
      <XDSTopNavItem
        label="Settings"
        href="#"
        icon={<span data-testid="icon">⚙️</span>}
        isIconOnly
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Settings');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSTopNavItem label="Click me" href="#" onClick={handleClick} />);

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSTopNavItem label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders custom component when as is provided', () => {
    render(<XDSTopNavItem label="Home" href="/" as={CustomLink} />);
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders custom component from XDSLinkProvider', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSTopNavItem label="Home" href="/" />
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
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
        <XDSTopNavItem label="Home" href="/" as={CustomLink} />
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

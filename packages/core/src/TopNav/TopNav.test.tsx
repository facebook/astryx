// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNav.test.tsx
 * @input Uses vitest, @testing-library/react, TopNav components
 * @output Unit tests for TopNav component suite
 * @position Testing; validates TopNav implementations
 *
 * SYNC: When TopNav components change, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TopNav} from './TopNav';
import {TopNavHeading} from './TopNavHeading';
import {NavIcon} from '../NavIcon';
import {TopNavItem} from './TopNavItem';
import {LinkProvider} from '../Link/LinkProvider';

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

describe('TopNav', () => {
  it('renders with navigation role', () => {
    render(<TopNav label="Main navigation" />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders aria-label from label prop', () => {
    render(<TopNav label="Primary navigation" />);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Primary navigation',
    );
  });

  it('renders heading slot content', () => {
    render(
      <TopNav heading={<span data-testid="title-content">Logo</span>} />,
    );
    expect(screen.getByTestId('title-content')).toBeInTheDocument();
  });

  it('renders startContent slot', () => {
    render(
      <TopNav
        startContent={<span data-testid="start-content">Nav Items</span>}
      />,
    );
    expect(screen.getByTestId('start-content')).toBeInTheDocument();
  });

  it('renders children as startContent', () => {
    render(
      <TopNav>
        <TopNavItem label="Home" href="/" />
        <TopNavItem label="About" href="/about" />
      </TopNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'About'})).toBeInTheDocument();
  });

  it('prefers startContent when both startContent and children are provided', () => {
    render(
      <TopNav startContent={<TopNavItem label="Start" href="/start" />}>
        <TopNavItem label="Child" href="/child" />
      </TopNav>,
    );

    expect(screen.getByRole('link', {name: 'Start'})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: 'Child'})).not.toBeInTheDocument();
  });

  it('renders endContent slot', () => {
    render(
      <TopNav endContent={<span data-testid="end-content">Actions</span>} />,
    );
    expect(screen.getByTestId('end-content')).toBeInTheDocument();
  });

  it('renders centerContent slot', () => {
    render(
      <TopNav
        centerContent={<span data-testid="center-content">Center</span>}
      />,
    );
    expect(screen.getByTestId('center-content')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <TopNav
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
      <TopNav
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
      <TopNav
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
      <TopNav
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
    render(<TopNav ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('does not create a stacking context on nav element', () => {
    render(
      <TopNav
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

describe('TopNavHeading', () => {
  it('renders heading text', () => {
    render(<TopNavHeading heading="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders logo element', () => {
    render(<TopNavHeading logo={<span data-testid="logo">Logo</span>} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders both logo and heading', () => {
    render(
      <TopNavHeading
        heading="Dashboard"
        logo={<span data-testid="logo">Logo</span>}
      />,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  describe('logo link accessible name', () => {
    const logo = <img src="/logo.png" alt="" />;

    // A logo image is decorative; when the logo is wrapped in a link the link
    // itself needs an accessible name, otherwise axe reports link-name.
    it('names the logo link in the independent-links config', () => {
      render(
        <TopNavHeading
          logo={logo}
          superheading="Suite"
          superheadingHref="/suite"
          heading="Product"
          headingHref="/product"
        />,
      );
      // No link should have an empty accessible name.
      for (const link of screen.getAllByRole('link')) {
        expect(link).toHaveAccessibleName();
      }
      // The logo link is named from the heading.
      expect(
        screen.getAllByRole('link', {name: 'Product'}).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it('names the logo link in the menu + hrefs config', () => {
      render(
        <TopNavHeading
          logo={logo}
          superheading="Suite"
          superheadingHref="/suite"
          heading="Product"
          headingHref="/product"
          menu={<a href="#menu">Menu item</a>}
        />,
      );
      for (const link of screen.getAllByRole('link')) {
        expect(link).toHaveAccessibleName();
      }
    });

    it('names a logo-only link via logoLabel', () => {
      render(<TopNavHeading logo={logo} headingHref="/home" logoLabel="Home" />);
      expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
        'href',
        '/home',
      );
    });
  });

  it('renders as anchor when href is provided', () => {
    render(<TopNavHeading heading="Home" href="/" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders as div when no href', () => {
    render(<TopNavHeading heading="Home" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<TopNavHeading heading="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('NavIcon', () => {
  it('renders icon content', () => {
    render(<NavIcon icon={<span data-testid="icon">Icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<NavIcon icon={<span>Icon</span>} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});

describe('TopNavItem', () => {
  it('renders label as visible text', () => {
    render(<TopNavItem label="Home" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders as anchor element', () => {
    render(<TopNavItem label="Home" href="/" />);
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders children instead of label when provided', () => {
    render(
      <TopNavItem label="Accessible name">Custom content</TopNavItem>,
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('applies aria-current when isSelected', () => {
    render(<TopNavItem label="Home" href="#" isSelected />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('does not have aria-current when not selected', () => {
    render(<TopNavItem label="Home" href="#" />);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
  });

  it('applies aria-disabled when isDisabled', () => {
    render(<TopNavItem label="Home" href="#" isDisabled />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets tabIndex to -1 when disabled', () => {
    render(<TopNavItem label="Home" href="#" isDisabled />);
    expect(screen.getByRole('link')).toHaveAttribute('tabIndex', '-1');
  });

  it('renders icon with label', () => {
    render(
      <TopNavItem
        label="Settings"
        icon={<span data-testid="icon">Icon</span>}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides label and sets aria-label when isIconOnly', () => {
    render(
      <TopNavItem
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
    render(<TopNavItem label="Click me" href="#" onClick={handleClick} />);

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<TopNavItem label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders custom component when as is provided', () => {
    render(<TopNavItem label="Home" href="/" as={CustomLink} />);
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders custom component from LinkProvider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <TopNavItem label="Home" href="/" />
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides LinkProvider', () => {
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
      <LinkProvider component={AnotherLink}>
        <TopNavItem label="Home" href="/" as={CustomLink} />
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

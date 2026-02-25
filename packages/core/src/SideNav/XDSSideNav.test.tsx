/**
 * @file XDSSideNav.test.tsx
 * @input Uses vitest, @testing-library/react, SideNav components
 * @output Unit tests for XDSSideNav component suite
 * @position Testing; validates SideNav implementations
 *
 * SYNC: When SideNav components change, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSSideNav} from './XDSSideNav';
import {XDSSideNavHeader} from './XDSSideNavHeader';
import {XDSSideNavItem} from './XDSSideNavItem';
import {XDSSideNavSection} from './XDSSideNavSection';

// =============================================================================
// XDSSideNav
// =============================================================================

describe('XDSSideNav', () => {
  it('renders with navigation role', () => {
    render(<XDSSideNav>Content</XDSSideNav>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders aria-label for page navigation', () => {
    render(<XDSSideNav>Content</XDSSideNav>);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Side navigation',
    );
  });

  it('renders children in scrollable area', () => {
    render(
      <XDSSideNav>
        <span data-testid="nav-content">Nav items</span>
      </XDSSideNav>,
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(
      <XDSSideNav header={<span data-testid="header">Header</span>}>
        Content
      </XDSSideNav>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders topContent slot', () => {
    render(
      <XDSSideNav topContent={<span data-testid="sticky">Sticky</span>}>
        Content
      </XDSSideNav>,
    );
    expect(screen.getByTestId('sticky')).toBeInTheDocument();
  });

  it('renders footer slot', () => {
    render(
      <XDSSideNav footer={<span data-testid="footer">Footer</span>}>
        Content
      </XDSSideNav>,
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders footerIcons slot', () => {
    render(
      <XDSSideNav footerIcons={<span data-testid="footer-icons">Icons</span>}>
        Content
      </XDSSideNav>,
    );
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <XDSSideNav
        header={<span data-testid="header">Header</span>}
        topContent={<span data-testid="sticky">Sticky</span>}
        footer={<span data-testid="footer">Footer</span>}
        footerIcons={<span data-testid="icons">Icons</span>}>
        <span data-testid="content">Content</span>
      </XDSSideNav>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sticky')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('icons')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSSideNav ref={ref}>Content</XDSSideNav>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes data-testid to root', () => {
    render(<XDSSideNav data-testid="page-nav">Content</XDSSideNav>);
    expect(screen.getByTestId('page-nav')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSSideNavHeader
// =============================================================================

describe('XDSSideNavHeader', () => {
  it('renders title text', () => {
    render(<XDSSideNavHeader title="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <XDSSideNavHeader
        title="My App"
        icon={<span data-testid="app-icon">🏠</span>}
      />,
    );
    expect(screen.getByTestId('app-icon')).toBeInTheDocument();
  });

  it('renders supertitle', () => {
    render(<XDSSideNavHeader title="Product" supertitle="Suite Name" />);
    expect(screen.getByText('Suite Name')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<XDSSideNavHeader title="Product" subtitle="Account" />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders as link when titleHref is provided without menu', () => {
    render(<XDSSideNavHeader title="My App" titleHref="/home" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveTextContent('My App');
  });

  it('renders independent links when titleHref and supertitleHref are provided', () => {
    render(
      <XDSSideNavHeader
        title="Product"
        titleHref="/product"
        supertitle="Suite"
        supertitleHref="/suite"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/suite');
    expect(links[1]).toHaveAttribute('href', '/product');
  });

  it('shows chevron when menu is provided', () => {
    render(<XDSSideNavHeader title="My App" menu={<div>Menu content</div>} />);
    // The chevron SVG should be rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('does not show chevron without menu', () => {
    const {container} = render(<XDSSideNavHeader title="My App" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('whole header is popover trigger when menu provided without hrefs', () => {
    render(<XDSSideNavHeader title="My App" menu={<div>Menu</div>} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles popover on click when menu is provided', async () => {
    const user = userEvent.setup();
    render(
      <XDSSideNavHeader
        title="My App"
        menu={<div data-testid="menu-content">Menu</div>}
      />,
    );
    const button = screen.getByRole('button');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders chevron as separate trigger when menu and hrefs are provided', () => {
    render(
      <XDSSideNavHeader
        title="Product"
        titleHref="/product"
        menu={<div>Menu</div>}
      />,
    );
    const button = screen.getByRole('button', {name: 'Open menu'});
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('passes data-testid', () => {
    render(<XDSSideNavHeader title="My App" data-testid="nav-header" />);
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSSideNavItem
// =============================================================================

describe('XDSSideNavItem', () => {
  it('renders label text', () => {
    render(<XDSSideNavItem label="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    render(<XDSSideNavItem label="Dashboard" href="/dashboard" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders as button when no href', () => {
    render(<XDSSideNavItem label="Dashboard" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sets aria-current="page" when selected', () => {
    render(<XDSSideNavItem label="Dashboard" isSelected />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when not selected', () => {
    render(<XDSSideNavItem label="Dashboard" />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-current');
  });

  it('disables the button when isDisabled', () => {
    render(<XDSSideNavItem label="Dashboard" isDisabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSSideNavItem label="Dashboard" onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders endContent', () => {
    render(
      <XDSSideNavItem
        label="Projects"
        endContent={<span data-testid="badge">3</span>}
      />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders nested children', () => {
    render(
      <XDSSideNavItem label="Settings">
        <XDSSideNavItem label="General" />
        <XDSSideNavItem label="Security" />
      </XDSSideNavItem>,
    );
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('passes data-testid', () => {
    render(<XDSSideNavItem label="Dashboard" data-testid="nav-item" />);
    expect(screen.getByTestId('nav-item')).toBeInTheDocument();
  });

  it('renders with selected link', () => {
    render(<XDSSideNavItem label="Dashboard" href="/dashboard" isSelected />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
  });
});

// =============================================================================
// XDSSideNavSection
// =============================================================================

describe('XDSSideNavSection', () => {
  it('renders with group role', () => {
    render(
      <XDSSideNavSection title="Main">
        <XDSSideNavItem label="Dashboard" />
      </XDSSideNavSection>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders title text', () => {
    render(
      <XDSSideNavSection title="Main">
        <XDSSideNavItem label="Dashboard" />
      </XDSSideNavSection>,
    );
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('uses aria-labelledby to link title to group', () => {
    render(
      <XDSSideNavSection title="Main">
        <XDSSideNavItem label="Dashboard" />
      </XDSSideNavSection>,
    );
    const group = screen.getByRole('group');
    const labelId = group.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const label = document.getElementById(labelId!);
    expect(label).toHaveTextContent('Main');
  });

  it('renders subtitle', () => {
    render(
      <XDSSideNavSection title="Main" subtitle="Primary navigation">
        <XDSSideNavItem label="Dashboard" />
      </XDSSideNavSection>,
    );
    expect(screen.getByText('Primary navigation')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <XDSSideNavSection
        title="Main"
        endContent={<span data-testid="section-action">+</span>}>
        <XDSSideNavItem label="Dashboard" />
      </XDSSideNavSection>,
    );
    expect(screen.getByTestId('section-action')).toBeInTheDocument();
  });

  it('passes data-testid', () => {
    render(
      <XDSSideNavSection title="Main" data-testid="nav-section">
        <XDSSideNavItem label="Dashboard" />
      </XDSSideNavSection>,
    );
    expect(screen.getByTestId('nav-section')).toBeInTheDocument();
  });
});

// =============================================================================
// Integration
// =============================================================================

describe('SideNav integration', () => {
  it('renders a complete page nav', () => {
    render(
      <XDSSideNav
        header={<XDSSideNavHeader title="My App" />}
        topContent={<button>Create</button>}
        footer={<div data-testid="promo">Promo</div>}
        footerIcons={<button>Help</button>}>
        <XDSSideNavSection title="Main">
          <XDSSideNavItem label="Dashboard" isSelected />
          <XDSSideNavItem label="Projects" />
        </XDSSideNavSection>
        <XDSSideNavSection title="Settings">
          <XDSSideNavItem label="General" />
        </XDSSideNavSection>
      </XDSSideNav>,
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('My App')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByTestId('promo')).toBeInTheDocument();
  });
});

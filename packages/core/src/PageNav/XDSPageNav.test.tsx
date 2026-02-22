/**
 * @file XDSPageNav.test.tsx
 * @input Uses vitest, @testing-library/react, PageNav components
 * @output Unit tests for XDSPageNav component suite
 * @position Testing; validates PageNav implementations
 *
 * SYNC: When PageNav components change, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSPageNav} from './XDSPageNav';
import {XDSPageNavHeader} from './XDSPageNavHeader';
import {XDSPageNavItem} from './XDSPageNavItem';
import {XDSPageNavSection} from './XDSPageNavSection';

// =============================================================================
// XDSPageNav
// =============================================================================

describe('XDSPageNav', () => {
  it('renders with navigation role', () => {
    render(<XDSPageNav>Content</XDSPageNav>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders aria-label for page navigation', () => {
    render(<XDSPageNav>Content</XDSPageNav>);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Page navigation',
    );
  });

  it('renders children in scrollable area', () => {
    render(
      <XDSPageNav>
        <span data-testid="nav-content">Nav items</span>
      </XDSPageNav>,
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(
      <XDSPageNav header={<span data-testid="header">Header</span>}>
        Content
      </XDSPageNav>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders topContent slot', () => {
    render(
      <XDSPageNav topContent={<span data-testid="sticky">Sticky</span>}>
        Content
      </XDSPageNav>,
    );
    expect(screen.getByTestId('sticky')).toBeInTheDocument();
  });

  it('renders footer slot', () => {
    render(
      <XDSPageNav footer={<span data-testid="footer">Footer</span>}>
        Content
      </XDSPageNav>,
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders footerIcons slot', () => {
    render(
      <XDSPageNav footerIcons={<span data-testid="footer-icons">Icons</span>}>
        Content
      </XDSPageNav>,
    );
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <XDSPageNav
        header={<span data-testid="header">Header</span>}
        topContent={<span data-testid="sticky">Sticky</span>}
        footer={<span data-testid="footer">Footer</span>}
        footerIcons={<span data-testid="icons">Icons</span>}>
        <span data-testid="content">Content</span>
      </XDSPageNav>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sticky')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('icons')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSPageNav ref={ref}>Content</XDSPageNav>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes data-testid to root', () => {
    render(<XDSPageNav data-testid="page-nav">Content</XDSPageNav>);
    expect(screen.getByTestId('page-nav')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSPageNavHeader
// =============================================================================

describe('XDSPageNavHeader', () => {
  it('renders title text', () => {
    render(<XDSPageNavHeader title="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <XDSPageNavHeader
        title="My App"
        icon={<span data-testid="app-icon">🏠</span>}
      />,
    );
    expect(screen.getByTestId('app-icon')).toBeInTheDocument();
  });

  it('renders supertitle', () => {
    render(<XDSPageNavHeader title="Product" supertitle="Suite Name" />);
    expect(screen.getByText('Suite Name')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<XDSPageNavHeader title="Product" subtitle="Account" />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders as link when titleHref is provided without menu', () => {
    render(<XDSPageNavHeader title="My App" titleHref="/home" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveTextContent('My App');
  });

  it('renders independent links when titleHref and supertitleHref are provided', () => {
    render(
      <XDSPageNavHeader
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
    render(<XDSPageNavHeader title="My App" menu={<div>Menu content</div>} />);
    // The chevron SVG should be rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('does not show chevron without menu', () => {
    const {container} = render(<XDSPageNavHeader title="My App" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('whole header is popover trigger when menu provided without hrefs', () => {
    render(<XDSPageNavHeader title="My App" menu={<div>Menu</div>} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles popover on click when menu is provided', async () => {
    const user = userEvent.setup();
    render(
      <XDSPageNavHeader
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
      <XDSPageNavHeader
        title="Product"
        titleHref="/product"
        menu={<div>Menu</div>}
      />,
    );
    const button = screen.getByRole('button', {name: 'Open menu'});
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('passes data-testid', () => {
    render(<XDSPageNavHeader title="My App" data-testid="nav-header" />);
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSPageNavItem
// =============================================================================

describe('XDSPageNavItem', () => {
  it('renders label text', () => {
    render(<XDSPageNavItem label="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    render(<XDSPageNavItem label="Dashboard" href="/dashboard" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders as button when no href', () => {
    render(<XDSPageNavItem label="Dashboard" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sets aria-current="page" when selected', () => {
    render(<XDSPageNavItem label="Dashboard" isSelected />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when not selected', () => {
    render(<XDSPageNavItem label="Dashboard" />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-current');
  });

  it('disables the button when isDisabled', () => {
    render(<XDSPageNavItem label="Dashboard" isDisabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<XDSPageNavItem label="Dashboard" onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders endContent', () => {
    render(
      <XDSPageNavItem
        label="Projects"
        endContent={<span data-testid="badge">3</span>}
      />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders nested children', () => {
    render(
      <XDSPageNavItem label="Settings">
        <XDSPageNavItem label="General" />
        <XDSPageNavItem label="Security" />
      </XDSPageNavItem>,
    );
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('passes data-testid', () => {
    render(<XDSPageNavItem label="Dashboard" data-testid="nav-item" />);
    expect(screen.getByTestId('nav-item')).toBeInTheDocument();
  });

  it('renders with selected link', () => {
    render(<XDSPageNavItem label="Dashboard" href="/dashboard" isSelected />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
  });
});

// =============================================================================
// XDSPageNavSection
// =============================================================================

describe('XDSPageNavSection', () => {
  it('renders with group role', () => {
    render(
      <XDSPageNavSection title="Main">
        <XDSPageNavItem label="Dashboard" />
      </XDSPageNavSection>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders title text', () => {
    render(
      <XDSPageNavSection title="Main">
        <XDSPageNavItem label="Dashboard" />
      </XDSPageNavSection>,
    );
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('uses aria-labelledby to link title to group', () => {
    render(
      <XDSPageNavSection title="Main">
        <XDSPageNavItem label="Dashboard" />
      </XDSPageNavSection>,
    );
    const group = screen.getByRole('group');
    const labelId = group.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const label = document.getElementById(labelId!);
    expect(label).toHaveTextContent('Main');
  });

  it('renders subtitle', () => {
    render(
      <XDSPageNavSection title="Main" subtitle="Primary navigation">
        <XDSPageNavItem label="Dashboard" />
      </XDSPageNavSection>,
    );
    expect(screen.getByText('Primary navigation')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <XDSPageNavSection
        title="Main"
        endContent={<span data-testid="section-action">+</span>}>
        <XDSPageNavItem label="Dashboard" />
      </XDSPageNavSection>,
    );
    expect(screen.getByTestId('section-action')).toBeInTheDocument();
  });

  it('passes data-testid', () => {
    render(
      <XDSPageNavSection title="Main" data-testid="nav-section">
        <XDSPageNavItem label="Dashboard" />
      </XDSPageNavSection>,
    );
    expect(screen.getByTestId('nav-section')).toBeInTheDocument();
  });
});

// =============================================================================
// Integration
// =============================================================================

describe('PageNav integration', () => {
  it('renders a complete page nav', () => {
    render(
      <XDSPageNav
        header={<XDSPageNavHeader title="My App" />}
        topContent={<button>Create</button>}
        footer={<div data-testid="promo">Promo</div>}
        footerIcons={<button>Help</button>}>
        <XDSPageNavSection title="Main">
          <XDSPageNavItem label="Dashboard" isSelected />
          <XDSPageNavItem label="Projects" />
        </XDSPageNavSection>
        <XDSPageNavSection title="Settings">
          <XDSPageNavItem label="General" />
        </XDSPageNavSection>
      </XDSPageNav>,
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('My App')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByTestId('promo')).toBeInTheDocument();
  });
});

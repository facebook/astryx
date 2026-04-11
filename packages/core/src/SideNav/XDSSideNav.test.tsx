/**
 * @file XDSSideNav.test.tsx
 * @input Uses vitest, @testing-library/react, SideNav components
 * @output Unit tests for XDSSideNav component suite
 * @position Testing; validates SideNav implementations
 *
 * SYNC: When SideNav components change, update tests to match new behavior
 */

import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {forwardRef, type ComponentPropsWithoutRef, type ReactNode} from 'react';
import {XDSSideNav} from './XDSSideNav';
import {XDSSideNavHeading} from './XDSSideNavHeading';
import {XDSSideNavItem} from './XDSSideNavItem';
import {XDSSideNavSection} from './XDSSideNavSection';
import {XDSLinkProvider} from '../Link/XDSLinkProvider';
import {XDSSideNavCollapseContext} from './XDSSideNavCollapseContext';

const CustomLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(
  ({children, ...props}, ref) => (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  ),
);
CustomLink.displayName = 'CustomLink';

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
// XDSSideNavHeading
// =============================================================================

describe('XDSSideNavHeading', () => {
  it('renders heading text', () => {
    render(<XDSSideNavHeading heading="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        icon={<span data-testid="app-icon">🏠</span>}
      />,
    );
    expect(screen.getByTestId('app-icon')).toBeInTheDocument();
  });

  it('renders superheading', () => {
    render(<XDSSideNavHeading heading="Product" superheading="Suite Name" />);
    expect(screen.getByText('Suite Name')).toBeInTheDocument();
  });

  it('renders subheading', () => {
    render(<XDSSideNavHeading heading="Product" subheading="Account" />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders as link when headingHref is provided without menu', () => {
    render(<XDSSideNavHeading heading="My App" headingHref="/home" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveTextContent('My App');
  });

  it('uses custom link component from as prop', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        headingHref="/home"
        as={CustomLink}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('uses custom link component from XDSLinkProvider', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSSideNavHeading heading="My App" headingHref="/home" />
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('renders independent links when headingHref and superheadingHref are provided', () => {
    render(
      <XDSSideNavHeading
        heading="Product"
        headingHref="/product"
        superheading="Suite"
        superheadingHref="/suite"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/suite');
    expect(links[1]).toHaveAttribute('href', '/product');
  });

  it('shows chevron when menu is provided', () => {
    render(
      <XDSSideNavHeading heading="My App" menu={<div>Menu content</div>} />,
    );
    // The chevron SVG should be rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('does not show chevron without menu', () => {
    const {container} = render(<XDSSideNavHeading heading="My App" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('whole heading is popover trigger when menu provided without hrefs', () => {
    render(<XDSSideNavHeading heading="My App" menu={<div>Menu</div>} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('has popoverTarget on trigger button when menu is provided', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        menu={<div data-testid="menu-content">Menu</div>}
      />,
    );
    const button = screen.getByRole('button');
    // Native popover toggle via popoverTarget attribute (jsdom doesn't
    // support the Popover API, so we verify the attribute is set instead
    // of testing the full open/close cycle).
    expect(button).toHaveAttribute('popovertarget');
  });

  it('renders chevron as separate trigger when menu and hrefs are provided', () => {
    render(
      <XDSSideNavHeading
        heading="Product"
        headingHref="/product"
        menu={<div>Menu</div>}
      />,
    );
    const button = screen.getByRole('button', {name: 'Open menu'});
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('passes data-testid', () => {
    render(<XDSSideNavHeading heading="My App" data-testid="nav-header" />);
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSSideNavHeading — collapsed mode
// =============================================================================

function CollapsedWrapper({children}: {children: ReactNode}) {
  return (
    <XDSSideNavCollapseContext.Provider
      value={{isCollapsed: true, toggle: () => {}, isCollapsible: true}}>
      {children}
    </XDSSideNavCollapseContext.Provider>
  );
}

describe('XDSSideNavHeading collapsed', () => {
  it('returns null when collapsed without icon', () => {
    const {container} = render(
      <CollapsedWrapper>
        <XDSSideNavHeading heading="My App" />
      </CollapsedWrapper>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders icon when collapsed with icon', () => {
    render(
      <CollapsedWrapper>
        <XDSSideNavHeading
          heading="My App"
          icon={<span data-testid="app-icon">🏠</span>}
        />
      </CollapsedWrapper>,
    );
    expect(screen.getByTestId('app-icon')).toBeInTheDocument();
  });

  it('does not show heading text inline when collapsed (only in tooltip)', () => {
    const {container} = render(
      <CollapsedWrapper>
        <XDSSideNavHeading
          heading="My App"
          icon={<span data-testid="app-icon">🏠</span>}
        />
      </CollapsedWrapper>,
    );
    // The heading text should not appear as a visible inline element
    // (it exists only in the tooltip for accessibility)
    const headingSpans = container.querySelectorAll('span');
    const inlineHeadingText = Array.from(headingSpans).find(
      el =>
        el.textContent === 'My App' &&
        !el.closest('[role="tooltip"]') &&
        !el.hasAttribute('data-tooltip'),
    );
    expect(inlineHeadingText).toBeUndefined();
  });

  it('renders as link when collapsed with headingHref', () => {
    render(
      <CollapsedWrapper>
        <XDSSideNavHeading
          heading="My App"
          headingHref="/home"
          icon={<span data-testid="app-icon">🏠</span>}
        />
      </CollapsedWrapper>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveAttribute('aria-label', 'My App');
  });

  it('does not show chevron when collapsed', () => {
    const {container} = render(
      <CollapsedWrapper>
        <XDSSideNavHeading
          heading="My App"
          headingHref="/home"
          icon={<span data-testid="app-icon">🏠</span>}
          menu={<div>Menu</div>}
        />
      </CollapsedWrapper>,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('passes data-testid when collapsed', () => {
    render(
      <CollapsedWrapper>
        <XDSSideNavHeading
          heading="My App"
          icon={<span>🏠</span>}
          data-testid="nav-header"
        />
      </CollapsedWrapper>,
    );
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSSideNavHeading — headerEndContent
// =============================================================================

describe('XDSSideNavHeading headerEndContent', () => {
  it('renders headerEndContent in the default static path', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        headerEndContent={<span data-testid="end-badge">3</span>}
      />,
    );
    expect(screen.getByTestId('end-badge')).toBeInTheDocument();
  });

  it('renders headerEndContent inside the link in isWholeHeadingLink path', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        headingHref="/home"
        headerEndContent={<span data-testid="end-badge">3</span>}
      />,
    );
    const badge = screen.getByTestId('end-badge');
    expect(badge).toBeInTheDocument();
    // Badge renders inside the link
    expect(badge.closest('a')).not.toBeNull();
  });

  it('renders headerEndContent in isWholeHeadingTrigger path', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        menu={<div>Menu</div>}
        headerEndContent={<span data-testid="end-badge">3</span>}
      />,
    );
    const badge = screen.getByTestId('end-badge');
    expect(badge).toBeInTheDocument();
    // Badge renders inside the heading container (div), alongside the chevron button
    expect(badge.closest('[class]')).not.toBeNull();
  });

  it('renders headerEndContent in mixed mode (menu + href)', () => {
    render(
      <XDSSideNavHeading
        heading="My App"
        headingHref="/home"
        menu={<div>Menu</div>}
        headerEndContent={<span data-testid="end-badge">3</span>}
      />,
    );
    expect(screen.getByTestId('end-badge')).toBeInTheDocument();
  });

  it('renders headerEndContent with independent links (no menu)', () => {
    render(
      <XDSSideNavHeading
        heading="Product"
        headingHref="/product"
        superheading="Suite"
        superheadingHref="/suite"
        headerEndContent={<span data-testid="end-badge">3</span>}
      />,
    );
    expect(screen.getByTestId('end-badge')).toBeInTheDocument();
  });

  it('hides headerEndContent when collapsed', () => {
    render(
      <CollapsedWrapper>
        <XDSSideNavHeading
          heading="My App"
          icon={<span>🏠</span>}
          headerEndContent={<span data-testid="end-badge">3</span>}
        />
      </CollapsedWrapper>,
    );
    expect(screen.queryByTestId('end-badge')).not.toBeInTheDocument();
  });
});

// =============================================================================
// XDSSideNavHeading — truncation tooltips
// =============================================================================

describe('XDSSideNavHeading truncation tooltips', () => {
  it('attaches truncation refs to heading text spans', () => {
    const {container} = render(
      <XDSSideNavHeading
        heading="My App"
        superheading="Acme Corp"
        subheading="admin@acme.com"
      />,
    );
    // All three text spans should be present
    expect(screen.getByText('My App')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('admin@acme.com')).toBeInTheDocument();
  });

  it('does not crash with truncation hooks when only heading is provided', () => {
    render(<XDSSideNavHeading heading="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
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

  it('renders custom component when as and href are provided', () => {
    render(
      <XDSSideNavItem label="Dashboard" href="/dashboard" as={CustomLink} />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('still renders button when no href even with as prop', () => {
    render(<XDSSideNavItem label="Dashboard" as={CustomLink} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('data-custom-link');
  });

  it('renders custom component from XDSLinkProvider when href is provided', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSSideNavItem label="Dashboard" href="/dashboard" />
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
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

  it('renders heading text', () => {
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

  it('renders subheading', () => {
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
// Resizable
// =============================================================================

describe('XDSSideNav resizable', () => {
  it('renders drag handle when resizable', () => {
    render(<XDSSideNav resizable>Content</XDSSideNav>);
    expect(screen.getByTestId('xds-sidenav-resize-handle')).toBeInTheDocument();
  });

  it('does not render drag handle without resizable', () => {
    render(<XDSSideNav>Content</XDSSideNav>);
    expect(
      screen.queryByTestId('xds-sidenav-resize-handle'),
    ).not.toBeInTheDocument();
  });

  it('does not render drag handle when collapsed', () => {
    render(
      <XDSSideNav
        resizable
        collapsible={{isCollapsed: true, onCollapsedChange: () => {}}}>
        Content
      </XDSSideNav>,
    );
    expect(
      screen.queryByTestId('xds-sidenav-resize-handle'),
    ).not.toBeInTheDocument();
  });

  it('calls onWidthChange after drag', () => {
    const handleWidthChange = vi.fn();
    render(
      <XDSSideNav resizable={{onWidthChange: handleWidthChange}}>
        Content
      </XDSSideNav>,
    );
    const handle = screen.getByTestId('xds-sidenav-resize-handle');

    // Simulate pointer drag sequence
    act(() => {
      handle.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: 260,
          bubbles: true,
        }),
      );
      document.dispatchEvent(
        new PointerEvent('pointermove', {clientX: 310, bubbles: true}),
      );
      document.dispatchEvent(
        new PointerEvent('pointerup', {clientX: 310, bubbles: true}),
      );
    });

    expect(handleWidthChange).toHaveBeenCalledTimes(1);
    expect(handleWidthChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it('respects defaultWidth', () => {
    render(<XDSSideNav resizable={{defaultWidth: 300}}>Content</XDSSideNav>);
    const nav = screen.getByRole('navigation');
    expect(nav.style.width).toBe('300px');
  });

  it('drag handle has separator role', () => {
    render(<XDSSideNav resizable>Content</XDSSideNav>);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

// =============================================================================
// Integration
// =============================================================================

describe('SideNav integration', () => {
  it('renders a complete page nav', () => {
    render(
      <XDSSideNav
        header={<XDSSideNavHeading heading="My App" />}
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

// Stub icon for testing
const StubIcon = () => <svg data-testid="stub-icon" />;

/** Helper to render inside a collapsed SideNav context */
function renderCollapsed(ui: React.ReactElement) {
  return render(
    <XDSSideNavCollapseContext
      value={{isCollapsed: true, toggle: () => {}, isCollapsible: true}}>
      {ui}
    </XDSSideNavCollapseContext>,
  );
}

/** Helper to render inside an expanded SideNav context */
function renderExpanded(ui: React.ReactElement) {
  return render(
    <XDSSideNavCollapseContext
      value={{isCollapsed: false, toggle: () => {}, isCollapsible: true}}>
      {ui}
    </XDSSideNavCollapseContext>,
  );
}

// =============================================================================
// XDSSideNavItem — Collapsed mode
// =============================================================================

describe('XDSSideNavItem (collapsed)', () => {
  it('hides items without icons when collapsed', () => {
    const {container} = renderCollapsed(
      <XDSSideNavItem label="No Icon Item" />,
    );
    expect(screen.queryByText('No Icon Item')).not.toBeInTheDocument();
    expect(container.querySelector('[data-xds="side-nav-item"]')).toBeNull();
  });

  it('renders icon-only button when collapsed with icon and no children', () => {
    renderCollapsed(
      <XDSSideNavItem label="Dashboard" icon={StubIcon} data-testid="item" />,
    );
    // Should have an element with aria-label (icon-only)
    const item = screen.getByLabelText('Dashboard');
    expect(item).toBeInTheDocument();
    // Icon should be rendered
    expect(screen.getByTestId('stub-icon')).toBeInTheDocument();
  });

  it('renders collapsed link when href is provided', () => {
    renderCollapsed(
      <XDSSideNavItem label="Dashboard" icon={StubIcon} href="/dashboard" />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveAttribute('aria-label', 'Dashboard');
  });

  it('renders popover trigger when collapsed with icon and children', () => {
    renderCollapsed(
      <XDSSideNavItem label="Settings" icon={StubIcon} data-testid="parent">
        <XDSSideNavItem label="General" />
        <XDSSideNavItem label="Security" />
      </XDSSideNavItem>,
    );
    const trigger = screen.getByTestId('parent');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-label', 'Settings');
  });

  it('opens popover on click showing children in expanded form', async () => {
    const user = userEvent.setup();
    renderCollapsed(
      <XDSSideNavItem label="Settings" icon={StubIcon} data-testid="parent">
        <XDSSideNavItem label="General" data-testid="child-general" />
        <XDSSideNavItem label="Security" data-testid="child-security" />
      </XDSSideNavItem>,
    );
    await user.click(screen.getByTestId('parent'));

    // Children should be visible in expanded form (label text visible)
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('shows parent label as header in the popover', async () => {
    const user = userEvent.setup();
    renderCollapsed(
      <XDSSideNavItem label="Settings" icon={StubIcon} data-testid="parent">
        <XDSSideNavItem label="General" />
      </XDSSideNavItem>,
    );
    await user.click(screen.getByTestId('parent'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render children without icon when collapsed', () => {
    renderCollapsed(
      <XDSSideNavItem label="Settings">
        <XDSSideNavItem label="General" />
        <XDSSideNavItem label="Security" />
      </XDSSideNavItem>,
    );
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('General')).not.toBeInTheDocument();
  });

  it('renders normally when not collapsed', () => {
    renderExpanded(
      <XDSSideNavItem label="Dashboard" icon={StubIcon}>
        <XDSSideNavItem label="General" />
      </XDSSideNavItem>,
    );
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});

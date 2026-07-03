// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SideNav.test.tsx
 * @input Uses vitest, @testing-library/react, SideNav components
 * @output Unit tests for SideNav component suite
 * @position Testing; validates SideNav implementations
 *
 * SYNC: When SideNav components change, update tests to match new behavior
 */

import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen, act, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef, useState, type ReactNode} from 'react';
import {SideNav} from './SideNav';
import {SideNavCollapseButton} from './SideNavCollapseButton';
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';
import {LinkProvider} from '../Link/LinkProvider';
import {
  SideNavCollapseContext,
  type SideNavImperativeCollapseHandle,
} from './SideNavCollapseContext';

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

// =============================================================================
// SideNav
// =============================================================================

describe('SideNav', () => {
  it('renders with navigation role', () => {
    render(<SideNav>Content</SideNav>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders aria-label for page navigation', () => {
    render(<SideNav>Content</SideNav>);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Side navigation',
    );
  });

  it('renders children in scrollable area', () => {
    render(
      <SideNav>
        <span data-testid="nav-content">Nav items</span>
      </SideNav>,
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(
      <SideNav header={<span data-testid="header">Header</span>}>
        Content
      </SideNav>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders topContent slot', () => {
    render(
      <SideNav topContent={<span data-testid="sticky">Sticky</span>}>
        Content
      </SideNav>,
    );
    expect(screen.getByTestId('sticky')).toBeInTheDocument();
  });

  it('renders footer slot', () => {
    render(
      <SideNav footer={<span data-testid="footer">Footer</span>}>
        Content
      </SideNav>,
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders footerIcons slot', () => {
    render(
      <SideNav footerIcons={<span data-testid="footer-icons">Icons</span>}>
        Content
      </SideNav>,
    );
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <SideNav
        header={<span data-testid="header">Header</span>}
        topContent={<span data-testid="sticky">Sticky</span>}
        footer={<span data-testid="footer">Footer</span>}
        footerIcons={<span data-testid="icons">Icons</span>}>
        <span data-testid="content">Content</span>
      </SideNav>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sticky')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('icons')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<SideNav ref={ref}>Content</SideNav>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes data-testid to root', () => {
    render(<SideNav data-testid="page-nav">Content</SideNav>);
    expect(screen.getByTestId('page-nav')).toBeInTheDocument();
  });

  it('renders and toggles from outside SideNav when handleRef is provided', async () => {
    const user = userEvent.setup();

    function Example() {
      const [isCollapsed, setIsCollapsed] = useState(false);
      const handleRef = useRef<SideNavImperativeCollapseHandle>(null);

      return (
        <>
          <SideNavCollapseButton handleRef={handleRef} />
          <SideNav
            handleRef={handleRef}
            collapsible={{
              isCollapsed,
              onCollapsedChange: setIsCollapsed,
              hasButton: false,
            }}>
            <SideNavSection title="Main">
              <SideNavItem label="Dashboard" icon={StubIcon} />
            </SideNavSection>
          </SideNav>
        </>
      );
    }

    render(<Example />);

    const button = screen.getByRole('button', {name: 'Collapse sidebar'});
    await user.click(button);

    expect(
      screen.getByRole('button', {name: 'Expand sidebar'}),
    ).toBeInTheDocument();
  });
});

// =============================================================================
// SideNavHeading
// =============================================================================

describe('SideNavHeading', () => {
  it('renders heading text', () => {
    render(<SideNavHeading heading="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <SideNavHeading
        heading="My App"
        icon={<span data-testid="app-icon">🏠</span>}
      />,
    );
    expect(screen.getByTestId('app-icon')).toBeInTheDocument();
  });

  it('renders superheading', () => {
    render(<SideNavHeading heading="Product" superheading="Suite Name" />);
    expect(screen.getByText('Suite Name')).toBeInTheDocument();
  });

  it('renders subheading', () => {
    render(<SideNavHeading heading="Product" subheading="Account" />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders as link when headingHref is provided without menu', () => {
    render(<SideNavHeading heading="My App" headingHref="/home" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveTextContent('My App');
  });

  it('uses custom link component from as prop', () => {
    render(
      <SideNavHeading heading="My App" headingHref="/home" as={CustomLink} />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('uses custom link component from LinkProvider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <SideNavHeading heading="My App" headingHref="/home" />
      </LinkProvider>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('renders independent links when headingHref and superheadingHref are provided', () => {
    render(
      <SideNavHeading
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
    render(<SideNavHeading heading="My App" menu={<div>Menu content</div>} />);
    // The chevron SVG should be rendered
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('does not show chevron without menu', () => {
    const {container} = render(<SideNavHeading heading="My App" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('whole heading is popover trigger when menu provided without hrefs', () => {
    render(<SideNavHeading heading="My App" menu={<div>Menu</div>} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('has popoverTarget on trigger button when menu is provided', () => {
    render(
      <SideNavHeading
        heading="My App"
        menu={<div data-testid="menu-content">Menu</div>}
      />,
    );
    const button = screen.getByRole('button');
    // The trigger button uses aria attributes from usePopover and
    // an onClick handler from useMenuHover for click-to-lock toggle.
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded');
  });

  it('renders chevron as separate trigger when menu and hrefs are provided', () => {
    render(
      <SideNavHeading
        heading="Product"
        headingHref="/product"
        menu={<div>Menu</div>}
      />,
    );
    const button = screen.getByRole('button', {name: 'Open menu'});
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('passes data-testid', () => {
    render(<SideNavHeading heading="My App" data-testid="nav-header" />);
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });
});

// =============================================================================
// SideNavHeading — collapsed mode
// =============================================================================

const COLLAPSED_CONTEXT = {
  isCollapsed: true,
  toggle: () => {},
  isCollapsible: true,
};

function CollapsedWrapper({children}: {children: ReactNode}) {
  return (
    <SideNavCollapseContext value={COLLAPSED_CONTEXT}>
      {children}
    </SideNavCollapseContext>
  );
}

describe('SideNavHeading collapsed', () => {
  it('returns null when collapsed without icon', () => {
    const {container} = render(
      <CollapsedWrapper>
        <SideNavHeading heading="My App" />
      </CollapsedWrapper>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders icon when collapsed with icon', () => {
    render(
      <CollapsedWrapper>
        <SideNavHeading
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
        <SideNavHeading
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
        <SideNavHeading
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
        <SideNavHeading
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
        <SideNavHeading
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
// SideNavHeading — headerEndContent
// =============================================================================

describe('SideNavHeading headerEndContent', () => {
  it('renders headerEndContent in the default static path', () => {
    render(
      <SideNavHeading
        heading="My App"
        headerEndContent={<span data-testid="end-badge">3</span>}
      />,
    );
    expect(screen.getByTestId('end-badge')).toBeInTheDocument();
  });

  it('renders headerEndContent inside the link in isWholeHeadingLink path', () => {
    render(
      <SideNavHeading
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
      <SideNavHeading
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
      <SideNavHeading
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
      <SideNavHeading
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
        <SideNavHeading
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
// SideNavHeading — truncation tooltips
// =============================================================================

describe('SideNavHeading truncation tooltips', () => {
  it('attaches truncation refs to heading text spans', () => {
    render(
      <SideNavHeading
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
    render(<SideNavHeading heading="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });
});

// =============================================================================
// SideNavItem
// =============================================================================

describe('SideNavItem', () => {
  it('renders label text', () => {
    render(<SideNavItem label="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    render(<SideNavItem label="Dashboard" href="/dashboard" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders as button when no href', () => {
    render(<SideNavItem label="Dashboard" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('sets aria-current="page" when selected', () => {
    render(<SideNavItem label="Dashboard" isSelected />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when not selected', () => {
    render(<SideNavItem label="Dashboard" />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('aria-current');
  });

  it('disables the button when isDisabled', () => {
    render(<SideNavItem label="Dashboard" isDisabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<SideNavItem label="Dashboard" onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders endContent', () => {
    render(
      <SideNavItem
        label="Projects"
        endContent={<span data-testid="badge">3</span>}
      />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders nested children', () => {
    render(
      <SideNavItem label="Settings">
        <SideNavItem label="General" />
        <SideNavItem label="Security" />
      </SideNavItem>,
    );
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('passes data-testid', () => {
    render(<SideNavItem label="Dashboard" data-testid="nav-item" />);
    expect(screen.getByTestId('nav-item')).toBeInTheDocument();
  });

  it('renders with selected link', () => {
    render(<SideNavItem label="Dashboard" href="/dashboard" isSelected />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('places aria-current on the link, not the wrapper, for split-action items', () => {
    // A collapsible item (has children) WITH a primary href renders the
    // split-action path: the link and the expand toggle are siblings inside a
    // wrapper div. aria-current="page" must sit on the focusable link so it is
    // announced as the current page (navigation-8).
    render(
      <SideNavItem label="Reports" href="/reports" isSelected>
        <SideNavItem label="Weekly" href="/reports/weekly" />
      </SideNavItem>,
    );
    const link = screen.getByRole('link', {name: /Reports/});
    expect(link).toHaveAttribute('aria-current', 'page');
    // The wrapper div must NOT carry aria-current.
    expect(link.closest('[aria-current="page"]')).toBe(link);
  });

  it('renders custom component when as and href are provided', () => {
    render(<SideNavItem label="Dashboard" href="/dashboard" as={CustomLink} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('still renders button when no href even with as prop', () => {
    render(<SideNavItem label="Dashboard" as={CustomLink} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('data-custom-link');
  });

  it('renders custom component from LinkProvider when href is provided', () => {
    render(
      <LinkProvider component={CustomLink}>
        <SideNavItem label="Dashboard" href="/dashboard" />
      </LinkProvider>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-custom-link');
  });
});

// =============================================================================
// SideNavSection
// =============================================================================

describe('SideNavSection', () => {
  it('renders with group role', () => {
    render(
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders heading text', () => {
    render(
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('uses aria-labelledby to link title to group', () => {
    render(
      <SideNavSection title="Main">
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    const group = screen.getByRole('group');
    const labelId = group.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const label = document.getElementById(labelId!);
    expect(label).toHaveTextContent('Main');
  });

  it('renders subheading', () => {
    render(
      <SideNavSection title="Main" subtitle="Primary navigation">
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    expect(screen.getByText('Primary navigation')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <SideNavSection
        title="Main"
        endContent={<span data-testid="section-action">+</span>}>
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    expect(screen.getByTestId('section-action')).toBeInTheDocument();
  });

  it('passes data-testid', () => {
    render(
      <SideNavSection title="Main" data-testid="nav-section">
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    expect(screen.getByTestId('nav-section')).toBeInTheDocument();
  });

  it('forwards className to root element', () => {
    render(
      <SideNavSection title="Main" className="custom-section">
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    const group = screen.getByRole('group');
    expect(group.className).toContain('custom-section');
  });

  it('forwards style to root element', () => {
    render(
      <SideNavSection title="Main" style={{marginTop: 16}}>
        <SideNavItem label="Dashboard" />
      </SideNavSection>,
    );
    const group = screen.getByRole('group');
    expect(group.style.marginTop).toBe('16px');
  });
});

// =============================================================================
// Resizable
// =============================================================================

describe('SideNav resizable', () => {
  it('renders drag handle when resizable', () => {
    render(<SideNav resizable>Content</SideNav>);
    expect(
      screen.getByTestId('astryx-sidenav-resize-handle'),
    ).toBeInTheDocument();
  });

  it('does not render drag handle without resizable', () => {
    render(<SideNav>Content</SideNav>);
    expect(
      screen.queryByTestId('astryx-sidenav-resize-handle'),
    ).not.toBeInTheDocument();
  });

  it('does not render drag handle when collapsed', () => {
    render(
      <SideNav
        resizable
        collapsible={{isCollapsed: true, onCollapsedChange: () => {}}}>
        Content
      </SideNav>,
    );
    expect(
      screen.queryByTestId('astryx-sidenav-resize-handle'),
    ).not.toBeInTheDocument();
  });

  it('calls onWidthChange after drag', () => {
    const handleWidthChange = vi.fn();
    render(
      <SideNav resizable={{onWidthChange: handleWidthChange}}>Content</SideNav>,
    );
    const handle = screen.getByTestId('astryx-sidenav-resize-handle');
    // The pointer event handler is on the hit area child inside the handle.
    const hitArea = handle.firstElementChild as HTMLElement;

    act(() => {
      fireEvent.pointerDown(hitArea, {clientX: 260});
      fireEvent.pointerMove(document, {clientX: 310});
      fireEvent.pointerUp(document, {clientX: 310});
    });

    expect(handleWidthChange).toHaveBeenCalledTimes(1);
    expect(handleWidthChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it('respects defaultWidth', () => {
    render(<SideNav resizable={{defaultWidth: 300}}>Content</SideNav>);
    const nav = screen.getByRole('navigation');
    expect(nav.style.width).toBe('300px');
  });

  it('drag handle has separator role', () => {
    render(<SideNav resizable>Content</SideNav>);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

// =============================================================================
// Integration
// =============================================================================

describe('SideNav integration', () => {
  it('renders a complete page nav', () => {
    render(
      <SideNav
        header={<SideNavHeading heading="My App" />}
        topContent={<button type="button">Create</button>}
        footer={<div data-testid="promo">Promo</div>}
        footerIcons={<button type="button">Help</button>}>
        <SideNavSection title="Main">
          <SideNavItem label="Dashboard" isSelected />
          <SideNavItem label="Projects" />
        </SideNavSection>
        <SideNavSection title="Settings">
          <SideNavItem label="General" />
        </SideNavSection>
      </SideNav>,
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
    <SideNavCollapseContext
      value={{isCollapsed: true, toggle: () => {}, isCollapsible: true}}>
      {ui}
    </SideNavCollapseContext>,
  );
}

/** Helper to render inside an expanded SideNav context */
function renderExpanded(ui: React.ReactElement) {
  return render(
    <SideNavCollapseContext
      value={{isCollapsed: false, toggle: () => {}, isCollapsible: true}}>
      {ui}
    </SideNavCollapseContext>,
  );
}

// =============================================================================
// SideNavItem — Collapsed mode
// =============================================================================

describe('SideNavItem (collapsed)', () => {
  it('hides items without icons when collapsed', () => {
    const {container} = renderCollapsed(<SideNavItem label="No Icon Item" />);
    expect(screen.queryByText('No Icon Item')).not.toBeInTheDocument();
    expect(container.querySelector('[data-xds="side-nav-item"]')).toBeNull();
  });

  it('renders icon-only button when collapsed with icon and no children', () => {
    renderCollapsed(
      <SideNavItem label="Dashboard" icon={StubIcon} data-testid="item" />,
    );
    // Should have an element with aria-label (icon-only)
    const item = screen.getByLabelText('Dashboard');
    expect(item).toBeInTheDocument();
    // Icon should be rendered
    expect(screen.getByTestId('stub-icon')).toBeInTheDocument();
  });

  it('renders collapsed link when href is provided', () => {
    renderCollapsed(
      <SideNavItem label="Dashboard" icon={StubIcon} href="/dashboard" />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveAttribute('aria-label', 'Dashboard');
  });

  it('renders popover trigger when collapsed with icon and children', () => {
    renderCollapsed(
      <SideNavItem label="Settings" icon={StubIcon} data-testid="parent">
        <SideNavItem label="General" />
        <SideNavItem label="Security" />
      </SideNavItem>,
    );
    const trigger = screen.getByTestId('parent');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-label', 'Settings');
  });

  it('opens popover on click showing children in expanded form', async () => {
    const user = userEvent.setup();
    renderCollapsed(
      <SideNavItem label="Settings" icon={StubIcon} data-testid="parent">
        <SideNavItem label="General" data-testid="child-general" />
        <SideNavItem label="Security" data-testid="child-security" />
      </SideNavItem>,
    );
    await user.click(screen.getByTestId('parent'));

    // Children should be visible in expanded form (label text visible)
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('shows parent label as header in the popover', async () => {
    const user = userEvent.setup();
    renderCollapsed(
      <SideNavItem label="Settings" icon={StubIcon} data-testid="parent">
        <SideNavItem label="General" />
      </SideNavItem>,
    );
    await user.click(screen.getByTestId('parent'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render children without icon when collapsed', () => {
    renderCollapsed(
      <SideNavItem label="Settings">
        <SideNavItem label="General" />
        <SideNavItem label="Security" />
      </SideNavItem>,
    );
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('General')).not.toBeInTheDocument();
  });

  it('renders normally when not collapsed', () => {
    renderExpanded(
      <SideNavItem label="Dashboard" icon={StubIcon}>
        <SideNavItem label="General" />
      </SideNavItem>,
    );
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();
  });
});

// =============================================================================
// Mobile nav close-on-activate
// =============================================================================

// =============================================================================
// SideNavItem — collapsible + href (independent toggle)
// =============================================================================

describe('SideNavItem — collapsible + href', () => {
  it('renders a link that navigates when both collapsible and href are set', () => {
    render(
      <SideNavItem
        label="Settings"
        href="/settings"
        collapsible
        data-testid="parent">
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('renders a separate toggle button for the chevron', () => {
    render(
      <SideNavItem label="Settings" href="/settings" collapsible>
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    const toggle = screen.getByRole('button', {name: /collapse settings/i});
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggle button collapses children without navigating', async () => {
    const user = userEvent.setup();
    render(
      <SideNavItem label="Settings" href="/settings" collapsible>
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    const toggle = screen.getByRole('button', {name: /collapse settings/i});
    await user.click(toggle);
    // After collapsing, aria-hidden on children container
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAccessibleName('Expand Settings');
  });

  it('link does not toggle collapse when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SideNavItem
        label="Settings"
        href="/settings"
        collapsible
        onClick={onClick}>
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    // Children should still be visible (not collapsed)
    const toggle = screen.getByRole('button', {name: /collapse settings/i});
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('link does not have aria-expanded (toggle button owns it)', () => {
    render(
      <SideNavItem label="Settings" href="/settings" collapsible>
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).not.toHaveAttribute('aria-expanded');
  });

  it('without href or onClick, clicking the item toggles collapse', async () => {
    const user = userEvent.setup();
    render(
      <SideNavItem label="Settings" collapsible>
        <SideNavItem label="General" />
      </SideNavItem>,
    );
    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('with onClick (no href), clicking the label fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SideNavItem label="Settings" onClick={onClick} collapsible>
        <SideNavItem label="General" />
      </SideNavItem>,
    );
    const primaryButton = screen.getByRole('button', {name: 'Settings'});
    await user.click(primaryButton);
    expect(onClick).toHaveBeenCalledTimes(1);
    // Children should still be visible
    const toggle = screen.getByRole('button', {name: /collapse settings/i});
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('with onClick (no href), toggle collapses without firing onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SideNavItem label="Settings" onClick={onClick} collapsible>
        <SideNavItem label="General" />
      </SideNavItem>,
    );
    const toggle = screen.getByRole('button', {name: /collapse settings/i});
    await user.click(toggle);
    expect(onClick).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsed children are inert (not focusable)', async () => {
    const user = userEvent.setup();
    render(
      <SideNavItem label="Settings" collapsible>
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    // Collapse the item
    const button = screen.getByRole('button', {name: 'Settings'});
    await user.click(button);
    // The children container should have inert attribute
    const childrenContainer = document.getElementById(
      button.getAttribute('aria-controls')!,
    );
    expect(childrenContainer).toHaveAttribute('inert');
  });
});

import {SideNavRenderContext} from './SideNavRenderContext';
import {AppShellMobileContext} from '../AppShell/AppShellMobileContext';

describe('SideNavItem — mobile drawer close-on-activate', () => {
  function renderInDrawer(ui: ReactNode, closeMobileNav = vi.fn()) {
    return {
      closeMobileNav,
      ...render(
        <AppShellMobileContext
          value={{
            isMobile: true,
            isMobileNavOpen: true,
            toggleMobileNav: vi.fn(),
            openMobileNav: vi.fn(),
            closeMobileNav,
            isMobileNavEnabled: true,
            hasAutoToggle: true,
          }}>
          <SideNavRenderContext value="drawer">{ui}</SideNavRenderContext>
        </AppShellMobileContext>,
      ),
    };
  }

  it('closes the mobile nav when a link item is clicked', async () => {
    const user = userEvent.setup();
    const {closeMobileNav} = renderInDrawer(
      <SideNavItem label="Home" href="/" data-testid="item" />,
    );
    await user.click(screen.getByTestId('item'));
    expect(closeMobileNav).toHaveBeenCalledTimes(1);
  });

  it('closes the mobile nav when a button item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const {closeMobileNav} = renderInDrawer(
      <SideNavItem label="Action" onClick={onClick} data-testid="item" />,
    );
    await user.click(screen.getByTestId('item'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(closeMobileNav).toHaveBeenCalledTimes(1);
  });

  it('does NOT close when a collapsible parent is toggled', async () => {
    const user = userEvent.setup();
    const {closeMobileNav} = renderInDrawer(
      <SideNavItem
        label="Settings"
        icon={StubIcon}
        collapsible
        data-testid="parent">
        <SideNavItem label="General" href="/settings/general" />
      </SideNavItem>,
    );
    await user.click(screen.getByTestId('parent'));
    expect(closeMobileNav).not.toHaveBeenCalled();
  });

  it('does NOT close when not inside a drawer', async () => {
    const user = userEvent.setup();
    const closeMobileNav = vi.fn();
    render(
      <AppShellMobileContext
        value={{
          isMobile: false,
          isMobileNavOpen: false,
          toggleMobileNav: vi.fn(),
          openMobileNav: vi.fn(),
          closeMobileNav,
          isMobileNavEnabled: false,
          hasAutoToggle: true,
        }}>
        <SideNavItem label="Home" href="/" data-testid="item" />
      </AppShellMobileContext>,
    );
    await user.click(screen.getByTestId('item'));
    expect(closeMobileNav).not.toHaveBeenCalled();
  });
});

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
import {XDSTopNav} from './XDSTopNav';
import {XDSTopNavTitle} from './XDSTopNavTitle';
import {XDSNavIcon} from '../NavIcon';
import {XDSTopNavItem} from './XDSTopNavItem';

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

  it('renders title slot content', () => {
    render(<XDSTopNav title={<span data-testid="title-content">Logo</span>} />);
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
        title={<span data-testid="title">Title</span>}
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
        title={<span data-testid="title">Title</span>}
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
        title={<span data-testid="title">Title</span>}
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
});

describe('XDSTopNavTitle', () => {
  it('renders title text', () => {
    render(<XDSTopNavTitle title="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders logo element', () => {
    render(<XDSTopNavTitle logo={<span data-testid="logo">Logo</span>} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders both logo and title', () => {
    render(
      <XDSTopNavTitle
        title="Dashboard"
        logo={<span data-testid="logo">Logo</span>}
      />,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders as anchor when href is provided', () => {
    render(<XDSTopNavTitle title="Home" href="/" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders as div when no href', () => {
    render(<XDSTopNavTitle title="Home" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSTopNavTitle title="Test" ref={ref} />);
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
});

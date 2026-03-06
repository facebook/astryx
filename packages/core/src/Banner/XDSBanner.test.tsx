/**
 * @file XDSBanner.test.tsx
 * @input Uses vitest, @testing-library/react, XDSBanner component
 * @output Unit tests for XDSBanner component behavior
 * @position Testing; validates XDSBanner.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSBanner} from './XDSBanner';

describe('XDSBanner', () => {
  it('renders with title and status', () => {
    render(<XDSBanner status="info" title="Test Banner" />);
    expect(screen.getByText('Test Banner')).toBeInTheDocument();
  });

  it('renders info status with role="status"', () => {
    render(<XDSBanner status="info" title="Info" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders warning status with role="alert"', () => {
    render(<XDSBanner status="warning" title="Warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders error status with role="alert"', () => {
    render(<XDSBanner status="error" title="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders success status with role="status"', () => {
    render(<XDSBanner status="success" title="Success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders default icon per status with aria-hidden', () => {
    const {container} = render(<XDSBanner status="info" title="Info Banner" />);
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
    // Default icon should be an SVG
    const svg = iconWrapper?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders custom icon override', () => {
    render(
      <XDSBanner
        status="info"
        title="Custom Icon"
        icon={<span data-testid="custom-icon">★</span>}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <XDSBanner
        status="info"
        title="Title"
        description="This is a description"
      />,
    );
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const {container} = render(<XDSBanner status="info" title="Title Only" />);
    // Only one <p> for the title, no description
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
  });

  it('renders dismiss button when isDismissable', () => {
    render(<XDSBanner status="info" title="Dismissable" isDismissable />);
    expect(screen.getByRole('button', {name: 'Dismiss'})).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <XDSBanner
        status="info"
        title="Dismissable"
        isDismissable
        onDismiss={onDismiss}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides banner on dismiss without onDismiss callback', async () => {
    const user = userEvent.setup();
    render(
      <XDSBanner
        status="info"
        title="Self Dismissing"
        isDismissable
        data-testid="banner"
      />,
    );
    expect(screen.getByTestId('banner')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByTestId('banner')).not.toBeInTheDocument();
  });

  it('hides banner on dismiss and calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <XDSBanner
        status="info"
        title="Dismissable"
        isDismissable
        onDismiss={onDismiss}
        data-testid="banner"
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByTestId('banner')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when isDismissable is false', () => {
    render(<XDSBanner status="info" title="Not Dismissable" />);
    expect(
      screen.queryByRole('button', {name: 'Dismiss'}),
    ).not.toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <XDSBanner
        status="info"
        title="With Action"
        endContent={<button data-testid="end-btn">Action</button>}
      />,
    );
    expect(screen.getByTestId('end-btn')).toBeInTheDocument();
  });

  it('renders card variant by default', () => {
    const {container} = render(
      <XDSBanner status="info" title="Card Variant" />,
    );
    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
  });

  it('renders section variant', () => {
    const {container} = render(
      <XDSBanner status="info" title="Section Variant" variant="section" />,
    );
    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
  });

  // =========================================================================
  // Collapsible content area
  // =========================================================================

  it('hides children by default (collapsed)', () => {
    render(
      <XDSBanner status="info" title="Collapsible">
        <div data-testid="child-content">Extra content</div>
      </XDSBanner>,
    );
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('shows children when defaultIsExpanded is true', () => {
    render(
      <XDSBanner status="info" title="Expanded" defaultIsExpanded>
        <div data-testid="child-content">Extra content</div>
      </XDSBanner>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('shows expand button when children are provided', () => {
    render(
      <XDSBanner status="info" title="With Toggle">
        <div>Content</div>
      </XDSBanner>,
    );
    expect(screen.getByRole('button', {name: 'Expand'})).toBeInTheDocument();
  });

  it('does not show expand/collapse button when no children', () => {
    render(<XDSBanner status="info" title="No Children" />);
    expect(
      screen.queryByRole('button', {name: 'Expand'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Collapse'}),
    ).not.toBeInTheDocument();
  });

  it('toggles children visibility on expand/collapse click', async () => {
    const user = userEvent.setup();
    render(
      <XDSBanner status="info" title="Toggle Test">
        <div data-testid="child-content">Extra content</div>
      </XDSBanner>,
    );

    // Initially collapsed
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Expand'})).toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByRole('button', {name: 'Expand'}));
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Collapse'})).toBeInTheDocument();

    // Click to collapse
    await user.click(screen.getByRole('button', {name: 'Collapse'}));
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Expand'})).toBeInTheDocument();
  });

  it('shows collapse button when defaultIsExpanded', () => {
    render(
      <XDSBanner status="info" title="Expanded" defaultIsExpanded>
        <div>Content</div>
      </XDSBanner>,
    );
    expect(screen.getByRole('button', {name: 'Collapse'})).toBeInTheDocument();
  });

  it('renders expand button to the left of dismiss button', () => {
    const {container} = render(
      <XDSBanner status="info" title="Order Test" isDismissable>
        <div>Content</div>
      </XDSBanner>,
    );
    const buttons = container.querySelectorAll('button');
    const buttonNames = Array.from(buttons).map(
      b => b.getAttribute('aria-label') || b.textContent,
    );
    const expandIndex = buttonNames.indexOf('Expand');
    const dismissIndex = buttonNames.indexOf('Dismiss');
    expect(expandIndex).toBeLessThan(dismissIndex);
  });

  it('does not render content area when no children', () => {
    const {container} = render(<XDSBanner status="info" title="No Children" />);
    const root = container.firstElementChild;
    // Root should have only 1 child div: the header
    expect(root?.children).toHaveLength(1);
  });

  it('supports data-testid', () => {
    render(<XDSBanner status="info" title="Test ID" data-testid="my-banner" />);
    expect(screen.getByTestId('my-banner')).toBeInTheDocument();
  });

  it('renders each status type correctly', () => {
    const statuses = ['info', 'warning', 'error', 'success'] as const;
    for (const status of statuses) {
      const {unmount} = render(
        <XDSBanner status={status} title={`${status} banner`} />,
      );
      expect(screen.getByText(`${status} banner`)).toBeInTheDocument();
      unmount();
    }
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSBanner ref={ref} status="info" title="Ref Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

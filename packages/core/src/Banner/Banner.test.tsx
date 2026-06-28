// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Banner.test.tsx
 * @input Uses vitest, @testing-library/react, Banner component
 * @output Unit tests for Banner component behavior
 * @position Testing; validates Banner.tsx implementation
 *
 * SYNC: When modified, update this header
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Banner} from './Banner';
import {registerIcons, resetIcons} from '../Icon';

describe('Banner', () => {
  afterEach(() => {
    resetIcons();
  });

  it('renders with title and status', () => {
    render(<Banner status="info" title="Test Banner" />);
    expect(screen.getByText('Test Banner')).toBeInTheDocument();
  });

  it('renders info status with role="status"', () => {
    render(<Banner status="info" title="Info" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders warning status with role="alert"', () => {
    render(<Banner status="warning" title="Warning" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders error status with role="alert"', () => {
    render(<Banner status="error" title="Error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders success status with role="status"', () => {
    render(<Banner status="success" title="Success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders default icon per status with aria-hidden', () => {
    const {container} = render(<Banner status="info" title="Info Banner" />);
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
    // Default icon should be an SVG
    const svg = iconWrapper?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders custom icon override', () => {
    render(
      <Banner
        status="info"
        title="Custom Icon"
        icon={<span data-testid="custom-icon">★</span>}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <Banner
        status="info"
        title="Title"
        description="This is a description"
      />,
    );
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders title and description as <div> (never <p>) for composition safety', () => {
    const {container} = render(
      <Banner status="info" title="Title" description="Description" />,
    );
    // Block content can be nested inside Banner text slots without tripping
    // the phrasing-content trap that <p> imposes, so neither slot is a <p>.
    expect(container.querySelector('p')).toBeNull();
    expect(screen.getByText('Title').tagName).toBe('DIV');
    expect(screen.getByText('Description').tagName).toBe('DIV');
  });

  it('does not render description when not provided', () => {
    render(<Banner status="info" title="Title Only" />);
    // Title renders; no description text is present.
    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(screen.queryByText('This is a description')).not.toBeInTheDocument();
  });

  it('renders dismiss button when isDismissable', () => {
    render(<Banner status="info" title="Dismissable" isDismissable />);
    expect(screen.getByRole('button', {name: 'Dismiss'})).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Banner
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
      <Banner
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
      <Banner
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
    render(<Banner status="info" title="Not Dismissable" />);
    expect(
      screen.queryByRole('button', {name: 'Dismiss'}),
    ).not.toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <Banner
        status="info"
        title="With Action"
        endContent={
          <button type="button" data-testid="end-btn">
            Action
          </button>
        }
      />,
    );
    expect(screen.getByTestId('end-btn')).toBeInTheDocument();
  });

  it('renders card container by default', () => {
    const {container} = render(<Banner status="info" title="Card Container" />);
    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
  });

  it('renders section container', () => {
    const {container} = render(
      <Banner status="info" title="Section Container" container="section" />,
    );
    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
  });

  // =========================================================================
  // Collapsible content area
  // =========================================================================

  it('hides children by default (collapsed)', () => {
    render(
      <Banner status="info" title="Collapsible">
        <div data-testid="child-content">Extra content</div>
      </Banner>,
    );
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('shows children when defaultIsExpanded is true', () => {
    render(
      <Banner status="info" title="Expanded" defaultIsExpanded>
        <div data-testid="child-content">Extra content</div>
      </Banner>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('shows expand button when children are provided', () => {
    render(
      <Banner status="info" title="With Toggle">
        <div>Content</div>
      </Banner>,
    );
    expect(screen.getByRole('button', {name: 'Expand'})).toBeInTheDocument();
  });

  it('does not show expand/collapse button when no children', () => {
    render(<Banner status="info" title="No Children" />);
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
      <Banner status="info" title="Toggle Test">
        <div data-testid="child-content">Extra content</div>
      </Banner>,
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
      <Banner status="info" title="Expanded" defaultIsExpanded>
        <div>Content</div>
      </Banner>,
    );
    expect(screen.getByRole('button', {name: 'Collapse'})).toBeInTheDocument();
  });

  it('renders expand button to the left of dismiss button', () => {
    const {container} = render(
      <Banner status="info" title="Order Test" isDismissable>
        <div>Content</div>
      </Banner>,
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
    const {container} = render(<Banner status="info" title="No Children" />);
    const root = container.firstElementChild;
    // Root should have only 1 child div: the header
    expect(root?.children).toHaveLength(1);
  });

  it('supports data-testid', () => {
    render(<Banner status="info" title="Test ID" data-testid="my-banner" />);
    expect(screen.getByTestId('my-banner')).toBeInTheDocument();
  });

  it('renders each status type correctly', () => {
    const statuses = ['info', 'warning', 'error', 'success'] as const;
    for (const status of statuses) {
      const {unmount} = render(
        <Banner status={status} title={`${status} banner`} />,
      );
      expect(screen.getByText(`${status} banner`)).toBeInTheDocument();
      unmount();
    }
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<Banner ref={ref} status="info" title="Ref Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  // =========================================================================
  // Icon registry integration
  // =========================================================================

  it('uses icons from the global registry when registered', () => {
    registerIcons({
      info: (
        <svg data-testid="custom-registry-icon">
          <circle />
        </svg>
      ),
    });
    render(<Banner status="info" title="Registry Test" />);
    expect(screen.getByTestId('custom-registry-icon')).toBeInTheDocument();
  });

  it('uses chevronDown from the registry for expand/collapse', () => {
    registerIcons({
      chevronDown: (
        <svg data-testid="custom-chevron">
          <path d="M0 0" />
        </svg>
      ),
    });
    render(
      <Banner status="info" title="Chevron Test">
        <div>Content</div>
      </Banner>,
    );
    expect(screen.getByTestId('custom-chevron')).toBeInTheDocument();
  });
});

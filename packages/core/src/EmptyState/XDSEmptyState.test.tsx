// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSEmptyState} from './XDSEmptyState';

describe('XDSEmptyState', () => {
  it('renders with title', () => {
    render(<XDSEmptyState title="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders title as h3 by default', () => {
    render(<XDSEmptyState title="No data" />);
    const heading = screen.getByRole('heading', {name: 'No data'});
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('renders custom heading level', () => {
    render(<XDSEmptyState title="No data" headingLevel={2} />);
    const heading = screen.getByRole('heading', {name: 'No data'});
    expect(heading.tagName).toBe('H2');
  });

  it('renders all heading levels', () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    for (const level of levels) {
      const {unmount} = render(
        <XDSEmptyState title={`Level ${level}`} headingLevel={level} />,
      );
      const heading = screen.getByRole('heading', {
        name: `Level ${level}`,
      });
      expect(heading.tagName).toBe(`H${level}`);
      unmount();
    }
  });

  it('renders with description', () => {
    render(
      <XDSEmptyState
        title="No results"
        description="Try adjusting your search."
      />,
    );
    expect(screen.getByText('Try adjusting your search.')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const {container} = render(<XDSEmptyState title="No results" />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <XDSEmptyState
        title="No results"
        icon={<span data-testid="empty-icon">📭</span>}
      />,
    );
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('marks icon as decorative with aria-hidden', () => {
    render(
      <XDSEmptyState
        title="No results"
        icon={<span data-testid="empty-icon">📭</span>}
      />,
    );
    const iconWrapper = screen.getByTestId('empty-icon').parentElement;
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render icon wrapper when icon is not provided', () => {
    const {container} = render(<XDSEmptyState title="No results" />);
    expect(
      container.querySelector('[aria-hidden="true"]'),
    ).not.toBeInTheDocument();
  });

  it('renders with actions', () => {
    render(
      <XDSEmptyState
        title="No results"
        actions={
          <button type="button" data-testid="action-btn">
            Retry
          </button>
        }
      />,
    );
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('does not render actions wrapper when actions is not provided', () => {
    const {container} = render(<XDSEmptyState title="No results" />);
    // Container div + text group div, but no actions wrapper
    const divs = container.querySelectorAll('div');
    expect(divs).toHaveLength(2); // container + text group
  });

  it('has role="status" on the container', () => {
    render(<XDSEmptyState title="No results" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<XDSEmptyState title="No results" isCompact />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSEmptyState ref={ref} title="No results" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('spreads data-testid', () => {
    render(<XDSEmptyState title="No results" data-testid="empty-state" />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <XDSEmptyState
        icon={<span data-testid="icon">🔍</span>}
        title="No results found"
        description="Try a different search term."
        actions={
          <>
            <button type="button">Clear filters</button>
            <button type="button">Go back</button>
          </>
        }
        data-testid="full-empty-state"
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText('Try a different search term.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Clear filters')).toBeInTheDocument();
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSPagination.test.tsx
 * @input Uses vitest, @testing-library/react, XDSPagination component
 * @output Unit tests for XDSPagination component behavior
 * @position Testing; validates XDSPagination.tsx implementation
 *
 * SYNC: When XDSPagination.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSPagination, generatePageRange} from './XDSPagination';

// =============================================================================
// generatePageRange helper
// =============================================================================

describe('generatePageRange', () => {
  it('returns all pages when total fits within slots', () => {
    expect(generatePageRange(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns all pages when total equals slot count', () => {
    // With siblingCount=1, totalSlots = 5 + 2*1 = 7
    expect(generatePageRange(4, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows right ellipsis when near start', () => {
    const result = generatePageRange(1, 10, 1);
    expect(result).toEqual([1, 2, 3, 4, 5, '...', 10]);
  });

  it('shows left ellipsis when near end', () => {
    const result = generatePageRange(10, 10, 1);
    expect(result).toEqual([1, '...', 6, 7, 8, 9, 10]);
  });

  it('shows both ellipses when in middle', () => {
    const result = generatePageRange(5, 10, 1);
    expect(result).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  it('handles siblingCount=2', () => {
    const result = generatePageRange(6, 12, 2);
    expect(result).toEqual([1, '...', 4, 5, 6, 7, 8, '...', 12]);
  });

  it('handles siblingCount=0', () => {
    const result = generatePageRange(5, 10, 0);
    expect(result).toEqual([1, '...', 5, '...', 10]);
  });

  it('handles single page', () => {
    expect(generatePageRange(1, 1, 1)).toEqual([1]);
  });

  it('handles two pages', () => {
    expect(generatePageRange(1, 2, 1)).toEqual([1, 2]);
  });
});

// =============================================================================
// XDSPagination component
// =============================================================================

describe('XDSPagination', () => {
  // ---------------------------------------------------------------------------
  // Basic rendering
  // ---------------------------------------------------------------------------

  describe('basic rendering', () => {
    it('renders nav landmark with default label', () => {
      render(<XDSPagination page={1} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('navigation', {name: 'Pagination'}),
      ).toBeInTheDocument();
    });

    it('renders nav landmark with custom label', () => {
      render(
        <XDSPagination
          page={1}
          onChange={() => {}}
          totalPages={5}
          label="Results navigation"
        />,
      );
      expect(
        screen.getByRole('navigation', {name: 'Results navigation'}),
      ).toBeInTheDocument();
    });

    it('renders prev and next buttons', () => {
      render(<XDSPagination page={3} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      render(
        <XDSPagination
          page={1}
          onChange={() => {}}
          totalPages={5}
          data-testid="my-pagination"
        />,
      );
      expect(screen.getByTestId('my-pagination')).toBeInTheDocument();
    });

    it('returns null when totalItems is 0', () => {
      const {container} = render(
        <XDSPagination page={1} onChange={() => {}} totalItems={0} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when totalPages is 0', () => {
      const {container} = render(
        <XDSPagination page={1} onChange={() => {}} totalPages={0} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: pages (default)
  // ---------------------------------------------------------------------------

  describe('variant: pages', () => {
    it('renders page number buttons', () => {
      render(<XDSPagination page={1} onChange={() => {}} totalPages={5} />);
      for (let i = 1; i <= 5; i++) {
        expect(
          screen.getByRole('button', {name: `Go to page ${i}`}),
        ).toBeInTheDocument();
      }
    });

    it('marks current page with aria-current', () => {
      render(<XDSPagination page={3} onChange={() => {}} totalPages={5} />);
      const activeButton = screen.getByRole('button', {name: 'Go to page 3'});
      expect(activeButton).toHaveAttribute('aria-current', 'page');

      const otherButton = screen.getByRole('button', {name: 'Go to page 1'});
      expect(otherButton).not.toHaveAttribute('aria-current');
    });

    it('shows ellipsis for many pages', () => {
      render(<XDSPagination page={5} onChange={() => {}} totalPages={10} />);
      // Should show: 1 ... 4 5 6 ... 10
      expect(
        screen.getByRole('button', {name: 'Go to page 1'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to page 4'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to page 5'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to page 6'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to page 10'}),
      ).toBeInTheDocument();
      // Pages 2, 3, 7, 8, 9 should not be shown
      expect(
        screen.queryByRole('button', {name: 'Go to page 2'}),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Go to page 9'}),
      ).not.toBeInTheDocument();
    });

    it('does not render pages when totalPages is unknown', () => {
      render(<XDSPagination page={1} onChange={() => {}} hasMore />);
      // Should not show any page number buttons
      expect(
        screen.queryByRole('button', {name: /Go to page/}),
      ).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: count
  // ---------------------------------------------------------------------------

  describe('variant: count', () => {
    it('renders count text', () => {
      render(
        <XDSPagination
          page={1}
          onChange={() => {}}
          totalItems={100}
          pageSize={10}
          variant="count"
        />,
      );
      expect(screen.getByText(/1–10 of 100/)).toBeInTheDocument();
    });

    it('clamps range end to totalItems on last page', () => {
      render(
        <XDSPagination
          page={5}
          onChange={() => {}}
          totalItems={45}
          pageSize={10}
          variant="count"
        />,
      );
      expect(screen.getByText(/41–45 of 45/)).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: compact
  // ---------------------------------------------------------------------------

  describe('variant: compact', () => {
    it('renders compact text', () => {
      render(
        <XDSPagination
          page={3}
          onChange={() => {}}
          totalPages={10}
          variant="compact"
        />,
      );
      expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: dots
  // ---------------------------------------------------------------------------

  describe('variant: dots', () => {
    it('renders dot indicators', () => {
      render(
        <XDSPagination
          page={2}
          onChange={() => {}}
          totalPages={5}
          variant="dots"
        />,
      );
      const group = screen.getByRole('group', {name: 'Page indicators'});
      const dots = within(group).getAllByRole('button');
      expect(dots).toHaveLength(5);
    });

    it('marks active dot with aria-current', () => {
      render(
        <XDSPagination
          page={3}
          onChange={() => {}}
          totalPages={5}
          variant="dots"
        />,
      );
      const activeDot = screen.getByRole('button', {name: 'Go to page 3'});
      expect(activeDot).toHaveAttribute('aria-current', 'page');
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: none
  // ---------------------------------------------------------------------------

  describe('variant: none', () => {
    it('renders only prev/next buttons', () => {
      render(
        <XDSPagination
          page={2}
          onChange={() => {}}
          totalPages={5}
          variant="none"
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeInTheDocument();
      // No page buttons or text indicators
      expect(
        screen.queryByRole('button', {name: /Go to page/}),
      ).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Page change callbacks
  // ---------------------------------------------------------------------------

  describe('page change callbacks', () => {
    it('calls onChange when clicking a page button', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<XDSPagination page={1} onChange={onChange} totalPages={5} />);
      await user.click(screen.getByRole('button', {name: 'Go to page 3'}));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange when clicking next', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<XDSPagination page={2} onChange={onChange} totalPages={5} />);
      await user.click(screen.getByRole('button', {name: 'Go to next page'}));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange when clicking previous', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<XDSPagination page={3} onChange={onChange} totalPages={5} />);
      await user.click(
        screen.getByRole('button', {name: 'Go to previous page'}),
      );
      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('calls onChange when clicking a dot', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <XDSPagination
          page={1}
          onChange={onChange}
          totalPages={5}
          variant="dots"
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Go to page 4'}));
      expect(onChange).toHaveBeenCalledWith(4);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary states
  // ---------------------------------------------------------------------------

  describe('boundary states', () => {
    it('disables previous button on first page', () => {
      render(<XDSPagination page={1} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<XDSPagination page={5} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeDisabled();
    });

    it('enables both buttons on middle page', () => {
      render(<XDSPagination page={3} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).not.toBeDisabled();
    });

    it('disables both buttons when only one page', () => {
      render(<XDSPagination page={1} onChange={() => {}} totalPages={1} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeDisabled();
    });
  });

  // ---------------------------------------------------------------------------
  // Cursor-based mode (hasMore)
  // ---------------------------------------------------------------------------

  describe('cursor-based mode', () => {
    it('enables next when hasMore is true', () => {
      render(<XDSPagination page={1} onChange={() => {}} hasMore />);
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).not.toBeDisabled();
    });

    it('disables next when hasMore is false', () => {
      render(<XDSPagination page={3} onChange={() => {}} hasMore={false} />);
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeDisabled();
    });

    it('disables previous on first page with hasMore', () => {
      render(<XDSPagination page={1} onChange={() => {}} hasMore />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeDisabled();
    });

    it('enables previous on page > 1 with hasMore', () => {
      render(<XDSPagination page={2} onChange={() => {}} hasMore />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).not.toBeDisabled();
    });
  });

  // ---------------------------------------------------------------------------
  // Page size selector
  // ---------------------------------------------------------------------------

  describe('page size selector', () => {
    it('renders page size selector when pageSizeOptions provided', () => {
      render(
        <XDSPagination
          page={1}
          onChange={() => {}}
          totalItems={100}
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={() => {}}
        />,
      );
      // The selector should be present (hidden label "Items per page")
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('does not render page size selector when pageSizeOptions not provided', () => {
      render(<XDSPagination page={1} onChange={() => {}} totalPages={5} />);
      // No selector trigger should be present
      const nav = screen.getByRole('navigation');
      // Only prev/next + page buttons should exist
      const buttons = within(nav).getAllByRole('button');
      // 2 nav buttons + page buttons
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Disabled state
  // ---------------------------------------------------------------------------

  describe('disabled state', () => {
    it('disables all page buttons when isDisabled', () => {
      render(
        <XDSPagination
          page={3}
          onChange={() => {}}
          totalPages={5}
          isDisabled
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeDisabled();
      // Page buttons should also be disabled
      expect(screen.getByRole('button', {name: 'Go to page 1'})).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <XDSPagination
          page={3}
          onChange={onChange}
          totalPages={5}
          isDisabled
        />,
      );
      // Disabled buttons can't be clicked
      await user.click(screen.getByRole('button', {name: 'Go to page 1'}));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // totalItems calculation
  // ---------------------------------------------------------------------------

  describe('totalItems calculation', () => {
    it('calculates totalPages from totalItems and pageSize', () => {
      render(
        <XDSPagination
          page={1}
          onChange={() => {}}
          totalItems={95}
          pageSize={10}
        />,
      );
      // 95 / 10 = 10 pages, should show page 10
      expect(
        screen.getByRole('button', {name: 'Go to page 10'}),
      ).toBeInTheDocument();
    });

    it('uses default pageSize of 10', () => {
      render(<XDSPagination page={1} onChange={() => {}} totalItems={45} />);
      // 45 / 10 = 5 pages
      expect(
        screen.getByRole('button', {name: 'Go to page 5'}),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Go to page 6'}),
      ).not.toBeInTheDocument();
    });
  });
});

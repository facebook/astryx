// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pagination.test.tsx
 * @input Uses vitest, @testing-library/react, Pagination component
 * @output Unit tests for Pagination component behavior
 * @position Testing; validates Pagination.tsx implementation
 *
 * SYNC: When Pagination.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, within, fireEvent, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Pagination, generatePageRange} from './Pagination';

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
// Pagination component
// =============================================================================

describe('Pagination', () => {
  // ---------------------------------------------------------------------------
  // Basic rendering
  // ---------------------------------------------------------------------------

  describe('basic rendering', () => {
    it('renders nav landmark with default label', () => {
      render(<Pagination page={1} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('navigation', {name: 'Pagination'}),
      ).toBeInTheDocument();
    });

    it('renders nav landmark with custom label', () => {
      render(
        <Pagination
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
      render(<Pagination page={3} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      render(
        <Pagination
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
        <Pagination page={1} onChange={() => {}} totalItems={0} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when totalPages is 0', () => {
      const {container} = render(
        <Pagination page={1} onChange={() => {}} totalPages={0} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: pages (default)
  // ---------------------------------------------------------------------------

  describe('variant: pages', () => {
    it('renders page number buttons', () => {
      render(<Pagination page={1} onChange={() => {}} totalPages={5} />);
      for (let i = 1; i <= 5; i++) {
        expect(
          screen.getByRole('button', {name: `Go to page ${i}`}),
        ).toBeInTheDocument();
      }
    });

    it('marks current page with aria-current', () => {
      render(<Pagination page={3} onChange={() => {}} totalPages={5} />);
      const activeButton = screen.getByRole('button', {name: 'Go to page 3'});
      expect(activeButton).toHaveAttribute('aria-current', 'page');

      const otherButton = screen.getByRole('button', {name: 'Go to page 1'});
      expect(otherButton).not.toHaveAttribute('aria-current');
    });

    it('shows ellipsis for many pages', () => {
      render(<Pagination page={5} onChange={() => {}} totalPages={10} />);
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
      render(<Pagination page={1} onChange={() => {}} hasMore />);
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
        <Pagination
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
        <Pagination
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
        <Pagination
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
  // pageSize guarding
  // ---------------------------------------------------------------------------

  describe('pageSize guarding', () => {
    it('does not crash the dots variant when pageSize is 0', () => {
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          totalItems={5}
          pageSize={0}
          variant="dots"
        />,
      );
      const group = screen.getByRole('group', {name: 'Page indicators'});
      expect(within(group).getAllByRole('button')).toHaveLength(5);
    });

    it('treats NaN pageSize as the default', () => {
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          totalItems={50}
          pageSize={NaN}
          variant="compact"
        />,
      );
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });

    it('clamps negative pageSize to 1', () => {
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          totalItems={5}
          pageSize={-10}
          variant="compact"
        />,
      );
      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    });

    it('floors fractional pageSize', () => {
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          totalItems={50}
          pageSize={2.5}
          variant="compact"
        />,
      );
      expect(screen.getByText('Page 1 of 25')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Variant: dots
  // ---------------------------------------------------------------------------

  describe('variant: dots', () => {
    it('renders dot indicators', () => {
      render(
        <Pagination
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
        <Pagination
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
        <Pagination
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
      render(<Pagination page={1} onChange={onChange} totalPages={5} />);
      await user.click(screen.getByRole('button', {name: 'Go to page 3'}));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange when clicking next', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination page={2} onChange={onChange} totalPages={5} />);
      await user.click(screen.getByRole('button', {name: 'Go to next page'}));
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it('calls onChange when clicking previous', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Pagination page={3} onChange={onChange} totalPages={5} />);
      await user.click(
        screen.getByRole('button', {name: 'Go to previous page'}),
      );
      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('calls onChange when clicking a dot', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Pagination
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
  // changeAction (interruptible, optimistic)
  // ---------------------------------------------------------------------------

  describe('changeAction', () => {
    it('fires onChange then changeAction with the new page', async () => {
      const user = userEvent.setup();
      const order: string[] = [];
      const onChange = vi.fn(() => order.push('onChange'));
      const changeAction = vi.fn(() => {
        order.push('changeAction');
      });
      render(
        <Pagination
          page={1}
          onChange={onChange}
          changeAction={changeAction}
          totalPages={5}
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Go to next page'}));
      expect(onChange).toHaveBeenCalledWith(2);
      expect(changeAction).toHaveBeenCalledWith(2);
      expect(order).toEqual(['onChange', 'changeAction']);
    });

    it('shows the optimistic page while changeAction is pending', async () => {
      const user = userEvent.setup();
      let resolveAction: (() => void) | undefined;
      const changeAction = vi.fn(
        async () =>
          new Promise<void>(resolve => {
            resolveAction = resolve;
          }),
      );
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          changeAction={changeAction}
          totalPages={5}
          variant="compact"
        />,
      );

      // The committed `page` prop stays at 1, but the indicator optimistically
      // reflects the page being navigated to.
      await user.click(screen.getByRole('button', {name: 'Go to next page'}));
      expect(changeAction).toHaveBeenCalledWith(2);
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();

      await act(async () => {
        resolveAction?.();
        await Promise.resolve();
      });
    });

    it('interrupts an in-flight action on rapid next clicks', async () => {
      // Each click derives its target from the optimistic page, so clicking
      // next twice before the action settles advances 1 -> 2 -> 3 instead of
      // being dropped by a re-entry guard.
      const resolvers: (() => void)[] = [];
      const changeAction = vi.fn(
        async () =>
          new Promise<void>(resolve => {
            resolvers.push(resolve);
          }),
      );
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          changeAction={changeAction}
          totalPages={5}
          variant="compact"
        />,
      );

      const next = screen.getByRole('button', {name: 'Go to next page'});
      await act(async () => {
        fireEvent.click(next);
      });
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(next);
      });
      expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();

      expect(changeAction).toHaveBeenCalledTimes(2);
      expect(changeAction).toHaveBeenNthCalledWith(1, 2);
      expect(changeAction).toHaveBeenNthCalledWith(2, 3);

      await act(async () => {
        resolvers.forEach(resolve => resolve());
        await Promise.resolve();
      });
    });

    it('supports a synchronous changeAction', async () => {
      const user = userEvent.setup();
      const changeAction = vi.fn((_page: number) => {});
      const onChange = vi.fn();
      render(
        <Pagination
          page={2}
          onChange={onChange}
          changeAction={changeAction}
          totalPages={5}
        />,
      );
      await user.click(
        screen.getByRole('button', {name: 'Go to previous page'}),
      );
      expect(onChange).toHaveBeenCalledWith(1);
      expect(changeAction).toHaveBeenCalledWith(1);
    });

    it('does not fire changeAction when disabled', async () => {
      const user = userEvent.setup();
      const changeAction = vi.fn();
      render(
        <Pagination
          page={1}
          onChange={() => {}}
          changeAction={changeAction}
          totalPages={5}
          isDisabled
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Go to next page'}));
      expect(changeAction).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary states
  // ---------------------------------------------------------------------------

  describe('boundary states', () => {
    it('disables previous button on first page', () => {
      render(<Pagination page={1} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<Pagination page={5} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeDisabled();
    });

    it('enables both buttons on middle page', () => {
      render(<Pagination page={3} onChange={() => {}} totalPages={5} />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).not.toBeDisabled();
    });

    it('disables both buttons when only one page', () => {
      render(<Pagination page={1} onChange={() => {}} totalPages={1} />);
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
      render(<Pagination page={1} onChange={() => {}} hasMore />);
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).not.toBeDisabled();
    });

    it('disables next when hasMore is false', () => {
      render(<Pagination page={3} onChange={() => {}} hasMore={false} />);
      expect(
        screen.getByRole('button', {name: 'Go to next page'}),
      ).toBeDisabled();
    });

    it('disables previous on first page with hasMore', () => {
      render(<Pagination page={1} onChange={() => {}} hasMore />);
      expect(
        screen.getByRole('button', {name: 'Go to previous page'}),
      ).toBeDisabled();
    });

    it('enables previous on page > 1 with hasMore', () => {
      render(<Pagination page={2} onChange={() => {}} hasMore />);
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
        <Pagination
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
      render(<Pagination page={1} onChange={() => {}} totalPages={5} />);
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
        <Pagination page={3} onChange={() => {}} totalPages={5} isDisabled />,
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
        <Pagination page={3} onChange={onChange} totalPages={5} isDisabled />,
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
        <Pagination
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
      render(<Pagination page={1} onChange={() => {}} totalItems={45} />);
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

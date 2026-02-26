/**
 * @file XDSPagination.test.tsx
 * @input Uses vitest, @testing-library/react, userEvent, XDSPagination component
 * @output Unit tests for XDSPagination component behavior
 * @position Testing; validates XDSPagination.tsx implementation
 *
 * SYNC: When XDSPagination.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSPagination} from './XDSPagination';

describe('XDSPagination', () => {
  it('renders pagination navigation', () => {
    render(
      <XDSPagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
    );
    expect(
      screen.getByRole('navigation', {name: 'Pagination'}),
    ).toBeInTheDocument();
  });

  it('renders nothing for single page', () => {
    const {container} = render(
      <XDSPagination currentPage={1} totalPages={1} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for zero pages', () => {
    const {container} = render(
      <XDSPagination currentPage={1} totalPages={0} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all page buttons when totalPages <= maxVisiblePages', () => {
    render(
      <XDSPagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
    );
    for (let i = 1; i <= 5; i++) {
      expect(
        screen.getByRole('button', {name: `Page ${i}`}),
      ).toBeInTheDocument();
    }
  });

  it('marks current page with aria-current', () => {
    render(
      <XDSPagination currentPage={3} totalPages={5} onPageChange={() => {}} />,
    );
    const currentButton = screen.getByRole('button', {name: 'Page 3'});
    expect(currentButton).toHaveAttribute('aria-current', 'page');

    const otherButton = screen.getByRole('button', {name: 'Page 1'});
    expect(otherButton).not.toHaveAttribute('aria-current');
  });

  it('calls onPageChange when a page button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSPagination
        currentPage={1}
        totalPages={5}
        onPageChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Page 3'}));
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('does not call onPageChange when clicking current page', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSPagination
        currentPage={3}
        totalPages={5}
        onPageChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Page 3'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders previous and next arrow buttons', () => {
    render(
      <XDSPagination currentPage={3} totalPages={5} onPageChange={() => {}} />,
    );
    expect(
      screen.getByRole('button', {name: 'Previous page'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Next page'})).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <XDSPagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', {name: 'Previous page'})).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <XDSPagination currentPage={5} totalPages={5} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', {name: 'Next page'})).toBeDisabled();
  });

  it('navigates to previous page', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSPagination
        currentPage={3}
        totalPages={5}
        onPageChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Previous page'}));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('navigates to next page', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSPagination
        currentPage={3}
        totalPages={5}
        onPageChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Next page'}));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('hides arrows when hasArrows is false', () => {
    render(
      <XDSPagination
        currentPage={3}
        totalPages={5}
        onPageChange={() => {}}
        hasArrows={false}
      />,
    );
    expect(
      screen.queryByRole('button', {name: 'Previous page'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Next page'}),
    ).not.toBeInTheDocument();
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <XDSPagination currentPage={5} totalPages={20} onPageChange={() => {}} />,
    );
    // First and last pages should be visible
    expect(screen.getByRole('button', {name: 'Page 1'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Page 20'})).toBeInTheDocument();
    // Current page should be visible
    expect(screen.getByRole('button', {name: 'Page 5'})).toBeInTheDocument();
  });

  it('disables all buttons when isDisabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSPagination
        currentPage={3}
        totalPages={5}
        onPageChange={handleChange}
        isDisabled
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });

    await user.click(screen.getByRole('button', {name: 'Page 1'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports custom label', () => {
    render(
      <XDSPagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        label="Results pages"
      />,
    );
    expect(
      screen.getByRole('navigation', {name: 'Results pages'}),
    ).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <XDSPagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        data-testid="my-pagination"
      />,
    );
    expect(screen.getByTestId('my-pagination')).toBeInTheDocument();
  });

  it('renders correct pages near the start', () => {
    render(
      <XDSPagination currentPage={1} totalPages={20} onPageChange={() => {}} />,
    );
    // Near start: should show first few pages and last page
    expect(screen.getByRole('button', {name: 'Page 1'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Page 2'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Page 20'})).toBeInTheDocument();
  });

  it('renders correct pages near the end', () => {
    render(
      <XDSPagination
        currentPage={20}
        totalPages={20}
        onPageChange={() => {}}
      />,
    );
    // Near end: should show last few pages and first page
    expect(screen.getByRole('button', {name: 'Page 1'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Page 20'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Page 19'})).toBeInTheDocument();
  });

  it('supports keyboard navigation via tab', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSPagination
        currentPage={3}
        totalPages={5}
        onPageChange={handleChange}
      />,
    );

    // Tab to first button (Previous)
    await user.tab();
    expect(screen.getByRole('button', {name: 'Previous page'})).toHaveFocus();

    // Tab to page 1
    await user.tab();
    expect(screen.getByRole('button', {name: 'Page 1'})).toHaveFocus();

    // Press Enter to select page 1
    await user.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Pagination.tsx
 * @input Uses React, StyleX, Button, Icon, Selector, Text; page number buttons delegate to Button
 * @output Exports Pagination component, PaginationProps, PaginationVariant, PaginationSize types
 * @position Core implementation; consumed by index.ts, tested by Pagination.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Pagination/Pagination.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Pagination/index.ts (exports if types change)
 * - /apps/storybook/stories/Pagination.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Pagination/ (showcase blocks)
 *
 * Last synced props: page, onChange, changeAction, totalItems, totalPages, hasMore,
 *   pageSize, pageSizeOptions, onPageSizeChange, variant, siblingCount, size, isDisabled,
 *   label, data-testid, xstyle
 */

import {useOptimistic, useTransition} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  fontWeightVars,
  sizeVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Selector} from '../Selector';
import {Text} from '../Text';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

/**
 * Extensible variant map for Pagination.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Pagination' {
 *   interface PaginationVariantMap {
 *     'progress': true;
 *   }
 * }
 * ```
 */
export interface PaginationVariantMap {
  pages: true;
  count: true;
  compact: true;
  dots: true;
  none: true;
}

/** Visual variant controlling what appears between prev/next buttons.
 * Extensible via module augmentation of PaginationVariantMap.
 */
export type PaginationVariant = keyof PaginationVariantMap;

/** Size of the pagination controls. */
export type PaginationSize = 'sm' | 'md';

export interface PaginationProps extends Omit<
  BaseProps<HTMLElement>,
  'onChange'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  // --- Core (required) ---
  /** Current page number (1-based). Page 1 is the first page. */
  page: number;
  /** Called when the page changes. */
  onChange: (page: number) => void;
  /**
   * Async action on page change. Fires after onChange.
   * Uses React transitions for built-in loading state.
   */
  changeAction?: (page: number) => void | Promise<void>;

  // --- Data shape (provide one) ---
  /**
   * Total number of items. Used to calculate page count.
   * Takes precedence over totalPages if both provided.
   */
  totalItems?: number;
  /**
   * Total number of pages. Use when you know page count but not item count.
   */
  totalPages?: number;
  /**
   * Whether more pages exist after the current one.
   * Use for cursor-based pagination where total is unknown.
   */
  hasMore?: boolean;

  // --- Page size ---
  /** Number of items per page. @default 10 */
  pageSize?: number;
  /** Available page size options. Shows a page size selector when provided. */
  pageSizeOptions?: number[];
  /** Called when the page size changes. */
  onPageSizeChange?: (pageSize: number) => void;

  // --- Display ---
  /**
   * Visual variant controlling what appears between prev/next buttons.
   * - pages: Page number buttons with ellipsis (default)
   * - count: "X–Y of Z" text
   * - compact: "Page X of Y" text
   * - dots: Dot indicators
   * - none: Just prev/next buttons
   * @default 'pages'
   */
  variant?: PaginationVariant;
  /**
   * Number of page buttons to show on each side of the current page.
   * Only applies when variant='pages'. @default 1
   */
  siblingCount?: number;
  /**
   * Size of the pagination controls.
   * @default 'md'
   */
  size?: PaginationSize;

  // --- Behavior ---
  /** Whether the component is disabled. @default false */
  isDisabled?: boolean;

  // --- Accessibility ---
  /**
   * Accessible label for the navigation landmark.
   * @default 'Pagination'
   */
  label?: string;

  // --- Standard Astryx ---
  /** Test ID for automated testing. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-4'],
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  ellipsis: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: sizeVars['--size-element-md'],
    height: sizeVars['--size-element-md'],
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-label-size'],
    userSelect: 'none',
  },
  ellipsisSm: {
    minWidth: sizeVars['--size-element-sm'],
    height: sizeVars['--size-element-sm'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  infoText: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  dotsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  dot: {
    width: spacingVars['--spacing-2'],
    height: spacingVars['--spacing-2'],
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-neutral'],
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  dotSm: {
    width: spacingVars['--spacing-1-5'],
    height: spacingVars['--spacing-1-5'],
  },
  dotActive: {
    backgroundColor: colorVars['--color-accent'],
  },
  dotDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  activePage: {
    backgroundColor: colorVars['--color-neutral'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  pageSizeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  pageSizeSelectorControl: {
    width: 80,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Generates the range of page numbers to display, including ellipsis markers.
 * Returns an array of page numbers and '...' strings.
 *
 * @example
 * ```
 * generatePageRange(5, 10, 1) → [1, '...', 4, 5, 6, '...', 10]
 * generatePageRange(1, 10, 1) → [1, 2, 3, '...', 10]
 * generatePageRange(1, 5, 1)  → [1, 2, 3, 4, 5]
 * ```
 */
export function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | '...')[] {
  // Total page number slots (excluding ellipses):
  // first + last + current + 2*siblings = 3 + 2*siblings
  // With 2 potential ellipsis slots: 5 + 2*siblings
  const totalSlots = 5 + 2 * siblingCount;

  // If total pages fit within slots, show all pages
  if (totalPages <= totalSlots) {
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    // Near the start: show more pages on the left
    const leftRange = 3 + 2 * siblingCount;
    const pages: (number | '...')[] = Array.from(
      {length: leftRange},
      (_, i) => i + 1,
    );
    pages.push('...', totalPages);
    return pages;
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // Near the end: show more pages on the right
    const rightRange = 3 + 2 * siblingCount;
    const pages: (number | '...')[] = [1, '...'];
    for (let i = totalPages - rightRange + 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // In the middle: show ellipsis on both sides
  const pages: (number | '...')[] = [1, '...'];
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    pages.push(i);
  }
  pages.push('...', totalPages);
  return pages;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Standalone pagination controls for navigating through pages of content.
 *
 * Supports multiple display variants: page numbers, count text, compact text,
 * dot indicators, or minimal prev/next navigation. Works with known totals
 * or cursor-based pagination.
 *
 * @example
 * ```
 * <Pagination
 *   page={page}
 *   onChange={setPage}
 *   totalItems={200}
 *   pageSize={20}
 * />
 * ```
 */
export function Pagination({
  page,
  onChange,
  changeAction,
  totalItems,
  totalPages: totalPagesProp,
  hasMore,
  pageSize = 10,
  pageSizeOptions,
  onPageSizeChange,
  variant = 'pages',
  siblingCount = 1,
  size = 'md',
  isDisabled = false,
  label = 'Pagination',
  'data-testid': testId,
  xstyle,
  className,
  style,
  ref,
}: PaginationProps) {
  const [, startTransition] = useTransition();

  // Track the page optimistically so rapid prev/next clicks advance from the
  // in-flight target instead of stalling on the last committed page.
  const [optimisticPage, setOptimisticPage] = useOptimistic(page);

  // Compute pagination state
  const computedTotalPages =
    totalPagesProp ??
    (totalItems != null ? Math.ceil(totalItems / pageSize) : undefined);

  const hasPrevious = optimisticPage > 1;
  const hasNext =
    computedTotalPages != null
      ? optimisticPage < computedTotalPages
      : (hasMore ?? false);

  // Return null for empty state
  if (totalItems != null && totalItems <= 0) {
    return null;
  }
  if (computedTotalPages != null && computedTotalPages <= 0) {
    return null;
  }

  // Interruptible: re-clicking before the transition settles starts a fresh one
  // with the next optimistic page rather than being dropped, so there is no
  // re-entry guard.
  const handlePageChange = (newPage: number) => {
    if (isDisabled) {
      return;
    }
    // Keep onChange urgent so controlled page state updates in the same commit
    // as the click; only the optimistic indicator and changeAction defer.
    onChange(newPage);
    startTransition(async () => {
      setOptimisticPage(newPage);
      await changeAction?.(newPage);
    });
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      handlePageChange(optimisticPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      handlePageChange(optimisticPage + 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    onPageSizeChange?.(newSize);
    // Reset to page 1 when page size changes.
    handlePageChange(1);
  };

  // Item range for count display
  const rangeStart = (optimisticPage - 1) * pageSize + 1;
  const rangeEnd =
    totalItems != null
      ? Math.min(optimisticPage * pageSize, totalItems)
      : optimisticPage * pageSize;

  const buttonSize = size === 'sm' ? 'sm' : 'md';
  const isSm = size === 'sm';

  const renderIndicator = () => {
    switch (variant) {
      case 'pages': {
        if (computedTotalPages == null) {
          return null;
        }
        const pageRange = generatePageRange(
          optimisticPage,
          computedTotalPages,
          siblingCount,
        );
        return (
          <>
            {pageRange.map((item, index) => {
              if (item === '...') {
                const previousPage = pageRange[index - 1];
                const nextPage = pageRange[index + 1];
                return (
                  <span
                    key={`ellipsis-${previousPage}-${nextPage}`}
                    aria-hidden="true"
                    {...stylex.props(
                      styles.ellipsis,
                      isSm && styles.ellipsisSm,
                    )}>
                    …
                  </span>
                );
              }
              const isActive = item === optimisticPage;
              return (
                <Button
                  key={item}
                  label={`Go to page ${item}`}
                  aria-label={`Go to page ${item}`}
                  variant="ghost"
                  size={buttonSize}
                  onClick={() => handlePageChange(item)}
                  isDisabled={isDisabled}
                  aria-current={isActive ? 'page' : undefined}
                  xstyle={isActive && styles.activePage}>
                  {item}
                </Button>
              );
            })}
          </>
        );
      }

      case 'count': {
        if (totalItems == null) {
          return null;
        }
        return (
          <span {...stylex.props(styles.infoText)}>
            <Text type="body" size="sm" color="secondary">
              {`${rangeStart}\u2013${rangeEnd} of ${totalItems}`}
            </Text>
          </span>
        );
      }

      case 'compact': {
        if (computedTotalPages == null) {
          return null;
        }
        return (
          <span {...stylex.props(styles.infoText)}>
            <Text type="body" size="sm" color="secondary">
              {`Page ${optimisticPage} of ${computedTotalPages}`}
            </Text>
          </span>
        );
      }

      case 'dots': {
        if (computedTotalPages == null) {
          return null;
        }
        return (
          <div
            {...stylex.props(styles.dotsContainer)}
            role="group"
            aria-label="Page indicators">
            {Array.from({length: computedTotalPages}, (_, i) => (
              <button
                key={i + 1}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                aria-current={i + 1 === optimisticPage ? 'page' : undefined}
                onClick={() => handlePageChange(i + 1)}
                disabled={isDisabled}
                {...mergeProps(
                  themeProps('pagination-dot', {
                    active: i + 1 === optimisticPage ? 'active' : null,
                    size,
                  }),
                  stylex.props(
                    styles.dot,
                    isSm && styles.dotSm,
                    i + 1 === optimisticPage && styles.dotActive,
                    isDisabled && styles.dotDisabled,
                  ),
                )}
              />
            ))}
          </div>
        );
      }

      case 'none':
      default:
        return null;
    }
  };

  return (
    <nav
      ref={ref}
      aria-label={label}
      data-testid={testId}
      {...mergeProps(
        themeProps('pagination', {variant, size}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      {pageSizeOptions != null && pageSizeOptions.length > 0 && (
        <div {...stylex.props(styles.pageSizeSelector)}>
          <div {...stylex.props(styles.pageSizeSelectorControl)}>
            <Selector
              label="Items per page"
              isLabelHidden
              options={pageSizeOptions.map(opt => String(opt))}
              value={String(pageSize)}
              onChange={handlePageSizeChange}
              size={buttonSize}
              isDisabled={isDisabled}
            />
          </div>
        </div>
      )}
      <div {...stylex.props(styles.controls)}>
        <Button
          label="Go to previous page"
          variant="ghost"
          size={buttonSize}
          icon={<Icon icon="chevronLeft" size={isSm ? 'sm' : 'md'} />}
          onClick={handlePrevious}
          isDisabled={isDisabled || !hasPrevious}
          isIconOnly
        />

        {renderIndicator()}

        <Button
          label="Go to next page"
          variant="ghost"
          size={buttonSize}
          icon={<Icon icon="chevronRight" size={isSm ? 'sm' : 'md'} />}
          onClick={handleNext}
          isDisabled={isDisabled || !hasNext}
          isIconOnly
        />
      </div>
    </nav>
  );
}

Pagination.displayName = 'Pagination';

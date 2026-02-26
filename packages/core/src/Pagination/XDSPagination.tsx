/**
 * @file XDSPagination.tsx
 * @input Uses React, StyleX, theme tokens, XDSIcon (chevronLeft/chevronRight)
 * @output Exports XDSPagination component and XDSPaginationProps
 * @position Page navigation for paginated content — controlled component with ellipsis truncation
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Pagination/README.md (props table, features, implementation notes)
 * - /packages/core/src/Pagination/XDSPagination.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Pagination/index.ts (exports if types change)
 * - /apps/storybook/stories/Pagination.stories.tsx (storybook stories)
 */

'use client';

import {forwardRef, useTransition, type ReactElement} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';

// =============================================================================
// Types
// =============================================================================

/**
 * Size of the pagination controls.
 */
export type XDSPaginationSize = 'sm' | 'md';

export interface XDSPaginationProps {
  /**
   * Current active page (1-indexed).
   */
  currentPage: number;

  /**
   * Total number of pages.
   */
  totalPages: number;

  /**
   * Callback fired when the user selects a page.
   */
  onPageChange: (page: number) => void;

  /**
   * Async page change action (React 19 transitions pattern).
   * Use for server-side pagination where page changes trigger data fetching.
   */
  onPageChangeAction?: (page: number) => Promise<void>;

  /**
   * Size of the pagination controls.
   * - sm: Compact — for tables and dense UIs
   * - md: Standard — for standalone pagination
   * @default "md"
   */
  size?: XDSPaginationSize;

  /**
   * Maximum number of page buttons to show before truncating with ellipsis.
   * @default 7
   */
  maxVisiblePages?: number;

  /**
   * Whether to show previous/next arrow buttons.
   * @default true
   */
  hasArrows?: boolean;

  /**
   * Whether the pagination is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Accessible label for the pagination navigation.
   * @default "Pagination"
   */
  label?: string;

  /**
   * Optional StyleX overrides for the container.
   */
  xstyle?: StyleXStyles;

  /**
   * Test ID for the pagination container.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: 'inherit',
    fontWeight: fontWeightVars['--font-weight-medium'],
    cursor: 'pointer',
    transitionProperty: 'background-color, color, transform',
    transitionDuration: transitionVars['--transition-fast'],
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.96)',
    },
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  current: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-media'],
    backgroundImage: {
      default: null,
      ':hover': null,
    },
    transform: {
      default: null,
      ':active': null,
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.4,
    backgroundImage: {
      default: null,
      ':hover': null,
    },
    transform: {
      default: null,
      ':active': null,
    },
  },
  ellipsis: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colorVars['--color-text-secondary'],
    cursor: 'default',
    userSelect: 'none',
  },
});

const sizeStyles = stylex.create({
  sm: {
    minWidth: sizeVars['--size-sm'],
    height: sizeVars['--size-sm'],
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-base'],
    paddingInline: spacingVars['--spacing-1'],
  },
  md: {
    minWidth: sizeVars['--size-md'],
    height: sizeVars['--size-md'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    paddingInline: spacingVars['--spacing-2'],
  },
});

// =============================================================================
// Page Range Algorithm
// =============================================================================

type PageItem = {type: 'page'; page: number} | {type: 'ellipsis'; key: string};

/**
 * Compute visible page items with ellipsis truncation.
 *
 * Always shows first page, last page, and pages around current.
 * Inserts ellipsis when gaps exist between visible ranges.
 */
function computePageItems(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): PageItem[] {
  // If total pages fit within max, show all
  if (totalPages <= maxVisible) {
    return Array.from({length: totalPages}, (_, i) => ({
      type: 'page' as const,
      page: i + 1,
    }));
  }

  const items: PageItem[] = [];
  // Always include first and last page
  // Remaining slots for pages around current
  const sideCount = Math.floor((maxVisible - 3) / 2); // -3 for first, last, current

  let rangeStart = Math.max(2, currentPage - sideCount);
  let rangeEnd = Math.min(totalPages - 1, currentPage + sideCount);

  // Adjust if range is too close to start or end
  if (currentPage - sideCount <= 2) {
    rangeEnd = Math.min(totalPages - 1, maxVisible - 2);
  }
  if (currentPage + sideCount >= totalPages - 1) {
    rangeStart = Math.max(2, totalPages - maxVisible + 3);
  }

  // First page
  items.push({type: 'page', page: 1});

  // Left ellipsis
  if (rangeStart > 2) {
    items.push({type: 'ellipsis', key: 'left'});
  }

  // Middle range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    items.push({type: 'page', page: i});
  }

  // Right ellipsis
  if (rangeEnd < totalPages - 1) {
    items.push({type: 'ellipsis', key: 'right'});
  }

  // Last page
  items.push({type: 'page', page: totalPages});

  return items;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Page navigation for paginated content.
 *
 * Controlled component — parent owns `currentPage` state.
 * Supports ellipsis truncation, arrow navigation, and two sizes.
 *
 * @example
 * ```tsx
 * <XDSPagination
 *   currentPage={currentPage}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 * />
 *
 * // Compact for tables
 * <XDSPagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 *   size="sm"
 * />
 * ```
 */
export const XDSPagination = forwardRef<HTMLElement, XDSPaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      onPageChangeAction,
      size = 'md',
      maxVisiblePages = 7,
      hasArrows = true,
      isDisabled = false,
      label = 'Pagination',
      xstyle,
      'data-testid': testId,
    },
    ref,
  ): ReactElement | null => {
    const [isPending, startTransition] = useTransition();
    const isLoading = isPending;

    // Don't render for single page or invalid state
    if (totalPages <= 1) {
      return null;
    }

    const pageItems = computePageItems(
      currentPage,
      totalPages,
      maxVisiblePages,
    );

    const handlePageChange = (page: number) => {
      if (isDisabled || isLoading || page === currentPage) return;
      if (page < 1 || page > totalPages) return;

      if (onPageChangeAction) {
        startTransition(async () => {
          await onPageChangeAction(page);
        });
      }
      onPageChange(page);
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
      <nav
        ref={ref}
        aria-label={label}
        data-testid={testId}
        {...stylex.props(styles.nav, xstyle)}>
        <ul {...stylex.props(styles.list)}>
          {hasArrows && (
            <li>
              <button
                type="button"
                aria-label="Previous page"
                disabled={isFirstPage || isDisabled}
                onClick={() => handlePageChange(currentPage - 1)}
                {...stylex.props(
                  styles.button,
                  sizeStyles[size],
                  (isFirstPage || isDisabled) && styles.disabled,
                )}>
                <XDSIcon
                  icon="chevronLeft"
                  size={size === 'sm' ? 'xsm' : 'sm'}
                  color="inherit"
                />
              </button>
            </li>
          )}

          {pageItems.map(item => {
            if (item.type === 'ellipsis') {
              return (
                <li key={item.key} aria-hidden="true">
                  <span {...stylex.props(styles.ellipsis, sizeStyles[size])}>
                    …
                  </span>
                </li>
              );
            }

            const isCurrent = item.page === currentPage;
            return (
              <li key={item.page}>
                <button
                  type="button"
                  aria-label={`Page ${item.page}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  disabled={isDisabled}
                  onClick={() => handlePageChange(item.page)}
                  {...stylex.props(
                    styles.button,
                    sizeStyles[size],
                    isCurrent && styles.current,
                    isDisabled && styles.disabled,
                  )}>
                  {item.page}
                </button>
              </li>
            );
          })}

          {hasArrows && (
            <li>
              <button
                type="button"
                aria-label="Next page"
                disabled={isLastPage || isDisabled}
                onClick={() => handlePageChange(currentPage + 1)}
                {...stylex.props(
                  styles.button,
                  sizeStyles[size],
                  (isLastPage || isDisabled) && styles.disabled,
                )}>
                <XDSIcon
                  icon="chevronRight"
                  size={size === 'sm' ? 'xsm' : 'sm'}
                  color="inherit"
                />
              </button>
            </li>
          )}
        </ul>
      </nav>
    );
  },
);

XDSPagination.displayName = 'XDSPagination';

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSOutline.tsx
 * @input Uses React, StyleX, XDS link provider integration, useListFocus, useScrollSpy
 * @output Exports XDSOutline component and XDSOutlineProps type
 * @position Core implementation; consumed by index.ts
 *
 * A table-of-contents navigation component with:
 * - Sliding indicator track (vertical divider + animated active bar)
 * - Size variant (sm/md)
 * - Keyboard navigation via useListFocus
 * - Scroll-spy with click-lock to prevent jitter
 * - Navigate callbacks for custom highlight effects
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 * - /apps/storybook/stories/Outline.stories.tsx
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import {mergeProps, mergeRefs, xdsClassName} from '../utils';
import {useListFocus} from '../hooks/useListFocus';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useScrollSpy} from './useScrollSpy';
import type {OutlineItem} from './types';

export type {OutlineItem} from './types';

export type XDSOutlineSize = 'sm' | 'md';

export interface XDSOutlineProps extends XDSBaseProps<HTMLElement> {
  /** Ref forwarded to the root nav element. */
  ref?: React.Ref<HTMLElement>;

  /** Ordered list of heading items to render. */
  items: OutlineItem[];

  /** ID of the currently active item. When provided, disables built-in scroll-spy. */
  activeId?: string;

  /** Called when the active item changes from scroll-spy or click. */
  onActiveIdChange?: (id: string) => void;

  /** Accessible label for the nav landmark. @default 'Table of contents' */
  label?: string;

  /**
   * Size variant controlling item padding.
   * - 'sm': Compact spacing for dense UIs
   * - 'md': Standard spacing (default)
   * @default 'md'
   */
  size?: XDSOutlineSize;

  /**
   * Pixel offset from the top of the scroll container for determining
   * the active section. Useful when a fixed header overlaps content.
   * @default 0
   */
  offset?: number;

  /**
   * Scroll container ref to scope scroll tracking to a specific container.
   * Defaults to the nearest scrollable ancestor or viewport.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;

  /**
   * Whether clicking an item smooth-scrolls to the target section.
   * @default true
   */
  hasScrollOnClick?: boolean;

  /**
   * Callback fired when programmatic scroll begins (item clicked).
   * Use to apply custom highlight effects to the target section.
   */
  onNavigateStart?: (id: string) => void;

  /**
   * Callback fired when programmatic scroll ends and the target section is in view.
   * Use for custom highlight effects (flash, ring, pulse, etc.).
   */
  onNavigateEnd?: (id: string) => void;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    gap: spacingVars['--spacing-0-5'],
    width: '100%',
  },
  track: {
    position: 'relative',
    width: '2px',
    flexShrink: 0,
  },
  dividerLine: {
    position: 'absolute',
    insetBlockStart: 0,
    insetBlockEnd: 0,
    insetInlineStart: 0,
    width: '2px',
    backgroundColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-full'],
    pointerEvents: 'none',
  },
  indicator: {
    position: 'absolute',
    insetInlineStart: 0,
    width: '2px',
    backgroundColor: colorVars['--color-icon-primary'],
    borderRadius: radiusVars['--radius-full'],
    pointerEvents: 'none',
    transitionProperty: 'top, height',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
    flex: 1,
    minWidth: 0,
  },
  item: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  link: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-element'],
    boxSizing: 'border-box',
    color: colorVars['--color-text-secondary'],
    cursor: 'pointer',
    display: 'flex',
    fontWeight: fontWeightVars['--font-weight-normal'],
    outline: 'none',
    position: 'relative',
    textAlign: 'start',
    textDecoration: 'none',
    transitionDuration: durationVars['--duration-fast'],
    transitionProperty: 'background-color, color',
    transitionTimingFunction: easeVars['--ease-standard'],
    width: '100%',
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  linkHover: {
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
  },
  linkFocus: {
    outlineWidth: {
      ':focus-visible': '2px',
    },
    outlineStyle: {
      ':focus-visible': 'solid',
    },
    outlineColor: {
      ':focus-visible': colorVars['--color-accent'],
    },
    outlineOffset: {
      ':focus-visible': '2px',
    },
  },
  activeLink: {
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const sizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
});

const indentStyles = stylex.create({
  level1: {paddingInlineStart: spacingVars['--spacing-3']},
  level2: {paddingInlineStart: spacingVars['--spacing-7']},
  level3: {paddingInlineStart: spacingVars['--spacing-11']},
  level4: {paddingInlineStart: spacingVars['--spacing-12']},
});

function getIndentStyle(level: number) {
  // Map heading levels 1-6 to visual indent levels 1-4
  // Level 1 (h1) = indent 1, Level 2 (h2) = indent 1, Level 3 (h3) = indent 2, etc.
  const indentLevel = Math.max(1, Math.min(4, level - 1 || 1));
  switch (indentLevel) {
    case 1:
      return indentStyles.level1;
    case 2:
      return indentStyles.level2;
    case 3:
      return indentStyles.level3;
    default:
      return indentStyles.level4;
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * A table-of-contents navigation component for document headings.
 *
 * XDSOutline accepts a flat `items` array and renders anchor links with
 * indentation based on each heading level. Features a sliding indicator
 * track, keyboard navigation, and smooth-scroll on click.
 *
 * When `activeId` is omitted, it uses a hybrid IntersectionObserver +
 * scroll-position approach to track the currently visible heading.
 *
 * @example
 * ```
 * <XDSOutline
 *   items={[
 *     {id: 'intro', label: 'Introduction', level: 1},
 *     {id: 'features', label: 'Features', level: 2},
 *     {id: 'api', label: 'API Reference', level: 1},
 *   ]}
 *   offset={64}
 * />
 * ```
 */
export function XDSOutline({
  items,
  activeId: controlledActiveId,
  onActiveIdChange,
  label = 'Table of contents',
  size = 'md',
  offset = 0,
  scrollContainerRef,
  hasScrollOnClick = true,
  onNavigateStart,
  onNavigateEnd,
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  ...props
}: XDSOutlineProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const LinkComponent = useXDSLinkComponent();

  // Track whether we're in a programmatic scroll (click-initiated)
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll-spy hook
  const scrollSpy = useScrollSpy({
    items,
    activeId: controlledActiveId,
    onActiveIdChange,
    scrollContainerRef,
    offset,
    isLockedRef: isScrollingRef,
  });

  const activeId = scrollSpy.activeId;

  // Keyboard navigation
  const {listRef, handleKeyDown} = useListFocus<HTMLUListElement>({
    itemSelector: 'a[role="link"]',
    orientation: 'vertical',
  });

  // Refs for measuring item positions (for sliding indicator)
  const itemMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const listContainerRef = useRef<HTMLUListElement | null>(null);

  // Indicator position state
  const [indicatorStyle, setIndicatorStyle] = useState<{
    top: number;
    height: number;
  } | null>(null);

  // Keep the active id available to imperative observers without re-subscribing.
  const activeIdRef = useRef<string | undefined>(activeId);
  activeIdRef.current = activeId;

  // Measure the active item and sync the sliding indicator's top + height.
  // Reads the active item's actual rendered box, so it reflects size variant
  // changes (sm/md) and taller boxes from wrapped labels.
  const measureIndicator = useCallback(() => {
    const activeItemId = activeIdRef.current;
    const itemEl = activeItemId
      ? itemMapRef.current.get(activeItemId)
      : undefined;
    const listEl = listContainerRef.current;

    if (!activeItemId || !itemEl || !listEl) {
      setIndicatorStyle(prev => (prev === null ? prev : null));
      return;
    }

    const listRect = listEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();
    const next = {
      top: itemRect.top - listRect.top,
      height: itemRect.height,
    };

    // eslint-disable-next-line @eslint-react/set-state-in-effect -- syncing DOM measurements to state in a layout effect is intentional; the functional updater no-ops when unchanged
    setIndicatorStyle(prev =>
      prev != null && prev.top === next.top && prev.height === next.height
        ? prev
        : next,
    );
  }, []);

  // Re-measure whenever the active item, item set, or size variant changes.
  useLayoutEffect(() => {
    measureIndicator();
  }, [activeId, items, size, measureIndicator]);

  // Re-measure on reflow: wrapped labels, font loading, or container resize all
  // change item heights without changing activeId/items/size. A ResizeObserver
  // on the list (and the active item) catches these so the indicator stays in
  // sync with the actual rendered item height.
  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const listEl = listContainerRef.current;
    const activeItemEl = activeId
      ? itemMapRef.current.get(activeId)
      : undefined;

    const observer = new ResizeObserver(() => {
      measureIndicator();
    });

    if (listEl) {
      observer.observe(listEl);
    }
    if (activeItemEl) {
      observer.observe(activeItemEl);
    }

    return () => {
      observer.disconnect();
    };
  }, [activeId, items, size, measureIndicator]);

  const handleItemClick = useCallback(
    (id: string, event: React.MouseEvent<HTMLElement>) => {
      // Skip if modifier keys are held (allow normal link behavior)
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      event.preventDefault();

      if (hasScrollOnClick) {
        isScrollingRef.current = true;

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Fire onNavigateStart callback
        onNavigateStart?.(id);

        // Update URL hash
        window.history.pushState(null, '', `#${id}`);

        scrollSpy.scrollTo(id);

        // Unlock after scroll settles, then fire end callback
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          onNavigateEnd?.(id);
        }, 600);
      } else {
        scrollSpy.setActiveId(id);
      }
    },
    [hasScrollOnClick, scrollSpy, onNavigateStart, onNavigateEnd],
  );

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Directly invoke navigation (don't go through handleItemClick which checks defaultPrevented)
        if (hasScrollOnClick) {
          isScrollingRef.current = true;

          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          onNavigateStart?.(id);
          window.history.pushState(null, '', `#${id}`);
          scrollSpy.scrollTo(id);

          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
            onNavigateEnd?.(id);
          }, 600);
        } else {
          scrollSpy.setActiveId(id);
        }
      }
      handleKeyDown(e);
    },
    [
      hasScrollOnClick,
      scrollSpy,
      onNavigateStart,
      onNavigateEnd,
      handleKeyDown,
    ],
  );

  // Merge list refs — listContainerRef for indicator measurement, listRef for keyboard nav
  const mergedListRef = mergeRefs(listContainerRef, listRef);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav
      {...props}
      ref={mergeRefs(rootRef, ref)}
      aria-label={label}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('outline', {size}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      {/* Track — divider line + sliding indicator */}
      <div {...stylex.props(styles.track)} aria-hidden="true">
        <span {...stylex.props(styles.dividerLine)} />
        {indicatorStyle != null && (
          <span
            {...mergeProps(
              xdsClassName('outline-indicator'),
              stylex.props(styles.indicator),
              undefined,
              {
                top: indicatorStyle.top,
                height: indicatorStyle.height,
              },
            )}
          />
        )}
      </div>

      <ul
        ref={mergedListRef}
        {...stylex.props(styles.list)}
        role="list"
        onKeyDown={handleKeyDown}>
        {items.map(item => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id} {...stylex.props(styles.item)} role="listitem">
              <LinkComponent
                ref={(el: HTMLElement | null) => {
                  if (el) {
                    itemMapRef.current.set(item.id, el);
                  } else {
                    itemMapRef.current.delete(item.id);
                  }
                }}
                href={`#${item.id}`}
                role="link"
                tabIndex={0}
                aria-current={isActive ? 'true' : undefined}
                onClick={(e: React.MouseEvent<HTMLElement>) =>
                  handleItemClick(item.id, e)
                }
                onKeyDown={(e: React.KeyboardEvent) =>
                  handleItemKeyDown(e, item.id)
                }
                {...mergeProps(
                  xdsClassName('outline-item', {
                    active: isActive ? 'active' : null,
                    level: item.level,
                  }),
                  stylex.props(
                    styles.link,
                    styles.linkHover,
                    styles.linkFocus,
                    sizeStyles[size],
                    getIndentStyle(item.level),
                    isActive && styles.activeLink,
                  ),
                )}>
                <span {...stylex.props(styles.label)}>{item.label}</span>
              </LinkComponent>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

XDSOutline.displayName = 'XDSOutline';

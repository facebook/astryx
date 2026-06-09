// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSOutline.tsx
 * @input Uses React, StyleX, XDS link provider integration, Outline hooks/types
 * @output Exports XDSOutline component and XDSOutlineProps type
 * @position Core implementation; consumed by index.ts
 *
 * A table-of-contents navigation component with:
 * - Sliding indicator track (vertical divider + animated active bar)
 * - Density variant (default/compact)
 * - Scroll-spy active state when uncontrolled
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 * - /apps/storybook/stories/Outline.stories.tsx
 * - /packages/cli/templates/blocks/components/Outline/ (showcase blocks)
 */

import {useCallback, useLayoutEffect, useRef, useState} from 'react';
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
import type {XDSBaseProps} from '../XDSBaseProps';
import {useScrollSpy} from './useScrollSpy';
import type {OutlineItem} from './types';

export type {OutlineItem} from './types';

export type XDSOutlineDensity = 'default' | 'compact';

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
   * Density variant controlling item padding.
   * - 'default': Standard spacing (default)
   * - 'compact': Reduced spacing for dense UIs
   * @default 'default'
   */
  density?: XDSOutlineDensity;

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
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-overlay-hover'],
        color: colorVars['--color-text-primary'],
      },
    },
    ':active': {
      backgroundColor: colorVars['--color-overlay-pressed'],
    },
    ':focus-visible': {
      outline: `2px solid ${colorVars['--color-accent']}`,
      outlineOffset: 2,
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

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
  default: {
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
 * track that animates to the active item.
 *
 * When `activeId` is omitted, it observes heading elements by id and marks
 * the topmost visible heading active.
 *
 * @example
 * ```
 * <XDSOutline
 *   items={[
 *     {id: 'intro', label: 'Introduction', level: 1},
 *     {id: 'features', label: 'Features', level: 2},
 *     {id: 'api', label: 'API Reference', level: 1},
 *   ]}
 * />
 * ```
 */
export function XDSOutline({
  items,
  activeId,
  onActiveIdChange,
  label = 'Table of contents',
  density = 'default',
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  ...props
}: XDSOutlineProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const LinkComponent = useXDSLinkComponent();
  const [resolvedActiveId, setActiveId] = useScrollSpy({
    activeId,
    items,
    onActiveIdChange,
    rootRef,
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
  const activeIdRef = useRef<string | undefined>(resolvedActiveId);
  activeIdRef.current = resolvedActiveId;

  // Measure the active item and sync the sliding indicator's top + height.
  // Reads the active item's actual rendered box, so it reflects density variant
  // changes (default/compact) and taller boxes from wrapped labels.
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

  // Re-measure whenever the active item, item set, or density variant changes.
  useLayoutEffect(() => {
    measureIndicator();
  }, [resolvedActiveId, items, density, measureIndicator]);

  const handleClick =
    (id: string) => (event: React.MouseEvent<HTMLElement>) => {
      const target = document.getElementById(id);
      setActiveId(id);

      if (
        target == null ||
        event.defaultPrevented ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
      ) {
        return;
      }

      event.preventDefault();
      window.history.pushState(null, '', `#${id}`);
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

  return (
    <nav
      {...props}
      ref={mergeRefs(rootRef, ref)}
      aria-label={label}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('outline', {density}),
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

      <ul ref={listContainerRef} {...stylex.props(styles.list)} role="list">
        {items.map(item => {
          const isActive = item.id === resolvedActiveId;

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
                aria-current={isActive ? 'true' : undefined}
                onClick={handleClick(item.id)}
                {...mergeProps(
                  xdsClassName('outline-item', {
                    active: isActive ? 'active' : null,
                    level: item.level,
                  }),
                  stylex.props(
                    styles.link,
                    densityStyles[density],
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

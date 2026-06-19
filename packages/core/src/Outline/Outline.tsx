// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Outline.tsx
 * @input Uses React, StyleX, XDS link provider integration, Outline hooks/types
 * @output Exports Outline component and OutlineProps type
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 * - /apps/storybook/stories/Outline.stories.tsx
 */

import {useRef} from 'react';
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
import {useLinkComponent} from '../Link/useLinkComponent';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {useScrollSpy} from './useScrollSpy';
import type {OutlineItem} from './types';
import {xdsThemeProps} from '../utils/xdsThemeProps';

export type {OutlineItem} from './types';

export interface OutlineProps extends BaseProps<HTMLElement> {
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

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

const styles = stylex.create({
  root: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    width: '100%',
  },
  list: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  link: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-inner'],
    boxSizing: 'border-box',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    minHeight: spacingVars['--spacing-7'],
    outline: 'none',
    paddingBlock: spacingVars['--spacing-1'],
    paddingInlineEnd: spacingVars['--spacing-2'],
    position: 'relative',
    textAlign: 'start',
    textDecoration: 'none',
    transitionDuration: durationVars['--duration-fast'],
    transitionProperty: 'background-color, color',
    transitionTimingFunction: easeVars['--ease-standard'],
    width: '100%',
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
    color: colorVars['--color-text-accent'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  activeIndicator: {
    '::before': {
      backgroundColor: colorVars['--color-accent'],
      borderRadius: radiusVars['--radius-full'],
      bottom: spacingVars['--spacing-1'],
      content: '""',
      insetInlineStart: 0,
      position: 'absolute',
      top: spacingVars['--spacing-1'],
      width: 2,
    },
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const dynamicStyles = stylex.create({
  levelIndent: (level: number) => ({
    paddingInlineStart: `calc(${Math.max(0, Math.min(5, level - 1))} * ${spacingVars['--spacing-4']} + ${spacingVars['--spacing-2']})`,
  }),
});

/**
 * A table-of-contents navigation component for document headings.
 *
 * Outline accepts a flat `items` array and renders anchor links with
 * indentation based on each heading level. When `activeId` is omitted, it
 * observes heading elements by id and marks the topmost visible heading active.
 */
export function Outline({
  items,
  activeId,
  onActiveIdChange,
  label = 'Table of contents',
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  ...props
}: OutlineProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const LinkComponent = useLinkComponent();
  const [resolvedActiveId, setActiveId] = useScrollSpy({
    activeId,
    items,
    onActiveIdChange,
    rootRef,
  });

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
        xdsThemeProps('outline'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      <ul {...stylex.props(styles.list)}>
        {items.map(item => {
          const isActive = item.id === resolvedActiveId;
          return (
            <li key={item.id} {...stylex.props(styles.item)}>
              <LinkComponent
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={handleClick(item.id)}
                {...mergeProps(
                  xdsThemeProps('outline-item', {
                    active: isActive ? 'active' : null,
                    level: item.level,
                  }),
                  stylex.props(
                    styles.link,
                    dynamicStyles.levelIndent(item.level),
                    isActive && styles.activeLink,
                    isActive && styles.activeIndicator,
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

Outline.displayName = 'Outline';

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Banner.tsx
 * @input Uses React useState, Button, Icon (with registry string names), StyleX
 * @output Exports Banner component, BannerProps, BannerStatus, BannerContainer types
 * @position Core implementation; consumed by index.ts, tested by Banner.test.tsx
 *
 * Visual structure:
 * - Root container: layout-only wrapper (flex column), no visual styling, no theme target
 * - Header area (themeProps 'banner'): colored status background with icon, title, description, actions, dismiss
 * - Content area (themeProps 'banner-content'): collapsible card background for additional content (children)
 * - No left border accent — color is expressed through the full header background
 * - Each visual area owns its own border-radius (no overflow:clip on the container)
 * - When children are provided, a collapse/expand toggle button appears in the end area
 *
 * Title and description render as <div> (not <p>): they accept arbitrary
 * ReactNode content, and <p> cannot legally contain block-level children
 * (the HTML parser reparents them, desyncing SSR markup from the hydrated
 * DOM). Using <div> keeps these slots composable with any content. Their
 * StyleX styles set margin: 0 and explicit typography, so the rendered
 * appearance is identical to the previous <p>.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Banner/Banner.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Banner/Banner.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Banner/index.ts (exports if types change)
 * - /apps/storybook/stories/Banner.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Banner/ (showcase blocks)
 */

import {useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {Button} from '../Button';
import {Icon} from '../Icon';
import type {IconName} from '../Icon';
import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {edgeCompSlot} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

/**
 * Extensible status map for Banner.
 *
 * Theme packages can add custom statuses via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Banner' {
 *   interface BannerStatusMap {
 *     'neutral': true;
 *   }
 * }
 * ```
 */
export interface BannerStatusMap {
  info: true;
  warning: true;
  error: true;
  success: true;
}

/**
 * Status type controlling the banner's icon and color.
 * Extensible via module augmentation of BannerStatusMap.
 */
export type BannerStatus = keyof BannerStatusMap;

/**
 * Extensible container map for Banner.
 *
 * Theme packages can add custom container types via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Banner' {
 *   interface BannerContainerMap {
 *     'floating': true;
 *   }
 * }
 * ```
 */
export interface BannerContainerMap {
  card: true;
  section: true;
}

/**
 * Container type of the banner.
 * - `card`: standalone card with border-radius and shadow
 * - `section`: full-width section banner (no border-radius)
 *
 * Extensible via module augmentation of BannerContainerMap.
 */
export type BannerContainer = keyof BannerContainerMap;

export interface BannerProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Status type controlling the icon and color scheme.
   */
  status: BannerStatus;
  /**
   * Title text or ReactNode displayed prominently in the header area.
   */
  title: ReactNode;
  /**
   * Optional description text below the title in the header area.
   */
  description?: ReactNode;
  /**
   * Override the default status icon.
   */
  icon?: ReactNode;
  /**
   * Whether the banner can be dismissed.
   * When true, shows a close button and manages internal dismissed state
   * so the banner disappears even if `onDismiss` is not provided.
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Called when the dismiss button is clicked.
   * The banner will hide itself regardless of whether this callback is provided.
   */
  onDismiss?: () => void;
  /**
   * Action button rendered in the header area (end-aligned).
   * Typically an Button with a secondary or ghost variant.
   *
   * @example
   * ```
   * endContent={<Button label="Retry" variant="ghost" onClick={handleRetry} />}
   * ```
   */
  endContent?: ReactNode;
  /**
   * Container type of the banner.
   * - `card`: standalone card with border-radius
   * - `section`: full-width section banner (no border-radius)
   * @default 'card'
   */
  container?: BannerContainer;
  /**
   * Whether the content area (children) starts expanded.
   * Only relevant when children are provided.
   * @default false
   */
  defaultIsExpanded?: boolean;
  /**
   * Extra content rendered below the header in a collapsible card-background area.
   * Use for rich content like lists, links, or detailed information.
   * When provided, a collapse/expand toggle button appears in the header.
   */
  children?: ReactNode;
}

// =============================================================================
// Status → Icon mapping
// =============================================================================

const defaultIconNames: Record<BannerStatus, IconName> = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
};

// =============================================================================
// Status → ARIA role mapping
// =============================================================================

const statusRole: Record<BannerStatus, 'alert' | 'status'> = {
  info: 'status',
  warning: 'alert',
  error: 'alert',
  success: 'status',
};

// =============================================================================
// Status → Icon color mapping
// =============================================================================

const statusIconColor = {
  info: 'accent',
  warning: 'warning',
  error: 'error',
  success: 'success',
} as const;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Root container — layout only, no visual styling
  root: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'inherit',
  },
  // Header area — colored status background with icon, title, description, actions
  // This is the primary theme target ('banner')
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
  },
  // Border-radius for card container: all corners when standalone, top-only when content is visible
  headerCardStandalone: {
    borderRadius: radiusVars['--radius-container'],
  },
  headerCardWithContent: {
    borderTopLeftRadius: radiusVars['--radius-container'],
    borderTopRightRadius: radiusVars['--radius-container'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // When there's only a title (no description) and actions, center everything vertically
  headerCentered: {
    alignItems: 'center',
  },
  // Text content area within the header
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-label-leading'],
    color: colorVars['--color-text-primary'],
  },
  description: {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  endArea: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    marginInlineStart: 'auto',
    marginBlock: `calc(-1 * (${spacingVars['--spacing-3']} - ${spacingVars['--spacing-2']}))`,
  },
  // Content area — theme target ('banner-content')
  contentArea: {
    backgroundColor: colorVars['--color-background-card'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    borderLeftWidth: borderVars['--border-width'],
    borderRightWidth: borderVars['--border-width'],
    borderBottomWidth: borderVars['--border-width'],
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftColor: colorVars['--color-border'],
    borderRightColor: colorVars['--color-border'],
    borderBottomColor: colorVars['--color-border'],
  },
  contentAreaCard: {
    borderBottomLeftRadius: radiusVars['--radius-container'],
    borderBottomRightRadius: radiusVars['--radius-container'],
  },
  chevron: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
});

const statusStyles = stylex.create({
  info: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning-muted'],
  },
  error: {
    backgroundColor: colorVars['--color-error-muted'],
  },
  success: {
    backgroundColor: colorVars['--color-success-muted'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A persistent status notification banner for info, warning, error, or success messages.
 *
 * Two-part visual structure:
 * - Header: colored status background with icon, title, description, and actions
 * - Content (optional): collapsible card background area for additional rich content
 *
 * When children are provided, a collapse/expand chevron button appears in the
 * header end area (to the left of the dismiss button if present). Clicking it
 * toggles the visibility of the content area.
 *
 * Manages its own dismissed state internally — the banner hides on dismiss
 * even if `onDismiss` is not provided, so product teams don't need to wire
 * up state management for basic dismiss behavior.
 *
 * Uses `role="alert"` for error/warning and `role="status"` for info/success.
 *
 * @example
 * ```
 * <Banner status="info" title="New update available" />
 * <Banner
 *   status="error"
 *   title="Something went wrong"
 *   description="Please try again later."
 *   isDismissable
 *   onDismiss={() => logDismiss()}
 * />
 * <Banner
 *   status="error"
 *   title="Multiple errors found"
 *   description="The following issues need to be resolved:"
 *   isDismissable>
 *   <ul>
 *     <li>Email address is invalid</li>
 *     <li>Password must be at least 8 characters</li>
 *   </ul>
 * </Banner>
 * <Banner
 *   status="warning"
 *   title="Configuration changes"
 *   defaultIsExpanded>
 *   <p>Details here...</p>
 * </Banner>
 * ```
 */
export function Banner({
  status,
  title,
  description,
  icon,
  isDismissable = false,
  onDismiss,
  endContent,
  container = 'card',
  defaultIsExpanded = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: BannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const defaultIconName = defaultIconNames[status];
  const role = statusRole[status];
  const iconColor = statusIconColor[status];
  const hasChildren = children != null;

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleToggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  // Show the end area if there are actions, dismiss, or a collapsible toggle
  const showEndArea = endContent != null || isDismissable || hasChildren;
  // Center items vertically when there's only a title (no description)
  // and the banner has action buttons
  const hasActions = endContent != null || isDismissable;
  const isSingleLine = description == null && hasActions;

  const showContent = hasChildren && isExpanded;
  const isCard = container === 'card';

  return (
    <div
      ref={ref}
      role={role}
      {...mergeProps(stylex.props(styles.root, xstyle), className, style)}
      {...rest}>
      {/* Header: colored status background — primary theme target ('banner') */}
      <div
        {...mergeProps(
          themeProps('banner', {container, status}),
          stylex.props(
            styles.header,
            isSingleLine && styles.headerCentered,
            statusStyles[status],
            isCard &&
              (showContent
                ? styles.headerCardWithContent
                : styles.headerCardStandalone),
          ),
        )}>
        <div
          {...mergeProps(
            themeProps('banner-icon', {status}),
            stylex.props(styles.iconWrapper),
          )}
          aria-hidden="true">
          {icon != null ? (
            icon
          ) : (
            <Icon icon={defaultIconName} size="md" color={iconColor} />
          )}
        </div>
        <div {...stylex.props(styles.headerContent)}>
          <div {...stylex.props(styles.title)}>{title}</div>
          {description != null && (
            <div {...stylex.props(styles.description)}>{description}</div>
          )}
        </div>
        {showEndArea && (
          <div
            {...stylex.props(
              styles.endArea,
              edgeCompSlot.inset(spacingVars['--spacing-2']),
            )}>
            {endContent}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                label={isExpanded ? 'Collapse' : 'Expand'}
                tooltip={isExpanded ? 'Collapse' : 'Expand'}
                icon={
                  <span
                    {...stylex.props(
                      styles.chevron,
                      isExpanded && styles.chevronExpanded,
                    )}>
                    <Icon icon="chevronDown" size="sm" color="inherit" />
                  </span>
                }
                onClick={handleToggleExpand}
                aria-expanded={isExpanded}
                isIconOnly
              />
            )}
            {isDismissable && (
              <Button
                variant="ghost"
                size="sm"
                label="Dismiss"
                tooltip="Dismiss"
                icon={<Icon icon="close" size="sm" color="inherit" />}
                onClick={handleDismiss}
                isIconOnly
              />
            )}
          </div>
        )}
      </div>
      {/* Content area: collapsible card background — theme target ('banner-content') */}
      {showContent && (
        <div
          {...mergeProps(
            themeProps('banner-content', {container, status}),
            stylex.props(styles.contentArea, isCard && styles.contentAreaCard),
          )}>
          {children}
        </div>
      )}
    </div>
  );
}

Banner.displayName = 'Banner';

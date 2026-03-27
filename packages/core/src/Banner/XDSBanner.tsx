'use client';

/**
 * @file XDSBanner.tsx
 * @input Uses ReactuseState, @heroicons/react/24/solid icons, XDSButton, XDSIcon, StyleX
 * @output Exports XDSBanner component, XDSBannerProps, XDSBannerStatus, XDSBannerContainer, XDSBannerLabelVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSBanner.test.tsx
 *
 * Visual structure:
 * - Header area: colored status background with icon, title, description, actions, dismiss
 * - Content area (optional): collapsible card background below the header for additional content (children)
 * - No left border accent — color is expressed through the full header background
 * - When children are provided, a collapse/expand toggle button appears in the end area
 * - Header always uses alignItems: flex-start so icon and actions pin to the top when title wraps
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Banner/Banner.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Banner/XDSBanner.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Banner/index.ts (exports if types change)
 * - /apps/storybook/stories/Banner.stories.tsx (storybook stories)
 */

import {useState, useRef, useEffect, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {edgeSignals} from '../Layout/edgeCompensation.stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

/**
 * Extensible status map for XDSBanner.
 *
 * Theme packages can add custom statuses via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Banner' {
 *   interface XDSBannerStatusMap {
 *     'neutral': true;
 *   }
 * }
 * ```
 */
export interface XDSBannerStatusMap {
  info: true;
  warning: true;
  error: true;
  success: true;
}

/**
 * Status type controlling the banner's icon and color.
 * Extensible via module augmentation of XDSBannerStatusMap.
 */
export type XDSBannerStatus = keyof XDSBannerStatusMap;

/**
 * Label variant controlling the title weight and whether description is shown.
 * - `emphasized`: semibold title, description allowed (default)
 * - `regular`: normal weight title, description is not rendered
 */
export type XDSBannerLabelVariant = 'emphasized' | 'regular';

/**
 * Extensible container map for XDSBanner.
 *
 * Theme packages can add custom container types via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Banner' {
 *   interface XDSBannerContainerMap {
 *     'floating': true;
 *   }
 * }
 * ```
 */
export interface XDSBannerContainerMap {
  card: true;
  section: true;
  content: true;
}

/**
 * Container type of the banner.
 * - `card`: standalone card with border-radius (--radius-container) and 16px padding
 * - `section`: full-width section banner (no border-radius) with 8px block / 16px inline padding
 * - `content`: inline banner living alongside text and lists, uses --radius-element and 8px block / 12px inline padding
 *
 * Extensible via module augmentation of XDSBannerContainerMap.
 */
export type XDSBannerContainer = keyof XDSBannerContainerMap;

export interface XDSBannerProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Status type controlling the icon and color scheme.
   */
  status: XDSBannerStatus;
  /**
   * Title text or ReactNode displayed prominently in the header area.
   */
  title: ReactNode;
  /**
   * Controls the title weight and whether description is rendered.
   * - `emphasized`: semibold title, description allowed (default)
   * - `regular`: normal weight title, description is not rendered
   * @default 'emphasized'
   */
  labelVariant?: XDSBannerLabelVariant;
  /**
   * Optional description text below the title in the header area.
   * Only rendered when labelVariant is 'emphasized' (the default).
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
   * Typically an XDSButton with a secondary or ghost variant.
   *
   * @example
   * ```
   * endContent={<XDSButton label="Retry" variant="ghost" onClick={handleRetry} />}
   * ```
   */
  endContent?: ReactNode;
  /**
   * Visual variant for the end area.
   * - `invisibleBackground`: applies a -4px block offset to optically align
   *   ghost or icon-only buttons with the text. Omit for primary/default buttons.
   */
  endAreaVariant?: 'invisibleBackground';
  /**
   * Container type of the banner.
   * - `card`: standalone card with border-radius
   * - `section`: full-width section banner (no border-radius)
   * @default 'card'
   */
  container?: XDSBannerContainer;
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
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Status → Icon mapping
// =============================================================================

const defaultIcons: Record<XDSBannerStatus, typeof InformationCircleIcon> = {
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
};

// =============================================================================
// Status → ARIA role mapping
// =============================================================================

const statusRole: Record<XDSBannerStatus, 'alert' | 'status'> = {
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
  error: 'negative',
  success: 'positive',
} as const;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Root wrapper — handles border-radius clipping and overall shape
  root: {
    fontFamily: 'inherit',
    overflow: 'clip',
  },
  card: {
    '--banner-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--banner-radius)',
  },
  section: {
    borderRadius: '0',
  },
  content: {
    '--banner-radius': radiusVars['--radius-element'],
    borderRadius: 'var(--banner-radius)',
  },
  // Header area — colored status background with icon, title, description, actions
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  // Applied when the text content is a single unwrapped line
  headerCentered: {
    alignItems: 'center',
  },
  // card variant: 16px on all sides
  headerCard: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    '--container-padding-inline': spacingVars['--spacing-4'],
  },
  // section variant: 8px block, 16px inline
  headerSection: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    '--container-padding-inline': spacingVars['--spacing-4'],
  },
  // content variant: 8px block, 12px inline
  headerContentVariant: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    '--container-padding-inline': spacingVars['--spacing-3'],
  },
  // Left group: icon + text content — grows to fill available space
  startArea: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
    flex: 1,
    minWidth: 0,
  },
  // Text content area within the header
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minWidth: 0,
  },
  title: {
    display: 'block',
    margin: 0,
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-label-leading'],
    color: colorVars['--color-text-primary'],
  },
  titleRegular: {
    fontWeight: fontWeightVars['--font-weight-normal'],
  },
  description: {
    display: 'block',
    margin: 0,
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-primary'],
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
  },
  endAreaInvisibleBackground: {
    marginBlockStart: '-8px',
  },
  // dismissButton negative margin removed — edge compensation handles this
  // automatically via --edge-end signal on the endArea
  // Content area — card background for additional content below the header
  contentArea: {
    backgroundColor: colorVars['--color-background-card'],
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftColor: colorVars['--color-border'],
    borderRightColor: colorVars['--color-border'],
    borderBottomColor: colorVars['--color-border'],
  },
  contentAreaCard: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
    borderBottomLeftRadius: 'var(--banner-radius)',
    borderBottomRightRadius: 'var(--banner-radius)',
  },
  contentAreaSection: {
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
  },
  contentAreaContentVariant: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    borderBottomLeftRadius: 'var(--banner-radius)',
    borderBottomRightRadius: 'var(--banner-radius)',
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
 * <XDSBanner status="info" title="New update available" />
 * <XDSBanner
 *   status="error"
 *   title="Something went wrong"
 *   description="Please try again later."
 *   isDismissable
 *   onDismiss={() => logDismiss()}
 * />
 * <XDSBanner
 *   status="error"
 *   title="Multiple errors found"
 *   description="The following issues need to be resolved:"
 *   isDismissable>
 *   <ul>
 *     <li>Email address is invalid</li>
 *     <li>Password must be at least 8 characters</li>
 *   </ul>
 * </XDSBanner>
 * <XDSBanner
 *   status="warning"
 *   title="Configuration changes"
 *   defaultIsExpanded>
 *   <p>Details here...</p>
 * </XDSBanner>
 * ```
 */
export function XDSBanner({
  status,
  title,
  labelVariant = 'emphasized',
  description,
  icon,
  isDismissable = false,
  onDismiss,
  endContent,
  endAreaVariant,
  container = 'card',
  defaultIsExpanded = false,
  children,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const [isSingleLine, setIsSingleLine] = useState(false);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const DefaultIcon = defaultIcons[status];
  const role = statusRole[status];
  const iconColor = statusIconColor[status];

  // Measure whether the text content is a single unwrapped line.
  // When single-line: center all header items vertically.
  // When wrapped: anchor to top so icon and buttons don't float to the middle.
  useEffect(() => {
    const el = headerContentRef.current;
    if (el == null) return;
    const check = () => {
      // scrollHeight > clientHeight means content has wrapped to multiple lines
      setIsSingleLine(el.scrollHeight <= el.clientHeight + 2);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [title, description]);
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
  // Apply -8px nudge when internal ghost buttons (dismiss/collapse) are present,
  // or when endContent is explicitly a ghost button (endAreaVariant='invisibleBackground').
  const applyEndAreaOffset =
    endAreaVariant === 'invisibleBackground' ||
    endContent == null ||
    isDismissable ||
    hasChildren;

  return (
    <div
      ref={ref}
      role={role}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('banner', {container, status}),
        stylex.props(
          styles.root,
          container === 'card' && styles.card,
          container === 'section' && styles.section,
          container === 'content' && styles.content,
          xstyle,
        ),
        className,
        style,
      )}>
      {/* Header: colored status background */}
      <div
        {...stylex.props(
          styles.header,
          isSingleLine && styles.headerCentered,
          container === 'card'
            ? styles.headerCard
            : container === 'section'
              ? styles.headerSection
              : styles.headerContentVariant,
          statusStyles[status],
        )}>
        <div {...stylex.props(styles.startArea)}>
          <div
            {...mergeProps(
              xdsClassName('banner-icon', {status}),
              stylex.props(styles.iconWrapper),
            )}
            aria-hidden="true">
            {icon != null ? (
              icon
            ) : (
              <XDSIcon icon={DefaultIcon} size="md" color={iconColor} />
            )}
          </div>
          <div ref={headerContentRef} {...stylex.props(styles.headerContent)}>
            <span
              {...stylex.props(
                styles.title,
                labelVariant === 'regular' && styles.titleRegular,
              )}>
              {title}
            </span>
            {labelVariant === 'emphasized' && description != null && (
              <span {...stylex.props(styles.description)}>{description}</span>
            )}
          </div>
        </div>
        {showEndArea && (
          <div
            {...stylex.props(
              styles.endArea,
              edgeSignals.end,
              applyEndAreaOffset && styles.endAreaInvisibleBackground,
            )}>
            {endContent}
            {hasChildren && (
              <XDSButton
                variant="ghost"
                size="sm"
                label={isExpanded ? 'Collapse' : 'Expand'}
                tooltip={isExpanded ? 'Collapse' : 'Expand'}
                icon={
                  <XDSIcon
                    icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={handleToggleExpand}
                aria-expanded={isExpanded}
              />
            )}
            {isDismissable && (
              <XDSButton
                variant="ghost"
                size="sm"
                label="Dismiss"
                tooltip="Dismiss"
                icon={<XDSIcon icon="close" size="sm" color="inherit" />}
                onClick={handleDismiss}
              />
            )}
          </div>
        )}
      </div>
      {/* Content area: collapsible card background for additional content */}
      {hasChildren && isExpanded && (
        <div
          {...stylex.props(
            styles.contentArea,
            container === 'card'
              ? styles.contentAreaCard
              : container === 'section'
                ? styles.contentAreaSection
                : styles.contentAreaContentVariant,
          )}>
          {children}
        </div>
      )}
    </div>
  );
}

XDSBanner.displayName = 'XDSBanner';

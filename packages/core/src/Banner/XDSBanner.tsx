/**
 * @file XDSBanner.tsx
 * @input Uses React forwardRef/useState, @heroicons/react/24/solid icons, XDSButton, XDSIcon, StyleX
 * @output Exports XDSBanner component, XDSBannerProps, XDSBannerStatus, XDSBannerVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSBanner.test.tsx
 *
 * Visual structure:
 * - Header area: colored status background with icon, title, description, actions, dismiss
 * - Content area (optional): collapsible card background below the header for additional content (children)
 * - No left border accent — color is expressed through the full header background
 * - When children are provided, a collapse/expand toggle button appears in the end area
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Banner/README.md (props table, features, implementation notes)
 * - /packages/core/src/Banner/XDSBanner.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Banner/index.ts (exports if types change)
 * - /apps/storybook/stories/Banner.stories.tsx (storybook stories)
 */

import {forwardRef, useState, type ReactNode} from 'react';
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
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Types
// =============================================================================

/**
 * Status type controlling the banner's icon and color.
 */
export type XDSBannerStatus = 'info' | 'warning' | 'error' | 'success';

/**
 * Visual variant of the banner.
 * - `card`: standalone card with border-radius and elevation
 * - `section`: full-width section banner (no border-radius)
 */
export type XDSBannerVariant = 'card' | 'section';

export interface XDSBannerProps {
  /**
   * Status type controlling the icon and color scheme.
   */
  status: XDSBannerStatus;
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
   * Typically an XDSButton with a secondary or ghost variant.
   *
   * @example
   * endContent={<XDSButton label="Retry" variant="ghost" onClick={handleRetry} />}
   */
  endContent?: ReactNode;
  /**
   * Visual variant of the banner.
   * - `card`: standalone card with border-radius
   * - `section`: full-width section banner (no border-radius)
   * @default 'card'
   */
  variant?: XDSBannerVariant;
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
   * StyleX override styles applied to the root element.
   */
  xstyle?: StyleXStyles;
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
    borderRadius: radiusVars['--radius-container'],
  },
  section: {
    borderRadius: '0',
  },
  // Header area — colored status background with icon, title, description, actions
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    // Publish inline padding for edge compensation (ghost buttons at edges).
    // Uses --container-padding-inline (not --container-padding) because Banner
    // has different block padding (spacing-3) vs inline padding (spacing-4).
    '--container-padding-inline': spacingVars['--spacing-4'],
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
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
  },
  description: {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-sm'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'],
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
  },
  // dismissButton negative margin removed — edge compensation handles this
  // automatically via --edge-end signal on the endArea
  // Content area — card background for additional content below the header
  contentArea: {
    backgroundColor: colorVars['--color-card'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftColor: colorVars['--color-divider'],
    borderRightColor: colorVars['--color-divider'],
    borderBottomColor: colorVars['--color-divider'],
  },
  contentAreaCard: {
    borderBottomLeftRadius: radiusVars['--radius-container'],
    borderBottomRightRadius: radiusVars['--radius-container'],
  },
});

const statusStyles = stylex.create({
  info: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning-deemphasized'],
  },
  error: {
    backgroundColor: colorVars['--color-negative-deemphasized'],
  },
  success: {
    backgroundColor: colorVars['--color-positive-deemphasized'],
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
 * // Simple banner — just the colored header
 * <XDSBanner status="info" title="New update available" />
 *
 * // With description and dismiss
 * <XDSBanner
 *   status="error"
 *   title="Something went wrong"
 *   description="Please try again later."
 *   isDismissable
 *   onDismiss={() => logDismiss()}
 * />
 *
 * // With collapsible content area
 * <XDSBanner
 *   status="error"
 *   title="Multiple errors found"
 *   description="The following issues need to be resolved:"
 *   isDismissable
 * >
 *   <ul>
 *     <li>Email address is invalid</li>
 *     <li>Password must be at least 8 characters</li>
 *   </ul>
 * </XDSBanner>
 *
 * // Content area expanded by default
 * <XDSBanner
 *   status="warning"
 *   title="Configuration changes"
 *   defaultIsExpanded
 * >
 *   <p>Details here...</p>
 * </XDSBanner>
 * ```
 */
export const XDSBanner = forwardRef<HTMLDivElement, XDSBannerProps>(
  (
    {
      status,
      title,
      description,
      icon,
      isDismissable = false,
      onDismiss,
      endContent,
      variant = 'card',
      defaultIsExpanded = false,
      children,
      xstyle,
      'data-testid': testId,
    },
    ref,
  ) => {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
    const DefaultIcon = defaultIcons[status];
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

    return (
      <div
        ref={ref}
        role={role}
        data-testid={testId}
        {...stylex.props(
          styles.root,
          variant === 'card' && styles.card,
          variant === 'section' && styles.section,
          xstyle,
        )}>
        {/* Header: colored status background */}
        <div
          {...stylex.props(
            styles.header,
            isSingleLine && styles.headerCentered,
            statusStyles[status],
          )}>
          <div {...stylex.props(styles.iconWrapper)} aria-hidden="true">
            {icon != null ? (
              icon
            ) : (
              <XDSIcon icon={DefaultIcon} size="md" color={iconColor} />
            )}
          </div>
          <div {...stylex.props(styles.headerContent)}>
            <p {...stylex.props(styles.title)}>{title}</p>
            {description != null && (
              <p {...stylex.props(styles.description)}>{description}</p>
            )}
          </div>
          {showEndArea && (
            <div {...stylex.props(styles.endArea, edgeSignals.end)}>
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
              variant === 'card' && styles.contentAreaCard,
            )}>
            {children}
          </div>
        )}
      </div>
    );
  },
);

XDSBanner.displayName = 'XDSBanner';

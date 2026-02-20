/**
 * @file XDSBanner.tsx
 * @input Uses React forwardRef, @heroicons/react/24/solid icons, XDSCloseButton, StyleX
 * @output Exports XDSBanner component, XDSBannerProps, XDSBannerStatus, XDSBannerVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSBanner.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Banner/README.md (props table, features, implementation notes)
 * - /packages/core/src/Banner/XDSBanner.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Banner/index.ts (exports if types change)
 * - /apps/storybook/stories/Banner.stories.tsx (storybook stories)
 */

import {forwardRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import {XDSCloseButton} from '../CloseButton';
import {XDSIcon} from '../Icon';
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
 */
export type XDSBannerVariant = 'card' | 'section';

export interface XDSBannerProps {
  /**
   * Status type controlling the icon and color scheme.
   */
  status: XDSBannerStatus;
  /**
   * Title text or ReactNode displayed prominently.
   */
  title: ReactNode;
  /**
   * Optional description text below the title.
   */
  description?: ReactNode;
  /**
   * Override the default status icon.
   */
  icon?: ReactNode;
  /**
   * Whether the banner can be dismissed.
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Called when the dismiss button is clicked.
   */
  onDismiss?: () => void;
  /**
   * Action button rendered at the end of the banner.
   */
  endButton?: ReactNode;
  /**
   * Visual variant of the banner.
   * - `card`: has border-radius, subtle background, left border accent
   * - `section`: no border-radius, full-width, subtle background
   * @default 'card'
   */
  variant?: XDSBannerVariant;
  /**
   * Extra content rendered below the description.
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
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontFamily: 'inherit',
  },
  card: {
    borderRadius: radiusVars['--radius-container'],
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
  section: {
    borderRadius: '0',
    borderLeftWidth: '0',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
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
    paddingTop: spacingVars['--spacing-0-5'],
  },
  endArea: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
});

const statusStyles = stylex.create({
  info: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    borderLeftColor: colorVars['--color-accent'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning-deemphasized'],
    borderLeftColor: colorVars['--color-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-negative-deemphasized'],
    borderLeftColor: colorVars['--color-negative'],
  },
  success: {
    backgroundColor: colorVars['--color-positive-deemphasized'],
    borderLeftColor: colorVars['--color-positive'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A persistent status notification banner for info, warning, error, or success messages.
 *
 * Displays a status icon, title, optional description, and optional actions.
 * Uses `role="alert"` for error/warning and `role="status"` for info/success.
 *
 * @example
 * ```tsx
 * <XDSBanner status="info" title="New update available" />
 *
 * <XDSBanner
 *   status="error"
 *   title="Something went wrong"
 *   description="Please try again later."
 *   isDismissable
 *   onDismiss={() => setVisible(false)}
 * />
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
      endButton,
      variant = 'card',
      children,
      xstyle,
      'data-testid': testId,
    },
    ref,
  ) => {
    const DefaultIcon = defaultIcons[status];
    const role = statusRole[status];
    const iconColor = statusIconColor[status];

    return (
      <div
        ref={ref}
        role={role}
        data-testid={testId}
        {...stylex.props(
          styles.root,
          statusStyles[status],
          variant === 'card' && styles.card,
          variant === 'section' && styles.section,
          xstyle,
        )}>
        <div {...stylex.props(styles.iconWrapper)} aria-hidden="true">
          {icon != null ? (
            icon
          ) : (
            <XDSIcon icon={DefaultIcon} size="md" color={iconColor} />
          )}
        </div>
        <div {...stylex.props(styles.content)}>
          <p {...stylex.props(styles.title)}>{title}</p>
          {description != null && (
            <p {...stylex.props(styles.description)}>{description}</p>
          )}
          {children}
        </div>
        {(endButton != null || isDismissable) && (
          <div {...stylex.props(styles.endArea)}>
            {endButton}
            {isDismissable && (
              <XDSCloseButton label="Dismiss" size="sm" onClick={onDismiss} />
            )}
          </div>
        )}
      </div>
    );
  },
);

XDSBanner.displayName = 'XDSBanner';

/**
 * @file XDSBanner.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode, StyleXStyles
 * @output Exports XDSBanner component, XDSBannerProps, XDSBannerStatus types
 * @position Core implementation; consumed by index.ts, tested by XDSBanner.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Banner/README.md
 * - /packages/core/src/Banner/XDSBanner.test.tsx
 * - /packages/core/src/Banner/index.ts
 * - /apps/storybook/stories/Banner.stories.tsx
 */

import {forwardRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSCloseButton} from '../CloseButton';

// =============================================================================
// Types
// =============================================================================

/**
 * Banner status type controlling color scheme and default icon.
 */
export type XDSBannerStatus = 'info' | 'warning' | 'error' | 'success';

/**
 * Banner variant type controlling layout shape.
 */
export type XDSBannerVariant = 'card' | 'section';

export interface XDSBannerProps {
  /**
   * The status type of the banner, controlling color and default icon.
   */
  status: XDSBannerStatus;
  /**
   * The title text of the banner.
   */
  title: ReactNode;
  /**
   * Optional description text displayed below the title.
   */
  description?: ReactNode;
  /**
   * Custom icon to display. Overrides the default status icon.
   */
  icon?: ReactNode;
  /**
   * Whether the banner can be dismissed.
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Callback fired when the banner is dismissed.
   */
  onDismiss?: () => void;
  /**
   * Optional action button rendered at the end of the banner.
   */
  endButton?: ReactNode;
  /**
   * The visual variant of the banner.
   * - `card`: rounded corners with a colored left border
   * - `section`: full-width with no border radius
   * @default 'card'
   */
  variant?: XDSBannerVariant;
  /**
   * Additional content rendered below the title and description.
   */
  children?: ReactNode;
  /**
   * Additional StyleX styles to apply to the root element.
   */
  xstyle?: StyleXStyles;
  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-3'],
    padding: spacingVars['--spacing-4'],
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
  },
  card: {
    borderRadius: radiusVars['--radius-container'],
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
  },
  section: {
    borderRadius: '0',
    borderLeftWidth: '0',
    width: '100%',
  },
  icon: {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    marginTop: '2px',
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  title: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
  },
  description: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-normal'],
    color: colorVars['--color-text-secondary'],
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flexShrink: 0,
    marginTop: '2px',
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

const iconColorStyles = stylex.create({
  info: {
    color: colorVars['--color-accent'],
  },
  warning: {
    color: colorVars['--color-warning'],
  },
  error: {
    color: colorVars['--color-negative'],
  },
  success: {
    color: colorVars['--color-positive'],
  },
});

// =============================================================================
// Default Icons
// =============================================================================

const defaultIcons: Record<XDSBannerStatus, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
};

// =============================================================================
// Component
// =============================================================================

/**
 * A banner component for displaying contextual messages with status indicators.
 *
 * Supports info, warning, error, and success statuses with appropriate colors
 * and default icons. Can be dismissable and supports custom actions.
 *
 * @example
 * ```tsx
 * <XDSBanner status="info" title="Update available">
 *   A new version is ready to install.
 * </XDSBanner>
 *
 * <XDSBanner
 *   status="error"
 *   title="Upload failed"
 *   description="Please try again later."
 *   isDismissable
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
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) {
      return null;
    }

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss?.();
    };

    const role = status === 'error' || status === 'warning' ? 'alert' : 'status';

    const DefaultIcon = defaultIcons[status];
    const renderedIcon = icon ?? (
      <DefaultIcon aria-hidden="true" />
    );

    return (
      <div
        ref={ref}
        role={role}
        data-testid={testId}
        {...stylex.props(
          styles.base,
          variant === 'card' && styles.card,
          variant === 'section' && styles.section,
          statusStyles[status],
          xstyle,
        )}>
        <div {...stylex.props(styles.icon, iconColorStyles[status])}>
          {renderedIcon}
        </div>
        <div {...stylex.props(styles.content)}>
          <div {...stylex.props(styles.title)}>{title}</div>
          {description != null && (
            <div {...stylex.props(styles.description)}>{description}</div>
          )}
          {children}
        </div>
        {(endButton != null || isDismissable) && (
          <div {...stylex.props(styles.actions)}>
            {endButton}
            {isDismissable && (
              <XDSCloseButton
                size="sm"
                label="Dismiss"
                onClick={handleDismiss}
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

XDSBanner.displayName = 'XDSBanner';

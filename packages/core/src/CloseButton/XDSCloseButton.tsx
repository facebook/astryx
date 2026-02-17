/**
 * @file XDSCloseButton.tsx
 * @input Uses React forwardRef, XDSButton, XDSIcon
 * @output Exports XDSCloseButton component, XDSCloseButtonProps, XDSCloseButtonSize types
 * @position Core implementation; consumed by index.ts, tested by XDSCloseButton.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CloseButton/README.md (props table, features, implementation notes)
 * - /packages/core/src/CloseButton/XDSCloseButton.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/CloseButton/index.ts (exports if types change)
 * - /apps/storybook/stories/CloseButton.stories.tsx (storybook stories)
 */

import React, {forwardRef, useContext} from 'react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {XDSButton, type XDSButtonProps, type XDSButtonSize} from '../Button';
import {XDSIcon, type XDSIconType, type XDSIconSize} from '../Icon';
import {ThemeContext} from '../theme/ThemeContext';

// =============================================================================
// Types
// =============================================================================

export type XDSCloseButtonSize = XDSButtonSize;

// Map button sizes to icon sizes
const buttonSizeToIconSize: Record<XDSCloseButtonSize, XDSIconSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

// =============================================================================
// Module Augmentation - Register CloseButton config with ComponentStyles
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    closeButton?: {
      /** Custom icon component to use instead of the default XMarkIcon */
      icon?: XDSIconType;
    };
  }
}

export interface XDSCloseButtonProps {
  /**
   * The size of the close button.
   * @default 'md'
   */
  size?: XDSCloseButtonSize;
  /**
   * Accessible label for the button, also used as tooltip.
   * @default 'Close'
   */
  label?: string;
  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the button is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Click handler.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Async click action. Wrapped in React transition.
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void | Promise<void>;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A close button component with a configurable icon.
 *
 * The icon can be customized via the theme's `components.closeButton.icon` setting.
 * Defaults to the Heroicons XMarkIcon (outline).
 *
 * @example
 * ```tsx
 * <XDSCloseButton onClick={handleClose} />
 * <XDSCloseButton onClick={handleClose} label="Dismiss notification" />
 * ```
 */
export const XDSCloseButton = forwardRef<
  HTMLButtonElement,
  XDSCloseButtonProps
>(
  (
    {
      size = 'md',
      label = 'Close',
      isDisabled,
      onClick,
      onClickAction,
      isLoading,
      ...props
    },
    ref,
  ) => {
    // Get theme context for custom icon
    const themeContext = useContext(ThemeContext);
    const IconComponent =
      themeContext?.theme.components?.closeButton?.icon ?? XMarkIcon;

    const iconSize = buttonSizeToIconSize[size];

    return (
      <XDSButton
        ref={ref}
        type="button"
        variant="ghost"
        size={size}
        label={label}
        tooltip={label}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onClick={onClick}
        onClickAction={onClickAction}
        icon={<XDSIcon icon={IconComponent} size={iconSize} color="inherit" />}
      />
    );
  },
);

XDSCloseButton.displayName = 'XDSCloseButton';

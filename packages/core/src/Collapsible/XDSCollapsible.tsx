/**
 * @file XDSCollapsible.tsx
 * @input Uses React, StyleX, useXDSCollapsible hook, useXDSIcon, theme tokens
 * @output Exports XDSCollapsible component and XDSCollapsibleProps
 * @position Collapsible content primitive — trigger toggles visibility of children
 *
 * XDSCollapsible is a standalone primitive that makes any content collapsible.
 * It renders a trigger area (always visible) and a content area that toggles.
 * Handles state management, accessibility (aria-expanded), and chevron indicator.
 *
 * Works standalone or coordinated by XDSCollapsibleGroup via the `value` prop.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/index.ts (exports)
 * - /packages/core/src/Collapsible/README.md
 * - /apps/storybook/stories/Collapsible.stories.tsx
 */

'use client';

import {forwardRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {useXDSCollapsible} from './useXDSCollapsible';
import {useXDSIcon} from '../Icon/IconRegistry';

const styles = stylex.create({
  // Trigger button — full width, flex row, no browser button styling
  trigger: {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    fontFamily: typographyVars['--font-body'],
    fontSize: 16,
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    textAlign: 'start',
    paddingBlock: spacingVars['--spacing-1'],
  },
  // Chevron indicator
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 150ms ease',
    color: colorVars['--color-icon-secondary'],
  },
  chevronOpen: {
    transform: 'rotate(0deg)',
  },
  chevronClosed: {
    transform: 'rotate(-90deg)',
  },
  // Content area
  contentHidden: {
    display: 'none',
  },
  content: {
    paddingBlockStart: spacingVars['--spacing-1'],
  },
});

export interface XDSCollapsibleProps {
  /**
   * Content shown in the trigger area (always visible).
   * Rendered inside a button with aria-expanded and a chevron indicator.
   */
  trigger: ReactNode;

  /**
   * Content that collapses/expands when the trigger is clicked.
   */
  children?: ReactNode;

  /**
   * Default open state for uncontrolled usage.
   * @default true
   */
  defaultIsOpen?: boolean;

  /**
   * Controlled open state. When provided, the component is fully controlled.
   */
  isOpen?: boolean;

  /**
   * Callback when the open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Unique identifier for this collapsible within an XDSCollapsibleGroup.
   * Required when using inside a group for coordination.
   */
  value?: string;

  /**
   * Test ID for the collapsible element.
   */
  'data-testid'?: string;
}

/**
 * A primitive that makes any content collapsible.
 *
 * Renders a trigger area (always visible) with a chevron indicator,
 * and a content area that toggles visibility on click.
 * Handles its own state by default, or defers to XDSCollapsibleGroup
 * when a `value` prop is provided and a group is present.
 *
 * Use inside XDSCard for elevated collapsible sections.
 * Wrap multiple instances in XDSCollapsibleGroup for accordion behavior.
 *
 * @example
 * ```
 * <XDSCollapsible trigger="Details">
 *   <XDSText type="body">Collapsible content</XDSText>
 * </XDSCollapsible>
 *
 * <XDSCard>
 *   <XDSCollapsible trigger="Settings">
 *     <SettingsForm />
 *   </XDSCollapsible>
 * </XDSCard>
 *
 * <XDSCollapsibleGroup type="single" defaultValue="general">
 *   <XDSVStack gap="space2">
 *     <XDSCard>
 *       <XDSCollapsible trigger="General" value="general">
 *         <GeneralSettings />
 *       </XDSCollapsible>
 *     </XDSCard>
 *     <XDSCard>
 *       <XDSCollapsible trigger="Advanced" value="advanced">
 *         <AdvancedSettings />
 *       </XDSCollapsible>
 *     </XDSCard>
 *   </XDSVStack>
 * </XDSCollapsibleGroup>
 * ```
 */
export const XDSCollapsible = forwardRef<HTMLDivElement, XDSCollapsibleProps>(
  function XDSCollapsible(
    {
      trigger,
      children,
      defaultIsOpen,
      isOpen: controlledIsOpen,
      onOpenChange,
      value,
      ...props
    },
    ref,
  ) {
    // Build the config for the hook
    const collapsibleConfig =
      controlledIsOpen !== undefined
        ? {isOpen: controlledIsOpen, onOpenChange}
        : {defaultIsOpen: defaultIsOpen ?? true, onOpenChange};

    const {isOpen, toggle} = useXDSCollapsible({
      isCollapsible: collapsibleConfig,
      value,
    });

    const chevronIcon = useXDSIcon('chevronDown');

    return (
      <div ref={ref} {...props}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          {...stylex.props(styles.trigger)}>
          <span>{trigger}</span>
          <span
            {...stylex.props(
              styles.chevron,
              isOpen ? styles.chevronOpen : styles.chevronClosed,
            )}>
            {chevronIcon}
          </span>
        </button>
        <div
          {...(isOpen
            ? stylex.props(styles.content)
            : stylex.props(styles.content, styles.contentHidden))}>
          {children}
        </div>
      </div>
    );
  },
);

XDSCollapsible.displayName = 'XDSCollapsible';

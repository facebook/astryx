// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Collapsible.tsx
 * @input Uses React, StyleX, useCollapsible hook, CollapsibleGroupPresentationContext, getIcon, theme tokens
 * @output Exports Collapsible component and CollapsibleProps
 * @position Collapsible content primitive — trigger toggles visibility of children
 *
 * Collapsible is a standalone primitive that makes any content collapsible.
 * It renders a trigger area (always visible) and a content area that toggles.
 * Handles state management, accessibility (aria-expanded + aria-controls linking
 * the trigger to its content region), and chevron indicator.
 *
 * Works standalone or coordinated by CollapsibleGroup via the `value` prop.
 * When the surrounding CollapsibleGroup enables `dividers`, each Collapsible
 * draws its own row chrome (borderBlockStart suppressed on :first-child, plus
 * density padding) from CollapsibleGroupPresentationContext — StyleX has no
 * child selectors, so the group cannot draw it from outside. The presentation
 * context is reset around children so nested collapsibles stay chrome-free.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/index.ts (exports)
 * - /packages/core/src/Collapsible/Collapsible.doc.mjs
 * - /apps/storybook/stories/Collapsible.stories.tsx
 * - /packages/cli/templates/blocks/components/Collapsible/ (showcase blocks)
 */

import {use, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  typographyVars,
  fontWeightVars,
  spacingVars,
  typeScaleVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {useCollapsible} from './useCollapsible';
import {CollapsibleGroupPresentationContext} from './CollapsibleGroupContext';
import {getIcon} from '../Icon/globalIconRegistry';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  root: {
    width: '100%',
  },
  // Trigger button — full width, flex row, no browser button styling
  trigger: {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    textAlign: 'start',
    paddingBlock: 0,
    // `all: unset` above wipes the UA focus outline; restore a keyboard-only
    // focus ring using the standard token/offset (WCAG 2.4.7).
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  // Capsize: trim leading from text triggers
  triggerLabel: {
    textBoxEdge: 'cap alphabetic',
    textBoxTrim: 'trim-both',
  },
  // Chevron indicator
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    color: colorVars['--color-icon-secondary'],
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  chevronClosed: {
    transform: 'rotate(0deg)',
  },
  // Content area
  contentHidden: {
    display: 'none',
  },
  content: {
    paddingBlockStart: spacingVars['--spacing-1'],
  },
  // Group divider chrome — a hairline above every item except the first.
  // The group's wrapper (or 'all' mode) owns the outer edges.
  divided: {
    borderBlockStartWidth: {
      default: borderVars['--border-width'],
      ':first-child': '0',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
  },
});

// Density padding for divided/padded accordion rows. paddingBlock mapping
// follows Table's density scale (spacing-1/2/3); content only pads its end
// so text doesn't sit on the divider below (block-start stays spacing-1).
const densityStyles = stylex.create({
  triggerCompact: {paddingBlock: spacingVars['--spacing-1']},
  triggerBalanced: {paddingBlock: spacingVars['--spacing-2']},
  triggerSpacious: {paddingBlock: spacingVars['--spacing-3']},
  contentCompact: {paddingBlockEnd: spacingVars['--spacing-1']},
  contentBalanced: {paddingBlockEnd: spacingVars['--spacing-2']},
  contentSpacious: {paddingBlockEnd: spacingVars['--spacing-3']},
});

const triggerDensity = {
  compact: densityStyles.triggerCompact,
  balanced: densityStyles.triggerBalanced,
  spacious: densityStyles.triggerSpacious,
} as const;

const contentDensity = {
  compact: densityStyles.contentCompact,
  balanced: densityStyles.contentBalanced,
  spacious: densityStyles.contentSpacious,
} as const;

export interface CollapsibleProps extends BaseProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
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
   * Unique identifier for this collapsible within an CollapsibleGroup.
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
 * Handles its own state by default, or defers to CollapsibleGroup
 * when a `value` prop is provided and a group is present.
 *
 * Use inside Card for elevated collapsible sections.
 * Wrap multiple instances in CollapsibleGroup for accordion behavior.
 *
 * @example
 * ```
 * <Collapsible trigger="Details">
 *   <Text type="body">Collapsible content</Text>
 * </Collapsible>
 * <Card>
 *   <Collapsible trigger="Settings">
 *     <SettingsForm />
 *   </Collapsible>
 * </Card>
 * <CollapsibleGroup type="single" defaultValue="general">
 *   <VStack gap={2}>
 *     <Card>
 *       <Collapsible trigger="General" value="general">
 *         <GeneralSettings />
 *       </Collapsible>
 *     </Card>
 *     <Card>
 *       <Collapsible trigger="Advanced" value="advanced">
 *         <AdvancedSettings />
 *       </Collapsible>
 *     </Card>
 *   </VStack>
 * </CollapsibleGroup>
 * ```
 */
export function Collapsible({
  trigger,
  children,
  defaultIsOpen,
  isOpen: controlledIsOpen,
  onOpenChange,
  value,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CollapsibleProps) {
  // Build the config for the hook
  const collapsibleConfig =
    controlledIsOpen !== undefined
      ? {isOpen: controlledIsOpen, onOpenChange}
      : {defaultIsOpen: defaultIsOpen ?? true, onOpenChange};

  const {isOpen, toggle} = useCollapsible({
    isCollapsible: collapsibleConfig,
    value,
  });

  const presentation = use(CollapsibleGroupPresentationContext);
  const isDivided = presentation != null && presentation.dividers !== 'none';
  const density = presentation?.density ?? null;

  const chevronIcon = getIcon('chevronDown');

  // Links the trigger to the region it shows/hides so assistive tech can move
  // from the button to its controlled content (disclosure pattern).
  const contentId = useId();

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('collapsible', {
          dividers: isDivided ? presentation.dividers : undefined,
          density: density ?? undefined,
        }),
        stylex.props(styles.root, isDivided && styles.divided, xstyle),
        className,
        style,
      )}
      {...props}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        {...stylex.props(
          styles.trigger,
          density != null && triggerDensity[density],
        )}>
        <span {...stylex.props(styles.triggerLabel)}>{trigger}</span>
        <span
          {...stylex.props(
            styles.chevron,
            isOpen ? styles.chevronOpen : styles.chevronClosed,
          )}>
          {chevronIcon}
        </span>
      </button>
      <div
        id={contentId}
        {...stylex.props(
          styles.content,
          density != null && contentDensity[density],
          !isOpen && styles.contentHidden,
        )}>
        {presentation != null ? (
          <CollapsibleGroupPresentationContext value={null}>
            {children}
          </CollapsibleGroupPresentationContext>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

Collapsible.displayName = 'Collapsible';

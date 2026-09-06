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
 * When the surrounding CollapsibleGroup sets `hasDividers`, each Collapsible
 * draws its own row chrome (borderBlockStart suppressed on :first-child, plus
 * density padding) from CollapsibleGroupPresentationContext — StyleX has no
 * child selectors, so the group cannot draw it from outside. The presentation
 * context is reset around children so nested collapsibles stay chrome-free.
 *
 * Animation uses the same `grid-template-rows: 1fr → 0fr` technique as
 * SideNavItem — pure CSS, no JS timing, no hidden attributes, no rAF. The
 * inner wrapper stays clipped through the opening transition, then releases
 * the clip so focused descendants can paint their outlines outside it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/index.ts (exports)
 * - /packages/core/src/Collapsible/Collapsible.doc.mjs
 * - /apps/storybook/stories/Collapsible.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Collapsible/ (showcase blocks)
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
import {Icon} from '../Icon';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';

const releaseContentClip = stylex.keyframes({
  from: {overflow: 'hidden'},
  to: {overflow: 'visible'},
});

const styles = stylex.create({
  root: {
    width: '100%',
  },
  trigger: {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: {
      default: '24px',
      '@media (pointer: coarse)': spacingVars['--spacing-11'],
    },
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    textAlign: 'start',
    paddingBlock: 0,
  },
  triggerLabel: {
    textBoxEdge: 'cap alphabetic',
    textBoxTrim: 'trim-both',
    // Fill the row rather than hug the label. For a text trigger this changes
    // nothing — `space-between` already had it against the start edge and the
    // chevron against the end — but it is what lets a composed trigger put
    // something out at the far edge, next to the chevron, rather than trailing
    // the label with the free space stranded after it.
    //
    // Growing only. The flex floor stays at `auto`, so a label still cannot be
    // squeezed narrower than its own content and nothing that used to fit
    // starts overlapping the chevron.
    flexGrow: 1,
  },
  triggerDisabled: {
    cursor: 'default',
    opacity: 0.5,
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: typeScaleVars['--text-large-size'],
    height: typeScaleVars['--text-large-size'],
    fontSize: typeScaleVars['--text-large-size'],
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  chevronClosed: {
    transform: 'rotate(0deg)',
  },
  // Content track — animates via grid-template-rows, same as SideNavItem.
  // `1fr → 0fr` gives the browser a real interpolation distance without
  // measuring content height in JS.
  contentTrack: {
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: {
      default: `var(--_collapsible-open-duration, ${durationVars['--duration-medium']})`,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: `var(--_collapsible-open-ease, ${easeVars['--ease-standard']})`,
  },
  contentTrackClosed: {
    gridTemplateRows: '0fr',
    transitionDuration: {
      default: `var(--_collapsible-close-duration, ${durationVars['--duration-medium']})`,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: `var(--_collapsible-close-ease, ${easeVars['--ease-standard']})`,
  },
  // Inner clip wrapper — minHeight 0 lets the grid row shrink the content to
  // nothing. A step-end animation holds the clip through the opening motion,
  // then releases it so open descendants can paint focus outlines outside it.
  contentInner: {
    overflow: 'hidden',
    minHeight: 0,
  },
  contentInnerOpen: {
    overflow: 'visible',
    animationName: releaseContentClip,
    animationDuration: {
      default: `var(--_collapsible-open-duration, ${durationVars['--duration-medium']})`,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    animationTimingFunction: 'step-end',
  },
  // Body typography anchor — keeps revealed text at the system body scale.
  // Padding lives here, inside the clip, so a collapsed panel shows no gap.
  content: {
    paddingBlockStart: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: typeScaleVars['--text-body-weight'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
  },
  // Opacity fade runs in parallel with the grid-row transition.
  contentFade: {
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: {
      default: `var(--_collapsible-open-duration, ${durationVars['--duration-medium']})`,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: `var(--_collapsible-open-ease, ${easeVars['--ease-standard']})`,
  },
  contentFadeClosed: {
    opacity: 0,
    transitionDuration: {
      default: `var(--_collapsible-close-duration, ${durationVars['--duration-medium']})`,
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: `var(--_collapsible-close-ease, ${easeVars['--ease-standard']})`,
  },
  divided: {
    borderBlockStartWidth: {
      default: borderVars['--border-width'],
      ':first-child': '0',
    },
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-border'],
  },
});

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
   * Whether the collapsible is disabled. A disabled item can't be toggled —
   * its trigger is non-interactive and dimmed. Following the system-wide
   * disabled convention, the trigger uses `aria-disabled` (not the native
   * `disabled` attribute) and drops out of the tab order, staying perceivable
   * to assistive tech. The content stays in whatever open state it was;
   * disabling doesn't collapse an already-open item.
   * @default false
   */
  isDisabled?: boolean;

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
  isDisabled = false,
  onOpenChange,
  value,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CollapsibleProps) {
  const collapsibleConfig =
    controlledIsOpen !== undefined
      ? {isOpen: controlledIsOpen, onOpenChange}
      : {defaultIsOpen: defaultIsOpen ?? true, onOpenChange};

  const {isOpen, toggle} = useCollapsible({
    isCollapsible: collapsibleConfig,
    value,
  });

  const handleToggle = () => {
    if (isDisabled) {
      return;
    }
    toggle();
  };

  const presentation = use(CollapsibleGroupPresentationContext);
  const isDivided = presentation?.hasDividers ?? false;
  const density = presentation?.density ?? null;

  const contentId = useId();

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('collapsible', {
          density: density ?? undefined,
        }),
        stylex.props(styles.root, isDivided && styles.divided, xstyle),
        className,
        style,
      )}
      {...props}>
      <button
        type="button"
        onClick={handleToggle}
        aria-disabled={isDisabled || undefined}
        aria-expanded={isOpen}
        aria-controls={contentId}
        tabIndex={isDisabled ? -1 : undefined}
        {...mergeProps(
          themeProps('collapsible-trigger', {
            density: density ?? undefined,
          }),
          focusOutlineProps.focusVisible(
            styles.trigger,
            density != null && triggerDensity[density],
            isDisabled && styles.triggerDisabled,
          ),
        )}>
        <span {...stylex.props(styles.triggerLabel)}>{trigger}</span>
        <Icon
          icon="chevronDown"
          size="sm"
          color="secondary"
          xstyle={[
            styles.chevron,
            isOpen ? styles.chevronOpen : styles.chevronClosed,
          ]}
        />
      </button>
      <div
        id={contentId}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        {...stylex.props(
          styles.contentTrack,
          !isOpen && styles.contentTrackClosed,
        )}>
        <div
          {...stylex.props(
            styles.contentInner,
            isOpen && styles.contentInnerOpen,
          )}>
          <div
            {...mergeProps(
              themeProps('collapsible-content', {
                density: density ?? undefined,
              }),
              stylex.props(
                styles.content,
                styles.contentFade,
                !isOpen && styles.contentFadeClosed,
                density != null && contentDensity[density],
              ),
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
      </div>
    </div>
  );
}

Collapsible.displayName = 'Collapsible';

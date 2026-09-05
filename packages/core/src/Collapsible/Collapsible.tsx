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
import type {CollapsibleChevronPlacement} from './CollapsibleGroupContext';
import {Icon} from '../Icon';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';

const styles = stylex.create({
  root: {
    width: '100%',
  },
  // Trigger button — full width, flex row, no browser button styling.
  // Anchors heading-adjacent typography (body family, large size, semibold)
  // so the label reads as a section header regardless of where the
  // Collapsible is placed. External themes retarget it independently from the
  // content via the `astryx-collapsible-trigger` target — e.g. a heading font
  // on the trigger while the content stays on the body font.
  trigger: {
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    // `all: unset` above wipes the UA focus outline; restore a keyboard-only
    // focus ring using the standard token/offset (WCAG 2.4.7).
  },
  // Capsize: trim leading from text triggers
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
  // With the chevron trailing, the trigger's `space-between` does the right
  // thing on its own: label left, arrow right. With it leading there is no
  // third child to absorb the free space, so the same rule would push the
  // label to the opposite edge and leave a gap after the arrow. Growing the
  // label closes that gap, and it also gives a trigger that spreads its own
  // contents (`hAlign="between"` and the like) the full row to spread across.
  triggerLabelFill: {
    flexGrow: 1,
  },
  // Disabled trigger — non-interactive, dimmed. Native `disabled` on the
  // button blocks click + keyboard activation; these styles restore the
  // visual affordance that `all: unset` wipes.
  triggerDisabled: {
    cursor: 'default',
    opacity: 0.5,
  },
  // Chevron indicator
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // The chevron is sized off the trigger's own type size (--text-large-size,
    // 17px), which sits between Icon's `sm` (16px) and `md` (20px) boxes.
    // Pinning the box to the token keeps the glyph exactly the size it was
    // when it was a bare 1em SVG inheriting the trigger's font-size, and keeps
    // it tracking the trigger if a theme retunes that step.
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
  // Leading chevron. `space-between` puts nothing between the arrow and the
  // label — they are adjacent flex children — so the gap is the chevron's own.
  chevronStart: {
    marginInlineEnd: spacingVars['--spacing-2'],
  },
  // A leading arrow rotates a quarter turn rather than a half: it points into
  // the row when closed and turns down when open, which is the disclosure
  // convention TreeList already uses. RTL mirrors it so "into the row" still
  // means towards the content, and the mirror is spelled out per state because
  // a bare `transform` would otherwise overwrite the rotation.
  chevronStartOpen: {
    transform: {
      default: 'rotate(90deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(90deg)',
    },
  },
  chevronStartClosed: {
    transform: {
      default: 'rotate(0deg)',
      ':is([dir="rtl"] *)': 'scaleX(-1) rotate(0deg)',
    },
  },
  // Content area
  contentHidden: {
    display: 'none',
  },
  // Anchors body typography so revealed text renders at the system's body
  // scale (family/size/weight/leading) instead of inheriting from wherever
  // the Collapsible is placed. External themes override via the
  // `astryx-collapsible-content` target, independently from the trigger.
  content: {
    paddingBlockStart: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    fontWeight: typeScaleVars['--text-body-weight'],
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
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
   * Which side of the trigger the chevron sits on, or `none` to draw no
   * chevron at all.
   *
   * - `end` (default): a trailing indicator, pushed against the trigger's far
   *   edge. Reads as "this row has more", and leaves the start of the row for
   *   the label.
   * - `start`: a leading disclosure arrow, ahead of the label. Reads as "this
   *   row opens", which is the tree and file-browser convention, and is what
   *   to use when the labels form a scannable column that the arrows sit in
   *   front of. The glyph changes with the side: a leading arrow points into
   *   the row when closed and turns down when open, matching TreeList.
   * - `none`: no chevron, and the trigger content is the whole row. For a
   *   trigger that carries its own affordance — an icon that becomes an arrow
   *   under the pointer, a switch, a caret drawn into a graphic. It does not
   *   change the semantics: the trigger is still a button with aria-expanded,
   *   so the state stays legible to assistive tech. It does mean nothing on
   *   screen says "this opens" unless the trigger says it, so supply
   *   something that does.
   *
   * Inside a CollapsibleGroup this defaults to the group's `chevronPlacement`.
   *
   * @default 'end'
   */
  chevronPlacement?: CollapsibleChevronPlacement;

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
  chevronPlacement,
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

  // Activation is blocked by this guard rather than the native `disabled`
  // attribute, so the trigger keeps `aria-disabled` semantics and stays
  // discoverable. A native `disabled` button would silently swallow events
  // (e.g. a wrapping tooltip's hover) — the system-wide disabled convention.
  const handleToggle = () => {
    if (isDisabled) {
      return;
    }
    toggle();
  };

  const presentation = use(CollapsibleGroupPresentationContext);
  const isDivided = presentation?.hasDividers ?? false;
  const density = presentation?.density ?? null;
  // The item wins over the group so a single row can differ, but the group is
  // the level this is normally set at — mixed sides in one list read as a bug.
  const placement = chevronPlacement ?? presentation?.chevronPlacement ?? 'end';
  const isChevronAtStart = placement === 'start';
  const hasChevron = placement !== 'none';

  // Links the trigger to the region it shows/hides so assistive tech can move
  // from the button to its controlled content (disclosure pattern).
  const contentId = useId();

  const chevron = (
    <Icon
      // The glyph is part of the placement, not a separate choice: a trailing
      // indicator points down and flips up, a leading one points into the row
      // and turns down. Rotating `chevronDown` by a quarter turn would leave
      // the closed state pointing the wrong way.
      icon={isChevronAtStart ? 'chevronRight' : 'chevronDown'}
      // Nearest size to the trigger's 17px type step; `chevron` re-pins the
      // exact box (see the style) so the glyph does not resize.
      size="sm"
      // Was `--color-icon-secondary` on the old wrapper span; `secondary`
      // is the same token, expressed as an Icon color.
      color="secondary"
      xstyle={[
        styles.chevron,
        isChevronAtStart && styles.chevronStart,
        isChevronAtStart
          ? isOpen
            ? styles.chevronStartOpen
            : styles.chevronStartClosed
          : isOpen
            ? styles.chevronOpen
            : styles.chevronClosed,
      ]}
    />
  );

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
        // A disabled trigger drops out of the tab order so it isn't a silently
        // dead tab stop; activation stays blocked by the handleToggle guard,
        // and aria-disabled keeps the state perceivable to assistive tech —
        // the system-wide disabled convention (never native `disabled`, which
        // would swallow events like a wrapping tooltip's hover).
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
        {hasChevron && isChevronAtStart && chevron}
        {/* The label fills the row whenever nothing trails it — with a leading
            chevron because the label is what follows it, and with no chevron
            at all because there is nothing else in the button. Leaving it
            shrink-wrapped would strand a trigger that aligns its own content
            against the far edge. */}
        <span
          {...stylex.props(
            styles.triggerLabel,
            (isChevronAtStart || !hasChevron) && styles.triggerLabelFill,
          )}>
          {trigger}
        </span>
        {hasChevron && !isChevronAtStart && chevron}
      </button>
      <div
        id={contentId}
        {...mergeProps(
          themeProps('collapsible-content', {
            density: density ?? undefined,
          }),
          stylex.props(
            styles.content,
            density != null && contentDensity[density],
            !isOpen && styles.contentHidden,
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
  );
}

Collapsible.displayName = 'Collapsible';

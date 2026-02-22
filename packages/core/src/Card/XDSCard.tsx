/**
 * @file XDSCard.tsx
 * @input Uses container utility, StyleX, ThemeContext, CollapsibleGroupContext
 * @output Exports XDSCard component, XDSCardProps, CollapsibleConfig
 * @position Core card container component with optional collapsible behavior
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Card/README.md (props table, features)
 * - /packages/core/src/Card/index.ts (exports if types change)
 * - /apps/storybook/stories/Card.stories.tsx (storybook stories)
 */

'use client';

import {
  forwardRef,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  elevationVars,
  spacingVars,
  typographyVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles as ThemeStyleXStyles} from '../theme/types';
import {container} from '../Layout/container.stylex';
import type {SizeValue} from '../utils/types';
import {CollapsibleGroupContext} from '../CollapsibleGroup/XDSCollapsibleGroupContext';

// =============================================================================
// Module Augmentation - Register XDSCard's themeable properties
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    card?: {
      /** Outer container styles (background, border, shadow, border-radius) */
      container?: ThemeStyleXStyles;
      /** Inner content styles (padding) */
      content?: ThemeStyleXStyles;
    };
  }
}

const styles = stylex.create({
  // Outer wrapper: visual styling with clip for border-radius
  cardOuter: {
    backgroundColor: colorVars['--color-card'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-base'],
    // Clip content to border-radius so nested containers don't peek out corners
    overflow: 'clip',
    // Use inherited --card-border-color if set by ancestor, otherwise transparent
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--card-border-color, transparent)',
  },
  // Inner wrapper: container padding and overflow handling
  cardInner: {
    height: '100%',
    // Cards have surface background, so nested cards need visible borders
    '--card-border-color': colorVars['--color-divider'],
  },
  // Only enable scrolling when card has fixed height
  scrollable: {
    overflow: 'auto',
  },
  // Full bleed: removes all internal padding
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
  // Header trigger for collapsible cards
  headerTrigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: 16,
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
    textAlign: 'start',
  },
  // Static header (non-collapsible card with title)
  headerStatic: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: typographyVars['--font-body'],
    fontSize: 16,
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  // Header area wrapper with padding
  headerArea: {
    paddingBlockEnd: spacingVars['--spacing-3'],
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
  // Hidden content when collapsed
  contentHidden: {
    display: 'none',
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (
    width: SizeValue | null,
    height: SizeValue | null,
    maxWidth: SizeValue | null,
    minHeight: SizeValue | null,
  ) => ({
    width,
    height,
    maxWidth,
    minHeight,
  }),
});

export type {SizeValue} from '../utils/types';

/**
 * Configuration for collapsible behavior.
 */
export type CollapsibleConfig = {
  /** Whether the card starts open. @default true */
  initialIsOpen?: boolean;
  /** Controlled open state. */
  isOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
};

export interface XDSCardProps {
  /**
   * Title displayed in the card header.
   * When `isCollapsible` is set, the title becomes the click trigger.
   */
  title?: ReactNode;

  /**
   * Width of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  width?: SizeValue;

  /**
   * Height of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: SizeValue;

  /**
   * Maximum width of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  minHeight?: SizeValue;

  /**
   * Content to render inside the card.
   * When `isCollapsible` is set, this content collapses/expands.
   */
  children?: ReactNode;

  /**
   * Removes internal padding, allowing content to touch the edges.
   * @default false
   */
  isFullBleed?: boolean;

  /**
   * Makes the card collapsible. Requires `title` to be set.
   *
   * - `true` — self-managed, starts open
   * - `{ initialIsOpen: false }` — self-managed, starts collapsed
   * - `{ isOpen, onOpenChange }` — controlled externally
   *
   * When inside an XDSCollapsibleGroup with a `value` prop, defers to the group.
   *
   * @example
   * ```tsx
   * <XDSCard title="Details" isCollapsible>
   *   <p>Collapsible content</p>
   * </XDSCard>
   * ```
   */
  isCollapsible?: boolean | CollapsibleConfig;

  /**
   * Unique identifier for this card within an XDSCollapsibleGroup.
   * Required when using the card inside a collapsible group for coordination.
   */
  value?: string;

  /**
   * Test ID for the card element.
   */
  'data-testid'?: string;
}

/**
 * Chevron icon for collapsible indicator.
 * Uses the same SVG conventions as defaultIcons.
 */
function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * A card container with elevation and themed styling.
 *
 * Applies card-specific appearance (background, shadow, border-radius)
 * and sets CSS variables for child layout components.
 *
 * Supports collapsible behavior via the `isCollapsible` prop. When set,
 * the card's `title` becomes a click trigger and the `children` content
 * collapses/expands. Works standalone or coordinated by XDSCollapsibleGroup.
 *
 * @compositionHint Use as a top-level container for elevated content.
 * Pair with XDSLayout for structured header/content/footer layouts.
 * For collapsible cards, set `title` and `isCollapsible`.
 * For coordinated collapsible behavior, wrap multiple cards in XDSCollapsibleGroup.
 *
 * @example
 * ```tsx
 * // Basic card
 * <XDSCard width={400} height={300}>
 *   <XDSLayout
 *     header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Content</XDSLayoutContent>}
 *     footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
 *   />
 * </XDSCard>
 *
 * // Collapsible card
 * <XDSCard title="Details" isCollapsible>
 *   <p>This content can be collapsed</p>
 * </XDSCard>
 *
 * // Collapsible group (accordion behavior)
 * <XDSCollapsibleGroup type="single" defaultValue="general">
 *   <XDSCard title="General" value="general" isCollapsible>
 *     <GeneralSettings />
 *   </XDSCard>
 *   <XDSCard title="Advanced" value="advanced" isCollapsible>
 *     <AdvancedSettings />
 *   </XDSCard>
 * </XDSCollapsibleGroup>
 * ```
 */
export const XDSCard = forwardRef<HTMLDivElement, XDSCardProps>(
  function XDSCard(
    {
      title,
      width,
      height,
      maxWidth,
      minHeight,
      children,
      isFullBleed = false,
      isCollapsible,
      value,
      ...props
    },
    ref,
  ) {
    // Get theme context for component-level overrides
    const themeContext = useContext(ThemeContext);
    const containerOverride = themeContext?.theme.components?.card?.container;
    const contentOverride = themeContext?.theme.components?.card?.content;

    // Collapsible group context
    const collapsibleGroup = useContext(CollapsibleGroupContext);
    const isControlledByGroup = collapsibleGroup != null && value != null;

    // Parse collapsible config
    const collapsibleConfig: CollapsibleConfig | null =
      isCollapsible === true ? {} : isCollapsible ? isCollapsible : null;

    const isCollapsibleEnabled = collapsibleConfig != null;

    // Internal state for uncontrolled collapsible
    const [internalIsOpen, setInternalIsOpen] = useState(() => {
      if (isControlledByGroup) return true; // group manages this
      if (collapsibleConfig?.isOpen !== undefined)
        return collapsibleConfig.isOpen;
      return collapsibleConfig?.initialIsOpen ?? true;
    });

    // Determine open state
    let isOpen: boolean;
    if (isControlledByGroup) {
      isOpen = collapsibleGroup.isOpen(value!);
    } else if (collapsibleConfig?.isOpen !== undefined) {
      isOpen = collapsibleConfig.isOpen;
    } else {
      isOpen = internalIsOpen;
    }

    // Toggle handler
    const handleToggle = useCallback(() => {
      if (isControlledByGroup) {
        collapsibleGroup!.toggle(value!);
      } else if (collapsibleConfig?.onOpenChange) {
        collapsibleConfig.onOpenChange(!isOpen);
      } else {
        setInternalIsOpen(prev => !prev);
      }
    }, [
      isControlledByGroup,
      collapsibleGroup,
      value,
      collapsibleConfig,
      isOpen,
    ]);

    // Only enable scrolling when card has a fixed height (not null/undefined and not "auto")
    const hasFixedHeight = height != null && height !== 'auto';

    return (
      <div
        ref={ref}
        {...stylex.props(
          styles.cardOuter,
          containerOverride,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
            minHeight ?? null,
          ),
        )}
        {...props}>
        <div
          {...stylex.props(
            styles.cardInner,
            hasFixedHeight && styles.scrollable,
            ...container({
              paddingInnerX: 'spacing4',
              paddingInnerY: 'spacing4',
              paddingOuterX: 'spacing4',
              paddingOuterY: 'spacing4',
            }),
            isFullBleed && styles.fullBleed,
            contentOverride,
          )}>
          {title != null && (
            <div {...stylex.props(styles.headerArea)}>
              {isCollapsibleEnabled ? (
                <button
                  type="button"
                  onClick={handleToggle}
                  aria-expanded={isOpen}
                  {...stylex.props(styles.headerTrigger)}>
                  <span>{title}</span>
                  <span
                    {...stylex.props(
                      styles.chevron,
                      isOpen ? styles.chevronOpen : styles.chevronClosed,
                    )}>
                    <ChevronIcon />
                  </span>
                </button>
              ) : (
                <div {...stylex.props(styles.headerStatic)}>{title}</div>
              )}
            </div>
          )}
          {isCollapsibleEnabled ? (
            <div {...(isOpen ? {} : stylex.props(styles.contentHidden))}>
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  },
);

XDSCard.displayName = 'XDSCard';

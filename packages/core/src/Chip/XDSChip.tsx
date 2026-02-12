/**
 * @file XDSChip.tsx
 * @input Uses React forwardRef, HTMLAttributes
 * @output Exports XDSChip component, XDSChipProps, XDSChipVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chip/README.md (props table, features, implementation notes)
 * - /packages/core/src/Chip/XDSChip.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Chip/index.ts (exports if types change)
 * - /apps/storybook/stories/Chip.stories.tsx (storybook stories)
 */

import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-rounded'],
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    whiteSpace: 'nowrap',
    border: `1px solid ${colorVars['--color-divider']}`,
    cursor: 'default',
    userSelect: 'none',
  },
  dismissButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-normal'],
  },
});

const variants = stylex.create({
  neutral: {
    backgroundColor: colorVars['--color-wash'],
    color: colorVars['--color-text-primary'],
  },
  info: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
    color: colorVars['--color-accent-text'],
    borderColor: colorVars['--color-accent'],
  },
  success: {
    backgroundColor: colorVars['--color-positive-deemphasized'],
    color: colorVars['--color-positive'],
    borderColor: colorVars['--color-positive'],
  },
  error: {
    backgroundColor: colorVars['--color-negative-deemphasized'],
    color: colorVars['--color-negative'],
    borderColor: colorVars['--color-negative'],
  },
});

export type XDSChipVariant = keyof typeof variants;

export interface XDSChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** The visual style variant of the chip. */
  variant?: XDSChipVariant;
  /** The content to display in the chip. */
  children: ReactNode;
  /** Optional icon to display before the label. */
  icon?: ReactNode;
  /** Callback when the dismiss button is clicked. Shows dismiss button when provided. */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. */
  dismissLabel?: string;
}

/**
 * A chip component for displaying tags, filters, or selections.
 * Optionally dismissible via the onDismiss callback.
 *
 * @example
 * ```tsx
 * <XDSChip>React</XDSChip>
 * <XDSChip variant="info" onDismiss={() => {}}>Filter</XDSChip>
 * ```
 */
export const XDSChip = forwardRef<HTMLSpanElement, XDSChipProps>(
  (
    {
      variant = 'neutral',
      children,
      icon,
      onDismiss,
      dismissLabel = 'Remove',
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        {...stylex.props(styles.base, variants[variant])}
        {...props}>
        {icon}
        {children}
        {onDismiss != null && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={dismissLabel}
            {...stylex.props(styles.dismissButton)}>
            &#x2715;
          </button>
        )}
      </span>
    );
  },
);

XDSChip.displayName = 'XDSChip';

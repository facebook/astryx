/**
 * @file XDSRadioList.tsx
 * @input Uses React useId, createContext, ReactNode, XDSFieldLabel, XDSFieldStatus, XDSInputStatus
 * @output Exports XDSRadioList component, XDSRadioListProps, RadioListContext
 * @position Core implementation; consumed by index.ts, tested by XDSRadioList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/XDSRadioList.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/RadioList/index.ts (exports if types change)
 * - /apps/storybook/stories/RadioList.stories.tsx (storybook stories)
 */

import {createContext, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {XDSFieldStatus} from '../Field/XDSFieldStatus';
import type {XDSInputStatus} from '../Field/types';

export interface RadioListContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isRequired: boolean;
  status?: XDSInputStatus;
}

export const RadioListContext = createContext<RadioListContextValue | null>(
  null,
);

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  labelHidden: {
    borderStyle: 'none',
    clip: 'rect(0, 0, 0, 0)',
    height: 1,
    left: 0,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: 1,
  },
  optionalRequired: {
    fontWeight: fontWeightVars['--font-weight-normal'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  description: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  radiogroup: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
  },
});

export interface XDSRadioListProps {
  /**
   * Label text for the radio group (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * The currently selected value.
   */
  value: string;
  /**
   * Callback fired when the selected value changes.
   */
  onChange: (value: string) => void;
  /**
   * Layout direction of the radio items.
   * @default "vertical"
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Whether all radio items are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the radio group is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Status indicator for the radio group.
   * When set with a message, displays a colored message box below the group.
   */
  status?: XDSInputStatus;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Additional styles for the outer container.
   */
  xstyle?: StyleXStyles;
  /**
   * Test ID for the outer container.
   */
  'data-testid'?: string;
  /**
   * Radio list items to render.
   */
  children: ReactNode;
}

/**
 * A radio group component for single-value selection.
 *
 * @example
 * ```tsx
 * <XDSRadioList
 *   label="Notification preference"
 *   value={selected}
 *   onChange={setSelected}
 * >
 *   <XDSRadioListItem label="Email" value="email" />
 *   <XDSRadioListItem label="SMS" value="sms" />
 *   <XDSRadioListItem label="Push" value="push" />
 * </XDSRadioList>
 * ```
 */
export function XDSRadioList({
  label,
  isLabelHidden = false,
  description,
  value,
  onChange,
  orientation = 'vertical',
  isDisabled = false,
  isRequired = false,
  isOptional = false,
  status,
  labelTooltip: _labelTooltip,
  xstyle,
  'data-testid': dataTestId,
  children,
}: XDSRadioListProps) {
  const name = useId();
  const labelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;

  const contextValue: RadioListContextValue = {
    name,
    value,
    onChange,
    isDisabled,
    isRequired,
    status,
  };

  return (
    <div data-testid={dataTestId} {...stylex.props(styles.container, xstyle)}>
      <span
        id={labelID}
        {...stylex.props(
          styles.label,
          isDisabled && styles.labelDisabled,
          isLabelHidden && styles.labelHidden,
        )}>
        {label}
        {statusText && (
          <span {...stylex.props(styles.optionalRequired)}>
            {' '}
            ∙ {statusText}
          </span>
        )}
      </span>
      {description && (
        <span id={descriptionID} {...stylex.props(styles.description)}>
          {description}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={labelID}
        aria-describedby={
          [
            description ? descriptionID : null,
            status?.message ? statusMessageID : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-required={isRequired || undefined}
        {...stylex.props(
          styles.radiogroup,
          orientation === 'vertical' ? styles.vertical : styles.horizontal,
        )}>
        <RadioListContext.Provider value={contextValue}>
          {children}
        </RadioListContext.Provider>
      </div>
      {status?.message && (
        <XDSFieldStatus
          type={status.type}
          message={status.message}
          id={statusMessageID}
          variant="detached"
        />
      )}
    </div>
  );
}

XDSRadioList.displayName = 'XDSRadioList';

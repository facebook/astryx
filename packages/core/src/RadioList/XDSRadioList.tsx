/**
 * @file XDSRadioList.tsx
 * @input Uses React useId, createContext, ReactNode, XDSField, XDSInputStatus
 * @output Exports XDSRadioList component, XDSRadioListProps, RadioListContext
 * @position Core implementation; consumed by index.ts, tested by XDSRadioList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/README.md
 * - /packages/core/src/RadioList/XDSRadioList.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioList.stories.tsx
 */

import {createContext, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {XDSField} from '../Field/XDSField';
import type {XDSInputStatus} from '../Field/types';

/**
 * Size of the radio controls, matching CheckboxInput sizes.
 */
export type XDSRadioListSize = 'sm' | 'md';

export interface RadioListContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isRequired: boolean;
  size: XDSRadioListSize;
  status?: XDSInputStatus;
}

export const RadioListContext = createContext<RadioListContextValue | null>(
  null,
);

const styles = stylex.create({
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
   * The size of the radio controls.
   * - 'sm': Compact size (18px radio, 20px wrapper)
   * - 'md': Default size (22px radio, 24px wrapper)
   * @default 'md'
   */
  size?: XDSRadioListSize;
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
  size = 'md',
  status,
  labelTooltip,
  xstyle,
  'data-testid': dataTestId,
  children,
}: XDSRadioListProps) {
  const name = useId();
  const inputID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const contextValue: RadioListContextValue = {
    name,
    value,
    onChange,
    isDisabled,
    isRequired,
    size,
    status,
  };

  return (
    <XDSField
      data-testid={dataTestId}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={inputID}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}
      statusVariant="detached"
      {...stylex.props(xstyle)}>
      <div
        role="radiogroup"
        aria-label={label}
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
    </XDSField>
  );
}

XDSRadioList.displayName = 'XDSRadioList';

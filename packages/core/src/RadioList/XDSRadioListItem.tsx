/**
 * @file XDSRadioListItem.tsx
 * @input Uses React useContext, useId, RadioListContext
 * @output Exports XDSRadioListItem component, XDSRadioListItemProps
 * @position Core implementation; consumed by index.ts, tested by XDSRadioList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/XDSRadioList.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/RadioList/index.ts (exports if types change)
 * - /apps/storybook/stories/RadioList.stories.tsx (storybook stories)
 */

import {useContext, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  transitionVars,
  typographyVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {RadioListContext} from './XDSRadioList';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  radioWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 20,
    height: 20,
  },
  input: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
    width: 20,
    height: 20,
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: '50%',
    transitionProperty: 'background-color, border-color',
    transitionDuration: transitionVars['--transition-fast'],
    boxSizing: 'border-box',
  },
  radioUnchecked: {
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      [stylex.when.ancestor(':hover')]:
        `color-mix(in srgb, ${colorVars['--color-divider-emphasized']}, ${colorVars['--color-hover-tint']} 20%)`,
    },
    backgroundColor: {
      default: colorVars['--color-surface'],
      [stylex.when.ancestor(':hover')]:
        `color-mix(in srgb, ${colorVars['--color-surface']}, ${colorVars['--color-hover-tint']} 5%)`,
    },
  },
  radioChecked: {
    borderColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover')]:
        `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
    },
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover')]:
        `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
    },
  },
  radioFocused: {
    outline: `2px solid ${colorVars['--color-focus-outline']}`,
    outlineOffset: 2,
  },
  radioDisabled: {
    opacity: 0.5,
    borderColor: colorVars['--color-divider'],
  },
  radioDisabledUnchecked: {
    backgroundColor: colorVars['--color-deemphasized'],
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-icon-on-media'],
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    marginTop: 1,
  },
  label: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
  },
  description: {
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  startContent: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  endContent: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginInlineStart: 'auto',
  },
});

export interface XDSRadioListItemProps {
  /**
   * Label text for the radio item.
   */
  label: string;
  /**
   * Value of this radio item.
   */
  value: string;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Whether this individual radio item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Content to render before the radio circle.
   */
  startContent?: ReactNode;
  /**
   * Content to render after the label.
   */
  endContent?: ReactNode;
  /**
   * Test ID for the radio item container.
   */
  'data-testid'?: string;
}

/**
 * An individual radio item within an XDSRadioList.
 *
 * @example
 * ```tsx
 * <XDSRadioListItem label="Email" value="email" />
 * <XDSRadioListItem
 *   label="SMS"
 *   value="sms"
 *   description="Standard messaging rates apply"
 * />
 * ```
 */
export function XDSRadioListItem({
  label,
  value,
  description,
  isDisabled: isItemDisabled = false,
  startContent,
  endContent,
  'data-testid': dataTestId,
}: XDSRadioListItemProps) {
  const context = useContext(RadioListContext);
  if (!context) {
    throw new Error('XDSRadioListItem must be used within an XDSRadioList');
  }

  const id = useId();
  const descriptionID = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;

  return (
    <div
      data-testid={dataTestId}
      {...stylex.props(
        styles.container,
        !isDisabled && stylex.defaultMarker(),
      )}>
      {startContent && (
        <div {...stylex.props(styles.startContent)}>{startContent}</div>
      )}
      <div {...stylex.props(styles.radioWrapper)}>
        <input
          id={id}
          type="radio"
          name={context.name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          required={context.isRequired}
          onChange={() => context.onChange(value)}
          aria-describedby={description ? descriptionID : undefined}
          {...stylex.props(styles.input, isDisabled && styles.inputDisabled)}
        />
        <div
          aria-hidden="true"
          {...stylex.props(
            styles.radio,
            isChecked ? styles.radioChecked : styles.radioUnchecked,
            isDisabled && styles.radioDisabled,
            isDisabled && !isChecked && styles.radioDisabledUnchecked,
          )}>
          {isChecked && <div {...stylex.props(styles.innerDot)} />}
        </div>
      </div>
      <div {...stylex.props(styles.labelWrapper)}>
        <label
          htmlFor={id}
          {...stylex.props(styles.label, isDisabled && styles.labelDisabled)}>
          {label}
        </label>
        {description && (
          <span id={descriptionID} {...stylex.props(styles.description)}>
            {description}
          </span>
        )}
      </div>
      {endContent && (
        <div {...stylex.props(styles.endContent)}>{endContent}</div>
      )}
    </div>
  );
}

XDSRadioListItem.displayName = 'XDSRadioListItem';

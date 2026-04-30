'use client';

/**
 * @file XDSRadioListItem.tsx
 * @input Uses React useContext, useId, XDSRadioListContext
 * @output Exports XDSRadioListItem component, XDSRadioListItemProps
 * @position Core implementation; consumed by index.ts, tested by XDSRadioList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/RadioList.doc.mjs
 * - /packages/core/src/RadioList/XDSRadioList.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioList.stories.tsx
 * - /packages/cli/templates/blocks/components/RadioList/ (showcase blocks)
 */

import {useContext, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  durationVars,
  easeVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {XDSRadioListContext} from './XDSRadioList';
import {xdsClassName, mergeProps} from '../utils';
import {radioScope} from './radio.markers.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  radioWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: '50%',
    transitionProperty: 'background-color, border-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    boxSizing: 'border-box',
  },
  radioUnchecked: {
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-border-emphasized']}, ${colorVars['--color-tint-hover']} 20%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-background-surface']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  radioChecked: {
    borderColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  radioWrapperFocus: {
    outline: {
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
    borderRadius: '50%',
  },
  radioDisabled: {
    opacity: 0.5,
    borderColor: colorVars['--color-border'],
  },
  radioDisabledUnchecked: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  innerDot: {
    borderRadius: '50%',
    backgroundColor: colorVars['--color-on-accent'],
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  label: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
  },
  description: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
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

// Size styles matching CheckboxInput dimensions
const wrapperSizeStyles = stylex.create({
  sm: {
    width: 20,
    height: 20,
  },
  md: {
    width: 24,
    height: 24,
  },
});

const radioSizeStyles = stylex.create({
  sm: {
    width: 18,
    height: 18,
  },
  md: {
    width: 22,
    height: 22,
  },
});

const dotSizeStyles = stylex.create({
  sm: {
    width: 8,
    height: 8,
  },
  md: {
    width: 10,
    height: 10,
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
 * ```
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
  const context = useContext(XDSRadioListContext);
  if (!context) {
    throw new Error('XDSRadioListItem must be used within an XDSRadioList');
  }

  const id = useId();
  const descriptionID = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;
  const size = context.size;

  return (
    <div
      data-testid={dataTestId}
      {...mergeProps(
        xdsClassName('radio-list-item'),
        stylex.props(styles.container, !isDisabled && radioScope),
      )}>
      <div
        {...stylex.props(
          styles.radioWrapper,
          wrapperSizeStyles[size],
          !isDisabled && styles.radioWrapperFocus,
        )}>
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
          {...stylex.props(
            styles.input,
            wrapperSizeStyles[size],
            isDisabled && styles.inputDisabled,
          )}
        />
        <div
          aria-hidden="true"
          {...mergeProps(
            xdsClassName('radio', {
              size,
              checked: isChecked ? 'checked' : null,
              disabled: isDisabled ? 'disabled' : null,
            }),
            stylex.props(
              styles.radio,
              radioSizeStyles[size],
              isChecked ? styles.radioChecked : styles.radioUnchecked,
              isDisabled && styles.radioDisabled,
              isDisabled && !isChecked && styles.radioDisabledUnchecked,
            ),
          )}>
          {isChecked && (
            <div
              {...mergeProps(
                xdsClassName('radio-dot', {size}),
                stylex.props(styles.innerDot, dotSizeStyles[size]),
              )}
            />
          )}
        </div>
      </div>
      {startContent != null && (
        <div {...stylex.props(styles.startContent)}>{startContent}</div>
      )}
      <div {...stylex.props(styles.labelWrapper)}>
        <label
          htmlFor={id}
          {...stylex.props(styles.label, isDisabled && styles.labelDisabled)}>
          {label}
        </label>
        {description != null && (
          <span id={descriptionID} {...stylex.props(styles.description)}>
            {description}
          </span>
        )}
      </div>
      {endContent != null && (
        <div {...stylex.props(styles.endContent)}>{endContent}</div>
      )}
    </div>
  );
}

XDSRadioListItem.displayName = 'XDSRadioListItem';

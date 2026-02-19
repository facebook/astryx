/**
 * @file XDSTextArea.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, ClipboardEvent, XDSField, XDSIcon
 * @output Exports XDSTextArea component, XDSTextAreaProps, XDSTextAreaStatus, XDSTextAreaStatusType
 * @position Core implementation; consumed by index.ts, tested by XDSTextArea.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TextArea/README.md (props table, features, implementation notes)
 * - /packages/core/src/TextArea/XDSTextArea.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/TextArea/index.ts (exports if types change)
 * - /apps/storybook/stories/TextArea.stories.tsx (storybook stories)
 */

import {forwardRef, useId, type ChangeEvent, type ClipboardEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSField} from '../Field';
import {XDSIcon, type XDSIconType} from '../Icon';

const styles = stylex.create({
  wrapper: {
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-divider-emphasized'],
      ':hover': colorVars['--color-divider-high-contrast'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    transitionProperty: 'border-color, outline',
    transitionDuration: transitionVars['--transition-fast'],
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '1px',
    },
  },
  wrapperDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-divider-emphasized'],
  },
  textarea: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-placeholder'],
    },
    resize: 'vertical',
    minHeight: '80px',
  },
  textareaDisabled: {
    cursor: 'not-allowed',
  },
  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    color: colorVars['--color-text-secondary'],
  },
  counterError: {
    color: colorVars['--color-negative'],
  },
});

const statusBorderStyles = stylex.create({
  warning: {
    borderColor: colorVars['--color-warning'],
  },
  error: {
    borderColor: colorVars['--color-negative'],
  },
  success: {
    borderColor: colorVars['--color-positive'],
  },
});

export type XDSTextAreaStatusType = 'warning' | 'error' | 'success';

export interface XDSTextAreaStatus {
  /**
   * The type of status to display.
   */
  type: XDSTextAreaStatusType;
  /**
   * Optional message to display below the textarea.
   */
  message?: string;
}

export interface XDSTextAreaProps {
  /**
   * Label text for the textarea (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed between the label and textarea.
   */
  description?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Callback fired when the textarea value changes.
   */
  onChange: (value: string, e: ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * The current value of the textarea.
   */
  value: string;
  /**
   * Placeholder text shown when the textarea is empty.
   */
  placeholder?: string;
  /**
   * The number of visible text rows.
   * @default 3
   */
  rows?: number;
  /**
   * Whether the textarea is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Status indicator for the textarea.
   * When set, displays a colored border and status icon.
   * If message is provided, displays a floating message box below the textarea.
   */
  status?: XDSTextAreaStatus;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Icon to display at the start of the textarea.
   * Import from @heroicons/react/24/outline or @heroicons/react/24/solid.
   */
  startIcon?: XDSIconType;
  /**
   * Whether to enable browser spell checking.
   * @default true
   */
  hasSpellCheck?: boolean;
  /**
   * Callback fired when content is pasted into the textarea.
   */
  onPaste?: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Maximum number of characters allowed.
   * When set, displays a character counter below the textarea.
   */
  maxLength?: number;
  /**
   * Whether to automatically focus the textarea on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * The HTML name attribute for the textarea.
   * Useful for form submissions.
   */
  htmlName?: string;
}

/**
 * A multi-line text input component for collecting longer user input.
 *
 * @example
 * ```tsx
 * <XDSTextArea label="Description" value={description} onChange={setDescription} />
 * <XDSTextArea label="Notes" rows={5} value={notes} onChange={setNotes} />
 * ```
 */
export const XDSTextArea = forwardRef<HTMLTextAreaElement, XDSTextAreaProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      isOptional = false,
      isRequired = false,
      onChange,
      value,
      placeholder,
      rows = 3,
      isDisabled = false,
      status,
      labelTooltip,
      startIcon,
      hasSpellCheck = true,
      onPaste,
      maxLength,
      hasAutoFocus = false,
      htmlName,
    },
    ref,
  ) => {
    const id = useId();
    const descriptionID = useId();
    const statusMessageID = useId();

    const statusIconMap: Record<XDSTextAreaStatusType, XDSIconType> = {
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      success: CheckCircleIcon,
    };

    const statusIconColorMap: Record<
      XDSTextAreaStatusType,
      'warning' | 'negative' | 'positive'
    > = {
      warning: 'warning',
      error: 'negative',
      success: 'positive',
    };

    const ariaDescribedBy =
      [
        description ? descriptionID : null,
        status?.message ? statusMessageID : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <XDSField
        label={label}
        isLabelHidden={isLabelHidden}
        description={description}
        inputID={id}
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
        labelTooltip={labelTooltip}>
        <div
          {...stylex.props(
            styles.wrapper,
            isDisabled && styles.wrapperDisabled,
            status && statusBorderStyles[status.type],
          )}>
          {startIcon && <XDSIcon icon={startIcon} size="sm" color="primary" />}
          <textarea
            ref={ref}
            id={id}
            name={htmlName}
            value={value}
            onChange={e => onChange(e.target.value, e)}
            onPaste={onPaste}
            placeholder={placeholder}
            rows={rows}
            disabled={isDisabled}
            spellCheck={hasSpellCheck}
            maxLength={maxLength}
            autoFocus={hasAutoFocus}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired === true ? 'true' : undefined}
            aria-invalid={status?.type === 'error' ? 'true' : undefined}
            {...stylex.props(
              styles.textarea,
              isDisabled && styles.textareaDisabled,
            )}
          />
          {status && (
            <XDSIcon
              icon={statusIconMap[status.type]}
              size="md"
              color={statusIconColorMap[status.type]}
            />
          )}
        </div>
        {maxLength != null && (
          <div
            {...stylex.props(
              styles.counter,
              value.length > maxLength && styles.counterError,
            )}>
            {value.length}/{maxLength}
          </div>
        )}
      </XDSField>
    );
  },
);

XDSTextArea.displayName = 'XDSTextArea';

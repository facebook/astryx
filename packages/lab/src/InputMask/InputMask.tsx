// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InputMask.tsx
 * @input Uses React, maskEngine, Field/Spinner/VisuallyHidden + input hooks from @astryxdesign/core
 * @output Exports InputMask component, InputMaskProps and mask types (RFC #4946)
 * @position Lab experiment (RFC facebook/astryx#4946); consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/InputMask/maskEngine.ts (mask/caret math)
 * - /packages/lab/src/InputMask/InputMask.doc.mjs (props table, features)
 * - /packages/lab/src/InputMask/InputMask.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/InputMask/index.ts (exports if types change)
 */

import {
  useId,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type CompositionEvent,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import type {BaseProps} from '@astryxdesign/core';
import {
  Field,
  InputClearButton,
  inputStatusBorderStyles,
  inputStatusFocusWithinStyles,
  inputStatusHoverShadowStyles,
  inputWrapperStyles,
  type FieldStatusVariant,
  type InputStatus,
} from '@astryxdesign/core/Field';
import {useInputContainer, useInputStatusIcon} from '@astryxdesign/core/hooks';
import {useSize} from '@astryxdesign/core/SizeContext';
import {Spinner} from '@astryxdesign/core/Spinner';
import {
  colorVars,
  sizeVars,
  typeScaleVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {useTooltip} from '@astryxdesign/core/Tooltip';
import {
  devError,
  getInputARIA,
  mergeProps,
  mergeRefs,
  themeProps,
} from '@astryxdesign/core/utils';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';

import {
  clampRaw,
  formatRaw,
  ghostRemainder,
  maxRawLength,
  resolveEdit,
  resolveMask,
  type DeleteDirection,
  type MaskProp,
} from './maskEngine';

/** The deletion an input event performed, if it was one. */
function deleteDirectionOf(inputType: string | undefined): DeleteDirection {
  if (inputType?.endsWith('Backward')) {
    return 'backward';
  }
  if (inputType?.endsWith('Forward')) {
    return 'forward';
  }
  return null;
}

/**
 * Clear and composition end deliver no ChangeEvent; hand the callbacks the
 * input element under the same contract.
 */
function changeEventFor(el: HTMLInputElement): ChangeEvent<HTMLInputElement> {
  return {
    target: el,
    currentTarget: el,
  } as unknown as ChangeEvent<HTMLInputElement>;
}

const styles = stylex.create({
  inner: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
  input: {
    display: 'block',
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    outline: 'none',
  },
  inputDisabled: {
    cursor: 'default',
  },
  // The ghost track overlays the input box and must use identical text
  // metrics (font, size incl. the coarse-pointer bump, leading) so the
  // hidden mirror measures exactly the typed text's width and the ghost
  // starts precisely where the caret sits.
  ghostTrack: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  ghostMirror: {
    visibility: 'hidden',
  },
  ghost: {
    color: colorVars['--color-text-secondary'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

export type InputMaskSize = keyof typeof sizeStyles;

export interface InputMaskProps extends Omit<
  BaseProps,
  'onChange' | 'defaultValue'
> {
  /** Ref forwarded to the input element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * The mask to apply: a pattern where `#` marks a digit slot and every
   * other character is inserted literally. Literals may be digits too
   * (`'(+1) ### ### ####'`); they are never read back as typed data.
   */
  mask: MaskProp;
  /**
   * Label text for the input (always rendered for accessibility).
   */
  label: string;
  /**
   * The current value as raw digits only (no literals), e.g. '5551234567'.
   * Omit to leave the component uncontrolled (see `defaultValue`).
   */
  value?: string;
  /**
   * Initial raw digits for uncontrolled use, read once on mount. When `value`
   * is provided the component is controlled and this prop is ignored.
   */
  defaultValue?: string;
  /**
   * Fired when the digits change. Receives the raw digits, not the
   * formatted display value.
   */
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  /** Async action on change. Fires after onChange if not prevented. */
  changeAction?: (
    value: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /**
   * Screen-reader hint describing the expected format. Defaults to an
   * auto-generated example (e.g. 'Format: (555) 555-5555'); pass a string to
   * replace it or `false` to omit it.
   */
  formatHint?: string | false;
  /**
   * Autocomplete attribute for the input.
   * @default 'off'
   */
  autoComplete?: string;
  /** Whether to visually hide the label. @default false */
  isLabelHidden?: boolean;
  /** Description text displayed between the label and input. */
  description?: string;
  /** Whether the field is optional. Mutually exclusive with isRequired. @default false */
  isOptional?: boolean;
  /** Whether the field is required. Mutually exclusive with isOptional. @default false */
  isRequired?: boolean;
  /** Whether the input is disabled. @default false */
  isDisabled?: boolean;
  /** Whether the input is read-only. @default false */
  isReadOnly?: boolean;
  /** Explains why the input is disabled; keeps it focusable via aria-disabled. */
  disabledMessage?: string;
  /** Status indicator for the input. */
  status?: InputStatus;
  /** How the status message is placed. @default 'attached' */
  statusVariant?: FieldStatusVariant;
  /** The size of the input. @default 'md' */
  size?: InputMaskSize;
  /** Whether the input is in a loading state. @default false */
  isLoading?: boolean;
  /** Width of the whole field. */
  width?: number | string;
  /** Tooltip text displayed in an info icon at the end of the label. */
  labelTooltip?: string;
  /** Whether to show a clear button when a value is set. @default false */
  hasClear?: boolean;
  /** Whether to autofocus the input on mount. @default false */
  hasAutoFocus?: boolean;
  /** The HTML name attribute for form submission; posts the raw digits, like `value`. */
  htmlName?: string;
  /** Fired when the user presses Enter. */
  onEnter?: () => void;
  /** Fired on keydown events on the input. */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Masked text input for fixed-shape values (phone, ZIP, SSN, card number).
 * Formats while typing, inserting literal characters automatically; the
 * remaining shape stays visible as an aria-hidden ghost after the caret.
 *
 * @example
 * ```
 * <InputMask mask={{pattern: '(###) ###-####'}} label="Phone number" value={phone} onChange={setPhone} />
 * <InputMask mask={{pattern: '###-##-####'}} label="Tax ID" value={id} onChange={setId} />
 * <InputMask mask={{pattern: '#####'}} label="ZIP code" htmlName="zip" />
 * ```
 */
export function InputMask({
  mask,
  label,
  value,
  defaultValue,
  onChange,
  changeAction,
  formatHint,
  autoComplete,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  disabledMessage,
  status,
  statusVariant = 'attached',
  size: sizeProp,
  isLoading = false,
  width,
  labelTooltip,
  hasClear = false,
  hasAutoFocus = false,
  htmlName,
  onEnter,
  onKeyDown,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: InputMaskProps) {
  const size = useSize(sizeProp, 'md');
  const def = resolveMask(mask);
  // Uncontrolled digits, seeded once from defaultValue; a provided `value`
  // wins. Both routes clamp at read so a later mask change re-clamps them.
  const [internalRaw, setInternalRaw] = useState(() => defaultValue ?? '');
  const isControlled = value !== undefined;
  const rawValue = clampRaw(def, isControlled ? value : internalRaw);

  const id = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const formatHintID = useId();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const caretTargetRef = useRef<number | null>(null);
  const isComposingRef = useRef(false);
  const [editSeq, setEditSeq] = useState(0);
  const [compositionText, setCompositionText] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [optimisticRaw, setOptimisticRaw] = useOptimistic(rawValue);
  const isBusy = isLoading || isPending || optimisticRaw !== rawValue;

  const displayed = formatRaw(def, optimisticRaw);
  // While composing, echo the IME's in-progress text unmasked; masking
  // resumes (and the ghost returns) when composition ends.
  const shownValue = compositionText ?? displayed;
  const ghost =
    compositionText == null ? ghostRemainder(def, optimisticRaw) : '';

  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status,
      statusVariant,
      isInGroup: false,
    });

  const hintText =
    formatHint === false
      ? null
      : (formatHint ??
        `Format: ${formatRaw(def, '5'.repeat(maxRawLength(def)))}`);

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      hintText ? formatHintID : null,
      description ? descriptionID : null,
      statusVariant !== 'tooltip' && status?.message ? statusMessageID : null,
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ],
    null,
  );

  // Restore the computed caret after React re-renders the masked value. Keyed
  // on an edit counter (not the display string) so rejected edits — where the
  // display string does not change — still reposition the caret.
  useLayoutEffect(() => {
    if (caretTargetRef.current != null) {
      const caret = caretTargetRef.current;
      caretTargetRef.current = null;
      inputRef.current?.setSelectionRange(caret, caret);
    }
  }, [editSeq]);

  const commitRaw = (nextRaw: string, e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalRaw(nextRaw);
    }
    onChange?.(nextRaw, e);
    if (changeAction && !e.defaultPrevented) {
      startTransition(async () => {
        setOptimisticRaw(nextRaw);
        try {
          await changeAction(nextRaw, e);
        } catch (error) {
          // A rejection escaping the async action would leave the transition
          // pending forever — optimistic value and busy state stuck until
          // remount. Settle it and report the failure instead.
          devError('InputMask', 'changeAction rejected:', error);
        }
      });
    }
  };

  // Resolve what the browser did to the display against what the mask
  // rendered, then restore the caret once the re-formatted value is in.
  const applyEdit = (
    el: HTMLInputElement,
    e: ChangeEvent<HTMLInputElement>,
    deleteDirection: DeleteDirection = null,
  ) => {
    const edit = resolveEdit(
      def,
      displayed,
      el.value,
      el.selectionStart ?? el.value.length,
      deleteDirection,
    );
    caretTargetRef.current = edit.caret;
    setEditSeq(seq => seq + 1);
    if (edit.raw !== optimisticRaw) {
      commitRaw(edit.raw, e);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled || isReadOnly) {
      return;
    }
    const el = e.target;
    const native = e.nativeEvent as InputEvent;
    if (isComposingRef.current || native.isComposing) {
      setCompositionText(el.value);
      return;
    }
    applyEdit(el, e, deleteDirectionOf(native.inputType));
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
    setCompositionText(displayed);
  };

  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    setCompositionText(null);
    if (isDisabled || isReadOnly) {
      return;
    }
    const el = e.currentTarget;
    applyEdit(el, changeEventFor(el));
  };

  const handleClear = () => {
    const el = inputRef.current;
    if (el) {
      commitRaw('', changeEventFor(el));
      el.focus();
    }
  };

  const {onClick: handleWrapperClick, onMouseUp: handleWrapperMouseUp} =
    useInputContainer({
      containerRef,
      inputRef,
      disabled: isDisabled,
    });

  const inputWrapper = (
    <div
      ref={el => {
        containerRef.current = el;
        disabledMessageTooltip.ref(el);
      }}
      onClick={handleWrapperClick}
      onMouseUp={handleWrapperMouseUp}
      {...mergeProps(
        themeProps('input-mask', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
          readonly: isReadOnly ? 'readonly' : null,
        }),
        stylex.props(
          inputWrapperStyles.base,
          sizeStyles[size],
          isDisabled && inputWrapperStyles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && !isDisabled && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          xstyle,
        ),
        className,
        style,
      )}>
      {hintText != null && (
        <VisuallyHidden id={formatHintID}>{hintText}</VisuallyHidden>
      )}
      <div {...stylex.props(styles.inner)}>
        <input
          {...rest}
          ref={mergeRefs(ref, inputRef)}
          id={id}
          type="text"
          value={shownValue}
          inputMode="numeric"
          autoComplete={autoComplete ?? 'off'}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onEnter?.();
            }
            onKeyDown?.(e);
          }}
          disabled={isDisabled && !showsDisabledMessage}
          aria-disabled={showsDisabledMessage ? 'true' : undefined}
          readOnly={isReadOnly || showsDisabledMessage || undefined}
          autoFocus={hasAutoFocus}
          data-autofocus={hasAutoFocus || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired === true ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          aria-labelledby={ariaLabelledBy}
          {...stylex.props(styles.input, isDisabled && styles.inputDisabled)}
        />
        <div aria-hidden="true" {...stylex.props(styles.ghostTrack)}>
          <span {...stylex.props(styles.ghostMirror)}>{shownValue}</span>
          <span data-inputmask-ghost {...stylex.props(styles.ghost)}>
            {ghost}
          </span>
        </div>
      </div>
      {htmlName != null && !isDisabled && (
        <input type="hidden" name={htmlName} value={rawValue} />
      )}
      {hasClear && rawValue !== '' && !isDisabled && !isReadOnly && (
        <InputClearButton label={`Clear ${label}`} onClick={handleClear} />
      )}
      {isBusy && <Spinner size="sm" />}
      {statusIcon}
    </div>
  );

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

InputMask.displayName = 'InputMask';

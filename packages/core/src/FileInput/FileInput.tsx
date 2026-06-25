// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file FileInput.tsx
 * @input Uses React, useId, Field, Icon, Spinner
 * @output Exports FileInput component, FileInputProps, FileInputStatus
 * @position Core implementation; consumed by index.ts, tested by FileInput.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FileInput/FileInput.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/FileInput/FileInput.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/FileInput/index.ts (exports if types change)
 * - /apps/storybook/stories/FileInput.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/FileInput/ (showcase blocks)
 */

import {
  useId,
  useCallback,
  useRef,
  useState,
  useTransition,
  type DragEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
  borderVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {
  Field,
  InputClearButton,
  type InputStatus,
  type InputStatusType,
} from '../Field';
import {Icon, type IconName} from '../Icon';
import {Spinner} from '../Spinner';

export type {
  InputStatus as FileInputStatus,
  InputStatusType as FileInputStatusType,
} from '../Field';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFiles(
  files: File[],
  accept: string | undefined,
  maxSize: number | undefined,
  maxFiles: number | undefined,
  isMultiple: boolean,
): {valid: File[]; errors: string[]} {
  const errors: string[] = [];
  let valid = files;

  if (accept) {
    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    valid = valid.filter(file => {
      const matches = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type);
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type.toLowerCase() === type;
      });
      if (!matches) {
        errors.push(`"${file.name}" is not an accepted file type`);
      }
      return matches;
    });
  }

  if (maxSize != null) {
    valid = valid.filter(file => {
      if (file.size > maxSize) {
        errors.push(`"${file.name}" exceeds ${formatFileSize(maxSize)} limit`);
        return false;
      }
      return true;
    });
  }

  if (isMultiple && maxFiles != null && valid.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    valid = valid.slice(0, maxFiles);
  }

  return {valid, errors};
}

const styles = stylex.create({
  dropzone: {
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-6'],
    paddingInline: spacingVars['--spacing-4'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'dashed',
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      ':focus-within': colorVars['--color-accent'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-surface'],
    transitionProperty: 'border-color, box-shadow, background-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    cursor: 'pointer',
    outline: 'none',
  },
  dropzoneHover: {
    boxShadow: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `inset 0 0 0 2px color-mix(in srgb, ${colorVars['--color-accent']} 20%, transparent)`,
      },
    },
  },
  dropzoneActive: {
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent-muted'],
  },
  dropzoneDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-border-emphasized'],
  },
  compact: {
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      ':focus-within': colorVars['--color-accent'],
    },
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-surface'],
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within)': {
        '@media (hover: hover)': `inset 0 0 0 2px color-mix(in srgb, ${colorVars['--color-accent']} 20%, transparent)`,
      },
    },
    cursor: 'pointer',
    height: sizeVars['--size-element-md'],
    outline: 'none',
  },
  compactDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    borderColor: colorVars['--color-border-emphasized'],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  placeholderText: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center',
    userSelect: 'none',
  },
  fileNameText: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  fileNameDropzone: {
    textAlign: 'center',
    whiteSpace: 'normal',
  },
  fileNameCompact: {
    textAlign: 'start',
  },
  placeholderCompact: {
    textAlign: 'start',
    flex: 1,
    minWidth: 0,
  },
  liveRegion: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

const statusBorderStyles = stylex.create({
  warning: {
    borderColor: colorVars['--color-warning'],
  },
  error: {
    borderColor: colorVars['--color-error'],
  },
  success: {
    borderColor: colorVars['--color-success'],
  },
});

export interface FileInputProps extends Omit<
  BaseProps,
  'onChange' | 'defaultValue' | 'value'
> {
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Accessible label for the file input.
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Currently selected file(s). Controlled component.
   */
  value: File | File[] | null;
  /**
   * Callback fired when files are selected or removed.
   */
  onChange: (files: File | File[] | null) => void;
  /**
   * Async change action (React 19 transitions pattern).
   * Use for immediate upload on file selection.
   */
  changeAction?: (files: File | File[] | null) => Promise<void>;
  /**
   * Accepted file types. Uses the HTML accept attribute format.
   * Examples: "image/*", ".pdf,.doc,.docx", "image/png,image/jpeg"
   */
  accept?: string;
  /**
   * Whether multiple files can be selected.
   * When true, `value` and `onChange` use `File[]` instead of `File`.
   * @default false
   */
  isMultiple?: boolean;
  /**
   * Maximum file size in bytes. Files exceeding this are rejected
   * with an error status.
   */
  maxSize?: number;
  /**
   * Maximum number of files (only applies when `isMultiple` is true).
   */
  maxFiles?: number;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the input is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Whether the input is in a loading state (e.g. uploading).
   * @default false
   */
  isLoading?: boolean;
  /**
   * Validation status for the input.
   */
  status?: InputStatus;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Placeholder text shown when no file is selected.
   * @default "Choose file" or "Choose files"
   */
  placeholder?: string;
  /**
   * Visual mode for the file input.
   * - 'input': compact inline style, similar to a text input
   * - 'dropzone': larger area with dashed border and drag-and-drop support
   * @default 'input'
   */
  mode?: 'dropzone' | 'input';
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
}

/**
 * A file input component with optional drag-and-drop support.
 *
 * @example
 * ```
 * <FileInput label="Resume" value={file} onChange={setFile} accept=".pdf" />
 * ```
 */
export function FileInput({
  label,
  isLabelHidden = false,
  value,
  onChange,
  changeAction,
  accept,
  isMultiple = false,
  maxSize,
  maxFiles,
  isDisabled = false,
  isRequired = false,
  isLoading = false,
  status: statusProp,
  description,
  placeholder,
  mode = 'input',
  isOptional = false,
  labelTooltip,
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: FileInputProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const liveRegionID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const status =
    statusProp ??
    (validationError
      ? {type: 'error' as const, message: validationError}
      : undefined);

  const statusIconMap: Record<InputStatusType, IconName> = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const statusIconColorMap: Record<
    InputStatusType,
    'warning' | 'error' | 'success'
  > = {
    warning: 'warning',
    error: 'error',
    success: 'success',
  };

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const defaultPlaceholder = isMultiple ? 'Choose files' : 'Choose file';
  const displayPlaceholder = placeholder ?? defaultPlaceholder;

  const handleFiles = useCallback(
    (fileList: File[]) => {
      if (isDisabled) {
        return;
      }

      const {valid, errors} = validateFiles(
        fileList,
        accept,
        maxSize,
        maxFiles,
        isMultiple,
      );

      if (errors.length > 0) {
        setValidationError(errors[0]);
      } else {
        setValidationError(null);
      }

      if (valid.length === 0) {
        onChange(null);
        return;
      }

      const result = isMultiple ? valid : valid[0];
      onChange(result);

      if (changeAction) {
        startTransition(async () => {
          await changeAction(result);
        });
      }
    },
    [
      accept,
      isDisabled,
      isMultiple,
      maxFiles,
      maxSize,
      onChange,
      changeAction,
      startTransition,
    ],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = Array.from(e.target.files ?? []);
      handleFiles(fileList);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFiles],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setValidationError(null);
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    },
    [onChange],
  );

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      inputRef.current?.click();
    }
  }, [isDisabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [isDisabled],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDisabled && mode === 'dropzone') {
        setIsDragOver(true);
      }
    },
    [isDisabled, mode],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDisabled && mode === 'dropzone') {
        setIsDragOver(true);
      }
    },
    [isDisabled, mode],
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (isDisabled || mode !== 'dropzone') {
        return;
      }
      const fileList = Array.from(e.dataTransfer.files);
      if (fileList.length > 0) {
        handleFiles(fileList);
      }
    },
    [isDisabled, mode, handleFiles],
  );

  const hasFiles =
    value != null && (Array.isArray(value) ? value.length > 0 : true);
  const fileNames = hasFiles
    ? Array.isArray(value)
      ? value.map(f => f.name).join(', ')
      : (value?.name ?? '')
    : null;

  const renderDropzoneContent = () => {
    if (isLoading) {
      return <Spinner size="md" />;
    }
    if (hasFiles) {
      return (
        <div {...stylex.props(styles.fileNameText, styles.fileNameDropzone)}>
          {fileNames}
        </div>
      );
    }
    return (
      <>
        <Icon icon="arrowUp" size="md" color="secondary" />
        <span {...stylex.props(styles.placeholderText)}>
          {isDragOver ? 'Drop files here' : displayPlaceholder}
        </span>
      </>
    );
  };

  const renderCompactContent = () => {
    if (isLoading) {
      return (
        <>
          <span {...stylex.props(styles.fileNameText)}>
            {fileNames ?? displayPlaceholder}
          </span>
          <Spinner size="sm" />
        </>
      );
    }
    return (
      <>
        <Icon icon="arrowUp" size="sm" color="secondary" />
        <span
          {...stylex.props(
            hasFiles ? styles.fileNameText : styles.placeholderText,
            hasFiles ? styles.fileNameCompact : styles.placeholderCompact,
          )}>
          {fileNames ?? displayPlaceholder}
        </span>
        {status && (
          <Icon
            icon={statusIconMap[status.type]}
            size="md"
            color={statusIconColorMap[status.type]}
          />
        )}
      </>
    );
  };

  const isDropzone = mode === 'dropzone';

  const dragDropProps = isDropzone
    ? {
        onDragEnter: handleDragEnter,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }
    : {};

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
      labelTooltip={labelTooltip}
      width={width}>
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={label}
        aria-busy={isLoading || undefined}
        {...dragDropProps}
        {...mergeProps(
          themeProps('file-input', {mode, status: status?.type ?? null}),
          stylex.props(
            isDropzone ? styles.dropzone : styles.compact,
            isDropzone && !isDisabled && styles.dropzoneHover,
            isDropzone && isDragOver && styles.dropzoneActive,
            isDropzone && isDisabled && styles.dropzoneDisabled,
            !isDropzone && isDisabled && styles.compactDisabled,
            status && statusBorderStyles[status.type],
            xstyle,
          ),
          className,
          style,
        )}>
        <input
          {...rest}
          ref={mergeRefs(ref, inputRef)}
          id={id}
          type="file"
          accept={accept}
          multiple={isMultiple}
          disabled={isDisabled}
          onChange={handleInputChange}
          aria-describedby={ariaDescribedBy}
          aria-required={isRequired ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          tabIndex={-1}
          {...stylex.props(styles.hiddenInput)}
        />
        {isDropzone ? renderDropzoneContent() : renderCompactContent()}
        {hasFiles && !isDisabled && !isLoading && (
          <InputClearButton label={`Clear ${label}`} onClick={handleClear} />
        )}
      </div>
      <div
        id={liveRegionID}
        role="status"
        aria-live="polite"
        {...stylex.props(styles.liveRegion)}>
        {validationError}
      </div>
    </Field>
  );
}

FileInput.displayName = 'FileInput';

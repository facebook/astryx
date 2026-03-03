/**
 * @file XDSTypeahead.tsx
 * @input Uses React, XDSBaseTypeahead, XDSField
 * @output Exports XDSTypeahead styled typeahead component
 * @position Styled wrapper; composes XDSBaseTypeahead with XDSField
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/README.md
 * - /packages/core/src/Typeahead/index.ts
 * - /apps/storybook/stories/Typeahead.stories.tsx
 */

import React, {useId, type ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSBaseTypeahead} from './XDSBaseTypeahead';
import {XDSField, type XDSInputStatus} from '../Field';
import type {XDSSearchableItem, XDSSearchSource} from './types';

export type {
  XDSInputStatus as XDSTypeaheadStatus,
  XDSInputStatusType as XDSTypeaheadStatusType,
} from '../Field';

export interface XDSTypeaheadProps<T extends XDSSearchableItem> {
  /** Accessible label (required). */
  label: string;
  /** Visually hide the label. @default false */
  isLabelHidden?: boolean;
  /** Helper text. */
  description?: string;
  /** Required field. @default false */
  isRequired?: boolean;
  /** Optional field. @default false */
  isOptional?: boolean;
  /** Validation status. */
  status?: XDSInputStatus;
  /** Label tooltip. */
  labelTooltip?: string;
  /** Search source providing items. */
  searchSource: XDSSearchSource<T>;
  /** Currently selected item (null = nothing selected). */
  value: T | null;
  /** Callback when selection changes. */
  onChange: (item: T | null) => void;
  /** Render function for dropdown items. Default: XDSTypeaheadItem. */
  renderItem?: (item: T) => ReactNode;
  /** Placeholder text. */
  placeholder?: string;
  /** Show results on focus before typing. @default false */
  hasEntriesOnFocus?: boolean;
  /** Max dropdown items. @default 10 */
  maxMenuItems?: number;
  /** Text shown when no results found. @default 'No results found' */
  emptySearchResultsText?: string;
  /** Whether the input is disabled. @default false */
  isDisabled?: boolean;
  /** Show clear button. @default true */
  hasClear?: boolean;
  /** Auto-focus on mount. @default false */
  hasAutoFocus?: boolean;
  /** Input size. @default 'md' */
  size?: 'sm' | 'md';
  /**
   * Debounce delay in ms before triggering search after typing.
   * Set to 0 for synchronous/local search sources that don't need debouncing.
   * @default 150
   */
  debounceMs?: number;
  /** Query change callback. */
  onChangeQuery?: (query: string) => void;
  /** Callback when dropdown opens/closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** StyleX overrides. */
  xstyle?: StyleXStyles;
  /** Test ID. */
  'data-testid'?: string;
}

/**
 * A search-as-you-type component for selecting an item from a search source.
 *
 * Wraps XDSBaseTypeahead with XDSField for label, description, and status.
 *
 * @example
 * ```tsx
 * <XDSTypeahead
 *   label="Assignee"
 *   searchSource={userSource}
 *   value={assignee}
 *   onChange={setAssignee}
 *   placeholder="Search users..."
 * />
 *
 * <XDSTypeahead
 *   label="Assignee"
 *   searchSource={userSource}
 *   value={assignee}
 *   onChange={setAssignee}
 *   renderItem={(item) => (
 *     <XDSTypeaheadItem
 *       item={item}
 *       icon={<XDSAvatar src={item.auxiliaryData.avatar} size="sm" />}
 *       description={item.auxiliaryData.role}
 *     />
 *   )}
 * />
 * ```
 */
export function XDSTypeahead<T extends XDSSearchableItem>({
  label,
  isLabelHidden = false,
  description,
  isRequired = false,
  isOptional = false,
  status,
  labelTooltip,
  searchSource,
  value,
  onChange,
  renderItem,
  placeholder,
  hasEntriesOnFocus,
  maxMenuItems,
  emptySearchResultsText,
  isDisabled,
  hasClear,
  hasAutoFocus,
  size,
  debounceMs,
  onChangeQuery,
  onOpenChange,
  xstyle,
  'data-testid': testId,
}: XDSTypeaheadProps<T>) {
  const inputId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();

  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <XDSField
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={inputId}
      descriptionID={description ? descriptionId : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageId : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}>
      <XDSBaseTypeahead
        searchSource={searchSource}
        value={value}
        onChange={onChange}
        renderItem={renderItem}
        placeholder={placeholder}
        hasEntriesOnFocus={hasEntriesOnFocus}
        maxMenuItems={maxMenuItems}
        emptySearchResultsText={emptySearchResultsText}
        isDisabled={isDisabled}
        hasClear={hasClear}
        hasAutoFocus={hasAutoFocus}
        size={size}
        inputId={inputId}
        ariaDescribedBy={ariaDescribedBy}
        onChangeQuery={onChangeQuery}
        onOpenChange={onOpenChange}
        debounceMs={debounceMs}
        statusType={status?.type}
        wrapperXStyle={xstyle}
        data-testid={testId}
      />
    </XDSField>
  );
}

XDSTypeahead.displayName = 'XDSTypeahead';

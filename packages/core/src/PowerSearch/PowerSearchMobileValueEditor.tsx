// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PowerSearchMobileValueEditor.tsx
 * @input OperatorValue, FilterValue, onChange callback
 * @output Touch-native value editor for one filter, rendered inside a BottomSheet
 * @position Sub-component; consumed by PowerSearchMobile
 *
 * The desktop value editor renders `enum` and `enum_list` as Selectors, which
 * open a dropdown layer. Inside a bottom sheet that stacks a second overlay on
 * a surface the user is already inside, so those two types are re-rendered here
 * as the sheet's own list: a single-select list that commits on tap (matching
 * Selector's mobile pattern) and a CheckboxList applied from the footer
 * (matching MultiSelector's). Every other type is a real input rather than a
 * menu, so it falls through to the shared PowerSearchValueEditor unchanged.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import React, {useCallback, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {CheckboxList, CheckboxListItem} from '../CheckboxList';
import {Icon} from '../Icon';
import {List, ListItem} from '../List';
import {spacingVars} from '../theme/tokens.stylex';
import {useTranslator} from '../i18n';
import {PowerSearchValueEditor} from './PowerSearchValueEditor';
import type {InternalConfig} from './useInternalConfig';
import type {FilterValue, OperatorValue} from './types';

const styles = stylex.create({
  // The sheet's own padding surrounds the list; the rows themselves run edge
  // to edge so a tap anywhere on the row width registers, the way a settings
  // list behaves on a phone.
  flush: {
    marginInline: `calc(-1 * ${spacingVars['--spacing-4']})`,
  },
  input: {
    paddingBlockStart: spacingVars['--spacing-1'],
  },
});

export interface PowerSearchMobileValueEditorProps {
  config: InternalConfig;
  operatorValue: OperatorValue;
  filterValue: FilterValue | undefined;
  /** Stage a value without leaving the sheet. */
  onChange: (value: FilterValue) => void;
  /** Stage a value and commit the filter immediately (single-tap choices). */
  onCommit: (value: FilterValue) => void;
  isDisabled?: boolean;
  timezoneID?: string;
}

/**
 * Renders the value control for one filter inside the mobile editor sheet.
 */
export function PowerSearchMobileValueEditor({
  config,
  operatorValue,
  filterValue,
  onChange,
  onCommit,
  isDisabled,
  timezoneID,
}: PowerSearchMobileValueEditorProps) {
  const t = useTranslator();

  const handleFallbackChange = useCallback(
    (value: FilterValue, shouldSave?: boolean) => {
      // The shared editor asks to close for choices that are complete the
      // moment they are made (a relative-date preset, a typeahead pick).
      // Honour that here exactly as the desktop popover does.
      if (shouldSave) {
        onCommit(value);
      } else {
        onChange(value);
      }
    },
    [onChange, onCommit],
  );

  const enumSelection = useMemo(
    () => (filterValue?.type === 'enum' ? filterValue.value : undefined),
    [filterValue],
  );

  const enumListSelection = useMemo(
    () => (filterValue?.type === 'enum_list' ? [...filterValue.value] : []),
    [filterValue],
  );

  const handleEnumListChange = useCallback(
    (values: string[]) => {
      onChange({type: 'enum_list', value: values});
    },
    [onChange],
  );

  if (operatorValue.type === 'enum') {
    return (
      <List hasDividers density="spacious" xstyle={styles.flush}>
        {operatorValue.values.map(item => {
          const isSelected = item.value === enumSelection;
          return (
            <ListItem
              key={item.value}
              label={item.label}
              startContent={item.icon}
              isSelected={isSelected}
              isDisabled={isDisabled}
              endContent={
                isSelected ? (
                  <Icon icon="check" size="sm" color="accent" />
                ) : undefined
              }
              onClick={() => onCommit({type: 'enum', value: item.value})}
            />
          );
        })}
      </List>
    );
  }

  if (operatorValue.type === 'enum_list') {
    return (
      <CheckboxList
        label={t('@astryx.powersearch.valueEditor.values')}
        isLabelHidden
        hasDividers
        density="spacious"
        value={enumListSelection}
        onChange={handleEnumListChange}
        isDisabled={isDisabled}
        xstyle={styles.flush}>
        {operatorValue.values.map(item => (
          <CheckboxListItem
            key={item.value}
            label={item.label}
            value={item.value}
            endContent={item.icon}
          />
        ))}
      </CheckboxList>
    );
  }

  return (
    <div {...stylex.props(styles.input)}>
      <PowerSearchValueEditor
        operatorValue={operatorValue}
        filterValue={filterValue}
        onChange={handleFallbackChange}
        config={config}
        isDisabled={isDisabled}
        timezoneID={timezoneID}
      />
    </div>
  );
}

PowerSearchMobileValueEditor.displayName = 'PowerSearchMobileValueEditor';

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PowerSearchTouchValueEditor.tsx
 * @input OperatorValue, FilterValue, onChange callback
 * @output Sheet-native value editor for the private PowerSearch touch surface
 * @position Internal sub-component consumed by PowerSearchTouch
 *
 * The desktop value editor renders `enum` and `enum_list` as Selectors, which
 * open a dropdown layer. Inside a bottom sheet that stacks a second overlay on
 * a surface the user is already inside, so those two types are re-rendered here
 * as sheet-native controls: staged single- and multi-select lists with trailing
 * checkmarks, both confirmed from the footer. Every other type is a real input
 * rather than a menu, so it falls through to the shared PowerSearchValueEditor
 * while still requiring the sheet's Add filter or Edit filter confirmation.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/PowerSearch/index.ts
 */

import React, {useCallback, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {List, ListItem} from '../List';
import {spacingVars} from '../theme/tokens.stylex';
import {useTranslator} from '../i18n';
import {VisuallyHidden} from '../VisuallyHidden';
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

export interface PowerSearchTouchValueEditorProps {
  config: InternalConfig;
  operatorValue: OperatorValue;
  filterValue: FilterValue | undefined;
  /** Stage a value without leaving the sheet. */
  onChange: (value: FilterValue) => void;
  isDisabled?: boolean;
  maxMenuItems?: number;
  timezoneID?: string;
}

/**
 * Renders the value control for one filter inside the mobile editor sheet.
 */
export function PowerSearchTouchValueEditor({
  config,
  operatorValue,
  filterValue,
  onChange,
  isDisabled,
  maxMenuItems,
  timezoneID,
}: PowerSearchTouchValueEditorProps) {
  const t = useTranslator();

  const handleFallbackChange = useCallback(
    (value: FilterValue) => {
      // Even editors that are complete on selection stay staged here. The
      // touch sheet always asks for explicit confirmation through its
      // mode-specific Add filter or Edit filter action.
      onChange(value);
    },
    [onChange],
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
              label={
                isSelected ? (
                  <>
                    <span aria-hidden="true">{item.label}</span>
                    <VisuallyHidden>
                      {t('@astryx.powersearch.mobile.selectedValue', {
                        value: item.label,
                      })}
                    </VisuallyHidden>
                  </>
                ) : (
                  item.label
                )
              }
              startContent={item.icon}
              isSelected={isSelected}
              isDisabled={isDisabled}
              endContent={
                isSelected ? (
                  <Icon icon="check" size="sm" color="accent" />
                ) : undefined
              }
              onClick={() => onChange({type: 'enum', value: item.value})}
            />
          );
        })}
      </List>
    );
  }

  if (operatorValue.type === 'enum_list') {
    return (
      <List hasDividers density="spacious" xstyle={styles.flush}>
        {operatorValue.values.map(item => {
          const isSelected = enumListSelection.includes(item.value);
          return (
            <ListItem
              key={item.value}
              label={
                isSelected ? (
                  <>
                    <span aria-hidden="true">{item.label}</span>
                    <VisuallyHidden>
                      {t('@astryx.powersearch.mobile.selectedValue', {
                        value: item.label,
                      })}
                    </VisuallyHidden>
                  </>
                ) : (
                  item.label
                )
              }
              startContent={item.icon}
              isSelected={isSelected}
              isDisabled={isDisabled}
              endContent={
                isSelected ? (
                  <Icon icon="check" size="sm" color="accent" />
                ) : undefined
              }
              onClick={() =>
                handleEnumListChange(
                  isSelected
                    ? enumListSelection.filter(value => value !== item.value)
                    : [...enumListSelection, item.value],
                )
              }
            />
          );
        })}
      </List>
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
        maxMenuItems={maxMenuItems}
        timezoneID={timezoneID}
      />
    </div>
  );
}

PowerSearchTouchValueEditor.displayName = 'PowerSearchTouchValueEditor';

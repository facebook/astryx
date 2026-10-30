// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useWheelListbox.ts
 * @input A wheel's label, options, committed value and active row, and its
 *   presentation's three moves: a step, an end, a row
 * @output useWheelListbox: the listbox and option props both wheels share
 *   (ids, ARIA, the keys, a click on a row)
 * @position Internal hook; its two presentations are ScrollWheel (Wheel.tsx,
 *   today's column under a fine pointer) and PickerWheel.tsx (under a finger)
 *
 * A wheel is a listbox, not a novel widget: one tab stop, with Arrow,
 * Page Up/Down, Home and End keys, `aria-activedescendant` on the active row,
 * and every row reachable by a click. The presentation decides what each key
 * and click does to its own column (today's column steps from the row under
 * its band; the touch column from the row it is heading to), so the moves are
 * its own; this hook owns the markup and the key map they share.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/Wheel.tsx
 * - /packages/core/src/DateInput/PickerWheel.tsx
 */

import {useCallback, useId, type KeyboardEvent} from 'react';
import type {WheelOption} from './wheelOptions';

/** Rows a Page Up or Page Down key moves. */
const PAGE_ROWS = 10;

export interface WheelListboxProps {
  /** Accessible name for the column. */
  label: string;
  /** Rows, top to bottom. */
  options: ReadonlyArray<WheelOption>;
  /** Committed value. */
  value: number;
  /** The row `aria-activedescendant` names. */
  activeIndex: number;
  /** An Arrow or Page key: a step of `delta` rows. */
  stepBy: (delta: number) => void;
  /** Home or End. */
  toEnd: (end: 'first' | 'last') => void;
  /** A click on row `index`. */
  activate: (index: number) => void;
}

/**
 * The listbox and option props of one wheel column.
 *
 * @example
 * ```
 * const {listboxProps, optionProps} = useWheelListbox({label, options, value, activeIndex, stepBy, toEnd, activate});
 * <div {...listboxProps}>{options.map((option, index) => <div key={option.value} {...optionProps(option, index)} />)}</div>
 * ```
 */
export function useWheelListbox({
  label,
  options,
  value,
  activeIndex,
  stepBy,
  toEnd,
  activate,
}: WheelListboxProps) {
  const id = useId();
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          stepBy(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          stepBy(-1);
          break;
        case 'PageDown':
          event.preventDefault();
          stepBy(PAGE_ROWS);
          break;
        case 'PageUp':
          event.preventDefault();
          stepBy(-PAGE_ROWS);
          break;
        case 'Home':
          event.preventDefault();
          toEnd('first');
          break;
        case 'End':
          event.preventDefault();
          toEnd('last');
          break;
        default:
          break;
      }
    },
    [stepBy, toEnd],
  );
  return {
    listboxProps: {
      role: 'listbox' as const,
      'aria-label': label,
      'aria-activedescendant': `${id}-${options[activeIndex]?.value}`,
      tabIndex: 0,
      onKeyDown,
    },
    optionProps: (option: WheelOption, index: number) => ({
      id: `${id}-${option.value}`,
      role: 'option' as const,
      'aria-selected': option.value === value,
      'aria-disabled': option.isDisabled || undefined,
      onClick: () => activate(index),
    }),
  };
}

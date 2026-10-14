// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuRadioGroup.tsx
 * @output DropdownMenuRadioGroup — a single-select group of menu items.
 * @position Sub-component; wraps DropdownMenuRadioItem inside a DropdownMenu.
 *
 * Owns single-selection state (value/onChange) for its child
 * DropdownMenuRadioItems and exposes it via context. Renders role="group" with
 * an accessible name so the radios are announced as a set: its `label`, or the
 * visible heading a `title` renders, with the same treatment and theme target
 * as a DropdownMenuGroup's heading. Keyboard navigation comes from the parent
 * DropdownMenu's useListFocus, which matches menuitemradio rows.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenuRadioGroup.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenuGroup.tsx (the heading)
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import {useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {useDevWarning} from '../hooks/useDevWarning';
import type {BaseProps} from '../BaseProps';
import {
  DropdownMenuRadioGroupContext,
  type DropdownMenuRadioGroupContextValue,
} from './DropdownMenuContext';

const styles = stylex.create({
  // Match the menu's own inter-item rhythm (2px) so grouped radio items keep
  // the same gap as ungrouped items instead of sitting flush against each
  // other inside the role="group" wrapper.
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  // The heading a DropdownMenuGroup and a data-mode section draw, so a titled
  // radio set reads like any other titled group in the menu.
  heading: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
});

export interface DropdownMenuRadioGroupProps extends Omit<
  BaseProps,
  'onChange'
> {
  /**
   * The currently selected value in the group. Pass `undefined` when nothing
   * is selected yet.
   */
  value: string | undefined;
  /**
   * Callback fired when the selected value changes.
   */
  onChange: (value: string) => void;
  /**
   * Accessible name for the group, announced by screen readers so the radios
   * read as a named set (e.g. "Sort by"). Applied as the group's `aria-label`.
   * Required unless `title` is given -- an unnamed radio group is an
   * accessibility defect. Pass `aria-labelledby` (via base props) instead if
   * the name already exists as a visible element on the page. With a `title`
   * too, `label` names the group and the title stays a visible heading.
   */
  label?: string;
  /**
   * A visible heading above the radios, with the same treatment as a
   * `DropdownMenuGroup` heading, that names the group (`aria-labelledby`).
   * With a title, `label` is optional. Give a section of a menu that holds one
   * radio set this title rather than wrapping the set in a `DropdownMenuGroup`:
   * the set is then one group with one name.
   */
  title?: ReactNode;
  /**
   * Whether selecting a value closes the menu. Radio items default to closing
   * on selection (a single-choice commit), unlike checkbox items which stay
   * open.
   * @default true
   */
  hasCloseOnSelect?: boolean;
  /**
   * The `DropdownMenuRadioItem`s that make up the group.
   */
  children: ReactNode;
}

/**
 * A single-select group of radio menu items (role="group" of menuitemradio).
 *
 * @example
 * ```
 * import {
 *   DropdownMenuRadioGroup,
 *   DropdownMenuRadioItem,
 * } from '@astryxdesign/core/DropdownMenu';
 * <DropdownMenu button={{label: 'Sort'}}>
 *   <DropdownMenuRadioGroup value={sort} onChange={setSort} title="Sort by">
 *     <DropdownMenuRadioItem value="newest" label="Newest" />
 *     <DropdownMenuRadioItem value="oldest" label="Oldest" />
 *   </DropdownMenuRadioGroup>
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuRadioGroup({
  value,
  onChange,
  label,
  title,
  hasCloseOnSelect = true,
  children,
  xstyle,
  className,
  style,
  ...rest
}: DropdownMenuRadioGroupProps) {
  const contextValue = useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({value, onChange, hasCloseOnSelect}),
    [value, onChange, hasCloseOnSelect],
  );
  const headingId = useId();
  const hasTitle = title != null && title !== '' && title !== false;
  const hasLabel = label != null && label !== '';
  useDevWarning(
    'DropdownMenuRadioGroup',
    'Give the group a label or a title: an unnamed radio group is an accessibility defect.',
    !hasLabel && !hasTitle && rest['aria-labelledby'] == null,
  );

  return (
    <div
      {...rest}
      role="group"
      aria-label={hasLabel ? label : undefined}
      aria-labelledby={
        rest['aria-labelledby'] ??
        (!hasLabel && hasTitle ? headingId : undefined)
      }
      {...mergeProps(stylex.props(styles.group, xstyle), {className, style})}>
      {hasTitle && (
        <div
          id={headingId}
          {...mergeProps(
            themeProps('dropdown-menu-section-heading'),
            stylex.props(styles.heading),
          )}>
          {title}
        </div>
      )}
      <DropdownMenuRadioGroupContext value={contextValue}>
        {children}
      </DropdownMenuRadioGroupContext>
    </div>
  );
}

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

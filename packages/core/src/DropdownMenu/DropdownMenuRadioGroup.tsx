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
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (the menu's
 *   showcase blocks)
 * - /packages/cli/assets/templates/blocks/components/DropdownMenuGroup/DropdownMenuGroupWithSelectable.tsx
 *   (the shipped block that wraps a single radio set in a DropdownMenuGroup)
 */

import {
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
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
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {isRenderable} from '../utils/isRenderable';
import type {BaseProps} from '../BaseProps';
import {
  DropdownMenuRadioGroupContext,
  type DropdownMenuRadioGroupContextValue,
} from './DropdownMenuContext';

/** Text as a name compares it: whitespace collapsed and trimmed. */
function normalizeName(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** The text a mounted heading renders, normalized; null when none is mounted. */
function headingText(heading: HTMLElement | null): string | null {
  return heading == null ? null : normalizeName(heading.textContent ?? '');
}

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
  // A title that renders no text is no title: its heading stays mounted, so it
  // is read again once the title renders text, but shows nothing meanwhile.
  headingWithoutText: {
    display: 'none',
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
   * accessibility defect. A caller's `aria-labelledby` (via base props) that
   * points at visible text becomes the computed name while `label` remains the
   * fallback. With a `title` the title names the group instead, so the name
   * holds the visible heading, and `label` (or a caller's `aria-label`) is
   * ignored, warning in development when it differs from the title's text.
   */
  label?: string;
  /**
   * A visible heading above the radios, with the same treatment as a
   * `DropdownMenuGroup` heading, that names the group (`aria-labelledby`); a
   * caller's `aria-labelledby` is read after it. With a title, `label` is
   * optional. A title that renders no text (`true`, an empty fragment, a
   * component that returns null) counts as no title: no heading shows and the
   * group is named as without one. Give a section of a menu that holds one
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
   * Ref forwarded to the role="group" root.
   */
  ref?: Ref<HTMLDivElement>;
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
  ref,
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
  const headingRef = useRef<HTMLDivElement>(null);
  // A title counts only while it renders text: `true`, an empty fragment or a
  // component that returns null leaves the group named as without one.
  // Whether the heading has text is read from the DOM after each commit of the
  // group, before paint, and again whenever the heading's content changes
  // without the group rendering (a title component's own state, a context or
  // a store); until the first read a given title is taken to name the group,
  // and the naming warnings wait for it.
  const isTitleGiven = isRenderable(title);
  const [measuredTitleText, setMeasuredTitleText] = useState<string | null>(
    null,
  );
  useIsomorphicLayoutEffect(() => {
    const text = headingText(headingRef.current);
    if (text !== measuredTitleText) {
      setMeasuredTitleText(text);
    }
  });
  useIsomorphicLayoutEffect(() => {
    const heading = headingRef.current;
    if (heading == null || typeof MutationObserver === 'undefined') {
      return;
    }
    const observer = new MutationObserver(() => {
      setMeasuredTitleText(headingText(heading));
    });
    observer.observe(heading, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [isTitleGiven]);
  const titleHasText = measuredTitleText !== '';
  const hasTitle = isTitleGiven && titleHasText;
  const isNamingSettled = !isTitleGiven || measuredTitleText != null;
  const callerLabelledBy = rest['aria-labelledby'];
  // Without a title, `label` wins over a caller's own `aria-label`. A visible
  // title always names the group, so the name holds the text a speech-input
  // user reads (the radio-group pattern's label-in-name rule): a caller's
  // `aria-labelledby` is read after it, and `label` or `aria-label` is ignored.
  const ariaLabel = label != null && label !== '' ? label : rest['aria-label'];
  const hasAriaLabel = ariaLabel != null && ariaLabel !== '';
  const isUnnamed = !hasAriaLabel && callerLabelledBy == null;
  useDevWarning(
    'DropdownMenuRadioGroup',
    'Give the group a label or a title: an unnamed radio group is an accessibility defect.',
    !isTitleGiven && isUnnamed,
  );
  useDevWarning(
    'DropdownMenuRadioGroup',
    'The title renders no text, so it does not name the group: give it text, or add a label. An unnamed radio group is an accessibility defect.',
    isTitleGiven && isNamingSettled && !titleHasText && isUnnamed,
  );
  // Compared with the text the heading renders, so `title={<b>Sort by</b>}`
  // beside `label="Sort by"` does not warn.
  useDevWarning(
    'DropdownMenuRadioGroup',
    'The title names the group, so label and aria-label are ignored beside it.',
    isNamingSettled &&
      hasTitle &&
      hasAriaLabel &&
      normalizeName(ariaLabel) !== measuredTitleText,
  );

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={!hasTitle && hasAriaLabel ? ariaLabel : undefined}
      aria-labelledby={
        hasTitle
          ? [headingId, callerLabelledBy].filter(Boolean).join(' ')
          : callerLabelledBy
      }
      {...mergeProps(stylex.props(styles.group, xstyle), {className, style})}>
      {isTitleGiven && (
        <div
          ref={headingRef}
          id={headingId}
          {...mergeProps(
            themeProps('dropdown-menu-section-heading'),
            stylex.props(
              styles.heading,
              !titleHasText && styles.headingWithoutText,
            ),
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenu.tsx
 * @input Uses React, StyleX, usePopover, MenuBottomSheet, Button, List,
 *   useListFocus, and the shared viewport-safe menu-width resolver
 * @output Exports DropdownMenu with caller-selected popover or bottom-sheet
 *   presentation
 * @position Core implementation; consumed by index.ts
 *
 * Supports two modes with a single keyboard/focus path:
 * - **Data-driven**: pass `items` array (converted to components internally)
 * - **Compound-component**: pass JSX children directly
 *
 * Both modes use useListFocus for DOM-based keyboard navigation.
 *
 * Initial focus on open follows the input modality: a keyboard open
 * (Enter / Space / ArrowDown on the trigger) focuses the first enabled item
 * (APG menu-button); a pointer open focuses the menu container itself so no
 * item reads as pre-selected, and the first ArrowDown then moves to item 1.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {usePopoverInternal} from '../Popover/usePopover';
import {Button, type ButtonProps} from '../Button';
import {Divider} from '../Divider';
import {Heading} from '../Heading';
import {Icon, renderIconSlot} from '../Icon';
import {List, ListItem} from '../List';

import {renderDropdownItems} from './renderDropdownItems';
import type {DropdownMenuItemProps} from './DropdownMenuItem';
import {
  MENU_ITEM_ROLES,
  MENU_ITEM_SELECTOR,
  MENU_BOUNDARY_SELECTOR,
} from './menuItemRoles';
import {
  DropdownMenuContext,
  type DropdownMenuContextValue,
} from './DropdownMenuContext';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {useFocusReturnVisibility} from '../hooks/useFocusReturnVisibility';
import {useMenuOverflow} from './useMenuOverflow';
import {resolveMenuWidth} from './menuWidth';
import {
  useAdaptivePresentation,
  type AdaptivePresentation,
} from '../hooks/useAdaptivePresentation';
import {MenuBottomSheet} from './MenuBottomSheet';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import {
  spacingVars,
  colorVars,
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps, rtlStyles} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {
  getInteractionModality,
  trackInteractionModality,
} from '../utils/interactionModality';
import {useTranslator} from '../i18n';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';

const MENU_VIEWPORT_GUTTER = spacingVars['--spacing-4'];
const MENU_MAX_INLINE_SIZE = `calc(100vi - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px)) - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-right, 0px)))`;
const MENU_MAX_INLINE_SIZE_FALLBACK = `calc(100vw - ${MENU_VIEWPORT_GUTTER} - ${MENU_VIEWPORT_GUTTER})`;
const MENU_MAX_BLOCK_SIZE = `min(300px, calc(100dvb - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px)) - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))))`;
const MENU_MAX_BLOCK_SIZE_FALLBACK = `min(300px, calc(100vh - ${MENU_VIEWPORT_GUTTER} - ${MENU_VIEWPORT_GUTTER}))`;
const MENU_POSITION_AREA_MAX_INLINE_SIZE = `calc(100% - max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)))`;
const MENU_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK = `calc(100% - ${MENU_VIEWPORT_GUTTER})`;
const MENU_INLINE_EDGE_GUTTER = `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))`;
const MENU_TRIGGER_OPEN_BACKGROUND = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;

const styles = stylex.create({
  triggerOpen: {
    backgroundImage: MENU_TRIGGER_OPEN_BACKGROUND,
  },
  dropdown: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    // Pointer opens focus this container so subsequent arrow keys and Escape
    // stay owned by the menu. It is an internal focus target, not a control,
    // so suppress the browser ring; keyboard focus moves to an item instead.
    outline: 'none',
    maxInlineSize: stylex.firstThatWorks(
      MENU_MAX_INLINE_SIZE,
      MENU_MAX_INLINE_SIZE_FALLBACK,
    ),
    maxHeight: stylex.firstThatWorks(
      MENU_MAX_BLOCK_SIZE,
      MENU_MAX_BLOCK_SIZE_FALLBACK,
    ),
    '--_dropdown-menu-radius': radiusVars['--radius-container'],
    '--_dropdown-menu-padding': spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-1'],
    borderRadius: 'var(--_dropdown-menu-radius)',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  scrollable: {
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
  },
  popoverViewport: {
    boxSizing: 'border-box',
    maxBlockSize: stylex.firstThatWorks(
      MENU_MAX_BLOCK_SIZE,
      MENU_MAX_BLOCK_SIZE_FALLBACK,
    ),
  },
  popoverViewportAligned: {
    maxInlineSize: stylex.firstThatWorks(
      MENU_POSITION_AREA_MAX_INLINE_SIZE,
      MENU_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  popoverViewportStart: {
    marginInlineEnd: MENU_INLINE_EDGE_GUTTER,
  },
  popoverViewportEnd: {
    marginInlineStart: MENU_INLINE_EDGE_GUTTER,
  },
  popoverViewportBlockStart: {
    marginBlockEnd: `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`,
  },
  popoverViewportBlockEnd: {
    marginBlockStart: `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px))`,
  },
  popoverViewportCentered: {
    marginInlineStart: MENU_INLINE_EDGE_GUTTER,
    marginInlineEnd: MENU_INLINE_EDGE_GUTTER,
    maxInlineSize: stylex.firstThatWorks(
      MENU_MAX_INLINE_SIZE,
      MENU_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  popoverViewportBlockCentered: {
    marginBlockStart: `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px))`,
    marginBlockEnd: `max(${MENU_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`,
    maxInlineSize: stylex.firstThatWorks(
      MENU_MAX_INLINE_SIZE,
      MENU_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  popoverAligned: {
    minWidth: stylex.firstThatWorks(
      `min(anchor-size(width), ${MENU_POSITION_AREA_MAX_INLINE_SIZE})`,
      `min(anchor-size(width), ${MENU_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK})`,
      'anchor-size(width)',
    ),
  },
  popoverCentered: {
    minWidth: stylex.firstThatWorks(
      `min(anchor-size(width), ${MENU_MAX_INLINE_SIZE})`,
      `min(anchor-size(width), ${MENU_MAX_INLINE_SIZE_FALLBACK})`,
      'anchor-size(width)',
    ),
  },
  popoverCustomWidth: (width: string) => ({
    minWidth: width,
  }),
  popoverCustomIntrinsicWidth: (width: string) => ({
    inlineSize: width,
  }),
});

const bottomSheetStyles = stylex.create({
  content: {
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginBottom: spacingVars['--spacing-2'],
  },
  rootHeading: {
    // Match the content edge of a spacious ListItem. Icon-bearing rows place
    // their icon here; rows without an icon place their label here.
    marginInlineStart: spacingVars['--spacing-3'],
  },
  viewHeading: {
    outline: 'none',
  },
  destructiveAction: {
    '--_item-label-color': colorVars['--color-error'],
    '--_item-description-color': colorVars['--color-error'],
    color: colorVars['--color-error'],
  },
  structuralItem: {
    listStyleType: 'none',
  },
  divider: {
    marginBlock: spacingVars['--spacing-1'],
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Types
// =============================================================================

/**
 * Data-mode shape for one menu row.
 *
 * The item fields are sourced from `DropdownMenuItemProps` — data mode renders
 * through `DropdownMenuItem`, so the two APIs describe the same thing and must
 * not drift. Only the fields listed here are part of the data API; add a key to
 * the `Pick` to expose more of the item's props to `items`.
 */
export interface DropdownMenuItemData extends Pick<
  DropdownMenuItemProps,
  | 'icon'
  | 'onClick'
  | 'isDisabled'
  | 'variant'
  | 'description'
  | 'endContent'
  | 'hasCloseOnSelect'
> {
  /**
   * Stable identity for the row, used as its React key (as on
   * `TreeListItemData`). Omit it and the row is keyed by position, which is
   * correct for a fixed menu; set it when `items` can reorder, filter, or grow,
   * so a row keeps its DOM node — and therefore keyboard focus — as the array
   * changes around it.
   */
  id?: string;
  /** Primary label content. */
  label: ReactNode;
  /**
   * Nested submenu entries. When present, this row becomes a submenu (a
   * flyout revealing `items`) instead of a leaf action — no separate item
   * "type" is needed. Data-mode parity for the compound DropdownMenuSubMenu API.
   */
  items?: DropdownMenuOption[];
}

/**
 * Data-mode shape for a divider row. The compound-mode peer is the
 * `DropdownMenuDivider` component, which both modes render.
 */
export interface DropdownMenuDividerData {
  type: 'divider';
}

export interface DropdownMenuSection {
  type: 'section';
  /** Stable identity for the group; see {@link DropdownMenuItemData.id}. */
  id?: string;
  title?: string;
  items: DropdownMenuItemData[];
}

export type DropdownMenuOption =
  DropdownMenuItemData | DropdownMenuDividerData | DropdownMenuSection;

// =============================================================================
// Props
// =============================================================================

export type DropdownMenuButtonProps = Omit<ButtonProps, 'onClick'>;

export type DropdownMenuPresentation = AdaptivePresentation;

interface DropdownMenuBaseProps extends BaseProps {
  button?: DropdownMenuButtonProps;
  isMenuOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Minimum popover width. The menu may grow for its content but is capped to
   * the available viewport space. Ignored by bottom-sheet presentation.
   * Defaults to the trigger width.
   */
  menuWidth?: number | string;
  onClick?: () => void;
  hasChevron?: boolean;
  /**
   * Popover position relative to the trigger. Ignored by bottom-sheet
   * presentation.
   * Uses the same placement values as other Astryx layer-based components.
   * @default 'below'
   */
  placement?: LayerPlacement;

  /**
   * Popover alignment along the placement axis. Ignored by bottom-sheet
   * presentation.
   * Uses the same alignment values as other Astryx layer-based components.
   * @default 'start'
   */
  alignment?: LayerAlignment;

  'data-testid'?: string;
}

interface DropdownMenuDataProps extends DropdownMenuBaseProps {
  /**
   * Surface used to present the actions. Pass a value selected by product
   * policy (for example, a compact-touch media query) when the presentation
   * should adapt. Bottom-sheet presentation is intended for short action sets.
   * @default 'popover'
   */
  presentation?: DropdownMenuPresentation;
  items: DropdownMenuOption[];
  children?: undefined;
}

interface DropdownMenuCompoundProps extends DropdownMenuBaseProps {
  presentation?: 'popover';
  items?: undefined;
  children: ReactNode;
}

export type DropdownMenuProps =
  DropdownMenuDataProps | DropdownMenuCompoundProps;

// =============================================================================
// DropdownMenu
// =============================================================================

/**
 * A dropdown menu component that displays a list of actionable items.
 *
 * Supports two modes:
 * - **Data-driven**: pass `items` and choose either the default anchored
 *   popover or the modal bottom-sheet presentation.
 * - **Compound-component**: pass JSX children for dynamic, stateful, or
 *   lazy-loaded anchored popover menus.
 *
 * @example
 * ```
 * <DropdownMenu
 *   button={{ label: 'Actions' }}
 *   presentation={useBottomSheet ? 'bottom-sheet' : 'popover'}
 *   items={[
 *     { label: 'Edit', onClick: () => handleEdit() },
 *     { label: 'Delete', onClick: () => handleDelete() },
 *   ]}
 * />
 * ```
 */
// When the consumer doesn't pass `button`, the default label is looked up
// at render time so it respects the active InternationalizationProvider
// locale.
const DEFAULT_BUTTON_I18N_KEY = '@astryx.dropdownMenu.label' as const;

function getBottomSheetItemKey(
  item: DropdownMenuItemData,
  index: number,
): string {
  return `item-${item.id ?? index}`;
}

function BottomSheetActionList({
  items,
  onSelect,
  onOpenSubmenu,
}: {
  items: DropdownMenuOption[];
  onSelect: (item: DropdownMenuItemData) => void;
  onOpenSubmenu: (item: DropdownMenuItemData) => void;
}) {
  const renderItem = (item: DropdownMenuItemData, index: number) => {
    const isSubmenu = item.items != null && item.items.length > 0;
    const isDestructive = item.variant === 'destructive';

    return (
      <ListItem
        key={getBottomSheetItemKey(item, index)}
        label={item.label}
        description={item.description}
        startContent={
          item.icon
            ? renderIconSlot(item.icon, {
                size: 'sm',
                color: isDestructive ? 'error' : 'secondary',
              })
            : undefined
        }
        endContent={
          isSubmenu ? (
            <Icon
              icon="chevronRight"
              size="sm"
              color="secondary"
              xstyle={rtlStyles.mirror}
            />
          ) : (
            item.endContent
          )
        }
        isDisabled={item.isDisabled}
        onClick={event => {
          // A touch selection can satisfy :focus-visible in Safari. Clear the
          // row before the sheet closes so it never appears keyboard-focused.
          if (getInteractionModality() === 'pointer') {
            (event.currentTarget as HTMLElement).blur();
          }
          if (isSubmenu) {
            onOpenSubmenu(item);
          } else {
            onSelect(item);
          }
        }}
        xstyle={isDestructive && bottomSheetStyles.destructiveAction}
      />
    );
  };

  return (
    <List density="spacious">
      {items.map((option, index) => {
        if ('type' in option && option.type === 'divider') {
          return (
            <li
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`divider-${index}`}
              role="presentation"
              {...stylex.props(bottomSheetStyles.structuralItem)}>
              <Divider xstyle={bottomSheetStyles.divider} />
            </li>
          );
        }

        if ('type' in option && option.type === 'section') {
          return (
            <li
              key={`section-${option.id ?? index}`}
              role="presentation"
              {...stylex.props(bottomSheetStyles.structuralItem)}>
              <div
                role="group"
                aria-label={option.title}
                {...stylex.props(bottomSheetStyles.section)}>
                {option.title && <Heading level={4}>{option.title}</Heading>}
                <List density="spacious">{option.items.map(renderItem)}</List>
              </div>
            </li>
          );
        }

        return renderItem(option, index);
      })}
    </List>
  );
}

function DropdownMenuBottomSheet({
  button: buttonFromProps,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  onClick,
  hasChevron = true,
  items,
  presentation: _presentation,
  menuWidth: _menuWidth,
  placement: _placement,
  alignment: _alignment,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...rest
}: DropdownMenuDataProps & {presentation: 'bottom-sheet'}) {
  const t = useTranslator();
  const button = buttonFromProps ?? {label: t(DEFAULT_BUTTON_I18N_KEY)};
  const backLabel = t('@astryx.dropdownMenu.back');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const actionListRef = useRef<HTMLDivElement>(null);
  const openModalityRef = useRef<'keyboard' | 'pointer'>('pointer');
  const {
    isFocusRingSuppressed,
    onFocusReturnTargetFocus,
    prepareFocusReturn,
    resetFocusReturn,
  } = useFocusReturnVisibility();
  const viewHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousSubmenuDepthRef = useRef(0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [submenuPath, setSubmenuPath] = useState<DropdownMenuItemData[]>([]);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);
  if (previousIsOpen !== isOpen) {
    setPreviousIsOpen(isOpen);
    if (!isOpen && submenuPath.length > 0) {
      setSubmenuPath([]);
    }
  }
  const currentSubmenu = submenuPath.at(-1);
  const currentItems = currentSubmenu?.items ?? items;
  const currentTitle = currentSubmenu?.label ?? button.label;
  const sheetLabel =
    typeof currentTitle === 'string' ? currentTitle : button.label;

  const setOpen = useCallback(
    (nextIsOpen: boolean) => {
      if (!nextIsOpen) {
        setSubmenuPath([]);
        prepareFocusReturn();
      } else {
        resetFocusReturn();
      }
      onOpenChange?.(nextIsOpen);
      if (!isControlled) {
        setInternalIsOpen(nextIsOpen);
      }
    },
    [isControlled, onOpenChange, prepareFocusReturn, resetFocusReturn],
  );

  const handleSelect = useCallback(
    (item: DropdownMenuItemData) => {
      if (item.isDisabled) {
        return;
      }
      item.onClick?.();
      if (item.hasCloseOnSelect !== false) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  const isIconOnly = button.isIconOnly === true;
  const resolvedEndContent =
    button.endContent ??
    (hasChevron && !isIconOnly ? (
      <Icon icon="chevronDown" size="sm" color="inherit" />
    ) : undefined);

  useEffect(() => {
    if (!isOpen || openModalityRef.current !== 'keyboard') {
      return;
    }
    const frame = requestAnimationFrame(() => {
      actionListRef.current
        ?.querySelector<HTMLElement>('button:not(:disabled), a[href]')
        ?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [currentItems, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previousSubmenuDepthRef.current = 0;
      return;
    }
    if (submenuPath.length === previousSubmenuDepthRef.current) {
      return;
    }
    previousSubmenuDepthRef.current = submenuPath.length;
    const frame = requestAnimationFrame(() => {
      viewHeadingRef.current?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, submenuPath.length]);

  return (
    <>
      <Button
        {...button}
        ref={buttonRef}
        xstyle={[
          isOpen && styles.triggerOpen,
          button.xstyle,
          isFocusRingSuppressed && focusOutlineStyles.suppressed,
        ]}
        tooltip={isOpen ? undefined : button.tooltip}
        endContent={resolvedEndContent}
        onPointerDown={event => {
          button.onPointerDown?.(event);
          openModalityRef.current = 'pointer';
        }}
        onKeyDown={event => {
          button.onKeyDown?.(event);
          if (
            event.key === 'ArrowDown' ||
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            openModalityRef.current = 'keyboard';
          }
        }}
        onFocus={event => {
          button.onFocus?.(event);
          onFocusReturnTargetFocus();
        }}
        onClick={() => {
          onClick?.();
          setOpen(!isOpen);
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-testid={testId}
      />

      <MenuBottomSheet
        isOpen={isOpen}
        onOpenChange={setOpen}
        finalFocusRef={buttonRef}
        label={sheetLabel}>
        <div
          ref={actionListRef}
          {...rest}
          {...mergeProps(
            themeProps('dropdown-menu', {presentation: 'bottom-sheet'}),
            stylex.props(bottomSheetStyles.content, xstyle),
            className,
            style,
          )}>
          <div {...stylex.props(bottomSheetStyles.header)}>
            {submenuPath.length > 0 && (
              <Button
                label={backLabel}
                variant="ghost"
                size="sm"
                icon={
                  <Icon
                    icon="chevronLeft"
                    size="sm"
                    xstyle={rtlStyles.mirror}
                  />
                }
                isIconOnly
                onClick={() => setSubmenuPath(path => path.slice(0, -1))}
              />
            )}
            <Heading
              ref={viewHeadingRef}
              level={3}
              tabIndex={-1}
              xstyle={[
                bottomSheetStyles.viewHeading,
                submenuPath.length === 0 && bottomSheetStyles.rootHeading,
              ]}>
              {currentTitle}
            </Heading>
          </div>
          <BottomSheetActionList
            items={currentItems}
            onSelect={handleSelect}
            onOpenSubmenu={item => setSubmenuPath(path => [...path, item])}
          />
        </div>
      </MenuBottomSheet>
    </>
  );
}

function DropdownMenuPopover({
  button: buttonFromProps,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  menuWidth,
  onClick,
  hasChevron = true,
  placement = 'below',
  alignment = 'start',
  presentation: _presentation,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}: DropdownMenuProps) {
  const t = useTranslator();
  const button = buttonFromProps ?? {label: t(DEFAULT_BUTTON_I18N_KEY)};

  const items = ('items' in props ? props.items : undefined) ?? [];
  const children = props.children;

  // Extract BaseProps pass-throughs (aria-*, id, event handlers) from the
  // discriminated-union rest bag so they can be forwarded to the menu element.
  const {
    items: _items,
    children: _children,
    ...rest
  } = props as Record<string, unknown>;

  const menuId = useId();
  const menuSize = button.size ?? 'md';
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Open state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    trackInteractionModality();
  }, []);

  // Keyboard dismissal returns focus to the trigger. Pointer dismissal leaves
  // focus where the browser put it; Safari can otherwise paint a focus-visible
  // ring on the trigger after a touch selection. Native popover restoration
  // can happen before `toggle`, so explicitly blur that pointer-restored case.
  const handleLayerHide = useCallback(() => {
    onOpenChange?.(false);
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    const trigger = buttonRef.current;
    if (getInteractionModality() === 'keyboard') {
      trigger?.focus();
    } else if (document.activeElement === trigger) {
      trigger?.blur();
    }
  }, [isControlled, onOpenChange]);

  // Defer item focus until the layer has committed open, so focus restore
  // captures the trigger instead of the first menu item.
  const shouldFocusOnOpenRef = useRef(false);

  // How the next open was initiated. Keyboard (and programmatic) opens focus
  // the first enabled item per the APG menu-button pattern; pointer opens
  // focus the menu container instead, so no item is visually highlighted as
  // if pre-selected (#4477). Reset to 'keyboard' after every open so
  // programmatic controlled opens keep the item-focus behavior.
  const openModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');

  const handleLayerShow = useCallback(() => {
    onOpenChange?.(true);
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  }, [isControlled, onOpenChange]);

  const popover = usePopoverInternal({
    onHide: handleLayerHide,
    onShow: handleLayerShow,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="menu" is the exposed semantics; wrapping it in a
    // modal dialog would announce an unnamed dialog around the menu.
    role: 'none',
  });

  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  // Single keyboard navigation path for both modes.
  // The selector matches plain items plus selectable items
  // (menuitemradio/menuitemcheckbox) so lab checkbox/radio rows are reachable
  // and roved to alongside plain items — not just role="menuitem".
  const {
    listRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
    focusItem,
    ownsEvent,
    getItems: getMenuItems,
  } = useListFocus<HTMLDivElement>({
    itemSelector: MENU_ITEM_SELECTOR,
    boundarySelector: MENU_BOUNDARY_SELECTOR,
    wrap: false,
    onEscape: closeMenu,
  });

  // First-character typeahead over the (enabled) menu items — jump to the next
  // item whose label starts with the typed text (menus-11). Reuses the hook's
  // scoped item collection so an inline submenu flyout's items aren't swept in.
  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getMenuItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
  });

  // Sync controlled open state → popover.
  useEffect(() => {
    if (isControlled) {
      if (controlledIsOpen && !popover.isOpen) {
        shouldFocusOnOpenRef.current = true;
        popover.show();
      } else if (!controlledIsOpen && popover.isOpen) {
        popover.hide();
      }
    }
  }, [controlledIsOpen, isControlled, popover]);

  // Move focus into the menu only after the layer has committed open,
  // honoring the input modality: keyboard (and programmatic) opens land on
  // the first enabled item per the APG menu-button pattern; pointer opens
  // focus the menu container itself (tabIndex={-1}) so no item is
  // highlighted as if pre-selected (#4477). Container focus keeps arrows,
  // typeahead, Escape and Tab in the menu's onKeyDown, and is also the
  // fallback when no item is focusable (e.g. all disabled), mirroring the
  // submenu flyout fallback.
  useEffect(() => {
    if (!popover.isOpen || !shouldFocusOnOpenRef.current) {
      return;
    }
    shouldFocusOnOpenRef.current = false;
    requestAnimationFrame(() => {
      if (openModalityRef.current === 'pointer' || !focusFirst()) {
        listRef.current?.focus();
      }
      openModalityRef.current = 'keyboard';
    });
  }, [popover.isOpen, focusFirst, listRef]);

  // Extend useListFocus with Enter/Space activation + typeahead
  const listKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // A submenu flyout renders inline inside this menu; its key events bubble
      // up here. Let that level own them — only handle events from this level.
      if (!ownsEvent(e)) {
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const focused = document.activeElement as HTMLElement | null;
        if (
          focused &&
          MENU_ITEM_ROLES.has(focused.getAttribute('role') ?? '')
        ) {
          focused.click();
        }
        return;
      }
      // APG menu-button pattern: Tab closes the menu. Menu items are
      // tabIndex={-1} so the focus trap has nothing trappable and Tab would
      // otherwise leak into the page while the menu stayed open (menus-5).
      // Do NOT preventDefault — closing restores focus to the trigger, and the
      // browser's default Tab then continues from there to the next element.
      if (e.key === 'Tab') {
        closeMenu();
        return;
      }
      // Type-to-focus next; if it consumed a printable key, stop here.
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      listNavKeyDown(e);
    },
    [listNavKeyDown, closeMenu, typeahead, ownsEvent],
  );

  const openAndFocus = useCallback(
    (modality: 'keyboard' | 'pointer' = 'keyboard') => {
      openModalityRef.current = modality;
      shouldFocusOnOpenRef.current = true;
      popover.show();
    },
    [popover],
  );

  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // The click that light-dismissed the menu is not a request to reopen it.
      if (popover.wasJustDismissed()) {
        return;
      }
      onClick?.();
      // detail === 0 marks a synthesized click (screen reader / AT
      // activation): treat it as keyboard so those users still land on the
      // first item. Real pointer clicks report detail >= 1.
      const modality = e.detail === 0 ? 'keyboard' : 'pointer';
      if (isControlled) {
        if (!controlledIsOpen) {
          openModalityRef.current = modality;
        }
        onOpenChange?.(!controlledIsOpen);
      } else {
        if (popover.isOpen) {
          popover.hide();
        } else {
          openAndFocus(modality);
        }
      }
    },
    [
      onClick,
      isControlled,
      onOpenChange,
      controlledIsOpen,
      popover,
      openAndFocus,
    ],
  );

  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!popover.isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAndFocus();
        }
      }
      // When open, key events go to the menu container via useListFocus
    },
    [popover.isOpen, openAndFocus],
  );

  // Icon-only
  const isIconOnly = button.isIconOnly === true;
  const resolvedEndContent =
    button.endContent ??
    (hasChevron && !isIconOnly ? (
      <Icon icon="chevronDown" size="sm" color="inherit" />
    ) : undefined);

  const requestedWidthLimit =
    alignment === 'center'
      ? MENU_MAX_INLINE_SIZE_FALLBACK
      : MENU_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK;
  const resolvedMenuWidth = menuWidth
    ? resolveMenuWidth(menuWidth, requestedWidthLimit)
    : null;
  const popoverXstyle = resolvedMenuWidth
    ? resolvedMenuWidth.property === 'inlineSize'
      ? styles.popoverCustomIntrinsicWidth(resolvedMenuWidth.value)
      : styles.popoverCustomWidth(resolvedMenuWidth.value)
    : alignment === 'center'
      ? styles.popoverCentered
      : styles.popoverAligned;
  const isSidePlacement = placement === 'start' || placement === 'end';
  // Context for compound items
  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({closeMenu, menuSize}),
    [closeMenu, menuSize],
  );

  // Resolve menu content: data-driven items become components
  const menuContent =
    props.items !== undefined ? renderDropdownItems(items) : children;
  const hasOverflow = useMenuOverflow(listRef, menuContent, popover.isOpen);

  return (
    <>
      <Button
        {...button}
        ref={el => {
          buttonRef.current = el;
          popover.triggerRef(el);
          const consumerRef = button.ref;
          if (typeof consumerRef === 'function') {
            consumerRef(el);
          } else if (consumerRef) {
            /* eslint-disable react-compiler/react-compiler -- ref callback: forwarding consumer ref object */
            consumerRef.current = el;
            /* eslint-enable react-compiler/react-compiler */
          }
        }}
        xstyle={[isOpen && styles.triggerOpen, button.xstyle]}
        tooltip={isOpen ? undefined : button.tooltip}
        endContent={resolvedEndContent}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        data-testid={testId}
      />

      {popover.render(
        <div
          {...rest}
          ref={listRef}
          id={menuId}
          role="menu"
          // Pointer opens focus the container so arrows, typeahead, Escape and
          // Tab remain owned by the menu without pre-highlighting an item.
          // An overflowing menu joins the Tab order so its scrollable region is
          // keyboard-accessible; Tab still dismisses through listKeyDown.
          tabIndex={hasOverflow ? 0 : -1}
          // Give the menu an accessible name from its trigger's label, so
          // screen readers announce e.g. "Actions menu" rather than an unnamed
          // menu (menus-13).
          aria-label={button.label}
          onKeyDown={listKeyDown}
          {...mergeProps(
            themeProps('dropdown-menu'),
            stylex.props(
              styles.dropdown,
              hasOverflow && styles.scrollable,
              xstyle,
            ),
            className,
            style,
          )}>
          <DropdownMenuContext value={contextValue}>
            {menuContent}
          </DropdownMenuContext>
        </div>,
        {
          placement,
          alignment,
          offset: spacingVars['--spacing-1'],
          xstyle: [
            styles.popoverViewport,
            alignment === 'center'
              ? isSidePlacement
                ? styles.popoverViewportBlockCentered
                : styles.popoverViewportCentered
              : [
                  styles.popoverViewportAligned,
                  isSidePlacement
                    ? alignment === 'start'
                      ? styles.popoverViewportBlockStart
                      : styles.popoverViewportBlockEnd
                    : alignment === 'start'
                      ? styles.popoverViewportStart
                      : styles.popoverViewportEnd,
                ],
            popoverXstyle,
            layerAnimations[placement],
          ],
        },
      )}
    </>
  );
}

export function DropdownMenu(props: DropdownMenuProps) {
  const {onOpenChange} = props;
  const requestedPresentation =
    'items' in props ? (props.presentation ?? 'popover') : 'popover';
  const resolvedPresentation = useAdaptivePresentation(requestedPresentation);
  const isControlled = props.isMenuOpen !== undefined;
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isControlled ? props.isMenuOpen : internalIsOpen;
  const handleOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      onOpenChange?.(nextIsOpen);
      if (!isControlled) {
        setInternalIsOpen(nextIsOpen);
      }
    },
    [isControlled, onOpenChange],
  );
  const sharedProps = {
    ...props,
    isMenuOpen: isOpen,
    onOpenChange: handleOpenChange,
  };

  if (
    resolvedPresentation === 'bottom-sheet' &&
    'items' in props &&
    props.items !== undefined
  ) {
    return (
      <DropdownMenuBottomSheet
        {...(sharedProps as DropdownMenuDataProps)}
        presentation="bottom-sheet"
      />
    );
  }

  return <DropdownMenuPopover {...sharedProps} presentation="popover" />;
}

DropdownMenu.displayName = 'DropdownMenu';

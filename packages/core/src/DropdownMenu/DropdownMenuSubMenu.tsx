// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuSubMenu.tsx
 * @input React, stylex, useLayer (context mode), useListFocus, useMenuHover,
 *   useTypeahead, Item, Icon, Spinner, DropdownMenu context + item roles.
 * @output Exports DropdownMenuSubMenu — a single menu row that reveals a nested
 *   flyout menu of its own children/items.
 * @position Sub-component; place inside a DropdownMenu (or ContextMenu)
 *   alongside plain items.
 *
 * One component, not three. The row itself adopts DropdownMenuItem semantics
 * (label / icon / description / isDisabled) and its children become the
 * flyout's content. This mirrors how SideNavItem / TreeListItem promote a
 * normal row into a nested surface when given children, rather than the Radix
 * Sub / SubTrigger / SubContent split. Data-driven menus never touch this
 * component directly — renderDropdownItems renders it from a nested `items`
 * array and passes the rendered children in.
 *
 * Built on existing primitives — no bespoke floating code:
 * - Positioning: useLayer context mode opens the flyout inline-end with
 *   viewport auto-flip via CSS anchor positioning (RTL-correct by default).
 * - Pointer: useMenuHover for open/close intent.
 * - Keyboard: a per-level useListFocus + useTypeahead. Right (Left in RTL) /
 *   Enter / Space opens the flyout and focuses its first item; Left (Right in
 *   RTL) / Escape closes it and returns focus to the trigger row.
 *
 * Prior art: legacy internal XDS `XDSDropdownSubMenuItem` (APG menubar-
 * navigation submenu). This re-expresses the same contract on Astryx primitives.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenuSubMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenuSubMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {Spinner} from '../Spinner';
import {Item} from '../Item';
import {useLayer} from '../Layer/useLayer';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {useListFocus} from '../hooks/useListFocus';
import {useMenuHover} from '../hooks/useMenuHover';
import {useTypeahead} from '../hooks/useTypeahead';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import type {BaseProps} from '../BaseProps';
import {
  MENU_ITEM_ROLES,
  MENU_ITEM_SELECTOR,
  MENU_BOUNDARY_SELECTOR,
} from './menuItemRoles';
import {
  DropdownMenuContext,
  useDropdownMenuContext,
  type DropdownMenuContextValue,
} from './DropdownMenuContext';
import {focusMenuItemOnHover} from './menuItemHover';

const triggerStyles = stylex.create({
  root: {
    boxSizing: 'border-box',
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: `max(0px, calc(var(--_dropdown-menu-radius, ${spacingVars['--spacing-2']}) - var(--_dropdown-menu-padding, ${spacingVars['--spacing-1']})))`,
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    backgroundColor: {
      default: 'transparent',
      ':focus': colorVars['--color-overlay-hover'],
    },
    border: 'none',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    textAlign: 'start',
    outline: 'none',
  },
  // While the flyout is open, keep the trigger visibly active so the open
  // branch reads as the current path even when focus has moved into the child.
  open: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  disabled: {
    opacity: 0.5,
    cursor: 'default',
  },
  caret: {
    display: 'flex',
    alignItems: 'center',
  },
});

const triggerSizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    paddingBlock: spacingVars['--spacing-1-5'],
  },
  lg: {},
});

const flyoutStyles = stylex.create({
  menu: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    maxHeight: '300px',
    overflowY: 'auto',
    '--_dropdown-menu-radius': radiusVars['--radius-container'],
    '--_dropdown-menu-padding': spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-1'],
    borderRadius: 'var(--_dropdown-menu-radius)',
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: shadowVars['--shadow-low'],
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  popover: {
    minWidth: '160px',
  },
  popoverCustomWidth: (width: string | number) => ({
    minWidth: typeof width === 'number' ? `${width}px` : width,
  }),
});

interface DropdownMenuSubMenuBaseProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  /** Icon to display before the label on the trigger row. */
  icon?: ReactNode | IconType;
  /** Primary label text for the trigger row. */
  label: ReactNode;
  /** Secondary description text displayed below the label. */
  description?: ReactNode;
  /**
   * Whether the submenu is disabled. A disabled submenu renders its trigger
   * row but never opens the flyout.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Show a spinner in place of the caret, e.g. while a lazy submenu's children
   * are loading. Ported from the legacy `hasSpinner` async-submenu affordance.
   * @default false
   */
  hasSpinner?: boolean;
  /** Fixed flyout width. Defaults to sizing to its content (min 160px). */
  menuWidth?: number | string;
  /** Called when the flyout opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Test id for the trigger row. */
  'data-testid'?: string;
  /** Test id for the flyout menu. */
  menuDataTestId?: string;
}

export interface DropdownMenuSubMenuProps extends DropdownMenuSubMenuBaseProps {
  /**
   * The flyout's menu items — the same components used at the top level
   * (`DropdownMenuItem`, `DropdownMenuSubMenu`, selectable items, etc.).
   *
   * Data-mode parity lives one level up: give a `DropdownMenu`/`ContextMenu`
   * item a nested `items` array and it renders a `DropdownMenuSubMenu` with
   * these children automatically — so the data path never has to reach into
   * this component.
   */
  children: ReactNode;
}

/**
 * A single menu row that reveals a nested flyout of its own items. The row
 * adopts DropdownMenuItem semantics (label / icon / description / isDisabled);
 * its `children` become the flyout content. Place inside a DropdownMenu (or
 * ContextMenu) alongside plain items.
 *
 * For data-driven menus, don't use this directly — give a menu item a nested
 * `items` array and DropdownMenu/ContextMenu renders the submenu for you.
 *
 * @example
 * ```
 * <DropdownMenu button={{label: 'Actions'}}>
 *   <DropdownMenuItem label="Rename" onClick={rename} />
 *   <DropdownMenuSubMenu label="Move to" icon="folder">
 *     <DropdownMenuItem label="Folder A" onClick={() => move('a')} />
 *     <DropdownMenuItem label="Folder B" onClick={() => move('b')} />
 *   </DropdownMenuSubMenu>
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuSubMenu(
  props: DropdownMenuSubMenuProps,
): ReactNode {
  const {
    icon,
    label,
    description,
    isDisabled = false,
    hasSpinner = false,
    menuWidth,
    onOpenChange,
    children,
    xstyle,
    className,
    style,
    'data-testid': testId,
    menuDataTestId,
  } = props;

  const menuCtx = useDropdownMenuContext();
  const menuSize = menuCtx?.menuSize ?? 'md';
  const canOpen = !isDisabled;

  const contentId = useId();
  const triggerId = useId();
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const layer = useLayer({
    mode: 'context',
    lightDismiss: false,
    onShow: useCallback(() => {
      setIsOpen(true);
      onOpenChange?.(true);
    }, [onOpenChange]),
    onHide: useCallback(() => {
      setIsOpen(false);
      onOpenChange?.(false);
    }, [onOpenChange]),
  });

  const showLayer = useCallback(() => {
    if (canOpen) {
      layer.show();
    }
  }, [canOpen, layer]);
  const hideLayer = useCallback(() => {
    layer.hide();
  }, [layer]);

  // Dedicated roving-focus + typeahead for this flyout level. The boundary
  // selector scopes item collection and key handling to this flyout's own
  // `role="menu"` — so a submenu nested inside this one (also inline, also
  // `role="menu"`) doesn't pollute this level's items or double-handle keys.
  const {
    listRef: menuRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
    focusItem,
    ownsEvent,
    getItems,
  } = useListFocus<HTMLDivElement>({
    itemSelector: MENU_ITEM_SELECTOR,
    boundarySelector: MENU_BOUNDARY_SELECTOR,
    wrap: false,
    onEscape: () => close({focusTrigger: true}),
  });

  const typeahead = useTypeahead({
    getItemLabels: () => getItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
  });

  // Hover-intent: entering the trigger opens after a short delay; leaving
  // either surface closes after a delay. Hover-open does not steal focus.
  // Hover intent and the shared hover→click guard only: this level owns its own
  // click handling, roving focus and typeahead. popover="manual", so the
  // invoker wiring other consumers need does not apply.
  const {triggerProps, contentProps, confirmHoverOpen} =
    useMenuHover<HTMLDivElement>({
      show: showLayer,
      hide: hideLayer,
      isOpen,
      isEnabled: canOpen,
    });

  const open = useCallback(
    (options?: {focusFirst?: boolean}) => {
      if (!canOpen) {
        return;
      }
      layer.show();
      if (options?.focusFirst) {
        // Synchronous by design — see the focus note in useMenuHover. A
        // still-loading flyout has no focusable item, so fall back to the
        // container: keyboard ownership must leave the parent list either way.
        if (!focusFirst()) {
          menuRef.current?.focus();
        }
      }
    },
    [canOpen, layer, focusFirst, menuRef],
  );

  const close = useCallback(
    (options?: {focusTrigger?: boolean}) => {
      layer.hide();
      if (options?.focusTrigger !== false) {
        triggerRef.current?.focus();
      }
    },
    [layer],
  );

  // Single ref for the trigger row: store it for focus management AND wire it
  // as the flyout's positioning anchor (CSS anchor positioning).
  const setTriggerEl = useCallback(
    (el: HTMLDivElement | null) => {
      triggerRef.current = el;
      layer.ref(el);
    },
    [layer],
  );

  const handleTriggerClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    // Toggles, except for the click that follows a hover-open (#3121).
    if (isOpen) {
      if (confirmHoverOpen()) {
        if (!focusFirst()) {
          menuRef.current?.focus();
        }
        return;
      }
      close({focusTrigger: true});
    } else {
      open({focusFirst: true});
    }
  }, [isDisabled, isOpen, open, close, confirmHoverOpen, focusFirst, menuRef]);

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isDisabled) {
        return;
      }
      const isRtl =
        typeof window !== 'undefined' && triggerRef.current
          ? window.getComputedStyle(triggerRef.current).direction === 'rtl'
          : false;
      const openKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
      if (e.key === openKey || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // The trigger row is a direct child of the parent menu (not a nested
        // role="menu"), so the parent's key handler would otherwise also act on
        // this event (e.g. Enter clicking the focused row). Stop it here — this
        // level fully handles opening the flyout.
        e.stopPropagation();
        open({focusFirst: true});
      }
    },
    [isDisabled, open],
  );

  // Move the single focus-driven highlight onto the trigger as the pointer
  // enters it, so a sibling item that still holds focus doesn't stay
  // highlighted alongside the hovered trigger. This is separate from the
  // hover-open intent (onMouseEnter/onMouseLeave) — the flyout still opens on
  // the hover delay; this only keeps the highlight single.
  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => focusMenuItemOnHover(e, isDisabled),
    [isDisabled],
  );

  // Enter/Space activate the focused row; typeahead jumps by first character;
  // the close key (Left, or Right in RTL) returns focus to the trigger;
  // arrows/Home/End defer to useListFocus (RTL-aware).
  //
  // The flyout renders inline (useLayer context mode is a native popover, not a
  // portal), so a submenu nested inside this one bubbles its key events up to
  // this handler. `ownsEvent` (from useListFocus, scoped by boundarySelector)
  // tells us whether the event originated in THIS flyout or a deeper one; we
  // only act on our own, letting the deeper level keep ownership. No manual
  // stopPropagation needed — each level self-filters.
  const handleContentKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!ownsEvent(e)) {
        return;
      }
      // Escape closes just this submenu and returns focus to its trigger (APG:
      // Escape collapses the current level, not the whole stack). The root
      // popover's focus-trap listens for Escape at the document level and bails
      // when the event is already handled, so we mark it handled here (stop
      // propagation + preventDefault) to keep the parent menu open.
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close({focusTrigger: true});
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
      const isRtl =
        typeof window !== 'undefined' && menuRef.current
          ? window.getComputedStyle(menuRef.current).direction === 'rtl'
          : false;
      const closeKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === closeKey) {
        e.preventDefault();
        close({focusTrigger: true});
        return;
      }
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      listNavKeyDown(e);
    },
    [ownsEvent, close, listNavKeyDown, typeahead, menuRef],
  );

  // Re-provide the menu context so nested items behave exactly like top-level
  // ones. Selecting a leaf item must dismiss the WHOLE stack, not just this
  // flyout: close this level (without stealing focus back to the trigger) and
  // propagate up via the parent menu's closeMenu. Because every level
  // re-provides the context, this chains from the deepest flyout all the way to
  // the root DropdownMenu (whose closeMenu hides the popover).
  const nestedMenuContext = useMemo<DropdownMenuContextValue>(
    () => ({
      menuSize,
      closeMenu: () => {
        close({focusTrigger: false});
        menuCtx?.closeMenu();
      },
    }),
    [menuSize, close, menuCtx],
  );

  const endAffordance = hasSpinner ? (
    <span {...stylex.props(triggerStyles.caret)}>
      <Spinner size="sm" />
    </span>
  ) : (
    <span {...stylex.props(triggerStyles.caret)}>
      <Icon
        icon="chevronRight"
        size="sm"
        color="secondary"
        {...themeProps('dropdown-menu-indicator-icon')}
      />
    </span>
  );

  const popoverXstyle = menuWidth
    ? flyoutStyles.popoverCustomWidth(menuWidth)
    : flyoutStyles.popover;

  return (
    <>
      <Item
        ref={el => setTriggerEl(el as HTMLDivElement | null)}
        id={triggerId}
        role="menuitem"
        tabIndex={isDisabled ? undefined : -1}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        aria-disabled={isDisabled || undefined}
        data-testid={testId}
        onMouseEnter={triggerProps.onMouseEnter}
        onMouseLeave={triggerProps.onMouseLeave}
        onPointerMove={handlePointerMove}
        startContent={
          icon
            ? renderIconSlot(icon, {size: 'sm', color: 'secondary'})
            : undefined
        }
        label={label}
        description={description}
        endContent={endAffordance}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        isDisabled={isDisabled}
        xstyle={[
          triggerStyles.root,
          triggerSizeStyles[menuSize],
          isOpen && triggerStyles.open,
          isDisabled && triggerStyles.disabled,
          xstyle,
        ]}
        {...mergeProps(themeProps('dropdown-menu-item', {size: menuSize}), {
          className,
          style,
        })}
      />
      {layer.render(
        <div
          ref={menuRef}
          id={contentId}
          role="menu"
          // Focusable as a fallback target so an empty/loading flyout (e.g.
          // hasSpinner with only a disabled row) can still receive keyboard
          // focus and own arrow/Escape keys instead of leaving focus on the
          // parent list.
          tabIndex={-1}
          aria-labelledby={triggerId}
          onKeyDown={handleContentKeyDown}
          onMouseEnter={contentProps.onMouseEnter}
          onMouseLeave={contentProps.onMouseLeave}
          data-testid={menuDataTestId}
          {...mergeProps(
            themeProps('dropdown-menu'),
            stylex.props(flyoutStyles.menu),
          )}>
          <DropdownMenuContext value={nestedMenuContext}>
            {children}
          </DropdownMenuContext>
        </div>,
        {
          placement: 'end',
          alignment: 'start',
          offset: spacingVars['--spacing-1'],
          xstyle: [popoverXstyle, layerAnimations.end],
        },
      )}
    </>
  );
}

DropdownMenuSubMenu.displayName = 'DropdownMenuSubMenu';

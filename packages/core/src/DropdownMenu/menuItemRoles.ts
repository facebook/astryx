// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuItemRoles.ts
 * @output Shared menu-item role set + focus selector + keyboard activation,
 *   and the hosted-control test that leaves a control's own keys to it.
 * @position Internal; used by DropdownMenu and ContextMenu so their
 *   roving-focus, typeahead, and Enter/Space activation stay in sync.
 *
 * Includes the selectable items (menuitemradio/menuitemcheckbox) alongside
 * plain menuitem so checkbox/radio rows are reachable by arrow keys, typeahead,
 * and Enter/Space — not just role="menuitem".
 */

export const MENU_ITEM_ROLES: ReadonlySet<string> = new Set([
  'menuitem',
  'menuitemradio',
  'menuitemcheckbox',
]);

export const MENU_ITEM_SELECTOR: string = [...MENU_ITEM_ROLES]
  .map(role => `[role="${role}"]:not([aria-disabled="true"])`)
  .join(',');

/**
 * Boundary selector for a single menu level. A menu and its submenu flyouts
 * both use `role="menu"`, and flyouts render inline (native popover, not a
 * portal), so a nested menu's items and key events would otherwise be picked
 * up by the parent. Pass this as `useListFocus`'s `boundarySelector` so each
 * level scopes item collection and key handling to its own container.
 */
export const MENU_BOUNDARY_SELECTOR = '[role="menu"]';

// Controls a menu may host beside its rows: a filter field, a create button.
const HOSTED_CONTROL_SELECTOR =
  'input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="textbox"]';
// A row of any state: a control inside a disabled row still belongs to it.
const ANY_ROW_SELECTOR = [...MENU_ITEM_ROLES]
  .map(role => `[role="${role}"]`)
  .join(',');
// The input types that take typed text, as in useListFocus's caret guard.
const TEXT_ENTRY_INPUT_TYPES: ReadonlySet<string> = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number',
]);

/**
 * The control a menu hosts beside its rows that `target` sits in (a filter
 * field, a create button), or null. A key pressed there is the control's: the
 * menu's Enter/Space activation and its typeahead are for rows. A control
 * inside a row belongs to the row.
 */
export function hostedControlOf(
  target: EventTarget | null,
  menu: Element | null,
): HTMLElement | null {
  if (!(target instanceof HTMLElement) || menu == null || target === menu) {
    return null;
  }
  const control = target.closest<HTMLElement>(HOSTED_CONTROL_SELECTOR);
  if (control == null || !menu.contains(control)) {
    return null;
  }
  const row = control.closest(ANY_ROW_SELECTOR);
  return row != null && menu.contains(row) ? null : control;
}

/** Whether a hosted control takes typed text, so printable keys are its own. */
export function isTextEntry(control: HTMLElement): boolean {
  if (
    control.tagName === 'TEXTAREA' ||
    control.getAttribute('role') === 'textbox' ||
    control.matches('[contenteditable]:not([contenteditable="false"])')
  ) {
    return true;
  }
  return (
    control.tagName === 'INPUT' &&
    TEXT_ENTRY_INPUT_TYPES.has((control as HTMLInputElement).type)
  );
}

/**
 * Whether a click carries a modifier or a non-primary button: on a row that
 * is a link the browser gives it a meaning of its own (a new tab, a
 * download), which the row must leave alone.
 */
export function isModifiedClick(event: {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  button: number;
}): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

/**
 * Activate a menu row from the keyboard (Enter / Space): a synthesized click
 * that carries the key's modifiers, so a ⌘-Enter on a row that is a link opens
 * it the way a ⌘-click would. `detail` stays 0, the mark of a
 * non-pointer activation.
 */
export function activateMenuItem(
  row: HTMLElement,
  key: {metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean},
): void {
  row.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      metaKey: key.metaKey,
      ctrlKey: key.ctrlKey,
      shiftKey: key.shiftKey,
      altKey: key.altKey,
    }),
  );
}

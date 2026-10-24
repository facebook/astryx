// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file holdInvokerThroughPress.ts
 * @input A control that just opened a `popover="auto"` layer on a press, and
 *   the layer's id
 * @output Keeps the control the layer's invoker until a task after the
 *   press's release
 * @position Internal to Layer; shared by every trigger that opens its layer
 *   on press-down (DropdownMenu, Selector)
 *
 * The browser's light dismiss reads the release of the very press that
 * opened the layer — on the trigger, outside the layer — as a dismissal,
 * unless the released element is the layer's invoker (`popovertarget`), the
 * exemption light dismiss honours. `showPopover({source})` does not grant it.
 * The attribute is dropped a task after the release, once light dismiss has
 * run, the way `useKeepLayerOpenProps` holds a control beside an open layer.
 */

export function holdInvokerThroughPress(
  control: HTMLElement | null,
  popoverId: string,
): void {
  if (control == null) {
    return;
  }
  const doc = control.ownerDocument;
  control.setAttribute('popovertarget', popoverId);
  const onPressEnd = () => {
    doc.removeEventListener('pointerup', onPressEnd, true);
    doc.removeEventListener('pointercancel', onPressEnd, true);
    // Light dismiss runs as the pointerup default action after listeners.
    doc.defaultView?.setTimeout(() => {
      control.removeAttribute('popovertarget');
    }, 0);
  };
  doc.addEventListener('pointerup', onPressEnd, true);
  doc.addEventListener('pointercancel', onPressEnd, true);
}

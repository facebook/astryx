// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file activationGuard.ts
 * @input Row render props, row element and event target
 * @output Private handler finalization and native-control/label/disclosure boundaries
 * @position Private activation/parent seam; reuses the canonical interactive catalog
 */
import {
  hasInteractiveAncestor,
  INTERACTIVE_SELECTORS,
} from '../../../hooks/useClickableContainer';

export {
  withRowActivationFinalizer,
  finalizeRowActivation,
} from '../../tableRowActivation';

export function isRowActivationGesture(
  row: HTMLTableRowElement,
  target: EventTarget | null,
): boolean {
  const view = row.ownerDocument.defaultView;
  if (!view || !(target instanceof view.Node) || !row.contains(target)) {
    return false;
  }
  const element =
    target instanceof view.Element ? target : target.parentElement;
  if (
    !element ||
    (element instanceof view.HTMLElement && element.isContentEditable)
  ) {
    return false;
  }
  if (hasInteractiveAncestor(element, row)) {
    return false;
  }
  // The shared container guard permits aria-readonly controls. Activation does
  // not: readonly controls still own their native/role interaction boundary.
  for (
    let ancestor: Element | null = element;
    ancestor && ancestor !== row;
    ancestor = ancestor.parentElement
  ) {
    const editable = ancestor.getAttribute('contenteditable')?.toLowerCase();
    if (
      ancestor.localName === 'tr' ||
      ancestor.matches(INTERACTIVE_SELECTORS) ||
      ancestor.localName === 'summary' ||
      (ancestor instanceof view.HTMLLabelElement &&
        ancestor.control !== null) ||
      editable === '' ||
      editable === 'true' ||
      editable === 'plaintext-only'
    ) {
      return false;
    }
  }
  const selection = row.ownerDocument.getSelection();
  if (selection && !selection.isCollapsed) {
    for (let index = 0; index < selection.rangeCount; index++) {
      try {
        const range = selection.getRangeAt(index);
        if (!range.collapsed && range.intersectsNode(row)) {
          return false;
        }
      } catch {
        // A changing or inaccessible range is not a proven row press.
        return false;
      }
    }
  }
  return true;
}

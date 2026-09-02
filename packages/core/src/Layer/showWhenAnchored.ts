// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file showWhenAnchored.ts
 * @input An anchor element and a callback that opens a layer
 * @output showWhenAnchored, and its cleanup contract
 * @position Layer utility; shared by useHoverCard and useTooltip's
 *   isDefaultOpen / controlled-isOpen effects
 */

/**
 * Calls `show` once `anchor` has a layout box, synchronously if it already
 * does. Returns a cleanup function; call it on effect cleanup/unmount.
 *
 * A trigger with no box — 0×0, as every element not yet laid out reports —
 * is not a valid CSS anchor. Showing against it now resolves the popover to
 * its fallback position (the viewport corner), and unlike a live layout
 * change, that resolution does not get revisited once the trigger later gets
 * a box: the popover is stuck there for the rest of this open.
 *
 * The concrete case this guards: a Dialog mounts its children before it
 * opens (`isOpen` gates only `showModal()`, not rendering), so a HoverCard or
 * Tooltip with `isDefaultOpen` or a controlled `isOpen={true}` inside one can
 * mount, and this effect can run, while the trigger sits inside a `<dialog>`
 * that hasn't gone modal yet and so has no box.
 */
export function showWhenAnchored(
  anchor: HTMLElement | null,
  show: () => void,
): () => void {
  if (!anchor) {
    show();
    return () => {};
  }
  const rect = anchor.getBoundingClientRect();
  if (rect.width !== 0 || rect.height !== 0) {
    show();
    return () => {};
  }
  const observer = new ResizeObserver(entries => {
    const entry = entries[0];
    if (entry && (entry.contentRect.width || entry.contentRect.height)) {
      observer.disconnect();
      show();
    }
  });
  observer.observe(anchor);
  return () => observer.disconnect();
}

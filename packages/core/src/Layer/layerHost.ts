// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerHost.ts
 * @input Uses a trigger element
 * @output Exports resolveLayerHost, the element a layer is hosted in
 * @position Layer utility; used by useLayer to place the popover in the DOM
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/layerHost.test.ts
 */

/**
 * Ancestors a layer must not be hosted inside.
 *
 * Two overlapping reasons, both verified in Chrome:
 *
 * 1. The HTML parser owns server markup. `<p>` and the heading-ish elements
 *    take phrasing content only, so a block element inside one makes the
 *    parser close the paragraph and reparent the rest — the layer's content
 *    ends up in the page instead of the popover. A nested `<a>` triggers the
 *    same tearing through the adoption agency algorithm.
 * 2. Interactive ancestors capture the layer's own interactions. A card
 *    hosted inside an `<a>` or `<button>` puts its links and buttons inside
 *    that control: clicking one navigates the wrapping link, and every
 *    focusable in the card joins the control's own tab stop.
 *
 * Inline formatting elements are on the list for a third, milder reason: a
 * layer hosted in one inherits its typography (font-size, text-align), so a
 * card in a 13px centered paragraph renders 13px and centered.
 */
const UNSAFE_HOSTS = new Set([
  // Phrasing-content-only containers
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'dt',
  'pre',
  'legend',
  'option',
  'optgroup',
  // Interactive containers
  'a',
  'button',
  'label',
  'summary',
  // Inline formatting context
  'span',
  'em',
  'strong',
  'b',
  'i',
  'u',
  's',
  'small',
  'mark',
  'code',
  'kbd',
  'samp',
  'var',
  'sub',
  'sup',
  'abbr',
  'cite',
  'q',
  'time',
  'bdi',
  'bdo',
  'ins',
  'del',
]);

/**
 * The element a layer should be rendered into: the nearest ancestor of the
 * trigger that can host it safely.
 *
 * Walking up from the trigger (rather than portaling to `document.body`) is
 * what keeps the two things a layer inherits from its position in the tree:
 *
 * - **Theme.** Themes are CSS custom properties on an ancestor. Every
 *   ancestor of the trigger is inside the same theme scope the trigger is in;
 *   `document.body` is not, and a layer hosted there falls back to root
 *   values.
 * - **Tab order.** Sequential focus follows DOM order, so a host near the
 *   trigger keeps the layer's focusables next to it. (`show()` also passes
 *   the trigger as the popover's invoker `source`, which pins focus order to
 *   the invoker in browsers that support it.)
 *
 * Returns `null` when there is no trigger or no safe ancestor, which leaves
 * the layer where the consumer rendered it.
 */
export function resolveLayerHost(
  trigger: HTMLElement | null,
): HTMLElement | null {
  if (!trigger) {
    return null;
  }

  let node: HTMLElement | null = trigger.parentElement;
  while (node && UNSAFE_HOSTS.has(node.tagName.toLowerCase())) {
    node = node.parentElement;
  }

  return node;
}

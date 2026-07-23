// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground building block: `PlaygroundConfig` — the interactive
 * component-preview configuration (default prop state, overlay mode, wrapper).
 * Shared across the doc shapes.
 *
 * Part of `@astryxdesign/core/doc-types` (see ../index.ts).
 */

/**
 * Playground configuration for the interactive component preview.
 *
 * `defaults` provides the initial prop state for the playground. Every key
 * maps to a prop name, and the value is either:
 * - A **primitive** (string, number, boolean) — used directly as the prop value
 * - An **ElementDescriptor** — resolved to a React element via createElement
 *
 * Props not listed in `defaults` fall back to the standard logic:
 * doc `default` values, then auto-generated values for required props.
 *
 * @example
 * ```
 * // Button — just override the label
 * playground: {
 *   defaults: {label: 'Click me', variant: 'primary'},
 * }
 *
 * // Card — provide children content
 * playground: {
 *   defaults: {
 *     padding: 4,
 *     children: {
 *       __element: 'VStack', props: {gap: 2}, children: [
 *         {__element: 'Heading', props: {level: 3}, children: 'Card Title'},
 *         {__element: 'Text', props: {type: 'body'}, children: 'Card content goes here.'},
 *       ],
 *     },
 *   },
 * }
 *
 * // Dialog — provide structured children
 * playground: {
 *   defaults: {
 *     isOpen: true,
 *     isInline: true,
 *     onOpenChange: undefined,
 *     children: {__element: 'Text', props: {type: 'body'}, children: 'Dialog content'},
 *   },
 * }
 * ```
 */
export interface PlaygroundConfig {
  /** Initial prop values for the playground preview.
   *  Keys are prop names. Values are primitives or ElementDescriptors. */
  defaults?: Record<string, unknown>;
  /** The component opens as a full-viewport overlay (e.g. via
   *  `dialog.showModal()`) and renders nothing inline while closed. The
   *  interactive preview shows an open-trigger placeholder instead of an
   *  empty stage while `isOpen` is false, and lets the real overlay render
   *  when opened. Include `isOpen: false` in `defaults` so the preview can
   *  bridge `onOpenChange` back into playground state.
   *
   *  Only for components with no inline containment (MobileNav, Lightbox).
   *  Components with an `isInline` docs-preview prop (Dialog, AlertDialog,
   *  CommandPalette) intentionally keep contained inline previews instead:
   *  the component is visible on load and knobs stay usable, whereas a real
   *  top-layer modal makes the rest of the page inert (#3657). */
  overlay?: boolean;
  /** Required parent wrapper for sub-components that depend on a parent
   *  context provider (e.g. `Tab` calls `useTabListContext()` and throws
   *  standalone). The preview wraps the component in this parent before
   *  rendering, injecting it as `children`. Provide any props the wrapper
   *  requires (e.g. a matching `value`).
   *
   *  @example
   *  ```
   *  playground: {wrapper: {component: 'TabList', props: {value: 'tab-1'}}}
   *  ```
   */
  wrapper?: {
    /** Parent component name as exported from `@astryxdesign/core`, e.g. `'TabList'`. */
    component: string;
    /** Props for the wrapper. The previewed sub-component becomes its `children`. */
    props?: Record<string, unknown>;
  };
}

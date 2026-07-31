// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * A serializable descriptor for a React element. The playground resolves
 * these at runtime via `createElement(Core[component], props, ...children)`.
 *
 * Use this for any prop value that needs to be a React element —
 * children slots, icon props, endContent, etc.
 *
 * @example
 * ```
 * // Simple element
 * {__element: 'Icon', props: {icon: 'check', size: 'sm'}}
 *
 * // Element with text children
 * {__element: 'Text', props: {type: 'body'}, children: 'Hello world'}
 *
 * // Nested composition
 * {__element: 'VStack', props: {gap: 2}, children: [
 *   {__element: 'Heading', props: {level: 3}, children: 'Title'},
 *   {__element: 'Text', props: {}, children: 'Body text'},
 * ]}
 * ```
 */
export interface ElementDescriptor {
  /** Marker field — presence distinguishes this from a plain object prop value. */
  __element: string;
  /** Props passed to createElement. Omit or use {} for no props. */
  props?: Record<string, unknown>;
  /** Children — a string, another ElementDescriptor, or an array of them. */
  children?: string | ElementDescriptor | (string | ElementDescriptor)[];
}

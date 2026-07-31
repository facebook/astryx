// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ElementDescriptor} from './ElementDescriptor';

/**
 * Documents a single component prop. Each prop the component accepts
 * should have an entry. Skip internal/styling props like `xstyle`,
 * `className`, `style`, and `data-testid`.
 *
 * @example
 * ```
 * {name: 'label', type: 'string', description: 'Visible label text', required: true}
 * {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Control size', default: "'md'"}
 * {name: 'onChange', type: '(value: string) => void', description: 'Called when value changes.'}
 * ```
 */
export interface PropDoc {
  /** Prop name exactly as used in JSX, camelCased.
   *  Callbacks start with `on` (`"onChange"`, `"onToggle"`).
   *  Booleans use `is`/`has` prefix (`"isDisabled"`, `"hasHover"`). */
  name: string;
  /** TypeScript type signature as a string. Use single quotes for string
   *  literal unions. Keep close to the actual TS type.
   *
   *  Simple: `"string"`, `"boolean"`, `"ReactNode"`
   *  Union: `"'primary' | 'secondary' | 'ghost'"`
   *  Function: `"(checked: boolean, e: ChangeEvent) => void"`
   *  Async: `"(e: MouseEvent) => void | Promise<void>"`
   *  Generic: `"TableColumn<T>[]"` */
  type: string;
  /** What this prop does, in 1-2 sentences. Focus on behavior and
   *  consequences rather than restating the prop name.
   *
   *  Good: `"Shows a loading spinner and disables interaction."`
   *  Weak: `"Shows a loading spinner."` */
  description: string;
  /** Default value as a string, if the prop is optional and has one.
   *  String literals in single quotes: `"'md'"`, `"'balanced'"`.
   *  Other values unquoted: `"false"`, `"0"`, `"() => true"`.
   *  Omit entirely for required props or optional props with no default. */
  default?: string;
  /** True if the prop must be provided. Omit (don't set to false) if optional. */
  required?: boolean;
  /** For ReactNode props: the Astryx components this slot typically accepts.
   *  Each entry is an ElementDescriptor that the playground uses to
   *  create a default instance when the user toggles the slot on.
   *
   *  Single-element slots (icon, endContent) have one option with a toggle.
   *  Multi-element slots (children on List) can have options the user picks from.
   *
   *  The playground uses this instead of hardcoded component→control mappings.
   *  Omit for ReactNode props that accept plain text (label, description).
   *
   *  @example
   *  ```
   *  // Single option — renders as a toggle switch
   *  slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}]
   *
   *  // Multiple options — renders as a selector
   *  slotElements: [
   *    {__element: 'Icon', props: {icon: 'check', size: 'sm'}},
   *    {__element: 'Badge', props: {label: 'Badge'}},
   *  ]
   *  ```
   */
  slotElements?: ElementDescriptor[];
}

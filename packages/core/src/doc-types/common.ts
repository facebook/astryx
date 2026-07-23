// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared building-block types used across the doc shapes (props, usage,
 * theming, anatomy, playground, etc.). These are composed into the top-level
 * doc kinds in the sibling files. No factory - they aren't authored on their own.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

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

/**
 * A theming target — a stable selector surface that `defineTheme` can target
 * via `@scope` selectors. Each component renders one or more stable `xds-*`
 * class names and reflects visual props/states as `data-*` attributes via
 * `themeProps()`, so themes and external CSS have an explicit prop-aware selector surface.
 *
 * @example
 * ```
 * {className: 'astryx-button', visualProps: ['variant', 'size']}
 * {className: 'astryx-avatar-status-dot', visualProps: ['variant']}
 * {className: 'astryx-card'}
 * ```
 */
export interface ThemingTarget {
  /** The stable CSS class name rendered by the component.
   *  Always starts with `astryx-`.
   *  e.g. `"astryx-button"`, `"astryx-avatar-status-dot"`, `"astryx-card"` */
  className: string;
  /** Visual prop names reflected on this element.
   *  These are the props passed to `themeProps()` as the second argument.
   *  Use these names to derive preferred data selectors: `variant` →
   *  `[data-variant="secondary"]`, `level` → `[data-level="2"]`. Legacy bare
   *  classes are still emitted for compatibility but should not be the primary
   *  documentation surface. Omit if the component has no visual props (class
   *  name only). */
  visualProps?: string[];
  /** State names that appear on this element based on component state.
   *  Unlike visualProps (driven by props), these reflect runtime state
   *  (checked, selected, today, on, expanded, etc.). Use these names to derive preferred data selectors such as
   *  `[data-checked="checked"]`. Legacy state classes are still emitted for
   *  compatibility. Omit if the element has no state-driven selectors. */
  states?: string[];
}

/**
 * Maps a standard CSS property to one or more internal CSS custom properties.
 *
 * Theme authors write standard CSS (e.g. `borderRadius: '32px'`). The theme
 * pipeline reads this metadata and expands it: emitting both the CSS property
 * AND the internal var(s) that the component reads.
 *
 * Entries are ordered by priority — earlier entries are emitted first.
 * When multiple entries share the same `property`, all fire (in order).
 *
 * The special `expand: 'container'` triggers the 7-token container padding
 * expansion instead of setting a specific var.
 *
 * @example
 * ```
 * // Simple: borderRadius → one internal var
 * { property: 'borderRadius', vars: ['--_card-radius'] }
 *
 * // Container expansion: padding → 7 container tokens
 * { property: 'padding', expand: 'container' }
 *
 * // Multiple vars from one property
 * { property: 'padding', vars: ['--_chat-composer-padding', '--_composer-button-offset'] }
 *
 * // Multiple entries for the same property (both fire, in order)
 * { property: 'padding', expand: 'container' },
 * { property: 'padding', vars: ['--_card-padding'] },
 * ```
 */
export interface DerivedVar {
  /** The standard CSS property name (camelCase) that theme authors write.
   *  e.g. `'borderRadius'`, `'padding'`, `'paddingBlock'` */
  property: string;
  /** Internal CSS custom property names to set when this property appears
   *  in a theme's component overrides. Omit when using `expand`. */
  vars?: string[];
  /** Named expansion strategy instead of specific vars.
   *  `'container'` — expands padding to 7 container layout tokens. */
  expand?: 'container';
}

/**
 * Documents a CSS custom property exposed by a component for theming.
 * These vars are set on the component's root element and can be overridden
 * via `defineTheme` component overrides.
 *
 * @example
 * ```
 * {name: '--_card-radius', description: 'Border radius', default: 'var(--radius-container)'}
 * {name: '--card-concentric-radius', description: 'Inner radius', derived: true, formula: 'max(0px, calc(var(--_card-radius) - var(--card-padding)))'}
 * ```
 */
export interface ComponentVar {
  /** CSS custom property name, e.g. '--_card-radius' or '--button-press-scale' */
  name: string;
  /** What this var controls */
  description: string;
  /** Default value as a CSS expression, e.g. 'var(--radius-container)' */
  default: string;
  /** Whether this var is derived from other vars (not directly settable) */
  derived?: boolean;
  /** CSS expression showing how derived vars are computed */
  formula?: string;
  /**
   * Whether this var is private (internal implementation detail).
   * Private vars are set by the derived var expansion pipeline — theme
   * authors write standard CSS properties instead of setting them directly.
   * The CLI hides private vars from theming output.
   * `astryx theme build` errors if a theme sets a private var directly.
   */
  private?: boolean;
}

/**
 * Code example for a component or sub-component.
 */
export interface ExampleDoc {
  /** Optional heading shown above the code block. */
  label?: string;
  /** TSX source for the example. */
  code: string;
}

/**
 * Documents one element in a component's anatomy breakdown.
 * Anatomy describes the visual/structural parts that make up a component
 * (e.g. a Button has: left icon, label, end content, container).
 *
 * @example
 * ```
 * {name: 'Label', required: true, description: 'Accessible text for the button. Set isLabelHidden to visually hide it.'}
 * {name: 'Left icon', required: false, description: 'Visually represents the meaning of the button label. Icon size is typically 16px.'}
 * ```
 */
export interface AnatomyElement {
  /** Human-readable element name. e.g. `"Label"`, `"Left icon"`, `"Container"` */
  name: string;
  /** Whether this element is required for the component to function. */
  required: boolean;
  /** What this element is and how it contributes to the component. 1-2 sentences. */
  description: string;
}

/**
 * A single do/don't best practice for a component.
 * Rendered as a table row with a colored "Do" or "Don't" badge
 * in the Guidance column and the description in the Practices column.
 *
 * @example
 * ```
 * {guidance: true, description: 'Convey clear action hierarchy. Each surface should only have 1 primary button.'}
 * {guidance: false, description: 'Overuse primary or special buttons. Overusing colored buttons creates visual confusion.'}
 * ```
 */
export interface BestPractice {
  /** `true` renders a green "Do" badge; `false` renders a red "Don't" badge.  */
  guidance: boolean;
  /** 1-2 short sentences of design guidance. Focus on how a designer
   *  would USE the component, not how it's built.
   *
   *  NEVER start with "Do" or "Don't" — the badge handles that.
   *
   *  Good: `"Convey clear action hierarchy. Each surface should only have 1 primary button."`
   *  Bad:  `"Do use clear action hierarchy."` */
  description: string;
}

/**
 * Component usage documentation — a concise summary, design guidance
 * best practices, and optional visual anatomy.
 *
 * ## description
 * Exactly 2-3 short sentences:
 * - Sentence 1: What the component is and does.
 * - Sentence 2-3: When to use it, or what context it belongs in.
 *
 * Reference tone: "Buttons provide visual cues for actions and events.
 * These fundamental components allow users to commit actions and navigate
 * a page flow. Use a Button when a user needs to submit a form, start a
 * new task or action, or trigger a new UI element to appear on the page."
 *
 * ## bestPractices
 * Array of 3-4 items. Usually 2 Do items, then 1-2 Don't items.
 * Each item is design guidance — not implementation details.
 * Never start the description with "Do" or "Don't".
 */
export interface UsageDoc {
  /** What the component is and when to use it. 2-3 short sentences.
   *
   *  Sentence 1: What the component is and does.
   *  Sentence 2-3: When to use it, or what context it belongs in.
   *
   *  e.g. `"Buttons provide visual cues for actions and events. These
   *  fundamental components allow users to commit actions and navigate
   *  a page flow. Use a Button when a user needs to submit a form,
   *  start a new task or action, or trigger a new UI element to appear
   *  on the page."` */
  description: string;
  /** 3-4 do/don't design guidance items. Usually 2 Do's then 1-2 Don'ts.
   *  Focus on how a designer would USE the component, not how it's built. */
  bestPractices?: BestPractice[];
  /** Structural/visual anatomy of the component. Each entry describes one
   *  element that makes up the component (icon slot, label, container, etc.).
   *  Order entries in the visual reading order (leading → trailing, top → bottom). */
  anatomy?: AnatomyElement[];
}

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

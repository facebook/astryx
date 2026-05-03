/**
 * @file Type definitions for component documentation.
 *
 * Every component directory under `packages/core/src/` has a `{Name}.doc.mjs`
 * that exports a single `docs` constant typed via JSDoc. The CLI imports these
 * directly — no markdown parsing needed.
 */

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
   *  Generic: `"XDSTableColumn<T>[]"` */
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
  /** For ReactNode props: the XDS components this slot typically accepts.
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
   *  slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}]
   *
   *  // Multiple options — renders as a selector
   *  slotElements: [
   *    {__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}},
   *    {__element: 'XDSBadge', props: {label: 'Badge'}},
   *  ]
   *  ```
   */
  slotElements?: ElementDescriptor[];
}

/**
 * A theming target — a stable CSS class name that `defineTheme` can target
 * via `@scope` selectors. Each component renders one or more class names
 * via `xdsClassName()`, and themes can override styles for each.
 *
 * @example
 * ```
 * {className: 'xds-button', visualProps: ['variant', 'size']}
 * {className: 'xds-avatar-status-dot', visualProps: ['variant']}
 * {className: 'xds-card'}
 * ```
 */
export interface ThemingTarget {
  /** The stable CSS class name rendered by the component.
   *  Always starts with `xds-`.
   *  e.g. `"xds-button"`, `"xds-avatar-status-dot"`, `"xds-card"` */
  className: string;
  /** Visual prop names that produce variant classes on this element.
   *  These are the props passed to `xdsClassName()` as the second argument.
   *  Themes can target specific variants via `.xds-button.secondary`.
   *  Omit if the component has no visual props (class name only). */
  visualProps?: string[];
  /** State class names that appear on this element based on component state.
   *  Unlike visualProps (driven by props), these reflect runtime state
   *  (checked, selected, today, on, expanded, etc.).
   *  Themes target them the same way as variants: `.xds-radio.checked { ... }`
   *  Omit if the element has no state-driven classes. */
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
   * `xds theme build` errors if a theme sets a private var directly.
   */
  private?: boolean;
}

/**
 * Documents one component within a multi-component directory. Used when a
 * directory exports multiple public components (e.g. Table exports XDSTable,
 * XDSBaseTable, XDSTableRow, XDSTableCell, XDSTableHeaderCell).
 *
 * Also use for hooks with config objects (e.g. useXDSTableSelection) —
 * treat config options as "props". Order components with the primary/most-used
 * component first.
 */
export interface ComponentEntry {
  /** Full export name including XDS prefix. e.g. `"XDSTableRow"`,
   *  `"XDSDialogHeader"`, `"useXDSTableSelection"` */
  name: string;
  /** One-sentence description of what this specific component does.
   *  For sub-components, explain the role within the parent composition. */
  description: string;
  /** All public props for this component. */
  props: PropDoc[];
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
 * A serializable descriptor for a React element. The playground resolves
 * these at runtime via `createElement(XDSCore[component], props, ...children)`.
 *
 * Use this for any prop value that needs to be a React element —
 * children slots, icon props, endContent, etc.
 *
 * @example
 * ```
 * // Simple element
 * {__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}
 *
 * // Element with text children
 * {__element: 'XDSText', props: {type: 'body'}, children: 'Hello world'}
 *
 * // Nested composition
 * {__element: 'XDSVStack', props: {gap: 2}, children: [
 *   {__element: 'XDSHeading', props: {level: 3}, children: 'Title'},
 *   {__element: 'XDSText', props: {}, children: 'Body text'},
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
 *       __element: 'XDSVStack', props: {gap: 2}, children: [
 *         {__element: 'XDSHeading', props: {level: 3}, children: 'Card Title'},
 *         {__element: 'XDSText', props: {type: 'body'}, children: 'Card content goes here.'},
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
 *     children: {__element: 'XDSText', props: {type: 'body'}, children: 'Dialog content'},
 *   },
 * }
 * ```
 */
export interface PlaygroundConfig {
  /** Initial prop values for the playground preview.
   *  Keys are prop names. Values are primitives or ElementDescriptors. */
  defaults: Record<string, unknown>;
}

/**
 * Shared fields between single-component and multi-component docs.
 * Do not use this interface directly — use `ComponentDoc` (the union type).
 */
interface BaseDoc {
  /** Directory name without the XDS prefix, PascalCase.
   *  e.g. `"Button"`, `"Table"`, `"TextInput"`, `"AppShell"` */
  name: string;
  /** Search keywords for CLI discovery. Terms a developer might type when
   *  looking for this component: synonyms, related UI concepts, and common
   *  names from other design systems (MUI, Chakra, Radix, shadcn).
   *  Lowercase only. Used by `xds component <term>` for fuzzy matching.
   *  e.g. `['accordion', 'expand', 'toggle', 'disclosure']` for Collapsible */
  keywords?: string[];
  /** Sub-component names to hide from human-facing UI (CLI listings,
   *  docs catalogs). The components stay public and importable — agents
   *  and tooling can still discover them via source. Use when the
   *  directory's doc covers a group but some XDS*.tsx files shouldn't
   *  appear in the catalog. */
  hiddenComponents?: string[];
  /** Hide this entire component from human-facing UI (CLI listings,
   *  docs catalogs). The component stays public and importable — agents
   *  and tooling can still discover it via source. Use for shared
   *  primitives (NavIcon, NavMenu) that only make sense in the context
   *  of their parent compositions. */
  hidden?: boolean;
  /** Optional group for sidebar/docs organization.
   *  Components without a group appear flat in alphabetical order.
   *  Groups cluster related components that are always used together
   *  or are variants of each other. */
  group?: string;
  /** Theming configuration. Documents the stable CSS class names
   *  rendered by this component that themes can target via `@scope`
   *  selectors in `defineTheme`. */
  theming?: {
    /** Whether this component is a container whose `padding` properties
     *  should be mapped to container tokens by the theme pipeline.
     *  When true, `padding`, `paddingBlock`, `paddingInline` etc. in
     *  component overrides are expanded to `--container-padding-*` and
     *  `--layout-padding-*` tokens instead of emitting raw CSS. */
    container?: boolean;
    /** CSS class targets rendered by this component.
     *  Each entry corresponds to an `xdsClassName()` call in the source. */
    targets: ThemingTarget[];
    /** CSS custom properties exposed for theming. */
    vars?: ComponentVar[];
    /** Maps standard CSS properties to internal vars for theme pipeline
     *  expansion. Ordered by priority — earlier entries emit first.
     *  The pipeline reads this to know: when a theme sets `borderRadius`
     *  on this component, also emit the internal var.
     *  @see DerivedVar */
    derived?: DerivedVar[];
  };
  /** Component usage documentation — concise summary, best practices,
   *  and optional visual anatomy. */
  usage: UsageDoc;

  /** Playground configuration. Controls how the interactive preview
   *  renders this component with sensible defaults and slot content. */
  playground?: PlaygroundConfig;
}

/**
 * Documentation for a directory that exports a single primary component.
 * Props live directly on this object.
 *
 * Use this when the directory has one main `XDS*.tsx` file
 * (e.g. Switch, Badge, Spinner, TextInput).
 */
export interface SingleComponentDoc extends BaseDoc {
  /** All public props for the component. */
  props: PropDoc[];
}

/**
 * Documentation for a directory that exports multiple public components.
 * Props live on each entry in `components`.
 *
 * Use this when the directory has multiple `XDS*.tsx` files
 * (e.g. Table, Dialog, TabList, TopNav, Layout).
 */
export interface MultiComponentDoc extends BaseDoc {
  /** Each public component/hook exported from this directory. */
  components: ComponentEntry[];
}

/**
 * The documentation type for a component directory's {Name}.doc.mjs file.
 *
 * Every .doc.mjs must export a single `docs` constant of this type:
 *
 *   /\*\* \@type \{import('../docs-types').ComponentDoc\} *\/
 *   export const docs = \{ ... \};
 *
 * Use SingleComponentDoc (with `props`) for single-component directories.
 * Use MultiComponentDoc (with `components`) for multi-component directories.
 */
export type ComponentDoc = SingleComponentDoc | MultiComponentDoc;

/**
 * Translation overlay for component documentation.
 *
 * Contains only the prose fields that change between languages/formats.
 * The CLI merges this onto the base `docs` at read time — props,
 * types, defaults, and code all come from `docs`.
 *
 * Used by both `docsZh` (Chinese translation) and `docsDense` (compressed format).
 */
export interface TranslationDoc {
  /** Compressed/translated component description. */
  description?: string;
  /** Prop descriptions keyed by prop name. Only include props that have descriptions. */
  propDescriptions?: Record<string, string>;
  /** Translated/compressed usage overlay. Mirrors UsageDoc fields. */
  usage?: {
    description?: string;
    bestPractices?: BestPractice[];
    anatomy?: AnatomyElement[];
  };
  /** Sub-component translations. Must match docs.components length and order (if present). */
  components?: Array<{
    /** Exact name from docs.components[n].name */
    name: string;
    /** Compressed/translated sub-component description. */
    description: string;
    /** Prop descriptions keyed by prop name. */
    propDescriptions?: Record<string, string>;
  }>;
}

// =============================================================================
// Reference Documentation Types
// =============================================================================

/**
 * A content block within a reference doc section.
 * Ordered array of these makes up a section's content.
 * New block types can be added without breaking existing docs.
 *
 * @example
 * ```
 * { type: 'prose', text: 'Spacing tokens control gap and padding...' }
 * { type: 'code', lang: 'tsx', code: 'padding: spacingVars[...]' }
 * { type: 'table', headers: ['Token', 'Value'], rows: [['--spacing-4', '16px']] }
 * { type: 'list', style: 'do', items: ['Use semantic tokens'] }
 * { type: 'token-ref', topic: 'tokens', section: 'Color Tokens' }
 * ```
 */
export type ContentBlock =
  | {type: 'prose'; text: string}
  | {type: 'code'; lang: string; code: string; label?: string}
  | {type: 'table'; headers: string[]; rows: string[][]}
  | {
      type: 'list';
      style: 'ordered' | 'unordered' | 'do' | 'dont';
      items: string[];
    }
  | {
      /** Reference to a token table in another doc topic.
       *  The CLI resolves this at read time and inlines the referenced
       *  section's table. The docsite can render it with live theme values
       *  and type-specific previews instead of static strings. */
      type: 'token-ref';
      /** Doc topic name containing the tokens. e.g. `'tokens'` */
      topic: string;
      /** Section title to pull from that topic. e.g. `'Color Tokens'` */
      section: string;
    };

/**
 * Preview type hint for token tables. Tells the docsite how to render
 * a visual preview column for each token row.
 *
 * - `'swatch'` — Color circle/square showing the token value
 * - `'shadow-box'` — Box with the shadow applied
 * - `'radius-box'` — Box with the border-radius applied
 * - `'spacing-bar'` — Horizontal bar at the token's width
 * - `'size-bar'` — Horizontal bar at the token's height
 * - `'border-line'` — Line at the token's border-width
 * - `'duration-bar'` — Animated bar showing the timing
 * - `'easing-curve'` — Bezier curve visualization
 * - `'font-sample'` — Text sample in the font family/size/weight
 */
export type TokenPreviewType =
  | 'swatch'
  | 'shadow-box'
  | 'radius-box'
  | 'spacing-bar'
  | 'size-bar'
  | 'border-line'
  | 'duration-bar'
  | 'easing-curve'
  | 'font-sample';

/**
 * A section within a reference doc. Sections are the primary
 * organizational unit — each becomes an h2 in full output,
 * and can be individually retrieved via `xds docs <topic> <section>`.
 */
export interface ReferenceSection {
  /** Section title, e.g. "Spacing Tokens", "Light/Dark Mode" */
  title: string;
  /** Ordered content blocks. Mix prose, code, tables, and lists freely. */
  content: ContentBlock[];
  /** Preview type for token tables in this section. When set, the docsite
   *  renders a visual preview column using the token's computed CSS value
   *  from the current theme. Omit for non-token sections. */
  previewType?: TokenPreviewType;
}

/**
 * A reference documentation file (.doc.mjs).
 *
 * Reference docs cover topics like design tokens, principles, theming,
 * patterns, accessibility, and migration guides. Unlike ComponentDoc,
 * they aren't tied to a specific component — just drop a .doc.mjs file
 * in the docs/ directory and it shows up in `xds docs`.
 *
 * Every reference .doc.mjs must export a single `docs` constant:
 *
 *   /** @type {import('../../core/src/docs-types').ReferenceDoc} *\/
 *   export const docs = { ... };
 */
export interface ReferenceDoc {
  /** URL-safe identifier, used as the CLI topic name. e.g. 'tokens', 'principles' */
  name: string;
  /** Human-readable title. e.g. 'All Tokens' */
  title: string;
  /** One-line summary shown in topic listings. */
  description: string;
  /** Navigation category: 'guide' or 'foundations'. */
  category?: string;
  /** Ordered sections that make up the doc. */
  sections: ReferenceSection[];
  /** Token category for foundational docs that map to a token section.
   *  When set, the docsite can link from the tokens overview page
   *  to this doc for detailed guidance on that category.
   *  e.g. `'color'` links tokens → color foundational doc. */
  tokenCategory?: string;
}

/**
 * Translation/compression overlay for reference documentation.
 *
 * Swaps prose text and list items. Code blocks and table data
 * are NOT translated — they stay as-is from the base doc.
 *
 * Used by `docsZh` (Chinese) and `docsDense` (compressed format).
 */
export interface ReferenceTranslationDoc {
  /** Translated/compressed description. */
  description: string;
  /** Section overrides. Array indices must match base doc sections. */
  sections: {
    /** Translated section title. */
    title: string;
    /** Content block overrides. Only prose and list blocks need entries.
     *  Use null for blocks that don't change (code, table). */
    content: (
      | {type: 'prose'; text: string}
      | {type: 'list'; items: string[]}
      | null
    )[];
  }[];
}

/**
 * Documentation for a page template.
 *
 * Every template directory under `packages/cli/templates/` has a
 * `template.doc.mjs` that exports a single `doc` constant:
 *
 *   /** @type {import('@xds/core').TemplateDoc} *\/
 *   export const doc = { ... };
 *
 * The CLI and sandbox import these for discovery and display.
 */
interface BaseTemplateDoc {
  /** Display name shown in the sandbox gallery and CLI.
   *  e.g. "Dashboard", "Login (Card)", "Settings (Sidebar)" */
  name: string;

  /** One-sentence description of what the template provides. */
  description?: string;

  /** Whether this template is ready for use. Templates with
   *  isReady: false show as "(WIP)" in the gallery and CLI. */
  isReady?: boolean;

  /** Whether this template is a scaffolding tool only (e.g. blank page).
   *  Scaffold templates are available via the CLI but hidden from
   *  browsable template galleries like the craft browser. */
  scaffold?: boolean;
}

export interface PageTemplateDoc extends BaseTemplateDoc {
  type: 'page';
}

export interface BlockTemplateDoc extends BaseTemplateDoc {
  type: 'block';
  /** The component this block is an example of.
   *  Matches the component's doc name (e.g. 'Button', 'Dialog', 'Stack').
   *  Used by the docsite to show relevant examples on component detail pages. */
  exampleFor: string;
  /** Width-to-height ratio for preview containers (e.g. 16/9, 1, 3/4). */
  aspectRatio: number;
  /** Scale factor for the block preview (default 1). */
  scale?: number;
  /** Component names this block uses, for cross-referencing.
   *  Powers "See also" and "Used in" sections — not for primary attribution. */
  componentsUsed?: string[];
  /** When true this block is the canonical "hero" showcase for a component. */
  isShowcase?: boolean;
}

export type TemplateDoc = PageTemplateDoc | BlockTemplateDoc;

// =============================================================================
// Group Documentation Types
// =============================================================================

/**
 * Metadata for a component group that is NOT itself a component.
 *
 * Some groups (e.g. 'Checkbox', 'Layout', 'Tabs') are category labels —
 * they cluster related components but have no corresponding XDS*.tsx file.
 * This metadata tells the docsite and CLI which component to treat as the
 * canonical entry point for the group.
 *
 * Groups whose name IS a component (e.g. 'Avatar', 'Button', 'Dialog')
 * don't need an entry here — the component IS the canonical representative.
 *
 * @example
 * ```
 * { name: 'Checkbox', canonical: 'CheckboxList', description: 'Selection controls for choosing one or more options from a set.' }
 * { name: 'Layout', canonical: 'Stack', description: 'Structural primitives for page and content layout.' }
 * ```
 */
export interface GroupDoc {
  /** Group name — must match one of the `group` union values on BaseDoc. */
  name: string;
  /** The canonical component for this group — the one the docsite links
   *  to when a user clicks the group name. Should be the most commonly
   *  used or most representative component in the group.
   *  e.g. `'CheckboxList'` for the Checkbox group. */
  canonical: string;
  /** One-sentence description of what this group of components does.
   *  Shown in the sidebar, catalog, or group landing page. */
  description: string;
}

// =============================================================================
// Hook Documentation Types
// =============================================================================

/**
 * Documents a hook parameter/option. Similar to PropDoc but for hook
 * arguments and options object fields.
 */
export interface HookParamDoc {
  /** Parameter or option field name. */
  name: string;
  /** TypeScript type signature as a string. */
  type: string;
  /** What this parameter does. 1-2 sentences. */
  description: string;
  /** Default value as a string, if optional with a default. */
  default?: string;
  /** True if required. Omit if optional. */
  required?: boolean;
}

/**
 * Documents a hook's return value field.
 */
export interface HookReturnDoc {
  /** Field name on the returned object, or 'value' for primitive returns. */
  name: string;
  /** TypeScript type. */
  type: string;
  /** What this return value provides. */
  description: string;
}

/**
 * Documentation for a standalone hook's .doc.mjs file.
 *
 * Hooks that are part of a component's API (e.g. useXDSImperativeDialog)
 * should be documented in the component's MultiComponentDoc.components array.
 *
 * Standalone hooks (e.g. useMediaQuery, useFocusTrap, useOverflow) get
 * their own {hookName}.doc.mjs file and use this type.
 *
 * Every hook .doc.mjs must export a single `docs` constant:
 *
 *   /\*\* @type {import('../docs-types').HookDoc} \*\/
 *   export const docs = { ... };
 */
export interface HookDoc {
  /** Hook name exactly as exported, e.g. 'useMediaQuery', 'useFocusTrap'. */
  name: string;
  /** Optional group for sidebar/docs organization — same as ComponentDoc.group. */
  group?: string;
  /** Search keywords for CLI discovery. */
  keywords?: string[];
  /** Hook parameters or options object fields. */
  params: HookParamDoc[];
  /** Return value documentation. For object returns, list each field.
   *  For primitive returns, use a single entry. */
  returns: HookReturnDoc[];
  /** Usage documentation — description, best practices. */
  usage: UsageDoc;
  /** Component names this hook is commonly used with.
   *  Enables cross-referencing: \`xds component Toast\` can mention useXDSToast,
   *  and \`xds hook useXDSToast\` can link back to Toast. */
  relatedComponents?: string[];
  /** Other hook names this hook is commonly used with. */
  relatedHooks?: string[];
  /** Import path, e.g. '@xds/core/hooks' or '@xds/core/Toast'. */
  importPath?: string;
  /** Category for grouping in listings. */
  category?: string;
}

/**
 * Translation overlay for hook documentation.
 */
export interface HookTranslationDoc {
  /** Compressed/translated description. */
  description?: string;
  /** Param descriptions keyed by param name. */
  paramDescriptions?: Record<string, string>;
  /** Return descriptions keyed by field name. */
  returnDescriptions?: Record<string, string>;
  /** Translated usage. */
  usage?: {
    description?: string;
    bestPractices?: BestPractice[];
  };
}

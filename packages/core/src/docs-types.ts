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
 * Documents a public CSS custom property that themes can set on a component
 * via component style overrides in `defineTheme`.
 *
 * @example
 * ```
 * {name: 'padding', description: 'Controls Card container padding. Mapped to container tokens automatically.', default: 'var(--spacing-4)'}
 * ```
 */
export interface CSSPropertyDoc {
  /** The CSS custom property name. Always starts with `--xds-`. */
  name: string;
  /** What this property controls, in 1-2 sentences. */
  description: string;
  /** Default value if not set by theme. e.g. `"var(--spacing-4)"` */
  default?: string;
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
 * { property: 'padding', vars: ['--_composer-padding', '--_composer-button-offset'] }
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
  /** What this derived mapping controls, in 1-2 sentences. */
  description?: string;
  /** Default value as a CSS expression if not set by theme.
   *  e.g. `'var(--radius-container)'`, `'var(--spacing-4)'` */
  default?: string;
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
 * {name: '--card-radius', description: 'Border radius', default: 'var(--radius-container)'}
 * {name: '--card-concentric-radius', description: 'Inner radius', derived: true, formula: 'max(0px, calc(var(--card-radius) - var(--card-padding)))'}
 * ```
 */
export interface ComponentVar {
  /** CSS custom property name, e.g. '--card-radius' */
  name: string;
  /** What this var controls */
  description: string;
  /** Default value as a CSS expression, e.g. 'var(--radius-container)' */
  default: string;
  /** Whether this var is derived from other vars (not directly settable) */
  derived?: boolean;
  /** CSS expression showing how derived vars are computed */
  formula?: string;
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
    /** Public CSS custom properties that themes can set on this component
     *  via component overrides. Only document supported public properties —
     *  internal variables must not be listed here. */
    cssProperties?: CSSPropertyDoc[];
    /** Maps standard CSS properties to internal vars for theme pipeline
     *  expansion. Ordered by priority — earlier entries emit first.
     *  The pipeline reads this to know: when a theme sets `borderRadius`
     *  on this component, also emit `--_card-radius`.
     *  @see DerivedVar */
    derived?: DerivedVar[];
  };
  /** Component usage documentation — concise summary, best practices,
   *  and optional visual anatomy. */
  usage: UsageDoc;
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
    };

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
  /** Human-readable title. e.g. 'XDS Design Tokens' */
  title: string;
  /** One-line summary shown in topic listings. */
  description: string;
  /** Ordered sections that make up the doc. */
  sections: ReferenceSection[];
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
  description: string;

  /** Whether this template is ready for use. Templates with
   *  isReady: false show as "(WIP)" in the gallery and CLI. */
  isReady: boolean;
}

export interface PageTemplateDoc extends BaseTemplateDoc {
  type: 'page';
}

export interface BlockTemplateDoc extends BaseTemplateDoc {
  type: 'block';
  /** Width-to-height ratio for preview containers (e.g. 16/9, 1, 3/4). */
  aspectRatio: number;
  /** Scale factor for the block preview (default 1). */
  scale?: number;
  /** Component names this block uses, for cross-referencing. */
  componentsUsed: string[];
}

export type TemplateDoc = PageTemplateDoc | BlockTemplateDoc;

/**
 * Showcase metadata for a component.
 *
 * Each component can have a showcase file in `packages/cli/templates/showcase/`
 * consisting of a `{Name}.doc.mjs` (this type) and a `{Name}.tsx` (the component).
 *
 *   /\*\* \@type \{import('@xds/core').ComponentShowcaseDoc\} *\/
 *   export const doc = \{ name: 'Button', aspectRatio: 1 \};
 */
export interface ComponentShowcaseDoc {
  /** Component name (matches the directory name).
   *  e.g. `"Button"`, `"Layout"`, `"Dialog"` */
  name: string;
  /** Width-to-height ratio for the preview container.
   *  e.g. `1`, `16 / 9`, `4 / 3` */
  aspectRatio: number;
}

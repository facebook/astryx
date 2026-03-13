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
 * A usage example showing the component in JSX. Examples should progress
 * from basic to advanced. Include 2-5 examples per component (complex
 * components like Table or Layer may justify more).
 *
 * @example
 * ```
 * {label: 'Basic', code: '<XDSButton variant="primary">Save</XDSButton>'}
 * {label: 'With icon', code: '<XDSButton icon={PlusIcon} variant="secondary">Add</XDSButton>'}
 * ```
 */
export interface Example {
  /** Short descriptive title in sentence case, 2-8 words.
   *  e.g. `"Basic"`, `"With icon"`, `"Rich cell content with renderCell"`.
   *  Omit only for trivial single-example sub-components. */
  label?: string;
  /** JSX code string. Use regular strings for single-line snippets and
   *  template literals for multi-line code. Prefer realistic variable names
   *  (`users`, `transactions`) over generic ones (`data`, `value1`). */
  code: string;
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
  /** At least one usage example for this component. */
  examples: Example[];
}

/**
 * Shared fields between single-component and multi-component docs.
 * Do not use this interface directly — use `ComponentDoc` (the union type).
 */
interface BaseDoc {
  /** Directory name without the XDS prefix, PascalCase.
   *  e.g. `"Button"`, `"Table"`, `"TextInput"`, `"AppShell"` */
  name: string;
  /** One-sentence summary of the component or component group.
   *  Be specific enough to differentiate from similar components.
   *  e.g. `"Data-driven table with rich cell content via renderCell."` */
  description: string;
  /** Top-level usage examples showing the component in real scenarios.
   *  For multi-component dirs, these show how the components work together.
   *  Start with the most common usage pattern, then progress to advanced.
   *  Include 2-5 examples (complex components may justify more). */
  examples: Example[];
  /** Key capabilities as short bullet points. Each string is one feature.
   *  Strongly recommended even though optional — all existing components
   *  include this field. Use "Category: details" format.
   *  e.g. `"Variants: 'primary', 'secondary', 'ghost', 'destructive'"`,
   *  `"Single & range modes: pass a number or [number, number]"` */
  features?: string[];
  /** Theming configuration. Documents the stable CSS class names
   *  rendered by this component that themes can target via `@scope`
   *  selectors in `defineTheme`. */
  theming?: {
    /** CSS class targets rendered by this component.
     *  Each entry corresponds to an `xdsClassName()` call in the source. */
    targets: ThemingTarget[];
  };
  /** Accessibility notes — ARIA patterns, screen reader behavior.
   *  Each string is one self-contained, declarative note.
   *  e.g. `"Uses native <dialog> with showModal() for correct ARIA modal semantics."`,
   *  `"Selection plugin sets aria-selected on selected body rows"` */
  accessibility?: string[];
  /** Keyboard interaction summary as a single string. Separate bindings
   *  with semicolons or commas. Use key names like `Arrow keys`, `Enter/Space`,
   *  `Escape`, `Tab/Shift+Tab`, `Home/End`.
   *  e.g. `"Space toggles the switch; Tab/Shift+Tab moves focus in and out"` */
  keyboard?: string;
  /** Additional technical notes — architecture decisions, performance
   *  considerations, implementation details, caveats. Each string is one
   *  self-contained note. Do not duplicate information from `features`,
   *  `accessibility`, or `keyboard`. */
  notes?: string[];
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
 * The CLI merges this onto the base `docs` at read time — props, examples,
 * types, defaults, and code all come from `docs`.
 *
 * Used by both `docsZh` (Chinese translation) and `docsDense` (compressed format).
 *
 * @example
 * ```
 * export const docsDense = {
 *   description: 'multi-variant btn w/ loading',
 *   features: ['4 variants: primary secondary ghost destructive'],
 *   propDescriptions: { label: 'a11y label; aria-label for icon-only' },
 *   notes: ['prefer over div onClick for a11y'],
 * };
 * ```
 */
export interface TranslationDoc {
  /** Compressed/translated component description. */
  description: string;
  /** Compressed/translated feature strings. Must match docs.features length and order. */
  features?: string[];
  /** Compressed/translated note strings. Must match docs.notes length and order. */
  notes?: string[];
  /** Compressed/translated accessibility strings. Must match docs.accessibility length and order. */
  accessibility?: string[];
  /** Compressed/translated keyboard string. */
  keyboard?: string;
  /** Prop descriptions keyed by prop name. Only include props that have descriptions. */
  propDescriptions?: Record<string, string>;
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

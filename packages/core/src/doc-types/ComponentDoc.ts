// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Component doc shape + authoring factory.
 *
 * `ComponentDoc` is the type a component's `{Name}.doc.mjs` exports as `docs`
 * (single-, multi-, or sub-component form). `createComponentDoc()` is a typed
 * identity - it type-checks the object against `ComponentDoc` (so a bad key
 * like `defaultValue` fails at author time) and returns it unchanged. Zero
 * runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {
  PropDoc,
  ThemingTarget,
  ComponentVar,
  DerivedVar,
  UsageDoc,
  ExampleDoc,
  PlaygroundConfig,
} from './common';
import type {HookParamDoc, HookReturnDoc} from './HookDoc';

/**
 * Documents one component within a multi-component directory. Used when a
 * directory exports multiple public components (e.g. Table exports Table,
 * BaseTable, TableRow, TableCell, TableHeaderCell).
 *
 * Also use for hooks that are part of a component API (e.g.
 * useTableSelection). For hook entries, document arguments in `params`
 * and return fields in `returns` so the docsite renders a Parameters / Returns
 * signature instead of an interactive Properties playground. Order components
 * with the primary/most-used component first.
 */
export interface ComponentEntry {
  /** Full export name including Astryx prefix. e.g. `"TableRow"`,
   *  `"DialogHeader"`, `"useTableSelection"` */
  name: string;
  /** Human-readable display name for this subcomponent. Matches the import
   *  name visually with spaces between PascalCase / camelCase words
   *  (e.g. `"TableRow"` → `"Astryx Table Row"`). See `BaseDoc.displayName`. */
  displayName: string;
  /** One-sentence description of what this specific component does.
   *  For sub-components, explain the role within the parent composition. */
  description: string;
  /** All public props for this component. Omit for hook entries. */
  props?: PropDoc[];
  /** Hook parameters or options object fields. Use for `use*` entries. */
  params?: HookParamDoc[];
  /** Hook return value fields. Use for `use*` entries. */
  returns?: HookReturnDoc[];
  /** Usage documentation for this specific component or hook. */
  usage?: UsageDoc;
  /** Components this hook is commonly used with. */
  relatedComponents?: string[];
  /** Other hooks this hook is commonly used with. */
  relatedHooks?: string[];
  /** Short code examples rendered by the CLI after the props table. */
  examples?: ExampleDoc[];
  /** When true, this sub-component is excluded from the overview page. */
  isHiddenFromOverview?: boolean;
  /** Playground configuration for this specific component. Falls back to
   *  the directory doc's `playground` when omitted — declare one here when
   *  siblings must not share it (e.g. an overlay drawer whose toggle
   *  sub-component should not inherit `overlay: true`). */
  playground?: PlaygroundConfig;
}

/**
 * Shared fields between single-component and multi-component docs.
 * Do not use this interface directly — use `ComponentDoc` (the union type).
 */
interface BaseDoc {
  /** Directory name without the Astryx prefix, PascalCase.
   *  e.g. `"Button"`, `"Table"`, `"TextInput"`, `"AppShell"` */
  name: string;
  /** Human-readable display name with spaces between words, used by the
   *  docsite gallery and sidebar. Matches the import name visually (so
   *  `"AppShell"` → `"App Shell"`, `"ChatMessageMetadata"` → `"Chat
   *  Message Metadata"`). Required so authors stay in control of how
   *  each component reads in the UI rather than relying on a build-time
   *  regex derivation. Backfill with
   *  `apps/docsite/scripts/backfill-display-name.mjs`. */
  displayName: string;
  /** Search keywords for CLI discovery. Terms a developer might type when
   *  looking for this component: synonyms, related UI concepts, and common
   *  names from other design systems (MUI, Chakra, Radix, shadcn).
   *  Lowercase only. Used by `astryx component <term>` for fuzzy matching.
   *  e.g. `['accordion', 'expand', 'toggle', 'disclosure']` for Collapsible */
  keywords?: string[];
  /** Sub-component names to hide from human-facing UI (CLI listings,
   *  docs catalogs). The components stay public and importable — agents
   *  and tooling can still discover them via source. Use when the
   *  directory's doc covers a group but some Astryx*.tsx files shouldn't
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
  /** Component category for the overview page gallery. Independent of
   *  `group` (which is for the sidebar). Categories represent the
   *  component's functional role in a UI.
   *
   *  Valid values:
   *  - `'Action'` — interactive triggers: buttons, links, toggles, menus
   *  - `'Chat'` — conversational UI: messages, composers, layouts
   *  - `'Container'` — wrappers: cards, carousels, collapsibles
   *  - `'Content'` — display: text, icons, avatars, code blocks
   *  - `'Data Input'` — data entry: text fields, selectors, date pickers
   *  - `'Data Visualization'` — charts, graphs, 3D visualizations
   *  - `'Feedback & Status'` — progress indication: spinners, banners, badges
   *  - `'Layout'` — structural: grid, stack, dividers, app shell
   *  - `'Navigation'` — wayfinding: tabs, breadcrumbs, sidebars
   *  - `'Overlay'` — layered UI: dialogs, popovers, tooltips
   *  - `'Table & List'` — tabular and list data display
   *  - `'Utility'` — providers and context: themes, link providers */
  category?:
    | 'Action'
    | 'Chat'
    | 'Container'
    | 'Content'
    | 'Data Input'
    | 'Data Visualization'
    | 'Feedback & Status'
    | 'Layout'
    | 'Navigation'
    | 'Overlay'
    | 'Table & List'
    | 'Utility';
  /** When true, this component is excluded from the categorized overview
   *  page but remains in the sidebar and CLI. Use for sub-components that
   *  only make sense within a parent (e.g. BreadcrumbItem, DialogHeader)
   *  or internal primitives that shouldn't appear in the gallery. */
  isHiddenFromOverview?: boolean;
  /** Theming configuration. Documents the stable selector surface rendered
   *  by this component: `xds-*` classes plus data-attribute reflections that
   *  themes can target via `@scope` selectors in `defineTheme`. */
  theming?: {
    /** Whether this component is a container whose `padding` properties
     *  should be mapped to container tokens by the theme pipeline.
     *  When true, `padding`, `paddingBlock`, `paddingInline` etc. in
     *  component overrides are expanded to `--container-padding-*` and
     *  `--layout-padding-*` tokens instead of emitting raw CSS. */
    container?: boolean;
    /** Selector targets rendered by this component.
     *  Each entry corresponds to an `themeProps()` call in the source. */
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
  /** Short code examples rendered by the CLI after the props table. */
  examples?: ExampleDoc[];

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
 * A cross-link reference to a sub-component that lives in its own sibling
 * `{Name}.doc.mjs` file (see {@link SubComponentDoc}). The parent's
 * `components` array lists these names so the family stays discoverable;
 * the entry's content is emitted from the sub-component's own file, not here.
 */
export interface ComponentRef {
  /** Full export name including Astryx prefix, e.g. `"ChatComposer"`. Must
   *  match the `name` field of the referenced sub-component's own doc. */
  name: string;
}

/**
 * Documentation for a directory that exports multiple public components.
 * Props live on each entry in `components`.
 *
 * Use this when the directory has multiple `XDS*.tsx` files
 * (e.g. Table, Dialog, TabList, TopNav, Layout).
 *
 * Each `components` entry is either a full {@link ComponentEntry} (inline
 * sub-component) or a name-only {@link ComponentRef} pointing at a sibling
 * `{Name}.doc.mjs` file. The two styles can be mixed during migration.
 */
export interface MultiComponentDoc extends BaseDoc {
  /** Each public component/hook exported from this directory — either an
   *  inline entry or a name-only reference to a sibling sub-component doc. */
  components: (ComponentEntry | ComponentRef)[];
}

/**
 * Documentation for a single sub-component that lives in its own
 * `{Name}.doc.mjs` file inside its parent's directory. Identified by the
 * `subComponentOf` field, which names the parent component.
 *
 * A sub-component owns its `description`, `props`, and (optionally) its own
 * `usage`. Family-level fields (`group`, `category`, `keywords`, `theming`,
 * `playground`) are inherited from the directory's primary doc unless
 * overridden here. The generated registry entry is identical to the legacy
 * inline `components[]` expansion — this is purely a file-structure change.
 */
export interface SubComponentDoc extends Omit<BaseDoc, 'usage'> {
  /** Name of the parent component this sub-component belongs to, matching the
   *  parent doc's `name` (e.g. `"Chat"`). Marks this file as a sub-component
   *  doc so the pipeline parents and inherits family fields correctly. */
  subComponentOf: string;
  /** One-sentence description of what this sub-component does and its role
   *  within the parent composition. */
  description: string;
  /** All public props for this sub-component. */
  props: PropDoc[];
  /** Usage is optional for sub-components — when omitted, generated surfaces
   *  should use the sub-component's own description as the concise usage
   *  summary (not inherited from the parent, which was the #2602 bug). */
  usage?: UsageDoc;
}

/**
 * The documentation type for a component directory's {Name}.doc.mjs file.
 *
 * Every .doc.mjs must export a single `docs` constant of this type:
 *
 *   /\*\* \@type \{import('@astryxdesign/core/doc-types').ComponentDoc\} *\/
 *   export const docs = createComponentDoc(\{ ... \});
 *
 * Use SingleComponentDoc (with `props`) for single-component directories.
 * Use MultiComponentDoc (with `components`) for multi-component directories.
 * Use SubComponentDoc (with `subComponentOf`) for a sub-component that lives
 * in its own file inside its parent's directory.
 */
export type ComponentDoc =
  SingleComponentDoc | MultiComponentDoc | SubComponentDoc;

/** Authoring factory for a component `.doc.mjs`. Type-checks + returns as-is. */
export function createComponentDoc(doc: ComponentDoc): ComponentDoc {
  return doc;
}

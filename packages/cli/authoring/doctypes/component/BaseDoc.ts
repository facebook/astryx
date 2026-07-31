// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ComponentVar} from '../base/ComponentVar';
import type {DerivedVar} from '../base/DerivedVar';
import type {ExampleDoc} from '../base/ExampleDoc';
import type {PlaygroundConfig} from '../base/PlaygroundConfig';
import type {ThemingTarget} from '../base/ThemingTarget';
import type {UsageDoc} from '../base/UsageDoc';

/**
 * Shared fields between single-component and multi-component docs.
 * Do not use this interface directly — use `ComponentDoc` (the union type).
 */
export interface BaseDoc {
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

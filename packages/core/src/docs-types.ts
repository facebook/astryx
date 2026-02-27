/**
 * @file Type definitions for component documentation.
 *
 * Every component directory under `packages/core/src/` has a `README.tsx`
 * that exports a single `docs` constant of type `ComponentDoc`. The CLI
 * imports these directly — no markdown parsing needed.
 */

/**
 * Documents a single component prop. Each prop the component accepts
 * should have an entry. Skip internal/styling props like `xstyle`,
 * `className`, `style`, and `data-testid`.
 *
 * @example
 * {name: 'label', type: 'string', description: 'Visible label text', required: true}
 * {name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Control size', default: "'md'"}
 */
export interface PropDoc {
  /** Prop name exactly as used in JSX. e.g. `"onChange"`, `"isDisabled"` */
  name: string;
  /** TypeScript type signature as a string. Use single quotes inside unions.
   *  e.g. `"string"`, `"boolean"`, `"'sm' | 'md' | 'lg'"`, `"(value: string) => void"` */
  type: string;
  /** What this prop does, in one sentence. */
  description: string;
  /** Default value as a string, if the prop is optional and has one.
   *  e.g. `"false"`, `"'md'"`, `"'balanced'"`. Omit if no default. */
  default?: string;
  /** True if the prop must be provided. Omit (don't set to false) if optional. */
  required?: boolean;
}

/**
 * A usage example showing the component in JSX. Examples should progress
 * from simple to complex. Include 2-5 examples per component.
 *
 * @example
 * {label: 'Basic', code: '<XDSButton variant="primary">Save</XDSButton>'}
 * {label: 'With icon', code: '<XDSButton icon={PlusIcon} variant="secondary">Add</XDSButton>'}
 */
export interface Example {
  /** Short label describing this example. e.g. `"Basic"`, `"With icon"`,
   *  `"24-hour format"`. Omit only for trivial single-example components. */
  label?: string;
  /** TSX code string. Can be a single JSX expression or a multi-line snippet.
   *  Use template literals for multi-line code. */
  code: string;
}

/**
 * A themeable style surface that consumers can override via their theme's
 * `ComponentStyles`. Each component exposes named surfaces (e.g. `root`,
 * `trigger`, `track`) that map to internal styled elements.
 *
 * @example
 * {name: 'root', description: 'Outer wrapper element'}
 * {name: 'track', description: 'Slider track background'}
 */
export interface ThemingSurface {
  /** Surface key as used in the theme object. e.g. `"root"`, `"trigger"`, `"dropdown"` */
  name: string;
  /** What this surface styles, in a few words. */
  description: string;
}

/**
 * Documents one component within a multi-component directory. Used when a
 * directory exports multiple public components (e.g. Table exports XDSTable,
 * XDSBaseTable, XDSTableRow, XDSTableCell, XDSTableHeaderCell).
 *
 * Also use for hooks with config objects (e.g. useXDSTableSelection) —
 * treat config options as "props".
 */
export interface ComponentEntry {
  /** Full export name including XDS prefix. e.g. `"XDSTableRow"`, `"XDSDialogHeader"` */
  name: string;
  /** One-sentence description of what this specific component does. */
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
  /** Display name for the component directory. Usually the directory name
   *  without the XDS prefix. e.g. `"Button"`, `"Table"`, `"TextInput"` */
  name: string;
  /** One-sentence summary of what this component (or component group) does.
   *  Should be concise enough for a listing. */
  description: string;
  /** Top-level usage examples showing the component in real scenarios.
   *  For multi-component dirs, these show how the components work together.
   *  Include 2-5 examples progressing from basic to advanced. */
  examples: Example[];
  /** Key capabilities as short bullet points. Each string is one feature.
   *  e.g. `"Accessible — uses native checkbox semantics"`,
   *  `"Supports density variants: compact, balanced, spacious"` */
  features?: string[];
  /** Theming configuration. Include this if the component supports
   *  style overrides via the theme's `ComponentStyles`. */
  theming?: {
    /** The key used in the theme's `components` object.
     *  e.g. `"button"`, `"switch"`, `"table"` — always lowercase. */
    componentKey: string;
    /** All styleable surfaces this component exposes. */
    surfaces: ThemingSurface[];
  };
  /** Accessibility notes — ARIA patterns, screen reader behavior,
   *  keyboard interaction details not covered by the `keyboard` field.
   *  Each string is one self-contained note. */
  accessibility?: string[];
  /** Keyboard interaction summary. Short prose describing key bindings.
   *  e.g. `"↑↓ navigate, Enter/Space select, Escape close, Home/End jump"` */
  keyboard?: string;
  /** Additional technical notes — architecture decisions, performance
   *  considerations, implementation details, caveats. Each string is one
   *  self-contained note. Use for anything that doesn't fit the other fields. */
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
 * The documentation type for a component directory's README.tsx.
 *
 * Every README.tsx must export a single `docs` constant of this type:
 *
 *   import type \{ComponentDoc\} from '../docs-types';
 *   export const docs: ComponentDoc = \{ ... \};
 *
 * Use SingleComponentDoc (with `props`) for single-component directories.
 * Use MultiComponentDoc (with `components`) for multi-component directories.
 */
export type ComponentDoc = SingleComponentDoc | MultiComponentDoc;

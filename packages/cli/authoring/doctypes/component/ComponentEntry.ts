// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ExampleDoc} from '../base/ExampleDoc';
import type {HookParamDoc} from '../base/HookParamDoc';
import type {HookReturnDoc} from '../base/HookReturnDoc';
import type {PlaygroundConfig} from '../base/PlaygroundConfig';
import type {PropDoc} from '../base/PropDoc';
import type {UsageDoc} from '../base/UsageDoc';

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

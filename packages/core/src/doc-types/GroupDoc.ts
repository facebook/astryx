// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Group doc shape + authoring factory.
 *
 * `GroupDoc` is category metadata for a cluster of related components (the
 * canonical component a group label links to). `createGroupDoc()` is a typed
 * identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

/**
 * Metadata for a component group that is NOT itself a component.
 *
 * Some groups (e.g. 'Checkbox', 'Layout', 'Tabs') are category labels —
 * they cluster related components but have no corresponding Astryx*.tsx file.
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

/** Authoring factory for a single group doc entry. Type-checks + returns as-is. */
export function createGroupDoc(doc: GroupDoc): GroupDoc {
  return doc;
}

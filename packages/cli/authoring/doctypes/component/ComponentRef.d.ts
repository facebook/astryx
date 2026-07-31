// Copyright (c) Meta Platforms, Inc. and affiliates.

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

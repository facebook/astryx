// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {BaseDoc} from './BaseDoc';
import type {ComponentEntry} from './ComponentEntry';
import type {ComponentRef} from './ComponentRef';

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

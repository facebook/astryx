// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {MultiComponentDoc} from './MultiComponentDoc';
import type {SingleComponentDoc} from './SingleComponentDoc';
import type {SubComponentDoc} from './SubComponentDoc';

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
 * Use SubComponentDoc (with `subComponentOf`) for a sub-component that lives
 * in its own file inside its parent's directory.
 */
export type ComponentDoc =
  SingleComponentDoc | MultiComponentDoc | SubComponentDoc;

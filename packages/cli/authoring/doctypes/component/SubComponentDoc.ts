// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {BaseDoc} from './BaseDoc';
import type {PropDoc} from '../base/PropDoc';
import type {UsageDoc} from '../base/UsageDoc';

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

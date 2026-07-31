// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {HookParamDoc} from '../base/HookParamDoc';
import type {HookReturnDoc} from '../base/HookReturnDoc';
import type {UsageDoc} from '../base/UsageDoc';

/**
 * Documentation for a standalone hook's .doc.mjs file.
 *
 * Hooks that are part of a component's API (e.g. useImperativeDialog)
 * should be documented in the component's MultiComponentDoc.components array.
 *
 * Standalone hooks (e.g. useMediaQuery, useFocusTrap, useOverflow) get
 * their own {hookName}.doc.mjs file and use this type.
 *
 * Every hook .doc.mjs must export a single `docs` constant:
 *
 *   /\*\* @type {import('../docs-types').HookDoc} \*\/
 *   export const docs = { ... };
 */
export interface HookDoc {
  /** Hook name exactly as exported, e.g. 'useMediaQuery', 'useFocusTrap'. */
  name: string;
  /** Human-readable display name for the hook. Hooks read better as the
   *  raw identifier ('useMediaQuery') than spaced ('use Media Query'), so
   *  the codemod keeps the identifier verbatim. See `BaseDoc.displayName`. */
  displayName: string;
  /** Optional group for sidebar/docs organization — same as ComponentDoc.group. */
  group?: string;
  /** Search keywords for CLI discovery. */
  keywords?: string[];
  /** Hook parameters or options object fields. */
  params: HookParamDoc[];
  /** Return value documentation. For object returns, list each field.
   *  For primitive returns, use a single entry. */
  returns: HookReturnDoc[];
  /** Usage documentation — description, best practices. */
  usage: UsageDoc;
  /** Component names this hook is commonly used with.
   *  Enables cross-referencing: \`astryx component Toast\` can mention useToast,
   *  and \`astryx hook useToast\` can link back to Toast. */
  relatedComponents?: string[];
  /** Other hook names this hook is commonly used with. */
  relatedHooks?: string[];
  /** Import path, e.g. '@astryxdesign/core/hooks' or '@astryxdesign/core/Toast'. */
  importPath?: string;
  /** Category for grouping in listings. */
  category?: string;
}

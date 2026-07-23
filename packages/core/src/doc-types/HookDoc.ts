// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Hook doc shape + authoring factory.
 *
 * `HookDoc` documents a standalone hook (params / returns) instead of a
 * component's props. `createHookDoc()` is a typed identity - it type-checks the
 * object against `HookDoc` and returns it unchanged. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

import type {UsageDoc, BestPractice} from './common';

/**
 * Documents a hook parameter/option. Similar to PropDoc but for hook
 * arguments and options object fields.
 */
export interface HookParamDoc {
  /** Parameter or option field name. */
  name: string;
  /** TypeScript type signature as a string. */
  type: string;
  /** What this parameter does. 1-2 sentences. */
  description: string;
  /** Default value as a string, if optional with a default. */
  default?: string;
  /** True if required. Omit if optional. */
  required?: boolean;
}

/**
 * Documents a hook's return value field.
 */
export interface HookReturnDoc {
  /** Field name on the returned object, or 'value' for primitive returns. */
  name: string;
  /** TypeScript type. */
  type: string;
  /** What this return value provides. */
  description: string;
}

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
 *   /\*\* @type {import('@astryxdesign/core/doc-types').HookDoc} \*\/
 *   export const docs = createHookDoc({ ... });
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

/**
 * Translation overlay for hook documentation.
 */
export interface HookTranslationDoc {
  /** Compressed/translated description. */
  description?: string;
  /** Param descriptions keyed by param name. */
  paramDescriptions?: Record<string, string>;
  /** Return descriptions keyed by field name. */
  returnDescriptions?: Record<string, string>;
  /** Translated usage. */
  usage?: {
    description?: string;
    bestPractices?: BestPractice[];
  };
}

/** Authoring factory for a hook `.doc.mjs`. Type-checks + returns as-is. */
export function createHookDoc(doc: HookDoc): HookDoc {
  return doc;
}

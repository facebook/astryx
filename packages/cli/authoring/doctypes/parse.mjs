// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The doc load boundary. `parseDoc` validates an unknown loaded doc value
 * into its typed shape (or throws a readable error), dispatching on the stamped
 * `type` and falling back to legacy shape-sniffing for unstamped docs. Its
 * acceptance set matches the old permissive `ComponentDocSchema` exactly, so
 * every existing `.doc.*` keeps loading unchanged.
 */

import {parseComponent} from './component/parse.mjs';
import {parseHook} from './hook/parse.mjs';
import {parseReference} from './reference/parse.mjs';
import {parseTemplate} from './template/parse.mjs';
import {parseSchema} from './schema/parse.mjs';
import {parseCommand} from './command/parse.mjs';
import {parseEnum} from './enum/parse.mjs';
import {parseLegacyDoc} from './legacy.mjs';

/** @typedef {import('./types').ComponentDoc} ComponentDoc */
/** @typedef {import('./types').HookDoc} HookDoc */
/** @typedef {import('./types').FunctionDoc} FunctionDoc */
/** @typedef {import('./types').ReferenceDoc} ReferenceDoc */
/** @typedef {import('./types').TemplateDoc} TemplateDoc */
/** @typedef {import('./types').SchemaDoc} SchemaDoc */
/** @typedef {import('./types').CommandDoc} CommandDoc */
/** @typedef {import('./types').EnumDoc} EnumDoc */

/**
 * Validate an unknown loaded doc value into its typed shape, or throw.
 * Dispatches on the stamped `type`; unstamped docs fall back to
 * shape-sniffing. The reference/topic discriminant is `'generic'`; a hook and a
 * CLI/API function share `'function'`.
 *
 * @param {unknown} input
 * @param {string} [label]
 * @returns {ComponentDoc | HookDoc | FunctionDoc | ReferenceDoc | TemplateDoc | SchemaDoc | CommandDoc | EnumDoc}
 */
export function parseDoc(input, label = 'doc') {
  const type =
    input && typeof input === 'object' && 'type' in input
      ? /** @type {{type?: unknown}} */ (input).type
      : undefined;

  switch (type) {
    case 'component':
      return parseComponent(input, label);
    case 'function':
      return parseHook(input, label);
    case 'generic':
      return parseReference(input, label);
    case 'page':
    case 'block':
      return parseTemplate(input, label);
    case 'schema':
      return parseSchema(input, label);
    case 'command':
      return parseCommand(input, label);
    case 'enum':
      return parseEnum(input, label);
    default:
      return parseLegacyDoc(input, label);
  }
}

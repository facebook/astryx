// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The build subject's environment access: the page templates a project
 * can scaffold, and the components it can use.
 *
 * @input Template and component discovery for `cwd` — the CLI's own templates
 *   and Core's components, plus any that the project's configured integrations
 *   contribute.
 * @output Ready page templates as `{name, displayName, description, category,
 *   keywords, command}`, where `command` is the `astryx template` command that
 *   selects exactly that template; components as `{name, keywords}`.
 * @position Beside build.mjs (api/build/). The kit leaf reads templates and
 *   components only through here, because a subject's `_adapter.mjs` is its
 *   only environment access. This adds no discovery of its own: templates come
 *   from the template subject's, components from search's.
 */

import {discoverTemplates} from '../template/template.mjs';
import {componentKeywords} from '../search/search.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';

/**
 * A page template the kit can recommend starting from.
 * @typedef {object} PageTemplate
 * @property {string} name The template's own id, as search reports it.
 * @property {string} command `astryx template <id> --type page`, the command that selects exactly this template: an integration replacement is selected by the Core id it replaces, and `--type page` keeps a block with the same id from making it ambiguous. Search prints template commands the same way.
 * @property {string} displayName Human-facing name.
 * @property {string} description What the page is and how it is laid out.
 * @property {string} category The template's own `Family - Variant` label; empty when it declares none.
 * @property {string[]} keywords The ideas the page serves, as its own descriptor names them; empty when it declares none.
 */

/**
 * A component the project can use, as the ranker reads it.
 * @typedef {object} ComponentWords
 * @property {string} name The component's name, e.g. `DateRangeInput`.
 * @property {string[]} keywords The keywords its own doc declares.
 */

/**
 * Every ready page template the project can scaffold, in discovery order. This
 * is the default discovery view: an active integration replacement stands in
 * for the Core template it replaces, as it does for `astryx template <id>`.
 *
 * Discovery failures leave the kit without a start rather than failing the
 * command: the kit still carries its search matches, and `template --list`
 * reports what went wrong.
 *
 * @param {string} cwd
 * @returns {Promise<PageTemplate[]>}
 */
export async function loadPageTemplates(cwd) {
  let templates;
  try {
    templates = await discoverTemplates(cwd);
  } catch {
    return [];
  }
  return templates
    .filter(t => t.type === 'page' && t.isReady !== false)
    .map(t => ({
      name: t.dirName,
      displayName: t.displayName || t.name,
      description: t.description || '',
      category: t.category || '',
      keywords: t.keywords ?? [],
      // The id `template()` resolves back to this entry: an active replacement
      // owns the Core id it names, so that id selects it, not its own.
      command: `astryx template ${t.replaces ?? t.dirName} --type page`,
    }));
}

/**
 * The components the project can use, Core's and its integrations', each with
 * the keywords its own doc declares: what the ranker reads to tell a part of a
 * page from a page. Search's own discovery, so both agree on what exists; empty
 * when Core cannot be found.
 *
 * @param {string} cwd
 * @returns {Promise<ComponentWords[]>}
 */
export async function loadComponents(cwd) {
  const coreDir = findCoreDir(cwd);
  if (!coreDir) return [];
  try {
    return await componentKeywords(coreDir, cwd);
  } catch {
    return [];
  }
}

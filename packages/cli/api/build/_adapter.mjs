// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The build subject's environment access: the page templates a project
 * can scaffold.
 *
 * @input Template discovery for `cwd` — the CLI's own templates plus any that
 *   the project's configured integrations contribute.
 * @output Ready page templates as `{name, displayName, description, category,
 *   command}`, where `command` is the `astryx template` command that selects
 *   exactly that template.
 * @position Beside build.mjs (api/build/). The kit leaf reads templates only
 *   through here, because a subject's `_adapter.mjs` is its only environment
 *   access. Search keeps its own discovery; this adds none of its own, it
 *   reuses the template subject's.
 */

import {discoverTemplates} from '../template/template.mjs';

/**
 * A page template the kit can recommend starting from.
 * @typedef {object} PageTemplate
 * @property {string} name The template's own id, as search reports it.
 * @property {string} command `astryx template <id> --type page`, the command that selects exactly this template: an integration replacement is selected by the Core id it replaces, and `--type page` keeps a block with the same id from making it ambiguous. Search prints template commands the same way.
 * @property {string} displayName Human-facing name.
 * @property {string} description What the page is: its layout and the ideas it serves.
 * @property {string} category The template's own `Family - Variant` label; empty when it declares none.
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
      // The id `template()` resolves back to this entry: an active replacement
      // owns the Core id it names, so that id selects it, not its own.
      command: `astryx template ${t.replaces ?? t.dirName} --type page`,
    }));
}

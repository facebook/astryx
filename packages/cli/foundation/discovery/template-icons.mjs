// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Template icon mapping (AST-084 FR9, FR10): rewrite a template's icon
 * imports to the project's icon set, by icon definition.
 *
 * Source text, the template's declared icons, and icon-set data in; source
 * text and a report out. The CLI knows no icon library: a template says, in
 * its own descriptor's `icons`, which icon definition each icon it imports
 * draws (`{TrashIcon: 'delete'}`), and an icon an installed set ships draws
 * the definitions that set's `map` names it for. Each such icon maps to the
 * project set's icon that:
 *   1. names it in a reviewed `matches` entry with `exact` or `strong`
 *      confidence (for an icon an installed set ships);
 *   2. otherwise is the icon the project set's `map` names for the Astryx
 *      icon definition the source icon draws.
 * Nothing is guessed from names or words. A `likely` reviewed match is never
 * applied: a kept icon names it as a suggestion.
 * The import and every reference to the imported name use the mapped export;
 * a name that would collide with another binding in the file is imported
 * under an alias. An icon from an installed set that names a variant (a solid
 * appearance) maps to the target's variant with that appearance, else its
 * default. An icon with no match keeps its original import and is reported as
 * kept. Without a project icon set the source is unchanged and the report
 * says why.
 *
 * @input Template source, its declared icons, the installed sets, and the
 *   project's choice
 * @output The rewritten source and the `icons` report
 * @position packages/cli/foundation/discovery — read by template show/copy
 */

import {parse} from '@babel/parser';
import {definitionsByIcon} from './icon-set-discovery.mjs';
import {astryxDefinitionsByName} from './icon-definition-discovery.mjs';

/** @typedef {import('./icon-set-discovery.mjs').DiscoveredIconSet} DiscoveredIconSet */
/** @typedef {import('./icon-set-discovery.mjs').IconSetChoice} IconSetChoice */
/** @typedef {import('../../authoring/doctypes/icon-set/type').IconSetIcon} IconSetIcon */

/**
 * A source icon: what an imported icon means.
 * @typedef {object} SourceIcon
 * @property {string | null} setName the installed set it comes from, as a
 *   reviewed match names it; null for an icon only the template declares
 * @property {string} export the export the template imports
 * @property {string} [variant] which variant of its set, as a reviewed match
 *   names it: an installed set's appearance
 * @property {string} id
 * @property {string[]} definitions the Astryx definitions it draws
 * @property {string} [appearance]
 * @property {DiscoveredIconSet} [set] the set it came from, when installed
 */

/**
 * One mapped icon.
 * @typedef {object} MappedIcon
 * @property {{module: string, export: string}} source
 * @property {{set: string, package: string, id: string, module: string, export: string}} target
 * @property {'match' | 'definition'} by `match`: a reviewed
 *   `exact` or `strong` match in the project set's data names the source
 *   icon; `definition`: the target's `map` names it for the Astryx icon
 *   definition the source draws
 */

/**
 * One icon kept as the template wrote it.
 * @typedef {object} KeptIcon
 * @property {string} module
 * @property {string} export
 * @property {string} reason
 * @property {{set: string, id: string, module: string, export: string, confidence: 'likely'}} [suggestion]
 *   a `likely` reviewed match, suggested and never applied
 */

/**
 * What template icon mapping did.
 * @typedef {object} TemplateIconsReport
 * @property {'selected' | 'none' | 'ambiguous' | 'missing'} status the
 *   project's icon-set state; only `selected` maps anything
 * @property {string | null} set the project set as `<package>/<set>`
 * @property {string} reason
 * @property {MappedIcon[]} mapped
 * @property {KeptIcon[]} kept
 */

/**
 * Index every installed set's exports: `<module>\0<export>` → the icon it
 * draws and the appearance of that export.
 * @param {DiscoveredIconSet[]} sets
 * @returns {Map<string, SourceIcon>}
 */
function indexSets(sets) {
  /** @type {Map<string, SourceIcon>} */
  const index = new Map();
  const astryx = astryxDefinitionsByName();
  for (const set of sets) {
    const byIcon = definitionsByIcon(set.data);
    for (const icon of set.data.icons) {
      const module = icon.module ?? set.data.module;
      const base = {
        setName: set.name,
        id: icon.id,
        // Only Astryx's definitions map between sets: a set's own definition is
        // its own vocabulary, and Astryx's wins a shared name.
        definitions: (byIcon.get(icon.id) ?? []).filter(name =>
          astryx.has(name),
        ),
        set,
      };
      const key = `${module}\0${icon.export}`;
      if (!index.has(key)) {
        const appearance = set.data.default?.appearance;
        index.set(key, {
          ...base,
          export: icon.export,
          ...(appearance ? {appearance, variant: appearance} : {}),
        });
      }
      for (const variant of icon.variants ?? []) {
        const variantKey = `${variant.module ?? module}\0${variant.export}`;
        if (!index.has(variantKey)) {
          index.set(variantKey, {
            ...base,
            export: variant.export,
            ...(variant.appearance
              ? {appearance: variant.appearance, variant: variant.appearance}
              : {}),
          });
        }
      }
    }
  }
  return index;
}

/**
 * The target-set icon whose reviewed `matches` name the source icon with one
 * of `confidences`, ties broken by the order the confidences are given and
 * then by id. A match with a `variant` names only that variant of its set; a
 * match without one names every variant.
 * @param {SourceIcon} source
 * @param {DiscoveredIconSet} target
 * @param {readonly string[]} confidences
 * @returns {IconSetIcon | null}
 */
export function reviewedMatch(source, target, confidences) {
  /** @type {{icon: IconSetIcon, rank: number} | null} */
  let best = null;
  for (const icon of target.data.icons) {
    for (const match of icon.matches ?? []) {
      const rank = confidences.indexOf(match.confidence);
      if (
        rank === -1 ||
        match.set !== source.setName ||
        match.export !== source.export ||
        (match.variant != null && match.variant !== source.variant)
      ) {
        continue;
      }
      if (
        !best ||
        rank < best.rank ||
        (rank === best.rank && icon.id < best.icon.id)
      ) {
        best = {icon, rank};
      }
    }
  }
  return best?.icon ?? null;
}

/**
 * The project-set icon a source icon maps to (FR11), or null: a reviewed
 * `exact` or `strong` match, then the icon the project set's `map` names for
 * an Astryx definition the source draws.
 * @param {SourceIcon} source
 * @param {DiscoveredIconSet} target
 * @returns {{icon: IconSetIcon, by: 'match' | 'definition'} | null}
 */
export function matchIcon(source, target) {
  const reviewed = source.setName
    ? reviewedMatch(source, target, ['exact', 'strong'])
    : null;
  if (reviewed) return {icon: reviewed, by: 'match'};
  const icons = target.data.icons;
  for (const name of source.definitions) {
    const id = target.data.map?.[name];
    const icon = id == null ? undefined : icons.find(each => each.id === id);
    if (icon) return {icon, by: 'definition'};
  }
  return null;
}

/**
 * The export a mapped icon uses: the variant with the source's appearance
 * when the target has one, else the default.
 * @param {IconSetIcon} icon
 * @param {DiscoveredIconSet} set
 * @param {string | undefined} appearance
 */
function targetExport(icon, set, appearance) {
  const module = icon.module ?? set.data.module;
  const defaultAppearance = set.data.default?.appearance;
  if (appearance && appearance !== defaultAppearance) {
    const variant = (icon.variants ?? []).find(
      each => each.appearance === appearance,
    );
    if (variant) {
      return {module: variant.module ?? module, export: variant.export};
    }
  }
  return {module, export: icon.export};
}

/** @param {string} source */
function parseSource(source) {
  return parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: false,
  });
}

/**
 * Every node in the tree, with its parent and the key it sits under.
 * @param {any} node
 * @param {(node: any, parent: any, key: string) => void} visit
 * @param {any} [parent]
 * @param {string} [key]
 */
function walk(node, visit, parent = null, key = '') {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit, parent, key);
    return;
  }
  if (
    node == null ||
    typeof node !== 'object' ||
    typeof node.type !== 'string'
  ) {
    return;
  }
  visit(node, parent, key);
  for (const childKey of Object.keys(node)) {
    if (
      childKey === 'loc' ||
      childKey === 'extra' ||
      childKey.endsWith('Comments') ||
      childKey === 'comments' ||
      childKey === 'tokens'
    ) {
      continue;
    }
    const child = node[childKey];
    if (child != null && typeof child === 'object') {
      walk(child, visit, node, childKey);
    }
  }
}

/**
 * Whether an identifier node is a reference to a binding, not a property
 * name or a JSX attribute name.
 * @param {any} node
 * @param {any} parent
 * @param {string} key
 */
function isReference(node, parent, key) {
  if (!parent) return true;
  switch (parent.type) {
    case 'ImportSpecifier':
    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
      return false;
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return key !== 'property' || parent.computed;
    case 'ObjectProperty':
      return key === 'value' || parent.computed;
    case 'ObjectMethod':
    case 'ClassMethod':
    case 'ClassProperty':
      return key !== 'key' || parent.computed;
    case 'JSXAttribute':
      return false;
    case 'JSXMemberExpression':
      return key === 'object';
    case 'TSPropertySignature':
      return key !== 'key';
    default:
      return true;
  }
}

/** What a template reads with no icon-set state given: nothing is mapped. */
export const NO_ICON_SETS = Object.freeze({
  sets: [],
  choice: /** @type {IconSetChoice} */ ({
    status: 'none',
    reason: 'No icon set is installed.',
  }),
});

/**
 * Rewrite a template's icon imports to the project's icon set (FR11, FR12).
 * @param {string} source
 * @param {{sets: DiscoveredIconSet[], choice: IconSetChoice}} iconSets
 * @param {Record<string, string>} [declared] the template's `icons`: the
 *   icon definition each imported icon draws, by its imported name
 * @returns {{source: string, icons: TemplateIconsReport | undefined}} `icons`
 *   is undefined, and the source unchanged, when no icon set is installed and
 *   none is configured: icon sets are experimental (spec:AST-017 FR27), so a
 *   project that does not use them gets exactly the output it always has.
 */
export function mapTemplateIcons(source, {sets, choice}, declared = {}) {
  if (sets.length === 0 && choice.configured == null) {
    return {source, icons: undefined};
  }
  const target = choice.set ?? null;
  /** @type {TemplateIconsReport} */
  const icons = {
    status: choice.status,
    set: target ? `${target.package}/${target.name}` : null,
    reason: choice.reason,
    mapped: [],
    kept: [],
  };
  if (!target) return {source, icons};

  /** @type {any} */
  let ast;
  try {
    ast = parseSource(source);
  } catch {
    return {source, icons};
  }
  const index = indexSets(sets);
  const targetModules = new Set(
    target.data.icons.flatMap(icon => [
      icon.module ?? target.data.module,
      ...(icon.variants ?? []).map(
        variant => variant.module ?? icon.module ?? target.data.module,
      ),
    ]),
  );

  /** Every name the file writes, to keep aliases collision-free. */
  const written = new Set();
  walk(ast.program, (node, parent, key) => {
    // The name an import specifier reads from its module binds nothing here.
    if (parent?.type === 'ImportSpecifier' && key === 'imported') return;
    if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
      written.add(node.name);
    }
  });

  /** @type {Array<{start: number, end: number, text: string}>} */
  const edits = [];
  /** @type {Map<string, string>} old local name → new local name */
  const renames = new Map();
  /** @type {Map<string, {module: string, imported: string, local: string}>} */
  const added = new Map();
  /**
   * Every local name whose import maps away, found first, so a mapped name
   * may reuse a name another mapped import frees.
   * @type {Set<string>}
   */
  const freed = new Set();
  /**
   * The source record and the match of each mapped import specifier.
   * @type {Map<any, {record: SourceIcon, match: ReturnType<typeof matchIcon>}>}
   */
  const planned = new Map();
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type')
      continue;
    const module = node.source.value;
    if (targetModules.has(module)) continue;
    for (const specifier of node.specifiers) {
      if (
        specifier.type !== 'ImportSpecifier' ||
        specifier.importKind === 'type'
      ) {
        continue;
      }
      const imported = specifier.imported.name ?? specifier.imported.value;
      const fromSet = index.get(`${module}\0${imported}`);
      const meant = Object.hasOwn(declared, imported)
        ? declared[imported]
        : null;
      /** @type {SourceIcon | null} */
      const record = fromSet
        ? {
            ...fromSet,
            definitions: [
              ...new Set([...(meant ? [meant] : []), ...fromSet.definitions]),
            ],
          }
        : meant
          ? {
              setName: null,
              export: imported,
              id: imported,
              definitions: [meant],
            }
          : null;
      if (!record || record.set === target) continue;
      const match = matchIcon(record, target);
      planned.set(specifier, {record, match});
      if (match) freed.add(specifier.local.name);
    }
  }
  /** Where the mapped imports go: where the first rewritten import was. */
  let insertAt = -1;

  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    if (node.importKind === 'type') continue;
    const module = node.source.value;
    if (targetModules.has(module)) continue;
    if (!node.specifiers.some((/** @type {any} */ each) => planned.has(each))) {
      continue;
    }

    /** @type {any[]} */
    const keep = [];
    for (const specifier of node.specifiers) {
      const plan = planned.get(specifier);
      if (!plan) {
        keep.push(specifier);
        continue;
      }
      const imported = specifier.imported.name ?? specifier.imported.value;
      const local = specifier.local.name;
      const {record, match} = plan;
      if (!match) {
        keep.push(specifier);
        const likely = reviewedMatch(record, target, ['likely']);
        icons.kept.push({
          module,
          export: imported,
          reason:
            record.definitions.length > 0
              ? `${icons.set} maps no icon to the icon definition "${record.definitions.join('", "')}"${record.setName ? ', and none is a reviewed match for it' : ''}`
              : `no icon in ${icons.set} is a reviewed match for it`,
          ...(likely
            ? {
                suggestion: {
                  set: target.name,
                  id: likely.id,
                  ...targetExport(likely, target, record.appearance),
                  confidence: /** @type {const} */ ('likely'),
                },
              }
            : {}),
        });
        continue;
      }
      const chosen = targetExport(match.icon, target, record.appearance);
      const key = `${chosen.module}\0${chosen.export}`;
      let entry = added.get(key);
      if (!entry) {
        let name = chosen.export;
        const taken = (/** @type {string} */ candidate) =>
          (written.has(candidate) && !freed.has(candidate)) ||
          [...added.values()].some(each => each.local === candidate);
        for (let n = 2; taken(name); n++) name = `${chosen.export}${n}`;
        entry = {module: chosen.module, imported: chosen.export, local: name};
        added.set(key, entry);
      }
      if (local !== entry.local) renames.set(local, entry.local);
      icons.mapped.push({
        source: {module, export: imported},
        target: {
          set: target.name,
          package: target.package,
          id: match.icon.id,
          module: chosen.module,
          export: chosen.export,
        },
        by: match.by,
      });
    }

    if (keep.length === node.specifiers.length) continue;
    if (insertAt === -1) insertAt = node.start;
    if (keep.length === 0) {
      let end = node.end;
      if (source[end] === '\n') end += 1;
      edits.push({start: node.start, end, text: ''});
    } else {
      const defaults = keep.filter(each => each.type !== 'ImportSpecifier');
      const named = keep.filter(each => each.type === 'ImportSpecifier');
      const parts = [
        ...defaults.map(each => source.slice(each.start, each.end)),
        ...(named.length > 0
          ? [
              `{${named.map(each => source.slice(each.start, each.end)).join(', ')}}`,
            ]
          : []),
      ];
      edits.push({
        start: node.start,
        end: node.end,
        text: `import ${parts.join(', ')} from ${source.slice(node.source.start, node.source.end)};`,
      });
    }
  }

  if (added.size === 0) return {source, icons};

  // Every reference to a renamed binding uses the mapped name.
  walk(ast.program, (node, parent, key) => {
    if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
      const next = renames.get(node.name);
      if (!next || !isReference(node, parent, key)) return;
      if (parent?.type === 'ObjectProperty' && parent.shorthand) {
        edits.push({
          start: node.start,
          end: node.end,
          text: `${node.name}: ${next}`,
        });
        return;
      }
      edits.push({start: node.start, end: node.end, text: next});
    }
  });
  // A shorthand property is visited as both key and value; keep one edit.
  const unique = new Map();
  for (const edit of edits) {
    const at = `${edit.start}:${edit.end}`;
    const prior = unique.get(at);
    if (!prior || edit.text.length > prior.text.length) unique.set(at, edit);
  }

  /** @type {Map<string, string[]>} */
  const byModule = new Map();
  for (const entry of added.values()) {
    const list = byModule.get(entry.module) ?? [];
    list.push(
      entry.local === entry.imported
        ? entry.imported
        : `${entry.imported} as ${entry.local}`,
    );
    byModule.set(entry.module, list);
  }
  const lines = [...byModule.entries()]
    .map(([module, names]) => `import {${names.join(', ')}} from '${module}';`)
    .join('\n');
  unique.set('insert', {start: insertAt, end: insertAt, text: `${lines}\n`});

  let out = source;
  for (const edit of [...unique.values()].sort(
    (a, b) => b.start - a.start || b.end - a.end,
  )) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return {source: out, icons};
}

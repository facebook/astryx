// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plan.mjs
 * @input One complete normalized theme plus every shared-compiler output track
 * @output A fixed-order, explicit 13-section compilation plan
 * @position Completeness boundary before any family factoring or packaging
 */

import {createHash} from 'node:crypto';
import postcss from 'postcss';

export const SECTION_KINDS = Object.freeze([
  'data-defaults',
  'prose',
  'tokens',
  'components',
  'adaptations',
  'on-media',
  'color-scheme',
  'domain-tokens',
  'registries',
  'fonts',
  'js-data',
  'exports',
  'provenance',
]);

/** @param {string | Buffer} value */
function sha256(value) {
  return `sha256-${createHash('sha256').update(value).digest('hex')}`;
}

/** @param {unknown} value @returns {string} */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    return `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`;
  }
  if (typeof value === 'function')
    return JSON.stringify(`[function:${value.name}]`);
  if (typeof value === 'symbol') return JSON.stringify(String(value));
  if (value === undefined) return 'null';
  return JSON.stringify(value) ?? 'null';
}

/** @param {unknown} value */
function isEmptyData(value) {
  return (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.every(isEmptyData)) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.values(value).every(isEmptyData))
  );
}

/**
 * @typedef {object} CSSUnit
 * @property {string} id
 * @property {'reset'|'astryx-base'|'astryx-theme'} layer
 * @property {'global'|'member'} scope
 * @property {'global'|'prose'|'token'|'component'} selectorKind
 * @property {Array<{name: string, params: string}>} atRules
 * @property {string} selector
 * @property {string} property
 * @property {string} value
 * @property {boolean} important
 * @property {number} order
 */

/**
 * Parse generator-owned CSS into declaration-sized semantic units. The caller
 * assigns the section identity before factoring; no resolved object is diffed.
 *
 * @param {string} css
 * @param {{prefix: string, layer: CSSUnit['layer'], scope: CSSUnit['scope'], defaultSelectorKind: CSSUnit['selectorKind']}} options
 * @returns {CSSUnit[]}
 */
function parseUnits(css, options) {
  if (!css.trim()) return [];
  const root = postcss.parse(css);
  /** @type {CSSUnit[]} */
  const units = [];
  let ruleOrder = 0;

  root.walkRules(rule => {
    const atRules = [];
    let ancestor = rule.parent;
    while (ancestor && ancestor.type !== 'root') {
      if (ancestor.type === 'atrule' && ancestor.name !== 'scope') {
        atRules.unshift({name: ancestor.name, params: ancestor.params});
      }
      ancestor = ancestor.parent;
    }

    let declarationOrder = 0;
    for (const node of rule.nodes ?? []) {
      if (node.type !== 'decl') continue;
      const selectorKind =
        rule.selector.trim() === ':scope'
          ? 'token'
          : options.defaultSelectorKind;
      const semanticId =
        selectorKind === 'token'
          ? node.prop
          : `${ruleOrder}/${rule.selector}/${declarationOrder}/${node.prop}`;
      units.push({
        id: `${options.prefix}/${semanticId}`,
        layer: options.layer,
        scope: options.scope,
        selectorKind,
        atRules,
        selector: rule.selector,
        property: node.prop,
        value: node.value,
        important: Boolean(node.important),
        order: units.length,
      });
      declarationOrder += 1;
    }
    ruleOrder += 1;
  });

  return units;
}

/**
 * @param {string[]} rules
 * @param {{prefix: string, layer: CSSUnit['layer'], selectorKind: CSSUnit['selectorKind']}} options
 */
function parseRuleList(rules, options) {
  return rules.flatMap((rule, index) =>
    parseUnits(rule, {
      prefix: `${options.prefix}/${index}`,
      layer: options.layer,
      scope: 'member',
      defaultSelectorKind: options.selectorKind,
    }),
  );
}

/** @param {string} css */
function withoutScopeAtRule(css) {
  if (!css.trim()) return '';
  const root = postcss.parse(css);
  root.walkAtRules('scope', atRule => {
    atRule.replaceWith(...(atRule.nodes ?? []));
  });
  return root.toString();
}

/**
 * @param {object} input
 * @param {{name: string, sourceId: string, parentName: string|null}} input.identity
 * @param {Record<string, any>} input.resolved
 * @param {string} input.dataDefaults
 * @param {{prose: string[], component: string[]}} input.rules
 * @param {{prose?: string, component?: string}} input.adaptations
 * @param {string} input.onMedia
 * @param {string} input.colorScheme
 * @param {unknown} input.registries
 * @param {unknown[]} input.fonts
 * @param {string} input.typeAugmentations
 * @param {unknown} input.provenance
 */
export function createMemberPlan(input) {
  const tokenRules = [];
  const componentRules = [];
  for (const rule of input.rules.component) {
    const first = postcss.parse(rule).first;
    if (first?.type === 'rule' && first.selector === ':scope') {
      tokenRules.push(rule);
    } else {
      componentRules.push(rule);
    }
  }

  const adaptationCss = withoutScopeAtRule(
    [input.adaptations.prose, input.adaptations.component]
      .filter(Boolean)
      .join('\n\n'),
  );
  const onMediaCss = withoutScopeAtRule(input.onMedia);
  const domainTokens = Object.fromEntries(
    Object.entries(input.resolved.tokens ?? {}).filter(([name]) =>
      name.startsWith('--color-syntax-'),
    ),
  );

  const specs = [
    {
      kind: 'data-defaults',
      tracks: ['css'],
      css: parseUnits(input.dataDefaults, {
        prefix: 'data-defaults',
        layer: 'astryx-base',
        scope: 'global',
        defaultSelectorKind: 'global',
      }),
      data: null,
    },
    {
      kind: 'prose',
      tracks: ['css'],
      css: parseRuleList(input.rules.prose, {
        prefix: 'prose',
        layer: 'reset',
        selectorKind: 'prose',
      }),
      data: null,
    },
    {
      kind: 'tokens',
      tracks: ['css', 'js', 'receipts'],
      css: parseRuleList(tokenRules, {
        prefix: 'tokens',
        layer: 'astryx-theme',
        selectorKind: 'token',
      }),
      data: {
        tokens: input.resolved.tokens ?? {},
        localTokens: input.resolved.localTokens ?? {},
        owners: input.resolved.__localTokenOwners ?? {},
        lineage: input.resolved.__localTokenLineage ?? null,
      },
    },
    {
      kind: 'components',
      tracks: ['css', 'js', 'types'],
      css: parseRuleList(componentRules, {
        prefix: 'components',
        layer: 'astryx-theme',
        selectorKind: 'component',
      }),
      data: input.resolved.components ?? null,
    },
    {
      kind: 'adaptations',
      tracks: ['css', 'js', 'receipts'],
      css: parseUnits(adaptationCss, {
        prefix: 'adaptations',
        layer: 'astryx-theme',
        scope: 'member',
        defaultSelectorKind: 'component',
      }),
      data: {
        normalized: input.resolved.__adaptations ?? null,
        axes: input.resolved.__axes ?? null,
        resolved: input.resolved.__adaptationRules ?? null,
      },
    },
    {
      kind: 'on-media',
      tracks: ['css', 'js'],
      css: parseUnits(onMediaCss, {
        prefix: 'on-media',
        layer: 'astryx-theme',
        scope: 'member',
        defaultSelectorKind: 'component',
      }),
      data: {
        dark: input.resolved.__onDark ?? null,
        light: input.resolved.__onLight ?? null,
      },
    },
    {
      kind: 'color-scheme',
      tracks: ['css'],
      css: parseUnits(input.colorScheme, {
        prefix: 'color-scheme',
        layer: 'astryx-theme',
        scope: 'global',
        defaultSelectorKind: 'global',
      }),
      data: null,
    },
    {
      kind: 'domain-tokens',
      tracks: ['js', 'receipts'],
      css: [],
      data: domainTokens,
    },
    {
      kind: 'registries',
      tracks: ['js'],
      css: [],
      data: input.registries,
    },
    {
      kind: 'fonts',
      tracks: ['receipts'],
      css: [],
      data: input.fonts,
    },
    {
      kind: 'js-data',
      tracks: ['js'],
      css: [],
      data: input.resolved,
    },
    {
      kind: 'exports',
      tracks: ['js', 'types'],
      css: [],
      data: {typeAugmentations: input.typeAugmentations},
    },
    {
      kind: 'provenance',
      tracks: ['receipts'],
      css: [],
      data: input.provenance,
    },
  ];

  if (
    specs.length !== SECTION_KINDS.length ||
    specs.some((section, index) => section.kind !== SECTION_KINDS[index])
  ) {
    throw new Error(
      'Theme compilation plan is missing or reorders a required section.',
    );
  }

  const sections = specs.map(section => ({
    ...section,
    id: section.kind,
    empty: section.css.length === 0 && isEmptyData(section.data),
  }));
  const digestPayload = sections.map(section => ({
    kind: section.kind,
    tracks: section.tracks,
    css: section.css,
    empty: section.empty,
  }));

  return {
    identity: input.identity,
    resolved: input.resolved,
    sections,
    planDigest: sha256(canonicalJson(digestPayload)),
  };
}

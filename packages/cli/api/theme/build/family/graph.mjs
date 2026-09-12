// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file graph.mjs
 * @input Loaded theme objects, raw defineTheme inputs, and normalized sources
 * @output Validated one-root family graph in AST-034 canonical order
 * @position Pure identity and ordering layer for theme family builds
 */

import {createHash} from 'node:crypto';

/** @param {string | Buffer} value */
function sha256(value) {
  return `sha256-${createHash('sha256').update(value).digest('hex')}`;
}

/** @param {unknown} value @returns {string} */
function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value);
    return `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** @param {string} a @param {string} b */
function compareCodeUnits(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * @typedef {object} LoadedFamilyMember
 * @property {string} sourceId cwd-relative POSIX source identity
 * @property {string | Buffer} sourceBytes exact source bytes
 * @property {Record<string, any>} theme resolved theme object
 * @property {Record<string, any>} rawInput exact authored defineTheme input
 */

/**
 * @typedef {object} FamilyGraphNode
 * @property {string} name
 * @property {string} sourceId
 * @property {string | null} parentName
 * @property {Record<string, any>} theme
 * @property {Record<string, any>} rawInput
 * @property {string} sourceDigest
 */

/**
 * Validate and canonically order one selected theme family.
 *
 * The parent edge comes only from the exact `extends` object recorded while the
 * source graph was evaluated. Names and local-token lineage are cross-checks,
 * never substitutes for that identity.
 *
 * @param {LoadedFamilyMember[]} entries
 * @returns {{rootName: string, order: FamilyGraphNode[], byName: Map<string, FamilyGraphNode>, sourceGraphDigest: string}}
 */
export function buildFamilyGraph(entries) {
  if (entries.length < 2) {
    throw new Error('A theme family needs at least two selected members.');
  }

  /** @type {Map<string, LoadedFamilyMember>} */
  const byNameEntry = new Map();
  /** @type {Map<object, LoadedFamilyMember>} */
  const byIdentity = new Map();
  const sourceIds = new Set();

  for (const entry of entries) {
    const name = entry.theme?.name;
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error(
        `Family source "${entry.sourceId}" has no stable theme name.`,
      );
    }
    if (byIdentity.has(entry.theme)) {
      throw new Error(
        `Family sources "${byIdentity.get(entry.theme)?.sourceId}" and "${entry.sourceId}" resolve to the same theme object.`,
      );
    }
    if (byNameEntry.has(name)) {
      throw new Error(`Family contains duplicate theme name "${name}".`);
    }
    if (sourceIds.has(entry.sourceId)) {
      throw new Error(
        `Family source identity "${entry.sourceId}" is associated with more than one graph node.`,
      );
    }
    byNameEntry.set(name, entry);
    byIdentity.set(entry.theme, entry);
    sourceIds.add(entry.sourceId);
  }

  /** @type {FamilyGraphNode[]} */
  const nodes = entries.map(entry => {
    const parentValue = Object.prototype.hasOwnProperty.call(
      entry.rawInput,
      'extends',
    )
      ? entry.rawInput.extends
      : undefined;
    const parent =
      parentValue == null ? undefined : byIdentity.get(parentValue);
    if (parentValue != null && !parent) {
      const named =
        typeof parentValue?.name === 'string' ? ` "${parentValue.name}"` : '';
      throw new Error(
        `Theme "${entry.theme.name}" has missing selected ancestor${named}.`,
      );
    }

    return {
      name: entry.theme.name,
      sourceId: entry.sourceId,
      parentName: parent?.theme.name ?? null,
      theme: entry.theme,
      rawInput: entry.rawInput,
      sourceDigest: sha256(entry.sourceBytes),
    };
  });

  const roots = nodes.filter(node => node.parentName === null);
  if (roots.length === 0) {
    throw new Error('Theme family graph contains a cycle and has no root.');
  }
  if (roots.length !== 1) {
    throw new Error(
      `Theme family needs exactly one root; found ${roots.map(root => `"${root.name}"`).join(', ')}.`,
    );
  }

  const nodeByName = new Map(nodes.map(node => [node.name, node]));
  for (const node of nodes) {
    if (node.parentName === null) continue;
    const parent = nodeByName.get(node.parentName);
    const parentLineage = parent?.theme?.__localTokenLineage;
    const childLineage = node.theme?.__localTokenLineage;
    if (Array.isArray(parentLineage) && Array.isArray(childLineage)) {
      const expected = [...parentLineage, node.name];
      if (
        expected.length !== childLineage.length ||
        expected.some((name, index) => childLineage[index] !== name)
      ) {
        throw new Error(
          `Theme "${node.name}" extends "${node.parentName}", but that edge disagrees with its exact enrolled local-token lineage.`,
        );
      }
    }
  }

  /** @type {FamilyGraphNode[]} */
  const order = [];
  const emitted = new Set();
  while (order.length < nodes.length) {
    const eligible = nodes
      .filter(
        node =>
          !emitted.has(node.name) &&
          (node.parentName === null || emitted.has(node.parentName)),
      )
      .sort(
        (a, b) =>
          compareCodeUnits(a.name, b.name) ||
          compareCodeUnits(a.sourceId, b.sourceId),
      );
    if (eligible.length === 0) {
      throw new Error('Theme family graph contains a cycle.');
    }
    const next = eligible[0];
    order.push(next);
    emitted.add(next.name);
  }

  const sourceGraphDigest = sha256(
    canonicalJson(
      order.map(node => ({
        name: node.name,
        parentName: node.parentName,
        sourceDigest: node.sourceDigest,
        sourceId: node.sourceId,
      })),
    ),
  );

  return {
    rootName: roots[0].name,
    order,
    byName: new Map(order.map(node => [node.name, node])),
    sourceGraphDigest,
  };
}

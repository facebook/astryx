// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file factor.mjs
 * @input Complete member plans in canonical graph order
 * @output Declaration groups shared only by byte-identical section semantics
 * @position Pure AST-034 complete-plan-before-factoring step
 */

import {SECTION_KINDS} from './plan.mjs';

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
  return JSON.stringify(value) ?? 'null';
}

/** @param {any} unit */
function unitSignature(unit) {
  return canonicalJson({
    layer: unit.layer,
    scope: unit.scope,
    selectorKind: unit.selectorKind,
    atRules: unit.atRules,
    selector: unit.selector,
    property: unit.property,
    value: unit.value,
    important: unit.important,
  });
}

/**
 * @param {Array<{identity: {name: string}, sections: Array<{kind: string, css: any[]}>}>} plans
 */
export function factorFamilyPlans(plans) {
  if (plans.length === 0)
    throw new Error('Cannot factor an empty theme family.');

  const groups = [];
  for (const kind of SECTION_KINDS) {
    /** @type {Map<string, {unit: any, members: string[], firstSeen: number}>} */
    const bySignature = new Map();
    let firstSeen = 0;
    for (const plan of plans) {
      const section = plan.sections.find(candidate => candidate.kind === kind);
      if (!section) {
        throw new Error(
          `Member "${plan.identity.name}" is missing section "${kind}".`,
        );
      }
      for (const unit of section.css) {
        const signature = `${unit.id}\u0000${unitSignature(unit)}`;
        let group = bySignature.get(signature);
        if (!group) {
          group = {unit, members: [], firstSeen: firstSeen++};
          bySignature.set(signature, group);
        }
        group.members.push(plan.identity.name);
      }
    }
    groups.push(
      ...[...bySignature.values()]
        .sort((a, b) => a.firstSeen - b.firstSeen)
        .map(group => ({
          kind,
          unit: group.unit,
          members: group.members,
          shared: group.unit.scope === 'global' || group.members.length > 1,
        })),
    );
  }

  return {plans, groups};
}

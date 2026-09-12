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
 * @param {Array<{identity: {name: string, parentName: string|null}, sections: Array<{kind: string, css: any[]}>}>} plans
 */
export function factorFamilyPlans(plans) {
  if (plans.length === 0)
    throw new Error('Cannot factor an empty theme family.');

  const groups = [];
  const rootName = plans.find(plan => plan.identity.parentName === null)
    ?.identity.name;
  if (!rootName)
    throw new Error('Cannot factor a family without one root plan.');
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
      const sectionKey =
        kind === 'components'
          ? canonicalJson(
              section.css.map(unit => [unit.id, unitSignature(unit)]),
            )
          : '';
      for (const unit of section.css) {
        // Ordered conditional sections must retain member specificity. Sharing
        // them at zero specificity can make an earlier root/member declaration
        // beat a later adaptation or media-surface write. Component declarations
        // share only when the complete section is identical, so zeroing an
        // inherited state selector cannot make a child base delta outrank it.
        const memberOrderKey =
          kind === 'adaptations' || kind === 'on-media'
            ? `\u0000${plan.identity.name}`
            : kind === 'components'
              ? `\u0000${sectionKey}`
              : '';
        const signature = `${unit.id}\u0000${unitSignature(unit)}${memberOrderKey}`;
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
          shared:
            group.unit.scope === 'global' ||
            (group.members.length > 1 && group.members.includes(rootName)),
        })),
    );
  }

  return {plans, groups};
}

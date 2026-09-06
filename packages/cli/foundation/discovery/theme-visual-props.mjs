// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Loader and index for Core's generated visual-prop contract.
 * @input A resolved @astryxdesign/core package root.
 * @output A validated, target-keyed contract for CLI and visual tooling.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export const THEME_VISUAL_PROPS_FILE = 'theme-visual-props.json';
export const THEME_VISUAL_PROPS_SCHEMA_VERSION = 1;

/** @typedef {{module: string, interface: string, currentKeys?: string[], historical?: boolean}} Augmentation */
/** @typedef {{kind: 'finite', values: {strings: string[], numbers: number[]}} | {kind: 'open', primitives: Array<'string'|'number'>, knownLiterals?: {strings: string[], numbers: number[]}} | {kind: 'unresolved', reason: 'opaque-expression'|'unsupported-type'|'missing-owner'}} VisualPropDomain */
/** @typedef {{name: string, role: 'visualProp', domain: VisualPropDomain, augmentationInterfaces?: Augmentation[]} | {name: string, role: 'state'}} ContractProp */
/** @typedef {{key: string, className: string, deprecatedFor?: string[], aliasOf?: string[], props: ContractProp[]}} ContractTarget */
/** @typedef {{schemaVersion: number, packageName: string, summary?: object, augmentationInterfaces?: Augmentation[], targets: ContractTarget[]}} ThemeVisualPropsContract */

export class ThemeVisualPropsContractError extends Error {
  name = 'ThemeVisualPropsContractError';
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function requireString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ThemeVisualPropsContractError(
      `${label} must be a non-empty string.`,
    );
  }
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new ThemeVisualPropsContractError(
      `${label} must be an array of strings.`,
    );
  }
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function requireNumberArray(value, label) {
  if (
    !Array.isArray(value) ||
    value.some(item => typeof item !== 'number' || !Number.isFinite(item))
  ) {
    throw new ThemeVisualPropsContractError(
      `${label} must be an array of finite numbers.`,
    );
  }
}

/** @param {unknown} value */
function isRepresentableSelectorValue(value) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    /[\s+:\\]/.test(value)
  ) {
    return false;
  }
  return [...value].every(character => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint >= 0x20 && codePoint !== 0x7f;
  });
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function validateLiteralValues(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ThemeVisualPropsContractError(`${label} must be an object.`);
  }
  const literals = /** @type {any} */ (value);
  requireStringArray(literals.strings, `${label}.strings`);
  requireNumberArray(literals.numbers, `${label}.numbers`);
  const invalidString = literals.strings.find(
    (/** @type {string} */ literal) => !isRepresentableSelectorValue(literal),
  );
  if (invalidString !== undefined) {
    throw new ThemeVisualPropsContractError(
      `${label} contains an unrepresentable selector value.`,
    );
  }
}

/**
 * @param {unknown} value
 * @param {string} label
 */
function validateAugmentations(value, label) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    throw new ThemeVisualPropsContractError(`${label} must be an array.`);
  }
  const keys = new Set();
  for (const augmentation of value) {
    if (!augmentation || typeof augmentation !== 'object') {
      throw new ThemeVisualPropsContractError(
        `${label} entries must be objects.`,
      );
    }
    requireString(augmentation.module, `${label}.module`);
    requireString(augmentation.interface, `${label}.interface`);
    if (!/^@astryxdesign\/core(?:\/|$)/.test(augmentation.module)) {
      throw new ThemeVisualPropsContractError(
        `${label}.module must name a public @astryxdesign/core subpath.`,
      );
    }
    if (!/^[A-Za-z_$][\w$]*$/.test(augmentation.interface)) {
      throw new ThemeVisualPropsContractError(
        `${label}.interface must be a TypeScript identifier.`,
      );
    }
    if (augmentation.currentKeys !== undefined) {
      requireStringArray(augmentation.currentKeys, `${label}.currentKeys`);
    }
    if (
      augmentation.historical !== undefined &&
      typeof augmentation.historical !== 'boolean'
    ) {
      throw new ThemeVisualPropsContractError(
        `${label}.historical must be a boolean.`,
      );
    }
    const key = `${augmentation.module}:${augmentation.interface}`;
    if (keys.has(key)) {
      throw new ThemeVisualPropsContractError(
        `${label} contains duplicate augmentation "${key}".`,
      );
    }
    keys.add(key);
  }
}

/**
 * Validate schema v1 and return the same object with a useful JSDoc type.
 * Unsupported versions return null so an independently upgraded CLI can retain
 * the legacy validation boundary of an older or newer compatible Core package.
 *
 * @param {unknown} value
 * @returns {ThemeVisualPropsContract|null}
 */
export function parseThemeVisualPropsContract(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ThemeVisualPropsContractError(
      'Core theme visual-prop contract must be a JSON object.',
    );
  }
  const contract = /** @type {any} */ (value);
  if (contract.schemaVersion !== THEME_VISUAL_PROPS_SCHEMA_VERSION) return null;
  requireString(contract.packageName, 'packageName');
  if (contract.packageName !== '@astryxdesign/core') {
    throw new ThemeVisualPropsContractError(
      `packageName must be "@astryxdesign/core".`,
    );
  }
  validateAugmentations(
    contract.augmentationInterfaces,
    'augmentationInterfaces',
  );
  if (!Array.isArray(contract.targets)) {
    throw new ThemeVisualPropsContractError('targets must be an array.');
  }

  const targetNames = new Set();
  for (const target of contract.targets) {
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
      throw new ThemeVisualPropsContractError('Each target must be an object.');
    }
    requireString(target.key, 'target.key');
    requireString(target.className, `target ${target.key}.className`);
    if (target.deprecatedFor !== undefined) {
      requireStringArray(
        target.deprecatedFor,
        `target ${target.key}.deprecatedFor`,
      );
    }
    if (target.aliasOf !== undefined) {
      requireStringArray(target.aliasOf, `target ${target.key}.aliasOf`);
    }
    if (targetNames.has(target.key)) {
      throw new ThemeVisualPropsContractError(
        `Duplicate target key "${target.key}".`,
      );
    }
    targetNames.add(target.key);
    if (!Array.isArray(target.props)) {
      throw new ThemeVisualPropsContractError(
        `target ${target.key}.props must be an array.`,
      );
    }

    const propNames = new Set();
    for (const prop of target.props) {
      requireString(prop?.name, `target ${target.key} prop name`);
      if (propNames.has(prop.name)) {
        throw new ThemeVisualPropsContractError(
          `Duplicate prop "${prop.name}" on target "${target.key}".`,
        );
      }
      propNames.add(prop.name);
      if (prop.role !== 'visualProp' && prop.role !== 'state') {
        throw new ThemeVisualPropsContractError(
          `target ${target.key}.${prop.name} has unsupported role "${prop.role}".`,
        );
      }
      if (prop.role === 'state') {
        if (
          prop.domain !== undefined ||
          prop.augmentationInterfaces !== undefined
        ) {
          throw new ThemeVisualPropsContractError(
            `state ${target.key}.${prop.name} cannot declare a value domain or augmentation.`,
          );
        }
        continue;
      }
      validateAugmentations(
        prop.augmentationInterfaces,
        `target ${target.key}.${prop.name}.augmentationInterfaces`,
      );
      const kind = prop.domain?.kind;
      if (!['finite', 'open', 'unresolved'].includes(kind)) {
        throw new ThemeVisualPropsContractError(
          `target ${target.key}.${prop.name} has an invalid domain.`,
        );
      }
      if (kind === 'finite') {
        validateLiteralValues(
          prop.domain.values,
          `target ${target.key}.${prop.name}.values`,
        );
      } else if (kind === 'open') {
        requireStringArray(
          prop.domain.primitives,
          `target ${target.key}.${prop.name} open primitives`,
        );
        if (
          prop.domain.primitives.length === 0 ||
          prop.domain.primitives.some(
            (/** @type {string} */ primitive) =>
              primitive !== 'string' && primitive !== 'number',
          )
        ) {
          throw new ThemeVisualPropsContractError(
            `target ${target.key}.${prop.name} has an invalid open primitive.`,
          );
        }
        if (prop.domain.knownLiterals !== undefined) {
          validateLiteralValues(
            prop.domain.knownLiterals,
            `target ${target.key}.${prop.name}.knownLiterals`,
          );
        }
      } else if (
        !['opaque-expression', 'unsupported-type', 'missing-owner'].includes(
          prop.domain.reason,
        )
      ) {
        throw new ThemeVisualPropsContractError(
          `target ${target.key}.${prop.name} has an invalid unresolved reason.`,
        );
      }
    }
  }
  return /** @type {ThemeVisualPropsContract} */ (contract);
}

/**
 * @param {string} coreRoot
 * @returns {ThemeVisualPropsContract|null}
 */
export function loadThemeVisualPropsContract(coreRoot) {
  const file = path.join(coreRoot, THEME_VISUAL_PROPS_FILE);
  if (!fs.existsSync(file)) return null;
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ThemeVisualPropsContractError(
      `Could not parse ${file}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return parseThemeVisualPropsContract(parsed);
}

/**
 * @param {ThemeVisualPropsContract} contract
 * @returns {Map<string, {target: ContractTarget, props: Map<string, ContractProp>}>}
 */
export function indexThemeVisualPropsContract(contract) {
  return new Map(
    contract.targets.map(target => [
      target.key,
      {
        target,
        props: new Map(target.props.map(prop => [prop.name, prop])),
      },
    ]),
  );
}

/**
 * @param {ContractProp|undefined} prop
 * @returns {string[]}
 */
export function finiteVisualPropValues(prop) {
  if (prop?.role !== 'visualProp' || prop.domain.kind !== 'finite') return [];
  return [
    ...prop.domain.values.strings,
    ...prop.domain.values.numbers.map(String),
  ];
}

/**
 * Return whether a selector value is part of the generated built-in domain.
 * Null means the contract intentionally has no enforceable answer.
 *
 * @param {ContractProp|undefined} prop
 * @param {string} value
 * @returns {boolean|null}
 */
export function visualPropAcceptsValue(prop, value) {
  if (prop?.role !== 'visualProp' || prop.domain.kind === 'unresolved') {
    return null;
  }
  if (prop.domain.kind === 'finite') {
    return (
      finiteVisualPropValues(prop).includes(value) &&
      isRepresentableSelectorValue(value)
    );
  }

  const known = [
    ...(prop.domain.knownLiterals?.strings ?? []),
    ...(prop.domain.knownLiterals?.numbers ?? []).map(String),
  ];
  if (known.includes(value)) return isRepresentableSelectorValue(value);
  if (prop.domain.primitives.includes('string')) {
    return isRepresentableSelectorValue(value);
  }
  return (
    prop.domain.primitives.includes('number') &&
    value.trim().length > 0 &&
    Number.isFinite(Number(value)) &&
    String(Number(value)) === value
  );
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lossless packaging guards for non-CSS Icon theme data.
 * @input Resolved/captured theme data and the selected Core's Icon namespace.
 * @output Plain-data JavaScript, selected-lineage rejection and a pure constructor witness.
 * @position Private CLI packaging helper; Core owns Icon grammar and normalization.
 */

import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

/** @param {string} message @returns {never} */
function invalid(message) {
  throw new AstryxError(message, undefined, ERROR_CODES.ERR_THEME_INVALID);
}

/**
 * Encode plain data without JSON's undefined/null/number coercions. Supplied
 * artwork and renderers remain imported references, never serialized functions.
 * @param {unknown} value
 * @param {string} label
 * @returns {string}
 */
export function serializeIconData(value, label) {
  /** @param {unknown} item @param {string} location @param {Set<object>} ancestors @returns {string} */
  const visit = (item, location, ancestors) => {
    if (item === undefined) return 'undefined';
    if (item === null) return 'null';
    if (typeof item === 'string' || typeof item === 'boolean')
      return JSON.stringify(item);
    if (typeof item === 'number') {
      if (!Number.isFinite(item))
        invalid(`${location} must contain finite numbers.`);
      return Object.is(item, -0) ? '-0' : String(item);
    }
    if (typeof item !== 'object')
      invalid(
        `${location} cannot be serialized. Keep supplied artwork and renderers in an imported icon registry.`,
      );
    if (ancestors.has(item)) invalid(`${location} cannot contain a cycle.`);
    const array = Array.isArray(item);
    const prototype = Object.getPrototypeOf(item);
    if (
      array
        ? prototype !== Array.prototype
        : prototype !== Object.prototype && prototype !== null
    )
      invalid(`${location} must contain plain data.`);
    const next = new Set(ancestors);
    next.add(item);
    const entries = [];
    for (const key of Reflect.ownKeys(item)) {
      if (array && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(item, key);
      if (
        typeof key !== 'string' ||
        !descriptor ||
        !('value' in descriptor) ||
        !descriptor.enumerable
      )
        invalid(`${location} must contain enumerable plain data fields.`);
      if (array && !/^(?:0|[1-9]\d*)$/u.test(key))
        invalid(`${location} cannot contain custom array fields.`);
      const encoded = visit(descriptor.value, `${location}.${key}`, next);
      const property =
        key === '__proto__' ? `[${JSON.stringify(key)}]` : JSON.stringify(key);
      entries.push(array ? encoded : `${property}: ${encoded}`);
    }
    if (array) {
      if (entries.length !== item.length)
        invalid(`${location} cannot contain sparse arrays.`);
      return `[${entries.join(', ')}]`;
    }
    return `{${entries.join(', ')}}`;
  };
  return visit(value, label, new Set());
}

/** Read only a data descriptor: capability checks must never invoke accessors.
 * @param {any} value @param {string} key @param {string} label @returns {any}
 */
function dataField(value, key, label) {
  if (!value || typeof value !== 'object') return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor && !('value' in descriptor))
    invalid(`Cannot serialize an accessor in ${label}.`);
  return descriptor?.value;
}

/**
 * Reject unsupported component-role/state fields in the SELECTED raw lineage,
 * before an independently versioned Core can normalize them out of existence.
 * This is not a second policy grammar: Core validates supported engine fields.
 * The released baseline has no componentIcons runtime API; legacy slot contract
 * documentation is neither a runtime implementation nor role participation.
 * @param {any} theme @param {any[]} [lineage]
 */
export function assertSupportedIconFields(theme, lineage = []) {
  for (const input of new Set([theme, ...lineage])) {
    if (!input || typeof input !== 'object') continue;
    if (Object.hasOwn(input, 'componentIcons'))
      invalid(
        'componentIcons is not supported by this Icon engine. Component-role mappings must not be silently dropped.',
      );
    const policy = dataField(input, 'iconCapabilities', 'iconCapabilities');
    if (policy && typeof policy === 'object') {
      if (Object.hasOwn(policy, 'roleSizeOverrides'))
        invalid(
          'iconCapabilities.roleSizeOverrides is not supported by this Icon engine.',
        );
      const presentation = dataField(
        policy,
        'presentation',
        'iconCapabilities.presentation',
      );
      if (
        presentation &&
        typeof presentation === 'object' &&
        Object.hasOwn(presentation, 'byState')
      )
        invalid(
          'iconCapabilities.presentation.byState is not supported by this Icon engine.',
        );
    }
    for (const field of ['iconCapabilities', '__iconContracts']) {
      const value = dataField(input, field, field);
      if (value !== undefined) serializeIconData(value, field);
    }
    // Sources may contain React elements/functions. Check only the outer
    // descriptors here; their actual tree grammar belongs to Core defineTheme.
    dataField(input, 'icons', 'icons');
    dataField(input, '__iconSources', '__iconSources');
  }
}

/** @param {any} theme @returns {boolean} */
export function hasIconCapabilityIntent(theme) {
  if (!theme || typeof theme !== 'object') return false;
  for (const key of ['iconCapabilities', '__iconSources', '__iconContracts']) {
    const descriptor = Object.getOwnPropertyDescriptor(theme, key);
    if (
      descriptor &&
      (!('value' in descriptor) || descriptor.value !== undefined)
    )
      return true;
  }
  const icons = Object.getOwnPropertyDescriptor(theme, 'icons');
  if (!icons) return false;
  if (!('value' in icons)) return true;
  if (!icons.value || typeof icons.value !== 'object') return false;
  return Object.values(Object.getOwnPropertyDescriptors(icons.value)).some(
    descriptor => {
      if (!('value' in descriptor)) return true;
      const entry = descriptor.value;
      return (
        entry &&
        typeof entry === 'object' &&
        !Object.hasOwn(entry, '$$typeof') &&
        [
          'capabilities',
          'tree',
          'default',
          'bySize',
          'byAppearance',
          'byWeight',
          'render',
          'weightRange',
        ].some(key => Object.hasOwn(entry, key))
      );
    },
  );
}

/**
 * A retention check, not a second grammar: every defined authored winner must
 * survive Core normalization, including sparse tree branches and renderer refs.
 * @param {any} theme @param {any[]} inputs Child-first exact raw contributor inputs.
 * @param {any} core The selected constructors, used only on real contract data.
 */
export function assertRetainedIconInput(theme, inputs, core) {
  /** @param {any} actual @param {any} expected @param {WeakMap<object, object>} [seen] @returns {boolean} */
  const retains = (actual, expected, seen = new WeakMap()) => {
    if (expected === undefined || Object.is(actual, expected)) return true;
    if (
      !actual ||
      !expected ||
      typeof actual !== 'object' ||
      typeof expected !== 'object'
    )
      return false;
    if (seen.get(expected) === actual) return true;
    seen.set(expected, actual);
    return Reflect.ownKeys(expected).every(key => {
      const own = Object.getOwnPropertyDescriptor(expected, key);
      const kept = Object.getOwnPropertyDescriptor(actual, key);
      return (
        own &&
        'value' in own &&
        (own.value === undefined ||
          (kept && 'value' in kept && retains(kept.value, own.value, seen)))
      );
    });
  };
  /** @param {boolean} supported */
  const requireRetained = supported => {
    if (!supported)
      throw new AstryxError(
        'The installed Core erased authored Icon policy or source data. Upgrade Core before building this theme.',
        undefined,
        ERROR_CODES.ERR_CORE_INCOMPATIBLE,
      );
  };
  const policyFields = new Set(),
    sizes = new Set(),
    sources = new Set();
  const policy = dataField(theme, 'iconCapabilities', 'iconCapabilities');
  for (const [index, input] of inputs.entries()) {
    const authored = dataField(input, 'iconCapabilities', 'iconCapabilities');
    for (const field of ['contract', 'presentation']) {
      const value = dataField(authored, field, `iconCapabilities.${field}`);
      if (value === undefined || policyFields.has(field)) continue;
      policyFields.add(field);
      requireRetained(
        field === 'contract'
          ? policy?.contract === core.defineIconCapabilities(value)
          : retains(policy?.presentation, value),
      );
    }
    const dimensions = dataField(
      authored,
      'sizeOverrides',
      'iconCapabilities.sizeOverrides',
    );
    for (const [key, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(dimensions ?? {}),
    )) {
      if (
        !('value' in descriptor) ||
        descriptor.value === undefined ||
        sizes.has(key)
      )
        continue;
      sizes.add(key);
      requireRetained(retains(policy?.sizeOverrides?.[key], descriptor.value));
    }
    const registry =
      dataField(input, '__iconSources', '__iconSources') ??
      dataField(input, 'icons', 'icons');
    for (const [key, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(registry ?? {}),
    )) {
      if (sources.has(key)) continue;
      sources.add(key);
      if (!('value' in descriptor)) {
        requireRetained(false);
        continue;
      }
      const entry = descriptor.value;
      if (!hasIconCapabilityIntent({icons: {[key]: entry}})) continue;
      const bound =
        entry &&
        Object.hasOwn(entry, 'capabilities') &&
        Object.hasOwn(entry, 'tree');
      const actual = theme.__iconSources?.[key];
      requireRetained(retains(actual?.tree, bound ? entry.tree : entry));
      const contract = bound
        ? entry.capabilities
        : inputs
            .slice(index)
            .map(value => value?.iconCapabilities?.contract)
            .find(value => value !== undefined);
      if (contract !== undefined)
        requireRetained(
          actual?.capabilities === core.defineIconCapabilities(contract),
        );
    }
  }
}

/** @type {WeakMap<object, boolean>} */
const iconCapabilityProtocols = new WeakMap();

/** Only public constructors are required; no public normalizer/composition probe.
 * @param {any} core @returns {boolean}
 */
export function supportsIconCapabilities(core) {
  if (
    !core ||
    !['defineIconCapabilities', 'defineAdaptiveIcon'].every(
      key => Object.hasOwn(core, key) && typeof core[key] === 'function',
    )
  )
    return false;
  const cached = iconCapabilityProtocols.get(core);
  if (cached !== undefined) return cached;
  let supported = false;
  try {
    // Empty own-data witness, not an admission probe or a fake theme registration.
    const contract = core.defineIconCapabilities({});
    if (!contract || typeof contract !== 'object')
      throw new TypeError('Invalid empty Icon contract witness.');
    const node = 'compatibility-default';
    const source = core.defineAdaptiveIcon(contract, {default: node});
    const capabilities = Object.getOwnPropertyDescriptor(
      source,
      'capabilities',
    );
    const tree = Object.getOwnPropertyDescriptor(source, 'tree');
    const fallback =
      tree &&
      'value' in tree &&
      tree.value &&
      Object.getOwnPropertyDescriptor(tree.value, 'default');
    supported = Boolean(
      capabilities &&
      'value' in capabilities &&
      capabilities.value === contract &&
      fallback &&
      'value' in fallback &&
      fallback.value === node,
    );
  } catch {
    // Older constructor names without the bound protocol are not sufficient.
  }
  iconCapabilityProtocols.set(core, supported);
  return supported;
}

/**
 * Scope compatibility to the selected captured lineage, never unused siblings.
 * @param {any} theme @param {any} core
 * @param {{coreVersion?: string, lineage?: any[], unobserved?: any[]}} [context]
 */
export function assertIconCapability(
  theme,
  core,
  {coreVersion, lineage, unobserved} = {},
) {
  if (unobserved?.length) {
    throw new AstryxError(
      'The selected Icon source lineage could not be fully observed. Re-export raw theme input or an already-built artifact before building; constructor support alone cannot prove that source intent was retained.',
      undefined,
      ERROR_CODES.ERR_CORE_INCOMPATIBLE,
    );
  }
  if (supportsIconCapabilities(core)) return;
  const candidates = new Set([theme, ...(lineage ?? [])]);
  if (![...candidates].some(hasIconCapabilityIntent)) return;
  const installed =
    coreVersion && coreVersion !== 'unknown'
      ? `@astryxdesign/core@${coreVersion}`
      : 'the installed @astryxdesign/core';
  throw new AstryxError(
    `This theme declares Icon capability intent, or its selected source lineage could not be fully observed, but ${installed} does not support lossless Icon capability/source normalization. Upgrade @astryxdesign/core before building this theme; building without that support would silently drop icon data.`,
    undefined,
    ERROR_CODES.ERR_CORE_INCOMPATIBLE,
  );
}

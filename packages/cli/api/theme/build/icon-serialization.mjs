// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lossless packaging guards for non-CSS Icon theme data.
 * @input Resolved/captured theme data and the selected Core's Icon namespace.
 * @output Plain-data JavaScript, structural role/state admission, selected-lineage rejection
 *   and a pure constructor witness that does not prove individual field support.
 * @position Private CLI packaging helper; Core owns capability membership and normalization.
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
 * @param {{allowHidden?: boolean}} [options] Captured own data is normalized to enumerable fields.
 * @returns {string}
 */
export function serializeIconData(value, label, {allowHidden = false} = {}) {
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
        (!descriptor.enumerable && !allowHidden)
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
 * Validate the own-data shape of role/state intent before a separately versioned
 * Core can erase it. Membership in supplied size/appearance contracts and the
 * shared IconName vocabulary remains Core's responsibility. Role/state keys
 * never depend on which component declaration was imported first.
 * @param {any} theme @param {any[]} [lineage]
 */
export function assertSupportedIconFields(theme, lineage = []) {
  /** @param {any} value @param {string} label */
  const record = (value, label) => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    )
      invalid(`${label} must be a plain object.`);
    serializeIconData(value, label, {allowHidden: true});
  };
  /** @param {any} value @param {string[]} allowed @param {string} label */
  const keys = (value, allowed, label) => {
    record(value, label);
    if (
      Reflect.ownKeys(value).some(
        key => typeof key !== 'string' || !allowed.includes(key),
      )
    )
      invalid(`${label} contains an unsupported field.`);
  };
  /** @param {string} name @param {string} label */
  const roleName = (name, label) => {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/u.test(name))
      invalid(`${label} keys must use component-kebab-semantic-role names.`);
  };
  /** @param {any} value @returns {boolean} */
  const name = value =>
    typeof value === 'string' && value.length > 0 && value.trim() === value;
  for (const input of new Set([theme, ...lineage])) {
    if (!input || typeof input !== 'object') continue;
    const mapping = dataField(input, 'componentIcons', 'componentIcons');
    if (mapping !== undefined) {
      record(mapping, 'componentIcons');
      for (const [slot, descriptor] of Object.entries(
        Object.getOwnPropertyDescriptors(mapping),
      )) {
        const icon = descriptor.value;
        roleName(slot, 'componentIcons');
        if (
          icon !== undefined &&
          icon !== null &&
          (!name(icon) || icon.includes(':'))
        )
          invalid('componentIcons maps slots to shared IconName or null.');
      }
    }
    const policy = dataField(input, 'iconCapabilities', 'iconCapabilities');
    if (policy !== undefined) {
      keys(
        policy,
        ['contract', 'sizeOverrides', 'roleSizeOverrides', 'presentation'],
        'iconCapabilities',
      );
      const sizes = dataField(
        policy,
        'roleSizeOverrides',
        'iconCapabilities.roleSizeOverrides',
      );
      if (sizes !== undefined) {
        record(sizes, 'iconCapabilities.roleSizeOverrides');
        for (const [role, descriptor] of Object.entries(
          Object.getOwnPropertyDescriptors(sizes),
        )) {
          const size = descriptor.value;
          roleName(role, 'iconCapabilities.roleSizeOverrides');
          if (size !== undefined && size !== null && !name(size))
            invalid(
              'iconCapabilities.roleSizeOverrides maps roles to admitted size names or null.',
            );
        }
      }
      const presentation = dataField(
        policy,
        'presentation',
        'iconCapabilities.presentation',
      );
      if (presentation !== undefined && presentation !== null) {
        keys(
          presentation,
          ['default', 'bySize', 'byState'],
          'iconCapabilities.presentation',
        );
        const states = dataField(
          presentation,
          'byState',
          'iconCapabilities.presentation.byState',
        );
        if (states !== undefined) {
          record(states, 'iconCapabilities.presentation.byState');
          for (const [state, descriptor] of Object.entries(
            Object.getOwnPropertyDescriptors(states),
          )) {
            const request = descriptor.value;
            if (
              !name(state) ||
              [...state].some(character => {
                const code = character.charCodeAt(0);
                return code < 32 || code === 127;
              }) ||
              ['__proto__', 'constructor', 'prototype'].includes(state)
            )
              invalid(
                'Icon presentation states must be safe nonempty finite names.',
              );
            if (request === undefined) continue;
            keys(
              request,
              ['appearance'],
              'iconCapabilities.presentation.byState request',
            );
            if (request.appearance !== undefined && !name(request.appearance))
              invalid(
                'Icon state presentation accepts only an admitted appearance.',
              );
          }
        }
      }
    }
    const contracts = dataField(input, '__iconContracts', '__iconContracts');
    if (contracts !== undefined)
      serializeIconData(contracts, '__iconContracts');
    // Sources may contain React elements/functions. Check only the outer
    // descriptors here; their actual tree grammar belongs to Core defineTheme.
    dataField(input, 'icons', 'icons');
    dataField(input, '__iconSources', '__iconSources');
  }
}

/** @param {any} theme @returns {boolean} */
export function hasIconCapabilityIntent(theme) {
  if (!theme || typeof theme !== 'object') return false;
  for (const key of [
    'componentIcons',
    'iconCapabilities',
    '__iconSources',
    '__iconContracts',
  ]) {
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
    roleSizes = new Set(),
    componentSlots = new Set(),
    sources = new Set();
  let componentMapSeen = false,
    roleSizeMapSeen = false;
  const policy = dataField(theme, 'iconCapabilities', 'iconCapabilities');
  for (const [index, input] of inputs.entries()) {
    const mapping = dataField(input, 'componentIcons', 'componentIcons');
    if (mapping !== undefined) {
      const actual = dataField(theme, 'componentIcons', 'componentIcons');
      if (!componentMapSeen) {
        componentMapSeen = true;
        requireRetained(actual !== undefined);
      }
      for (const [slot, descriptor] of Object.entries(
        Object.getOwnPropertyDescriptors(mapping),
      )) {
        if (
          !('value' in descriptor) ||
          descriptor.value === undefined ||
          componentSlots.has(slot)
        )
          continue;
        componentSlots.add(slot);
        requireRetained(
          retains(
            dataField(actual, slot, `componentIcons.${slot}`),
            descriptor.value,
          ),
        );
      }
    }
    const authored = dataField(input, 'iconCapabilities', 'iconCapabilities');
    const roles = dataField(
      authored,
      'roleSizeOverrides',
      'iconCapabilities.roleSizeOverrides',
    );
    if (roles !== undefined) {
      const actual = dataField(
        policy,
        'roleSizeOverrides',
        'iconCapabilities.roleSizeOverrides',
      );
      if (!roleSizeMapSeen) {
        roleSizeMapSeen = true;
        requireRetained(actual !== undefined);
      }
      for (const [role, descriptor] of Object.entries(
        Object.getOwnPropertyDescriptors(roles),
      )) {
        if (
          !('value' in descriptor) ||
          descriptor.value === undefined ||
          roleSizes.has(role)
        )
          continue;
        roleSizes.add(role);
        requireRetained(
          retains(
            dataField(
              actual,
              role,
              `iconCapabilities.roleSizeOverrides.${role}`,
            ),
            descriptor.value,
          ),
        );
      }
    }
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

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentIconMap.ts
 * @input Source-only component slot mappings to shared names or null
 * @output Immutable strict authoring maps and sibling-safe runtime maps
 * @position Private source-map boundary; independent of role participation and import order
 */
import type {ComponentIconMap} from './index';
import {defaultIcons} from './defaultIcons';
import {getOwnIconData, isRecord, requireRecord} from './iconCapabilities';
const normalizedMaps = new WeakMap<object, ComponentIconMap>();
function snapshot(input: Record<string, string | null>): ComponentIconMap {
  const frozen: unknown = Object.freeze(input);
  const map = frozen as ComponentIconMap;
  normalizedMaps.set(input, map);
  return map;
}

/** @internal Slots name purpose, never namespaced artwork. */
export function isComponentIconSlotName(value: unknown): value is string {
  return (
    typeof value === 'string' && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(value)
  );
}
/** @internal Only the closed shared registry is a mapping target. */
export function isComponentIconName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !value.includes(':') &&
    Object.hasOwn(defaultIcons, value)
  );
}
/** Strict authoring validation needs no runtime role registration. */
export function validateComponentIconMap(
  input: unknown,
): ComponentIconMap | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input === 'object' && input !== null) {
    const snapshot = normalizedMaps.get(input);
    if (snapshot) {
      return snapshot;
    }
  }
  requireRecord(input, 'componentIcons');
  const result: Record<string, string | null> = {};
  for (const key of Reflect.ownKeys(input)) {
    if (!isComponentIconSlotName(key)) {
      throw new Error('Icon: invalid component icon slot name.');
    }
    const value = getOwnIconData(input, key);
    if (value === undefined) {
      continue;
    }
    if (value !== null && !isComponentIconName(value)) {
      throw new Error(
        'Icon: componentIcons maps slots to shared IconName or null.',
      );
    }
    result[key] = value;
  }
  return snapshot(result);
}
/** Malformed foreign fields never invoke getters or erase valid siblings. */
export function readComponentIconMap(
  input: unknown,
  notifyInvalid: () => void,
): ComponentIconMap | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input === 'object' && input !== null) {
    const snapshot = normalizedMaps.get(input);
    if (snapshot) {
      return snapshot;
    }
  }
  const result: Record<string, string | null> = {};
  try {
    if (!isRecord(input)) {
      throw new Error('Invalid componentIcons');
    }
    for (const key of Reflect.ownKeys(input)) {
      try {
        if (!isComponentIconSlotName(key)) {
          throw new Error('Invalid slot');
        }
        const value = getOwnIconData(input, key);
        if (value === undefined) {
          continue;
        }
        if (value !== null && !isComponentIconName(value)) {
          throw new Error('Invalid shared name');
        }
        result[key] = value;
      } catch {
        notifyInvalid();
      }
    }
  } catch {
    notifyInvalid();
    return undefined;
  }
  return snapshot(result);
}
/** Own undefined uses the next fallback; own null deliberately suppresses. */
export function mergeComponentIconMaps(
  inherited?: ComponentIconMap,
  own?: ComponentIconMap,
): ComponentIconMap | undefined {
  if (!own) {
    return inherited;
  }
  if (!inherited) {
    return own;
  }
  return validateComponentIconMap({...inherited, ...own});
}

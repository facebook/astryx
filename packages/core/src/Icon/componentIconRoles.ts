// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file componentIconRoles.ts
 * @input Metadata-bearing owner slot declarations and finite active conditions
 * @output Immutable role metadata and one state selected by declared precedence
 * @position Server-safe authoring; true slots never register or participate automatically
 */
import type {
  ComponentIconStateName,
  ParticipatingComponentIconSlotName,
} from './index';
import {
  getOwnIconData,
  isRecord,
  requireIconDataArray,
  requireKeys,
  requireRecord,
  type IconSize,
} from './iconCapabilities';
import {isComponentIconSlotName} from './componentIconMap';

export interface ComponentIconRoleMetadata {
  readonly slot: string;
  readonly defaultSize: string;
  readonly states: ReadonlyArray<string>;
  readonly statePrecedence: ReadonlyArray<string>;
}
const roles = new Map<string, ComponentIconRoleMetadata>();
function validState(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.trim() === value &&
    ![...value].some(
      character =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    ) &&
    !['__proto__', 'constructor', 'prototype'].includes(value)
  );
}
/** Declare every finite state once, highest precedence first; no global state vocabulary. */
export function declareComponentIconRole<
  const Slot extends ParticipatingComponentIconSlotName,
  const Order extends ReadonlyArray<ComponentIconStateName<Slot>>,
>(
  input: {
    slot: Slot;
    defaultSize: IconSize;
    statePrecedence: Order;
  } & (Exclude<ComponentIconStateName<Slot>, Order[number]> extends never
    ? unknown
    : {
        readonly missingStates: Exclude<
          ComponentIconStateName<Slot>,
          Order[number]
        >;
      }),
): ComponentIconRoleMetadata {
  requireRecord(input, 'component role');
  requireKeys(
    input,
    ['slot', 'defaultSize', 'statePrecedence'],
    'component role',
  );
  if (!isComponentIconSlotName(input.slot)) {
    throw new Error('Icon: role names use component-kebab-semantic-role.');
  }
  if (!validState(input.defaultSize)) {
    throw new Error('Icon: invalid role default size.');
  }
  requireIconDataArray(input.statePrecedence, 'role precedence');
  if (
    !input.statePrecedence.length ||
    !input.statePrecedence.every(validState) ||
    new Set(input.statePrecedence).size !== input.statePrecedence.length
  ) {
    throw new Error('Icon: role precedence must contain unique finite states.');
  }
  const states = Object.freeze([...input.statePrecedence]);
  const metadata = Object.freeze({
    slot: input.slot,
    defaultSize: input.defaultSize,
    states,
    statePrecedence: states,
  });
  const previous = roles.get(input.slot);
  if (previous) {
    if (JSON.stringify(previous) !== JSON.stringify(metadata)) {
      throw new Error('Icon: conflicting component role declaration.');
    }
    return previous;
  }
  roles.set(input.slot, metadata);
  return metadata;
}
/** Component conditions are own boolean data; malformed conditions are ignored independently. */
export function getComponentIconState<
  Slot extends ParticipatingComponentIconSlotName,
>(
  slot: Slot,
  conditions: Readonly<Partial<Record<ComponentIconStateName<Slot>, boolean>>>,
): ComponentIconStateName<Slot> | undefined {
  const role = roles.get(slot);
  if (!role) {
    return undefined;
  }
  try {
    if (!isRecord(conditions)) {
      return undefined;
    }
  } catch {
    return undefined;
  }
  for (const state of role.statePrecedence) {
    try {
      if (getOwnIconData(conditions, state) === true) {
        return state as ComponentIconStateName<Slot>;
      }
    } catch {
      // Ignore an accessor without evaluating it; a valid lower-priority condition survives.
    }
  }
  return undefined;
}
/** @internal Only owner renderers consult registration; theme admission never does. */
export function getComponentIconRole(
  slot: string,
): ComponentIconRoleMetadata | undefined {
  return roles.get(slot);
}
/** @internal Test isolation, not a public registry operation. */
export function resetComponentIconRoles(): void {
  roles.clear();
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-unaugmented.fixture.tsx
 * @input Public contract without component-slot or capability augmentation
 * @output Empty slot/state vocabulary and closed role policy assertions
 * @position Independent virtual consumer, rechecked after augmented programs
 */
import {
  declareComponentIconRole,
  getComponentIconState,
  type ComponentIconMap,
  type ComponentIconStateName,
  type IconPresentationPolicy,
  type IconThemeCapabilitiesInput,
  type ParticipatingComponentIconSlotName,
} from '@astryxdesign/core/Icon';
import {defineTheme} from '@astryxdesign/core/theme';

export type NoSlots = Assert<Equal<ComponentIconSlotName, never>>;
export type NoStates = Assert<Equal<ComponentIconStateName, never>>;
export type NoRoles = Assert<Equal<ParticipatingComponentIconSlotName, never>>;
export type ExactClosedMap = Assert<
  Equal<ComponentIconMap, Record<string, never>>
>;
export const emptyMap: ComponentIconMap = {};
export const emptyPolicy: IconThemeCapabilitiesInput = {roleSizeOverrides: {}};
export const noChanges = defineTheme({
  name: 'consumer-no-roles',
  componentIcons: {},
});
// @ts-expect-error No consumer or Core role has been declared in this program.
export const mapWithoutOwner: ComponentIconMap = {'consumer-leading': 'search'};
// prettier-ignore
// @ts-expect-error Unknown keys stay rejected even when their value is undefined.
export const undefinedMapWithoutOwner: ComponentIconMap = {'consumer-leading': undefined};
// prettier-ignore
// @ts-expect-error Unaugmented role policy cannot invent a role name.
export const roleWithoutOwner: IconThemeCapabilitiesInput = {roleSizeOverrides: {'consumer-leading': 'sm'}};
// prettier-ignore
// @ts-expect-error Unaugmented state policy cannot invent a state name.
export const stateWithoutOwner: IconPresentationPolicy = {byState: {selected: {}}};
// prettier-ignore
// @ts-expect-error A declaration does not invent compile-time participation metadata.
declareComponentIconRole({slot: 'consumer-leading', defaultSize: 'sm', statePrecedence: ['selected']});
// @ts-expect-error State selection requires an owner-augmented finite role.
getComponentIconState('consumer-leading', {});

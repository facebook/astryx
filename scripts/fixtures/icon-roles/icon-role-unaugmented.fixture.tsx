// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-unaugmented.fixture.tsx
 * @input Public contract without consumer component-slot or capability augmentation
 * @output Core's Button role is the only slot/state vocabulary; role policy stays closed otherwise
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

export type CoreSlotOnly = Assert<
  Equal<ComponentIconSlotName, 'button-leading'>
>;
export type CoreStatesOnly = Assert<
  Equal<ComponentIconStateName, 'disabled' | 'pressed' | 'loading'>
>;
export type CoreButtonStates = Assert<
  Equal<
    ComponentIconStateName<'button-leading'>,
    'disabled' | 'pressed' | 'loading'
  >
>;
export type CoreRoleOnly = Assert<
  Equal<ParticipatingComponentIconSlotName, 'button-leading'>
>;
export type CoreKeyedMap = Assert<
  Equal<ComponentIconMap, Partial<Record<'button-leading', IconName | null>>>
>;
export type NoButtonRoleProps = Assert<
  Equal<
    Extract<
      keyof import('@astryxdesign/core/Button').ButtonProps,
      'iconRole' | 'iconState' | 'iconSlot' | 'iconDefaultSize' | 'defaultSize'
    >,
    never
  >
>;
export type NoButtonRoleExports = Assert<
  Equal<
    Extract<
      keyof typeof import('@astryxdesign/core/Button'),
      | 'buttonLeadingIconRole'
      | 'getButtonLeadingIconState'
      | 'BUTTON_LEADING_ICON_SLOT'
    >,
    never
  >
>;
export const emptyMap: ComponentIconMap = {};
export const emptyPolicy: IconThemeCapabilitiesInput = {roleSizeOverrides: {}};
export const coreRolePolicy: IconThemeCapabilitiesInput = {
  roleSizeOverrides: {'button-leading': 'md'},
};
export const coreRoleCleared: IconThemeCapabilitiesInput = {
  roleSizeOverrides: {'button-leading': null},
};
export const coreStatePolicy: IconPresentationPolicy = {
  byState: {pressed: {}, disabled: {}, loading: {}},
};
export const noChanges = defineTheme({
  name: 'consumer-no-roles',
  componentIcons: {},
});
// @ts-expect-error No consumer role has been declared in this program.
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
// @ts-expect-error Core's Button role reports no hover state.
export const buttonHover: IconPresentationPolicy = {byState: {hovered: {}}};
// prettier-ignore
// @ts-expect-error A Button state never selects weight.
export const buttonStateWeight: IconPresentationPolicy = {byState: {pressed: {weight: 400}}};
// prettier-ignore
// @ts-expect-error A declaration does not invent compile-time participation metadata.
declareComponentIconRole({slot: 'consumer-leading', defaultSize: 'sm', statePrecedence: ['selected']});
// @ts-expect-error State selection requires an owner-augmented finite role.
getComponentIconState('consumer-leading', {});

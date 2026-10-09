// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-finite.fixture.tsx
 * @input Explicit downstream finite-state slots and application artwork capabilities
 * @output Exhaustive declaration, finite state selection and appearance-only policy
 * @position Isolated authoring/type evidence, not a participating component proof
 */
import {
  declareComponentIconRole,
  defineIconCapabilities,
  getComponentIconState,
  type ComponentIconMap,
  type ComponentIconRoleMetadata,
  type ComponentIconStateName,
  type IconThemeCapabilitiesInput,
  type ParticipatingComponentIconSlotName,
} from '@astryxdesign/core/Icon';
import {defineTheme} from '@astryxdesign/core/theme';

export const contract = defineIconCapabilities({
  sizes: {compact: {default: '14px'}},
  appearances: ['outline', 'filled'],
  weights: {values: [400, 600]},
});
declare module '@astryxdesign/core/Icon' {
  interface IconCapabilityMap {
    consumerRoleArtwork: typeof contract;
  }
  interface ComponentIconSlotMap {
    'consumer-finite-leading': {slot: true; states: 'selected' | 'disabled'};
    'consumer-finite-trailing': {slot: true; states: 'busy' | 'idle'};
    'consumer-finite-source': {slot: true};
  }
}
export type ParticipatingSlots = Assert<
  Equal<
    ParticipatingComponentIconSlotName,
    'consumer-finite-leading' | 'consumer-finite-trailing'
  >
>;
export type LeadingStates = Assert<
  Equal<
    ComponentIconStateName<'consumer-finite-leading'>,
    'selected' | 'disabled'
  >
>;
export type AllStates = Assert<
  Equal<ComponentIconStateName, 'selected' | 'disabled' | 'busy' | 'idle'>
>;
export const role: ComponentIconRoleMetadata = declareComponentIconRole({
  slot: 'consumer-finite-leading',
  defaultSize: 'compact',
  statePrecedence: ['disabled', 'selected'],
});
export const trailingRole = declareComponentIconRole({
  slot: 'consumer-finite-trailing',
  defaultSize: 'sm',
  statePrecedence: ['busy', 'idle'],
});
export const effectiveState = getComponentIconState('consumer-finite-leading', {
  selected: true,
  disabled: false,
});
export type EffectiveStateResult = Assert<
  Equal<typeof effectiveState, 'selected' | 'disabled' | undefined>
>;
export type StateSelectionParameters = Assert<
  Equal<
    Parameters<typeof getComponentIconState<'consumer-finite-leading'>>,
    [
      'consumer-finite-leading',
      Readonly<Partial<Record<'selected' | 'disabled', boolean>>>,
    ]
  >
>;
export const partialConditions = getComponentIconState(
  'consumer-finite-leading',
  {},
);
export const mapping: ComponentIconMap = {
  'consumer-finite-leading': 'search',
  'consumer-finite-trailing': null,
};
export const policy: IconThemeCapabilitiesInput<typeof contract> = {
  contract,
  roleSizeOverrides: {
    'consumer-finite-leading': 'compact',
    'consumer-finite-trailing': null,
  },
  presentation: {
    default: {appearance: 'outline', weight: 400},
    bySize: {compact: {weight: 600}},
    byState: {
      selected: {appearance: 'filled'},
      disabled: {appearance: 'outline'},
    },
  },
};
export const theme = defineTheme({
  name: 'consumer-finite',
  componentIcons: mapping,
  iconCapabilities: policy,
});
export const cleared = defineTheme({
  name: 'consumer-finite-cleared',
  extends: theme,
  iconCapabilities: {
    roleSizeOverrides: {'consumer-finite-leading': null},
    presentation: null,
  },
});
getComponentIconName('consumer-finite-leading', 'search', theme);
getComponentIcon('consumer-finite-leading', 'search', theme);
useComponentIconName('consumer-finite-leading', 'search');
useComponentIcon('consumer-finite-leading', 'search');
export const explicit = (
  <Icon icon="search" size="compact" appearance="outline" weight={600} />
);
// prettier-ignore
// @ts-expect-error Precedence must enumerate every state, not only one branch.
declareComponentIconRole({slot: 'consumer-finite-leading', defaultSize: 'sm', statePrecedence: ['selected']});
// prettier-ignore
// @ts-expect-error Empty precedence cannot satisfy a nonempty finite state union.
declareComponentIconRole({slot: 'consumer-finite-leading', defaultSize: 'sm', statePrecedence: []});
// prettier-ignore
// @ts-expect-error Precedence cannot borrow a different role's state vocabulary.
declareComponentIconRole({slot: 'consumer-finite-leading', defaultSize: 'sm', statePrecedence: ['disabled', 'selected', 'busy']});
// prettier-ignore
// @ts-expect-error Metadata-bearing slots still require an admitted default size.
declareComponentIconRole({slot: 'consumer-finite-leading', defaultSize: 'display', statePrecedence: ['disabled', 'selected']});
// prettier-ignore
// @ts-expect-error Role authoring requires its authoritative default size.
declareComponentIconRole({slot: 'consumer-finite-leading', statePrecedence: ['disabled', 'selected']});
// prettier-ignore
// @ts-expect-error A role requires explicit state precedence, not inferred order.
declareComponentIconRole({slot: 'consumer-finite-leading', defaultSize: 'sm'});
// prettier-ignore
// @ts-expect-error A widened array of strings is not finite owner precedence.
declareComponentIconRole({slot: 'consumer-finite-leading', defaultSize: 'sm', statePrecedence: ['disabled', 'selected'] as string[]});
// @ts-expect-error Effective state conditions are role-specific.
getComponentIconState('consumer-finite-leading', {busy: true});
// @ts-expect-error Conditions are booleans, not truthy requests.
getComponentIconState('consumer-finite-leading', {selected: 'yes'});
// @ts-expect-error State selection remains exactly two arguments.
getComponentIconState('consumer-finite-leading', {selected: true}, 'selected');
// @ts-expect-error Readonly owner metadata cannot be rewritten by a theme.
role.defaultSize = 'lg';
// prettier-ignore
// @ts-expect-error Role-size override keys exclude source-only slots.
export const sourceSize: IconThemeCapabilitiesInput<typeof contract> = {roleSizeOverrides: {'consumer-finite-source': 'sm'}};
// prettier-ignore
// @ts-expect-error Role-size overrides choose admitted size names, not dimensions.
export const pixelRoleSize: IconThemeCapabilitiesInput<typeof contract> = {roleSizeOverrides: {'consumer-finite-leading': '24px'}};
// prettier-ignore
// @ts-expect-error Theme policy cannot invent an owner state.
export const unknownState: IconThemeCapabilitiesInput<typeof contract> = {presentation: {byState: {hovered: {appearance: 'filled'}}}};
// prettier-ignore
// @ts-expect-error Effective state affects appearance only, never weight.
export const stateWeight: IconThemeCapabilitiesInput<typeof contract> = {presentation: {byState: {selected: {appearance: 'filled', weight: 600}}}};
// prettier-ignore
// @ts-expect-error Effective state cannot choose size.
export const stateSize: IconThemeCapabilitiesInput<typeof contract> = {presentation: {byState: {selected: {size: 'compact'}}}};
// prettier-ignore
// @ts-expect-error State policy cannot invent artwork appearances.
export const unknownAppearance: IconThemeCapabilitiesInput<typeof contract> = {presentation: {byState: {selected: {appearance: 'duotone'}}}};
// prettier-ignore
// @ts-expect-error Legacy lookup is not a role/state rendering API.
getComponentIcon('consumer-finite-leading', 'search', theme, {state: effectiveState, defaultSize: 'sm'});
// @ts-expect-error Legacy hooks are not a public transport seam.
useComponentIcon('consumer-finite-leading', 'search', {state: effectiveState});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-source-only.fixture.tsx
 * @input Canonical public {slot: true} augmentation without finite states
 * @output Legacy source mappings with no automatic role/state participation
 * @position Independent external library consumer; Core's Button role is the only participant
 */
import {
  declareComponentIconRole,
  getComponentIconState,
  type ComponentIconMap,
  type ComponentIconSlotMap,
  type ComponentIconStateName,
  type IconThemeCapabilitiesInput,
  type ParticipatingComponentIconSlotName,
} from '@astryxdesign/core/Icon';
import {defineTheme} from '@astryxdesign/core/theme';

declare module '@astryxdesign/core/Icon' {
  interface ComponentIconSlotMap {
    'consumer-source-leading': {slot: true};
    'consumer-source-trailing': {slot: true};
    'consumer-source-marker': true;
  }
}
export type CanonicalSourceEntry = Assert<
  Equal<ComponentIconSlotMap['consumer-source-leading'], {slot: true}>
>;
export type SourceSlots = Assert<
  Equal<
    ComponentIconSlotName,
    | 'button-leading'
    | 'consumer-source-leading'
    | 'consumer-source-trailing'
    | 'consumer-source-marker'
  >
>;
export type SourceHasNoState = Assert<
  Equal<ComponentIconStateName<'consumer-source-leading'>, never>
>;
export type SourceIsNotRole = Assert<
  Equal<ParticipatingComponentIconSlotName, 'button-leading'>
>;
export const mapping: ComponentIconMap = {
  'consumer-source-leading': 'search',
  'consumer-source-trailing': null,
  'consumer-source-marker': 'check',
};
export const theme = defineTheme({
  name: 'consumer-source-map',
  componentIcons: mapping,
});
export const selectedName: IconName | null = getComponentIconName(
  'consumer-source-leading',
  'search',
  theme,
);
export const selectedArtwork: ReactNode = getComponentIcon(
  'consumer-source-leading',
  null,
  theme,
);
useComponentIconName('consumer-source-leading', 'search');
useComponentIcon('consumer-source-trailing', null);
// prettier-ignore
// @ts-expect-error Mapping values are shared semantic names, never namespaced artwork keys.
export const extensionMapping: ComponentIconMap = {'consumer-source-leading': 'consumer:mark'};
// prettier-ignore
// @ts-expect-error Mapping values are not concrete artwork.
export const artworkMapping: ComponentIconMap = {'consumer-source-leading': <svg />};
// prettier-ignore
// @ts-expect-error Undeclared source slots cannot be invented by a theme.
export const undeclaredMapping: ComponentIconMap = {'consumer-source-unknown': 'search'};
// prettier-ignore
// @ts-expect-error {slot: true} does not automatically participate in role sizing.
export const sourceRoleSize: IconThemeCapabilitiesInput = {roleSizeOverrides: {'consumer-source-leading': 'sm'}};
// prettier-ignore
// @ts-expect-error Source-only augmentation cannot declare effective states.
declareComponentIconRole({slot: 'consumer-source-leading', defaultSize: 'sm', statePrecedence: ['selected']});
// @ts-expect-error Source-only augmentation cannot use state selection.
getComponentIconState('consumer-source-leading', {});
// prettier-ignore
// @ts-expect-error Source lookup keeps exactly three arguments, not a state/request overload.
getComponentIconName('consumer-source-leading', 'search', theme, {state: 'selected'});
// @ts-expect-error Artwork lookup keeps exactly three arguments.
getComponentIcon('consumer-source-leading', 'search', theme, {size: 'sm'});
// @ts-expect-error Source hook keeps exactly two arguments.
useComponentIconName('consumer-source-leading', 'search', {state: 'selected'});
// @ts-expect-error Artwork hook keeps exactly two arguments.
useComponentIcon('consumer-source-leading', 'search', {size: 'sm'});

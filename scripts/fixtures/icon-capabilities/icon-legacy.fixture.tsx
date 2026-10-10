// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-legacy.fixture.tsx
 * @input Released Icon exports in a program without capability augmentation
 * @output Exact legacy signatures, fixed node reads, and closed application axes
 * @position Isolated external-consumer fixture for source and emitted declarations
 */
import type {ComponentType, ReactNode, SVGProps} from 'react';
import {
  Icon,
  getExtendedIcon,
  getIcon,
  registerIcons,
  renderIconSlot,
  useIcon,
  type ExtendedIconName,
  type IconAppearance,
  type IconName,
  type IconRegistrySource,
  type IconRequest,
  type IconSize,
  type IconType,
  type IconWeight,
  type NamespacedIconName,
} from '@astryxdesign/core/Icon';
import {defineTheme, type DefinedTheme} from '@astryxdesign/core/theme';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
export type LegacySizes = Assert<Equal<IconSize, 'xsm' | 'sm' | 'md' | 'lg'>>;
export type NoAppearanceLeak = Assert<Equal<IconAppearance, never>>;
export type NoWeightLeak = Assert<Equal<IconWeight, never>>;
export type OrdinarySVGComponent = Assert<
  Equal<IconType, ComponentType<SVGProps<SVGSVGElement>>>
>;
export type RegistrationSignature = Assert<
  Equal<
    Parameters<typeof registerIcons>,
    [Partial<Record<ExtendedIconName, ReactNode>>]
  >
>;
export type ReadSignature = Assert<
  Equal<Parameters<typeof getIcon>, [ExtendedIconName, IconRegistrySource?]>
>;
export type ExtendedReadSignature = Assert<
  Equal<
    Parameters<typeof getExtendedIcon>,
    [ExtendedIconName, ReactNode?, IconRegistrySource?]
  >
>;
export type HookSignature = Assert<
  Equal<Parameters<typeof useIcon>, [IconName | NamespacedIconName]>
>;

type PublicIconExports = typeof import('@astryxdesign/core/Icon');
export type NoAdditionalRuntimeAPIs = Assert<
  Equal<
    Exclude<
      keyof PublicIconExports,
      | 'Icon'
      | 'renderIconSlot'
      | 'useIcon'
      | 'registerIcons'
      | 'getIconRegistry'
      | 'getIcon'
      | 'getExtendedIcon'
      | 'resetIcons'
      | 'defineIconCapabilities'
      | 'defineAdaptiveIcon'
      | 'getApplicationIconCapabilities'
    >,
    never
  >
>;

const Fixed: IconType = props => <svg {...props} />;
const icons = {search: <Fixed />, 'consumer:mark': <Fixed />};
export const theme: DefinedTheme = defineTheme({name: 'consumer-fixed', icons});
export const read: ReactNode = theme.icons?.search;
export const defaults = <Icon icon="search" />;
export const direct = <Icon icon={Fixed} size="xsm" color="primary" />;
export const namespaced = <Icon icon="consumer:mark" size="lg" />;
export const slot: ReactNode = renderIconSlot(Fixed, {
  size: 'sm',
  color: 'inherit',
});
registerIcons(icons);
getIcon('search');
getIcon('consumer:mark', theme);
getExtendedIcon('consumer:missing', <Fixed />, theme);
useIcon('search');

// @ts-expect-error Another consumer's custom size must not leak into this program.
export const leakedSize = <Icon icon="search" size="compact" />;
// @ts-expect-error Appearance needs application capability augmentation.
export const leakedAppearance = <Icon icon="search" appearance="outline" />;
// @ts-expect-error Exact or range weight admission belongs to another program.
export const leakedWeight = <Icon icon="search" weight={400} />;
// @ts-expect-error Registration retains its released one-argument signature.
registerIcons(icons, {});
// @ts-expect-error Registry reads do not accept a third request argument.
getIcon('search', theme, {size: 'sm'});
// @ts-expect-error Extended reads do not accept a fourth request argument.
getExtendedIcon('search', <Fixed />, theme, {size: 'sm'});
// @ts-expect-error The hook retains its released one-argument signature.
useIcon('search', {size: 'sm'});
// @ts-expect-error The legacy slot helper accepts only size and color.
renderIconSlot(Fixed, {appearance: 'outline'});
// @ts-expect-error Weight is not a slot-helper option.
renderIconSlot(Fixed, {weight: 400});
// @ts-expect-error An unadmitted request size cannot widen IconSize.
export const invalidRequest: IconRequest = {size: 'display'};
// @ts-expect-error Internal defaults are not consumer requests.
export const internalDefault: IconRequest = {defaultSize: 'sm'};
// @ts-expect-error Component state is not a Core A request field.
export const internalState: IconRequest = {state: 'selected'};
// @ts-expect-error Component role is not a Core A request field.
export const internalRole: IconRequest = {role: 'consumer-leading'};

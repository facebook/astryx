// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-role-public-contract.fixture.tsx
 * @input Public APIs in each independent role/state consumer program
 * @output Exact legacy signatures and private transport containment assertions
 * @position Prepended in memory to each fixture; never a shared compiler program
 */
import type {ReactNode} from 'react';
import {
  Icon,
  getComponentIcon,
  getComponentIconName,
  getExtendedIcon,
  getIcon,
  renderIconSlot,
  useComponentIcon,
  useComponentIconName,
  useIcon,
  type ComponentIconSlotName,
  type IconName,
  type IconProps,
  type IconRegistrySource,
  type IconRequest,
} from '@astryxdesign/core/Icon';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
export type SharedLookupParameters = Assert<
  Equal<
    Parameters<typeof getIcon>,
    [import('@astryxdesign/core/Icon').ExtendedIconName, IconRegistrySource?]
  >
>;
export type ExtendedLookupParameters = Assert<
  Equal<
    Parameters<typeof getExtendedIcon>,
    [
      import('@astryxdesign/core/Icon').ExtendedIconName,
      ReactNode?,
      IconRegistrySource?,
    ]
  >
>;
export type SharedHookParameters = Assert<
  Equal<
    Parameters<typeof useIcon>,
    [IconName | import('@astryxdesign/core/Icon').NamespacedIconName]
  >
>;
export type NameLookupParameters = Assert<
  Equal<
    Parameters<typeof getComponentIconName>,
    [ComponentIconSlotName, IconName | null, IconRegistrySource?]
  >
>;
export type ArtworkLookupParameters = Assert<
  Equal<
    Parameters<typeof getComponentIcon>,
    [ComponentIconSlotName, IconName | null, IconRegistrySource?]
  >
>;
export type NameHookParameters = Assert<
  Equal<
    Parameters<typeof useComponentIconName>,
    [ComponentIconSlotName, IconName | null]
  >
>;
export type ArtworkHookParameters = Assert<
  Equal<
    Parameters<typeof useComponentIcon>,
    [ComponentIconSlotName, IconName | null]
  >
>;
export type NameLookupSignature = Assert<
  Equal<
    typeof getComponentIconName,
    (
      slot: ComponentIconSlotName,
      fallback: IconName | null,
      source?: IconRegistrySource,
    ) => IconName | null
  >
>;
export type ArtworkLookupSignature = Assert<
  Equal<
    typeof getComponentIcon,
    (
      slot: ComponentIconSlotName,
      fallback: IconName | null,
      source?: IconRegistrySource,
    ) => ReactNode
  >
>;
export type NameHookSignature = Assert<
  Equal<
    typeof useComponentIconName,
    (slot: ComponentIconSlotName, fallback: IconName | null) => IconName | null
  >
>;
export type ArtworkHookSignature = Assert<
  Equal<
    typeof useComponentIcon,
    (slot: ComponentIconSlotName, fallback: IconName | null) => ReactNode
  >
>;
export type RequestFields = Assert<
  Equal<keyof IconRequest, 'size' | 'appearance' | 'weight'>
>;
export type NoDefaultSizeProp = Assert<
  Equal<Extract<keyof IconProps, 'defaultSize' | 'state' | 'request'>, never>
>;
export type NoPublicInternalRuntimeExports = Assert<
  Equal<
    Extract<
      keyof typeof import('@astryxdesign/core/Icon'),
      | 'resolveIcon'
      | 'resolveIconWithContext'
      | 'renderComponentIconSlot'
      | 'ComponentIconContext'
      | 'ComponentIconProvider'
      | 'IconDefaultSizeContext'
      | 'IconDefaultSizeProvider'
      | 'getComponentIconRole'
      | 'resetComponentIconRoles'
      | 'componentIconRoles'
      | 'registerComponentIconRole'
    >,
    never
  >
>;
// @ts-expect-error Resolver result types are not public consumer plumbing.
import type {IconResolution} from '@astryxdesign/core/Icon';
// @ts-expect-error Component slot transport is not a public type.
import type {ComponentIconContextValue} from '@astryxdesign/core/Icon';

// @ts-expect-error Private default-size transport is not an explicit request.
export const spoofDefault: IconRequest = {defaultSize: 'sm'};
// @ts-expect-error Role/state are component-owned, not request fields.
export const spoofRole: IconRequest = {role: 'consumer-leading'};
// @ts-expect-error Component conditions do not become public Icon requests.
export const spoofState: IconRequest = {state: 'selected'};
// @ts-expect-error The request cannot inject a slot.
export const spoofSlot: IconRequest = {slot: 'consumer-leading'};
// @ts-expect-error Public Icon does not accept private default size.
export const spoofIconDefault = <Icon icon="search" defaultSize="sm" />;
// @ts-expect-error Public Icon does not accept private effective state.
export const spoofIconState = <Icon icon="search" state="selected" />;
// Existing native SVG role/slot attributes remain pass-through, not icon policy.
export const nativeSvgAttributes = (
  <Icon icon="search" role="img" slot="consumer-leading" />
);
// @ts-expect-error Legacy shared lookup remains two arguments.
getIcon('search', null, {size: 'sm'});
// @ts-expect-error Legacy extended lookup remains three arguments.
getExtendedIcon('search', null, null, {size: 'sm'});
// @ts-expect-error Legacy shared hook remains one argument.
useIcon('search', {size: 'sm'});
// @ts-expect-error Legacy render helper cannot inject component state.
renderIconSlot('search', {size: 'sm', state: 'selected'});
// @ts-expect-error Legacy render helper cannot inject owner default size.
renderIconSlot('search', {defaultSize: 'sm'});

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Icon rendering, actual node registry reads and pure capability/adapter constructors
 * @output Released Icon APIs, presentation types and local adaptive/adapter authoring
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */
export {Icon, renderIconSlot} from './Icon';
export {useIcon} from './useIcon';
export type {IconProps, IconColor, IconSize, IconType} from './Icon';
export {
  registerIcons,
  getIconRegistry,
  getIcon,
  getExtendedIcon,
  resetIcons,
} from './globalIconRegistry';
export type {
  IconName,
  ExtendedIconName,
  NamespacedIconName,
  IconRegistry,
  IconRegistrySource,
} from './globalIconRegistry';
export {
  defineIconCapabilities,
  getApplicationIconCapabilities,
} from './iconCapabilities';
export {defineAdaptiveIcon} from './adaptiveIcons';
export {createIconAdapter} from './iconAdapters';
export type {
  IconAdapterOptions,
  IconAdapterProps,
  IconAdapterRequest,
} from './iconAdapters';
export type {
  BuiltInIconSize,
  IconCapabilities,
  IconWeightRange,
  IconAppearance,
  IconWeight,
  IconContractSize,
  IconContractAppearance,
  IconContractWeight,
  IconRequest,
  IconPresentationPolicy,
  IconThemeCapabilitiesInput,
  IconThemeCapabilities,
  ApplicationIconCapabilities,
} from './iconCapabilities';
export type {
  AdaptiveIconEntry,
  AdaptiveIconTree,
  IconEntry,
  IconVersion,
  ParameterizedIconVersion,
} from './adaptiveIcons';
/** Explicit library contract declarations; this type never installs runtime capabilities. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Intentional declaration-merging map owned by contributing libraries.
export interface IconCapabilityMap {}

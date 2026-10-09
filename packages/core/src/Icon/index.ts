// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Icon rendering, actual node registry reads, capability constructors and owner slot declarations
 * @output Released Icon APIs, canonical slots (including Core's Button-family role) and finite role/state authoring
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */
import type {IconName} from './globalIconRegistry';

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

/**
 * Canonical owner augmented by component libraries. `{slot: true}` stays source-only.
 *
 * Core declares one metadata-bearing role: `button-leading`, the Button family's
 * owned icon position (Button's `icon`, which IconButton and ToggleButton reuse).
 * It reports at most one of its finite states; there is no universal state list.
 */
export interface ComponentIconSlotMap {
  'button-leading': {slot: true; states: 'disabled' | 'pressed' | 'loading'};
}
export type ComponentIconSlotName = keyof ComponentIconSlotMap & string;
type FiniteStates<T> = T extends {
  slot: true;
  states: infer State extends string;
}
  ? string extends State
    ? never
    : State
  : never;
export type ComponentIconStateName<
  Slot extends ComponentIconSlotName = ComponentIconSlotName,
> = FiniteStates<ComponentIconSlotMap[Slot]>;
export type ParticipatingComponentIconSlotName = {
  [Slot in ComponentIconSlotName]: [
    FiniteStates<ComponentIconSlotMap[Slot]>,
  ] extends [never]
    ? never
    : Slot;
}[ComponentIconSlotName];
export type ComponentIconMap = [ComponentIconSlotName] extends [never]
  ? Record<string, never>
  : Partial<Record<ComponentIconSlotName, IconName | null>>;
export {getComponentIconName, getComponentIcon} from './globalIconRegistry';
export {useComponentIconName, useComponentIcon} from './useIcon';
export {
  declareComponentIconRole,
  getComponentIconState,
} from './componentIconRoles';
export type {ComponentIconRoleMetadata} from './componentIconRoles';

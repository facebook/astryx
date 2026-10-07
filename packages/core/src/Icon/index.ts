// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Icon component/types, icon registry, and global registration
 * @output Exports Icon, useIcon, useComponentIcon, icon registry helpers
 *   (registerIcons, getIconRegistry, getIcon, getExtendedIcon,
 *   getComponentIconName, getComponentIcon), and declares the augmentable
 *   ComponentIconSlotMap with ComponentIconSlotName and ComponentIconMap
 * @position Component entry point and the public @astryxdesign/core/Icon
 *   module; re-exported by /packages/core/src/index.ts
 *
 * The component icon slot types are declared here, not re-exported, because
 * module augmentation of `@astryxdesign/core/Icon` only widens an interface
 * declared in the module that subpath resolves to.
 *
 * SYNC: When modified, update this header and /packages/core/src/Icon/Icon.doc.mjs
 */

import type {IconName} from './globalIconRegistry';

/**
 * Component icon slots a theme can map through `defineTheme({componentIcons})`.
 *
 * A slot names a stable purpose inside one component, not artwork. Each key is
 * `<component-kebab>-<semantic-role>`; the value is always `true`. The
 * component that renders a slot owns its name and its fallback `IconName | null`.
 *
 * Core declares no slots. A package that renders its own slot declares it
 * by augmenting this module:
 * @example
 * ```
 * declare module '@astryxdesign/core/Icon' {
 *   interface ComponentIconSlotMap {
 *     'brand-card-status': true;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation target; Core declares no slots
export interface ComponentIconSlotMap {}

/** A declared component icon slot name. */
export type ComponentIconSlotName = keyof ComponentIconSlotMap & string;

/**
 * A theme's component icon slot map: each declared slot maps to a shared
 * {@link IconName}, or to `null` to render no icon. An absent slot uses the
 * component's fallback.
 *
 * While no slot is declared the map admits no keys, so a misspelled or
 * undeclared slot is a type error rather than a silently ignored entry.
 */
export type ComponentIconMap = [ComponentIconSlotName] extends [never]
  ? Record<string, never>
  : Partial<Record<ComponentIconSlotName, IconName | null>>;

export {Icon, renderIconSlot} from './Icon';
export {useIcon, useComponentIcon} from './useIcon';
export type {IconProps, IconColor, IconSize, IconType} from './Icon';

// Global registry (RSC-compatible, no 'use client')
export {
  registerIcons,
  getIconRegistry,
  getIcon,
  getExtendedIcon,
  getComponentIconName,
  getComponentIcon,
  resetIcons,
} from './globalIconRegistry';
export type {
  IconName,
  ExtendedIconName,
  NamespacedIconName,
  IconRegistry,
  IconRegistrySource,
} from './globalIconRegistry';

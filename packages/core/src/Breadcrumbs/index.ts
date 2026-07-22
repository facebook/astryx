// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Breadcrumbs component barrel export
 */

export {Breadcrumbs} from './Breadcrumbs';
export type {
  BreadcrumbsProps,
  BreadcrumbsVariant,
  BreadcrumbsVariantMap,
} from './Breadcrumbs';
export {BreadcrumbItem} from './BreadcrumbItem';
export type {BreadcrumbItemProps} from './BreadcrumbItem';

// The breadcrumb `menu` prop reuses the DropdownMenu item API, so the item
// components are re-exported under `Breadcrumb*` aliases for family coherence
// and discoverability (mirroring ContextMenu). A consumer's existing
// DropdownMenu item definitions are portable into a breadcrumb menu verbatim.
export {
  DropdownMenuItem as BreadcrumbMenuItem,
  type DropdownMenuItemProps as BreadcrumbMenuItemProps,
} from '../DropdownMenu/DropdownMenuItem';
export {
  DropdownMenuCheckboxItem as BreadcrumbMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps as BreadcrumbMenuCheckboxItemProps,
} from '../DropdownMenu/DropdownMenuCheckboxItem';
export {
  DropdownMenuRadioGroup as BreadcrumbMenuRadioGroup,
  type DropdownMenuRadioGroupProps as BreadcrumbMenuRadioGroupProps,
} from '../DropdownMenu/DropdownMenuRadioGroup';
export {
  DropdownMenuRadioItem as BreadcrumbMenuRadioItem,
  type DropdownMenuRadioItemProps as BreadcrumbMenuRadioItemProps,
} from '../DropdownMenu/DropdownMenuRadioItem';
export type {
  DropdownMenuOption as BreadcrumbMenuOption,
  DropdownMenuItemData as BreadcrumbMenuItemData,
  DropdownMenuDivider as BreadcrumbMenuDivider,
  DropdownMenuSection as BreadcrumbMenuSection,
} from '../DropdownMenu/DropdownMenu';

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Ephemeral Storybook module shape; data is generated from owners at load time.
 * @input Generated owner declarations
 * @output Typed review rows without a committed inventory data file
 * @position Storybook-only ambient module
 */
declare module 'virtual:astryx-icon-roles' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Ambient virtual modules need an inline type import without turning this file into a module augmentation.
  export const slots: import('./Inventory').InventorySlot[];
}

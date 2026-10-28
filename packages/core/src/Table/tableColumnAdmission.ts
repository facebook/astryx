// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file Private fixed-height column admission.
 * @input First-party columns whose structural renderer is owned and bounded.
 * @output Identity-based admission without a new caller assertion prop.
 * @position Shared Table protocol, with actual pitch validated after mount.
 */
import type {TableColumn} from './types';
const heightSafe = new WeakMap<object, boolean>();
export function registerFixedHeightColumn<T extends Record<string, unknown>>(
  column: TableColumn<T>,
  isCompatible = true,
): void {
  heightSafe.set(column, isCompatible);
}
export function isFixedHeightColumn<T extends Record<string, unknown>>(
  column: TableColumn<T>,
): boolean {
  return column.renderCell == null || heightSafe.get(column) === true;
}

// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input ScrollableArea implementation and shared hook types
 * @output Public ScrollableArea package surface
 * @position Package entry point for ScrollableArea
 */

export {ScrollableArea} from './ScrollableArea';
export type {ScrollableAreaProps} from './ScrollableArea';
export {useScrollableArea} from '../hooks/useScrollableArea';
export type {
  ScrollAxis,
  ScrollAxisState,
  ScrollOverscroll,
  ScrollKeyboardAccess,
  ScrollableAreaState,
  ScrollableElementProps,
  UseScrollableAreaOptions,
  UseScrollableAreaResult,
} from '../hooks/useScrollableArea';
export type {
  LogicalAxisMapping,
  PhysicalScrollAxis,
} from '../hooks/scrollGeometry';

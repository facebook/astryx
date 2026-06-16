// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Layer hooks and components
 * @output Exports all Layer module public API
 * @position Entry point for Layer module
 *
 * SYNC: When adding new Layer files, update exports here
 *
 * NOTE: Popover, HoverCard, and Tooltip have been moved to their own
 * top-level directories. They are re-exported here for backward compatibility.
 * New code should import from @xds/core/Popover, @xds/core/HoverCard,
 * or @xds/core/Tooltip directly.
 */

// Core layer hook (remains in Layer)
export {useXDSLayer} from './useXDSLayer';
export type {
  LayerAlignment,
  LayerPlacement,
  ContextRenderProps,
  FixedRenderProps,
  ContextLayerOptions,
  FixedLayerOptions,
  ContextLayerReturn,
  FixedLayerReturn,
} from './useXDSLayer';

// Layer provider
export {XDSLayerProvider} from './XDSLayerProvider';
export type {XDSLayerProviderProps} from './XDSLayerProvider';
export {XDSLayerContext, useXDSLayerContext} from './XDSLayerContext';
export type {XDSLayerContextValue, LayerToastConfig} from './XDSLayerContext';

// Shared entry animation styles for layer-based components
export {layerAnimations} from './layerAnimations.stylex';

// Re-export Popover from new location (backward compat)
export {useXDSPopover, XDSPopover} from '../Popover';
export type {
  UseXDSPopoverOptions,
  UseXDSPopoverReturn,
  XDSPopoverProps,
} from '../Popover';

// Re-export HoverCard from new location (backward compat)
export {useXDSHoverCard, XDSHoverCard} from '../HoverCard';
export type {
  HoverCardFocusTrigger,
  XDSHoverCardOptions,
  XDSHoverCardReturn,
  XDSHoverCardProps,
} from '../HoverCard';

// Re-export Tooltip from new location (backward compat)
export {useXDSTooltip, XDSTooltip} from '../Tooltip';
export type {
  TooltipFocusTrigger,
  XDSTooltipOptions,
  XDSTooltipReturn,
  XDSTooltipProps,
} from '../Tooltip';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSHoverCard as HoverCard,
  XDSLayerContext as LayerContext,
  XDSLayerProvider as LayerProvider,
  XDSPopover as Popover,
  XDSTooltip as Tooltip,
  useXDSHoverCard as useHoverCard,
  useXDSLayer as useLayer,
  useXDSLayerContext as useLayerContext,
  useXDSPopover as usePopover,
  useXDSTooltip as useTooltip,
} from '.';
export type {
  XDSHoverCardOptions as HoverCardOptions,
  XDSHoverCardProps as HoverCardProps,
  XDSHoverCardReturn as HoverCardReturn,
  XDSLayerContextValue as LayerContextValue,
  XDSLayerProviderProps as LayerProviderProps,
  XDSPopoverProps as PopoverProps,
  XDSTooltipOptions as TooltipOptions,
  XDSTooltipProps as TooltipProps,
  XDSTooltipReturn as TooltipReturn,
} from '.';
// <compat-aliases:end>

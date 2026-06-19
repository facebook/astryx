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
export {useLayer} from './useLayer';
export type {
  LayerAlignment,
  LayerPlacement,
  ContextRenderProps,
  FixedRenderProps,
  ContextLayerOptions,
  FixedLayerOptions,
  ContextLayerReturn,
  FixedLayerReturn,
} from './useLayer';

// Layer provider
export {LayerProvider} from './LayerProvider';
export type {LayerProviderProps} from './LayerProvider';
export {LayerContext, useLayerContext} from './LayerContext';
export type {LayerContextValue, LayerToastConfig} from './LayerContext';

// Shared entry animation styles for layer-based components
export {layerAnimations} from './layerAnimations.stylex';

// Re-export Popover from new location (backward compat)
export {usePopover, Popover} from '../Popover';
export type {
  UsePopoverOptions,
  UsePopoverReturn,
  PopoverProps,
} from '../Popover';

// Re-export HoverCard from new location (backward compat)
export {useHoverCard, HoverCard} from '../HoverCard';
export type {
  HoverCardFocusTrigger,
  HoverCardOptions,
  HoverCardReturn,
  HoverCardProps,
} from '../HoverCard';

// Re-export Tooltip from new location (backward compat)
export {useTooltip, Tooltip} from '../Tooltip';
export type {
  TooltipFocusTrigger,
  TooltipOptions,
  TooltipReturn,
  TooltipProps,
} from '../Tooltip';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  HoverCard as XDSHoverCard,
  LayerContext as XDSLayerContext,
  LayerProvider as XDSLayerProvider,
  Popover as XDSPopover,
  Tooltip as XDSTooltip,
  useHoverCard as useXDSHoverCard,
  useLayer as useXDSLayer,
  useLayerContext as useXDSLayerContext,
  usePopover as useXDSPopover,
  useTooltip as useXDSTooltip,
} from '.';
export type {
  ContextLayerOptions as XDSContextLayerOptions,
  ContextLayerReturn as XDSContextLayerReturn,
  ContextRenderProps as XDSContextRenderProps,
  FixedLayerOptions as XDSFixedLayerOptions,
  FixedLayerReturn as XDSFixedLayerReturn,
  FixedRenderProps as XDSFixedRenderProps,
  HoverCardFocusTrigger as XDSHoverCardFocusTrigger,
  HoverCardOptions as XDSHoverCardOptions,
  HoverCardProps as XDSHoverCardProps,
  HoverCardReturn as XDSHoverCardReturn,
  LayerAlignment as XDSLayerAlignment,
  LayerContextValue as XDSLayerContextValue,
  LayerPlacement as XDSLayerPlacement,
  LayerProviderProps as XDSLayerProviderProps,
  LayerToastConfig as XDSLayerToastConfig,
  PopoverProps as XDSPopoverProps,
  TooltipFocusTrigger as XDSTooltipFocusTrigger,
  TooltipOptions as XDSTooltipOptions,
  TooltipProps as XDSTooltipProps,
  TooltipReturn as XDSTooltipReturn,
  UsePopoverOptions as XDSUsePopoverOptions,
  UsePopoverReturn as XDSUsePopoverReturn,
} from '.';
// <compat-aliases:end>

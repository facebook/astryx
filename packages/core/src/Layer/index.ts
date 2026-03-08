/**
 * @file index.ts
 * @input Layer hooks and components
 * @output Exports all Layer module public API
 * @position Entry point for Layer module
 *
 * SYNC: When adding new Layer files, update exports here
 */

// Core layer hook
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

// Popover hook (combines layer + focus trap)
export {useXDSPopover} from './useXDSPopover';
export type {UseXDSPopoverOptions, UseXDSPopoverReturn} from './useXDSPopover';

// HoverCard hook and component
export {useXDSHoverCard} from './useXDSHoverCard';
export type {
  HoverCardFocusTrigger,
  XDSHoverCardOptions,
  XDSHoverCardReturn,
} from './useXDSHoverCard';

export {XDSHoverCard} from './XDSHoverCard';
export type {XDSHoverCardProps} from './XDSHoverCard';

// Tooltip hook and component
export {useXDSTooltip} from './useXDSTooltip';
export type {
  TooltipFocusTrigger,
  XDSTooltipOptions,
  XDSTooltipReturn,
} from './useXDSTooltip';

export {XDSTooltip} from './XDSTooltip';
export type {XDSTooltipProps} from './XDSTooltip';

// Popover component
export {XDSPopover} from './XDSPopover';
export type {XDSPopoverProps} from './XDSPopover';

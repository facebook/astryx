// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from component directories (Button/, Card/, Layout/, Layer/, Toast/)
 * @output Exports all public components, hooks, and types for @xds/core
 * @position Package entry point; consumed by external applications
 *
 * SYNC: When modified, update this header and /packages/core/src/README.md
 */

// Base types
export type {XDSBaseProps} from './XDSBaseProps';

// Components
export * from './AppShell';
export * from './AspectRatio';
export * from './Avatar';
export * from './AvatarGroup';
export * from './Badge';
export * from './Banner';
export * from './Blockquote';
export * from './Breadcrumbs';
export * from './Button';
export * from './ButtonGroup';
export * from './IconButton';
export * from './Card';
export * from './ClickableCard';
export * from './Carousel';
export * from './Calendar';
export * from './Center';
export * from './CodeBlock';
export * from './CommandPalette';
export * from './Chat';
export * from './Markdown';
export * from './Citation';
export * from './CheckboxInput';
export * from './CheckboxList';
export * from './Collapsible';
export * from './RadioList';
export * from './Resizable';
export * from './Divider';
export * from './EmptyState';
export * from './Lightbox';
export * from './Link';
export * from './List';
export * from './MetadataList';
export * from './NavIcon';
// NavItem (navItemStyles) is internal — shared styles consumed by SideNav/TopNav/MobileNav
export * from './NavMenu';
export * from './Slider';
export * from './Stack';
export * from './Switch';
export * from './DateInput';
export * from './DateTimeInput';
export * from './DateRangeInput';
export * from './Field';
export * from './FileInput';
export * from './FormLayout';
export * from './Grid';
export * from './Section';
export * from './SegmentedControl';
export * from './SelectableCard';
export * from './Selector';
export * from './MultiSelector';
export * from './Icon';
export * from './InputGroup';
export * from './Item';
export * from './Text';
export * from './TextInput';
export * from './TabList';
export * from './TextArea';
export * from './TimeInput';
export * from './NumberInput';
export * from './Table';
export * from './ToggleButton';
export * from './Token';
export * from './Typeahead';
export * from './Tokenizer';
export * from './Thumbnail';
export * from './PowerSearch';
export * from './TreeList';

// Keyboard shortcut display
export * from './Kbd';
export * from './AlertDialog';
export * from './Dialog';
export * from './ContextMenu';
export * from './DropdownMenu';
export * from './MoreMenu';
export * from './SizeContext';
export * from './Toolbar';
export * from './TopNav';
export * from './SideNav';
export * from './MobileNav';
export * from './Pagination';
export * from './ProgressBar';

// Layout utilities and components (includes XDSHStack, XDSVStack)
export * from './Layout';

// Layer utilities (useXDSLayer hook and core types)
export {useXDSLayer} from './Layer';
export type {
  LayerAlignment,
  LayerPlacement,
  ContextRenderProps,
  FixedRenderProps,
  ContextLayerOptions,
  FixedLayerOptions,
  ContextLayerReturn,
  FixedLayerReturn,
} from './Layer';

// Layer provider
export {XDSLayerProvider} from './Layer';
export type {XDSLayerProviderProps, LayerToastConfig} from './Layer';

// Toast
export {XDSToast, useXDSToast} from './Toast';
export type {
  XDSToastProps,
  XDSToastType,
  XDSToastPosition,
  XDSToastCollisionBehavior,
  XDSToastDismissReason,
  XDSToastOptions,
  XDSToastDismissFn,
  XDSShowToastFn,
} from './Toast';

// Popover component and hook
export * from './Popover';

// HoverCard component and hook
export * from './HoverCard';

// Tooltip component and hook
export * from './Tooltip';

// Skeleton loading placeholder
export * from './Skeleton';

// Status dot indicator
export * from './StatusDot';

// Spinner loading indicator
export * from './Spinner';

// Timestamp display
export * from './Timestamp';

// Overlay
export * from './Overlay';
export * from './Outline';

// Overflow list
export * from './OverflowList';

// Hooks
export * from './hooks';

// Utilities
export * from './utils';

// Theme
export * from './theme';

// Doc types — for external library authors writing .doc.mjs files
export type {
  ComponentDoc,
  SingleComponentDoc,
  MultiComponentDoc,
  PropDoc,
  ComponentEntry,
  ThemingTarget,
  ComponentVar,
  DerivedVar,
  TranslationDoc,
  GroupDoc,
  ReferenceDoc,
  ReferenceSection,
  ContentBlock,
  TokenPreviewType,
} from './docs-types';

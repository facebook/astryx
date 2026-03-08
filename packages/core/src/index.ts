/**
 * @file index.ts
 * @input Imports from component directories (Button/, Card/, Layout/, Layer/)
 * @output Exports all public components and types for @xds/core
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
export * from './Badge';
export * from './Banner';
export * from './Breadcrumbs';
export * from './Button';
export * from './Card';
export * from './Calendar';
export * from './Center';
export * from './CheckboxInput';
export * from './RadioList';
export * from './Divider';
export * from './EmptyState';
export * from './Link';
export * from './List';
export * from './NavIcon';
export * from './Slider';
export * from './Stack';
export * from './Switch';
export * from './DateInput';
export * from './Field';
export * from './FormLayout';
export * from './Grid';
export * from './Section';
export * from './Selector';
export * from './Icon';
export * from './Text';
export * from './TextInput';
export * from './TabList';
export * from './TextArea';
export * from './TimeInput';
export * from './NumberInput';
export * from './Table';
export * from './Token';
export * from './Typeahead';
export * from './Tokenizer';

// Keyboard shortcut display
export * from './Kbd';
export * from './Dialog';
export * from './DropdownMenu';
export * from './MoreMenu';
export * from './TopNav';
export * from './SideNav';
export * from './MobileNav';
export * from './Pagination';
export * from './ProgressBar';

// Layout utilities and components (includes XDSHStack, XDSVStack)
export * from './Layout';

// Layer utilities and components (includes XDSHoverCard)
export * from './Layer';

// Skeleton loading placeholder
export * from './Skeleton';

// Status dot indicator
export * from './StatusDot';

// Spinner loading indicator
export * from './Spinner';

// Hooks
export * from './hooks';

// Utilities
export * from './utils';

// Theme
export * from './theme';

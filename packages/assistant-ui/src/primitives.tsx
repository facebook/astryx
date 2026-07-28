// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file primitives.tsx
 * @input Uses Astryx Badge, Selector, TabList, Collapsible, Text, and tokens
 * @output Exports ready-compatible presentation adapters and data displays
 * @position Presentation layer for assistant-ui ready components
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Badge} from '@astryxdesign/core/Badge';
import {
  Collapsible,
  CollapsibleGroup,
  type CollapsibleGroupProps,
  type CollapsibleProps,
} from '@astryxdesign/core/Collapsible';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector, type SelectorSize} from '@astryxdesign/core/Selector';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Text} from '@astryxdesign/core/Text';
import {HStack} from '@astryxdesign/core/HStack';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

export {Badge};

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: SelectorSize;
  isDisabled?: boolean;
  hasSearch?: boolean;
  htmlName?: string;
  width?: number | string;
}

/**
 * assistant-ui-ready select facade backed by Astryx Selector.
 */
export function Select({
  label = 'Select an option',
  options,
  value,
  onValueChange,
  ...rest
}: SelectProps) {
  return (
    <Selector
      {...rest}
      isLabelHidden
      label={label}
      options={options}
      value={value}
      onChange={onValueChange}
    />
  );
}

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const context = useMemo<TabsContextValue>(
    () => ({
      value,
      onChange(nextValue) {
        if (controlledValue === undefined) {
          setInternalValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
    }),
    [controlledValue, onValueChange, value],
  );

  return <TabsContext value={context}>{children}</TabsContext>;
}

export interface TabsListProps {
  children: ReactNode;
  hasDivider?: boolean;
  layout?: 'hug' | 'fill';
}

export function TabsList({
  children,
  hasDivider = true,
  layout = 'hug',
}: TabsListProps) {
  const context = useContext(TabsContext);
  if (context == null) {
    throw new Error('TabsList must be used inside Tabs.');
  }
  return (
    <TabList
      hasDivider={hasDivider}
      layout={layout}
      value={context.value}
      onChange={context.onChange}>
      {children}
    </TabList>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: string;
}

export function TabsTrigger({value, children}: TabsTriggerProps) {
  return <Tab value={value} label={children} />;
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
}

export function TabsContent({value, children}: TabsContentProps) {
  const context = useContext(TabsContext);
  if (context == null) {
    throw new Error('TabsContent must be used inside Tabs.');
  }
  if (context.value !== value) {
    return null;
  }
  return <div role="tabpanel">{children}</div>;
}

export interface AccordionProps extends Omit<
  CollapsibleGroupProps,
  'onChange'
> {
  onValueChange?: CollapsibleGroupProps['onChange'];
}

export function Accordion({onValueChange, ...props}: AccordionProps) {
  return <CollapsibleGroup {...props} onChange={onValueChange} />;
}

export interface AccordionItemProps extends CollapsibleProps {
  title: ReactNode;
}

export function AccordionItem({title, ...props}: AccordionItemProps) {
  return <Collapsible {...props} trigger={title} />;
}

const dataStyles = stylex.create({
  dotMatrix: (columns: number) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 8px)`,
    gap: spacingVars['--spacing-1'],
  }),
  dot: {
    width: 8,
    height: 8,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-muted'],
  },
  dotActive: {
    backgroundColor: colorVars['--color-accent'],
  },
  number: {
    fontFamily: typographyVars['--font-family-code'],
    fontVariantNumeric: 'tabular-nums',
  },
  heatGraph: (columns: number) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(8px, 1fr))`,
    gap: spacingVars['--spacing-0-5'],
  }),
  heatCell: {
    minWidth: 8,
    aspectRatio: '1',
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-background-muted'],
  },
  heatLow: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
  heatMedium: {
    backgroundColor: colorVars['--color-background-blue'],
  },
  heatHigh: {
    backgroundColor: colorVars['--color-accent'],
  },
});

export interface DotMatrixProps {
  value: number;
  max?: number;
  columns?: number;
  label?: string;
}

export function DotMatrix({
  value,
  max = 20,
  columns = 10,
  label = `${value} of ${max}`,
}: DotMatrixProps) {
  const normalizedValue = Math.max(0, Math.min(value, max));
  return (
    <span
      aria-label={label}
      role="img"
      {...stylex.props(dataStyles.dotMatrix(columns))}>
      {Array.from({length: max}, (_, index) => (
        <span
          aria-hidden="true"
          key={index}
          {...stylex.props(
            dataStyles.dot,
            index < normalizedValue && dataStyles.dotActive,
          )}
        />
      ))}
    </span>
  );
}

export interface NumberRollProps {
  value: number | string;
  label?: string;
}

export function NumberRoll({value, label}: NumberRollProps) {
  return (
    <Text
      aria-label={label}
      aria-live="polite"
      type="body"
      xstyle={dataStyles.number}>
      {value}
    </Text>
  );
}

export interface HeatGraphDatum {
  value: number;
  label?: string;
}

export interface HeatGraphProps {
  data: HeatGraphDatum[];
  columns?: number;
  max?: number;
  label?: string;
}

export function HeatGraph({
  data,
  columns = 7,
  max = Math.max(1, ...data.map(item => item.value)),
  label = 'Activity heat graph',
}: HeatGraphProps) {
  return (
    <span
      aria-label={label}
      role="img"
      {...stylex.props(dataStyles.heatGraph(columns))}>
      {data.map((item, index) => {
        const ratio = Math.max(0, Math.min(1, item.value / max));
        const intensity =
          ratio >= 0.67
            ? dataStyles.heatHigh
            : ratio >= 0.34
              ? dataStyles.heatMedium
              : ratio > 0
                ? dataStyles.heatLow
                : null;
        return (
          <span
            aria-hidden="true"
            key={`${item.label ?? 'cell'}-${index}`}
            title={item.label}
            {...stylex.props(dataStyles.heatCell, intensity)}
          />
        );
      })}
    </span>
  );
}

export type ProviderName =
  'anthropic' | 'google' | 'meta' | 'microsoft' | 'openai' | 'other';

export interface ProviderLogoProps {
  provider: ProviderName;
  label?: string;
}

/**
 * Token-aware provider mark. Brand artwork can be supplied by the consumer;
 * the default deliberately avoids embedding third-party logo assets.
 */
export function ProviderLogo({provider, label}: ProviderLogoProps) {
  const accessibleLabel = label ?? `${provider} provider`;
  return (
    <HStack aria-label={accessibleLabel} align="center" gap={1} role="img">
      <Icon icon="info" size="sm" />
      <Text type="supporting">{provider}</Text>
    </HStack>
  );
}

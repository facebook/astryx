// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createElement, useState} from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSDivider} from '@xds/core';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSIcon} from '@xds/core/Icon';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIconButton} from '@xds/core/IconButton';
import {MinusIcon, PlusIcon} from '@heroicons/react/24/outline';
import {useMediaQuery} from '@xds/core/hooks';
import type {PropControlDescriptor} from './parsePropType';
import type {KnobProp} from './InteractivePreview';
import {resolveElementDescriptor} from './resolveElements';
import type {PropDoc} from '../../generated/componentRegistry';

function formatType(type: string, defaultValue?: string): React.ReactNode {
  const parts = type.split(/\s*\|\s*/);
  const isEnum = parts.length > 1 && parts.every(p => /^['"]/.test(p.trim()));
  if (isEnum) {
    return (
      <>
        {parts.map((part, i) => {
          const trimmed = part.trim();
          const isDefault = defaultValue != null && trimmed === defaultValue;
          return (
            <span key={i}>
              {'| '}
              {isDefault ? <b>{trimmed}</b> : trimmed}
              {isDefault && ' (default)'}
              {i < parts.length - 1 && <br />}
            </span>
          );
        })}
      </>
    );
  }
  if (defaultValue != null) {
    return (
      <>
        {type} <span style={{opacity: 0.6}}>(default: {defaultValue})</span>
      </>
    );
  }
  return type;
}

function resolveSlotElement(
  componentName: string,
  slotElements?: Array<{
    __element: string;
    props?: Record<string, unknown>;
    children?: unknown;
  }>,
): React.ReactNode {
  if (slotElements) {
    const match = slotElements.find(el => el.__element === componentName);
    if (match) {
      return resolveElementDescriptor(
        match as import('../../generated/componentRegistry').ElementDescriptor,
      );
    }
  }
  // Fallback for common components without slotElements declared
  switch (componentName) {
    case 'XDSIcon':
      return createElement(XDSIcon, {icon: 'check', size: 'sm'});
    case 'XDSBadge':
      return createElement(XDSBadge, {label: 'Badge'});
    default:
      return null;
  }
}

function ElementControl({
  control,
  value,
  onChange,
  prop,
}: {
  control: Extract<PropControlDescriptor, {kind: 'element'}>;
  value: unknown;
  onChange: (next: unknown) => void;
  prop: PropDoc;
}) {
  const [selected, setSelected] = useState<string>('None');

  if (control.options.length === 1) {
    const opt = control.options[0];
    return (
      <XDSSwitch
        label={opt.label}
        value={value != null}
        onChange={on =>
          onChange(
            on
              ? resolveSlotElement(opt.componentName, prop.slotElements)
              : undefined,
          )
        }
      />
    );
  }

  return (
    <XDSSelector
      label=""
      placeholder="None"
      value={value != null ? selected : 'None'}
      options={['None', ...control.options.map(o => o.label)]}
      onChange={next => {
        setSelected(next);
        if (next === 'None' || next === '') {
          onChange(undefined);
        } else {
          const opt = control.options.find(o => o.label === next);
          if (opt)
            onChange(resolveSlotElement(opt.componentName, prop.slotElements));
        }
      }}
    />
  );
}

function SlotListControl({
  control,
  value,
  onChange,
  prop,
}: {
  control: Extract<PropControlDescriptor, {kind: 'slot-list'}>;
  value: unknown;
  onChange: (next: unknown) => void;
  prop: PropDoc;
}) {
  const items = Array.isArray(value) ? value : [];
  const count = items.length;

  const addItem = () => {
    const slotEl = prop.slotElements?.[0];
    if (!slotEl) return;
    const n = count + 1;
    const tweaked = {...slotEl};
    const props = {...(tweaked.props ?? {})};
    if (typeof props.label === 'string') props.label = `${props.label} ${n}`;
    if (typeof props.value === 'string') props.value = `${props.value}-${n}`;
    tweaked.props = props;
    const children =
      typeof tweaked.children === 'string'
        ? `${tweaked.children} ${n}`
        : tweaked.children;
    const newEl = resolveElementDescriptor({
      ...tweaked,
      children,
    } as import('../../generated/componentRegistry').ElementDescriptor);
    onChange([...items, newEl]);
  };

  const removeItem = () => {
    if (count > 0) onChange(items.slice(0, -1));
  };

  return (
    <XDSHStack gap={2} vAlign="center">
      <XDSText type="supporting" color="secondary">
        {count} {control.options[0].label}
        {count !== 1 ? 's' : ''}
      </XDSText>
      <XDSHStack gap={1}>
        <XDSIconButton
          label="Remove item"
          icon={<MinusIcon width={16} height={16} />}
          variant="ghost"
          size="sm"
          isDisabled={count === 0}
          onClick={removeItem}
        />
        <XDSIconButton
          label="Add item"
          icon={<PlusIcon width={16} height={16} />}
          variant="ghost"
          size="sm"
          onClick={addItem}
        />
      </XDSHStack>
    </XDSHStack>
  );
}

function InlineControl({
  control,
  value,
  onChange,
  prop,
}: {
  control: PropControlDescriptor;
  value: unknown;
  onChange: (next: unknown) => void;
  prop: PropDoc;
}) {
  switch (control.kind) {
    case 'boolean':
      return (
        <XDSSwitch
          label=""
          value={value === true}
          onChange={next => onChange(next)}
        />
      );
    case 'enum': {
      const isNumeric = control.options.every(o => /^-?\d+(\.\d+)?$/.test(o));
      return (
        <XDSSelector
          label=""
          value={String(value ?? control.options[0])}
          options={control.options}
          onChange={next => onChange(isNumeric ? Number(next) : next)}
        />
      );
    }
    case 'string':
      return (
        <XDSTextInput
          label=""
          placeholder="value"
          value={typeof value === 'string' ? value : ''}
          onChange={next => onChange(next)}
        />
      );
    case 'number':
      return (
        <XDSNumberInput
          label=""
          value={typeof value === 'number' ? value : 0}
          onChange={next => onChange(next)}
        />
      );
    case 'element':
      return (
        <ElementControl
          control={control}
          value={value}
          onChange={onChange}
          prop={prop}
        />
      );
    case 'slot-list':
      return (
        <SlotListControl
          control={control}
          value={value}
          onChange={onChange}
          prop={prop}
        />
      );
    default:
      return null;
  }
}

function PropRow({
  prop,
  knob,
  value,
  onChange,
  isMobile,
}: {
  prop: PropDoc;
  knob?: KnobProp;
  value?: unknown;
  onChange?: (next: unknown) => void;
  isMobile: boolean;
}) {
  if (isMobile) {
    return (
      <XDSVStack gap={2} style={{paddingBlock: 8}}>
        <XDSText type="body" weight="bold">
          {prop.name}
        </XDSText>
        <XDSText type="code" display="block">
          {formatType(prop.type, prop.default)}
        </XDSText>
        {prop.description != null && prop.description !== '' && (
          <XDSText type="body" color="secondary">
            {prop.description}
          </XDSText>
        )}
        {knob && onChange && (
          <InlineControl
            control={knob.control}
            value={value}
            onChange={onChange}
            prop={prop}
          />
        )}
      </XDSVStack>
    );
  }

  return (
    <XDSHStack gap={3} style={{paddingBlock: 6}}>
      <div style={{flexBasis: 200, flexShrink: 0}}>
        <XDSText type="body" weight="bold">
          {prop.name}
        </XDSText>
      </div>
      <div style={{flex: 1}}>
        <XDSText type="code" display="block">
          {formatType(prop.type, prop.default)}
        </XDSText>
        {prop.description != null && prop.description !== '' && (
          <XDSText type="body" color="secondary" style={{marginTop: 6}}>
            {prop.description}
          </XDSText>
        )}
      </div>
      {knob && onChange && (
        <div style={{flexBasis: 200, flexShrink: 0}}>
          <InlineControl
            control={knob.control}
            value={value}
            onChange={onChange}
            prop={prop}
          />
        </div>
      )}
    </XDSHStack>
  );
}

interface PlaygroundPropsTableProps {
  props: PropDoc[];
  knobs: KnobProp[];
  state: Record<string, unknown>;
  onPropChange: (name: string, value: unknown) => void;
}

export function PlaygroundPropsTable({
  props,
  knobs,
  state,
  onPropChange,
}: PlaygroundPropsTableProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const required = props.filter(p => p.required);
  const optional = props.filter(p => !p.required);

  const knobMap = new Map(knobs.map(k => [k.row.name, k]));

  return (
    <>
      {required.length > 0 && (
        <>
          <XDSHeading level={4} color="secondary">
            Required
          </XDSHeading>
          {required
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map(prop => (
              <div key={prop.name}>
                <XDSDivider />
                <PropRow
                  prop={prop}
                  knob={knobMap.get(prop.name)}
                  value={state[prop.name]}
                  onChange={next => onPropChange(prop.name, next)}
                  isMobile={isMobile}
                />
              </div>
            ))}
        </>
      )}
      {optional.length > 0 && (
        <>
          <XDSHeading level={4} color="secondary" style={{marginTop: 8}}>
            Optional
          </XDSHeading>
          {optional
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map(prop => (
              <div key={prop.name}>
                <XDSDivider />
                <PropRow
                  prop={prop}
                  knob={knobMap.get(prop.name)}
                  value={state[prop.name]}
                  onChange={next => onPropChange(prop.name, next)}
                  isMobile={isMobile}
                />
              </div>
            ))}
        </>
      )}
    </>
  );
}

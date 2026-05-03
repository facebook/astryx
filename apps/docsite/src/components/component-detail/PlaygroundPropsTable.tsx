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
import {useMediaQuery} from '@xds/core/hooks';
import type {PropControlDescriptor} from './parsePropType';
import type {KnobProp} from './InteractivePreview';
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

function createDefaultElement(componentName: string): React.ReactNode {
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
}: {
  control: Extract<PropControlDescriptor, {kind: 'element'}>;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [selected, setSelected] = useState<string>('None');

  if (control.options.length === 1) {
    const opt = control.options[0];
    return (
      <XDSSwitch
        label={opt.label}
        value={value != null}
        onChange={on =>
          onChange(on ? createDefaultElement(opt.componentName) : undefined)
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
          if (opt) onChange(createDefaultElement(opt.componentName));
        }
      }}
    />
  );
}

function InlineControl({
  control,
  value,
  onChange,
}: {
  control: PropControlDescriptor;
  value: unknown;
  onChange: (next: unknown) => void;
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
        <ElementControl control={control} value={value} onChange={onChange} />
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

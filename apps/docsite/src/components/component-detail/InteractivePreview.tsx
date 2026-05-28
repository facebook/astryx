// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  createElement,
  useMemo,
  useState,
  useCallback,
  isValidElement,
  Component,
  type ReactNode,
} from 'react';
import {getXDSComponent, resolveValue} from './resolveElements';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
import {useThemeMode} from '../../app/providers';
import {CodeBracketIcon} from '@heroicons/react/24/outline';
import {
  coerceDefault,
  parsePropType,
  type PropControlDescriptor,
} from './parsePropType';
import type {
  PropDoc,
  PlaygroundConfig,
} from '../../generated/componentRegistry';

export interface KnobProp {
  row: PropDoc;
  control: PropControlDescriptor;
}

class PreviewErrorBoundary extends Component<
  {children: ReactNode; resetKeys: unknown[]},
  {error: Error | null}
> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) {
    return {error};
  }
  componentDidUpdate(prevProps: {resetKeys: unknown[]}) {
    if (
      this.state.error &&
      prevProps.resetKeys.some((k, i) => !Object.is(k, this.props.resetKeys[i]))
    ) {
      this.setState({error: null});
    }
  }
  render() {
    if (this.state.error) {
      return (
        <XDSText type="supporting" color="secondary">
          Render error: {this.state.error.message}
        </XDSText>
      );
    }
    return this.props.children;
  }
}

function pickPrimaryProps(name: string, props: PropDoc[]): KnobProp[] {
  if (props.length === 0) {
    return [];
  }
  return props.map(row => ({
    row,
    control: parsePropType(row.type, row.name, row.slotElements),
  }));
}

function buildInitialState(
  knobs: KnobProp[],
  playground?: PlaygroundConfig | null,
): Record<string, unknown> {
  const state: Record<string, unknown> = {};

  // Apply playground defaults first (resolved from ElementDescriptor if needed)
  if (playground?.defaults) {
    for (const [key, value] of Object.entries(playground.defaults)) {
      state[key] = resolveValue(value);
    }
  }

  // Fill in remaining props from doc defaults / auto-generation
  for (const {row, control} of knobs) {
    if (state[row.name] !== undefined) {
      continue;
    }
    const def = coerceDefault(row.default, control);
    if (def !== undefined) {
      state[row.name] = def;
    } else if (control.kind === 'slot-list') {
      // Always generate initial items for slot-lists (empty list isn't useful)
      const slotEl = row.slotElements?.[0];
      if (slotEl) {
        state[row.name] = [1, 2, 3].map(n => {
          const tweaked = {...slotEl};
          const props = {...(tweaked.props ?? {})};
          if (typeof props.label === 'string') {
            props.label = `${props.label} ${n}`;
          }
          if (typeof props.value === 'string') {
            props.value = `${props.value}-${n}`;
          }
          tweaked.props = props;
          if (typeof tweaked.children === 'string') {
            tweaked.children = `${tweaked.children} ${n}`;
          }
          return resolveValue(tweaked);
        });
      }
    } else if (row.required) {
      switch (control.kind) {
        case 'enum':
          state[row.name] = control.options[0];
          break;
        case 'boolean':
          state[row.name] = false;
          break;
        case 'string':
          state[row.name] = row.name;
          break;
        case 'number':
          state[row.name] = 0;
          break;
      }
    }
  }
  return state;
}

function formatValue(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  if (isValidElement(value)) {
    const el = value as React.ReactElement<Record<string, unknown>>;
    const type =
      typeof el.type === 'string'
        ? el.type
        : ((el.type as {displayName?: string}).displayName ??
          el.type.name ??
          'Component');
    const props = el.props;
    if (!props || Object.keys(props).length === 0) {
      return `<${type} />`;
    }
    const propStr = Object.entries(props)
      .filter(([k]) => k !== 'children')
      .map(([k, v]) => {
        if (typeof v === 'string') {
          return `${k}="${v}"`;
        }
        return `${k}={${JSON.stringify(v)}}`;
      })
      .join(' ');
    return `<${type} ${propStr} />`;
  }
  return JSON.stringify(value);
}

function generateCode(name: string, state: Record<string, unknown>): string {
  const componentName = `XDS${name}`;
  // Filter out docs-only props that shouldn't appear in user code
  const entries = Object.entries(state).filter(
    ([k, v]) => v !== undefined && k !== 'isInline',
  );

  if (entries.length === 0) {
    return `<${componentName} />`;
  }

  const propLines = entries.map(([key, value]) => {
    if (typeof value === 'boolean' && value === true) {
      return `  ${key}`;
    }
    if (typeof value === 'string') {
      return `  ${key}="${value}"`;
    }
    return `  ${key}={${formatValue(value)}}`;
  });

  return `<${componentName}\n${propLines.join('\n')}\n/>`;
}

export function useInteractiveState(
  name: string,
  props: PropDoc[],
  playground?: PlaygroundConfig | null,
) {
  const knobs = useMemo(() => pickPrimaryProps(name, props), [name, props]);
  const initialState = useMemo(
    () => buildInitialState(knobs, playground),
    [knobs, playground],
  );
  const [state, setState] = useState<Record<string, unknown>>(initialState);

  const setProp = useCallback(
    (propName: string, value: unknown) =>
      setState(prev => ({...prev, [propName]: value})),
    [],
  );

  const reset = useCallback(() => setState(initialState), [initialState]);

  const isDirty = useMemo(
    () => Object.keys(state).some(k => !Object.is(state[k], initialState[k])),
    [state, initialState],
  );

  return {knobs, state, setProp, reset, isDirty};
}

export function InteractivePreviewStage({
  name,
  state,
}: {
  name: string;
  state: Record<string, unknown>;
}) {
  const {mode} = useThemeMode();
  const [showCode, setShowCode] = useState(false);
  const Component = getXDSComponent(name);

  if (!Component) {
    return (
      <XDSCard variant="muted" padding={0}>
        <XDSCenter style={{minHeight: 200, width: '100%'}}>
          <XDSVStack
            gap={1}
            style={{
              paddingBlock: 24,
              paddingInline: 16,
              textAlign: 'center',
            }}>
            <XDSText type="supporting" color="secondary">
              Interactive preview not available for {name}.
            </XDSText>
            <XDSText type="supporting" color="secondary">
              This component is not part of @xds/core.
            </XDSText>
          </XDSVStack>
        </XDSCenter>
      </XDSCard>
    );
  }

  const code = generateCode(name, state);

  return (
    <XDSCard
      variant="muted"
      padding={0}
      style={{width: '100%', position: 'relative'}}>
      <div
        style={{
          position: 'absolute',
          top: 'var(--spacing-2)',
          right: 'var(--spacing-2)',
          zIndex: 2,
        }}>
        <XDSButton
          label="Show code"
          tooltip="Show code"
          icon={<CodeBracketIcon width={16} height={16} />}
          isIconOnly
          variant={showCode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowCode(v => !v)}
        />
      </div>
      {showCode ? (
        <div
          style={{
            minHeight: 200,
            overflow: 'auto',
            padding: 'var(--spacing-4)',
          }}>
          <XDSCodeBlock code={code} language="tsx" hasCopyButton />
        </div>
      ) : (
        <XDSTheme theme={neutralTheme} mode={mode}>
          <XDSCenter
            style={{
              minHeight: 200,
              width: '100%',
              padding: 'var(--spacing-4)',
            }}>
            <PreviewErrorBoundary resetKeys={[Component, state]}>
              {createElement(Component, state)}
            </PreviewErrorBoundary>
          </XDSCenter>
        </XDSTheme>
      )}
    </XDSCard>
  );
}
